import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, ReferralRecord } from '../types';
import { saveUser } from './storage';

const PENDING_REF_KEY = 'devwebia_pending_ref_code';

/**
 * Detects referral codes from URL parameters (e.g., ?ref=DEVWEB-1234 or ?parrain=DEVWEB-1234)
 */
export function detectPendingReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('ref') || urlParams.get('parrain') || urlParams.get('r');

    if (!code && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      code = hashParams.get('ref') || hashParams.get('parrain') || hashParams.get('r');
    }

    // Check path /ref/DEVWEB-1234
    if (!code && window.location.pathname.startsWith('/ref/')) {
      code = window.location.pathname.split('/ref/')[1];
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      localStorage.setItem(PENDING_REF_KEY, cleanCode);
      return cleanCode;
    }
  } catch (e) {
    console.error('Error detecting referral code:', e);
  }

  return getPendingReferralCode();
}

/**
 * Retrieves pending referral code saved in localStorage
 */
export function getPendingReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PENDING_REF_KEY) || null;
}

/**
 * Clears pending referral code after redemption
 */
export function clearPendingReferralCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_REF_KEY);
}

/**
 * Fetches real list of referred friends for a given referral code from Firestore and users collection
 */
export async function fetchReferredUsers(referralCode: string, expectedCount?: number): Promise<ReferralRecord[]> {
  if (!referralCode) return [];

  const recordsMap = new Map<string, ReferralRecord>();
  const cleanCode = referralCode.toUpperCase();

  try {
    // 1. Query 'referrals' collection
    const qRef = query(collection(db, 'referrals'), where('referrerCode', '==', cleanCode));
    const snapshot = await getDocs(qRef);
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ReferralRecord;
      recordsMap.set(data.referredUserId || data.id, data);
    });

    // 2. Query 'users' collection where referredBy == cleanCode
    const qUser = query(collection(db, 'users'), where('referredBy', '==', cleanCode));
    const userSnapshot = await getDocs(qUser);
    userSnapshot.forEach((userDoc) => {
      const uData = userDoc.data() as UserProfile;
      if (!recordsMap.has(uData.id)) {
        recordsMap.set(uData.id, {
          id: 'ref_gen_' + uData.id,
          referrerId: '',
          referrerEmail: '',
          referrerCode: cleanCode,
          referredUserId: uData.id,
          referredUserEmail: uData.email || 'filleul@devwebia.mg',
          bonusCredits: 5,
          createdAt: uData.createdAt || new Date().toISOString(),
        });
      }
    });

    // 3. LocalStorage fallback / cache
    try {
      const stored = localStorage.getItem('devwebia_referral_history_' + cleanCode);
      if (stored) {
        const parsed: ReferralRecord[] = JSON.parse(stored);
        parsed.forEach((item) => {
          if (!recordsMap.has(item.referredUserId || item.id)) {
            recordsMap.set(item.referredUserId || item.id, item);
          }
        });
      }
    } catch (e) {}

  } catch (e) {
    console.warn('Firestore referrals fetch error:', e);
  }

  const records = Array.from(recordsMap.values());

  // Sort newest first
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return records;
}

/**
 * Calculates total referral credits earned by a referral code in the current month (YYYY-MM)
 */
export async function getMonthlyReferralCreditsEarned(referralCode: string): Promise<number> {
  if (!referralCode) return 0;
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  try {
    const records = await fetchReferredUsers(referralCode);
    return records
      .filter((r) => r.createdAt && r.createdAt.startsWith(currentMonthStr))
      .reduce((sum, r) => sum + (r.bonusCredits || 0), 0);
  } catch (e) {
    return 0;
  }
}

export interface ApplyReferralResult {
  success: boolean;
  message: string;
  bonusCredits?: number;
  updatedUser?: UserProfile;
}

/**
 * Validates and applies a referral code to the current user in real-time in Firestore and localStorage
 */
