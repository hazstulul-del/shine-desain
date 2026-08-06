/**
 * Interactive 3D Workspace
 */
const Viewport3D = {
  scene: null, camera: null, renderer: null, controls: null,
  objects: [], selected: null, gridHelper: null, axesHelper: null,
  ambientLight: null, dirLight: null, wireframeMode: false, initialized: false,

  init() {
    const canvas = document.getElementById('viewport-3d');
    if (!canvas || typeof THREE === 'undefined') return;
    if (this.initialized) { this.onResize(); return; }

    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a12);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(5, 4, 7);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 2;
      this.controls.maxDistance = 50;
    }

    this.ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(5, 10, 7);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    const fill = new THREE.DirectionalLight(0x6080ff, 0.3);
    fill.position.set(-5, 3, -5);
    this.scene.add(fill);

    this.gridHelper = new THREE.GridHelper(20, 20, 0x00f0ff, 0x1a1a2e);
    this.gridHelper.material.opacity = 0.4;
    this.gridHelper.material.transparent = true;
    this.scene.add(this.gridHelper);

    this.axesHelper = new THREE.AxesHelper(3);
    this.scene.add(this.axesHelper);

    this.addCube();
    this.addSphere(-2.5, 0.8, 0);
    this.addTorus(2.5, 0.6, 0);

    this.initialized = true;
    this.animate();
    this.updateObjectList();
    window.addEventListener('resize', () => this.onResize());
  },

  animate() {
    if (!this.initialized) return;
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },

  onResize() {
    if (!this.renderer) return;
    const canvas = document.getElementById('viewport-3d');
    const container = canvas.parentElement;
    const w = container.clientWidth, h = container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  },

  createMaterial(color = 0x00f0ff) {
    return new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.3 });
  },

  addCube(x = 0, y = 1, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), this.createMaterial(0x00f0ff));
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { name: `Cube_${this.objects.length + 1}`, type: 'cube' };
    this.scene.add(mesh); this.objects.push(mesh); this.select(mesh); this.updateObjectList();
    return mesh;
  },

  addSphere(x = 0, y = 1, z = 0) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), this.createMaterial(0xa855f7));
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { name: `Sphere_${this.objects.length + 1}`, type: 'sphere' };
    this.scene.add(mesh); this.objects.push(mesh); this.select(mesh); this.updateObjectList();
    return mesh;
  },

  addTorus(x = 0, y = 1, z = 0) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.3, 16, 48), this.createMaterial(0x22d3ee));
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { name: `Torus_${this.objects.length + 1}`, type: 'torus' };
    this.scene.add(mesh); this.objects.push(mesh); this.select(mesh); this.updateObjectList();
    return mesh;
  },

  select(obj) {
    this.selected = obj;
    if (obj) {
      const el = (id) => document.getElementById(id);
      if (el('pos-x')) el('pos-x').value = obj.position.x.toFixed(2);
      if (el('pos-y')) el('pos-y').value = obj.position.y.toFixed(2);
      if (el('pos-z')) el('pos-z').value = obj.position.z.toFixed(2);
      if (el('mat-color')) el('mat-color').value = '#' + obj.material.color.getHexString();
      if (el('mat-metalness')) el('mat-metalness').value = obj.material.metalness;
      if (el('mat-roughness')) el('mat-roughness').value = obj.material.roughness;
    }
    this.updateObjectList();
  },

  updateObjectList() {
    const list = document.getElementById('object-list');
    if (!list) return;
    list.innerHTML = this.objects.map((obj, i) => `
      <button class="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors ${this.selected === obj ? 'bg-shine-neon/15 text-shine-neon' : 'text-gray-300'}" data-idx="${i}">
        ${obj.userData.name}
      </button>`).join('');
    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => this.select(this.objects[parseInt(btn.dataset.idx)]));
    });
  },

  resetScene() {
    this.objects.forEach(o => this.scene.remove(o));
    this.objects = []; this.selected = null;
    this.addCube(); this.addSphere(-2.5, 0.8, 0); this.addTorus(2.5, 0.6, 0);
  },

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    this.objects.forEach(o => { o.material.wireframe = this.wireframeMode; });
  },

  toggleGrid() { if (this.gridHelper) this.gridHelper.visible = !this.gridHelper.visible; },
  toggleAxes() { if (this.axesHelper) this.axesHelper.visible = !this.axesHelper.visible; },

  applyMaterial() {
    if (!this.selected) return;
    this.selected.material.color.set(document.getElementById('mat-color').value);
    this.selected.material.metalness = parseFloat(document.getElementById('mat-metalness').value);
    this.selected.material.roughness = parseFloat(document.getElementById('mat-roughness').value);
  },

  applyTransform() {
    if (!this.selected) return;
    this.selected.position.x = parseFloat(document.getElementById('pos-x').value) || 0;
    this.selected.position.y = parseFloat(document.getElementById('pos-y').value) || 0;
    this.selected.position.z = parseFloat(document.getElementById('pos-z').value) || 0;
  },

  updateLights() {
    if (this.ambientLight) this.ambientLight.intensity = parseFloat(document.getElementById('light-ambient').value);
    if (this.dirLight) this.dirLight.intensity = parseFloat(document.getElementById('light-dir').value);
  }
};
