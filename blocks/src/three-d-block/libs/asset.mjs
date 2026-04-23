import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


export default function initThree({ block, gltfPath = '', entryFile = 'scene.gltf', dracoPath = '', isEditor = false }) { 
  if (!block) return () => {};

  const API = {
    
    // Keep refs for cleanup / abort
    rafId: null,

    isDisposed: false,

    currentGltf: null,
    
    placeholder: null,

    currentModel: null,

    // normalize numeric helper
    _parseNumber: (n, fallback) => {
      const p = parseInt(n, 10);
      return Number.isFinite(p) ? p : fallback;
    },

    onInit: () => {},

    getNotificationEl: () => {
      const container = document.createElement('div');
      container.classList.add('__notice');
      return container;
    },

    createNotice: ( type = '', message = '', delay = 500 ) => {

      let  
      typeVal,
      timeoutValue  = API._parseNumber(delay, 500);

      if( ! type || typeof type !== 'string') typeVal = 'error';

      if( type !== 'error' && type !== 'warn' && type !== 'success' ) typeVal = 'error';
      else typeVal = type;

      if( ! message || typeof message !== 'string' )
        message  = 'Invalid request, message cannot be empty & must be of type string!'
      ;

      typeVal = typeVal.toLowerCase();

      const 
        notice    = document.createElement('div'),
        container = block.querySelector('.__notice')
      ;

      notice.classList.add('__message', `${typeVal}`);
      notice.setAttribute('data-msg', `${JSON.stringify(message)}`);
      notice.innerHTML = (() => `${message}`)();

      container.appendChild(notice);

      // delay before removing notice
      setTimeout(() => {
        container.removeChild(notice); // remove notice
      }, timeoutValue);

      return;
    },

    onReady: ( callback = null ) => document.body.addEventListener('DOMContentLoaded', (bodyEl) => {
      if( callback && typeof callback === 'function') callback(bodyEl);
    }),

    

    onBlockResize: (callback = null) => API.onReady((bodyEl) => {
      if( bodyEl && typeof bodyEl === 'object' ){
        if (!block || !block.isConnected) return;
        const w = Math.max(1, block.clientWidth);
        const h = Math.max(1, block.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);

        if( callback && typeof callback === 'function') callback(bodyEl);
      }
    }),

    createToolbar: () => {
      const controls = {
        expand: document.createElement('span'),
        reload: document.createElement('span'),
        wrapper: document.createElement('div'),
      };

      controls.expand.classList.add('actions', 'expand');
      controls.expand.setAttribute('title', 'Expand');
      controls.expand.innerHTML = (() => '<i class="fa-solid fa-expand"></i>')();
      
      controls.reload.classList.add('actions', 'reload');
      controls.reload.setAttribute('title', 'Reload');
      controls.reload.innerHTML = (() => '<i class="fa-solid fa-rotate-right"></i>')();

      controls.wrapper.classList.add('__3d_block', 'controls');
      controls.wrapper.appendChild(controls.expand);
      controls.wrapper.appendChild(controls.reload);

      // reload action
      controls.reload.addEventListener('click', () => {
        // simple reload — users of initThree can call loadModel directly if needed
        if (typeof API.onLoadModel === 'function') {
          API.onLoadModel(gltfPath, entryFile);
        }
      });

      return controls;
    },


    onCleanUp: () => {
      API.isDisposed = true;

      // stop RAF
      if (API.rafId) {
        cancelAnimationFrame(rafId);
        API.rafId = null;
      }

      // stop observing resize
      try {
        resizeObserver.disconnect();
      } catch (e) { /* ignore */ }

      // dispose model
      if (API.currentModel) {
        scene.remove(API.currentModel);
        disposeModel(API.currentModel);
        API.currentModel = null;
      }
      if (API.placeholder) {
        scene.remove(API.placeholder);
        disposeModel(API.placeholder);
        API.placeholder = null;
      }

      // dispose GLTF resources
      if (API.currentGltf) {
        // any caches or textures will be disposed above when traversed
        API.currentGltf = null;
      }

      // dispose draco loader if used
      if (dracoLoader) {
        try { dracoLoader.dispose && dracoLoader.dispose(); } catch (e) { /* ignore */ }
        dracoLoader = null;
      }

      // dispose controls
      try { orbitControls.dispose && orbitControls.dispose(); } catch (e) { /* ignore */ }

      // dispose renderer
      try {
        renderer.dispose && renderer.dispose();
        if (renderer.forceContextLoss) renderer.forceContextLoss();
      } catch (e) { /* ignore */ }

      // remove canvas and controls DOM elements safely
      try {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (controlsEl && controlsEl.wrapper && controlsEl.wrapper.parentNode) controlsEl.wrapper.parentNode.removeChild(controlsEl.wrapper);
      } catch (e) { /* ignore */ }

      // attempt to clear block if still in DOM
      try {
        if (block && block.isConnected) block.innerHTML = '';
      } catch (e) { /* ignore */ }
    },

    onDisposeModel: ( obj ) => {
      if (!obj) return;
      obj.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            const mat = child.material;
            // material may be an array
            if (Array.isArray(mat)) {
              mat.forEach((m) => {
                if (m.map) { m.map.dispose(); }
                if (m.normalMap) { m.normalMap.dispose(); }
                if (m.emissiveMap) { m.emissiveMap.dispose(); }
                m.dispose();
              });
            } else {
              if (mat.map) mat.map.dispose();
              if (mat.normalMap) mat.normalMap.dispose();
              if (mat.emissiveMap) mat.emissiveMap.dispose();
              mat.dispose();
            }
          }
        }
      });
    },

    proxyRemoteUrl: async (remoteUrl) => {
      // call your REST endpoint to fetch+cache remote file server-side
      try {
        const res = await wp.apiFetch({ // using wp.apiFetch (wp global) or apiFetch import
          path: `/rhythmz/v1/proxy?url=${encodeURIComponent(remoteUrl)}`,
          method: 'GET',
        });
        // expected { proxied_url: 'https://yoursite/wp-content/uploads/three-d-block/proxy-....glb' }
        return res && res.proxied_url ? res.proxied_url : null;
      } catch (err) {
        console.error('Proxy request failed', err);
        return null;
      }
    },

    handleLoadedGltf: (gltf) => {
      if (API.isDisposed) {
        if (gltf.scene) API.onDisposeModel(gltf.scene);
        throw new Error('Component disposed before load finished');
      }

      if (API.placeholder) {
        scene.remove(API.placeholder);
        API.onDisposeModel(API.placeholder);
        API.placeholder = null;
      }

      API.currentGltf = gltf;
      const modelRoot = gltf.scene || (gltf.scenes && gltf.scenes[0]) || null;
      if (!modelRoot) {
        if (block) API.createNotice('error', 'No scene in glTF', 2500);
        throw new Error('No scene in glTF');
      }

      // center/scale/recenter (your existing logic)
      const bbox = new THREE.Box3().setFromObject(modelRoot);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
      const desiredSize = 1.5;
      const scale = desiredSize / maxDim;
      modelRoot.scale.setScalar(scale);
      bbox.setFromObject(modelRoot);
      const center = bbox.getCenter(new THREE.Vector3());
      modelRoot.position.sub(center);

      scene.add(modelRoot);
      API.currentModel = modelRoot;
    },

    /**
     * Load model from base URL + entry filename.
     * Accepts absolute base URL (ending with /) or folder path. Uses URL to resolve.
     */
    onLoadModel: async (gltfBaseUrl = '', entryFilenameLocal = 'scene.gltf') => {
      // cleanup previous
      if (API.currentModel) {
        scene.remove(API.currentModel);
        API.onDisposeModel(API.currentModel);
        API.currentModel = null;
      }
      API.currentGltf = null;

      // Build candidate URLs to try (in order)
      const candidates = [];

      // If gltfBaseUrl already looks like a file (ends with .gltf/.glb) use it directly
      const isBaseAFile = /\.(gltf|glb)(\?.*)?$/i.test(gltfBaseUrl);
      if (isBaseAFile) {
        candidates.push(gltfBaseUrl);
      } else {
        // Try a few sensible joins
        try {
          // 1) new URL(entry, base) — handles absolute base or relative
          candidates.push(new URL(entryFilenameLocal, gltfBaseUrl || window.location.href).toString());
        } catch (e) {
          // fallback string concat attempts
          if (gltfBaseUrl) {
            candidates.push(gltfBaseUrl.replace(/\/$/, '') + '/' + entryFilenameLocal);
            candidates.push(gltfBaseUrl + entryFilenameLocal);
          } else {
            candidates.push(window.location.origin + '/' + entryFilenameLocal.replace(/^\//, ''));
          }
        }
        // 2) base as-is with trailing slash + entry
        if (gltfBaseUrl && !isBaseAFile) {
          const withSlash = gltfBaseUrl.replace(/\/$/, '') + '/';
          candidates.push(withSlash + entryFilenameLocal);
          candidates.push(withSlash + encodeURIComponent(entryFilenameLocal));
        }
        // 3) as a last resort just entryFilename at same origin root
        candidates.push(window.location.origin + '/' + entryFilenameLocal.replace(/^\//, ''));
      }

      // Remove duplicates while preserving order
      const seen = new Set();
      const candidateList = candidates.filter(u => {
        if (!u || seen.has(u)) return false;
        seen.add(u);
        return true;
      });

      if (block) API.createNotice('success', `Attempting to load model: ${entryFilenameLocal}`, 2000);

      // helper that actually tries loading with GLTFLoader
      const tryLoad = (urlToLoad) => {
        // very helpful console log so you can inspect requests in Network tab
        console.debug('[three-block] trying URL:', urlToLoad);
        return new Promise((resolve, reject) => {
          gltfLoader.load(
            urlToLoad,
            (gltf) => resolve({ gltf, url: urlToLoad }),
            (xhr) => {
              if (xhr && xhr.loaded && xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                if (block) API.createNotice('success', `Loading ${pct}%`, 600);
              }
            },
            (err) => reject({ error: err, url: urlToLoad })
          );
        });
      };

      // try each candidate sequentially
      for (let i = 0; i < candidateList.length; i++) {
        const url = candidateList[i];
        try {
          const result = await tryLoad(url);
          // success — use same code you had to attach model
          API.handleLoadedGltf(result.gltf);
          if (block) API.createNotice('success', `Model loaded from ${url}`, 2500);
          return result.gltf;
        } catch (failure) {
          console.warn('[three-block] load failed for', failure.url, failure.error);
          // If the loader error includes an XHR status, surface it
          const xhr = failure && failure.error && failure.error.target;
          if (xhr && typeof xhr.status === 'number') {
            console.warn('[three-block] XHR status', xhr.status, 'from', failure.url);
            if (xhr.status === 404) {
              if (block) API.createNotice('error', `File not found at ${failure.url} (404)`, 4000);
            } else if (xhr.status === 0) {
              // status 0 commonly indicates CORS or network error
              if (block) API.createNotice('warning', `Network/CORS error loading ${failure.url}`, 4000);
            } else {
              if (block) API.createNotice('error', `Load error ${xhr.status} from ${failure.url}`, 4000);
            }
          } else {
            // No XHR status available — likely CORS or parse error
            if (block) API.createNotice('warning', `Load failed for ${failure.url} — trying next candidate or proxy`, 2500);
          }
          // continue loop to try next candidate
        }
      }

      // If we reach here, none of the direct candidates worked. Try proxy fallback (if you implemented it)
      // If you don't want proxying, remove this block and only show the error.
      try {
        if (block) API.createNotice('warning', 'Direct load failed — attempting server proxy...', 2500);
        const proxied = await API.proxyRemoteUrl(candidateList[0] || (gltfBaseUrl || entryFilenameLocal));
        if (!proxied) {
          if (block) API.createNotice('error', 'Proxy failed or returned no URL', 4500);
          throw new Error('Proxy failed');
        }
        // try loading the proxied URL
        try {
          const proxRes = await tryLoad(proxied);
          API.handleLoadedGltf(proxRes.gltf);
          if (block) API.createNotice('success', `Model loaded via proxy (${proxied})`, 3000);
          return proxRes.gltf;
        } catch (errAfterProxy) {
          console.error('[three-block] load failed even after proxy', errAfterProxy);
          if (block) API.createNotice('error', 'Load failed after proxy', 4000);
          throw errAfterProxy;
        }
      } catch (proxyErr) {
        // final failure — report to user and console
        console.error('[three-block] final load failure', proxyErr);
        if (block) API.createNotice('error', 'All load attempts failed — check console and Network tab', 6000);
        throw new Error('All load attempts failed');
      }
    },

    onAnimate: () => {
      if (API.isDisposed) return;
      API.rafId = requestAnimationFrame(API.onAnimate);

      // Stop animating if block removed
      if (!block || !block.isConnected) return;

      if (API.placeholder) {
        API.placeholder.rotation.y += 0.01;
      }
      if (API.currentModel) {
        // optional animation if model present
        API.currentModel.rotation.y += 0.002;
      }

      orbitControls.update();
      renderer.render(scene, camera);
    },

    onAddPlaceholder: (topText = '3D', bottomText = 'Block') => {
      API.placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshNormalMaterial({ opacity: 0.6, transparent: true })
      );
      scene.add(API.placeholder);
    },
  };


  // --- prepare DOM ---
  block.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.classList.add('canvas');
  // ---listeners --
  canvas.addEventListener('pointerover', e => {
    let styles = e.target.getAttribute('style');
    e.target.setAttribute('style', `${styles} cursor: grab;`);
  });
  canvas.addEventListener('pointerup', e => {
    let styles = e.target.getAttribute('style');
    e.target.setAttribute('style', `${styles} cursor: grab;`);
  });
  canvas.addEventListener('pointerdown', e => {
    let styles = e.target.getAttribute('style');
    e.target.setAttribute('style', `${styles} cursor: grabbing;`);
  });
 
  block.appendChild(canvas);

  const noticeEl = API.getNotificationEl();
  block.appendChild(noticeEl);

  const controlsEl = API.createToolbar();
  block.appendChild(controlsEl.wrapper);


  


  


  // --- three.js setup ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(Math.max(1, block.clientWidth), Math.max(1, block.clientHeight), false);

  // basic scene content (a light + optional grid)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  // default camera position + orbit controls
  camera.position.set(0, 1.25, 3);
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;

  // placeholder object while model loads
  API.onAddPlaceholder();

  // --- loader setup ---
  const manager = new THREE.LoadingManager();
  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    if( block ) API.createNotice('success', 'Loading...', 2500);
    //if (controlsEl.status) controlsEl.status.innerText = 'Loading...';
  };
  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    if( block ) API.createNotice('success', `Loading ${itemsLoaded}/${itemsTotal}`, 2500);
    //if (controlsEl.status) controlsEl.status.innerText = `Loading ${itemsLoaded}/${itemsTotal}`;
  };
  manager.onLoad = function () {
    if( block ) API.createNotice('success', 'Loaded', 2500);
    //if (controlsEl.status) controlsEl.status.innerText = 'Loaded';
  };
  manager.onError = function (url) {
    if( block ) API.createNotice('success', 'Load error', 2500);
    //if (controlsEl.status) controlsEl.status.innerText = 'Load error';
    console.error('LoadingManager error loading:', url);
  };

  const gltfLoader = new GLTFLoader(manager);
  let dracoLoader = null;
  if (dracoPath) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoPath);
    gltfLoader.setDRACOLoader(dracoLoader);
  }

  

  // Utility to dispose a loaded model (deep)
  
  const resizeObserver = new ResizeObserver(API.onBlockResize);
  resizeObserver.observe(block);

  // --- animation loop ---
  API.rafId = requestAnimationFrame(API.onAnimate);

  // If a gltfPath was provided at init, try to load immediately
  if (gltfPath) {
    API.onLoadModel(gltfPath, entryFile).catch((err) => {
      // log but don't throw — editor should not crash
      console.warn('Could not load model on init:', err);
    });
  }

  // return object or function — we return an object with loadModel so callers can interact
  /*return {
    cleanup,
    loadModel, // consumer may call instance.loadModel(url, filename)
  };*/

  return API;
}