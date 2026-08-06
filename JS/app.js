/**
 * SHINE DESIGN AI 3D - Main Application
 */
const App = {
  currentView: 'dashboard',
  currentChatId: null,
  isStreaming: false,

  init() {
    this.bindEvents();
    this.loadStats();
    this.renderTemplates();
    this.renderChatHistory();
    this.updateApiStatus();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof gsap !== 'undefined') {
      gsap.from('header', { y: -20, opacity: 0, duration: 0.5 });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    console.log('%c SHINE DESIGN AI 3D v1.1 ', 'background: linear-gradient(90deg,#00f0ff,#a855f7); color:#000; font-weight:bold; padding:4px 8px;');
  },

  bindEvents() {
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (el.dataset.view) this.switchView(el.dataset.view);
      });
    });

    document.getElementById('btn-toggle-sidebar')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.toggle('hidden');
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.add('hidden');
    });

    document.getElementById('btn-api-settings')?.addEventListener('click', () => this.openApiModal());
    document.getElementById('btn-close-api')?.addEventListener('click', () => this.closeApiModal());
    document.getElementById('modal-api-overlay')?.addEventListener('click', () => this.closeApiModal());
    document.getElementById('btn-save-api')?.addEventListener('click', () => this.saveApiKey());
    document.getElementById('btn-test-api')?.addEventListener('click', () => this.testApi());

    document.getElementById('btn-send-chat')?.addEventListener('click', () => this.sendChat());
    document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendChat(); }
    });
    document.getElementById('btn-new-chat')?.addEventListener('click', () => this.newChat());
    document.getElementById('btn-enhance-prompt')?.addEventListener('click', () => this.enhanceCurrentPrompt());
    document.getElementById('btn-export-chat')?.addEventListener('click', () => this.exportChat());

    document.getElementById('btn-generate-design')?.addEventListener('click', () => this.generateDesign());
    document.getElementById('btn-optimize-prompt')?.addEventListener('click', () => this.optimizeDesignPrompt());
    document.getElementById('btn-auto-negative')?.addEventListener('click', () => this.autoNegative());

    document.getElementById('btn-add-cube')?.addEventListener('click', () => Viewport3D.addCube());
    document.getElementById('btn-add-sphere')?.addEventListener('click', () => Viewport3D.addSphere());
    document.getElementById('btn-add-torus')?.addEventListener('click', () => Viewport3D.addTorus());
    document.getElementById('btn-reset-scene')?.addEventListener('click', () => Viewport3D.resetScene());
    document.getElementById('btn-wireframe')?.addEventListener('click', () => Viewport3D.toggleWireframe());
    document.getElementById('btn-grid')?.addEventListener('click', () => Viewport3D.toggleGrid());
    document.getElementById('btn-axes')?.addEventListener('click', () => Viewport3D.toggleAxes());

    ['mat-color','mat-metalness','mat-roughness'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => Viewport3D.applyMaterial());
    });
    ['pos-x','pos-y','pos-z'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => Viewport3D.applyTransform());
    });
    ['light-ambient','light-dir'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => Viewport3D.updateLights());
    });

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('image-upload');
    dropZone?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
      if (e.target.files[0]) this.handleImageUpload(e.target.files[0]);
    });
    document.querySelectorAll('.img-tool').forEach(btn => {
      btn.addEventListener('click', () => this.toast('Image tools need external APIs (demo mode)'));
    });

    document.getElementById('fab')?.addEventListener('click', () => this.switchView('design'));
  },

  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    const target = document.getElementById(`view-${view}`);
    if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
    document.querySelectorAll('.nav-tab, .sidebar-item, .dock-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
    if (view === 'workspace3d') setTimeout(() => Viewport3D.init(), 50);
    document.getElementById('sidebar')?.classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay')?.classList.add('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  openApiModal() {
    const m = document.getElementById('modal-api');
    m.classList.remove('hidden'); m.classList.add('flex');
    document.getElementById('api-key-input').value = getApiKey();
    document.getElementById('api-model').value = getModel();
  },
  closeApiModal() {
    const m = document.getElementById('modal-api');
    m.classList.add('hidden'); m.classList.remove('flex');
  },
  saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    const model = document.getElementById('api-model').value;
    localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, key);
    localStorage.setItem(CONFIG.STORAGE_KEYS.MODEL, model);
    this.updateApiStatus();
    this.closeApiModal();
    this.toast(key ? 'Local key saved' : 'Key cleared');
  },
  async testApi() {
    const el = document.getElementById('api-test-result');
    el.textContent = 'Testing...'; el.className = 'text-xs mt-3 text-center text-yellow-400';
    try {
      const key = document.getElementById('api-key-input').value.trim();
      if (key) localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, key);
      const ok = await AI.testConnection();
      el.textContent = ok ? '✅ Connection OK' : '⚠️ Unexpected response';
      el.className = 'text-xs mt-3 text-center text-green-400';
    } catch (e) {
      el.textContent = '❌ ' + e.message;
      el.className = 'text-xs mt-3 text-center text-red-400';
    }
  },
  updateApiStatus() {
    const s = document.getElementById('api-status');
    if (s) s.className = 'absolute top-1 right-1 w-2 h-2 rounded-full ' + (isApiConfigured() ? 'bg-green-400' : 'bg-red-500');
  },

  newChat() {
    this.currentChatId = null;
    AI.conversationHistory = [];
    document.getElementById('current-chat-title').textContent = 'New Conversation';
    document.getElementById('chat-messages').innerHTML = `
      <div class="flex gap-3 max-w-3xl mx-auto fade-in">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-shine-neon to-shine-purple flex items-center justify-center shrink-0"><i data-lucide="sparkles" class="w-4 h-4"></i></div>
        <div class="glass-card rounded-2xl rounded-tl-sm p-4 text-sm"><p class="font-medium text-shine-neon mb-1">SHINE AI</p><p>Siap membantu. Tulis prompt atau tanya apa saja.</p></div>
      </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  async sendChat() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || this.isStreaming) return;
    if (!isApiConfigured()) { this.toast('API belum ready. Set GROQ_API_KEY di Vercel atau local key.'); this.openApiModal(); return; }

    input.value = '';
    this.appendMessage('user', text);
    AI.conversationHistory.push({ role: 'user', content: text });
    const aiId = 'ai-' + Date.now();
    this.appendMessage('ai', '', aiId);
    this.isStreaming = true;

    try {
      const content = await AI.chat(AI.conversationHistory, {
        stream: true,
        onChunk: (delta, full) => {
          const el = document.querySelector(`#${aiId} .chat-content`);
          if (el) {
            el.innerHTML = marked.parse(full);
            el.classList.add('streaming-cursor');
            document.getElementById('chat-messages').scrollTop = 99999;
            el.querySelectorAll('pre code').forEach(b => { if (typeof hljs !== 'undefined') hljs.highlightElement(b); });
          }
        }
      });
      const el = document.querySelector(`#${aiId} .chat-content`);
      if (el) {
        el.innerHTML = marked.parse(content);
        el.classList.remove('streaming-cursor');
        el.querySelectorAll('pre code').forEach(b => { if (typeof hljs !== 'undefined') hljs.highlightElement(b); });
      }
      AI.conversationHistory.push({ role: 'assistant', content });
      this.saveCurrentChat(text);
      Storage.incrementStat('generations');
      this.loadStats();
    } catch (e) {
      const el = document.querySelector(`#${aiId} .chat-content`);
      if (el) el.innerHTML = `<span class="text-red-400">Error: ${e.message}</span>`;
    }
    this.isStreaming = false;
  },

  appendMessage(role, content, id = null) {
    const container = document.getElementById('chat-messages');
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `flex gap-3 max-w-3xl mx-auto fade-in ${isUser ? 'flex-row-reverse' : ''}`;
    if (id) div.id = id;
    div.innerHTML = `
      <div class="w-8 h-8 rounded-xl ${isUser ? 'bg-gradient-to-br from-shine-purple to-shine-pink' : 'bg-gradient-to-br from-shine-neon to-shine-purple'} flex items-center justify-center shrink-0">
        <i data-lucide="${isUser ? 'user' : 'sparkles'}" class="w-4 h-4"></i>
      </div>
      <div class="${isUser ? 'chat-user' : 'chat-ai'} rounded-2xl ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'} p-4 text-sm max-w-[85%]">
        ${!isUser ? '<p class="font-medium text-shine-neon mb-1">SHINE AI</p>' : ''}
        <div class="chat-content">${content ? marked.parse(content) : '<span class="spinner inline-block"></span>'}</div>
      </div>`;
    container.appendChild(div);
    container.scrollTop = 99999;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  saveCurrentChat(firstMsg) {
    const id = this.currentChatId || 'chat_' + Date.now();
    this.currentChatId = id;
    const title = firstMsg.slice(0, 40) + (firstMsg.length > 40 ? '...' : '');
    document.getElementById('current-chat-title').textContent = title;
    Storage.saveChat({ id, title, messages: [...AI.conversationHistory], updatedAt: Date.now() });
    this.renderChatHistory();
  },

  renderChatHistory() {
    const list = document.getElementById('chat-history-list');
    if (!list) return;
    const chats = Storage.getChats();
    if (!chats.length) { list.innerHTML = '<p class="text-xs text-gray-500 px-2 py-3">No conversations yet</p>'; return; }
    list.innerHTML = chats.map(c => `
      <button class="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 truncate ${c.id === this.currentChatId ? 'bg-white/10 text-shine-neon' : 'text-gray-400'}" data-chat-id="${c.id}">${c.title}</button>
    `).join('');
    list.querySelectorAll('[data-chat-id]').forEach(btn => {
      btn.addEventListener('click', () => this.loadChat(btn.dataset.chatId));
    });
  },

  loadChat(id) {
    const chat = Storage.getChats().find(c => c.id === id);
    if (!chat) return;
    this.currentChatId = id;
    AI.conversationHistory = [...chat.messages];
    document.getElementById('current-chat-title').textContent = chat.title;
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    chat.messages.forEach(m => {
      if (m.role === 'user' || m.role === 'assistant') this.appendMessage(m.role === 'user' ? 'user' : 'ai', m.content);
    });
    this.renderChatHistory();
  },

  async enhanceCurrentPrompt() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return this.toast('Ketik prompt dulu');
    if (!isApiConfigured()) return this.openApiModal();
    this.toast('Enhancing...');
    try {
      input.value = (await AI.enhancePrompt(text)).trim();
      this.toast('Prompt enhanced!');
    } catch (e) { this.toast(e.message); }
  },

  exportChat() {
    if (!AI.conversationHistory.length) return this.toast('No messages');
    const text = AI.conversationHistory.map(m => `**${m.role.toUpperCase()}**\n${m.content}`).join('\n\n---\n\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    a.download = `shine-chat-${Date.now()}.md`;
    a.click();
    Storage.incrementStat('exports');
    this.loadStats();
    this.toast('Exported!');
  },

  async generateDesign() {
    const prompt = document.getElementById('design-prompt').value.trim();
    if (!prompt) return this.toast('Masukkan prompt');
    if (!isApiConfigured()) return this.openApiModal();
    const type = document.getElementById('design-type').value;
    const style = document.getElementById('design-style').value;
    const quality = document.getElementById('design-quality').value;
    const negative = document.getElementById('design-negative').value;
    const full = `${prompt}\nStyle: ${style}\nQuality: ${quality}${negative ? '\nNegative: ' + negative : ''}`;

    const resultEl = document.getElementById('design-result');
    resultEl.innerHTML = `
      <div class="w-full max-w-2xl mx-auto">
        <div class="design-preview p-6 rounded-2xl mb-4 min-h-[160px] flex items-center justify-center">
          <div class="text-center"><div class="spinner mx-auto mb-3" style="width:32px;height:32px;border-width:3px"></div><p class="text-sm text-gray-400">Generating...</p></div>
        </div>
        <div id="design-concept-output" class="glass-card rounded-2xl p-5 text-sm"><span class="spinner inline-block"></span></div>
      </div>`;

    try {
      const content = await AI.generateDesignConcept(full, type);
      document.getElementById('design-concept-output').innerHTML = marked.parse(content);
      document.getElementById('design-concept-output').querySelectorAll('pre code').forEach(b => { if (typeof hljs !== 'undefined') hljs.highlightElement(b); });
      resultEl.querySelector('.design-preview').innerHTML = `
        <div class="w-full h-40 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex flex-col items-center justify-center">
          <i data-lucide="sparkles" class="w-10 h-10 text-white/70 mb-2"></i>
          <p class="text-xs text-white/60 px-4 text-center">${prompt.slice(0,50)}</p>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      Storage.incrementStat('generations');
      Storage.incrementStat('projects');
      this.loadStats();
      Storage.saveProject({ id: 'proj_'+Date.now(), title: prompt.slice(0,50), type, prompt: full, result: content, createdAt: Date.now() });
    } catch (e) {
      document.getElementById('design-concept-output').innerHTML = `<p class="text-red-400">Error: ${e.message}</p>`;
    }
  },

  async optimizeDesignPrompt() {
    const input = document.getElementById('design-prompt');
    if (!input.value.trim()) return this.toast('Masukkan prompt');
    if (!isApiConfigured()) return this.openApiModal();
    this.toast('Optimizing...');
    try { input.value = (await AI.enhancePrompt(input.value)).trim(); this.toast('Optimized!'); }
    catch (e) { this.toast(e.message); }
  },

  async autoNegative() {
    const prompt = document.getElementById('design-prompt').value.trim();
    if (!prompt) return this.toast('Masukkan prompt');
    if (!isApiConfigured()) return this.openApiModal();
    this.toast('Generating negative...');
    try {
      document.getElementById('design-negative').value = (await AI.generateNegative(prompt)).trim();
      this.toast('Negative ready!');
    } catch (e) { this.toast(e.message); }
  },

  renderTemplates() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;
    grid.innerHTML = CONFIG.TEMPLATES.map(t => `
      <div class="template-card glass-card rounded-xl cursor-pointer hover:scale-[1.03] transition-all" data-template="${t.id}">
        <div class="w-full h-full flex items-end p-3" style="background:linear-gradient(135deg,${t.color}33,${t.color}11)">
          <div><p class="text-xs font-semibold">${t.title}</p><p class="text-[10px] text-gray-400 capitalize">${t.category}</p></div>
        </div>
      </div>`).join('');
    grid.querySelectorAll('[data-template]').forEach(card => {
      card.addEventListener('click', () => {
        const t = CONFIG.TEMPLATES.find(x => x.id == card.dataset.template);
        this.switchView('design');
        setTimeout(() => {
          document.getElementById('design-prompt').value = `Buat desain berdasarkan template: ${t.title}. Style modern, high quality.`;
        }, 100);
      });
    });
  },

  loadStats() {
    const s = Storage.getStats();
    const el = (id,v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    el('stat-projects', s.projects); el('stat-gens', s.generations); el('stat-exports', s.exports);
  },

  handleImageUpload(file) {
    if (!file.type.startsWith('image/')) return this.toast('File harus gambar');
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('drop-zone').innerHTML = `<img src="${e.target.result}" class="max-h-40 mx-auto rounded-xl mb-2" /><p class="text-xs text-gray-400">${file.name}</p>`;
    };
    reader.readAsDataURL(file);
  },

  toast(msg) {
    const el = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!el || !msgEl) return;
    msgEl.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2800);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
