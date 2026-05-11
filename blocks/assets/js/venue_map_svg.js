import { xlinkRef } from "./venue.map.xlink.js";
import { registerTemplate } from "./popup.js";
import { datePicker } from "./date.picker.js";
import { getIcon } from "./icons.js";
import { ImageZoomer } from "./image.zoom.api.js";
import { submit } from "./woo.fns.js";

let rafId, tooltipTimeout;

// Global Checkout Function (Accessible by the button)
window.venueCheckout = () => {
  const venueId = State.venueId;

  if( ! venueId ) return;

  const 
  items = Array.from(State.cart.values()),
  messageEl = State.template.cartMessage,
  productId = items.map((i) => i.productId),
  quantity = items.map((i) => i.quantity);

  if( ! productId.length || ! quantity.length ) return;

  submit(productId, quantity, messageEl);

  return;
};

const // 1. Centralized Data (Only one place to edit)
  template = registerTemplate(null),
  MAP_CONFIG = [
    // Just add new rows here; no new functions needed in this file

    {
      id: "luxury",
      name: "Luxury VIP - Elevated Section",
      date: "",
      price: "12.00",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1455,630s-50.75,19.167-69,21-62-21-62-21-12.75-3.167-17-14-13-128-13-128,3.58-8.5,9-6c-1.58-3.833-1-9-1-9l5-2,15-6,1-14,6-1s3.25-5.833,11-3c13.75-1.833,44,0,44,0l3,5,7-1,33,22Z",
    },
    {
      id: "office",
      name: "Office VIP - Elevated Section",
      date: "",
      price: "0.55",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1176.51,763.378l169.46-3.123c2.69-.05,5.27,1.511,5.76,3.49l45.59,186.407c0.58,2.4-1.37,4.348-4.36,4.348H1205.32c-2.88,0-5.51-1.913-5.85-4.267L1172.3,766.99C1172.02,765.042,1173.9,763.426,1176.51,763.378Z",
    },
    {
      id: "diamond",
      name: "Diamond VIP - Elevated Section",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M818.588,794.257L1165.06,791.7a4.414,4.414,0,0,1,4.29,3.692l24.03,167.93a3.578,3.578,0,0,1-3.46,4.35h-375.3a4.007,4.007,0,0,1-3.845-4.281l4.074-165.433A3.8,3.8,0,0,1,818.588,794.257Z",
    },
    {
      id: "platinum",
      name: "Platinum VIP - Elevated Section",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M395.853,827.5H805.91a3.453,3.453,0,0,1,3.54,3.436L807.559,961.4a4.152,4.152,0,0,1-3.993,4.15l-450.815,5.4c-2.348.028-3.669-1.868-2.953-4.23l41.123-135.658A5.415,5.415,0,0,1,395.853,827.5Z",
    },
    {
      id: "large_table_1",
      name: "Table For 4 (Left)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M464.686,736.125H579.814a3.3,3.3,0,0,1,3.3,4l-5.389,33.8a5.025,5.025,0,0,1-4.71,4.2H454.8c-2.232,0-3.594-1.881-3.043-4.2l8.04-33.8A5.343,5.343,0,0,1,464.686,736.125Z",
    },
    {
      id: "large_table_2",
      name: "Table For 4 (Right)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M594.681,736.221l117.712-.7a3.674,3.674,0,0,1,3.753,4.076l-3.021,34.415a4.73,4.73,0,0,1-4.561,4.267l-119.788.688a3.488,3.488,0,0,1-3.413-4.219l4.807-34.407A4.814,4.814,0,0,1,594.681,736.221Z",
    },
    {
      id: "attraction",
      name: "Attraction VIP - Elevated Section",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M741,518H932a4,4,0,0,1,4.074,3.819l3.173,162.893a4.294,4.294,0,0,1-4.242,4.455H728.328a4.017,4.017,0,0,1-3.99-4.455L736.71,521.819A4.292,4.292,0,0,1,741,518Z",
    },
    {
      id: "silver",
      name: "Silver VIP - Elevated Section",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M310,407H444L406,565H321l-5-28-47-1Z",
    },
    {
      id: "owners_table",
      name: "Owners Table VIP - Elevated Section",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M141,270l-24,52,52,1,8,48,36,1s18.579,0.378,27-19c13.421-26.778,49-127,49-127s10.729-14.822-7-11c-16.529-.978-62,0-62,0l7-22H186l-18,40-45,3-17,32Z",
    },
    {
      id: "gold",
      name: "Gold VIP - Elevated Section",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M209.218,71.731l186.48-2.19c2.4-.028,3.855,1.417,3.253,3.232l-25.166,75.959c-0.664,2-3.246,3.635-5.764,3.639l-195.665.291c-2.395,0-3.609-1.581-2.714-3.534l33.968-74.14A6.639,6.639,0,0,1,209.218,71.731Z",
    },
    {
      id: "dance_floor_sm",
      name: "Dance Floor (SM) VIP - Elevated Booth",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M396.253,203.293l86.438-.281a3.588,3.588,0,0,1,3.644,3.968l-2.822,33.991a4.909,4.909,0,0,1-4.65,4.551l-92.95.3c-2.361.008-3.763-2.027-3.138-4.525l8.507-34.01A5.455,5.455,0,0,1,396.253,203.293Z",
    },
    {
      id: "dance_floor_lg",
      name: "Dance Floor (LG) VIP - Elevated Booth",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M549.546,203.614L743.29,203.1a3.809,3.809,0,0,1,3.732,4.279l-2.44,32.682a4.737,4.737,0,0,1-4.456,4.456l-197.287,1.455a3.649,3.649,0,0,1-3.591-4.5l5.357-33.455A5.282,5.282,0,0,1,549.546,203.614Z",
    },
    {
      id: "small_table_1",
      name: "Table For 2 (Rear Left)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1017.17,510.8c13.71,0,24.83,6.089,24.83,13.6s-11.12,13.6-24.83,13.6-24.837-6.089-24.837-13.6S1003.45,510.8,1017.17,510.8Z",
    },
    {
      id: "small_table_2",
      name: "Table For 2 (Rear Center)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1116.23,510.392c12.76,0.153,22.97,6.459,22.82,14.083s-10.62,13.681-23.38,13.528-22.98-6.459-22.82-14.084S1103.47,510.238,1116.23,510.392Z",
    },
    {
      id: "small_table_3",
      name: "Table For 2 (Rear Right)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1214.65,509.5c13.17,0.158,23.72,6.667,23.56,14.538s-10.96,14.122-24.13,13.964-23.72-6.668-23.56-14.538S1201.48,509.342,1214.65,509.5Z",
    },
    {
      id: "small_table_4",
      name: "Table For 2 (Front Left)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1023.62,601.9c13.8,0.166,24.86,6.989,24.69,15.239s-11.49,14.8-25.3,14.637-24.858-6.989-24.692-15.239S1009.81,601.735,1023.62,601.9Z",
    },
    {
      id: "small_table_5",
      name: "Table For 2 (Front Center)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1128.02,600.567c13.81,0.167,24.87,6.989,24.7,15.239s-11.49,14.8-25.3,14.637-24.86-6.988-24.7-15.238S1114.22,600.4,1128.02,600.567Z",
    },
    {
      id: "small_table_6",
      name: "Table For 2 (Front Right)",
      date: "",
      price: "0",
      capacity: "",
      quantity: 0,
      productId: "",
      description: "",
      minimum_spent: "",
      path: "M1231.86,600.567c13.8,0.167,24.86,6.989,24.69,15.239s-11.49,14.8-25.3,14.637-24.86-6.988-24.69-15.238S1218.05,600.4,1231.86,600.567Z",
    },
  ],
  SVG_NS = "http://www.w3.org/2000/svg",
  State = {
    cart: new Map(), // Stores id -> { name, price, qty }
    paths: new Map(), // Stores id -> pathElement
    venueId: null,
    tooltip: null,
    selected: null, // Track the ID of the selected section
    currentFocus: null,
    focusedElements: [],
    template: null,
    CURRENT_CONFIG: [],
    CURRENT_EVENT_ID: null,
  },
  generateTooltipContent = (path) => {
    const name = path.getAttribute("data-name") || "",
      rawPrice = path.getAttribute("data-price") || "0",
      capacity = path.getAttribute("data-capacity") || "0",
      [dollars, cents = "00"] = rawPrice.split("."),
      container = document.createElement("div"),
      nameEl = document.createElement("b"),
      priceEl = document.createElement("i"),
      capacityEl = document.createElement("i");

    nameEl.textContent = name;
    nameEl.classList.add("name");

    priceEl.textContent = `Price: $${dollars + "." + cents}`;
    priceEl.classList.add("price");

    capacityEl.textContent = `Capacity: ${capacity}`;
    capacityEl.classList.add("guests");

    container.appendChild(nameEl);
    container.appendChild(priceEl);
    container.appendChild(capacityEl);

    return container;
  },
  showTooltip = (e, targetElement) => {
    if (!State.tooltip) {
      State.tooltip = document.createElement("div");
      State.tooltip.id = "__eb_tooltip";
      State.tooltip.className = "__tooltip";
      document.body.appendChild(State.tooltip);
    }

    State.tooltip.replaceChildren(generateTooltipContent(targetElement));

    // Start with clean classes
    State.tooltip.classList.remove("flipped", "mouse-mode", "focus-mode");

    let x, y;
    if (e && e.type === "mousemove") {
      // MOUSE MODE
      State.tooltip.classList.add("mouse-mode", "tooltipIn");
      x = e.pageX + 15;
      y = e.pageY + 15;
      State.tooltip.style.transform = "none";
      State.tooltip.style.display = "block";

      // Collision Detection
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = State.tooltip.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
          x = e.pageX - rect.width - 15;
          State.tooltip.classList.add("flipped");
        }
      });
    } else {
      // FOCUS MODE (Click or Tab)
      State.tooltip.classList.add("focus-mode", "tooltipIn");
      const rect = targetElement.getBoundingClientRect();
      x = rect.left + window.scrollX + rect.width / 2;
      y = rect.top + window.scrollY - 10;

      // Position bottom-center of tooltip at top-center of path
      State.tooltip.style.transform = "translateX(-50%) translateY(-100%)";
      State.tooltip.style.display = "block";
    }

    State.tooltip.style.left = `${x}px`;
    State.tooltip.style.top = `${y}px`;
    clearTimeout(tooltipTimeout);
  },
  hideTooltip = () => {
    if (State.tooltip) {
      State.tooltip.classList.replace("tooltipIn", "tooltipOut");

      clearTimeout(tooltipTimeout);
      tooltipTimeout = setTimeout(() => {
        if (State.tooltip.classList.contains("tooltipOut")) {
          State.tooltip.style.display = "none";
        }
      }, 300);
    }
  },
  /**
   * FOCUS PATH
   *
   * Event to focus a path
   *
   * @param {object} e - listener event
   *
   * @return {void}
   */
  focusPath = (id, event = null) => {
    // If cart has items, only allow focusing the one that is already selected
    if (State.cart.size > 0 && !State.cart.has(id)) return;

    if (State.currentFocus === id) return;

    // Remove previous focused elements (use tracked ones!)
    State.focusedElements.forEach((p) => {
      p.classList.remove("__focused");
    });

    const targets = State.paths.get(id);

    if (!targets) {
      document.getElementById("booking_map").classList.remove("is-focusing");
      State.focusedElements = [];
      State.currentFocus = null;
      hideTooltip();
      return;
    }

    State.currentFocus = id;
    State.focusedElements = targets;

    document.getElementById("booking_map").classList.add("is-focusing");

    targets.forEach((p, i) => {
      if (parseInt(p.dataset.quantity || 0) >= 1) {
        if (!p.classList.contains("__focused")) {
          p.classList.add("__focused");
        }

        if (event && i === 0) {
          showTooltip(event, p);
        }
      }
    });
  },
  /**
   * UN FOCUS PATH
   *
   * Event to unfocus a  path
   *
   * @param {object} e - listener event
   *
   * @return {void}
   */
  unFocusPath = () => {
    if (!State.focusedElements.length) return;

    State.focusedElements.forEach((p) => {
      p.classList.remove("__focused", "__blur");
    });

    State.focusedElements = [];
    State.currentFocus = null;

    hideTooltip();
  },
  /**
   * UPDATE CART UI
   * Dynamically updates the checkout bar
   */
  updateCartUI = () => {
    if (!State.venueId) return;

    const 
    templateRef = State.template,
    rootEl = document.getElementById(State.venueId), // Find the root element of the app
    { 
      cart, cartTitle, cartDetails, 
      cartPrice, cartQuantity, cartGuest, 
      cartDate, cartTotal, cartMessage 
    } = templateRef;

    const 
    itemCount = State.cart.size,
    items = [...State.cart.values()];

    if (itemCount > 0) {
      rootEl.classList.add("cart-open"); // Add the locking class
      /*cartCount.textContent = `${
        itemCount > 1 ? "Selected sections" : "Selected section"
      }: ${items.map((i) => i.name).join(", ")}`;*/
      const hasItem = itemCount >= 1;

      if(hasItem && cartTitle) {
        cartTitle.textContent = items.map((i) => i.name);
      }

      if( hasItem && cartDetails) {
        cartDetails.textContent = items.map((i) => i.description);
      }

      if( hasItem && cartQuantity) {
        cartQuantity.textContent = items.map((i) => i.quantity);
      }

      if( hasItem && cartPrice) {
        let price = items.reduce((sum, i) => sum + Number(i.price || 0), 0);
        cartPrice.textContent = `$${price.toFixed(2)}`;
      }

      if( hasItem && cartGuest) {
        let capacity = items.reduce((sum, i) => sum + Number(i.capacity || 0), 0);
        cartGuest.textContent = `${capacity} ${capacity > 1 ? "Guests" : "Guest"}`;
      }

      if( hasItem && cartDate) {
        cartDate.textContent = items.map((i) => i.date);
      }

      if( hasItem && cartTotal) {
        let total = items.reduce(
          (sum, i) =>
            sum + Number(i.price || 0) * Number(i.quantity || 0),
          0,
        );
        cartTotal.textContent = `$${total.toFixed(2)}`;
      }

      cart.classList.add("show");
      cartMessage.textContent = "";
      cartMessage.classList.remove("error", "success");
    } else {
      rootEl.classList.remove("cart-open"); // Remove the locking class
      cartTotal.textContent = "";
      cartTitle.textContent = "";
      cartDetails.textContent = "";
      cartQuantity.textContent = "";
      cartPrice.textContent = "";
      cartGuest.textContent = "";
      cartDate.textContent = "";
      cart.classList.remove("show");
      cartMessage.textContent = "";
      cartMessage.classList.remove("error", "success");
    }

    /*if (!cart || !cartContent) return;

    const itemCount = State.cart.size;

    // FIX: Added 0 as the initial value and parseFloat for safety
    const total = [...State.cart.values()].reduce(
      (sum, item) => sum + parseFloat(item.price) * (item.qty || 1),
      0,
    );

    if (itemCount > 0) {
      cartContent.innerHTML = `
        <div class="cart-info">
          <span class="count">${itemCount} Section${
            itemCount > 1 ? "s" : ""
          } selected</span>
          <span class="total">$${total.toFixed(2)}</span>
        </div>
        <div class="__btn_container">
          <button class="__btn __checkout" onclick="venueCheckout()">Add to Cart</button>
        </div>
      `;
      cart.classList.add("show");
    } else {
      cart.classList.remove("show");
      cartContent.innerHTML = ""; // Clear content when empty
    }*/
  },
  /**
   * SELECT PATH / TOGGLE CART
   * @param {string} id - The unique section ID
   */
  selectPath = (MAP_CONFIG, id) => {
    const messageEl = State.template.cartMessage;

    if( messageEl ){
      messageEl.textContent = "";
      messageEl.classList.remove("error");
      // If cart has items AND we are clicking something NEW, block it
      if (State.cart.size > 0 && !State.cart.has(id)) {
        messageEl.textContent =
          "Cart is locked. Close or add the current item to cart first.";
        messageEl.classList.add("error");
        setTimeout(() => {
          messageEl.classList.remove("error");
          messageEl.textContent = "";
        }, 2000);
        return;
      }
    }

    const configMap = new Map(MAP_CONFIG.map((i) => [i.id, i])),
      config = configMap.get(id);

    const targets = State.paths.get(id);
    const listItem = document.getElementById(`vip-${id}`);

    if (State.cart.has(id)) {
      // 1. Remove from Cart
      State.cart.delete(id);
      targets.forEach((p) => p.classList.remove("__selected"));
      listItem?.classList.remove("__selected");
    } else {
      // 2. Add to Cart
      State.cart.set(id, {
        id: config.id,
        name: config.name,
        date: config.date,
        price: config.price,
        capacity: config.capacity,
        quantity: config.quantity,
        productId: config.productId,
        description: config.description,
      });
      targets.forEach((p) => p.classList.add("__selected"));
      listItem?.classList.add("__selected");
    }

    updateCartUI();
  },
  venueMap = (MAP_CONFIG = []) => {
    if (!MAP_CONFIG) return;
    const createEl = (tag) => document.createElementNS(SVG_NS, tag),
      buildMap = () => {
        const svg = createEl("svg");
        svg.id = "booking_map";
        svg.setAttribute("width", 1799);
        svg.setAttribute("height", 1011);
        svg.setAttribute("viewBox", "0 0 1799 1011");
        svg.setAttribute("data-name", "Rhtyhmz 3D Booking Map");
        svg.setAttribute("xmlns", SVG_NS);
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        const defs = createEl("defs"),
          styles = createEl("style");
        styles.textContent = `
          .__path {
            cursor: pointer;
            stroke-width: 2px;
            transition: 0.2s;
          } .__path.active {
            display: block;
            visibility: visible;
            stroke: rgba(0, 255, 78, 1);
            fill: rgba(81, 255, 0, 0.774);
          }.__path.inactive {
            display:none;
            visibility: hidden;
            stroke: transparent;
            fill: transparent;
          }.__blur {
            opacity: 0.3;
            fill: rgba(0, 255, 78, 0.546);
            stroke: rgba(0, 255, 78, 0.456);
          } .__focused {
            opacity: 0.8;
            fill: rgba(0, 255, 78, 0.856);
            stroke: rgba(0, 255, 78, 0.856);
          } .__path.__selected {
            fill: #00ff4e !important;
            stroke: #ffffff !important;
            stroke-width: 3px;
            filter: drop-shadow(0 0 5px #00ff4e);
          } .__vip.__selected {
            background: rgba(0, 255, 78, 0.15) !important;
            border-left: 4px solid #00ff4e;
          }

          /* If the map is in focus mode, dim all paths by default */
          #booking_map.is-focusing .__path {
            opacity: 0.3;
          }
          /* Only highlight the focused one */
          #booking_map.is-focusing .__path.__focused {
            opacity: 1;
          }

          /* Floating Cart Footer */
          .__cart {
            left: 50%;
            top: -55px;
            width: 90%;
            height: 180px;
            display: flex;
            z-index: 10001;
            max-width: 500px;
            background: #111;
            position: absolute;
            padding: 15px 25px;
            border-radius: 50px;
            align-items: center;
            border: 1px solid #333;
            transform: translateX(-50%);
            justify-content: space-between;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .__cart.show { bottom: 30px; }

          .cart-info { color: white; display: flex; flex-direction: column; }
          .cart-info .count { font-size: 0.8rem; opacity: 0.7; }
          .cart-info .total { font-size: 1.2rem; font-weight: bold; }

          .checkout-btn {
            background: #00ff4e;
            color: black;
            border: none;
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .checkout-btn:hover { transform: scale(1.05); }

          /* Locked State: When an item is in the cart */
          .__venue.cart-open .__path:not(.__selected),
          .__venue.cart-open .__vip:not(.__selected) {
            opacity: 0.15 !important;
            pointer-events: none !important;
            cursor: not-allowed !important;
          }

          .__venue.cart-open .__path.__selected {
            filter: drop-shadow(0 0 8px #00ff4e);
            opacity: 1 !important;
          }
        `;
        defs.appendChild(styles);
        svg.appendChild(defs);

        const mapImg = createEl("image");
        mapImg.setAttribute("x", 48);
        mapImg.setAttribute("y", 13);
        mapImg.setAttribute("width", "1709");
        mapImg.setAttribute("height", "994");
        mapImg.setAttribute("href", xlinkRef || "");
        svg.appendChild(mapImg);

        const fragment = document.createDocumentFragment();

        MAP_CONFIG.forEach((item) => {
          const part = createEl("path");
          part.id = item.id;
          part.setAttribute("d", item.path);
          part.classList.add("__path");
          part.setAttribute("tabindex", "0");
          part.classList.add(
            "__path",
            parseInt(item.quantity) >= 1 ? "active" : "inactive",
          );

          // Direct assignment is faster than Object.entries for large sets
          part.dataset.name = item.name;
          part.dataset.price = item.price;
          part.dataset.quantity = item.quantity;
          part.dataset.capacity = item.capacity;

          fragment.appendChild(part); // Append to virtual container (no reflow)
          if (!State.paths.has(item.id)) {
            State.paths.set(item.id, []);
          }

          State.paths.get(item.id).push(part);
        });

        // --- EVENT DELEGATION ON SVG ---
        svg.addEventListener("mouseover", (e) => {
          const path = e.target.closest("path");
          if (!path) return;

          focusPath(path.id, e);
        });

        svg.addEventListener("mouseout", (e) => {
          const toElement = e.relatedTarget;

          // If moving to another path inside SVG → DO NOTHING
          if (
            toElement &&
            toElement.closest &&
            toElement.closest("svg") === e.currentTarget
          ) {
            return;
          }

          // Only unfocus when actually leaving SVG
          unFocusPath();
        });
        svg.addEventListener("mouseleave", unFocusPath);

        svg.addEventListener("click", (e) => {
          const path = e.target.closest("path");
          if (path) selectPath(MAP_CONFIG, path.id);
        });

        svg.appendChild(fragment); // One single update to the real DOM

        return svg;
      };

    return buildMap();
  },
  /**
   * Booking tools
   *
   * Has nothing to do with the map, These are just tools for the booking process
   *
   * @since 1.0.0
   *
   * @param {Node} mapContainer - the container of the map
   *
   * @param {String} eventID - the ID of the event
   *
   * @returns {Node}
   *
   * @author Exenreco Bell
   */
  bookingTools = {
    getEarliestEventID: () => {
      const events = window?.RhythmzEventsBlockData?.events || {};
      const entries = Object.entries(events);

      if (entries.length === 0) return null;

      const [earliestKey] = entries.reduce((earliest, current) => {
        // current[1] is the event object, current[0] is the key
        const currentTS = new Date(current[1].startDate).getTime();
        const earliestTS = new Date(earliest[1].startDate).getTime();

        return currentTS < earliestTS ? current : earliest;
      });

      return earliestKey;
    },
    /**
     * Generate map configuration
     *
     * @param {String} eventID - the ID of the event
     *
     * @returns {Array}
     *
     * @since 1.0.0
     *
     * @author Exenreco Bell
     */
    generateMapConfig: (eventID) => {
      const events = window?.RhythmzEventsBlockData?.events || {},
        eventData = events[eventID],
        eventTickets = eventData?.tickets || [];

      // create a map of the tickets
      const ticketMap = new Map();
      eventTickets.forEach((t) =>
        ticketMap.set(t.name.toLowerCase().trim(), t),
      );

      function findTicketByPartial(mapKey, ticketMap) {
        mapKey = mapKey.toLowerCase().trim();

        for (const [ticketKey, ticket] of ticketMap.entries()) {
          if (ticketKey.includes(mapKey) || mapKey.includes(ticketKey)) {
            return ticket;
          }
        }
        return null;
      }

      // Start with a deep copy of the base map paths or the list will stay empty
      const UPDATED_CONFIG = [];

      MAP_CONFIG.forEach((mapItem) => {
        const key = mapItem.name.toLowerCase().trim(),
          matchingTicket =
            ticketMap.get(key) || findTicketByPartial(key, ticketMap);

        if (matchingTicket) {
          UPDATED_CONFIG.push({
            ...mapItem,
            price: parseFloat(matchingTicket?.price?.totalPrice) || "0.00",
            date: matchingTicket?.date,
            description: matchingTicket?.description,
            productId: matchingTicket?.id,
            ...(matchingTicket?.stocks?.status === "instock"
              ? { quantity: parseInt(matchingTicket?.stocks?.quantity) || 1 }
              : { quantity: 0 }),
          });
        } else {
          // Optional: still include it but mark as sold out/inactive
          UPDATED_CONFIG.push({ ...mapItem, quantity: 0 });
        }
      });

      return UPDATED_CONFIG;
    },

    /**
     * Date tool
     *
     * @param {Node} mapContainer - the container of the map
     *
     * @param {Node} toolbarArea - the area of the toolbar
     *
     * @param {String} eventID - the ID of the event
     *
     * @returns {Node}
     *
     * @since 1.0.0
     *
     * @author Exenreco Bell
     */
    dateTool: (selector, eventID) => {
      const 
      Events = window?.RhythmzEventsBlockData?.events || {},
      EventDates = [];

      // Safeguard: If no ID, try to find the first available event as a fallback
      const SelectedEvent = Events[eventID] || Object.values(Events)[0] || {};

      // the selected event start date
      const { startDate } = SelectedEvent;

      // stores all event dates
      if (Events && typeof Events === "object")
        Object.values(Events).forEach((event) => {
          if (event?.startDate) {
            EventDates.push(event.startDate);
          }
        });

      // creates date picker
      const dateTemp = datePicker(
        startDate ? startDate : null,
        [...(EventDates.length > 0 ? EventDates : [])],
        (selectedDate) => {
          // Use Object.entries so we can get the KEY (the actual ID)
          const match = Object.entries(Events).find(([id, item]) => {
            return item?.startDate?.split("T")[0] === selectedDate;
          });

          if (match) {
            const [foundID, foundData] = match;

            if (foundID !== eventID) {
              State.CURRENT_EVENT_ID = foundID;
              // Just call the function. It handles the DOM replacement internally.
              renderBookingApp(selector, foundID);
            }
          }
        },
      );

      // return the date picker
      return dateTemp;
    },

    /**
     * Details tool
     *
     * @param {Object} selectedEvent - the selected event
     *
     * @returns {Node}
     *
     * @since 1.0.0
     *
     * @author Exenreco Bell
     */
    detailsTool: (eventID) => {
      const detailsTemp = () => {
        const detailsTemp = document.createElement("div");
        detailsTemp.classList.add("__details_tool");

        const icon = getIcon("info-rounded");

        const iconWrapper = document.createElement("span");
        iconWrapper.classList.add("__icon");
        iconWrapper.appendChild(icon);

        const trigger = document.createElement("button");
        trigger.classList.add("__action");
        trigger.append(iconWrapper);

        detailsTemp.innerHTML += `
         <div class="__details">
            <img src="">
            <div class="__title">
              <b class="__event_label">Event:</b>
              <h4 class="__event_name"></h4>
            </div>
         </div>
        `;

        detailsTemp.prepend(trigger);

        detailsTemp._ref = {
          image: detailsTemp.querySelector("img"),
          title: detailsTemp.querySelector(".__title"),
          action: detailsTemp.querySelector(".__action"),
          details: detailsTemp.querySelector(".__details"),
          eventLabel: detailsTemp.querySelector(".__event_label"),
          eventName: detailsTemp.querySelector(".__event_name"),
        };
        return detailsTemp;
      };

      const Events = window?.RhythmzEventsBlockData?.events || {},
        SelectedEvent = Events[eventID] || {};

      const detailTool = detailsTemp();

      const imgUrl =
        typeof SelectedEvent?.mediaUrl === "string"
          ? SelectedEvent?.mediaUrl.trim()
          : "";

      if (imgUrl.length > 0) {
        detailTool._ref.image.setAttribute("loading", "lazy");
        detailTool._ref.image.src = imgUrl;
        detailTool._ref.image.alt = SelectedEvent?.title || "poster";
        detailTool._ref.image.setAttribute("srcset", imgUrl);
      } else {
        detailTool._ref.image.remove();
      }

      const title =
        typeof SelectedEvent?.title === "string"
          ? SelectedEvent?.title.trim()
          : "";

      if (title.length > 0) {
        detailTool._ref.eventName.textContent = title;
      }

      if (title.length <= 0) {
        detailTool._ref.eventLabel.remove();
        detailTool._ref.eventName.remove();
        let placeholder = document.createElement("p");
        placeholder.textContent =
          "The current date has no VIP sections listed.";
        detailTool._ref.title.append(placeholder);
      }

      detailTool.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (btn.classList.contains("__action")) {
          e.preventDefault();
          e.stopImmediatePropagation();
          detailTool._ref.details.classList.toggle("active");
        }
      });
      return detailTool;
    },

    /**
     * Toggle between map and list view
     *
     * @param {Node} wrapperEl - the container of the map and list
     *
     * @returns {Node}
     *
     * @since 1.0.0
     *
     * @author Exenreco Bell
     */
    toggleTool: (wrapperEl) => {
      if (!wrapperEl) return;
      const viewToggleTemp = () => {
        const temp = document.createElement("div");
        temp.classList.add("__view_toggle_tool");
        temp.innerHTML = `
          <input type="checkbox" class="__input" checked>
          <label for="view_toggle_input" class="__label">
            <span class="option_map">Map</span>
            <span class="option_list">List</span>
          </label>
        `;
        temp._ref = {
          input: temp.querySelector(".__input"),
          label: temp.querySelector(".__label"),
        };
        return temp;
      };
      const viewToggle = viewToggleTemp();
      viewToggle.addEventListener("change", (e) => {
        let input = e.target.closest(".__input");
        if (!input) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (input.checked) {
          // list view
          viewToggle.setAttribute("data-view", "list");
          wrapperEl.classList.add("list-view");
          wrapperEl.classList.remove("map-view");
          wrapperEl.style = "flex-direction: row;";
        } else {
          // map view
          viewToggle.setAttribute("data-view", "map");
          wrapperEl.classList.add("map-view");
          wrapperEl.classList.remove("list-view");
          wrapperEl.style = "flex-direction: column-reverse;";
        }
      });
      return viewToggle;
    },
  },
  updateVenueMap = (CURRENT_CONFIG) => {
    CURRENT_CONFIG.forEach((item) => {
      const paths = State.paths.get(item.id);

      // If path doesn't exist (new item), skip or create
      if (!paths) return;

      const isActive = parseInt(item.quantity) >= 1;

      paths.forEach((p) => {
        // Update dataset (no DOM recreation)
        p.dataset.name = item.name;
        p.dataset.price = item.price;
        p.dataset.quantity = item.quantity;
        p.dataset.capacity = item.capacity;

        if (parseInt(item.quantity) >= 1) {
          p.classList.add("active");
          p.classList.remove("inactive");
        } else {
          p.classList.add("inactive");
          p.classList.remove("active");
          p.classList.remove("__selected"); // Deselect if sold out
        }
      });
    });

    updateCartUI();
  },
  buildVipList = (CURRENT_CONFIG) => {
    const list = document.createElement("ul");
    list.classList.add("__vip_list");

    const fragment = document.createDocumentFragment();

    // Track if we actually added any visible items
    let activeCount = 0;

    const chevron = getIcon("chevron-right-solid");

    const chevronWrapper = document.createElement("span");
    chevronWrapper.classList.add("chevron");
    chevronWrapper.appendChild(chevron);

    CURRENT_CONFIG.forEach((vip, index) => {
      const isAvailable = parseInt(vip.quantity) >= 1;

      // OPTIONAL: If you want to hide sold-out items from the list entirely,
      // uncomment the next line:
      // if (!isAvailable) return;

      const li = document.createElement("li");
      const status = isAvailable ? "active" : "inactive";

      li.className = `__vip vip-item-${index} ${status} __list_item`;
      li.id = `vip-${vip.id}`;
      li.tabIndex = 0;
      li.innerHTML = `<b>${vip.name}</b>`;
      li.append(chevronWrapper.cloneNode(true));

      fragment.appendChild(li);
      if (isAvailable) activeCount++;
    });

    list.appendChild(fragment);

    // CHANGE: Check if activeCount is 0, or if the list is literally empty
    // If you are showing "inactive" items, children.length will be > 0,
    // so we check activeCount instead.
    if (activeCount === 0) {
      // Clear the inactive items if you'd rather show just the message
      list.innerHTML = "";

      const li = document.createElement("li");
      li.classList.add("__no_sections", "__list_item");
      li.textContent =
        "There are no VIP sections available for the selected date!";
      list.appendChild(li);
    }

    // Re-attach listeners (Event Delegation)
    list.addEventListener("mouseover", (e) => {
      const li = e.target.closest(".__vip.active"); // Only focus active items
      if (li) focusPath(li.id.replace("vip-", ""), e);
    });

    list.addEventListener("mouseout", unFocusPath);

    list.addEventListener("click", (e) => {
      const li = e.target.closest(".__vip.active"); // Only select active items
      if (li) selectPath(CURRENT_CONFIG, li.id.replace("vip-", ""));
    });

    return list;
  },
  generateSecureUniqueNumber = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return Date.now() * 100000 + (array[0] % 100000);
  },
  /**
   * Booking template
   *
   * @returns {Node}
   *
   * @since 1.0.0
   *
   * @author Exenreco Bell
   */
  bookingTemplate = () => {
    let { CURRENT_CONFIG, CURRENT_EVENT_ID } = State;

    const uniqueId = `venue_map_${generateSecureUniqueNumber()}`;
    State.venueId = uniqueId;

    const template = document.createElement("div");
    template.id = uniqueId;
    template.classList.add("__venue", "map");

    const gutterHeader = document.createElement("h3");
    gutterHeader.classList.add("__gutter_header");
    gutterHeader.textContent = "Available VIP Sections";

    const gutter = document.createElement("div");
    gutter.classList.add("__gutter");
    gutter.append(gutterHeader, buildVipList(CURRENT_CONFIG));

    const content = document.createElement("div");
    content.classList.add("__content", "__map_area");
    content.append(venueMap(CURRENT_CONFIG));

    const zoomerInstance = new ImageZoomer(content);

    const wrapper = document.createElement("div");
    wrapper.classList.add("__wrapper", "list-view");
    wrapper.append(gutter, zoomerInstance.wrapper);

    // ----------------------TOOLBAR----------------------
    const toolbar = document.createElement("div");
    toolbar.classList.add("__toolbar", "__venue_map");

    const toolbarLeft = document.createElement("div");
    toolbarLeft.classList.add("__left");
    toolbarLeft.append(bookingTools.dateTool(`#${uniqueId}`, CURRENT_EVENT_ID));
    toolbarLeft.append(bookingTools.detailsTool(CURRENT_EVENT_ID));

    const toolbarRight = document.createElement("div");
    toolbarRight.classList.add("__right");
    toolbarRight.append(bookingTools.toggleTool(wrapper));
    toolbar.append(toolbarLeft, toolbarRight);

    // ----------------------CART-----------------------
    const cartTitle = document.createElement("h3");
    cartTitle.classList.add("__cart_title");
    cartTitle.textContent = "VIP Reservations";

    const cartCloseBtn = document.createElement("button");
    cartCloseBtn.classList.add("__btn", "__close");
    cartCloseBtn.append(getIcon("close-thin"));

    const cartToolbar = document.createElement("div");
    cartToolbar.classList.add("__toolbar", "cart");
    cartToolbar.append(cartTitle, cartCloseBtn);

    const cartMessage = document.createElement("div");
    cartMessage.classList.add("__message");

    const cartContents = document.createElement("div");
    cartContents.classList.add("__contents");
    cartContents.innerHTML = `
      <div class="__meta">
        <span class="__date">--/--/----</span>
      </div>
      <div class="__item_name">
        <span class="__name">Platinum VIP</span>
      </div>
      <div class="__item_details">
        <p>Description</p>
      </div>
      <div class="__labels">
        <span class="__label __price">Price</span>
        <span class="__label __multiplier">-</span>
        <span class="__label __quantity">Quantity</span>
        <span class="__label __total">Total</span>
      </div>
      <div class="__fields">
        <span class="__field __price">$0.00</span>
        <span class="__field __multiplier">x</span>
        <span class="__field __quantity">1</span>
        <span class="__field __total">$0.00</span>
      </div>
      <div class="__item_info">
        <span class="__guest">15 Guests</span>
        <span class="__minimum">
          <span class="__label">Minimum Spent</span>
          <span class="__value">$0.00</span>
        </span>
      </div>
      <div class="__btn_container">
        <button class="__btn __checkout">Add to Cart</button>
      </div>
    `;

    const cart = document.createElement("div");
    cart.classList.add("__cart");
    cart.append(cartToolbar, cartMessage, cartContents);

    // -------------------Template---------------------
    template.append(toolbar, wrapper, cart);
    template._ref = {
      cart: template.querySelector(".__cart"),
      cartCloseBtn: template.querySelector(".__cart_btn"),
      cartContent: template.querySelector(".__cart .__contents"),

      cartTitle: template.querySelector(".__cart .__contents .__item_name .__name"),
      cartTotal: template.querySelector(".__cart .__contents .__fields .__total"),
      cartPrice: template.querySelector(".__cart .__contents .__fields .__price"),
      cartQuantity: template.querySelector(".__cart .__contents .__fields .__quantity"),
      cartDetails: template.querySelector(".__cart .__contents .__item_details"),
      cartGuest: template.querySelector(".__cart .__contents .__item_info .__guest"),
      cartDate: template.querySelector(".__cart .__contents .__meta .__date"),

      /*cartCount: template.querySelector(
        ".__cart .__contents .cart-info .count",
      ),
      cartTotal: template.querySelector(
        ".__cart .__contents .cart-info .total",
      ),*/
      checkoutBtn: template.querySelector(
        ".__cart .__contents .__btn_container .__checkout",
      ),
      cartMessage: template.querySelector(".__cart .__message"),
      venueId: uniqueId,
      zoomer: zoomerInstance,
      mapArea: content,
    };

    State.template = template._ref;

    template.addEventListener("click", (e) => {
      const tempBtn = e.target.closest("button");
      if (!tempBtn) return;

      if (tempBtn.classList.contains("__close")) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (template._ref.cart.classList.contains("show")) {
          // 1. Hide the cart UI
          template._ref.cart.classList.remove("show");

          // 2. Clear the cart data
          State.cart.clear();

          // 3. RESTORE MAP STATE
          // Instead of forcing everything to "inactive" (which hides them),
          // we re-run the update logic using the current event's configuration.
          // This restores the "active" class to sections that have quantity.
          updateVenueMap(State.CURRENT_CONFIG);

          // 4. Reset the Sidebar List (Gutter)
          const listItems = template.querySelectorAll(".__vip.__list_item");
          listItems.forEach((li) => {
            li.classList.remove("__selected");
          });

          // 5. Update UI
          updateCartUI();
        }
      } else if (tempBtn.classList.contains("__checkout")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        venueCheckout();
      }
    });

    return template;
  },
  renderBookingApp = (containerSelector, eventID) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // 1. Update the Global State
    const eventMapConfig = bookingTools.generateMapConfig(eventID);
    State.CURRENT_CONFIG = eventMapConfig;
    State.CURRENT_EVENT_ID = eventID;

    // 2. Check if the container IS the venue or CONTAINS the venue
    let venueApp = container.querySelector(".__venue");

    /*const prevCart = new Map(State.cart);

    // 4. after rebuild
    prevCart.forEach((item, id) => {
      if (State.paths.has(id)) {
        State.cart.set(id, item);
        State.paths.get(id).forEach((p) => p.classList.add("__selected"));
      }
    });*/

    if (!venueApp) {
      // INITIAL LOAD: Clear and build from scratch
      State.paths.clear();
      State.cart.clear();

      // INITIAL LOAD: Pass the original containerSelector down
      venueApp = bookingTemplate();
      if( container.parentElement ) {
        container.parentElement.replaceChildren(venueApp);
      }

    } else {
      // --- DATE/EVENT CHANGE: Update only the dynamic parts ---

      // Update the Details Tool (Event Title/Image)
      const toolbarLeft = venueApp.querySelector(".__toolbar .__left");
      const oldDetails = venueApp.querySelector(".__details_tool");
      if (oldDetails && toolbarLeft) {
        toolbarLeft.replaceChild(bookingTools.detailsTool(eventID), oldDetails);
      }

      // Update the List View (Gutter)
      const gutter = venueApp.querySelector(".__gutter");
      if (gutter) {
        const newList = buildVipList(eventMapConfig);
        gutter.replaceChildren(newList);
      }

      // Update the Map Area (SVG)
      const mapArea = venueApp.querySelector(".__map_area");
      if (mapArea) {
        // venueMap(eventMapConfig) creates the SVG and
        // automatically re-populates State.paths via internal logic
        //mapArea.replaceChildren(venueMap(eventMapConfig));
        updateVenueMap(eventMapConfig);
      }

      // Update the Date Tool (to ensure the internal state of the picker is correct)
      // If your datePicker returns a new element, swap it here similarly to detailsTool
      const oldDate = venueApp.querySelector(".__date_picker");
      if (oldDate && toolbarLeft) {
        toolbarLeft.replaceChild(
          bookingTools.dateTool(containerSelector, eventID),
          oldDate,
        );
      }

      // IMPORTANT: Refresh the zoomer logic for the new SVG
      if (venueApp._ref.zoomer) {
        venueApp._ref.zoomer.refresh();
      }
    }

    // Ensure the cart UI is reset to $0.00 since State.cart was cleared
    updateCartUI();
  },
  initBookingApp = (eventID) => {
    // set configuration based on the given event id
    let CURRENT_EVENT_ID;
    if (eventID) {
      CURRENT_EVENT_ID = eventID;
    } else {
      const earliestEventID = bookingTools.getEarliestEventID();
      CURRENT_EVENT_ID = earliestEventID;
    }
    // set the state of the initial event id and configuration
    State.CURRENT_EVENT_ID = CURRENT_EVENT_ID;
    State.CURRENT_CONFIG = bookingTools.generateMapConfig(CURRENT_EVENT_ID);
    return bookingTemplate();
  };

export { initBookingApp };
