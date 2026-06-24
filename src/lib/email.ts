import nodemailer from "nodemailer";

// Optional SMTP email. Configure SMTP_* env vars to actually send mail;
// otherwise the message is logged to the server console (useful in dev /
// before an email provider is connected).

const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.EMAIL_FROM ?? "FluentPath <no-reply@fluentpath.app>";

export const emailConfigured = Boolean(HOST && USER && PASS);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (!emailConfigured) {
    // No provider yet — log so the flow is still testable.
    console.log(
      `\n[email:not-configured] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n`,
    );
    return;
  }
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

export function passwordResetEmail(link: string) {
  return {
    subject: "Reset your FluentPath password",
    text: `You asked to reset your FluentPath password.\n\nOpen this link to choose a new one (valid for 1 hour):\n${link}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `<div style="font-family:sans-serif;line-height:1.6;color:#211b14">
      <h2 style="margin:0 0 8px">Reset your password</h2>
      <p>You asked to reset your FluentPath password. Click the button below to choose a new one. This link is valid for 1 hour.</p>
      <p><a href="${link}" style="display:inline-block;background:#e0492a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600">Choose a new password</a></p>
      <p style="color:#8a7d6b;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  };
}
