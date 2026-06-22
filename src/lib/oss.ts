// import OSS from "ali-oss"

// const client = new OSS({
//   region: process.env.OSS_REGION!,
//   accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
//   accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
//   bucket: process.env.OSS_BUCKET!,
// })

// export async function uploadToOSS(file: File, folder: string = "broadcasts"): Promise<string> {
//   if (!file) throw new Error("No file provided")

//   const buffer = Buffer.from(await file.arrayBuffer())
//   const filename = `${folder}/${Date.now()}-${file.name.replace(/\s/g, "-")}`

//   const result = await client.put(filename, buffer, {
//     headers: { "Content-Type": file.type },
//   })

//   return result.url  // 直接返回公開 URL（確保 Bucket 允許公開讀取，或使用簽名 URL）
// }

// src/lib/oss.ts
import OSS from "ali-oss"

// ❌ 不要在全域範圍 new OSS()
// const client = new OSS({...})

// ✅ 改為函數，需要時才建立

// src/lib/oss.ts
export async function uploadToOSS(file: File, folder?: string): Promise<string> {
  const client = new OSS({
    region: process.env.OSS_REGION!,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.OSS_BUCKET!,
  })

  // 如果有 folder，就把檔案路徑加上 folder
  const fileName = folder ? `${folder}/${file.name}` : file.name
  
  const result = await client.put(fileName, file)
  return result.url
}
