/* ============================================================
   script.js — PT Panca Jaya Alkesindo
   ============================================================ */

"use strict";

/* ===== NAVBAR: Scroll effect + active state ===== */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    toggleBackToTop();
  },
  { passive: true },
);

/* ===== HAMBURGER MENU ===== */
hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll(".reveal, .reveal-delay, .reveal-line");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  },
);

revealEls.forEach((el) => revealObserver.observe(el));

/* Hero title lines trigger immediately on load */
window.addEventListener("load", () => {
  document.querySelectorAll(".hero .reveal-line").forEach((el) => el.classList.add("visible"));
});

/* ===== LAYANAN CARD: mouse tracking glow ===== */
document.querySelectorAll(".layanan-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

/* ===== HERO PARALLAX (subtle follow on hero-visual) ===== */
const heroVisual = document.querySelector(".hero-visual");
const hero = document.querySelector(".hero");

if (hero && heroVisual && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let rafId = null;
  hero.addEventListener("mousemove", (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const { innerWidth: w, innerHeight: h } = window;
      const rx = (e.clientX / w - 0.5) * 2;
      const ry = (e.clientY / h - 0.5) * 2;
      heroVisual.style.transform = `translate(${rx * -8}px, ${ry * -8}px)`;
      rafId = null;
    });
  });
  hero.addEventListener("mouseleave", () => {
    heroVisual.style.transform = "";
  });
}

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterEls = document.querySelectorAll(".stat-num[data-target]");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 },
);

counterEls.forEach((el) => counterObserver.observe(el));

/* ===== VISI / MISI TABS ===== */
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    tabContents.forEach((c) => {
      if (c.id === `tab-${target}`) {
        c.classList.remove("hidden");
      } else {
        c.classList.add("hidden");
      }
    });
  });
});

/* ===== BACK TO TOP ===== */
const backToTop = document.getElementById("backToTop");

function toggleBackToTop() {
  if (window.scrollY > 400) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
}

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ===== SMOOTH SCROLL for anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    e.preventDefault();

    const navHeight = navbar.getBoundingClientRect().height;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ===== ACTIVE NAV LINK on scroll ===== */
const sections = document.querySelectorAll("main section[id]");

const activeNavObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const link = navLinks.querySelector(`a[href="#${id}"]`);
      if (!link) return;

      if (entry.isIntersecting) {
        navLinks.querySelectorAll("a").forEach((a) => (a.style.color = ""));
        link.style.color = "#C0001A";
      }
    });
  },
  { threshold: 0.35 },
);

sections.forEach((s) => activeNavObserver.observe(s));

