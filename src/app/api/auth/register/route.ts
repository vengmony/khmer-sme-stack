import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { name, email, password, orgName } = await req.json();
  if (!name || !email || !password || !orgName) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }
  const lower = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });

  const org = await prisma.organization.create({ data: { name: orgName } });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: lower, passwordHash, organizationId: org.id, role: 'admin' },
  });

  // Create a default warehouse
  await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      name: 'Main Warehouse',
      code: 'MAIN',
      isDefault: true,
    },
  });

  const token = await signSession({
    userId: user.id,
    organizationId: org.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
