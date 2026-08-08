/**
 * Shiprocket API Integration Service for ATTIZ Store
 * Handles authentication, custom order creation, tracking, and cancellation.
 */

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

interface ShiprocketAuthResponse {
  token: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
  created_at: string;
}

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number | string;
}

export interface CreateOrderParams {
  orderId: string;
  orderNumber: string;
  orderDate: string; // Format: "YYYY-MM-DD HH:mm" or ISO
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  paymentMethod: 'COD' | 'Prepaid' | string;
  subtotal: number;
  totalPrice: number;
  items: Array<{
    title: string;
    sku?: string;
    quantity: number;
    price: number;
    discount?: number;
    gst_rate?: number;
    tax?: number;
    hsn?: string | number;
  }>;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

export interface CategoryDimensions {
  length: number;  // in cm
  breadth: number; // in cm
  height: number;  // in cm
  weight: number;  // in Kg
}

/**
 * Recommended single values for product listing & packaging:
 * - T-Shirt (Round Neck Tees, Oversized Tees): Height 4cm, Breadth 28cm, Length 33cm, Weight 250g (0.25 kg)
 * - Polo T-Shirt (Polo Tees): Height 4cm, Breadth 28cm, Length 33cm, Weight 300g (0.30 kg)
 * - Sweatshirt (Sweatshirts): Height 6cm, Breadth 30cm, Length 36cm, Weight 550g (0.55 kg)
 * - Hoodie (Hoodies): Height 8cm, Breadth 32cm, Length 38cm, Weight 650g (0.65 kg)
 */
export const CATEGORY_DIMENSIONS: Record<string, CategoryDimensions> = {
  't-shirt': { length: 33, breadth: 28, height: 4, weight: 0.25 },
  'polo': { length: 33, breadth: 28, height: 4, weight: 0.30 },
  'sweatshirt': { length: 36, breadth: 30, height: 6, weight: 0.55 },
  'hoodie': { length: 38, breadth: 32, height: 8, weight: 0.65 },
};

export function getDimensionsForProduct(item: { title?: string; category?: string }): CategoryDimensions {
  const text = `${item.category || ''} ${item.title || ''}`.toLowerCase();

  if (text.includes('polo')) {
    return CATEGORY_DIMENSIONS['polo'];
  }
  if (text.includes('sweatshirt')) {
    return CATEGORY_DIMENSIONS['sweatshirt'];
  }
  if (text.includes('hoodie')) {
    return CATEGORY_DIMENSIONS['hoodie'];
  }
  if (text.includes('round neck') || text.includes('oversized')) {
    return CATEGORY_DIMENSIONS['t-shirt'];
  }

  // Default fallback if category not matched
  return CATEGORY_DIMENSIONS['t-shirt'];
}

export function calculateOrderShipmentDimensions(
  items: Array<{ title?: string; category?: string; quantity?: number }>,
  customParams?: { length?: number; breadth?: number; height?: number; weight?: number }
): CategoryDimensions {
  if (customParams?.length && customParams?.breadth && customParams?.height && customParams?.weight) {
    return {
      length: customParams.length,
      breadth: customParams.breadth,
      height: customParams.height,
      weight: customParams.weight,
    };
  }

  if (!items || items.length === 0) {
    return CATEGORY_DIMENSIONS['t-shirt'];
  }

  let totalWeight = 0;
  let maxCrossLength = 0;
  let maxCrossBreadth = 0;
  let totalStackHeight = 0;

  items.forEach((item) => {
    const qty = item.quantity || 1;
    const dim = getDimensionsForProduct(item);

    totalWeight += dim.weight * qty;
    maxCrossLength = Math.max(maxCrossLength, dim.length);
    maxCrossBreadth = Math.max(maxCrossBreadth, dim.breadth);
    totalStackHeight += dim.height * qty;
  });

  return {
    length: customParams?.length || maxCrossLength || 33,
    breadth: customParams?.breadth || maxCrossBreadth || 28,
    height: customParams?.height || Math.min(totalStackHeight, 50) || 4,
    weight: customParams?.weight || Number(totalWeight.toFixed(2)) || 0.25,
  };
}

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

/**
 * Obtain or return a valid cached Shiprocket Bearer Auth Token
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL?.trim(); 
  const password = process.env.SHIPROCKET_PASSWORD?.trim(); 

  if (!email || !password) {
    console.warn('⚠️ [SHIPROCKET] SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing in environment variables.');
    return null;
  }

  // Use cached token if valid (token expires in 10 days, refresh after 8 days)
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ [SHIPROCKET AUTH FAILED]', res.status, errText);
      return null;
    }

    const data: ShiprocketAuthResponse = await res.json();
    if (data && data.token) {
      cachedToken = data.token;
      // Cache for 8 days (8 * 24 * 60 * 60 * 1000 ms)
      tokenExpiryTime = Date.now() + 8 * 24 * 60 * 60 * 1000;
      console.log('✅ [SHIPROCKET AUTH SUCCESS] Token acquired.');
      return cachedToken;
    }
  } catch (error) {
    console.error('❌ [SHIPROCKET AUTH ERROR]', error);
  }

  return null;
}

/**
 * Create a Custom Order in Shiprocket
 */
export async function createShiprocketOrder(params: CreateOrderParams) {
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION?.trim() || 'Primary';

  // Format order date to YYYY-MM-DD HH:mm
  const dateObj = new Date(params.orderDate);
  const formattedDate = !isNaN(dateObj.getTime())
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
    : `${new Date().toISOString().slice(0, 10)} 12:00`;

  // Split name into first and last name (Shiprocket requires both)
  const nameParts = (params.customerName || 'Valued Customer').trim().split(/\s+/);
  const firstName = nameParts[0] && nameParts[0].length >= 2 ? nameParts[0] : 'Valued';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';

  // Sanitize address lines to prevent Shiprocket 'junk address' (400) errors
  let addr1 = (params.shippingAddress1 || '').trim();
  let addr2 = (params.shippingAddress2 || '').trim();

  // Combine line 1 and line 2 or city/state if line 1 is under 10 characters
  if (addr1.length < 10) {
    if (addr2) {
      addr1 = `${addr1}, ${addr2}`;
    }
    if (addr1.length < 10 && params.city) {
      addr1 = `${addr1}, ${params.city}`;
    }
    if (addr1.length < 10 && params.state) {
      addr1 = `${addr1}, ${params.state}`;
    }
  }

  const finalBillingAddress1 = addr1.length >= 10 ? addr1.slice(0, 100) : `${addr1} Main Street Area`;
  const finalBillingAddress2 = addr2 ? addr2.slice(0, 100) : '';

  const cleanPhone = params.customerPhone.replace(/\D/g, '').slice(-10);
  const cleanPincode = params.postalCode.replace(/\D/g, '').slice(0, 6);

  const orderItems: ShiprocketOrderItem[] = params.items.map((item) => {
    const itemTax = item.gst_rate ?? item.tax ?? (item.price > 2500 ? 18 : 5);
    const netPayablePrice = item.price || 0;
    const preGstDiscount = item.discount || 0;

    // Convert pre-GST discount to GST-inclusive discount for Shiprocket's GST-inclusive invoice model:
    // e.g., ₹188 * 1.05 = ₹197.40 -> rounded ₹198
    const shiprocketDiscount = preGstDiscount > 0 ? Math.ceil(preGstDiscount * (1 + itemTax / 100)) : 0;

    // Gross selling price = Net payable price + GST-inclusive discount
    // e.g., ₹592 + ₹198 = ₹790
    const shiprocketSellingPrice = netPayablePrice + shiprocketDiscount;

    return {
      name: item.title,
      sku: item.sku || `SKU-${(item.title || 'ITEM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}`,
      units: item.quantity || 1,
      selling_price: shiprocketSellingPrice,
      discount: shiprocketDiscount,
      tax: itemTax,
      hsn: 6109,
    };
  });

  // Calculate shipment dimensions & weight (in Kg) based on item categories
  const dimensions = calculateOrderShipmentDimensions(params.items, {
    length: params.length,
    breadth: params.breadth,
    height: params.height,
    weight: params.weight,
  });

  const payload = {
    order_id: params.orderNumber || params.orderId,
    order_date: formattedDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: finalBillingAddress1,
    billing_address_2: finalBillingAddress2,
    billing_city: params.city,
    billing_pincode: cleanPincode,
    billing_state: params.state,
    billing_country: params.country || 'India',
    billing_email: params.customerEmail || 'customer@attiz.com',
    billing_phone: cleanPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: params.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: params.totalPrice,
    length: dimensions.length,
    breadth: dimensions.breadth,
    height: dimensions.height,
    weight: dimensions.weight,
  };

  console.log('🚀 [SHIPROCKET ORDER CREATION PAYLOAD]:\n', JSON.stringify(payload, null, 2));

  if (process.env.ENABLE_SHIPROCKET === 'false') {
    console.log('ℹ️ [SHIPROCKET] API dispatch skipped because ENABLE_SHIPROCKET is set to false.');
    return {
      success: false,
      disabled: true,
      error: 'Shiprocket order creation is currently disabled in development mode.',
      payload,
    };
  }

  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, error: 'Shiprocket authentication failed or credentials missing in .env.' };
  }

  try {
    const res = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`📩 [SHIPROCKET RESPONSE - HTTP ${res.status}]:\n`, JSON.stringify(data, null, 2));

    if (res.ok && data.order_id) {
      console.log('✅ [SHIPROCKET ORDER CREATED SUCCESS] Order ID:', data.order_id, 'Shipment ID:', data.shipment_id);
      return {
        success: true,
        shiprocket_order_id: data.order_id,
        shiprocket_shipment_id: data.shipment_id,
        status: data.status,
        statusCode: data.status_code,
        awb_code: data.awb_code || null,
        raw: data,
      };
    } else {
      console.error('❌ [SHIPROCKET ORDER FAILED]', data);
      return {
        success: false,
        error: data.message || data.errors || 'Failed to create order on Shiprocket',
        raw: data,
      };
    }
  } catch (err: any) {
    console.error('❌ [SHIPROCKET ORDER ERROR]', err);
    return { success: false, error: err.message || 'Network error creating Shiprocket order.' };
  }
}

/**
 * Track shipment status by order ID or AWB code
 */
export async function trackShiprocketOrder(orderId: string) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Shiprocket authentication failed.' };

  try {
    const res = await fetch(`${SHIPROCKET_API_BASE}/courier/track/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, tracking: data };
    }
    return { success: false, error: data.message || 'Tracking info not found.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Cancel an existing order on Shiprocket
 */
export async function cancelShiprocketOrder(shiprocketOrderId: number | string) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Shiprocket auth failed.' };

  try {
    const res = await fetch(`${SHIPROCKET_API_BASE}/orders/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: [shiprocketOrderId] }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
