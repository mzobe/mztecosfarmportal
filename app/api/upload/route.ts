import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  const { env } = getCloudflareContext();
  const bucket = env.IMAGES_BUCKET;

  const formData = await req.formData();
  const file = formData.get("file") as File;

  console.log("file", file);

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const key = `${Date.now()}-${file.name}`;

  await bucket.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return NextResponse.json({ url: `/images/${key}` });
}
