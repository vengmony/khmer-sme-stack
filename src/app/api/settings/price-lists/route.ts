import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const pl = await prisma.priceList.create({ data: { ...data, organizationId: orgId } });
  return NextResponse.json(pl);
}
