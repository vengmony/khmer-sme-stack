import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  const data = await req.json();
  if (!data.customerId || !data.amount || data.amount <= 0) {
    return NextResponse.json({ error: 'Customer and amount required' }, { status: 400 });
  }
  // generate payment number
  const last = await prisma.customerPayment.findFirst({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const lastNum = last ? parseInt(last.paymentNumber.replace(/\D/g, '')) : 3000;
  const paymentNumber = `PMT-${String(lastNum + 1).padStart(4, '0')}`;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.customerPayment.create({
      data: {
        organizationId: orgId,
        paymentNumber,
        customerId: data.customerId,
        invoiceId: data.invoiceId || null,
        amount: data.amount,
        currencyCode: data.currencyCode || 'USD',
        exchangeRate: data.exchangeRate || 1,
        paymentMode: data.paymentMode || 'cash',
        reference: data.reference || null,
        notes: data.notes || null,
        date: new Date(data.date || new Date()),
      },
    });

    if (data.invoiceId) {
      const inv = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
      if (inv) {
        const newPaid = (inv.amountPaid || 0) + data.amount;
        const balance = (inv.total || 0) - newPaid;
        const paymentStatus = balance <= 0 ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid';
        const status = balance <= 0 ? 'paid' : inv.status === 'draft' ? 'sent' : inv.status;
        await tx.invoice.update({
          where: { id: inv.id },
          data: { amountPaid: newPaid, balance, paymentStatus, status },
        });

        // Update contact outstanding receivable
        await tx.contact.update({
          where: { id: data.customerId },
          data: { outstandingReceivable: { decrement: Math.min(data.amount, inv.balance || 0) } },
        });
      }
    }
    return payment;
  });

  return NextResponse.json(result);
}

export async function GET() {
  const orgId = await getOrgId();
  const payments = await prisma.customerPayment.findMany({
    where: { organizationId: orgId },
    include: { customer: true, invoice: true },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(payments);
}
