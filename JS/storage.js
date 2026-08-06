/**
 * Local Storage & IndexedDB helpers
 */

const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage set failed', e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  getStats() {
    return this.get(CONFIG.STORAGE_KEYS.STATS, {
      projects: 0,
      generations: 0,
      exports: 0
    });
  },

  incrementStat(key) {
    const stats = this.getStats();
    stats[key] = (stats[key] || 0) + 1;
    this.set(CONFIG.STORAGE_KEYS.STATS, stats);
    return stats;
  },

  getChats() {
    return this.get(CONFIG.STORAGE_KEYS.CHATS, []);
  },

  saveChat(chat) {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.id === chat.id);
    if (idx >= 0) chats[idx] = chat;
    else chats.unshift(chat);
    if (chats.length > 50) chats.length = 50;
    this.set(CONFIG.STORAGE_KEYS.CHATS, chats);
    return chats;
  },

  deleteChat(id) {
    let chats = this.getChats().filter(c => c.id !== id);
    this.set(CONFIG.STORAGE_KEYS.CHATS, chats);
    return chats;
  },

  getProjects() {
    return this.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
  },

  saveProject(project) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.unshift(project);
    if (projects.length > 30) projects.length = 30;
    this.set(CONFIG.STORAGE_KEYS.PROJECTS, projects);
    return projects;
  }
};

const IDB = {
  dbName: 'ShineDesignAI',
  version: 1,
  db: null,

  async open() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('designs')) db.createObjectStore('designs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' });
      };
      req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, data) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async get(storeName, id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
};
