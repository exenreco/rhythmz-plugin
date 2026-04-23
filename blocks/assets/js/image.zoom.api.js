class ImageZoomer {
  constructor(wrapper) {
    if (!(wrapper instanceof HTMLElement)) return;

    this.wrapper = wrapper;
    this.image = wrapper.querySelector("img, svg");
    if (!this.image) return;

    this.state = {
      startX: 0,
      startY: 0,
      translateX: 0,
      translateY: 0,
      multiplier: 0,
      max: 20,
      isDragging: false,
      isMapDragging: false,
    };

    // Initialize timer property
    this.labelTimer = null;

    this.cached = {
      size: this.image.getBoundingClientRect(),
      src: this.getSource(this.image),
    };

    this.build();
    this.attachEvents();
    this.update();
    this.showLabel();

    return this;
  }

  getSource(el) {
    if (el.tagName.toLowerCase() === "svg") {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(el);
      return (
        "data:image/svg+xml;base64," +
        window.btoa(unescape(encodeURIComponent(svgString)))
      );
    }
    return el.src;
  }

  refresh() {
    this.image = this.wrapper.querySelector("img, svg");
    if (!this.image) return;

    this.cached = {
      size: this.image.getBoundingClientRect(),
      src: this.getSource(this.image),
    };

    // Update the mini-map background
    this.map.style.backgroundImage = `url(${this.cached.src})`;

    // Re-attach events to the NEW image element
    this.image.addEventListener("mousedown", (e) => this.startPan(e));
    this.image.addEventListener("wheel", (e) => this.zoomOnWheel(e), {
      passive: false,
    });

    this.update();
  }

  showLabel() {
    // 1. Set active classes
    this.label.classList.add("__active");
    this.label.classList.remove("__inactive");

    // 2. Clear any existing timer so it doesn't hide too early
    if (this.labelTimer) {
      clearTimeout(this.labelTimer);
    }

    // 3. Set a timer to add __inactive after 2 seconds of inactivity
    this.labelTimer = setTimeout(() => {
      this.label.classList.remove("__active");
      this.label.classList.add("__inactive");
    }, 2000); // Adjust 2000ms (2s) to your liking
  }

  build() {
    this.wrapper.style.overflow = "hidden";
    this.wrapper.style.position = "relative";

    this.toolbar = document.createElement("div");
    this.toolbar.className = "__toolbar image-zoomer";
    this.toolbar.innerHTML = `
      <div class="__zoom_controls">
        <button class="__zoom_in">+</button>
        <div class="__range_wrapper">
          <div class='__range'>
            <input class="__input" type='range' min='0' max='20' step='1' value='0'>
            <div class='__label __active'><i>0</i></div>
            <div class='__progress'></div>
          </div>
        </div>
        <button class="__zoom_out">-</button>
      </div>
    `;

    this.miniMap = document.createElement("div");
    this.miniMap.className = "image-zoomer __mini_map";
    this.miniMap.innerHTML = `<div class="__panner"></div>`;

    this.wrapper.append(this.toolbar, this.miniMap);

    this.zoomInBtn = this.toolbar.querySelector(".__zoom_in");
    this.zoomOutBtn = this.toolbar.querySelector(".__zoom_out");
    this.progress = this.toolbar.querySelector(".__progress");
    this.rangeWrapper = this.toolbar.querySelector(".__range");
    this.range = this.toolbar.querySelector(".__input");
    this.label = this.toolbar.querySelector(".__label");
    this.labelText = this.toolbar.querySelector(".__label i");
    this.map = this.miniMap;
    this.panner = this.miniMap.querySelector(".__panner");

    Object.assign(this.map.style, {
      zIndex: "10",
      left: "10px",
      bottom: "10px",
      width: "200px",
      height: "100px",
      display: "none",
      cursor: "crosshair",
      position: "absolute",
      backgroundSize: "cover 100%",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundImage: `url(${this.cached.src})`,
    });

    Object.assign(this.panner.style, {
      top: "50%",
      left: "50%",
      width: "20px",
      height: "20px",
      cursor: "move",
      borderRadius: "50%",
      position: "absolute",
      backdropFilter: "blur(5px)",
      transform: "translate(-50%, -50%)",
      "-o-backdrop-filter": "blur(5px)",
      "-ms-backdrop-filter": "blur(5px)",
      "-moz-backdrop-filter": "blur(5px)",
      "-webkit-backdrop-filter": "blur(5px)",
      boxShadow: "0 0 5px rgba(0,0,0,0.5)",
    });
  }

  attachEvents() {
    this.zoomInBtn.addEventListener("click", () => {
      this.zoom(1);
      this.showLabel();
    });
    this.zoomOutBtn.addEventListener("click", () => {
      this.zoom(-1);
      this.showLabel();
    });

    this.range.addEventListener("input", (e) => {
      this.showLabel();
      this.state.multiplier = +e.target.value;
      this.update();
    });
    this.rangeWrapper.addEventListener("mousedown", (e) => {
      e.target.style.cursor = "grabbing";
    });
    this.rangeWrapper.addEventListener("mouseup", (e) => {
      e.target.style.cursor = "grab";
    });

    this.image.addEventListener("mousedown", (e) => {this.startPan(e)});
    this.wrapper.addEventListener("mouseleave", () => {
      this.state.isDragging = false;
      this.state.isMapDragging = false;
    });
    this.image.addEventListener("wheel", (e) => this.zoomOnWheel(e), {
      passive: false,
    });

    this.panner.addEventListener("mousedown", (e) => {
      e.stopPropagation(); // Prevent main image pan trigger
      this.state.isMapDragging = true;
    });

    // Allow clicking anywhere on the map to jump panner
    this.map.addEventListener("mousedown", (e) => {
      if (e.target === this.map) {
        this.state.isMapDragging = true;
        this.doMapPan(e);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (this.state.isDragging) this.doPan(e);
      if (this.state.isMapDragging) this.doMapPan(e);
    });

    window.addEventListener("mouseup", () => {
      this.state.isDragging = false;
      this.state.isMapDragging = false;
    });

    window.addEventListener("blur", () => {
      this.state.isDragging = false;
      this.state.isMapDragging = false;
    });
  }

  zoom(direction) {
    this.showLabel();
    this.state.multiplier = Math.max(
      0,
      Math.min(this.state.max, this.state.multiplier + direction),
    );
    this.image.style.transition = "transform 0.3s ease-out";
    this.update();
  }

  zoomOnWheel(e) {
    // 1. If not zoomed, allow normal browser scrolling
    if (this.state.multiplier === 0 && !e.ctrlKey) {
      return;
    }

    // 2. Prevent default page scroll only when we are actually zooming/panning
    e.preventDefault();

    // 3. Handle Horizontal Scrolling (only if zoomed in)
    if (e.deltaX !== 0 || (e.shiftKey && e.deltaY !== 0)) {
      if (this.state.multiplier > 0) {
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        this.state.translateX -= delta;
        this.update();
      }
      return;
    }

    // 4. Handle Zooming
    const direction = e.deltaY > 0 ? -2 : 2;
    this.zoom(direction);
  }

  startPan(e) {
    if (this.state.multiplier === 0) return;
    this.state.isDragging = true;
    this.state.startX = e.clientX - this.state.translateX;
    this.state.startY = e.clientY - this.state.translateY;
    this.image.style.transition = "none";
  }

  doPan(e) {
    if (!this.state.isDragging) return;

    this.state.translateX = e.clientX - this.state.startX;
    this.state.translateY = e.clientY - this.state.startY;

    this.update();
  }

  doMapPan(e) {
    if (!this.state.isMapDragging) return;

    const rect = this.map.getBoundingClientRect();

    // Calculate mouse position relative to map center (pixels)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert map coordinates back to main image translation
    // We use a ratio: translation = -(mapPos - center) / factor
    const mapCenterX = rect.width / 2;
    const mapCenterY = rect.height / 2;

    const factor = 0.1; // This must match the ratio used in update()
    this.state.translateX = -(mouseX - mapCenterX) / factor;
    this.state.translateY = -(mouseY - mapCenterY) / factor;
    this.image.style.transition = "transform 0.3s ease-out";

    this.update();
  }

  stopPan() {
    this.state.isDragging = false;
  }

  update() {
    requestAnimationFrame(() => {
      if (this.state.multiplier <= 0) {
        this.image.style.transition = "transform 0.3s ease-out";
        this.state.multiplier = 0;
        this.state.translateX = 0;
        this.state.translateY = 0;
      }

      const scale = 1 + this.state.multiplier * 0.1;

      // Calculate Panner Movement and Clamp
      const factor = 0.1;
      let panX = -this.state.translateX * factor;
      let panY = -this.state.translateY * factor;

      // Boundary Clamping for Mini-map (200x100)
      // Since panner is absolute center (50%, 50%), the limits are:
      // Width (200): from -100 to +100. Height (100): from -50 to +50
      // We clamp so the panner doesn't leave the box.
      const mapW = 200,
        mapH = 100;
      const limitX = mapW / 2;
      const limitY = mapH / 2;

      // Clamp panX and panY
      panX = Math.max(-limitX, Math.min(limitX, panX));
      panY = Math.max(-limitY, Math.min(limitY, panY));

      // Sync the translateX back if we hit the panner wall
      // (This prevents the main image from moving further once the panner hits the edge)
      if (this.state.isDragging || this.state.isMapDragging) {
        this.state.translateX = -panX / factor;
        this.state.translateY = -panY / factor;
      }

      // Apply Main Image Transform
      this.image.style.transform = `translate(${this.state.translateX}px, ${this.state.translateY}px) scale(${scale})`;

      // Update UI
      this.labelText.textContent = `${Math.round(scale * 100)}%`;
      this.range.value = this.state.multiplier;

      if (this.state.multiplier > 0) {
        this.map.style.display = "block";
        this.panner.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px))`;
      } else {
        this.map.style.display = "none";
      }

      // Progress bar logic
      const percentage = this.range.value / this.range.max;
      const offset = this.range.clientWidth - this.label.clientWidth / 2;
      this.label.style.transform = `translateX(${percentage * offset}px)`;
      this.progress.style.width = `${percentage * offset}px`;
    });
  }

  static init(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => new ImageZoomer(el));
  }
}

export { ImageZoomer };
