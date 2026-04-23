"use strict";

import { isValidObject } from "./utils.js";
import Swiper from "swiper/bundle";
import 'swiper/css/bundle';
import '../css/slider.css';
import {
  registerTemplate
} from "../../../assets/js/popup.js";
import { initBookingApp } from "../../../assets/js/venue_map_svg.js";

const venueTemplate = registerTemplate('<test>');

const layouts = {
    // Centralized default styles for easier management and potential WordPress integration
    defaultStyles: {
      events: {
        event: {
          infoBar: {
            age: { color: "white", background: "hotpink" },
            date: { color: "white", background: "cornflowerblue" },
            price: { color: "white", background: "red" },
            styles: {},
          },
          footer: {},
          poster: {},
          ticket: {},
          styles: { border: "1px solid #eee", borderRadius: "8px" },
        },
        styles: {
          margin: "0",
          padding: "0",
          border: "1px solid #eee",
          borderRadius: "8px",
        },
      },

      slider: {
        slide: { style: {}, content: {} },
        styles: { margin: "0", padding: "0" },
        navStyles: {},
        autoPlayStyles: {},
      },
    },

    // A map to store event listeners
    _eventListeners: new Map(),

    // New: on method for attaching event listeners
    on: function (element, eventType, handler, options) {
      if (!element || !eventType || typeof handler !== "function") {
        console.warn(
          "Layouts.on: Invalid arguments provided.",
          element,
          eventType,
          handler
        );
        return;
      }
      element.addEventListener(eventType, handler, options);

      // Store the listener for potential removal with 'off'
      if (!this._eventListeners.has(element)) {
        this._eventListeners.set(element, new Map());
      }
      if (!this._eventListeners.get(element).has(eventType)) {
        this._eventListeners.get(element).set(eventType, []);
      }
      this._eventListeners.get(element).get(eventType).push(handler);
    },

    // New: off method for removing event listeners
    off: function (element, eventType, handler) {
      if (!element || !eventType || typeof handler !== "function") {
        console.warn(
          "Layouts.off: Invalid arguments provided.",
          element,
          eventType,
          handler
        );
        return;
      }
      element.removeEventListener(eventType, handler);

      // Remove the handler from our internal map
      if (
        this._eventListeners.has(element) &&
        this._eventListeners.get(element).has(eventType)
      ) {
        const handlers = this._eventListeners.get(element).get(eventType);
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this._eventListeners.get(element).delete(eventType);
        }
        if (this._eventListeners.get(element).size === 0) {
          this._eventListeners.delete(element);
        }
      }
    },

    // New: click method as a shorthand for 'on' with 'click' event
    click: function (element, handler, options) {
      this.on(element, "click", handler, options);
    },

    // Helper to apply styles
    applyStyles: function (element, styles) {
      if (!element || !styles || typeof styles !== "object") return;

      // Apply background first
      if (styles.background) element.style.background = styles.background;

      // Then backgroundColor (to override if needed)
      if (styles.backgroundColor)
        element.style.backgroundColor = styles.backgroundColor;

      // Apply the rest
      for (const prop in styles) {
        if (
          styles.hasOwnProperty(prop) &&
          prop !== "background" &&
          prop !== "backgroundColor"
        ) {
          element.style[prop] = styles[prop];
        }
      }
    },

    formatISODate: (iso) => {
      const 
      date = new Date(iso),
      datePart = date.toLocaleDateString("en-US", {
        weekday: "short", // "Fri" 
        month: "short", // "Dec" 
        day: "numeric", // "1" 
        year: "numeric" // "2026"
      });
      return `${datePart}`;
    },
    formatISODateTime: (iso) => {
      const date = new Date(iso),
        timePart = date.toLocaleTimeString("en-US", {
          hour: "numeric", // "6" or "10"
          minute: "2-digit", // "30" or "00"
          hour12: true, // "PM"
        });
      return `${timePart}`;
    },

    slider: (slides = [], config = {}, callBack = null) => {
      const __styles =
          "styles" in config && isValidObject(config.styles)
            ? config.styles
            : {},
        __navStyles =
          "navStyles" in config && isValidObject(config.navStyles)
            ? config.navStyles
            : {},
        __autoPlayStyles =
          "autoPlayStyles" in config && isValidObject(config.autoPlayStyles)
            ? config.autoPlayStyles
            : {},
        slider = {
          pag: document.createElement("span"),
          prev: document.createElement("button"),
          next: document.createElement("button"),
          slides: [],
          wrapper: document.createElement("div"),
          progress: document.createElement("div"),
          container: document.createElement("div"),
        };
      slider.pag.classList.add("swiper-pagination");
      slider.pag.innerHTML = (() => `
        <div class="markers">
          <span class="marker-item active"></span>
          <span class="marker-item"></span>
          <span class="marker-item"></span>
        </div>
        <span class="fractions">
          <i class="item current">2</i> 
          <i class="item separator">/</i>
          <i class="item total">3</i>
        </span>
      `)();

      slider.prev.classList.add("swiper-button-prev");
      slider.prev.setAttribute("title", "Previous Slide");
      slider.prev.setAttribute("role", "button");
      slider.prev.setAttribute("type", "button");

      slider.next.classList.add("swiper-button-next");
      slider.next.setAttribute("title", "Next Slide");
      slider.next.setAttribute("role", "button");
      slider.next.setAttribute("type", "button");

      slider.progress.classList.add("autoplay-progress");
      slider.container.classList.add("swiper-wrapper", "events-block-slides");
      slider.wrapper.classList.add("swiper", "events-block-slider");

      // Apply default slider wrapper styles and then any custom styles from config
      __styles && isValidObject(__styles)
        ? layouts.applyStyles(slider.wrapper, __styles)
        : layouts.applyStyles(
            slider.wrapper,
            layouts.defaultStyles.slider.styles
          );

      __autoPlayStyles && isValidObject(__autoPlayStyles)
        ? layouts.applyStyles(slider.progress, __autoPlayStyles)
        : layouts.applyStyles(
            slider.progress,
            layouts.defaultStyles.slider.autoPlayStyles
          );

      if (__navStyles && isValidObject(__navStyles)) {
        layouts.applyStyles(slider.prev, __navStyles);
        layouts.applyStyles(slider.next, __navStyles);
      } else {
        layouts.applyStyles(
          slider.prev,
          layouts.defaultStyles.slider.navStyles
        );
        layouts.applyStyles(
          slider.next,
          layouts.defaultStyles.slider.navStyles
        );
      }
      
      // add next content
      slider.next.innerHTML = (() =>`<i class="fa-solid fa-angle-right"></i>`)();

      // add prev content
      slider.prev.innerHTML = (() =>`<i class="fa-solid fa-angle-left"></i>`)();

      // add progress content
      slider.progress.innerHTML = (() => `
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20"></circle>
        </svg>
        <span class="counter"></span>
      `)();

      // append slides if any
      if (slides && Array.isArray(slides) && slides.length > 0) {
        slides.forEach((child) => {
          child.classList.add("swiper-slide");
          slider.slides.push(child);
          slider.container.appendChild(child);
        });
      }

      slider.wrapper.appendChild(slider.container);
      slider.wrapper.appendChild(slider.prev);
      slider.wrapper.appendChild(slider.next);
      slider.wrapper.appendChild(slider.pag);
      slider.wrapper.appendChild(slider.progress);

      // If a callback is provided, execute it with the generated slider wrapper
      if (typeof callBack === "function") callBack(slider);

      return slider;
    },

    slide: (data, config, callBack) => {
      if (typeof data !== "object") return;

      console.log(data);

      const slide = {
        wrapper: document.createElement("div"),
        content: document.createElement("div"),
        contentHeader: document.createElement("section"),
      };

      slide.wrapper.classList.add("slide");
      slide.wrapper.setAttribute(
        "style",
        `
        background-image: url(${data.poster ? data.poster : ""});
      `
      );

      layouts.applyStyles(
        slide.wrapper,
        layouts.defaultStyles.slider.slide.style
      );
      if (config && config.styles && config.styles.style) {
        layouts.applyStyles(slide, config.styles.style);
      }

      layouts.applyStyles(
        slide.content,
        layouts.defaultStyles.slider.slide.content
      );
      if (config && config.styles && config.styles.content) {
        layouts.applyStyles(slide, config.styles.content);
      }

      const getSlideTemplate = (template = "default") => {
        const templates = {};

        templates.parts = () => {
          const sections = {
            age: document.createElement("span"),
            date: document.createElement("span"),
            time: document.createElement("span"),
            price: document.createElement("span"),
            title: document.createElement("span"),
            tagline: document.createElement("span"),
            media: document.createElement("div"),
            excerpt: document.createElement("div"),
            actions: document.createElement("div"),
            container: document.createElement("section"),
          };

          // Assign section classes
          sections.age.classList.add("item", "age");
          sections.date.classList.add("item", "date");
          sections.time.classList.add("item", "time");
          sections.price.classList.add("item", "price");
          sections.title.classList.add("__title");
          sections.tagline.classList.add("__tagline");
          sections.media.classList.add("__media");
          sections.excerpt.classList.add("__excerpt");
          sections.actions.classList.add("__actions");
          sections.container.classList.add("__template");

          //Parallax attributes
          if (data.parallax && data.parallax === true)
            sections.age.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.date.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.time.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.price.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.title.setAttribute("data-swiper-parallax", "-600");
          if (data.parallax && data.parallax === true)
            sections.tagline.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.media.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.excerpt.setAttribute("data-swiper-parallax", "-700");
          if (data.parallax && data.parallax === true)
            sections.actions.setAttribute("data-swiper-parallax", "-700");

          // Create section contents
          sections.age.innerHTML = (() => `
            ${data.age || "Age"}
          `)();

          sections.date.innerHTML = (() => `
            ${layouts.formatISODate(data.startDate) || "Date"}
            <i class="fa-solid fa-minus"></i>
            ${layouts.formatISODate(data.endDate) || "Date"}
          `)();

          sections.time.innerHTML = (() => `
            ${layouts.formatISODateTime(data.startDate) || "time"}
            <i class="fa-solid fa-minus"></i>
            ${layouts.formatISODateTime(data.endDate) || "time"}
          `)();

          sections.price.innerHTML = (() => `
            ${data.price || "Price"}
          `)();

          sections.title.innerHTML = (() => `
            <span class="__heading">${data.title}</span>
            ${data.tagline ? `<span class="__tagline">${data.tagline}</span>` : ""}
          `)();

          sections.media.innerHTML = (() =>
            data.mimetype && data.mimetype === "video"
              ? `
            <video 
              src="${data.poster}" 
              alt="slide - ${data.title || ""} video"
              class="__video"
              muted="true"
              loop="true"
              controls="false"
              autoplay="true"
              playsinline="true"
            >
              <source src="${data.poster}" type="video/mp4">
              <source src="${data.poster}" type="video/webm">
              <source src="${data.poster}" type="video/ogg">
              Your browser does not support the video tag.
            </video>`
              : `
            <img 
              src="${data.poster}" 
              class="__poster"
              alt="slide - ${data.title || ""} image"
            >
          `)();

          sections.excerpt.innerHTML = (() => `
            <span class="__text">
              ${data.excerpt || ""}
              ${data.permalink ? `<a class="__link" href="${data.permalink}">
              <i>Read More</i>
              </a>` : ""}
            </span>
          `)();

          sections.actions.innerHTML = (() => 
            data.buttonOne.display &&
            data.buttonOne.display == true ? `
              <a 
              class="__btn __ticket" 
              href="${data.buttonOne.url}" 
              aria-label="${data.buttonOne.label}" 
              tabindex="0"
              ><i class="fa-solid fa-ticket"></i> ${data.buttonOne.label}</a>
            ` 
            : ""
          )();

          sections.actions.innerHTML += (() => 
            data.buttonTwo.display &&
            data.buttonTwo.display == true ? `
              <a 
              href="${data.buttonTwo.url}" 
              class="__btn __vip" 
              aria-label="${data.buttonTwo.label}" tabindex="0"
              ><i class="fa-solid fa-crown"></i> ${data.buttonTwo.label}</a>
            ` 
            : ""
          )();

          return sections;
        };

        templates.event = (() => {
          const meta = document.createElement("div"),
            tempParts = templates.parts(),
            rightContainer = document.createElement("div"),
            wrappers = {
              left: document.createElement("div"),
              right: document.createElement("div"),
            },
            __date = (() => {
              const dateEl = document.createElement("span");
              dateEl.classList.add("__meta_tag", "__ignore", "__date");
              dateEl.innerHTML = (() =>
                `<i class="tag fa-solid fa-calendar"></i>`)();
              dateEl.appendChild(tempParts.date);
              return dateEl;
            })(),
            __time = (() => {
              const timeEl = document.createElement("span");
              timeEl.classList.add("__meta_tag", "__ignore", "__time");
              timeEl.innerHTML = (() =>
                `<i class="tag fa-solid fa-clock"></i>`)();
              timeEl.appendChild(tempParts.time);
              return timeEl;
            })(),
            __age = (() => {
              const ageEl = document.createElement("span");
              ageEl.classList.add("__meta_tag", "__age");
              ageEl.innerHTML = (() => `<i class="tag">Age</i>`)();
              ageEl.appendChild(tempParts.age);
              return ageEl;
            })(),
            __price = (() => {
              const priceEl = document.createElement("span");
              priceEl.classList.add("__meta_tag", "__price");
              priceEl.innerHTML = (() => `<i class="tag">From</i>`)();
              priceEl.appendChild(tempParts.price);
              return priceEl;
            })();

          wrappers.left.classList.add("__left");
          wrappers.left.innerHTML = (() => `
            <span 
              class="__background" 
              style="background-image: url('${data.poster}') !important;"
            ></span>
            <span class="__overlay"></span>
            <span class="__fader"></span>
          `)();
          wrappers.left.appendChild(tempParts.media);

          rightContainer.classList.add("__container");

          meta.classList.add("__meta");
          meta.appendChild(__date);
          meta.appendChild(__time);
          meta.appendChild(__age);
          meta.appendChild(__price);

          rightContainer.innerHTML = (() => `
            <div class="__special">
              <span class="__line"></span>
              <span class="__featured">Featured Event</span>
            </div>
          `)();
          rightContainer.appendChild(tempParts.title);
          rightContainer.appendChild(meta);
          rightContainer.appendChild(tempParts.excerpt);
          rightContainer.appendChild(tempParts.actions);

          wrappers.right.classList.add("__right");
          wrappers.right.appendChild(rightContainer);

          tempParts.container.classList.add("events");
          tempParts.container.appendChild(wrappers.left);
          tempParts.container.appendChild(wrappers.right);

          return tempParts.container;
        })();

        templates.custom = (() => {
          const 
          tempParts = templates.parts(),
          content = document.createElement("div"),
          overlay = document.createElement("div");

          content.classList.add("__content");
          content.appendChild(tempParts.title);
          content.appendChild(tempParts.tagline);
          content.appendChild(tempParts.excerpt);
          content.appendChild(tempParts.actions);

          overlay.classList.add("__overlay");

          tempParts.container.classList.add("custom", (() => `custom-${data.id}` || '')());
          tempParts.container.appendChild(tempParts.media);
          tempParts.container.appendChild(overlay);
          tempParts.container.appendChild(content);
          return tempParts.container;
        })();

        if (
          template &&
          typeof template === "string" &&
          template != "parts" &&
          templates[template]
        )
          return templates[template];
        else return templates.custom;
      };

      slide.content.classList.add("content");
      slide.content.appendChild(
        data.slideType && data.slideType === "event"
        ? getSlideTemplate(data.slideType)
        : getSlideTemplate("custom")
      );
      slide.wrapper.appendChild(slide.content);

      // If a callback is provided, execute it with the generated slide
      if (typeof callBack === "function") {
        callBack(slide);
      }

      // Apply default slide styles and then any custom styles from config
      return slide;
    },

    events: (layout, perPage, children, config = {}, callBack = null) => {
      const mangeChildren = (children) => {
          // Check if children is not null/undefined/empty string
          if (!children) return;

          const __children = [];

          // Case 1: children is an array of Nodes
          if (Array.isArray(children)) {
            children.forEach((child) => {
              // Ensure each item in the array is a Node
              if (child instanceof Node) {
                __children.push(child);
              } else {
                console.warn(
                  "Layouts.events: Array child is not a valid DOM Node and was skipped.",
                  child,
                );
              }
            });
          } else if (children instanceof Node) {
            // Case 2: children is a single Node
            __children.push(children);
          } else if (typeof children === "string") {
            // Case 3: children is a string (create a span for it)
            const span = document.createElement("span");
            span.innerHTML = children;
            __children.push(span);
          } else {
            // Case 4: children is some other object, which is not a Node (log a warning)
            console.warn(
              "Layouts.events: Provided child is not a valid DOM Node or string and was skipped.",
              children,
            );
          }

          return __children;
        },
        getTemplates = (name, children) => {
          const $children = mangeChildren(children) || [],
            templates = {
              carousel: (() => {
                let isScrolling = false;

                const swiper = {
                    wrapper: document.createElement("div"),
                    container: document.createElement("div"),
                    pagination: document.createElement("div"),
                    __swiperInstance: null,
                  },
                  attachCustomPaginationClickHandlers = (swiperInst) => {
                    const pagEl =
                      swiperInst.el.querySelector(".swiper-pagination");
                    if (pagEl) {
                      const markers = pagEl.querySelectorAll(".marker-item");
                      markers.forEach((marker) => {
                        // Remove existing listener to prevent duplicates if this is called multiple times
                        marker.removeEventListener("click", handleMarkerClick);
                        // Add new listener
                        marker.addEventListener(
                          "click",
                          handleMarkerClick.bind(null, swiperInst),
                        );
                      });
                    }
                  },
                  // Helper function handle marker clicks
                  handleMarkerClick = (swiperInst, event) => {
                    const slideTo = parseInt(event.target.dataset.slideTo, 10);
                    if (!isNaN(slideTo)) swiperInst.slideTo(slideTo);
                  },
                  customPagination = (swiperInst, current, total) => {
                    let markersHtml = `<div class="markers">`;
                    for (let i = 1; i <= total; i++) {
                      markersHtml += `<span class="marker-item ${
                        i === current ? "active" : ""
                      }" data-slide-to="${i - 1}"></span>`;
                    }
                    markersHtml += `</div>`;
                    // Return the complete HTML string
                    return markersHtml;
                  },
                  horizontalScroll = (event) => {
                    const isHorizontalScroll =
                      Math.abs(event.deltaX) > Math.abs(event.deltaY);

                    if (!isHorizontalScroll) return;

                    event.preventDefault();

                    if (isScrolling || Math.abs(event.deltaX) < 30) return;

                    isScrolling = true;

                    if (event.deltaX > 0 && swiper.__swiperInstance) {
                      if (
                        swiper.__swiperInstance.activeIndex ===
                        swiper.__swiperInstance.slides.length - 1
                      ) {
                        swiper.__swiperInstance.slideTo(0);
                      } else {
                        swiper.__swiperInstance.slideNext();
                      }
                    } else {
                      if (swiper.__swiperInstance.activeIndex === 0) {
                        swiper.__swiperInstance.slideTo(
                          swiper.__swiperInstance.slides.length - 1,
                        );
                      } else {
                        swiper.__swiperInstance.slidePrev();
                      }
                    }

                    setTimeout(
                      () => (isScrolling = false),
                      swiper.__swiperInstance.params.speed + 100,
                    );
                  },
                  __swiperConfig = {
                    ...(config?.swiper || {}),
                    loop: false,
                    speed: 800,
                    rewind: false,
                    effect: "coverflow",
                    cssMode: false,
                    parallax: false,
                    freeMode: false,
                    grabCursor: false,
                    initialSlide: (() => {
                      const middle = Math.round($children.length / 2);
                      return middle && !isNaN(middle) ? middle - 1 : 0;
                    })(),
                    spaceBetween: 30,
                    slidesPerView: "auto",
                    centeredSlides: true,
                    disableOnInteraction: true,
                    coverflowEffect: {
                      rotate: 60,
                      stretch: 0,
                      depth: 250,
                      modifier: 1,
                      slideShadows: false,
                    },
                    pagination: {
                      el: swiper.pagination,
                      type: "custom",
                      clickable: true,
                      renderCustom: customPagination,
                    },
                    on: {
                      init: (swiperInst) => {
                        // Force initial render and update for custom pagination
                        swiperInst.pagination.render();
                        swiperInst.pagination.update();
                        // Attach click handlers after initial render
                        attachCustomPaginationClickHandlers(swiperInst);
                      },
                      // Add a handler for when pagination is updated
                      paginationRender: (swiperInst) => {
                        attachCustomPaginationClickHandlers(swiperInst);
                      },
                      paginationUpdate: (swiperInst) => {
                        // This is often triggered, good place to ensure handlers are re-attached if DOM completely replaced
                        attachCustomPaginationClickHandlers(swiperInst);
                      },
                    },
                  };

                swiper.container.classList.add("__events", "swiper");
                swiper.wrapper.classList.add("swiper-wrapper");
                swiper.pagination.classList.add("swiper-pagination");

                swiper.container.appendChild(swiper.wrapper);
                $children.forEach((child, index) => {
                  const s = document.createElement("div");
                  s.classList.add("swiper-slide");

                  // CLONE THE CHILD NODE HERE
                  const clonedChild = child.cloneNode(true); // 'true' means deep clone (all descendants)

                  // Append the cloned child
                  s.appendChild(clonedChild);

                  swiper.wrapper.appendChild(s);
                });
                swiper.container.appendChild(swiper.pagination);

                swiper.__swiperInstance = new Swiper(
                  swiper.container,
                  __swiperConfig,
                );

                swiper.container.addEventListener("wheel", horizontalScroll, {
                  passive: false,
                });

                swiper.__swiperInstance.update();

                return swiper;
              })(),

              grid: (() => {
                let currentPage = 1;

                const itemsPerPage = perPage && !isNaN(perPage) ? perPage : 12,
                  totalPages = Math.ceil($children.length / itemsPerPage),
                  grid = {
                    wrapper: document.createElement("div"),
                    container: document.createElement("div"),
                    pagination: {
                      prev: document.createElement("button"),
                      next: document.createElement("button"),
                      wrapper: document.createElement("div"),
                      pageNumbers: document.createElement("div"),
                    },
                  },
                  renderItems = () => {
                    const startIndex = (currentPage - 1) * itemsPerPage,
                      endIndex = startIndex + itemsPerPage;

                    // Clear previous items (if any)
                    if (grid.container) grid.container.innerHTML = "";

                    // Append current page items
                    for (
                      let i = startIndex;
                      i < endIndex && i < $children.length;
                      i++
                    ) {
                      const item = $children[i];
                      item.style.transitionDelay = `${(i - startIndex) * 0.1}s`; // Adjust delay as needed
                      grid.container.appendChild(item);

                      // Trigger animation after appending to ensure CSS transition works
                      // A small timeout is often needed for the browser to register the element
                      // before applying the 'animate-in' class.
                      setTimeout(() => {
                        item.classList.add("animate-in");
                      }, 10);
                    }
                  },
                  updatePaginationButtons = () => {
                    grid.pagination.prev.disabled = currentPage === 1;
                    grid.pagination.next.disabled = currentPage === totalPages;
                  },
                  // Add page number display
                  renderPageNumbers = () => {
                    grid.pagination.pageNumbers.innerHTML = ""; // Clear previous page numbers

                    const maxPageButtons = 5; // Maximum number of page buttons to show (e.g., 1 2 3 ... 7)
                    const pagesToShowAroundCurrent = Math.floor(
                      maxPageButtons / 2,
                    ); // Number of pages to show before and after the current page

                    let startPage = 1;
                    let endPage = totalPages;

                    if (totalPages > maxPageButtons) {
                      startPage = Math.max(
                        1,
                        currentPage - pagesToShowAroundCurrent,
                      );
                      endPage = Math.min(
                        totalPages,
                        currentPage + pagesToShowAroundCurrent,
                      );

                      if (endPage - startPage + 1 < maxPageButtons) {
                        if (currentPage <= pagesToShowAroundCurrent) {
                          endPage = maxPageButtons;
                          startPage = 1;
                        } else if (
                          currentPage + pagesToShowAroundCurrent >=
                          totalPages
                        ) {
                          startPage = totalPages - maxPageButtons + 1;
                          endPage = totalPages;
                        }
                      }
                    }

                    if (startPage > 1) {
                      const pageButton = document.createElement("button");
                      pageButton.textContent = 1;
                      pageButton.classList.add("__page-number-button");
                      pageButton.addEventListener("click", () => {
                        currentPage = 1;
                        renderItems();
                        updatePaginationButtons();
                        renderPageNumbers();
                      });
                      grid.pagination.pageNumbers.appendChild(pageButton);

                      if (startPage > 2) {
                        const ellipsis = document.createElement("span");
                        ellipsis.textContent = "...";
                        ellipsis.classList.add("__ellipsis");
                        grid.pagination.pageNumbers.appendChild(ellipsis);
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      const pageButton = document.createElement("button");
                      pageButton.textContent = i;
                      pageButton.classList.add("__page-number-button");
                      if (i === currentPage) {
                        pageButton.classList.add("active");
                      }
                      pageButton.addEventListener("click", () => {
                        currentPage = i;
                        renderItems();
                        updatePaginationButtons();
                        renderPageNumbers();
                      });
                      grid.pagination.pageNumbers.appendChild(pageButton);
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        const ellipsis = document.createElement("span");
                        ellipsis.textContent = "...";
                        ellipsis.classList.add("__ellipsis");
                        grid.pagination.pageNumbers.appendChild(ellipsis);
                      }
                      const pageButton = document.createElement("button");
                      pageButton.textContent = totalPages;
                      pageButton.classList.add("__page-number-button");
                      pageButton.addEventListener("click", () => {
                         renderPageNumbers();
                       currentPage = totalPages;
                        renderItems();
                        updatePaginationButtons();
                      });
                      grid.pagination.pageNumbers.appendChild(pageButton);
                    }
                  };

                grid.wrapper.classList.add("__events", "grid");
                grid.container.classList.add("__container");

                grid.pagination.wrapper.classList.add("__pagination");
                grid.pagination.prev.classList.add("__prev");
                grid.pagination.prev.innerHTML =
                  '<i class="fa-solid fa-arrow-left"></i>';
                grid.pagination.next.classList.add("__next");
                grid.pagination.next.innerHTML =
                  '<i class="fa-solid fa-arrow-right"></i>';
                grid.pagination.pageNumbers.classList.add("__page_numbers");

                grid.wrapper.appendChild(grid.container);

                if ($children.length > itemsPerPage) {
                  // Only show pagination if more than one page
                  // Initial render
                  renderItems();
                  updatePaginationButtons();
                  renderPageNumbers();
                  grid.pagination.wrapper.appendChild(grid.pagination.prev);
                  grid.pagination.wrapper.appendChild(
                    grid.pagination.pageNumbers,
                  );
                  grid.pagination.wrapper.appendChild(grid.pagination.next);
                  grid.wrapper.appendChild(grid.pagination.wrapper);

                  // Event Listeners for Next/Prev
                  grid.pagination.next.addEventListener("click", () => {
                    if (currentPage < totalPages) {
                      currentPage++;
                      renderItems();
                      updatePaginationButtons();
                      renderPageNumbers();
                    }
                  });

                  grid.pagination.prev.addEventListener("click", () => {
                    if (currentPage > 1) {
                      currentPage--;
                      renderItems();
                      updatePaginationButtons();
                      renderPageNumbers();
                    }
                  });
                } else {
                  // If no pagination needed, just render all items
                  grid.container.innerHTML = "";
                  $children.forEach((child) => {
                    grid.container.appendChild(child);
                  });
                }

                return grid;
              })(),
            };

          if (name && typeof name === "string" && templates[name])
            return templates[name];
          else return templates.grid;
        },
        __template =
          layout && layout === "carousel"
            ? getTemplates("carousel", children)
            : getTemplates("grid", children);

      // If a callback is provided, execute it with the generated events wrapper
      if (typeof callBack === "function") 
        callBack( __template );

      return layout === "carousel" ? __template.container : __template.wrapper;
    },

    event: (
      template,
      data = {
        age: "18+",
        startDate: new Date(),
        endDate: new Date(),
        title: "event",
        price: "$",
        mediaURL: "",
      }, 
      config = {
        showAge: true,
        showPrice: true,
        showTitle: true,
        footerDate: true,
        infoBarDate: true,
        styles: {},
      }, // Add a styles object to config
      callBack = null
    ) => {

      const getTemplate = (name = "carousel") => {
        const templates = {
          parts: () => {
            return {
              age: () => {
                const element = document.createElement('span');
                element.classList.add('__age');
                element.innerHTML = (() => data.age ? `${data.age} Event` : '')();
                return element;
              },
              date: (showTime = false) => {
                const element = document.createElement('span');
                element.classList.add('__date');
                element.innerHTML = (() => `
                  ${layouts.formatISODate(data.startDate) || "Date"}
                  ${showTime ? ` | ${layouts.formatISODateTime(data.startDate)}` || "00:00" : ""}
                `)();
                return element;
              },
              time: () => {
                const element = document.createElement('span');
                element.classList.add('__time');
                element.innerHTML = (() => `
                  ${layouts.formatISODateTime(data.startDate) || "time"}
                `)();
                return element;
              },
              price: () => {
                const element = document.createElement('span');
                element.classList.add('__price');
                element.innerHTML = 'content';
                return element;
              },
              title: () => {
                const element = document.createElement('span');
                element.classList.add('__title');
                element.innerHTML = data.title || 'Event';
                return element;
              },
              media: () => {
                const element = document.createElement('main');
                element.classList.add('__media');
                element.innerHTML = (() =>
                  data?.poster
                    ? `<img 
                      src="${data.poster}" 
                      alt="${data.title} - poster"
                      class="__poster"
                    >` : `
                    <div class="__placeholder">
                      <span class="__overlay"></span>
                      <span class="__inner">
                        <h3 class="__title">Rhythmz</h3>
                        <b class="__subtitle">Open House</b>
                        <b class="__time">${layouts.formatISODateTime(data.startDate) || ""}</b>
                      <b class="__event">${data.title || 'Event'}</b>
                    </span>
                  </div>`)();
                return element;
              },
              excerpt: () => {
                const element = document.createElement('div');
                element.classList.add('__excerpt');
                element.innerHTML = 'content';
                return element;
              },
              actions: () => {
                const element = {
                  container: document.createElement('div'),
                  vipButton: document.createElement('button'),
                  ticketButton: document.createElement('button')
                };

                element.container.classList.add('__actions');

                element.vipButton.setAttribute("role", "button");
                element.vipButton.setAttribute('tabindex', "0");
                element.vipButton.classList.add("__btn", "__vip");
                element.vipButton.innerHTML = 'VIP Suits';
                /*element.vipButton.addEventListener("click", (event) =>
                  popup({ layout: "vip", data: data }),
                );*/
                element.vipButton.addEventListener("click", (e) =>
                  e.target.popup(
                    "fullWidth",
                    "Booking - VIP Suites ",
                    initBookingApp(),
                  ),
                );

                element.ticketButton.setAttribute("role", "button");
                element.ticketButton.setAttribute("tabindex", "0");
                element.ticketButton.classList.add("__btn", "__ticket");
                element.ticketButton.innerHTML = "Event Tickets";
                element.ticketButton.addEventListener("click", (event) =>
                  popup({ layout: "ticket", data: data }),
                );
                
                element.container.appendChild(element.vipButton);
                element.container.appendChild(element.ticketButton);

                return element;
              },
              template: () => {
                const element = document.createElement("article");
                element.classList.add("__template");
                element.setAttribute("tabindex", "0");
                return element;
              },
            };
          },
        };

        templates.carousel = (() => {
          const parts = templates.parts(),
            overlay = document.createElement("span"),
            content = document.createElement("div"),
            container = document.createElement("a"),
            $carouselTemplate = parts.template();

          overlay.classList.add("__overlay");
          content.classList.add("__content");
          container.classList.add("carousel");
          $carouselTemplate.classList.add("carousel_parent");

          container.setAttribute("href", "#");
          container.setAttribute("tabindex", "0");
          container.setAttribute("role", "button");

          content.innerHTML = (() => `
            <span>From - $20</span>
          `)();
          content.appendChild(parts.title());
          content.appendChild(parts.date(true));

          container.appendChild(parts.media());
          container.appendChild(overlay);
          container.appendChild(content);
          container.appendChild(parts.age());

          $carouselTemplate.appendChild(container);

          return $carouselTemplate;
        })();
        
        templates.grid = (() => {
          const
          parts = templates.parts(),
          age = parts.age(),
          price = parts.price(),
          media = parts.media(),
          overlay = document.createElement('div'),
          header = document.createElement('header'),
          footer = {
            left: document.createElement('div'),
            right: document.createElement('div'),
            container: document.createElement('footer')
          },
          $largeTemplate = parts.template();

          age.classList.add('__item');
          price.classList.add('__item');
          header.classList.add('__header');
          overlay.classList.add("overlay");
          footer.left.classList.add('__left');
          footer.right.classList.add("__right");
          footer.container.classList.add('__footer');
          $largeTemplate.classList.add("__grid_item");
          $largeTemplate.setAttribute("tabindex", "0");

          header.appendChild(age);
          header.appendChild(price);

          media.prepend(overlay);
          
          footer.left.appendChild(parts.date());
          footer.left.appendChild(parts.title());
          footer.right.appendChild(parts.actions().container);
          footer.container.appendChild(footer.left);
          footer.container.appendChild(footer.right);

          $largeTemplate.appendChild(header);
          $largeTemplate.appendChild(media);
          $largeTemplate.appendChild(footer.container);

          return $largeTemplate;
        })();

        if (
          name &&
          typeof name === "string" &&
          name != "parts" &&
          templates[name]
        )
          return templates[name];
        else return templates.grid;
      },
      
      temp = template && typeof template === 'string'
      ? getTemplate(template)
      : getTemplate('grid');

      // If a callback is provided, execute it with the generated elements
      if (typeof callBack === "function") {
        callBack(temp);
      }

      return temp;
    }
  },
  // layouts module export
  Layouts = () => layouts;

export { Layouts };
