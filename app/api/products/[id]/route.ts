import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { products } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext();
  const db = getDb(env.DB);

  const urlParts = req.nextUrl.pathname.split("/");
  const id = urlParts[urlParts.length - 1];

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .get();

  if (!product) {
    return new Response("Not found", { status: 404 });
  }

  return NextResponse.json(product);
}
