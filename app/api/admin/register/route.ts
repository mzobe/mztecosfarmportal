import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

import { getCloudflareContext } from "@opennextjs/cloudflare";

// POST /api/admin/register: Register a new admin user
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

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();
  if (existingUser) {
    return NextResponse.json(
      { success: false, message: "Username already exists" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: (Date.now() + Math.random()).toString(),
    username,
    password: hashedPassword,
  };

  await db.insert(users).values(newUser).run();

  return NextResponse.json({
    success: true,
    message: "Admin user created successfully",
  });
}
