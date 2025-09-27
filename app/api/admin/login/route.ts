import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDb } from "../../../db";
import { users, adminTokens } from "../../../db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

import { getCloudflareContext } from "@opennextjs/cloudflare";

// POST /api/admin/login: Login and store token in D1
export async function POST(req: NextRequest) {
  const env = getCloudflareContext().env;
  const db = getDb(env.DB);
  const { username, password } = (await req.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: "Username and password are required" },
      { status: 400 },
    );
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET, {
    expiresIn: "2h",
  });

  await db.insert(adminTokens).values({ token, username, expiresAt }).run();

  return NextResponse.json({ success: true, token });
}
