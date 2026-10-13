// ═══════════════════════════════════════════════════════════════════
// TEAM TYPES
// ═══════════════════════════════════════════════════════════════════

export interface TeamMemberUser {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  googleAvatarUrl?: string;
  candidatePhotoUrl?: string;
  college?: string;
  isPaidUser?: boolean;
  kyId?: string;
}

export interface TeamMember extends TeamMemberUser {
  status: "pending" | "accepted" | "rejected";
  respondedAt?: Date | null;
}

export interface Team {
  teamId: string;
  name: string;
  createdBy: TeamMemberUser;
  memberCount: number;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TeamsResponse {
  info: string;
  teams: Team[];
  pagination: PaginationInfo;
}