export async function applyReferralCode(
  currentUser: UserProfile,
  inputCode: string
): Promise<ApplyReferralResult> {
  const code = inputCode.trim().toUpperCase();

  if (!code) {
    return { success: false, message: 'Nampidirina ny code parrain valider-na.' };
  }

  if (currentUser.referralCode && currentUser.referralCode.toUpperCase() === code) {
    return { success: false, message: 'Tsy afaka mampiasa ny code parrain anao manokana ianao.' };
  }

  if (currentUser.referredBy) {
    return {
      success: false,
      message: `Efa nampiasa code parrain ianao teo aloha (${currentUser.referredBy}). Code 1 ihany no ekena.`,
    };
  }

  try {
    // 1. Look up referrer in Firestore users collection
    let referrerUser: UserProfile | null = null;

    try {
      const q = query(collection(db, 'users'), where('referralCode', '==', code));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        referrerUser = querySnapshot.docs[0].data() as UserProfile;
      }
    } catch (dbErr) {
      console.warn('Firestore user search by referralCode failed:', dbErr);
    }

    // 2. If not found by exact query, check all users in Firestore for case-insensitive match
    if (!referrerUser) {
      try {
        const allUsersSnap = await getDocs(collection(db, 'users'));
        allUsersSnap.forEach((uDoc) => {
          const uData = uDoc.data() as UserProfile;
          if (uData.referralCode && uData.referralCode.toUpperCase() === code) {
            referrerUser = uData;
          }
        });
      } catch (e) {
        console.warn('Firestore fallback user scan failed:', e);
      }
    }

    if (!referrerUser) {
      return {
        success: false,
        message: `Tsy hita tao amin'ny base de données ny code parrain "${code}". Hamarino tsara ny litera.`,
      };
    }

    // 3. Process referral bonus for both referrer and new user
    const defaultBonus = 5;
    const maxFreeCreditsMonthly = 30;
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    // Calculate bonus for current user (Free plan cap: 30 credits max per month)
    let userBonus = defaultBonus;
    if (currentUser.plan === 'free') {
      let currentUserMonthlyRefCredits = 0;
      if (currentUser.referralCode) {
        const currentUserRecords = await fetchReferredUsers(currentUser.referralCode);
        currentUserMonthlyRefCredits = currentUserRecords
          .filter((r) => r.createdAt && r.createdAt.startsWith(currentMonthStr))
          .reduce((sum, r) => sum + (r.bonusCredits || 0), 0);
      }

      const availableByMonthlyRef = Math.max(0, maxFreeCreditsMonthly - currentUserMonthlyRefCredits);
      const availableByTotalCredits = Math.max(0, maxFreeCreditsMonthly - (currentUser.credits || 0));
      userBonus = Math.min(defaultBonus, availableByMonthlyRef, availableByTotalCredits);
      if (userBonus < 0) userBonus = 0;
    }

    // Calculate bonus for referrer user (Free plan cap: 30 credits max per month)
    let referrerBonus = defaultBonus;
    if (referrerUser.plan === 'free') {
      let referrerMonthlyRefCredits = 0;
      if (referrerUser.referralCode) {
        const refRecords = await fetchReferredUsers(referrerUser.referralCode);
        referrerMonthlyRefCredits = refRecords
          .filter((r) => r.createdAt && r.createdAt.startsWith(currentMonthStr))
          .reduce((sum, r) => sum + (r.bonusCredits || 0), 0);
      }

      const refAvailableByMonthlyRef = Math.max(0, maxFreeCreditsMonthly - referrerMonthlyRefCredits);
      const refAvailableByTotalCredits = Math.max(0, maxFreeCreditsMonthly - (referrerUser.credits || 0));
      referrerBonus = Math.min(defaultBonus, refAvailableByMonthlyRef, refAvailableByTotalCredits);
      if (referrerBonus < 0) referrerBonus = 0;
    }

    const newCurrentUserCredits = (currentUser.credits || 0) + userBonus;

    const updatedCurrentUser: UserProfile = {
      ...currentUser,
      credits: newCurrentUserCredits,
      referredBy: code,
    };

    // Save current user in Firestore & local
    saveUser(updatedCurrentUser);

    try {
      // Update Current User in Firestore
      const userRef = doc(db, 'users', currentUser.id);
      await setDoc(userRef, updatedCurrentUser, { merge: true });

      // Update Referrer User in Firestore (+referrerBonus credits, +1 referralsCount)
      const newReferrerCredits = (referrerUser.credits || 0) + referrerBonus;
      const newReferrerCount = (referrerUser.referralsCount || 0) + 1;

      const referrerRef = doc(db, 'users', referrerUser.id);
      await setDoc(
        referrerRef,
        {
          credits: newReferrerCredits,
          referralsCount: newReferrerCount,
        },
        { merge: true }
      );

      // Create Referral Record document
      const refRecordId = 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const refRecord: ReferralRecord = {
        id: refRecordId,
        referrerId: referrerUser.id,
        referrerEmail: referrerUser.email,
        referrerCode: code,
        referredUserId: currentUser.id,
        referredUserEmail: currentUser.email,
        bonusCredits: referrerBonus,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'referrals', refRecordId), refRecord);

      // Also store locally for instant rendering
      const localHistoryKey = 'devwebia_referral_history_' + code;
      const existingHistory: ReferralRecord[] = JSON.parse(
        localStorage.getItem(localHistoryKey) || '[]'
      );
      localStorage.setItem(localHistoryKey, JSON.stringify([refRecord, ...existingHistory]));
    } catch (fsErr) {
      console.warn('Real-time Firestore write warning during referral:', fsErr);
    }

    clearPendingReferralCode();

    let successMsg = `Mahafinaritra! Nampidirina am-pahombiazana ny code parrain ${code}. Azonao hatrany ny +${userBonus} Crédits bonus!`;
    if (userBonus === 0 && currentUser.plan === 'free') {
      successMsg = `Code parrain validé! Tsy nahazo crédit bonus intsony ianao satria efa feno 30/30 Crédits max par mois (Limitation Plan Gratuit). Passy amin'ny Plan PRO hahazoana crédit illimité!`;
    }

    return {
      success: true,
      message: successMsg,
      bonusCredits: userBonus,
      updatedUser: updatedCurrentUser,
    };
  } catch (err: any) {
    console.error('Error applying referral code:', err);
    return {
      success: false,
      message: "Nisy olana teo amin'ny validation ny code parrain. Mba andramo indray miangavy.",
    };
  }
}
