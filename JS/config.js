/**
 * SHINE DESIGN AI 3D - Configuration
 * API Key NEVER hardcoded. On Vercel → uses /api/chat (server-side env).
 * Local fallback → LocalStorage key via Settings UI.
 */

const CONFIG = {
  APP_NAME: 'SHINE DESIGN AI 3D',
  VERSION: '1.1.0',

  // Use serverless proxy on Vercel / production
  // Falls back to direct Groq only if user sets key in UI (local/dev)
  USE_PROXY: true,
  PROXY_URL: '/api/chat',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  DEFAULT_MODEL: 'llama-3.3-70b-versatile',

  STORAGE_KEYS: {
    API_KEY: 'shine_groq_api_key',
    MODEL: 'shine_groq_model',
    CHATS: 'shine_chats',
    PROJECTS: 'shine_projects',
    STATS: 'shine_stats',
    THEME: 'shine_theme',
    SETTINGS: 'shine_settings'
  },

  SYSTEM_PROMPTS: {
    default: `You are SHINE AI, an expert design assistant inside SHINE DESIGN AI 3D studio. 
You help users create professional designs: logos, posters, UI/UX, 3D concepts, mockups, packaging, architecture, characters, and more.
You understand long detailed prompts. Always respond in a helpful, professional, creative manner.
When asked to generate design concepts, provide rich detailed descriptions suitable for AI image generators (Midjourney, Flux, Stable Diffusion style).
Include style, lighting, composition, colors, camera, quality keywords.
You can also generate negative prompts, optimize prompts, suggest colors, fonts, layouts, branding advice.
Respond in the same language the user uses (Indonesian or English).
Be concise but comprehensive.`,

    enhance: `You are a professional prompt engineer. Optimize and enhance the user's design prompt.
Make it more detailed, professional, and effective for AI image/3D generators.
Add style, lighting, composition, quality, camera angle, mood when missing.
Keep the original intent. Output ONLY the enhanced prompt, nothing else.`,

    negative: `Generate a comprehensive negative prompt for the following design request.
Include common unwanted artifacts: blurry, low quality, distorted, watermark, text errors, bad anatomy, etc.
Output ONLY the negative prompt string, comma separated.`,

    designConcept: `You are a senior design director. Based on the user's request, create a complete design concept description.
Structure your response with:
1. Concept Summary
2. Visual Style & Aesthetic
3. Color Palette (with hex if possible)
4. Typography suggestions
5. Composition & Layout
6. Detailed AI Image Prompt (ready to copy)
7. Negative Prompt
8. Suggested variations
Be creative and professional.`
  },

  TEMPLATES: [
    { id: 1, title: 'Modern Cafe Logo', category: 'food', color: '#00f0ff' },
    { id: 2, title: 'Gaming YouTube Thumb', category: 'gaming', color: '#a855f7' },
    { id: 3, title: 'Tech Startup Landing', category: 'tech', color: '#38bdf8' },
    { id: 4, title: 'Fashion Lookbook', category: 'fashion', color: '#ec4899' },
    { id: 5, title: 'Wedding Invitation', category: 'wedding', color: '#f472b6' },
    { id: 6, title: 'Real Estate Flyer', category: 'realestate', color: '#34d399' },
    { id: 7, title: 'Education Course Card', category: 'education', color: '#fbbf24' },
    { id: 8, title: 'Business Card Minimal', category: 'business', color: '#60a5fa' },
    { id: 9, title: 'Food Menu Board', category: 'food', color: '#fb923c' },
    { id: 10, title: 'App UI Dashboard', category: 'tech', color: '#818cf8' },
    { id: 11, title: 'Podcast Cover Art', category: 'business', color: '#c084fc' },
    { id: 12, title: 'Event Poster Neon', category: 'gaming', color: '#22d3ee' },
    { id: 13, title: 'Product Packaging', category: 'fashion', color: '#f9a8d4' },
    { id: 14, title: 'Instagram Story Pack', category: 'fashion', color: '#a78bfa' },
    { id: 15, title: 'Corporate Presentation', category: 'business', color: '#67e8f9' },
    { id: 16, title: '3D Product Showcase', category: 'tech', color: '#4ade80' },
    { id: 17, title: 'Character Mascot', category: 'gaming', color: '#f87171' },
    { id: 18, title: 'Interior Moodboard', category: 'realestate', color: '#a3e635' },
    { id: 19, title: 'Certificate Award', category: 'education', color: '#fcd34d' },
    { id: 20, title: 'LinkedIn Banner', category: 'business', color: '#38bdf8' }
  ]
};

function getApiKey() {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY) || '';
}

function getModel() {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.MODEL) || CONFIG.DEFAULT_MODEL;
}

/**
 * On Vercel production we use the serverless proxy (no client key needed).
 * Locally / if proxy fails, fall back to LocalStorage key.
 */
function isApiConfigured() {
  // Always prefer proxy on deployed sites
  if (CONFIG.USE_PROXY && (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')) {
    return true;
  }
  const key = getApiKey();
  return key && key.startsWith('gsk_') && key.length > 20;
}
