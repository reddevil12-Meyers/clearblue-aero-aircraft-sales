import { secrets } from 'base44:runtime';

// Shared Resend email sender used by listing-agreement functions.
export const sendResendEmail = async ({ to, subject, html }) => {
  const apiKey = secrets.get('RESEND_API_KEY');
  const fromEmail = secrets.get('FROM_EMAIL');
  if (!apiKey || !fromEmail) {
    throw new Error('Email service is not configured (missing RESEND_API_KEY or FROM_EMAIL)');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to send email: ${errorData}`);
  }
  return response.json();
};