// src/app/dashboard/client/messages/page.tsx

'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { MessageInput } from "@/components/client/MessageInput";
import Image from "next/image";
import { getConversations } from "@/lib/actions/conversation";

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderRole: string;
  createdAt: Date | string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  assignedEmployee: { id: string; name: string } | null;
}

interface Conversation {
  id: string;
  projectId: string;
  project: Project;
  messages: Message[];
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  // const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect 檢查


  // 取得所有對話
  const fetchConversations = useCallback(async () => {
    if (status === "loading") return;

    try {
      const data = await getConversations();
      const convs = data as unknown as Conversation[];
      setConversations(convs);

      // 預設選取第一個對話
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    } catch (error) {
      console.error("載入對話失敗:", error);
    } finally {
      setLoading(false);
    }
  }, [status, activeConversationId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // 找到當前活躍的對話
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  if (status === "loading" || loading) {
    return <div className="p-8 text-center">載入對話中...</div>;
  }

  if (!session?.user) {
    return null;
  }

  console.log("data:", conversations, "-- End -- ");

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ========== 左側：任務列表 ========== */}
      <div className="w-80 border-r overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">我的工單</h2>
        </div>

        {conversations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">尚未有任何任務</p>
        ) : (
          <ul className="divide-y">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    activeConversationId === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <p className="font-medium truncate">{conv.project.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      conv.project.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      conv.project.status === "ASSIGNED" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {conv.project.status === "PENDING" ? "待指派" :
                       conv.project.status === "ASSIGNED" ? "進行中" : "已完成"}
                    </span>
                    {conv.project.assignedEmployee && (
                      <span>專員：{conv.project.assignedEmployee.name}</span>
                    )}
                  </div>
                  {/* 未讀訊息數（可後續擴充） */}
                  {conv.messages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.messages.length} 則訊息
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ========== 右側：當前任務的對話框 ========== */}
      <div className="flex-1 flex flex-col">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {conversations.length > 0 ? "請選擇一個任務" : "尚未有任何任務"}
          </div>
        ) : (
          <>
            {/* 對話標題 */}
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-bold">{activeConversation.project.title}</h3>
              {activeConversation.project.assignedEmployee && (
                <p className="text-sm text-muted-foreground">
                  專員：{activeConversation.project.assignedEmployee.name}
                </p>
              )}
            </div>

            {/* 訊息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  尚未有對話，發送第一則訊息吧
                </p>
              ) : (
                activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === "CUSTOMER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderRole === "CUSTOMER"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content && <p>{msg.content}</p>}
                      {msg.imageUrl && (
                        <Image
                          src={msg.imageUrl}
                          alt="附件"
                          width={200}
                          height={200}
                          className="mt-2 max-w-full rounded h-auto"
                        />
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 輸入框 */}
            <div className="border-t p-4">
              <MessageInput conversationId={activeConversation.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
