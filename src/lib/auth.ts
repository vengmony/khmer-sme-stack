import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'zh_session';

export interface SessionPayload {
  userId: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new Error('Unauthorized');
  return s;
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, 10);
}
export async function verifyPassword(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash);
}

export const AUTH_COOKIE = COOKIE_NAME;

// Helper: get current organization from session, or throw
export async function getOrgId(): Promise<string> {
  const s = await requireSession();
  return s.organizationId;
}
