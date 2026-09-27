export function generateInvoiceHtml(order: any) {
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const orderNo = order.order_number || (order.id || '').slice(0, 8).toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];

  const itemDiscountTotal = items.reduce((s: number, it: any) => {
    const qty = Number(it.quantity || 1);
    const originalUnit = Number(it.original_price ?? it.mrp ?? it.price ?? it.unit_price ?? 0);
    const finalUnit = Number(it.unit_price ?? it.price ?? 0);
    const itemDiscount = Math.max(0, originalUnit - finalUnit);
    return s + itemDiscount * qty;
  }, 0);

  const displaySubtotal = items.reduce((s: number, it: any) => {
    const qty = Number(it.quantity || 1);
    const originalUnit = Number(it.original_price ?? it.mrp ?? it.unit_price ?? it.price ?? 0);
    const unitPrice = originalUnit > 0 ? originalUnit : Number(it.unit_price ?? it.price ?? 0);
    return s + unitPrice * qty;
  }, 0);

  const discount = Number(itemDiscountTotal || order.discount || 0);
  const shipping = Number(order.shipping_charge || 0);
  const total = Number(order.total_price ?? order.total ?? displaySubtotal - discount + shipping);
  const subtotal = displaySubtotal > 0 ? displaySubtotal : Math.max(0, total + discount - shipping);

  const rows = items
    .map((it: any) => {
      const title = it.title || it.product_title || 'Product';
      const qty = Number(it.quantity || 1);
      const originalUnit = Number(it.original_price ?? it.mrp ?? it.unit_price ?? it.price ?? 0);
      const finalUnit = Number(it.unit_price ?? it.price ?? 0);
      const displayUnitPrice = originalUnit > 0 ? originalUnit : finalUnit;

      return `
        <tr>
          <td style="padding:8px;border:1px solid #222;">${title}${it.selectedSize ? ` (Size: ${it.selectedSize})` : ''}${it.color ? ` (Color: ${it.color})` : ''}</td>
          <td style="padding:8px;border:1px solid #222;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #222;text-align:right;">₹${displayUnitPrice.toLocaleString('en-IN')}</td>
        </tr>
      `;
    })
    .join('');

  const paidAmount = Number(
    order.payments?.[0]?.amount ??
    order.paid_amount ??
    order.amount_paid ??
    (order.payment_status === 'Paid' ? total : 0)
  );
  const isPartialCod = order.payment_status === 'Pending' && paidAmount > 0;
  const balanceAmount = isPartialCod ? Math.max(0, total - paidAmount) : 0;

  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice - ${orderNo}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:20px}
        .sheet{max-width:800px;margin:0 auto;border:1px solid #222;padding:20px}
        h1{font-size:20px;margin:0 0 8px}
        .muted{color:#555;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
      </style>
    </head>
    <body>
      <div class="sheet">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1>ATTIZ — Tax Invoice</h1>
            <div class="muted">Order No: <strong>${orderNo}</strong></div>
            <div class="muted">Placed: ${createdAt.toLocaleString('en-IN')}</div>
          </div>
          <div style="text-align:right">
            <div class="muted"><strong>${order.shipping_name || order.customer_name || ''}</strong></div>
            <div class="muted">${order.shipping_phone || order.customer_phone || ''}</div>
            <div class="muted">${order.shipping_address || ''}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #222;text-align:left;background:#f3f3f3">Item</th>
              <th style="padding:8px;border:1px solid #222;text-align:center;background:#f3f3f3">Qty</th>
              <th style="padding:8px;border:1px solid #222;text-align:right;background:#f3f3f3">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top:12px;display:flex;justify-content:flex-end;">
          <table style="width:340px;border-collapse:collapse">
            <tr>
              <td style="padding:6px;border:1px solid #222">Subtotal</td>
              <td style="padding:6px;border:1px solid #222;text-align:right">₹${subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding:6px;border:1px solid #222">Discount</td>
              <td style="padding:6px;border:1px solid #222;text-align:right">₹${Math.max(0, discount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding:6px;border:1px solid #222">Shipping</td>
              <td style="padding:6px;border:1px solid #222;text-align:right">₹${shipping.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding:6px;border:1px solid #222;font-weight:700;background:#fafafa">Grand Total</td>
              <td style="padding:6px;border:1px solid #222;text-align:right;font-weight:700;background:#fafafa">₹${total.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding:6px;border:1px solid #222">${isPartialCod ? 'Advance Paid Online' : 'Amount Paid'}</td>
              <td style="padding:6px;border:1px solid #222;text-align:right">₹${(paidAmount || 0).toLocaleString('en-IN')}</td>
            </tr>
            ${
              isPartialCod
                ? `
            <tr>
              <td style="padding:6px;border:1px solid #222;font-weight:700;background:#fff8e6">Amount to Pay on Delivery</td>
              <td style="padding:6px;border:1px solid #222;text-align:right;font-weight:700;color:#c00;background:#fff8e6">
                ₹${balanceAmount.toLocaleString('en-IN')}${balanceAmount === 0 && order.payment_status === 'Paid' ? ' (Paid)' : ''}
              </td>
            </tr>
            `
                : ''
            }
          </table>
        </div>

        <p style="margin-top:18px;font-size:12px;color:#555">
          Payment Mode: <strong>${isPartialCod ? 'Partial COD (30% Online + 70% on Delivery)' : (order.payment_method || 'Online Payment')}</strong> | 
          Payment Status: <strong>${order.payment_status || 'Pending'}</strong>
        </p>
        <p style="margin-top:6px;font-size:12px;color:#555">Thank you for shopping with ATTIZ.</p>
      </div>
    </body>
    </html>
  `;
}

export function handlePrintInvoice(order: any) {
  if (!order || typeof window === 'undefined') return;

  const html = generateInvoiceHtml(order);
  const popup = window.open('', '_blank', 'width=900,height=1100');

  if (!popup) {
    alert('Please allow popups to print the invoice.');
    return;
  }

  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    popup.location.href = blobUrl;

    setTimeout(() => {
      try {
        popup.focus();
        popup.print();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (err) {
        console.error('Print error', err);
        URL.revokeObjectURL(blobUrl);
      }
    }, 600);
  } catch (err) {
    console.error('Invoice popup error', err);
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    setTimeout(() => {
      try {
        popup.focus();
        popup.print();
      } catch (printErr) {
        console.error('Print error', printErr);
      }
    }, 600);
  }
}
