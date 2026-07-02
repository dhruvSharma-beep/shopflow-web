import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailProps {
  to: string; customerName: string; orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number; shippingAddress: string;
}

export async function sendOrderConfirmation(props: OrderEmailProps) {
  const itemRows = props.items.map(i =>
    `<tr><td style="padding:8px 0">${i.name}</td><td style="text-align:right">×${i.quantity}</td><td style="text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`
  ).join('');

  await resend.emails.send({
    from: 'ShopFlow <orders@shopflow.dev>',
    to: props.to,
    subject: `Your order #${props.orderId.slice(-8).toUpperCase()} is confirmed!`,
    html: `
      <!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:40px 0">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:#4f46e5;padding:24px 32px"><h1 style="color:#fff;margin:0;font-size:20px">Order confirmed ✓</h1></div>
        <div style="padding:32px">
          <p>Hi ${props.customerName}, thanks for your order!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="border-bottom:2px solid #e2e8f0"><th style="text-align:left;padding-bottom:8px">Item</th><th>Qty</th><th>Price</th></tr>
            ${itemRows}
            <tr style="border-top:2px solid #e2e8f0"><td colspan="2" style="font-weight:bold;padding-top:12px">Total</td><td style="font-weight:bold;text-align:right;padding-top:12px">$${props.total.toFixed(2)}</td></tr>
          </table>
          <p style="color:#64748b;font-size:14px">Shipping to: ${props.shippingAddress}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${props.orderId}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">Track your order</a>
        </div>
      </div></body></html>`,
  });
}