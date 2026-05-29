import { getDb } from "@/lib/db";
import { getPlanAccess } from "@/lib/plans/plan-access";
import type { CollaborationBundle } from "@/lib/plans/collaboration/types";
import {
  listPlanParticipants,
  resolvePlanMember,
  syncOwnerParticipant,
} from "@/lib/plans/plan-participant";

export async function getCollaborationBundle(
  planId: string,
): Promise<CollaborationBundle> {
  const access = await getPlanAccess(planId);
  if (access.ok && access.role === "owner") {
    await syncOwnerParticipant(planId);
  }

  const member = await resolvePlanMember(planId);
  const participants = await listPlanParticipants(planId);
  const memberToken = member?.token;
  const db = getDb();

  const [comments, proposals, polls, costSplits, planBDays] = await Promise.all([
    db.activityComment.findMany({
      where: { activity: { planDay: { tripPlanId: planId } } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        activityId: true,
        authorName: true,
        body: true,
        createdAt: true,
        memberToken: true,
      },
    }),
    db.planProposal.findMany({
      where: { tripPlanId: planId },
      orderBy: { createdAt: "desc" },
    }),
    db.planPoll.findMany({
      where: { tripPlanId: planId },
      orderBy: { createdAt: "desc" },
      include: {
        options: { orderBy: { orderIndex: "asc" } },
        votes: true,
      },
    }),
    db.costSplit.findMany({
      where: { tripPlanId: planId },
      orderBy: { createdAt: "desc" },
    }),
    db.planDay.findMany({
      where: { tripPlanId: planId },
      select: {
        planBAlternatives: {
          select: {
            id: true,
            votes: {
              select: { voterName: true, memberToken: true },
            },
          },
        },
      },
    }),
  ]);

  const commentsByActivityId: CollaborationBundle["commentsByActivityId"] = {};
  for (const c of comments) {
    const dto = {
      id: c.id,
      activityId: c.activityId,
      authorName: c.authorName,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      isMine: Boolean(memberToken && c.memberToken === memberToken),
    };
    if (!commentsByActivityId[c.activityId]) {
      commentsByActivityId[c.activityId] = [];
    }
    commentsByActivityId[c.activityId].push(dto);
  }

  const planBVotes: CollaborationBundle["planBVotes"] = [];
  for (const day of planBDays) {
    for (const alt of day.planBAlternatives) {
      planBVotes.push({
        alternativeId: alt.id,
        voteCount: alt.votes.length,
        voterNames: alt.votes
          .map((v) => v.voterName)
          .filter((n): n is string => Boolean(n)),
        iVoted: Boolean(
          memberToken && alt.votes.some((v) => v.memberToken === memberToken),
        ),
      });
    }
  }

  return {
    member: {
      name: member?.name ?? null,
      isOwner: member?.isOwner ?? false,
    },
    participants,
    commentsByActivityId,
    proposals: proposals.map((p) => ({
      id: p.id,
      planDayId: p.planDayId,
      title: p.title,
      description: p.description,
      locationName: p.locationName,
      proposedByName: p.proposedByName,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      isMine: Boolean(memberToken && p.memberToken === memberToken),
    })),
    polls: polls.map((poll) => {
      const myVote = memberToken
        ? poll.votes.find((v) => v.memberToken === memberToken)
        : undefined;
      return {
        id: poll.id,
        question: poll.question,
        createdAt: poll.createdAt.toISOString(),
        myOptionId: myVote?.pollOptionId ?? null,
        totalVotes: poll.votes.length,
        options: poll.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          voteCount: poll.votes.filter((v) => v.pollOptionId === opt.id).length,
        })),
      };
    }),
    costSplits: costSplits.map((s) => ({
      id: s.id,
      label: s.label,
      amount: s.amount,
      paidBy: s.paidBy,
      splitBetween: s.splitBetween,
      createdAt: s.createdAt.toISOString(),
    })),
    planBVotes,
  };
}
