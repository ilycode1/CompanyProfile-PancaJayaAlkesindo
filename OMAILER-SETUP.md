# Setup Omailer — Contact Form via Email (React + Vite)

Panduan implementasi contact form yang kirim email lewat service **omailer** (SMTP proxy milik [yusnar.my.id](https://yusnar.my.id)). Ditulis biar bisa dipakai ulang di project React + Vite lainnya.

---

## 1. Apa itu omailer?

Omailer adalah endpoint sederhana yang nerima payload JSON berisi konfigurasi SMTP + isi pesan, lalu dia yang nge-relay ke SMTP server (misal Gmail). Jadi kita gak perlu jalanin backend sendiri buat ngirim email dari contact form.

**Endpoint:**

```
GET https://yusnar.my.id/omailer/send/just-message?data=<URL-encoded-JSON>
```

**Payload JSON:**

```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "auth_email": "your-email@gmail.com",
  "auth_password": "app-password-gmail",
  "sender_name": "Nama Pengirim",
  "recipient": "tujuan@gmail.com",
  "subject": "Subjek email",
  "body_html": "<h3>Isi HTML</h3>..."
}
```

---

## 2. ⚠️ Warning Keamanan — BACA DULU

Karena ini **frontend-only** (Vite build → static HTML/JS), **credential SMTP akan ter-inline ke bundle JavaScript yang publik di browser**. Siapa pun bisa buka DevTools → Sources / Network → lihat `auth_password` dalam plain-text.

**Konsekuensinya:**

- ✅ `.env` + `.gitignore` hanya mencegah credential bocor ke **Git history**.
- ❌ Credential **TETAP visible di browser** production.

**Kapan pendekatan ini acceptable:**

- Portfolio pribadi / project iseng dengan Gmail App Password dedicated (bukan password utama).
- Kamu udah sadar risikonya dan siap rotate password kapan pun.

**Kapan HARUS pakai serverless function (Opsi B):**

- Project komersial / klien.
- Credential-nya Gmail utama atau akun SMTP berbayar.
- Regulasi kompliansi (keuangan, kesehatan, dll).

Upgrade path ke serverless ada di [Bagian 8](#8-upgrade-path-ke-serverless-opsional).

---

## 3. Prasyarat

1. **Project React + Vite** (bukan Next.js). Kalau Next.js, pendekatannya beda — pakai API route bawaan langsung.
2. **Gmail App Password** (bukan password login Gmail biasa):
   - Aktifin 2FA di akun Google.
   - Buka [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   - Generate app password baru, copy 16 karakter yang dikasih.
3. **Form kontak** yang udah ada (boleh pakai `react-hook-form + zod`, atau plain HTML — tinggal adaptasi).

---

## 4. Implementasi Step-by-Step

### Step 4.1 — Update `.gitignore`

Tambah di bagian bawah file `.gitignore` root project:

```gitignore
# Env
.env
.env.local
.env.*.local
```

Kalau file `.gitignore` belum ada, bikin di root.

### Step 4.2 — Bikin `.env` (root project)

File ini **gak akan ke-commit** (udah di-gitignore). Isinya credential asli:

```env
VITE_OMAILER_ENDPOINT=https://yusnar.my.id/omailer/send/just-message
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_AUTH_EMAIL=your-email@gmail.com
VITE_SMTP_AUTH_PASSWORD=xxxx xxxx xxxx xxxx
VITE_SMTP_SENDER_NAME=Website Contact Form
VITE_SMTP_RECIPIENT=tujuan-email@gmail.com
```

**Penting:**

- Prefix `VITE_` **wajib**. Tanpa itu, Vite gak expose ke client (`import.meta.env` gak bisa baca).
- Password Gmail App Password ada spasi (mis. `abcd efgh ijkl mnop`) — tulis **apa adanya**, jangan dihapus spasinya.
- `VITE_SMTP_RECIPIENT` = email yang nerima pesan dari form (biasanya email kamu sendiri).
- `VITE_SMTP_AUTH_EMAIL` & `VITE_SMTP_RECIPIENT` boleh sama (kirim ke diri sendiri).

### Step 4.3 — Bikin `.env.example` (root project, DI-COMMIT)

Template kosong buat dokumentasi — biar developer lain (atau future-you) tau env apa aja yang dibutuhkan:

```env
VITE_OMAILER_ENDPOINT=https://yusnar.my.id/omailer/send/just-message
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_AUTH_EMAIL=your-email@gmail.com
VITE_SMTP_AUTH_PASSWORD=your-app-password
VITE_SMTP_SENDER_NAME=Website Contact Form
VITE_SMTP_RECIPIENT=recipient-email@gmail.com
```

### Step 4.4 — Bikin helper `src/lib/mailer.js`

```js
const env = import.meta.env;

const buildBodyHtml = ({ name, whatsapp, email, subject, message }) => `
<!doctype html>
<html lang="id">
<meta charset="utf-8">
<body style="font-family:Arial,sans-serif;margin:16px">
<h3>Informasi Kontak Baru dari Website!</h3>
<p><b>Nama:</b> ${name}<br>
    <b>WA:</b> ${whatsapp}<br>
    <b>Email:</b> ${email}<br>
    <b>Subjek:</b> ${subject}</p>

<p><b>Pesan:</b><br>${message}</p>

<p>
    <a href="mailto:${email}?subject=Balasan%20untuk%20${encodeURIComponent(subject)}">Balas Email</a>
    &nbsp;|&nbsp;
    <a href="https://wa.me/${whatsapp}">WhatsApp</a>
</p>
</body>
</html>
`;

export const sendContactEmail = async ({ name, whatsapp, email, subject, message }) => {
  const payload = {
    smtp_host: env.VITE_SMTP_HOST,
    smtp_port: Number(env.VITE_SMTP_PORT),
    auth_email: env.VITE_SMTP_AUTH_EMAIL,
    auth_password: env.VITE_SMTP_AUTH_PASSWORD,
    sender_name: env.VITE_SMTP_SENDER_NAME,
    recipient: env.VITE_SMTP_RECIPIENT,
    subject,
    body_html: buildBodyHtml({ name, whatsapp, email, subject, message }),
  };

  const encoded = encodeURIComponent(JSON.stringify(payload));
  const response = await fetch(`${env.VITE_OMAILER_ENDPOINT}?data=${encoded}`);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Omailer error ${response.status}`);
  }
};
```

**Catatan:**

- Field `whatsapp` opsional — kalau form-mu gak ada field WA, hapus aja dari destructuring `buildBodyHtml` & tag `<b>WA:</b>`.
- Fungsi ini **throw error** kalau gagal. Caller (form submit) wajib handle via try/catch.

### Step 4.5 — Integrasi ke form

Contoh pakai `react-hook-form` + `zod`:

```jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendContactEmail } from "@/lib/mailer";

