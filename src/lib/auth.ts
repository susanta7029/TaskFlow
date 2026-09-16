import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  return null;
}

export function getCurrentUser(req: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Ensures that the authenticated user from JWT exists in the database
 * Prevents foreign key constraint errors when database is recreated/reset.
 */
export async function ensureDbUser(userPayload: TokenPayload) {
  try {
    let dbUser = await prisma.user.findUnique({ where: { id: userPayload.userId } });
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: userPayload.email } });
    }
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: userPayload.userId,
          email: userPayload.email,
          name: userPayload.name,
          passwordHash: '$2a$10$e7V/4e7.kH8f8s9K0j1L2u',
          role: userPayload.role || 'MEMBER',
        },
      });
    }
    return dbUser;
  } catch (e) {
    console.error('ensureDbUser error:', e);
    return null;
  }
}
