import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function GET() {
  const orgId = await getOrgId();
  const ws = await prisma.warehouse.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json(ws);
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const w = await prisma.warehouse.create({ data: { ...data, organizationId: orgId } });
  return NextResponse.json(w);
}
