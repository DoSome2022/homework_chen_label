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

function cleanPhoneNumber(phone: string): string {
  // 移除所有非數字字符
  const cleaned = phone.replace(/\D/g, '');
  
  // 如果開頭有 0 且不是國際號碼常見情況，可視需求移除
  // 但大多數情況下前端不需特別處理 + 號，因為 replace(/\D/g, '') 已移除
  
  // 如果你儲存時包含 +852，會變成 852... 正確
  // 如果儲存的是 0912345678（台灣常見），則需要前端或後端補 +886
  
  return cleaned;
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



{customer.customerContacts.phone && (
  <div className="flex items-start gap-3">
    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">電話</p>
      <div className="mt-1 flex items-center gap-3 flex-wrap">
        <span>{customer.customerContacts.phone}</span>

        {/* WhatsApp 按鈕 */}
        <a
          href={`https://wa.me/${cleanPhoneNumber(customer.customerContacts.phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          title="使用 WhatsApp 聯絡"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-current"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.719-.916-.952-.246-.235-.496-.235-.669-.099-.173.149-.547.695-.916 1.093-.37.398-.633.697-.694.816-.061.117-.473.273-.822.406-.35.133-.472.198-.549.168-.076-.03-.549-.198-.916-.347-.367-.149-.668-.224-.917-.099-.25.124-.398.372-.446.546-.049.174-.058 1.095.025 1.668.084.573.383 1.198.833 1.823.45.625 1.066 1.198 1.833 1.648.767.45 1.668.669 2.569.888.901.219 1.802.198 2.569-.099.767-.297 1.668-.669 2.336-1.198.668-.529 1.2-1.198 1.567-1.897.367-.699.496-1.397.496-1.996 0-.599-.099-1.198-.496-1.697z" />
          </svg>
          WhatsApp
        </a>
      </div>
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
<div className="py-10 text-center text-muted-foreground space-y-6">
      <p>目前尚未設定任何聯絡資訊</p>
      
      {/* 新增按鈕放在這裡 */}
      <EditContactDialog
        customerId={customer.id}
        customerName={customer.name || "未命名客戶"}
        initialData={null}  // null 表示新增模式
      />
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