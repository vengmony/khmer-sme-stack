import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.firstName || !data.lastName) {
    return NextResponse.json({ error: 'First and last name required' }, { status: 400 });
  }
  const contact = await prisma.contact.create({ data: { ...data, organizationId: orgId } });
  return NextResponse.json(contact);
}
