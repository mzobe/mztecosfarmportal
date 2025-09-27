import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),

  category: text("category").notNull(),
  stock: integer("stock").notNull(),
  picture: text("picture"),
});

export const adminTokens = sqliteTable("admin_tokens", {
  token: text("token").primaryKey(),
  username: text("username").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
