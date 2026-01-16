"use client";

import { useState, useEffect, useCallback, use } from "react";
// 1. 移除未使用的 db 導入
// import db from "@/lib/db"; 
import { getClientDetail } from "@/lib/actions/staff";
import { MessageInput } from "@/components/client/MessageInput";
import Image from "next/image";

// 2. 定義資料結構接口 (Interface) 以替代 any
interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderRole: "CUSTOMER" | "STAFF" | "ADMIN"; // 根據你的 schema 可能是這些值
  createdAt: Date | string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

interface ClientDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  conversations: Conversation[];
}

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default function StaffClientDetailPage({ params }: PageProps) {
  // 使用 React.use() 解開 params (Next.js 15+ 推薦寫法)
  const resolvedParams = use(params);
  const clientId = resolvedParams.clientId;

  // 3. 使用具體類型替代 any
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 4. 使用 useCallback 包裹 fetchClientDetail
  const fetchClientDetail = useCallback(async () => {
    try {
      const data = await getClientDetail(clientId);
      // 這裡假設 getClientDetail 返回的結構符合 ClientDetail 接口
      // 如果後端返回的日期是字串，前端介面已兼容 (Date | string)
      setClient(data as unknown as ClientDetail);
    } catch (error) {
      console.error("載入客戶詳情失敗:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]); // 依賴項是 clientId

  useEffect(() => {
    fetchClientDetail();

    const interval = setInterval(fetchClientDetail, 5000);
    return () => clearInterval(interval);
  }, [fetchClientDetail]); // 5. 依賴項補上 fetchClientDetail

  if (loading) return <div className="p-8">載入中...</div>;
  if (!client) return <div className="p-8">找不到客戶</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{client.name || "未命名客戶"}</h1>
        <p className="text-muted-foreground">Email: {client.email}</p>
        <p className="text-muted-foreground">電話: {client.phone || "無"}</p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">對話紀錄</h2>
        {/* 6. 在 map 中使用具體類型 */}
        {client.conversations.length === 0 ? (
          <p>尚無對話</p>
        ) : (
          client.conversations.map((conv: Conversation) => (
            <div key={conv.id} className="border rounded-lg p-6 mb-4">
              <div className="space-y-4 mb-4">
                {conv.messages.map((msg: Message) => (
                  <div
                    key={msg.id}
                    // 根據發送者角色決定左右對齊
                    className={`flex ${
                      msg.senderRole === "STAFF" || msg.senderRole === "ADMIN"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.senderRole === "STAFF" || msg.senderRole === "ADMIN"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {/* 處理 content 可能為 null 的情況 */}
                      {msg.content && <p>{msg.content}</p>}
                      
                      {msg.imageUrl && (
                        <Image
                          src={msg.imageUrl}
                          alt="附件"
                          width={200}
                          height={200}
                          className="mt-2 rounded max-w-full h-auto"
                        />
                      )}
                      <span className="text-xs opacity-70 block mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 傳遞 conversationId 給輸入框組件 */}
              <MessageInput conversationId={conv.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
