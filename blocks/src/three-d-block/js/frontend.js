import initThree from '../libs/asset.mjs';
import '@fortawesome/fontawesome-free/css/all.min.css';

function bootBlock(el) {
  if (!el) return;

  const

    baseUrl = el.getAttribute('data-gltf-path')|| '',

    entryFile = el.getAttribute('data-entry-file') || '',

    dracoPath = el.getAttribute('data-draco-path') || '',

    instance = initThree({ // initThree returns an instance with loadModel and cleanup
      block:      el,
      gltfPath:   baseUrl,
      entryFile:  entryFile,
      dracoPath:  dracoPath
    })
  ;

  // if initThree returned an object with loadModel
  if (instance && typeof instance.loadModel === 'function') {
    instance.loadModel(baseUrl, entryFile).catch((err) => {
      console.error('three-d-block frontend load failed for', baseUrl, entryFile, err);
    });

    // keep instance on element so we can clean up if needed
    el.__threeInstance = instance;
  } else if (typeof instance === 'function') {
    // older initThree style that returned a cleanup func; call it then use other APIs
    console.warn('initThree returned cleanup function — please adapt to instance API for frontend usage');
  }
}

// Run once DOM is ready
function bootAll() {
  document.querySelectorAll('.threejs-container').forEach((el) => {
    // only boot blocks that have a data-gltfpath (optional)
    // If you want placeholder view even without url, boot all
    bootBlock(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAll);
} else {
  bootAll();
}

// optional: cleanup on page unload
window.addEventListener('beforeunload', () => {
  document.querySelectorAll('.threejs-container').forEach((el) => {
    const inst = el.__threeInstance;
    if (inst && typeof inst.cleanup === 'function') inst.cleanup();
  });
});