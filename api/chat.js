/**
 * Vercel Serverless Function — Groq Proxy
 * API Key stays server-side via process.env.GROQ_API_KEY
 * Never exposed to the browser.
 */

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GROQ_API_KEY belum di-set di Vercel Environment Variables. Buka Project Settings → Environment Variables.'
    });
  }

  try {
    const { messages, model = 'llama-3.3-70b-versatile', stream = true, temperature = 0.7, max_tokens = 4096 } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Groq error ${response.status}`
      });
    }

    // Streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      return res.end();
    }

    // Non-streaming
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
