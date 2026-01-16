'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // 修正：在 Client Component 中推薦使用 useRouter
import { MessageInput } from "@/components/client/MessageInput";
import Image from "next/image";
import { getConversations } from "@/lib/actions/conversation";

// 1. 定義資料結構接口 (Interface) 以替代 any
interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderRole: string; // 或具體枚舉 "CUSTOMER" | "ADMIN"
  createdAt: Date | string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 2. 使用具體類型替代 any[]
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. 使用 useCallback 包裹 fetchConversations
  // 這樣這個函數引用就穩定了，可以安全地放入 useEffect 的依賴陣列中
  const fetchConversations = useCallback(async () => {
    if (status === "loading") return;
    
    // 注意：redirect() 主要用於 Server Component。
    // 在 Client Component 中，雖然 redirect() 有時能用，但 router.push() 更標準且不易報錯。
    if (!session?.user) {
      router.push("/dashboard/client/products");
      return;
    }

    if (session.user.role !== "CUSTOMER" || session.user.customerType !== "POTENTIAL") {
      router.push("/dashboard/client/products");
      return;
    }

    try {
      const data = await getConversations();
      // 確保 data 符合 Conversation[] 類型，如果不確定後端返回什麼，這裡可能需要轉型或檢查
      setConversations(data as unknown as Conversation[]); 
    } catch (error) {
      console.error("載入對話失敗:", error);
    } finally {
      setLoading(false);
    }
  }, [status, session, router]); // 依賴項

  useEffect(() => {
    fetchConversations();

    // 每 8 秒自動更新
    const interval = setInterval(fetchConversations, 8000);

    return () => clearInterval(interval);
  }, [fetchConversations]); // 4. 這裡現在只需要依賴 fetchConversations

  if (status === "loading" || loading) {
    return <div className="p-8 text-center">載入對話中...</div>;
  }

  // 簡單檢查，雖然上面有 router.push，但在跳轉發生前避免渲染錯誤內容
  if (!session?.user) {
    return null; 
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">我的對話</h1>

      {conversations.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">尚未有對話</p>
      ) : (
        // 5. 在 map 中使用具體類型
        conversations.map((conv: Conversation) => (
          <div key={conv.id} className="border rounded-lg p-6">
            {conv.messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`mb-4 ${msg.senderRole === "CUSTOMER" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    msg.senderRole === "CUSTOMER" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {/* 處理 content 可能為 null 的情況 */}
                  {msg.content || ""}
                  
                  {msg.imageUrl && (
                    <Image 
                      src={msg.imageUrl} 
                      alt="附件" 
                      width={200} // 必須指定寬度 (Next.js Image 要求)
                      height={200} // 必須指定高度 (Next.js Image 要求)
                      className="mt-2 max-w-full rounded h-auto" // h-auto 保持比例
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

            <MessageInput conversationId={conv.id} />
          </div>
        ))
      )}
    </div>
  );
}
