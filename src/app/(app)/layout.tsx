import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AppShell from '@/components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const org = await prisma.organization.findUnique({ where: { id: session.organizationId } });
  if (!org) redirect('/login');

  return (
    <AppShell user={{ name: session.name, email: session.email, role: session.role, orgName: org.name }}>
      {children}
    </AppShell>
  );
}
