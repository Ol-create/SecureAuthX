import { sendEmail } from "./email.service.js";

export async function sendSecurityAlert({ user, type, ipAddress, device }) {
  const messages = {
    NEW_LOGIN: "New device login detected",
    TOKEN_ANOMALY: "Suspicious session activity detected",
    LOGOUT_ALL: "You logged out of all devices",
    PASSWORD_CHANGED: "Your password was changed",
    ACCOUNT_LOCKED: "Your account was temporarily locked",
  };

  await sendEmail({
    to: user.email,
    subject: `Security Alert: ${messages[type]}`,
    html: `
      <p>${messages[type]}</p>
      <p><strong>Device:</strong> ${device}</p>
      <p><strong>IP:</strong> ${ipAddress}</p>
      <p>If this wasn’t you, secure your account immediately.</p>
    `,
  });
}
