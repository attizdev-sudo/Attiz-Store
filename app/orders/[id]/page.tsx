import type { Metadata } from 'next';
import OrderDetailsPage from '@/app/components/OrderDetailsPage';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shortId = id ? (id.length > 8 ? id.slice(0, 8).toUpperCase() : id.toUpperCase()) : '';
  return {
    title: shortId ? `Order #${shortId} — ATTIZ` : 'Order Details — ATTIZ',
    description: 'Track and view your order details, delivery progress, and tax invoice on ATTIZ.',
  };
}

export default async function OrderDetailRoute({ params }: Props) {
  const { id } = await params;
  return <OrderDetailsPage orderId={id} />;
}
