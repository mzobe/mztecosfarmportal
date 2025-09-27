import 'next/server';

declare module 'next/server' {
  interface NextRequest {
    env: {
      DB: D1Database;
    };
  }
}
