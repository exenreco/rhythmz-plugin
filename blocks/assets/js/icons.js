// --- Internal Storage ---
const iconRegistry = new Map(); // base icons
const iconCache = new Map(); // generated variants

// --- Helpers ---
function normalizeName(name = "") {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function createSVG(attrs = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");

  Object.entries(attrs).forEach(([key, val]) => {
    svg.setAttribute(key, val);
  });

  return svg;
}

function createElements(elements = {}) {
  const refs = {};
  const frag = document.createDocumentFragment();

  Object.entries(elements).forEach(([tagName, nodes]) => {
    nodes.forEach((nodeAttrs, index) => {
      const el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        tagName,
      );

      Object.entries(nodeAttrs).forEach(([k, v]) => {
        el.setAttribute(k, v);
      });

      const refKey = `${tagName}-${index}`;
      el.setAttribute("data-ref", refKey);
      refs[refKey] = el;

      frag.append(el);
    });
  });

  return [refs, frag];
}

// --- Variants ---
const variants = {
  thin: { "stroke-width": "1" },
  regular: { "stroke-width": "2" },
  solid: { "stroke-width": "3" },
  rounded: {
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  square: {
    "stroke-width": "2",
    "stroke-linecap": "butt",
    "stroke-linejoin": "miter",
  },
};

// --- API ---

export function registerIcon({
  name,
  keywords = [],
  svgAttrs = {},
  elements = {},
} = {}) {
  if (typeof name !== "string" || !name.trim()) {
    console.error("Invalid icon name");
    return;
  }

  const baseName = normalizeName(name);

  iconRegistry.set(baseName, {
    name: baseName,
    keywords,
    svgAttrs,
    elements,
  });
}

export function getIcon(name = "") {
  const normalized = normalizeName(name);

  // Return cached version if exists
  if (iconCache.has(normalized)) {
    return iconCache.get(normalized).cloneNode(true);
  }

  // Parse variant (e.g. "info-thin")
  const [baseName, variantName] = normalized.split(/-(?=[^-]+$)/);

  const baseIcon = iconRegistry.get(baseName);
  if (!baseIcon) return null;

  const variant = variants[variantName] || variants.regular;

  const svg = createSVG({
    stroke: "currentColor",
    ...variant,
    ...baseIcon.svgAttrs,
  });

  const [refs, frag] = createElements(baseIcon.elements);

  svg._ref = refs;
  svg.append(frag);

  // Cache it
  iconCache.set(normalized, svg);

  // Return a clone to avoid mutation side effects
  return svg.cloneNode(true);
}
