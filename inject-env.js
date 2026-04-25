import fs from "fs";

let config = fs.readFileSync("./config.js", "utf-8");

config = config
  .replace(/OMAILER_ENDPOINT/g, process.env.OMAILER_ENDPOINT || "")
  .replace(/SMTP_HOST/g, process.env.SMTP_HOST || "")
  .replace(/SMTP_PORT/g, process.env.SMTP_PORT || "")
  .replace(/SMTP_AUTH_EMAIL/g, process.env.SMTP_AUTH_EMAIL || "")
  .replace(/SMTP_AUTH_PASSWORD/g, process.env.SMTP_AUTH_PASSWORD || "")
  .replace(/SMTP_SENDER_NAME/g, process.env.SMTP_SENDER_NAME || "")
  .replace(/SMTP_RECIPIENT/g, process.env.SMTP_RECIPIENT || "");

fs.writeFileSync("./config.js", config);
