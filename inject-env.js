import fs from "fs";

let config = fs.readFileSync("./config.js", "utf-8");

config = config
  .replace("OMAILER_ENDPOINT", process.env.OMAILER_ENDPOINT)
  .replace("SMTP_HOST", process.env.SMTP_HOST)
  .replace("SMTP_PORT", process.env.SMTP_PORT)
  .replace("SMTP_AUTH_EMAIL", process.env.SMTP_AUTH_EMAIL)
  .replace("SMTP_AUTH_PASSWORD", process.env.SMTP_AUTH_PASSWORD)
  .replace("SMTP_SENDER_NAME", process.env.SMTP_SENDER_NAME)
  .replace("SMTP_RECIPIENT", process.env.SMTP_RECIPIENT);

fs.writeFileSync("./config.js", config);
