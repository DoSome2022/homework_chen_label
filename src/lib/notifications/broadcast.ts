// src/lib/notifications/broadcast.ts
import db from "@/lib/db"
import { sendWhatsApp, sendEmail } from "@/lib/twilio"

/**
 * 發送廣播通知給所有客戶
 * 會在背景執行，不回傳結果給前端
 */
export async function sendBroadcastToAllCustomers(broadcastId: string) {
  console.log(`[BroadcastNotify] 開始發送廣播 ${broadcastId}`)

  // 1. 取得廣播資料
  const broadcast = await db.broadcast.findUnique({
    where: { id: broadcastId },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrl: true,
    },
  })

  if (!broadcast) {
    console.error(`[BroadcastNotify] 廣播不存在: ${broadcastId}`)
    return
  }

  // 2. 取得所有客戶（含聯絡資訊）
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      customerContacts: {
        select: { phone: true },
      },
      phoneOtps: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { phone: true },
      },
    },
  })

  console.log(`[BroadcastNotify] 找到 ${customers.length} 位客戶`)

  // 3. 組裝訊息
  const messageText = formatWhatsAppMessage(broadcast.title, broadcast.content)
  const emailHtml = formatEmailHtml(broadcast.title, broadcast.content, broadcast.imageUrl)

  // 4. 逐筆發送並記錄
  const results = {
    emailSuccess: 0,
    emailFailed: 0,
    whatsappSuccess: 0,
    whatsappFailed: 0,
  }

  for (const customer of customers) {
    // ── Email 發送 ──
    if (customer.email) {
      try {
        const emailResult = await sendEmail(
          customer.email,
          `📢 ${broadcast.title}`,
          emailHtml
        )

        await db.broadcastLog.create({
          data: {
            broadcastId,
            customerId: customer.id,
            channel: "EMAIL",
            status: emailResult.success ? "SUCCESS" : "FAILED",
            errorMessage: emailResult.error,
            sentAt: emailResult.success ? new Date() : null,
          },
        })

        if (emailResult.success) {
          results.emailSuccess++
        } else {
          results.emailFailed++
        }
      } catch (err) {
        await db.broadcastLog.create({
          data: {
            broadcastId,
            customerId: customer.id,
            channel: "EMAIL",
            status: "FAILED",
            errorMessage: err instanceof Error ? err.message : "未知錯誤",
          },
        })
        results.emailFailed++
      }
    }

    // ── WhatsApp 發送 ──
    // 從 CustomerContact 或 PhoneOtp 取得電話
    const phone = customer.customerContacts?.phone || customer.phoneOtps?.[0]?.phone
    if (phone) {
      try {
        const whatsappResult = await sendWhatsApp(phone, messageText)

        await db.broadcastLog.create({
          data: {
            broadcastId,
            customerId: customer.id,
            channel: "WHATSAPP",
            status: whatsappResult.success ? "SUCCESS" : "FAILED",
            errorMessage: whatsappResult.error,
            sentAt: whatsappResult.success ? new Date() : null,
          },
        })

        if (whatsappResult.success) {
          results.whatsappSuccess++
        } else {
          results.whatsappFailed++
        }
      } catch (err) {
        await db.broadcastLog.create({
          data: {
            broadcastId,
            customerId: customer.id,
            channel: "WHATSAPP",
            status: "FAILED",
            errorMessage: err instanceof Error ? err.message : "未知錯誤",
          },
        })
        results.whatsappFailed++
      }
    }
  }

  console.log(`[BroadcastNotify] 發送完成:`, results)

  return results
}

// 格式化 WhatsApp 訊息（純文字，支援 Emoji）
function formatWhatsAppMessage(title: string, content: string): string {
  return [
    `📢 *${title}*`,
    ``,
    content,
    ``,
    `---`,
    `💡 如有疑問請回覆此訊息`,
  ].join("\n")
}

// 格式化 Email HTML
function formatEmailHtml(title: string, content: string, imageUrl?: string | null): string {
  const imageHtml = imageUrl
    ? `<div style="margin: 20px 0;">
        <img src="${imageUrl}" alt="${title}" style="max-width: 100%; border-radius: 8px;" />
       </div>`
    : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, 'Noto Sans TC', sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .title { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 20px; }
        .content { font-size: 16px; line-height: 1.6; color: #333; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="title">📢 ${title}</div>
          ${imageHtml}
          <div class="content">${content.replace(/\n/g, "<br>")}</div>
          <div class="footer">
            <p>此郵件由系統自動發送，請勿回覆</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
