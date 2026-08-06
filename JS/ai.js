/**
 * SHINE DESIGN AI 3D - AI Integration
 * Uses Vercel /api/chat proxy (server-side key) or direct Groq (local key)
 */

const AI = {
  conversationHistory: [],
  currentChatId: null,

  /**
   * Detect whether we should use the serverless proxy
   */
  useProxy() {
    return CONFIG.USE_PROXY && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
  },

  /**
   * Call AI (proxy or direct)
   */
  async chat(messages, { stream = true, onChunk = null, systemPrompt = null } = {}) {
    const model = getModel();
    const finalMessages = [];

    if (systemPrompt || CONFIG.SYSTEM_PROMPTS.default) {
      finalMessages.push({
        role: 'system',
        content: systemPrompt || CONFIG.SYSTEM_PROMPTS.default
      });
    }
    finalMessages.push(...messages);

    const body = {
      model,
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 4096,
      stream
    };

    // --- PROXY MODE (Vercel production) ---
    if (this.useProxy()) {
      return this._chatViaProxy(body, stream, onChunk);
    }

    // --- DIRECT MODE (local / with user key) ---
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API Key belum di-set. Klik ikon Key di pojok kanan atas, atau set GROQ_API_KEY di Vercel Environment Variables.');
    }

    const response = await fetch(CONFIG.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    if (!stream) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }

    return this._handleStream(response, onChunk);
  },

  async _chatViaProxy(body, stream, onChunk) {
    const response = await fetch(CONFIG.PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Proxy error ${response.status}`);
    }

    if (!stream) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }

    return this._handleStream(response, onChunk);
  },

  async _handleStream(response, onChunk) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              if (onChunk) onChunk(delta, fullContent);
            }
          } catch (e) { /* ignore */ }
        }
      }
    }
    return fullContent;
  },

  async enhancePrompt(prompt) {
    return this.chat(
      [{ role: 'user', content: prompt }],
      { stream: false, systemPrompt: CONFIG.SYSTEM_PROMPTS.enhance }
    );
  },

  async generateNegative(prompt) {
    return this.chat(
      [{ role: 'user', content: prompt }],
      { stream: false, systemPrompt: CONFIG.SYSTEM_PROMPTS.negative }
    );
  },

  async generateDesignConcept(prompt, type = 'logo') {
    const userMsg = `Design type: ${type}\nUser request: ${prompt}\n\nCreate a complete professional design concept.`;
    return this.chat(
      [{ role: 'user', content: userMsg }],
      { stream: true, systemPrompt: CONFIG.SYSTEM_PROMPTS.designConcept }
    );
  },

  async testConnection() {
    try {
      const result = await this.chat(
        [{ role: 'user', content: 'Reply with exactly: OK' }],
        { stream: false }
      );
      return result.toLowerCase().includes('ok');
    } catch (e) {
      throw e;
    }
  }
};
