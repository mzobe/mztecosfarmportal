import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext();
  const bucket = env.IMAGES_BUCKET;

  const urlParts = req.nextUrl.pathname.split("/");
  const key = urlParts[urlParts.length - 1];

  console.log("key", key);

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  // @ts-ignore
  const object = await bucket.get(key);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers,
  });
}