/* ===== CONTACT FORM ===== */
const form = document.getElementById("kontakForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  const nama = form.querySelector("#nama").value.trim();
  const email = form.querySelector("#email").value.trim();
  const pesan = form.querySelector("#pesan").value.trim();
  const institusi = form.querySelector("#institusi").value.trim();
  const telepon = form.querySelector("#telepon").value.trim();

  // Basic validation
  if (!nama || !email || !pesan || !institusi) {
    showFormMessage("Mohon lengkapi semua field yang wajib diisi.", "error");
    return;
  }
  if (!isValidEmail(email)) {
    showFormMessage("Format email tidak valid.", "error");
    return;
  }

  // WhatsApp fallback link (ditampilkan bersama status sukses/gagal)
  const waMessage = encodeURIComponent(`Halo PT Panca Jaya Alkesindo,\n\nSaya ${nama} dari ${institusi}.\nEmail: ${email}\nTelp: ${telepon || "-"}\n\nPesan:\n${pesan}`);
  const waLink = `https://wa.me/628132177334?text=${waMessage}`;

  btn.disabled = true;
  btn.textContent = "Mengirim...";

  try {
    await sendContactEmail({ nama, institusi, email, telepon, pesan });
    showFormMessage("Pesan berhasil dikirim! Kami akan merespons dalam 1×24 jam kerja.\n\nAlternatif: Anda juga dapat menghubungi kami langsung via WhatsApp.", "success", waLink);
    form.reset();
  } catch (err) {
    console.error("[kontak] gagal kirim:", err);
    showFormMessage("Maaf, pengiriman pesan gagal. Silakan coba lagi atau hubungi kami langsung via WhatsApp.", "error", waLink);
  } finally {
    btn.disabled = false;
    btn.textContent = "Kirim Pesan →";
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ===== OMAILER SENDER ===== */
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeWaNumber(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

async function sendContactEmail({ nama, institusi, email, telepon, pesan }) {
  const cfg = window.OMAILER_CONFIG;
  if (!cfg || !cfg.endpoint || !cfg.authEmail || !cfg.authPassword) {
    throw new Error("OMAILER_CONFIG tidak lengkap. Pastikan config.js ter-load dan terisi.");
  }

  const subject = `Pesan Baru dari ${nama} — ${institusi}`;
  const wa = normalizeWaNumber(telepon);

  const safe = {
    nama: escapeHtml(nama),
    institusi: escapeHtml(institusi),
    email: escapeHtml(email),
    telepon: escapeHtml(telepon || "-"),
    pesan: escapeHtml(pesan).replace(/\n/g, "<br>"),
  };

  const replySubject = encodeURIComponent("Re: " + subject);
  const body_html = `<!doctype html>
<html lang="id">
<meta charset="utf-8">
<body style="font-family:Arial,sans-serif;margin:16px;color:#111">
  <h3 style="margin:0 0 12px">Informasi Kontak Baru dari Website PT Panca Jaya Alkesindo</h3>
  <p style="margin:0 0 12px;line-height:1.6">
    <b>Nama:</b> ${safe.nama}<br>
    <b>Institusi:</b> ${safe.institusi}<br>
    <b>Email:</b> ${safe.email}<br>
    <b>WA / Telp:</b> ${safe.telepon}
  </p>
  <p style="margin:0 0 12px;line-height:1.6"><b>Pesan:</b><br>${safe.pesan}</p>
  <p style="margin:0">
    <a href="mailto:${encodeURIComponent(email)}?subject=${replySubject}">Balas Email</a>
    ${wa ? `&nbsp;|&nbsp;<a href="https://wa.me/${wa}">WhatsApp</a>` : ""}
  </p>
</body>
</html>`;

  const payload = {
    smtp_host: cfg.smtpHost,
    smtp_port: Number(cfg.smtpPort),
    auth_email: cfg.authEmail,
    auth_password: cfg.authPassword,
    sender_name: cfg.senderName,
    recipient: cfg.recipient,
    subject,
    body_html,
  };

  const encoded = encodeURIComponent(JSON.stringify(payload));
  const response = await fetch(`${cfg.endpoint}?data=${encoded}`);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Omailer error ${response.status}`);
  }
}

function showFormMessage(text, type, waLink = null) {
  const existing = form.querySelector(".form-msg");
  if (existing) existing.remove();

  const msg = document.createElement("div");
  msg.className = "form-msg";
  msg.setAttribute("role", "alert");

  const styles = {
    success: { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
    error: { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
  };
  const s = styles[type] || styles.error;

  msg.style.cssText = `
    background:${s.bg}; color:${s.color}; border:1.5px solid ${s.border};
    border-radius:10px; padding:14px 18px; margin-top:16px;
    font-size:0.88rem; line-height:1.55; white-space:pre-line;
  `;
  msg.textContent = text;

  if (waLink) {
    const waBtn = document.createElement("a");
    waBtn.href = waLink;
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.textContent = "💬 Chat via WhatsApp";
    waBtn.style.cssText = `
      display:inline-block; margin-top:10px; padding:8px 16px;
      background:#25D366; color:#fff; border-radius:8px;
      font-family:'Syne',sans-serif; font-weight:700; font-size:0.82rem;
      text-decoration:none;
    `;
    msg.appendChild(document.createElement("br"));
    msg.appendChild(waBtn);
  }

  form.appendChild(msg);

  // Auto-remove after 10s
  setTimeout(() => {
    if (msg.parentNode) msg.remove();
  }, 10000);
}

/* ===== FOOTER YEAR ===== */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== LAYANAN CARD: stagger on scroll ===== */
const layananCards = document.querySelectorAll(".layanan-card");
layananCards.forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

/* ===== LEGALITAS CARD: stagger on scroll ===== */
const legalCards = document.querySelectorAll(".legalitas-card");
legalCards.forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

/* ===== WHATSAPP FLOATING BUTTON ===== */
const waFloat = document.getElementById("waFloat");
if (waFloat) {
  const waNumber = "628132177334";
  const waMessage = encodeURIComponent("Halo PT Panca Jaya Alkesindo,\n\nSaya tertarik dengan produk alat artroskopi Anda. Bisakah saya mendapatkan informasi lebih lanjut?\n\nTerima kasih.");
  waFloat.href = `https://wa.me/${waNumber}?text=${waMessage}`;
}
