import { AppLayout } from '@/components/app-layout';
import { DataProvider } from '@/contexts/data-provider';

export default function AppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <AppLayout>{children}</AppLayout>
    </DataProvider>
  );
}
