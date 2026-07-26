import type { Metadata } from 'next';
import { supabase } from '@/lib/db';
import ProductDetails from '@/app/components/ProductDetails';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  if (!supabase) {
    return { title: 'ATTIZ' };
  }

  const { data: product } = await supabase
    .from('products')
    .select(`
      title,
      description,
      product_variants (
        product_variant_images (
          image_url
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!product || !product.title) {
    return { title: 'Product Not Found — ATTIZ' };
  }

  let firstImageUrl: string | undefined = undefined;
  if (product.product_variants && product.product_variants.length > 0) {
    for (const v of product.product_variants as any[]) {
      if (v.product_variant_images && v.product_variant_images.length > 0) {
        firstImageUrl = v.product_variant_images[0]?.image_url;
        if (firstImageUrl) break;
      }
    }
  }

  return {
    title: `${product.title} — ATTIZ`,
    description: product.description || `Shop ${product.title} at ATTIZ. Premium quality clothing.`,
    openGraph: {
      title: `${product.title} — ATTIZ`,
      description: product.description || `Shop ${product.title} at ATTIZ.`,
      images: firstImageUrl ? [{ url: firstImageUrl, width: 800, height: 1067, alt: product.title }] : [],
    },
  };
}

export default function ProductRoute() {
  return <ProductDetails />;
}
