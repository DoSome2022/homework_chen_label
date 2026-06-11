import { z } from "zod";

export const createQuoteSchema = z.object({
  projectId: z.string().min(1, "請選擇專案"),
  amount: z.number().min(0.01, "金額必須大於 0"),  // 明確為 number
  details: z.string().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
