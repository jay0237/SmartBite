const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ── OTP Email ────────────────────────────────────────────────
const sendOTPEmail = async (toEmail, toName, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f0f1a;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ff6b35,#e85520);padding:28px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:1.6rem;">Smart Bite 🍕</h1>
      </div>
      <div style="padding:36px;">
        <h2 style="color:#f0f0f0;margin-bottom:8px;">Hi ${toName},</h2>
        <p style="color:#a0a0b0;line-height:1.7;">Your verification code for Smart Bite is:</p>
        <div style="background:#1a1a2e;border:2px solid #ff6b35;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#ff6b35;">${otp}</span>
        </div>
        <p style="color:#a0a0b0;font-size:0.85rem;">
          This code expires in <strong style="color:#f0f0f0;">10 minutes</strong>.<br/>
          Do not share this code with anyone.
        </p>
      </div>
      <div style="padding:16px;text-align:center;border-top:1px solid #1a1a2e;">
        <p style="color:#555;font-size:0.75rem;margin:0;">© 2026 Smart Bite. All rights reserved.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Smart Bite" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your Smart Bite verification code`,
    html,
  });
};

// ── Order Receipt Email ──────────────────────────────────────
const sendReceiptEmail = async (toEmail, toName, order) => {
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #1a1a2e;color:#f0f0f0;">${item.title}</td>
      <td style="padding:10px;border-bottom:1px solid #1a1a2e;color:#a0a0b0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #1a1a2e;color:#ff6b35;text-align:right;font-weight:700;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>`).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0f1a;border-radius:16px;overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#ff6b35,#e85520);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:1.8rem;">Smart Bite 🍕</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:0.95rem;">Order Confirmed!</p>
      </div>

      <!-- Body -->
      <div style="padding:36px;">
        <h2 style="color:#f0f0f0;margin-bottom:4px;">Hi ${toName}! 👋</h2>
        <p style="color:#a0a0b0;line-height:1.7;margin-bottom:28px;">
          Your order has been placed successfully and we're already preparing it.
          Here's your receipt:
        </p>

        <!-- Order ID -->
        <div style="background:#1a1a2e;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#a0a0b0;font-size:0.85rem;">Order ID</span>
          <span style="color:#ff6b35;font-weight:700;font-size:0.9rem;">${order._id}</span>
        </div>

        <!-- Items Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#1a1a2e;">
              <th style="padding:10px;text-align:left;color:#a0a0b0;font-size:0.8rem;text-transform:uppercase;">Item</th>
              <th style="padding:10px;text-align:center;color:#a0a0b0;font-size:0.8rem;text-transform:uppercase;">Qty</th>
              <th style="padding:10px;text-align:right;color:#a0a0b0;font-size:0.8rem;text-transform:uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <!-- Total -->
        <div style="background:#1a1a2e;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
          <span style="color:#f0f0f0;font-weight:700;font-size:1rem;">Total Paid</span>
          <span style="color:#ff6b35;font-weight:800;font-size:1.3rem;">₹${Number(order.total).toFixed(2)}</span>
        </div>

        <!-- Delivery Info -->
        <div style="background:#1a1a2e;border-radius:10px;padding:20px;margin-bottom:28px;">
          <h4 style="color:#f0f0f0;margin:0 0 12px;font-size:0.95rem;">Delivery Details</h4>
          <p style="color:#a0a0b0;margin:4px 0;font-size:0.85rem;">📍 ${order.customer.address}, ${order.customer.city}</p>
          <p style="color:#a0a0b0;margin:4px 0;font-size:0.85rem;">📞 ${order.customer.phone}</p>
          <p style="color:#a0a0b0;margin:4px 0;font-size:0.85rem;">💳 ${order.customer.payment?.toUpperCase()}</p>
        </div>

        <p style="color:#a0a0b0;font-size:0.85rem;line-height:1.7;text-align:center;">
          Estimated delivery: <strong style="color:#f0f0f0;">30–45 minutes</strong><br/>
          Track your order in the Smart Bite app.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding:20px;text-align:center;border-top:1px solid #1a1a2e;">
        <p style="color:#555;font-size:0.75rem;margin:0;">
          © 2026 Smart Bite. All rights reserved.<br/>
          Questions? Reply to this email.
        </p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Smart Bite" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ Order Confirmed — ₹${Number(order.total).toFixed(2)} | Smart Bite`,
    html,
  });
};

module.exports = { sendOTPEmail, sendReceiptEmail };
