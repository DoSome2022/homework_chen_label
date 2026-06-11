// src/lib/actions/send-document.ts
"use server"

import db from "@/lib/db"
import { sendWhatsApp, sendEmail } from "@/lib/twilio"

type DocumentType = "QUOTE" | "INVOICE"

/**
 * 將報價單/發票的內容發送給指定客戶
 */
export async function sendDocumentToCustomer(
  documentType: DocumentType,
  documentId: string,
  customerId: string,
  channels: string[]
) {
  // 1. 取得文件資料
  let documentTitle: string
  let documentAmount: number
  let projectTitle: string

  if (documentType === "QUOTE") {
    const quote = await db.quote.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: { title: true },
        },
      },
    })
    if (!quote) return { success: false, error: "報價單不存在" }
    

    documentTitle = `報價單 Q-${quote.id.slice(0, 8).toUpperCase()}`
    documentAmount = quote.amount
    projectTitle = quote.project.title
  } else {
    const invoice = await db.invoice.findUnique({
      where: { id: documentId },
      include: {
        quote: {
          include: {
            project: {
              select: { title: true },
            },
          },
        },
      },
    })
    if (!invoice) return { success: false, error: "發票不存在" }
    
  
    documentTitle = `發票 ${invoice.invoiceNumber}`
    documentAmount = invoice.amount
    projectTitle = invoice.quote.project.title
  }

  // 2. 取得客戶聯絡資訊
  const customer = await db.user.findUnique({
    where: { id: customerId },
    include: {
      customerContacts: {
        select: { phone: true, email: true },
      },
      phoneOtps: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { phone: true },
      },
    },
  })

  if (!customer) return { success: false, error: "客戶不存在" }

  // 3. 取得查看連結（假設有公開檢視頁面）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
  const viewUrl = `${baseUrl}/share/${documentType.toLowerCase()}/${documentId}`

  // 4. 格式化訊息
  const amountFormatted = `$${documentAmount.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}`

  // WhatsApp 訊息（純文字）
  const whatsappMessage = [
    `📄 *${documentTitle}*`,
    ``,
    `專案：${projectTitle}`,
    `金額：${amountFormatted}`,
    ``,
    `🔗 在線查看：${viewUrl}`,
    ``,
    `---`,
    `如有疑問請回覆此訊息`,
  ].join("\n")

  // Email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px;">
        <h2 style="color: #1a1a1a;">📄 ${documentTitle}</h2>
        <div style="margin: 20px 0; padding: 16px; background: #f8f9fa; border-radius: 8px;">
          <p><strong>專案：</strong>${projectTitle}</p>
          <p><strong>金額：</strong><span style="font-size: 20px; color: #2563eb;">${amountFormatted}</span></p>
        </div>
        <p>您可以在線查看完整內容：</p>
        <a href="${viewUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          查看${documentType === "QUOTE" ? "報價單" : "發票"}
        </a>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p>此郵件由系統自動發送</p>
        </div>
      </div>
    </body>
    </html>
  `

  // 5. 發送
  const errors: string[] = []

  for (const channel of channels) {
    if (channel === "EMAIL") {
      const emailTo = customer.customerContacts?.email || customer.email
      if (!emailTo) {
        errors.push("Email: 客戶沒有 Email")
        continue
      }

      const result = await sendEmail(emailTo, documentTitle, emailHtml)
      if (!result.success) {
        errors.push(`Email: ${result.error}`)
      }
    }

    if (channel === "WHATSAPP") {
      const phone = customer.customerContacts?.phone || customer.phoneOtps?.[0]?.phone
      if (!phone) {
        errors.push("WhatsApp: 客戶沒有電話")
        continue
      }

      const result = await sendWhatsApp(phone, whatsappMessage)
      if (!result.success) {
        errors.push(`WhatsApp: ${result.error}`)
      }
    }
  }

  if (errors.length > 0) {
    return { success: true, warning: `部分發送失敗：${errors.join("；")}` }
  }

  return { success: true }
}

/**
 * 取得所有客戶（供選擇用）
 */
export async function getAllCustomersForSending() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      customerContacts: {
        select: { phone: true, email: true },
      },
      phoneOtps: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { phone: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phoneOtps: c.phoneOtps,
    customerContacts: c.customerContacts,
  }))
}
