import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const isVercel = !!process.env.VERCEL;
const dbUrl = isVercel ? 'file:/tmp/dev.db' : (process.env.DATABASE_URL || 'file:./dev.db');

// On Vercel, copy initial DB template to /tmp if it doesn't exist yet
if (isVercel) {
  try {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      }
    }
  } catch (e) {
    console.error('Vercel tmp DB copy error:', e);
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
