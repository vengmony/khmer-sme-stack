import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  const updated = await prisma.organization.update({ where: { id: orgId }, data });
  return NextResponse.json(updated);
}
