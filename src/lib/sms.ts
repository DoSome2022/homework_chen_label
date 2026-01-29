// src/lib/sms.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Twilio 環境變數未完整設定：TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
}

const client = twilio(accountSid, authToken);

export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  // 簡單格式化：若未帶國際碼，預設加 +852（香港常用）
  // 生產環境建議使用 libphonenumber-js 做嚴格驗證與格式化
  let formattedPhone = phone.trim();
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+852${formattedPhone.replace(/^\+?852?/, '')}`;
  }

  try {
    const message = await client.messages.create({
      body: `您的驗證碼是 ${code}，有效期 5 分鐘，請勿將此碼告知他人。`,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    console.log(`SMS sent successfully to ${formattedPhone} - Message SID: ${message.sid}`);
    return true;
  } catch (err: unknown) {
    console.error('Twilio SMS 發送失敗:', err);
    // 可視需求拋出更明確錯誤給上層
    return false;
  }
}