# SHINE DESIGN AI 3D

Professional AI Design Studio — 2D, 3D, Logo, UI/UX, Mockup & more.  
Powered by **Groq** (secure server-side proxy on Vercel).

---

## 🚀 Deploy ke GitHub → Vercel (Rekomendasi)

### 1. Push ke GitHub
```bash
# Extract ZIP, lalu di folder project:
git init
git add .
git commit -m "SHINE DESIGN AI 3D - initial"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 2. Import ke Vercel
1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repository GitHub kamu
3. **Framework Preset:** Other / No Framework
4. **Root Directory:** `.` (biarkan)
5. **Build Command:** biarkan kosong
6. **Output Directory:** biarkan kosong / `.`

### 3. Set Environment Variable (WAJIB)
1. Project Settings → **Environment Variables**
2. Tambah:
   - **Name:** `GROQ_API_KEY`
   - **Value:** `gsk_...` (key dari [console.groq.com](https://console.groq.com))
   - Environment: Production + Preview + Development
3. **Redeploy** project

API key **aman** di server Vercel. Tidak pernah muncul di browser / source code.

---

## 🔑 API Key — Jangan pernah commit ke Git!

- File `.env` sudah di-ignore (lihat `.gitignore`)
- Production: pakai Vercel Environment Variable
- Local testing: bisa isi key lewat UI (ikon Key) → tersimpan di LocalStorage browser saja

**Jika kamu pernah memposting key di chat/public → segera regenerate di console.groq.com!**

---

## Fitur

- AI Chat (streaming) + history + export
- Prompt Enhance / Optimize / Negative Generator
- Text to Design (konsep profesional lengkap)
- 3D Workspace interaktif (Three.js)
- Templates, Image Tools, PWA, Responsive

---

## Struktur

```
├── api/chat.js          ← Vercel serverless proxy (key aman di sini)
├── index.html
├── css/styles.css
├── js/
│   ├── config.js
│   ├── ai.js            ← otomatis pakai /api/chat di production
│   ├── app.js
│   ├── three-*.js
│   └── storage.js
├── vercel.json
├── .gitignore
└── README.md
```

---

## Local Development

Buka `index.html` langsung, atau:

```bash
npx serve .
```

Untuk test proxy lokal, install Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

---

MIT License · SHINE DESIGN AI 3D
