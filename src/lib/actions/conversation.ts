// src/lib/actions/conversation.ts
'use server';

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { unstable_noStore } from "next/cache";

export async function getConversations() {
  unstable_noStore();
  
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, customerType: true },
  });

  if (!currentUser || currentUser.role !== "CUSTOMER" || currentUser.customerType !== "POTENTIAL") {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // ⭐ 重點：以 Project 為主體去查，Conversation 是選填的附屬資料
  const projects = await db.project.findMany({
    where: { customerId: userId },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      assignedEmployee: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 如果某個 project 還沒有 conversation，就自動建立一個
  const results = await Promise.all(
    projects.map(async (project) => {
      let conversation = project.conversation;

      if (!conversation) {
        // 自動建立對應的對話框
        conversation = await db.conversation.create({
          data: {
            customerId: userId,
            projectId: project.id,
          },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        });
      }

      return {
        id: conversation.id,
        projectId: project.id,
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          assignedEmployee: project.assignedEmployee,
        },
        messages: conversation.messages,
      };
    })
  );

  return results;
}