export const ContactForm = () => {
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm();

  const submit = async (data) => {
    setErrorMsg("");
    try {
      await sendContactEmail(data);
      setSent(true);
      reset();
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal mengirim pesan. Silakan coba lagi nanti.");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <input {...register("name")} placeholder="Nama" />
      <input {...register("email")} placeholder="Email" />
      <input {...register("subject")} placeholder="Subjek" />
      <textarea {...register("message")} placeholder="Pesan" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Mengirim…" : "Kirim"}
      </button>
      {sent && <p style={{ color: "green" }}>Pesan terkirim!</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </form>
  );
};
```

Pakai validation (zod, yup, dll) sesuai preferensi project. Schema gak mempengaruhi mailer.

---

## 5. Testing di Lokal

```bash
npm run dev
```

1. Buka browser → ke halaman yang ada contact form.
2. Isi form, submit.
3. Buka DevTools → tab **Network** → cari request ke `yusnar.my.id/omailer/...`. Status harus `200 OK`.
4. Cek inbox `VITE_SMTP_RECIPIENT` → email harusnya masuk dalam < 10 detik.

Kalau gagal → lihat [Bagian 7 Troubleshooting](#7-troubleshooting).

---

## 6. Deploy ke Vercel

Karena `.env` gak ke-push ke GitHub, Vercel **gak tau credential kamu**. Harus diinput manual di dashboard.

### Langkah:

1. Buka [vercel.com/dashboard](https://vercel.com/dashboard) → klik project-mu.
2. **Settings → Environment Variables**.
3. Tambah 7 variable, satu per satu:

   | Key                       | Value                                            |
   | ------------------------- | ------------------------------------------------ |
   | `VITE_OMAILER_ENDPOINT`   | `https://yusnar.my.id/omailer/send/just-message` |
   | `VITE_SMTP_HOST`          | `smtp.gmail.com`                                 |
   | `VITE_SMTP_PORT`          | `587`                                            |
   | `VITE_SMTP_AUTH_EMAIL`    | (email kamu)                                     |
   | `VITE_SMTP_AUTH_PASSWORD` | (app password gmail)                             |
   | `VITE_SMTP_SENDER_NAME`   | `Website Contact Form`                           |
   | `VITE_SMTP_RECIPIENT`     | (email tujuan)                                   |

4. Untuk tiap variable, centang semua environment: **Production**, **Preview**, **Development**.
5. **Save**.
6. **Re-deploy** — env variable baru gak auto-apply ke deployment existing. Dua cara:
   - Push commit baru ke branch production → auto trigger deploy.
   - Atau: tab **Deployments** → deployment terbaru → titik tiga → **Redeploy**.

### Platform selain Vercel

- **Netlify**: Site settings → Build & deploy → Environment. Sama cara.
- **Cloudflare Pages**: Settings → Environment variables. Sama cara.
- **GitHub Pages / hosting statis murni**: gak ada env var runtime — build di lokal / CI dengan `.env` ada, lalu deploy hasil `dist/` nya. Credential akan ter-bake saat `npm run build`.

---

## 7. Troubleshooting

### Request 4xx / 5xx dari omailer

- Cek Network tab → response body. Biasanya error message jelas (misal "invalid smtp credentials").
- Gmail paling sering: pakai password login biasa → ditolak. **Wajib App Password** (16 karakter).
- Pastikan 2FA Gmail udah aktif (syarat App Password).

### Email gak masuk padahal response 200

- Cek folder **Spam**.
- Coba ganti `VITE_SMTP_SENDER_NAME` jadi sesuatu yang bukan "no-reply" atau "noreply" (lebih gampang masuk spam).
- Verifikasi `VITE_SMTP_RECIPIENT` typo atau gak.

### `import.meta.env.VITE_XXX` return `undefined`

- Belum restart dev server setelah bikin/ubah `.env`. Stop `npm run dev` → jalanin ulang.
- Nama variable gak prefix `VITE_` — Vite **hanya** expose yang prefix ini.
- File `.env` salah lokasi (harus di **root project**, satu level dengan `package.json` & `vite.config.js`).

### Di production jalan, di preview Vercel gak jalan (atau sebaliknya)

- Di Vercel dashboard, env variable-nya mungkin cuma di-centang Production doang. Centang juga Preview.

### Credential ke-leak ke Git history (pernah ke-commit)

- Rotate password sekarang juga: Gmail → App Passwords → revoke yang lama → generate baru → update `.env` & Vercel env.
- Kalau mau bersihin history Git: pakai `git filter-repo` atau BFG Repo-Cleaner. **Warning**: ini rewrite history → koordinasi kalau repo shared.

---

## 8. Upgrade Path ke Serverless (Opsional)

Kalau suatu hari mau credential beneran aman (gak visible di browser), migrasi ke serverless function. Effort: ~30 menit.

### Di Vercel (`/api/send-email.js`)

Bikin file baru `api/send-email.js` di root project:

```js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, whatsapp, email, subject, message } = req.body;

  // basic validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const payload = {
    smtp_host: process.env.SMTP_HOST,
    smtp_port: Number(process.env.SMTP_PORT),
    auth_email: process.env.SMTP_AUTH_EMAIL,
    auth_password: process.env.SMTP_AUTH_PASSWORD,
    sender_name: process.env.SMTP_SENDER_NAME,
    recipient: process.env.SMTP_RECIPIENT,
    subject,
    body_html: `<h3>Pesan baru dari ${name}</h3><p>${message}</p>`,
  };

  const encoded = encodeURIComponent(JSON.stringify(payload));
  const url = `${process.env.OMAILER_ENDPOINT}?data=${encoded}`;

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send" });
  }
}
```

### Ubah env variable di Vercel

**Hapus prefix `VITE_`** dari semua 7 env variable:

- `VITE_SMTP_AUTH_PASSWORD` → `SMTP_AUTH_PASSWORD`
- dst.

Tanpa prefix `VITE_`, Vite **gak akan expose** ke client bundle. Env variable ini cuma bisa diakses server-side (`process.env.SMTP_AUTH_PASSWORD`) di function kamu.

### Ubah `src/lib/mailer.js` jadi simple POST

```js
export const sendContactEmail = async (data) => {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to send");
};
```

Selesai. Credential sekarang **cuma** ada di Vercel server env, gak pernah sampai ke browser user.

---

## 9. Checklist Implementasi

Copas ke Issue GitHub / Notion kalau mau track:

- [ ] Generate Gmail App Password
- [ ] Tambah entry `.env` di `.gitignore`
- [ ] Bikin `.env` lokal dengan 7 variable
- [ ] Bikin `.env.example` (commited, value kosong)
- [ ] Bikin `src/lib/mailer.js`
- [ ] Integrasi `sendContactEmail()` ke form submit
- [ ] Test lokal (`npm run dev`) — pastikan email masuk
- [ ] Push ke GitHub
- [ ] Tambah 7 env variable di Vercel dashboard
- [ ] Re-deploy / push commit baru
- [ ] Test production URL — email masuk dari deployment beneran
