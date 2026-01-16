import OSS from "ali-oss"

const client = new OSS({
  region: process.env.OSS_REGION!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET!,
})

export async function uploadToOSS(file: File, folder: string = "broadcasts"): Promise<string> {
  if (!file) throw new Error("No file provided")

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${folder}/${Date.now()}-${file.name.replace(/\s/g, "-")}`

  const result = await client.put(filename, buffer, {
    headers: { "Content-Type": file.type },
  })

  return result.url  // 直接返回公開 URL（確保 Bucket 允許公開讀取，或使用簽名 URL）
}