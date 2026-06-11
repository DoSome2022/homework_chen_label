// src/lib/twilio.ts
import twilio from "twilio"
import nodemailer from "nodemailer"

// ── 從環境變數讀取 Twilio 設定 ──
const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!

let twilioClient: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      console.warn("[Twilio] 未設定 TWILIO_ACCOUNT_SID 或 TWILIO_AUTH_TOKEN")
      return null
    }
    twilioClient = twilio(accountSid, authToken)
  }
  return twilioClient
}

// 發送 WhatsApp 訊息
export async function sendWhatsApp(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const client = getTwilioClient()
  if (!client) {
    return { success: false, error: "Twilio 未設定" }
  }

  try {
    const formattedTo = to.startsWith("+") ? `whatsapp:${to}` : `whatsapp:+852${to.replace(/^0+/, "")}`
    const from = `whatsapp:${whatsappFrom}`

    const result = await client.messages.create({
      body: message,
      from,
      to: formattedTo,
    })

    console.log(`[Twilio] WhatsApp 發送成功 SID: ${result.sid}`)
    return { success: true }
  } catch (error) {                    // ✅ 移除 :any
    const errMsg = error instanceof Error ? error.message : "未知錯誤"
    console.error("[Twilio] WhatsApp 發送失敗:", errMsg)
    return { success: false, error: errMsg }
  }
}

// ═══════════════════════════════════════════
// ✅ Gmail SMTP Email 發送（取代 SendGrid）
// ═══════════════════════════════════════════

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

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    return { success: false, error: "SMTP 未設定，請檢查環境變數" }
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  try {
    const info = await transporter.sendMail({
      from: `"標緻商標印刷有限公司" <${from}>`,
      to,
      subject,
      html,
    })

    console.log(`[Email] 發送成功至 ${to}，MessageID: ${info.messageId}`)
    return { success: true }
  } catch (error) {                    // ✅ 移除 :any
    const errMsg = error instanceof Error ? error.message : "未知錯誤"
    console.error("[Email] 發送失敗:", errMsg)

    const err = error as { code?: string } & Record<string, unknown>

    // 常見錯誤提示
    if (err.code === "EAUTH") {
      return { success: false, error: "認證失敗，請檢查 Gmail 帳號或應用程式密碼" }
    }
    if (err.code === "ESOCKET") {
      return { success: false, error: "無法連線到 SMTP 伺服器" }
    }
    if (err.code === "EENVELOPE") {
      return { success: false, error: "收件人 Email 格式無效" }
    }

    return { success: false, error: errMsg }
  }
}
