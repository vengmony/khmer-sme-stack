import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.vendorId || !data.amount || data.amount <= 0) {
    return NextResponse.json({ error: 'Vendor and amount required' }, { status: 400 });
  }
  const last = await prisma.vendorPayment.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.paymentNumber.replace(/\D/g, '')) : 6000;
  const paymentNumber = `VPMT-${String(lastNum + 1).padStart(4, '0')}`;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.vendorPayment.create({
      data: {
        organizationId: orgId,
        paymentNumber,
        vendorId: data.vendorId,
        billId: data.billId || null,
        amount: data.amount,
        currencyCode: data.currencyCode || 'USD',
        exchangeRate: data.exchangeRate || 1,
        paymentMode: data.paymentMode || 'cash',
        reference: data.reference || null,
        notes: data.notes || null,
        date: new Date(data.date || new Date()),
      },
    });
    if (data.billId) {
      const bill = await tx.bill.findUnique({ where: { id: data.billId } });
      if (bill) {
        const newPaid = (bill.amountPaid || 0) + data.amount;
        const balance = (bill.total || 0) - newPaid;
        const paymentStatus = balance <= 0 ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid';
        await tx.bill.update({
          where: { id: bill.id },
          data: { amountPaid: newPaid, balance, paymentStatus, status: balance <= 0 ? 'paid' : bill.status },
        });
        await tx.contact.update({
          where: { id: data.vendorId },
          data: { outstandingPayable: { decrement: Math.min(data.amount, bill.balance || 0) } },
        });
      }
    }
    return payment;
  });
  return NextResponse.json(result);
}

export async function GET() {
  const orgId = await getOrgId();
  const payments = await prisma.vendorPayment.findMany({
    where: { organizationId: orgId },
    include: { vendor: true, bill: true },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(payments);
}
