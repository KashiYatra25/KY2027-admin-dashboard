// ═══════════════════════════════════════════════════════════════════
// CA APPLICATION TYPES
// ═══════════════════════════════════════════════════════════════════

export type CAApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface CAApplication {
  id: string;
  userId: string;
  status: CAApplicationStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string | null;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    college?: string;
  };
  caProfile?: {
    id: string;
    referralId: string;
    numberOfReferrals: number;
  } | null;
}

export interface ApproveCAData {
  applicationId: string;
  status: "ACCEPTED" | "REJECTED";
}

export interface CAApplicationsResponse {
  info: string;
  applications: CAApplication[];
}

export interface ApproveCAResponse {
  info: string;
  application: CAApplication;
}
