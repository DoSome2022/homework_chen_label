// src/lib/email.ts
import nodemailer from "nodemailer"

// 建立 transporter（單例模式，避免每次發送都建立連線）
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("[Email] SMTP 未設定，請檢查 .env.local")
      return null
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }
  return transporter
}

/**
 * 發送 Email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    return { success: false, error: "SMTP 未設定" }
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  try {
    const info = await transporter.sendMail({
      from: `"您的公司名稱" <${from}>`,
      to,
      subject,
      html,
    })

    console.log(`[Email] 發送成功至 ${to}，MessageID: ${info.messageId}`)
    return { success: true }
  } catch (error) {                    // ✅ 移除 :any，讓 TypeScript 推斷為 unknown
    const message = error instanceof Error ? error.message : "未知錯誤"

    console.error("[Email] 發送失敗:", message)

    // 使用型別保護來安全存取 error.code
    const err = error as { code?: string } & Record<string, unknown>

    if (err.code === "EAUTH") {
      return { success: false, error: "認證失敗，請檢查帳號或應用程式密碼是否正確" }
    }
    if (err.code === "ESOCKET") {
      return { success: false, error: "無法連線到 SMTP 伺服器，請檢查網路或主機設定" }
    }

    return { success: false, error: message }
  }
}
