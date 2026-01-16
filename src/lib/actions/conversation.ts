// src/lib/actions/client.ts（或 conversation.ts）
'use server';

import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER" || session.user.customerType !== "POTENTIAL") {
    throw new Error("Unauthorized");
  }

  const conversations = await db.conversation.findMany({
    where: { customerId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return conversations;
}