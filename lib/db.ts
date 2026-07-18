import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const resolvedSupabaseUrl = supabaseUrl || '';
const resolvedSupabaseAnonKey = supabaseAnonKey || '';

export const supabase = isSupabaseConfigured
  ? createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey)
  : null as any;

/**
 * SHA-256 hash for custom password auth — server-side only.
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload an image file to a Supabase Storage bucket and return its public URL.
 */
const MAX_WEBP_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      reject(new Error('Image conversion is only available in the browser.'));
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image for conversion.'));
    image.src = src;
  });
}

async function convertToWebp(file: File): Promise<File> {
  const allowedInputTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (typeof window === 'undefined' || typeof document === 'undefined' || !allowedInputTypes.includes(file.type)) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_WEBP_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create canvas context for image conversion.');

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY);
    });

    if (!blob) throw new Error('Unable to create compressed webp image.');

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadImage(bucket: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const processedFile = await convertToWebp(file);
  const ext = processedFile.name.split('.').pop()?.toLowerCase() || 'webp';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, processedFile, {
    cacheControl: '3600',
    upsert: false,
    contentType: processedFile.type,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteImage(bucket: string, url: string): Promise<boolean> {
  if (!supabase || !url) return false;
  try {
    const prefix = '/storage/v1/object/public/';
    const index = url.indexOf(prefix);
    if (index === -1) {
      return false;
    }
    const rest = decodeURIComponent(url.substring(index + prefix.length));
    const firstSlash = rest.indexOf('/');
    if (firstSlash === -1) return false;

    const resolvedBucket = rest.substring(0, firstSlash) || bucket;
    const filePath = rest.substring(firstSlash + 1);

    const { error } = await supabase.storage.from(resolvedBucket).remove([filePath]);
    if (error) {
      console.error(`Failed to delete storage file ${filePath} from bucket ${resolvedBucket}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error deleting image from storage:`, err);
    return false;
  }
}

export async function deleteImages(bucket: string, urls: string[]): Promise<boolean[]> {
  if (!supabase || !urls || urls.length === 0) return [];
  try {
    const prefix = '/storage/v1/object/public/';
    
    // Group files by bucket name so we can do batch deletes per bucket
    const bucketGroups: Record<string, string[]> = {};
    const urlIndices: Record<string, number> = {};

    urls.forEach((url, i) => {
      urlIndices[url] = i;
      const index = url.indexOf(prefix);
      if (index === -1) return;

      const rest = decodeURIComponent(url.substring(index + prefix.length));
      const firstSlash = rest.indexOf('/');
      if (firstSlash === -1) return;

      const resolvedBucket = rest.substring(0, firstSlash) || bucket;
      const filePath = rest.substring(firstSlash + 1);

      if (!bucketGroups[resolvedBucket]) {
        bucketGroups[resolvedBucket] = [];
      }
      bucketGroups[resolvedBucket].push(filePath);
    });

    const results = urls.map(() => false);

    for (const [resolvedBucket, filePaths] of Object.entries(bucketGroups)) {
      const { error } = await supabase.storage.from(resolvedBucket).remove(filePaths);
      if (error) {
        console.error(`Failed to delete storage files ${filePaths.join(', ')} from bucket ${resolvedBucket}:`, error.message);
      } else {
        urls.forEach((url, i) => {
          const index = url.indexOf(prefix);
          if (index !== -1) {
            const rest = decodeURIComponent(url.substring(index + prefix.length));
            const firstSlash = rest.indexOf('/');
            if (firstSlash !== -1) {
              const b = rest.substring(0, firstSlash);
              const f = rest.substring(firstSlash + 1);
              if (b === resolvedBucket && filePaths.includes(f)) {
                results[i] = true;
              }
            }
          }
        });
      }
    }

    return results;
  } catch (err) {
    console.error(`Error deleting images from storage:`, err);
    return urls.map(() => false);
  }
}

export async function deleteUnreferencedImages(urls: string[]): Promise<void> {
  if (!supabase || !urls || urls.length === 0) return;

  const prefix = '/storage/v1/object/public/';

  for (const url of urls) {
    if (!url) continue;
    const index = url.indexOf(prefix);
    if (index === -1) continue;

    const rest = decodeURIComponent(url.substring(index + prefix.length));
    const firstSlash = rest.indexOf('/');
    if (firstSlash === -1) continue;

    const resolvedBucket = rest.substring(0, firstSlash);
    const filePath = rest.substring(firstSlash + 1);

    // Check references in the database
    // Check product_variant_images
    const { count: variantImgCount } = await supabase
      .from('product_variant_images')
      .select('*', { count: 'exact', head: true })
      .eq('image_url', url);

    // Check products size_chart
    const { count: productSizeChartCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('size_chart', url);

    // Check banners image
    const { count: bannerImgCount } = await supabase
      .from('banners')
      .select('*', { count: 'exact', head: true })
      .eq('image_url', url);

    // Check editorial_banners image
    const { count: editorialBannerImgCount } = await supabase
      .from('editorial_banners')
      .select('*', { count: 'exact', head: true })
      .eq('image_url', url);

    // Check lookbook_styles image
    const { count: lookbookStyleImgCount } = await supabase
      .from('lookbook_styles')
      .select('*', { count: 'exact', head: true })
      .eq('image_url', url);

    const totalRefs = (variantImgCount || 0) + (productSizeChartCount || 0) + (bannerImgCount || 0) + (editorialBannerImgCount || 0) + (lookbookStyleImgCount || 0);

    if (totalRefs === 0) {
      const { error } = await supabase.storage.from(resolvedBucket).remove([filePath]);
      if (error) {
        console.error(`Failed to delete unreferenced storage file ${filePath} from bucket ${resolvedBucket}:`, error.message);
      } else {
        console.log(`Deleted unreferenced storage file ${filePath} from bucket ${resolvedBucket}`);
      }
    }
  }
}

