import { notFound as nf } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import ContactForm from '@/components/forms/ContactForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const contact = await prisma.contact.findFirst({ where: { id: params.id, organizationId: session.organizationId } });
  if (!contact) nf();
  return (
    <div className="space-y-4 max-w-4xl">
      <Link href={`/contacts/${contact.id}`} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to Contact
      </Link>
      <h1 className="text-2xl font-bold">Edit Contact</h1>
      <ContactForm initial={contact} mode="edit" />
    </div>
  );
}
