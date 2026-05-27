import { z } from "zod";
import {
  generatedActivitySchema,
  generatedDaySchema,
  generatedChecklistSchema,
  generatedPlanBSchema,
} from "@/types/generated-plan";

export const generatedDaysChunkSchema = z.object({
  countryCode: z.string().length(2).nullable(),
  days: z.array(generatedDaySchema).min(1),
});

export const generatedPlanMetaSchema = z.object({
  checklist: z.array(generatedChecklistSchema).min(6).max(14),
  planBAlternatives: z.array(generatedPlanBSchema).min(1),
});

export const suggestedActivitySchema = generatedActivitySchema;

export const assistantReplySchema = z.object({
  reply: z.string().min(1),
  suggestions: z.array(z.string()).max(4).nullable(),
});

export const wizardPreviewSchema = z.object({
  summary: z.string().min(1),
  highlights: z.array(z.string()).min(2).max(5),
  warnings: z.array(z.string()).max(4).nullable(),
});

export type GeneratedDaysChunk = z.infer<typeof generatedDaysChunkSchema>;
export type GeneratedPlanMeta = z.infer<typeof generatedPlanMetaSchema>;
export type SuggestedActivity = z.infer<typeof suggestedActivitySchema>;
export type AssistantReply = z.infer<typeof assistantReplySchema>;
export type WizardPreview = z.infer<typeof wizardPreviewSchema>;
