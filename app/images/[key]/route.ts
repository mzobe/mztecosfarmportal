import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: NextRequest) {
  // Corrected signature
  console.log("--- Dynamic Image GET handler (/app/images/[key]/route.ts) ---");
  const { env } = getCloudflareContext();
  const bucket = env.IMAGES_BUCKET;

  // Manually parse the key from the URL
  const urlParts = req.nextUrl.pathname.split("/");
  const key = urlParts[urlParts.length - 1];
  console.log(`Request for image key: '${key}'`);

  if (!key) {
    console.log("No key found in the URL path.");
    return new Response("Not found", { status: 404 });
  }

  console.log(`Attempting to get object with key '${key}' from R2 bucket.`);
  // @ts-ignore
  const object = await bucket.get(key);

  if (!object) {
    console.log(`Object with key '${key}' NOT FOUND in R2 bucket.`);
    return new Response("Not found", { status: 404 });
  }

  console.log(`Successfully found object with key '${key}'. Returning image.`);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers,
  });
}
