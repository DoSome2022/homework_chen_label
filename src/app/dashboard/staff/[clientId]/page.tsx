"use client";

import { useState, useEffect, useCallback, use } from "react";
import { getClientDetail } from "@/lib/actions/staff";
import { MessageInput } from "@/components/client/MessageInput";
import Image from "next/image";

// 資料結構介面定義（保持不變，但請注意 client 才是核心）
interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderRole: "CUSTOMER" | "EMPLOYEE" | "ADMIN" | "SYSTEM";
  createdAt: string | Date;
  senderType?: "USER" | "SYSTEM" | null;
}

interface Conversation {
  id: string;
  customerId: string;
  messages: Message[];
}

interface CustomerContact {
  phone?: string | null;
}

interface ClientDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  customerContact?: CustomerContact | null;
  conversations?: Conversation[];
  // 如果需要，也可加入 projects 等其他欄位
}
interface Project {
  id: string;
  name?: string;
  [key: string]: unknown; // 允許包含其他未定義的屬性
}
// [修改] 將 any[] 改為 Project[]
interface GetClientDetailResponse {
  client: ClientDetail & { projects?: Project[] }; 
  projects?: Project[]; 
}

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default function StaffClientDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.clientId;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetail = useCallback(async () => {
    try {
      setError(null);
      const data = await getClientDetail(clientId) as GetClientDetailResponse;

      // 關鍵修正：取出真正的 client 物件，並進行正規化
      const rawClient = data.client;

      if (!rawClient) {
        throw new Error("客戶資料不存在");
      }

      const normalized: ClientDetail = {
        id: rawClient.id,
        name: rawClient.name,
        email: rawClient.email,
        phone: rawClient.phone ?? rawClient.customerContact?.phone ?? null,
        customerContact: rawClient.customerContact ?? null,
        conversations: rawClient.conversations ?? [],
        // 如果需要使用頂層 projects，可在此合併或另存狀態
      };

      setClient(normalized);

      console.log("[載入完成] 正規化後的 client:", {
        id: normalized.id,
        name: normalized.name,
        email: normalized.email,
        phone: normalized.phone,
        conversationsCount: normalized.conversations?.length ?? 0,
      });
    } catch (err) {
      console.error("載入客戶詳情失敗:", err);
      setError("無法載入客戶資料，請稍後再試");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientDetail();
    const interval = setInterval(fetchClientDetail, 5000);
    return () => clearInterval(interval);
  }, [fetchClientDetail]);

  if (loading) {
    return <div className="p-8 text-center">載入中...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!client) {
    return <div className="p-8 text-center">找不到客戶資料</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {client.name || client.email || "未命名客戶"}
        </h1>
        {client.email && (
          <p className="text-muted-foreground">Email: {client.email}</p>
        )}
        <p className="text-muted-foreground">
          電話: {client.phone || "無"}
        </p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-6">對話紀錄</h2>

        {(client.conversations?.length ?? 0) === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            目前尚無對話紀錄
          </div>
        ) : (
          <div className="space-y-6">
            {client.conversations!.map((conv) => (
              <div key={conv.id} className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="space-y-4 mb-6">
                  {conv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        ["EMPLOYEE", "ADMIN", "SYSTEM"].includes(msg.senderRole)
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg shadow ${
                          msg.senderRole === "EMPLOYEE" || msg.senderRole === "ADMIN"
                            ? "bg-blue-600 text-white"
                            : msg.senderRole === "SYSTEM"
                            ? "bg-gray-200 text-gray-800 italic"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                        {msg.imageUrl && (
                          <div className="mt-3">
                            <Image
                              src={msg.imageUrl}
                              alt="訊息附件"
                              width={240}
                              height={240}
                              className="rounded object-cover max-w-full h-auto"
                              unoptimized
                            />
                          </div>
                        )}

                        <span className="text-xs opacity-70 block mt-2 text-right">
                          {new Date(msg.createdAt).toLocaleString("zh-TW", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <MessageInput conversationId={conv.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}