export interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "namFindz <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not configured. Would send to ${args.to}\n  Subject: ${args.subject}\n  Body: ${args.text}`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Resend API error: ${res.status} ${errText}`);
  }
}

export function buildPasswordResetEmail(args: {
  resetUrl: string;
  email: string;
}): { subject: string; text: string; html: string } {
  const subject = "Reset your namFindz password";
  const text = [
    `Hi,`,
    ``,
    `We received a request to reset the password for the namFindz account associated with ${args.email}.`,
    ``,
    `Use the link below to set a new password. It expires in 1 hour.`,
    args.resetUrl,
    ``,
    `If you did not request this, you can safely ignore this email — your password will not change.`,
    ``,
    `— namFindz`,
  ].join("\n");
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 540px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #d97706;">Reset your namFindz password</h2>
      <p>We received a request to reset the password for the account associated with <strong>${args.email}</strong>.</p>
      <p>
        <a href="${args.resetUrl}" style="display: inline-block; background: #ea580c; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">Set a new password</a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">Or paste this link into your browser:<br><span style="word-break: break-all;">${args.resetUrl}</span></p>
      <p style="font-size: 13px; color: #6b7280;">This link expires in 1 hour. If you did not request a reset, you can safely ignore this email.</p>
      <p style="font-size: 13px; color: #6b7280;">— namFindz</p>
    </div>
  `.trim();
  return { subject, text, html };
}
