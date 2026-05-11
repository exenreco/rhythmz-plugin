import { registerTemplate } from "../../../assets/js/popup.js";

const popup = registerTemplate();

// ================================
// DOM UTILITY
// ================================

const createMarkup = (tag = "div", props = {}, attrs = {}) => {
  const el = document.createElement(tag);
  Object.assign(el, props);

  Object.entries(attrs).forEach(([k, v]) => {
    el.setAttribute(k, v);
  });

  return el;
};

function resolvePath(root, path) {
  let node = root;
  for (let i = 0; i < path.length; i++) {
    node = node.childNodes[path[i]];
  }
  return node;
}

function createUpdater(sampleEl, key) {
  // We return a function that checks the tag of 'el' at runtime
  return (el, v) => {
    const tag = el.tagName;
    const isValid = v && String(v).trim().length > 0;

    // --- IMG Logic ---
    if (tag === "IMG") {
      if (key === "src") {
        if (isValid) {
          if (el.src !== v) el.src = v;
          el.style.display = "block";
        } else {
          el.style.display = "none";
          el.src = ""; // Clear src to prevent broken icon frames
        }
      } else if (key === "alt") {
        if (el.alt !== v) el.alt = v;
      }
    }

    // --- Placeholder DIV Logic ---
    else if (tag === "DIV" && key === "src") {
      // If src is valid, HIDE the placeholder. If invalid, SHOW it.
      el.style.display = isValid ? "none" : "block";
    }

    // --- Anchor Logic ---
    else if (tag === "A") {
      if (key === "href" || key === "permalink") {
        const href = v && String(v).trim().length > 0 ? v : "#";

        if (el.getAttribute("href") !== href) {
          el.setAttribute("href", href);
        }
      } else {
        const val = v == null ? "" : String(v);
        if (el.textContent !== val) el.textContent = val;
      }
    }

    // --- Default Text Logic ---
    else {
      const val = v == null ? "" : String(v);
      // If the key exists as a dataset binding,
      // ONLY sync dataset
      if (key in el.dataset) {
        if (el.dataset[key] !== val) {
          el.dataset[key] = val;
        }

        // IMPORTANT:
        // only use textContent if element
        // has no existing visible text
        // OR is intended as text binding
        const isTextBinding =
          el.childNodes.length === 0 ||
          el.textContent.trim() === "";

        if (!isTextBinding) return;
      }

      // Otherwise treat as text binding
      if (el.textContent !== val) {
        el.textContent = val;
      }
    }
  };
}

function compileTemplate(templateNode) {
  const bindings = {};
  const updaters = {};

  const walk = (node, path = []) => {
    if (node.nodeType !== 1) return;

    for (const key in node.dataset) {
      if (!bindings[key]) bindings[key] = [];
      bindings[key].push([...path]);

      // Generate updater ONCE per key
      if (!updaters[key]) {
        updaters[key] = createUpdater(node, key);
      }
    }

    node.childNodes.forEach((child, i) => {
      walk(child, [...path, i]);
    });
  };

  walk(templateNode);

  return {
    template: templateNode,
    bindings,
    updaters,
  };
}

/**
 * Creates the initial DOM element and returns a "record"
 * that will be stored in your nodeCache.
 */
function createNode(item, templates) {
  const compiled = templates.get(item.templateName) || templates.get("default");

  if (!compiled) {
    return {
      element: document.createElement("div"),
      bindings: {},
      updaters: {},
    };
  }

  const clone = compiled.template.cloneNode(true);

  clone.id = item.key;

  const bindings = {};

  Object.entries(compiled.bindings).forEach(([key, paths]) => {
    bindings[key] = paths.map((path) => resolvePath(clone, path));
  });

  return {
    element: clone,
    bindings,
    updaters: compiled.updaters,
    key: item.key,
  };
}

/**
 * Updates the existing DOM element with new data.
 */
function updateNode(record, item, changedKeys) {
  const keys = changedKeys?.size
    ? [...changedKeys]
    : Object.keys(record.bindings);

  keys.forEach((key) => {
    const value = item[key];
    if (value === undefined) return;

    const nodes = record.bindings[key];
    const update = record.updaters[key];

    if (!nodes || !update) return;

    for (let i = 0; i < nodes.length; i++) {
      update(nodes[i], value);
    }
  });
}

