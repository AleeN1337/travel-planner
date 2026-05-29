export type ActivityCommentDto = {
  id: string;
  activityId: string;
  authorName: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

export type PlanProposalDto = {
  id: string;
  planDayId: string | null;
  title: string;
  description: string | null;
  locationName: string | null;
  proposedByName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  isMine: boolean;
};

export type PollOptionResultDto = {
  id: string;
  label: string;
  voteCount: number;
};

export type PlanPollDto = {
  id: string;
  question: string;
  createdAt: string;
  options: PollOptionResultDto[];
  myOptionId: string | null;
  totalVotes: number;
};

export type CostSplitDto = {
  id: string;
  label: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  createdAt: string;
};

export type PlanBVoteSummaryDto = {
  alternativeId: string;
  voteCount: number;
  voterNames: string[];
  iVoted: boolean;
};

export type PlanParticipantDto = {
  id: string;
  displayName: string;
  isOwner: boolean;
  isMe: boolean;
  lastSeenAt: string;
};

export type CollaborationBundle = {
  member: { name: string | null; isOwner: boolean };
  participants: PlanParticipantDto[];
  commentsByActivityId: Record<string, ActivityCommentDto[]>;
  proposals: PlanProposalDto[];
  polls: PlanPollDto[];
  costSplits: CostSplitDto[];
  planBVotes: PlanBVoteSummaryDto[];
};
