/* config.js — runtime config untuk form kontak (omailer).
   File ini DI-GITIGNORE. Nilainya harus sama dengan `.env`.
   Di-load di index.html sebelum script.js. */
window.OMAILER_CONFIG = {
  endpoint: "OMAILER_ENDPOINT",
  smtpHost: "SMTP_HOST",
  smtpPort: "SMTP_PORT",
  authEmail: "SMTP_AUTH_EMAIL",
  authPassword: "SMTP_AUTH_PASSWORD",
  senderName: "SMTP_SENDER_NAME",
  recipient: "SMTP_RECIPIENT",
};