// ================================
// REACTIVE STATE ENGINE
// ================================

const createReactiveState = (initial = {}) => {
  const listeners = new Set();

  const state = new Proxy(initial, {
    set(target, key, value) {
      if (target[key] === value) return true;

      target[key] = value;

      listeners.forEach((fn) => fn({ key, value, state: target }));

      return true;
    },
  });

  return {
    state,

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
};

// ================================
// BLOG STORE
// ================================

const createBlogStore = (items = [], itemsPerPage = 12) => {
  const { state, subscribe } = createReactiveState({
    items,
    startingPage: 1,
    itemsPerPage,
  });

  return {
    state,
    subscribe,

    addItem(item) {
      state.items = [...state.items, item];
    },

    removeItem(key) {
      state.items = state.items.filter((i) => i.key !== key);
    },

    setPage(page) {
      state.startingPage = page;
    },
  };
};

// ================================
// TEMPLATE REGISTRY
// ================================

const createTemplateRegistry = () => {
  const templates = new Map();

  return {
    register(name, templateNode) {
      const compiled = compileTemplate(templateNode);
      templates.set(name, compiled);
    },

    get(name) {
      return templates.get(name);
    },
  };
};

// ================================
// PAGINATION CONTROLLER
// ================================

const createPagination = (store) => {
  const getTotalPages = () =>
    Math.ceil(store.state.items.length / store.state.itemsPerPage) || 1;

  const getPageItems = () => {
    const start = (store.state.startingPage - 1) * store.state.itemsPerPage;

    return store.state.items.slice(start, start + store.state.itemsPerPage);
  };

  return {
    getTotalPages,
    getPageItems,

    next() {
      if (store.state.startingPage < getTotalPages()) {
        store.state.startingPage++;
      }
    },

    prev() {
      if (store.state.startingPage > 1) {
        store.state.startingPage--;
      }
    },

    setPage(page) {
      store.state.startingPage = page;
    },
  };
};

// ================================
// DIFF RENDERER
// ================================

const createDiffRenderer = ({ wrapper, templates }) => {
  const nodeCache = new Map();

  const render = (items, changedKeys) => {
    const newKeys = new Set(items.map((i) => i.key));

    // REMOVE stale nodes
    nodeCache.forEach((record, key) => {
      if (!newKeys.has(key)) {
        record.element.remove();
        nodeCache.delete(key);
      }
    });

    let lastPlacedNode = null;
    let lastIndex = 0;

    items.forEach((item, i) => {
      let record = nodeCache.get(item.key);

      // CREATE
      if (!record) {
        record = createNode(item, templates);
        nodeCache.set(item.key, record);
      }

      // UPDATE (fine-grained)
      updateNode(record, item, changedKeys);

      const el = record.element;

      // INSERT if new
      if (!el.parentNode) {
        if (lastPlacedNode === null) {
          wrapper.prepend(el);
        } else {
          lastPlacedNode.after(el);
        }
      } else {
        // OPTIMAL MOVE CHECK (Vue-style)
        const currentIndex = Array.prototype.indexOf.call(wrapper.children, el);

        if (currentIndex < lastIndex) {
          wrapper.appendChild(el); // move only if needed
        } else {
          lastIndex = currentIndex;
        }
      }

      lastPlacedNode = el;
    });
  };

  return { render };
};

// ================================
// PAGINATION RENDERER
// ================================

const createPaginationRenderer = ({ store, pagination }) => {
  const wrapper = createMarkup("div");
  wrapper.classList.add("__pagination");

  
  const nav = createMarkup("nav", { className: "__page_numbers" });
  
  const prev = createMarkup(
    "button",
    {
      className: "__prev",
      innerHTML: "<i class='fa-solid fa-chevron-left'></i> Prev",
    },
    {
      role: "button",
      type: "button",
      title: "Previous",
      "aria-label": "Previous",
    },
  );

  const next = createMarkup(
    "button",
    {
      className: "__next",
      innerHTML: "Next <i class='fa-solid fa-chevron-right'></i>",
    },
    { role: "button", type: "button", title: "Next", "aria-label": "Next" },
  );

  // --- ATTACH LISTENERS ONCE (Outside of render) ---

  prev.addEventListener("click", () => pagination.prev());
  next.addEventListener("click", () => pagination.next());

  // Event delegation for page numbers
  nav.addEventListener("click", (e) => {
    // Robust check for the button or any element inside the button
    const btn = e.target.closest("button[data-page]");
    if (!btn) return;

    const page = Number(btn.dataset.page);
    if (!isNaN(page)) {
      pagination.setPage(page);
    }
  });

  const fragment = document.createDocumentFragment();
  fragment.append(prev, nav, next);
  wrapper.append(fragment);

  const render = () => {
    const total = pagination.getTotalPages();

    if (total <= 1) {
      wrapper.style.display = "none";
      return;
    } else {
      wrapper.style.display = "";
    }

    const navFragment = document.createDocumentFragment();

    for (let i = 1; i <= total; i++) {
      const isCurrentPage = i === store.state.startingPage;
      const btn = createMarkup(
        "button",
        {
          className: `__page_btn${isCurrentPage ? " active" : ""}`,
          textContent: i,
        },
        {
          "data-page": i,
          role: "button",
          type: "button",
          title: `Page ${i}`,
          "aria-label": `Page ${i}`,
          "aria-current": isCurrentPage ? "page" : "false", // Good for accessibility
        },
      );

      navFragment.append(btn);
    }

    // replaceChildren is efficient as it clears old nodes and adds new ones
    nav.replaceChildren(navFragment);

    prev.disabled = store.state.startingPage === 1;
    next.disabled = store.state.startingPage === total;
  };

  return { wrapper, render };
};

// ================================
// MAIN BLOG COMPONENT
// ================================

const createBlog = (data = [], itemsPerPage = 12, callback = null) => {
  const store = createBlogStore(data, itemsPerPage);
  const templates = createTemplateRegistry();
  const pagination = createPagination(store);

  const blogWrapper = createMarkup("ul", { className: "__items_wrapper" });

  // Event delegation for ticket and book buttons
  /*blogWrapper.addEventListener("click", (e) => {
    // Check if the clicked element (or its parent) has the data-tickets attribute
    const ticketBtn = e.target.closest("[data-tickets]");
    const bookBtn = e.target.closest("[data-book]");
    if (ticketBtn) eventTicketPopup(e, ticketBtn.closest(".__template").id);
    if (bookBtn) alert("Booking clicked!");
  });*/

  const renderer = createDiffRenderer({
    wrapper: blogWrapper,
    templates,
  });

  const paginationUI = createPaginationRenderer({
    store,
    pagination,
  });

  const container = createMarkup("div", { className: "__blog" });
  container.append(blogWrapper, paginationUI.wrapper);

  const updateUI = (changedKeys) => {
    const items = pagination.getPageItems();

    // FIX: If the page changed, we need to update ALL fields of the items
    // because the items themselves are new to the view.
    const isPaginationChange = changedKeys && changedKeys.has("startingPage");
    const renderFilter = isPaginationChange ? null : changedKeys;

    renderer.render(items, renderFilter);
    paginationUI.render();
  };

  // --- FIX: Declare variables here ---
  let pendingChanges = new Set();
  let scheduled = false;

  const scheduleUpdate = (change) => {
    if (change?.key) {
      pendingChanges.add(change.key);
    }

    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      updateUI(pendingChanges);
      pendingChanges.clear();
      scheduled = false;
    });
  };

  store.subscribe(scheduleUpdate);

  // Initial render
  requestAnimationFrame(() => updateUI());

  if( callback && typeof callback === "function") {
    callback(container, blogWrapper, paginationUI.wrapper);
  }

  // This is the object that contains registerTemplate
  return {
    element: container,
    registerTemplate(name, template) {
      templates.register(name, template);
      updateUI(); // Re-render once template is known
    },
    addItem(item) {
      store.addItem(item);
    },
    removeItem(key) {
      store.removeItem(key);
    },
    nextPage() {
      pagination.next();
    },
    prevPage() {
      pagination.prev();
    },
  };
};

// ================================
// DEFAULT TEMPLATE
// ================================

const defaultTemplate = () => {
  const article = createMarkup("article", {className:"__template __default"});

  const title = createMarkup("h3");
  title.dataset.title = "";

  article.append(title);

  return article;
};

export { createBlog }
