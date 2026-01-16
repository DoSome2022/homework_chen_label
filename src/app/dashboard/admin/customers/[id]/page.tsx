// src/app/(dashboard)/admin/customers/[id]/page.tsx

import { CreateProjectDialog } from "@/components/admin/CreateProjectDialog"
import { CreateQuoteDialog } from "@/components/admin/CreateQuoteDialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import db from "@/lib/db"
import Image from "next/image"

import { DeleteContactDialog } from "@/components/admin/DeleteContactDialog"
import { Card as ContactCard, CardContent as ContactCardContent, CardDescription, CardHeader as ContactCardHeader, CardTitle as ContactCardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Building, User, FileText } from "lucide-react"
import { EditContactDialog } from "@/components/admin/AddContactDialog"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params

  const customer = await db.user.findUnique({
    where: { id, role: "CUSTOMER" },
    include: {
      projects: {
        include: { quotes: true },
      },
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
      customerContacts: true, // 包含一對一的聯絡資訊
    },
  })

  if (!customer) {
    return <div className="p-8 text-center text-muted-foreground">客戶不存在</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* 客戶基本資訊 + 操作按鈕 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{customer.name || "未命名客戶"}</h1>
          <p className="text-muted-foreground">{customer.email}</p>
          <Badge
            className="mt-2"
            variant={customer.customerType === "POTENTIAL" ? "default" : "secondary"}
          >
            {customer.customerType === "POTENTIAL" ? "潛力客" : "普通客"}
          </Badge>
        </div>

        <div className="flex gap-3">
          <CreateProjectDialog customerId={customer.id} />
        </div>
      </div>

      {/* 聯絡資訊顯示區塊 */}
      <section>
        <ContactCard>
          <ContactCardHeader>
            <ContactCardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              聯絡資訊
            </ContactCardTitle>
            <CardDescription>
              {customer.customerContacts
                ? "以下為目前儲存的聯絡資料"
                : "尚未設定任何聯絡資訊"}
            </CardDescription>
          </ContactCardHeader>

          <ContactCardContent>
            {customer.customerContacts ? (
              <div className="space-y-6">
                {/* 主要欄位網格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 姓名 / 公司名稱 */}
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">姓名 / 公司名稱</p>
                      <p className="mt-1">{customer.customerContacts.name}</p>
                    </div>
                  </div>

                  {/* 公司名稱（有值才顯示） */}
                  {customer.customerContacts.company && (
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">公司名稱</p>
                        <p className="mt-1">{customer.customerContacts.company}</p>
                      </div>
                    </div>
                  )}

                  {/* 電子郵件 */}
                  {customer.customerContacts.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">電子郵件</p>
                        <p className="mt-1">{customer.customerContacts.email}</p>
                      </div>
                    </div>
                  )}

                  {/* 電話 */}
                  {customer.customerContacts.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">電話</p>
                        <p className="mt-1">{customer.customerContacts.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* 地址（跨欄） */}
                  {customer.customerContacts.address && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">地址</p>
                        <p className="mt-1">{customer.customerContacts.address}</p>
                      </div>
                    </div>
                  )}

                  {/* 聯絡人 */}
                  {customer.customerContacts.contactPerson && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">聯絡人</p>
                        <p className="mt-1">{customer.customerContacts.contactPerson}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 額外備註（獨立區塊） */}
                {customer.customerContacts.extraInfo && (
                  <div className="pt-6 border-t">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">其他備註 / 額外資訊</p>
                        <p className="mt-1 whitespace-pre-wrap">{customer.customerContacts.extraInfo}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex gap-3 mt-6">
                  <EditContactDialog
                    customerId={customer.id}
                    customerName={customer.name}
                    initialData={customer.customerContacts}
                  />
                  <DeleteContactDialog customerId={customer.id} />
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                目前尚未設定任何聯絡資訊
              </div>
            )}
          </ContactCardContent>
        </ContactCard>
      </section>

      {/* 項目列表 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">項目列表</h2>
        {customer.projects.length === 0 ? (
          <p className="text-muted-foreground">尚未有任何項目</p>
        ) : (
          customer.projects.map((project) => (
            <Card key={project.id} className="mb-4">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{project.description || "無描述"}</p>
                <div className="mt-4">
                  <CreateQuoteDialog project={project} />
                  {project.quotes.map((quote) => (
                    <div key={quote.id} className="mt-2 p-3 bg-muted rounded">
                      報價：${quote.amount} - {quote.details || "無備註"}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* 對話紀錄 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">對話紀錄</h2>
        {customer.conversations.length === 0 ? (
          <p className="text-muted-foreground">尚未有對話紀錄</p>
        ) : (
          customer.conversations.map((conv) => (
            <Card key={conv.id} className="mb-4">
              <CardContent className="pt-6">
                {conv.messages.map((msg) => (
                  <div key={msg.id} className="mb-4 pb-4 border-b last:border-b-0">
                    <strong className="block mb-1">
                      {msg.senderRole === "CUSTOMER" ? "客戶" : "員工/管理員"}：
                    </strong>
                    <span>{msg.content}</span>
                    {msg.imageUrl && (
                      <Image
                        src={msg.imageUrl}
                        alt="訊息圖片"
                        width={400}
                        height={300}
                        className="mt-3 max-w-md rounded object-contain"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}