let cache = null;

/**
 * 1. Optimized FontAwesome Check (Runs once)
 */
const isFontAwesomeAvailable = async () => {
    if (cache !== null) return cache;
    if (typeof document === "undefined") return false;

    // 1. Try the modern Font Loading API first (very reliable)
    if (document.fonts && document.fonts.check) {
      // Check for FA 4, 5, and 6 family names
      const isLoaded =
        document.fonts.check("1em FontAwesome") ||
        document.fonts.check("1em 'Font Awesome 5 Free'") ||
        document.fonts.check("1em 'Font Awesome 6 Free'");

      if (isLoaded) {
        cache = true;
        return true;
      }
    }

    // 2. Fallback to DOM injection
    const i = document.createElement("i");
    // Use 'fas' for FA5/6 and 'fa' for FA4
    i.className = "fas fa-check fa";
    i.style.position = "absolute";
    i.style.top = "-9999px";
    i.style.visibility = "hidden";
    document.body.appendChild(i);

    const fam = window.getComputedStyle(i).getPropertyValue("font-family");
    document.body.removeChild(i);

    // Check for various FA naming conventions
    cache = !!(fam && /font\s*awesome/i.test(fam));
    return cache;
  },
  faPromise = isFontAwesomeAvailable(),
  /**
   * 2. Shared Styles (Injected once)
   */
  injectStyles = () => {
    if (document.getElementById("__splicer_styles")) return;
    const s = document.createElement("style"),
      computed = getComputedStyle(document.body),
      bgColor = computed.background || computed.backgroundColor || "#222",
      bgTextColor = computed.color || "#fff";

    s.id = "__splicer_styles";
    s.innerHTML = `
    @keyframes dialogIn {
       0% { 
        opacity: 0; 
        transform: translateY(15px) scale(0.98); 
        filter: blur(8px); 
      }
      100% { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
        filter: blur(0); 
      }
    }
    @keyframes boxedIn {
      0% { opacity: 0; transform: scale(0.96) translateY(10px); filter: blur(5px); }
      100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
    }
    @keyframes fullWidthIn {
      0% {
        transform: translateY(0%);
      }
      50% {
        transform: translateY(-25%);
      }
      100% {
        transform: translateY(0%);
      }
    }
    @keyframes dialogOut {
      0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      100% { opacity: 0; transform: translateY(15px) scale(0.98); filter: blur(8px); }
    }
    @keyframes boxedOut {
      0% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
      100% { opacity: 0; transform: scale(0.96) translateY(10px); filter: blur(5px); }
    }
    @keyframes fullWidthOut {
      0% {
        transform: translateY(0%);
      }
      50% {
        transform: translateY(25%);
      }
      100% {
        transform: translateY(0%);
      }
    }
    .__no_overflow {
      overflow: hidden;
    }
    .__splicer_popup_module {
      z-index: 1000;
      will-change: transform, opacity, filter;
    }
    .__splicer_popup_module.__dialog {
      animation: dialogIn 0.3s ease-out;
    }
    .__splicer_popup_module.__boxed {
      animation: boxedIn 0.3s ease-out;
    }
    .__splicer_popup_module.__fullWidth {
      animation: fullWidthIn 0.3s ease-out;
    }
    .__splicer_popup_module.__dialog.animateOut {
      animation: dialogOut 0.3s ease-out;
    }
    .__splicer_popup_module.__boxed.animateOut {
      animation: boxedOut 0.3s ease-out;
    }
    .__splicer_popup_module.__fullWidth.animateOut {
      animation: fullWidthOut 0.3s ease-out;
    }
    .__overlay {
      position: fixed;
      top:0;
      left:0;
      width:100vw;
      height:100vh;
      z-index: -1;
    }
    .__template.dialog { 
      background: white; 
      border: 1px solid #ccc; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
      border-radius: 4px; 
      overflow: hidden;
    }
    .__template.full-width {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 0;
      width: 100%;
      margin: auto;
      border: none;
      height: 100vh;
      z-index: 9999;
      display: flex;
      flex: 0 0 ato;
      position: fixed;
      overflow: hidden;
      border-radius: 0; 
      flex-wrap: no wrap;
      flex-direction: column;
      color: ${bgTextColor};
      background: ${bgColor};
    }
    .__toolbar {
      padding: 0;
      height: 4em;
      width: 100%;
      position: relative;
      line-height: 1.2rem;
      border-bottom: 1px solid #eee; 
      color: var(--wp--preset--color--ui-text, #fff);
      background: var(--wp--preset--color--ui-header-background, #333); 
    }
    .__toolbar .__wrapper {
      width: 100%;
      height: 100%;
      display: flex; 
      align-items: center;
      justify-content: space-between;
      background: blue;
    }
    .__toolbar .__wrapper .__text {
      padding: 5px;
      margin: auto;
      text-wrap: wrap;
      font-weight: bold;
      font-size: 0.8rem;
      width: calc(100% - 8em - 10px);
      max-width: calc(1480px - 8em - 10px);
      min-width: calc(20% - 8em - 10px);
    }
    .__toolbar .__wrapper .__action {
      margin: 0;
      padding: 0;
      height: 100%;
      border: none; 
      cursor: pointer; 
      font-size: 0.7rem;
      background: #e0e0e0;
      width: calc(8em);
    }
    .__toolbar .__wrapper .__action i {
      font-size: 1.82rem;
    }
    .__article {
      flex: 1; /* Allows it to grow in flex containers */
      overflow-y: auto;
      -webkit-overflow-scrolling: touch; /* Smooth scroll for iOS */
      padding: 20px;
      color: #333;
      padding: 0;
      margin: auto;
      text-wrap: wrap;
      overflow-y: auto;
      position: relative;
      width: calc(100%);
      height: calc(100% - 4em);
    }
  `;
    document.head.appendChild(s);
  },
  closeModel = (model, anchor, prevFocused) => {
    if (model && model instanceof Node) {
      //allow overflow
      if (anchor.classList.contains("__no_overflow"))
        anchor.classList.remove("__no_overflow");
      //model.classList.remove("animateIn");
      model.classList.add("animateOut");
      // restore focus
      if (prevFocused) prevFocused.focus();

      setTimeout(() => {
        // remove model
        model.remove();
      }, 350);
    }
  },
  templates = {
    dialog: (title, content, model, anchor, prevFocused) => {
      const template = document.createElement("article");
      template.classList.add("__template", "dialog");

      const header = document.createElement("header");
      header.classList.add("__toolbar");

      const wrapper = document.createElement("div");
      wrapper.classList.add("__wrapper");

      const titleEl = document.createElement("aside");
      titleEl.classList.add("__text");

      // Fix: Proper type checking
      if (typeof title === "string") {
        titleEl.innerText = title;
      } else if (title instanceof Node) {
        titleEl.appendChild(title);
      }

      const closeBtn = document.createElement("button");
      closeBtn.classList.add("__action");
      closeBtn.onclick = () => closeModel(model, anchor, prevFocused);

      faPromise
        .then((res) => {
          if (res)
            closeBtn.innerHTML = `<span>Close <i class="fa-solid fa-x"></i></span>`;
          else closeBtn.innerHTML = `<span>Close <b>X</b></span>`;
        })
        .catch((err) => {
          closeBtn.innerHTML = `<span>Close <b>X</b></span>`;
        });

      wrapper.append(titleEl, closeBtn);
      header.appendChild(wrapper);

      const main = document.createElement("main");
      main.classList.add("__article");
      if (typeof content === "string") main.innerHTML = content;
      else if (content instanceof Node) main.appendChild(content);

      template.append(header, main);
      return template;
    },
    boxed: (title, content, model, anchor, prevFocused) => {
      const template = document.createElement("article");
      template.classList.add("__template", "full-width");

      const header = document.createElement("header");
      header.classList.add("__toolbar");

      const wrapper = document.createElement("div");
      wrapper.classList.add("__wrapper");

      const titleEl = document.createElement("aside");
      titleEl.classList.add("__text");

      // Fix: Proper type checking
      if (typeof title === "string") {
        titleEl.innerText = title;
      } else if (title instanceof Node) {
        titleEl.appendChild(title);
      }

      const closeBtn = document.createElement("button");
      closeBtn.classList.add("__action");
      closeBtn.onclick = () => closeModel(model, anchor, prevFocused);
      faPromise
        .then((res) => {
          if (res)
            closeBtn.innerHTML = `<span>Close <i class="fa-solid fa-x"></i></span>`;
          else closeBtn.innerHTML = `<span>Close <b>X</b></span>`;
        })
        .catch((err) => {
          closeBtn.innerHTML = `<span>Close <b>X</b></span>`;
        });

      wrapper.append(titleEl, closeBtn);
      header.appendChild(wrapper);

      const main = document.createElement("main");
      main.classList.add("__article");
      if (typeof content === "string") main.innerHTML = content;
      else if (content instanceof Node) main.appendChild(content);

      template.append(header, main);
      return template;
    },
    fullWidth: (title, content, model, anchor, prevFocused) => {
      const template = document.createElement("article");
      template.classList.add("__template", "full-width");

      const header = document.createElement("header");
      header.classList.add("__toolbar");

      const wrapper = document.createElement("div");
      wrapper.classList.add("__wrapper");

      const titleEl = document.createElement("aside");
      titleEl.classList.add("__text");

      // Fix: Proper type checking
      if (typeof title === "string") {
        titleEl.innerText = title;
      } else if (title instanceof Node) {
        titleEl.appendChild(title);
      }

      const closeBtn = document.createElement("button");
      closeBtn.classList.add("__action");
      closeBtn.onclick = () => closeModel(model, anchor, prevFocused);
      faPromise
        .then((res) => {
          if (res)
            closeBtn.innerHTML = `<span>Close <i class="fa-solid fa-x"></i></span>`;
          else closeBtn.innerHTML = `<span>Close <b>X</b></span>`;
        })
        .catch((err) => {
          closeBtn.innerHTML = `<span>Close <b>X</b></span>`;
        });

      wrapper.append(titleEl, closeBtn);
      header.appendChild(wrapper);

      const main = document.createElement("main");
      main.classList.add("__article");
      if (typeof content === "string") main.innerHTML = content;
      else if (content instanceof Node) main.appendChild(content);

      template.append(header, main);
      return template;
    },
    default: (title, content, model, anchor, prevFocused) =>
      templates.dialog(title, content, model, anchor, prevFocused),
  },
  popup = (el, templateName, config = {}) => {
    if (!(el instanceof Element)) return null;

    injectStyles();

    const model = document.createElement("div");

    model.classList.add("__splicer_popup_module");
    if (templateName) model.classList.add(`__${templateName}`);
  
    const isDialog = templateName === "dialog";
    const settings = {
      title: config.title || "untitled",
      content: config.content || "Empty",
      position: config.position || "bottom",
      className: config.className || "",
      autoHide: {
        enabled: config?.autoHide?.enabled ?? false,
        delay: config?.autoHide?.delay ?? 8500,
      },
      dialog: {
        overlay: true,
        overlayBackground: "rgba(33, 33, 33, 0.5)",
        ...(config.dialog || {}),
      },
      anchor:
        config?.anchor &&
        (config.anchor instanceof Node || typeof config.anchor === "string")
          ? config.anchor
          : document.body,
      ...config,
    };

    // Logic for positioning
    const setPosition = (target) => {
        // If the target is the body, don't position it at the "bottom" of the body
        if (target === document.body) {
          model.style.position = "fixed";
          model.style.top = "50%";
          model.style.left = "50%";
          return;
        }

        // Otherwise, position relative to the triggering element (el)
        const rect = target.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        model.style.left = `${rect.left + scrollX}px`;
        model.style.top = `${rect.bottom + scrollY + 5}px`;
      },
      // listeners
      escHandler = (e, anchor, prevFocused) => {
        if (e.key === "Escape") {
          closeModel(model, anchor, prevFocused);
          model.removeEventListener("keydown", escHandler);
        }
      },
      closeHandler = (e, anchor, prevFocused) => {
        if (!model.contains(e.target) && e.target !== el) {
          closeModel(model, anchor, prevFocused);
          document.removeEventListener("click", closeHandler);
        }
      };

    // anchor handling
    let anchorEl = document.body;

    const prevFocused = document.activeElement;

    if (settings.anchor) {
      if (settings.anchor instanceof Node) {
        anchorEl = settings.anchor;
      } else if (typeof settings.anchor === "string") {
        const found = document.querySelector(settings.anchor);
        if (found) anchorEl = found;
      }

      // Fix: Passing arguments to the template
      const templateFn = templates[templateName] || templates["default"];
      const html = templateFn(
        settings.title || "untitled",
        settings.content || "Empty",
        model,
        anchorEl,
        prevFocused,
      );

      if (isDialog && settings.dialog.overlay) {
        const overlay = document.createElement("div");
        overlay.classList.add("__overlay");
        overlay.style.background = settings.dialog.overlayBackground;
        model.appendChild(overlay);
        setPosition(el);
      } else {
        model.classList.add("animateIn");
        model.style.position = "absolute";
        model.style.top = "0";
        model.style.left = "0";
        model.style.right = "0";
        model.style.bottom = "0";
        model.style.zIndex = "9999";
        if (!anchorEl.classList.contains("__no_overflow")) {
          anchorEl.classList.add("__no_overflow");
        }
      }

      if (html instanceof Node) model.appendChild(html);
      else model.innerHTML += html;

      model.setAttribute("tabindex", "-1");
      model.style.outline = "none";

      // create popup at anchor element
      requestAnimationFrame(() => {
        anchorEl.appendChild(model);
        model.focus();
        setTimeout(() => {
          model.classList.remove("animateIn");
        }, 100);
      });

      // add keydown event listener
      model.addEventListener("keydown", (e) =>
        escHandler(e, anchorEl, prevFocused),
      );
      // add click event listener
      model.addEventListener("click", (e) =>
        closeHandler(e, anchorEl, prevFocused),
      );

      // auto hide popup
      if (settings.autoHide.enabled) {
        setTimeout(() => {
          model.removeEventListener("click", (e) =>
            closeHandler(e, anchorEl, prevFocused),
          );
          model.removeEventListener("keydown", (e) =>
            escHandler(e, anchorEl, prevFocused),
          );
          closeModel(model, anchorEl, prevFocused);
        }, settings.autoHide.delay);
      }
    }

    return model;
  },
  _$ = (selector) => {
    const elements = Array.from(document.querySelectorAll(selector));

    return {
      elements,

      popup(templateName, config) {
        elements.forEach((el) => popup(el, templateName, config));
        return this;
      },

      first() {
        return elements[0] || null;
      },

      get(index) {
        return elements[index] || null;
      },

      forEach(cb) {
        elements.forEach(cb);
        return this;
      },
    };
  },
  registerTemplate = (name, fn) => {
    templates[name] = fn;
  };

export { _$, popup, registerTemplate, isFontAwesomeAvailable };
