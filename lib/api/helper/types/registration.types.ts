// ═══════════════════════════════════════════════════════════════════
// REGISTRATION TYPES
// ═══════════════════════════════════════════════════════════════════

export type ParticipationType = "individual" | "duo" | "team";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled" | "waitlisted";
export type EventCategory = "CULTURAL" | "TECHNICAL" | "SPORTS" | "LITERARY" | "PROSHOWS" | "WORKSHOP" | "OTHER";
export type EventParticipationType = "INDIVIDUAL" | "DUO" | "TEAM";

export interface RegistrationUser {
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

export interface RegistrationTeamMember {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  googleAvatarUrl?: string;
  college?: string;
  isPaidUser?: boolean;
  kyId?: string;
}

export interface RegistrationTeam {
  teamId: string;
  name: string;
  memberCount: number;
  members: RegistrationTeamMember[];
}

export interface RegistrationEvent {
  slug: string;
  name: string;
  tagline?: string;
  category: EventCategory;
  participationType: EventParticipationType;
  imageUrl?: string;
  startsAt?: Date;
  venue?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export interface Registration {
  registrationId: string;
  eventSlug: string;
  event: RegistrationEvent | null;
  participationType: ParticipationType;
  status: RegistrationStatus;
  user: RegistrationUser | null;
  team: RegistrationTeam | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationStats {
  total: number;
  individual: number;
  duo: number;
  team: number;
  confirmed: number;
  pending: number;
}

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RegistrationsResponse {
  info: string;
  registrations: Registration[];
  pagination: PaginationInfo;
  stats: RegistrationStats;
}
