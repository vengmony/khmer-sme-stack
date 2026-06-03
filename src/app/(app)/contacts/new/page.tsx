import { requireSession } from '@/lib/auth';
import Link from 'next/link';
import ContactForm from '@/components/forms/ContactForm';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewContactPage() {
  await requireSession();
  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <Link href="/contacts" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Contacts
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Contact</h1>
      </div>
      <ContactForm />
    </div>
  );
}
