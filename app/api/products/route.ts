import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../db";
import { products } from "../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth";

import { getCloudflareContext } from "@opennextjs/cloudflare";

// GET: List all products
export async function GET(req: NextRequest) {
  const env = getCloudflareContext().env;
  const db = getDb(env.DB);
  const allProducts = await db.select().from(products).all();
  return NextResponse.json(allProducts);
}

// POST: Create a new product (admin only)
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getCloudflareContext().env;
  const decoded = await verifyToken(token, env.DB);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    name?: string;
    price?: number;
    description?: string;
    picture?: string;
    category?: string;
    stock?: number;
    id?: string;
  };

  if (req.method === "POST" && (!body.name || !body.price)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if ((req.method === "PUT" || req.method === "DELETE") && !body.id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }
  if (!body?.name || !body?.price) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const newProduct = {
    id: (Date.now() + Math.random()).toString(),
    name: body.name,
    description: body.description || "",
    price: body.price,
    picture: body.picture || "",
    category: body.category || "",
    stock: body.stock ?? 0,
  };

  const db = getDb(env.DB);
  await db.insert(products).values(newProduct).run();

  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getCloudflareContext().env;
  const decoded = await verifyToken(token, env.DB);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string };
  if (!body?.id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const db = getDb(env.DB);
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, body.id))
    .get();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updatedProduct = { ...product, ...body };

  await db
    .update(products)
    .set(updatedProduct)
    .where(eq(products.id, body.id))
    .run();

  return NextResponse.json(updatedProduct);
}

// DELETE: Remove a product (admin only)
export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getCloudflareContext().env;
  const decoded = await verifyToken(token, env.DB);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string };
  if (!body?.id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }
  const db = getDb(env.DB);
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, body.id))
    .get();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await db.delete(products).where(eq(products.id, body.id)).run();

  return NextResponse.json(product);
}
