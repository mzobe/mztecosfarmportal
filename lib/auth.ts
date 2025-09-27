import jwt from 'jsonwebtoken';
import { getDb } from '../app/db';
import { adminTokens } from '../app/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function verifyToken(token: string, d1: D1Database) {
  const db = getDb(d1);
  const tokenRecord = await db.select().from(adminTokens).where(eq(adminTokens.token, token)).get();

  if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
