import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Ensure DATABASE_URL fallback for Vercel / serverless deployments
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  if (process.env.VERCEL) {
    process.env.DATABASE_URL = 'file:/tmp/dev.db';
  } else {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
