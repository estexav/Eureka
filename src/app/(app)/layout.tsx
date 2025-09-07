import { AppLayout } from '@/components/app-layout';
import { DataProvider } from '@/contexts/data-provider';
import { PurchaseListProvider } from '@/contexts/purchase-list-provider';

export default function AppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <PurchaseListProvider>
        <AppLayout>{children}</AppLayout>
      </PurchaseListProvider>
    </DataProvider>
  );
}
