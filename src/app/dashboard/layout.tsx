import DashboardShell from '@/components/dashboard/layout/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We pass children through the client shell
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}