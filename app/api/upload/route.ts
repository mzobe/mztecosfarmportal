import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  console.log("--- Upload API route started ---");
  try {
    const { env } = getCloudflareContext();
    const bucket = env.IMAGES_BUCKET;
    console.log("Got cloudflare context and bucket.");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file found in form data.");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const key = `${Date.now()}-${file.name}`;
    console.log(`Generated key: ${key}`);

    const arrayBuffer = await file.arrayBuffer();
    console.log(
      `File converted to ArrayBuffer, size: ${arrayBuffer.byteLength}`,
    );

    console.log("Attempting to upload to R2 bucket...");
    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    console.log("Successfully uploaded to R2 bucket.");

    console.log(`Returning filename: ${key}`);
    console.log("--- Upload API route finished ---");
    return NextResponse.json({ url: key });
  } catch (error) {
    console.error("An error occurred during upload:", error);
    console.log("--- Upload API route finished with error ---");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
