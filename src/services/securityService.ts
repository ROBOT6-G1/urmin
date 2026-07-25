import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

export interface DeviceInfo {
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  screenResolution: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  deviceInfo?: DeviceInfo;
}

// Common disposable/temp email alias domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'temp-mail.org',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'dispostable.com',
  'trashmail.com',
  'getnada.com',
  'sharklasers.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'mytemp.email',
  '0815.ru',
  '10minutemail.net',
  '20minutemail.com',
  'emailondeck.com',
  'generator.email',
  'inboxalias.com',
  'tempinbox.com',
  'mohmal.com',
  'maildrop.cc',
  'crazymailing.com',
  'binkmail.com',
  'superrito.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'teleworm.us',
];

/**
 * 1. Email Alias Validator
 * Checks for '+' aliases (e.g. user+alias@gmail.com) and temp/disposable email domains
 */
export function validateEmailNotAlias(email: string): { isValid: boolean; reason?: string } {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { isValid: false, reason: 'Adiresy email tsy manankery!' };
  }

  const [localPart, domainPart] = cleanEmail.split('@');

  // Block '+' aliases (e.g., john.doe+123@gmail.com)
  if (localPart.includes('+')) {
    return {
      isValid: false,
      reason: "Tsy manaiky adiresy email misy alias '+' (ohatra: user+123@gmail.com). Azafady ampidiro ny tena email fototra anao!",
    };
  }

  // Block disposable / temporary email domains
  if (domainPart && DISPOSABLE_EMAIL_DOMAINS.includes(domainPart)) {
    return {
      isValid: false,
      reason: "Tsy manaiky email mampiasa service email temporaire / alias (ohatra: tempmail, mailinator...). Ampidiro ny tena Gmail, Yahoo na Outlook mampiasa anarana marina!",
    };
  }

  return { isValid: true };
}

/**
 * 2. Device Fingerprint Generator
 * Generates a stable Chrome / Device Fingerprint ID using browser parameters + LocalStorage persistent UUID
 */
export function getDeviceFingerprint(): string {
  try {
    let storedId = localStorage.getItem('devwebia_chrome_device_id_v2');
    if (!storedId) {
      const nav = window.navigator;
      const screen = window.screen;
      const rawData = [
        nav.userAgent,
        nav.language,
        nav.hardwareConcurrency || 2,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        Math.random().toString(36).substring(2, 10),
      ].join('||');

      // Hash rawData
      let hash = 0;
      for (let i = 0; i < rawData.length; i++) {
        const char = rawData.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      storedId = 'DEV-CHROME-' + Math.abs(hash).toString(36).toUpperCase() + '-' + Date.now().toString(36);
      localStorage.setItem('devwebia_chrome_device_id_v2', storedId);
    }
    return storedId;
  } catch (e) {
    return 'DEV-CHROME-GENERIC-' + Date.now();
  }
}

/**
 * 3. Public IP Address Fetcher
 */
export async function fetchPublicIpAddress(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.ip) return data.ip;
    }
  } catch (e) {
    // Fallback if blocked or offline
  }
  return '127.0.0.1';
}

/**
 * 4. Geolocation Permission Requester
 * Mandates Geolocation access from browser before sign up
 */
export function requestGeolocationPermission(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tsy manana fonction géolocalisation ny navigateur ampiasainao.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = 'Mila manome alalana ny géolocalisation ianao alohan\'ny hisoratana anarana ho fiarovana amin\'ny double compte!';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Tsy nekena ny autorisation de géolocalisation (Permission Denied). Ampio alalana ao amin\'ny parametre an\'ny navigateur na téléphone anao izany mba afahana misoratra anarana!';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Tsy hita ny toerana (GPS/Localisation) misy anao amin\'izao fotoana izao.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Lany ny fotoana miandry ny géolocalisation. Andramo indray azafady.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * 5. Comprehensive Anti-Double Account Security Inspector
 * Analyzes Firestore & LocalStorage for previous account registrations from same IP or Device ID
 */
export async function verifyAntiDoubleAccount(
  email: string,
  location: { latitude: number; longitude: number; accuracy: number }
): Promise<SecurityCheckResult> {
  // Step A: Email alias check
  const emailCheck = validateEmailNotAlias(email);
  if (!emailCheck.isValid) {
    return {
      allowed: false,
      reason: emailCheck.reason,
    };
  }

  // Step B: Get Device ID and IP Address
  const deviceId = getDeviceFingerprint();
  const ipAddress = await fetchPublicIpAddress();

  const deviceInfo: DeviceInfo = {
    deviceId,
    ipAddress,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    location,
  };

  const cleanEmail = email.trim().toLowerCase();

  // Step C: Check LocalStorage history for double account attempts
  try {
    const localRegisteredEmail = localStorage.getItem('devwebia_registered_email');
    const localDeviceId = localStorage.getItem('devwebia_chrome_device_id_v2');

    if (localRegisteredEmail && localRegisteredEmail.toLowerCase() !== cleanEmail) {
      if (localDeviceId === deviceId) {
        return {
          allowed: false,
          reason: `Tsy avela manao double compte! Efa nisy kaonty (${localRegisteredEmail}) nisoratra anarana tamin'ity aparelho / navigateur ity.`,
          deviceInfo,
        };
      }
    }
  } catch (e) {
    // continue
  }

  // Step D: Query Firestore security_devices collection
  try {
    const devicesRef = collection(db, 'security_devices');

    // 1. Check by Device ID
    const qDevice = query(devicesRef, where('deviceId', '==', deviceId));
    const snapDevice = await getDocs(qDevice);

    for (const docSnap of snapDevice.docs) {
      const data = docSnap.data();
      if (data.email && data.email.toLowerCase() !== cleanEmail) {
        return {
          allowed: false,
          reason: `Tsy avela manao double compte! Efa misy kaonty hafa (${data.email}) nisoratra anarana avy amin'ity Chrome / Téléphone ID ity!`,
          deviceInfo,
        };
      }
    }

    // 2. Check by IP Address (if public IP is detected and not local)
    if (ipAddress && ipAddress !== '127.0.0.1') {
      const qIp = query(devicesRef, where('ipAddress', '==', ipAddress));
      const snapIp = await getDocs(qIp);

      for (const docSnap of snapIp.docs) {
        const data = docSnap.data();
        if (data.email && data.email.toLowerCase() !== cleanEmail) {
          return {
            allowed: false,
            reason: `Tsy avela manao double compte! Efa misy kaonty nisoratra anarana tamin'ny IP adresse (${ipAddress}) ampiasainao ity!`,
            deviceInfo,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Firestore security check warning (proceeding securely):', e);
  }

  return {
    allowed: true,
    deviceInfo,
  };
}

/**
 * 6. Record device footprint after successful signup
 */
export async function registerDeviceSecurityRecord(
  userId: string,
  email: string,
  deviceInfo: DeviceInfo
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    localStorage.setItem('devwebia_registered_email', cleanEmail);
    localStorage.setItem('devwebia_registered_user_id', userId);

    const recordId = `${deviceInfo.deviceId}_${userId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'security_devices', recordId);

    await setDoc(docRef, {
      userId,
      email: cleanEmail,
      deviceId: deviceInfo.deviceId,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      screenResolution: deviceInfo.screenResolution,
      location: deviceInfo.location,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Error saving device security record:', e);
  }
}
