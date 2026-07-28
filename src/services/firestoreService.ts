import { db, auth } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { UserProfile, Project, PaymentRequest, SupportTicket } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Notice (falling back to local cache/offline state):', JSON.stringify(errInfo));
}

/**
 * Syncs a user profile with Firestore database.
 * If user exists, retrieves latest profile data and merges.
 * If user does not exist, registers the user into Firestore.
 */
export async function dbSyncUser(userProfile: UserProfile): Promise<UserProfile> {
  const path = `users/${userProfile.id}`;
  try {
    const userDocRef = doc(db, 'users', userProfile.id);
    const userSnapshot = await getDoc(userDocRef);
    const isAdmin =
      userProfile.email.toLowerCase() === 'horlandobe@gmail.com' ||
      userProfile.email.toLowerCase() === 'eventuelleboutique@gmail.com';

    if (userSnapshot.exists()) {
      const dbUser = userSnapshot.data() as UserProfile;

      const githubToken = dbUser.githubToken || userProfile.githubToken || '';
      const githubUsername = dbUser.githubUsername || userProfile.githubUsername || '';
      const vercelToken = dbUser.vercelToken || userProfile.vercelToken || '';
      const firebaseProjectId = dbUser.firebaseProjectId || userProfile.firebaseProjectId || '';
      const firebaseApiKey = dbUser.firebaseApiKey || userProfile.firebaseApiKey || '';
      const firebaseAuthDomain = dbUser.firebaseAuthDomain || userProfile.firebaseAuthDomain || '';
      const firebaseDatabaseId = dbUser.firebaseDatabaseId || userProfile.firebaseDatabaseId || '';

      const merged: UserProfile = {
        ...userProfile,
        ...dbUser,
        plan: isAdmin ? 'pro' : (dbUser.plan || 'free'),
        credits: isAdmin ? 999 : (dbUser.credits !== undefined ? dbUser.credits : (userProfile.credits !== undefined ? userProfile.credits : 5)),
        referralsCount: dbUser.referralsCount !== undefined ? dbUser.referralsCount : 0,
        githubToken,
        githubUsername,
        githubConnected: Boolean(githubToken.trim() && githubUsername.trim()),
        vercelToken,
        vercelConnected: Boolean(vercelToken.trim()),
        firebaseProjectId,
        firebaseApiKey,
        firebaseAuthDomain,
        firebaseDatabaseId,
        firebaseConnected: Boolean(firebaseProjectId.trim() && firebaseApiKey.trim()),
      };
      
      // Update DB ONLY if there's a real difference to avoid write quota exhaustion!
      const hasDiff =
        dbUser.plan !== merged.plan ||
        dbUser.credits !== merged.credits ||
        dbUser.githubToken !== merged.githubToken ||
        dbUser.githubUsername !== merged.githubUsername ||
        dbUser.vercelToken !== merged.vercelToken ||
        dbUser.firebaseProjectId !== merged.firebaseProjectId ||
        dbUser.firebaseApiKey !== merged.firebaseApiKey ||
        JSON.stringify(dbUser.appliedPaymentIds || []) !== JSON.stringify(merged.appliedPaymentIds || []);

      if (hasDiff) {
        await setDoc(userDocRef, merged, { merge: true });
      }
      return merged;
    } else {
      const githubToken = userProfile.githubToken || '';
      const githubUsername = userProfile.githubUsername || '';
      const vercelToken = userProfile.vercelToken || '';
      const firebaseProjectId = userProfile.firebaseProjectId || '';
      const firebaseApiKey = userProfile.firebaseApiKey || '';

      const newUserProfile: UserProfile = {
        ...userProfile,
        plan: isAdmin ? 'pro' : 'free',
        credits: isAdmin ? 999 : 5,
        referralsCount: 0,
        githubToken,
        githubUsername,
        githubConnected: Boolean(githubToken.trim() && githubUsername.trim()),
        vercelToken,
        vercelConnected: Boolean(vercelToken.trim()),
        firebaseProjectId,
        firebaseApiKey,
        firebaseConnected: Boolean(firebaseProjectId.trim() && firebaseApiKey.trim()),
      };
      await setDoc(userDocRef, newUserProfile);
      return newUserProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return userProfile;
  }
}

/**
 * Saves/updates user profile in Firestore.
 */
export async function dbSaveUser(userProfile: UserProfile): Promise<void> {
  const path = `users/${userProfile.id}`;
  try {
    const userDocRef = doc(db, 'users', userProfile.id);
    await setDoc(userDocRef, userProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches all projects for a specific user from Firestore.
 */
export async function dbFetchUserProjects(userId: string, email: string): Promise<Project[]> {
  const path = 'projects';
  try {
    const projectsRef = collection(db, 'projects');
    const cleanEmail = (email || '').toLowerCase().trim();
    const isAdmin = cleanEmail === 'horlandobe@gmail.com' || cleanEmail === 'eventuelleboutique@gmail.com';

    const projectsMap = new Map<string, Project>();

    if (isAdmin) {
      const snapshot = await getDocs(projectsRef);
      snapshot.forEach((doc) => {
        projectsMap.set(doc.id, doc.data() as Project);
      });
    } else {
      // Fetch by userId
      if (userId) {
        const q1 = query(projectsRef, where('userId', '==', userId));
        const snapshot1 = await getDocs(q1);
        snapshot1.forEach((doc) => {
          projectsMap.set(doc.id, doc.data() as Project);
        });
      }

      // Fetch by userEmail
      if (cleanEmail) {
        const q2 = query(projectsRef, where('userEmail', '==', cleanEmail));
        const snapshot2 = await getDocs(q2);
        snapshot2.forEach((doc) => {
          projectsMap.set(doc.id, doc.data() as Project);
        });
      }
    }

    return Array.from(projectsMap.values());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves/updates a project in Firestore.
 */
export async function dbSaveProject(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    const projectDocRef = doc(db, 'projects', project.id);
    await setDoc(projectDocRef, project, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a project from Firestore.
 */
export async function dbDeleteProject(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    const projectDocRef = doc(db, 'projects', projectId);
    await deleteDoc(projectDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches payment requests from Firestore.
 * Admins fetch all, clients fetch only theirs.
 */
export async function dbFetchPayments(userId: string, email: string, isAdmin: boolean): Promise<PaymentRequest[]> {
  const path = 'payments';
  try {
    const paymentsRef = collection(db, 'payments');
    const paymentsMap = new Map<string, PaymentRequest>();

    const snapshot = await getDocs(paymentsRef);
    snapshot.forEach((docSnap) => {
      const p = docSnap.data() as PaymentRequest;
      if (!p || !p.id) return;
      if (isAdmin) {
        paymentsMap.set(p.id, p);
      } else {
        const pEmail = (p.userEmail || '').toLowerCase().trim();
        const cleanEmail = (email || '').toLowerCase().trim();
        if (
          (userId && p.userId === userId) ||
          (cleanEmail && pEmail === cleanEmail)
        ) {
          paymentsMap.set(p.id, p);
        }
      }
    });
    
    const payments = Array.from(paymentsMap.values());
    // Sort in-memory to prevent requiring composite indexes initially
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves a payment request to Firestore.
 */
export async function dbSavePayment(payment: PaymentRequest): Promise<void> {
  const path = `payments/${payment.id}`;
  try {
    const paymentDocRef = doc(db, 'payments', payment.id);
    await setDoc(paymentDocRef, payment, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches support tickets from Firestore.
 * Admins fetch all, clients fetch only theirs.
 */
export async function dbFetchTickets(userId: string, email: string, isAdmin: boolean): Promise<SupportTicket[]> {
  const path = 'tickets';
  try {
    const ticketsRef = collection(db, 'tickets');
    let q;
    if (isAdmin) {
      q = query(ticketsRef);
    } else {
      q = query(ticketsRef, where('userId', '==', userId));
    }
    const snapshot = await getDocs(q);
    const tickets: SupportTicket[] = [];
    snapshot.forEach((doc) => {
      tickets.push(doc.data() as SupportTicket);
    });
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves/updates a support ticket in Firestore.
 */
export async function dbSaveTicket(ticket: SupportTicket): Promise<void> {
  const path = `tickets/${ticket.id}`;
  try {
    const ticketDocRef = doc(db, 'tickets', ticket.id);
    await setDoc(ticketDocRef, ticket, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Audits all users: checks users who have plan === 'pro'.
 * If the user is NOT the main admin (horlandobe@gmail.com / eventuelleboutique@gmail.com)
 * AND has no approved payment for a Pro subscription in Firestore,
 * resets their plan back to 'free'.
 */
export async function dbAuditAndResetUnpaidProUsers(approvedPayments: PaymentRequest[]): Promise<{ auditedCount: number; resetUsers: string[] }> {
  const path = 'users';
  const resetUsers: string[] = [];
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const adminEmails = ['horlandobe@gmail.com', 'eventuelleboutique@gmail.com'];

    // Collect emails of users with approved Pro subscriptions
    const paidProEmails = new Set<string>();
    approvedPayments.forEach((p) => {
      if (p.status === 'approved' && p.isProSubscription && p.userEmail) {
        paidProEmails.add(p.userEmail.toLowerCase().trim());
      }
    });

    for (const docSnap of snapshot.docs) {
      const uData = docSnap.data() as UserProfile;
      const userEmail = (uData.email || '').toLowerCase().trim();
      
      const isAdmin = adminEmails.includes(userEmail);
      const isPro = uData.plan === 'pro';

      if (isPro && !isAdmin && !paidProEmails.has(userEmail)) {
        // Revert to Free plan!
        const userDocRef = doc(db, 'users', docSnap.id);
        await setDoc(userDocRef, { plan: 'free' }, { merge: true });
        resetUsers.push(userEmail || docSnap.id);
      }
    }

    return { auditedCount: snapshot.docs.length, resetUsers };
  } catch (error) {
    console.warn('Pro audit warning:', error);
    return { auditedCount: 0, resetUsers: [] };
  }
}

/**
 * Fetches all registered users for admin.
 */
export async function dbFetchAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
