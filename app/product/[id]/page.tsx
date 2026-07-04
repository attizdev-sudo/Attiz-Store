import type { Metadata } from 'next';
import { supabase } from '@/lib/db';
import ProductDetails from '@/app/components/ProductDetails';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('title, description, image, price')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found — ATTIZ' };
  }

  return {
    title: `${product.title} — ATTIZ`,
    description: product.description || `Shop ${product.title} at ATTIZ. Premium quality clothing.`,
    openGraph: {
      title: `${product.title} — ATTIZ`,
      description: product.description || `Shop ${product.title} at ATTIZ.`,
      images: product.image ? [{ url: product.image, width: 800, height: 1067, alt: product.title }] : [],
    },
  };
}

export default function ProductRoute() {
  return <ProductDetails />;
}
