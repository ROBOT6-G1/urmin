export type UserPlan = 'free' | 'pro';

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerEmail: string;
  referrerCode: string;
  referredUserId: string;
  referredUserEmail: string;
  bonusCredits: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  credits: number;
  storageUsedMb: number; // Max 1000MB for free
  referralCode: string;
  referredBy?: string;
  referralsCount: number;
  githubConnected: boolean;
  githubToken?: string;
  githubUsername?: string;
  defaultGithubRepo?: string;
  vercelConnected: boolean;
  vercelToken?: string;
  firebaseConnected: boolean;
  firebaseProjectId?: string;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseDatabaseId?: string;
  firebaseStorageBucket?: string;
  customDomain?: string;
  customDomainStatus?: 'pending' | 'active' | 'failed';
  whatsappNumber?: string;
  isBanned?: boolean;
  createdAt: string;
}

export interface CodeFile {
  name: string;
  language: 'html' | 'css' | 'javascript' | 'json';
  content: string;
}

export interface ProjectVersion {
  id: string;
  timestamp: string;
  prompt: string;
  files: CodeFile[];
  summary: string;
}

export interface Project {
  id: string;
  userId: string;
  userEmail?: string;
  isPrivate?: boolean;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  files: CodeFile[];
  versions: ProjectVersion[];
  deployedUrl?: string;
  lastDeployedAt?: string;
  customDomain?: string;
  githubRepo?: string;
  firebaseLinked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  generatedCode?: CodeFile[];
  tokensUsed?: number;
  creditsDeducted?: number;
  isError?: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountAr: number;
  creditsRequested: number;
  isProSubscription?: boolean;
  provider: 'mvola' | 'orange_money' | 'airtel_money';
  senderPhone: string;
  transactionRef: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  imageUrl?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  reply?: string;
  replyAt?: string;
}

export interface GeminiApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  isQuotaExhausted?: boolean;
}

export interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  totalPaymentsPending: number;
  totalCreditsIssued: number;
}
