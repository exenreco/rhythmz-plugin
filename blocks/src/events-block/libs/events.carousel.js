import Swiper from "swiper/bundle";
import "swiper/css";
import { createBookingPopup, createTicketPopup } from "./popup.fns.js";
import { createMarkup, mediaPlaceholder, formatDate } from "./utils.js";

const 
  slideTemplate = (item) => {
    const 
    startDate = formatDate(item.startDate),
    startDay = startDate?.day || '',
    startMonth = startDate?.month || '',
    startYear = startDate?.year || '',
    time = startDate?.time || '',
    eventId = item.eventId || '';

    const age = createMarkup("span");
    age.classList.add("__age");
    age.textContent = `${item?.ageRestriction ? item.ageRestriction : "21+" } Event`;

    const overlay = createMarkup("div");
    overlay.classList.add("__overlay");
    overlay.append(age);

    const img = createMarkup("img");
    img.classList.add("__poster");
    img.setAttribute("src", item?.mediaSrc || "");
    img.setAttribute("alt", `poster for - ${item.title || ""} event`);
    img.setAttribute("loading", "lazy");

    const media = createMarkup("div");
    media.classList.add("__media");
    if (item?.mediaSrc && item?.mediaSrc?.trim().length >= 1) {
      media.append(img);
    } else {
      media.append(
        mediaPlaceholder({
          date: `${startDate?.date || ''}, ${startDate?.year || ''} at ${startDate?.time || ''}`,
          title: item.title || '',
          venue: item.venue || 'Rhythmz',
          subtitle: item.subtitle || '',
        }),
      );
    }
    media.append(overlay);

    const price = createMarkup("span");
    price.classList.add("__price");
    price.textContent = `Prices From: $${item.lowPrice || "--"}`;

    const title = createMarkup("a");
    title.classList.add("__title");
    title.href = item?.permalink || "#";
    title.innerHTML = item?.title || "";

    const contentLeft = createMarkup("div");
    contentLeft.classList.add("__left");
    contentLeft.innerHTML = `
      <span class="__month">${startMonth}</span>
      <span class="__day">${startDay}</span>
    `;

    const 
    getTickets = createMarkup("button", {
      className: "__btn __tickets",
      rol: "button",
      type: "button",
      textContent: "Buy Tickets",
    }),
    bookNow = createMarkup("button", {
      className: "__btn __reservation",
      rol: "button",
      type: "button",
      textContent: "VIP Reservations",
    }),
    btnContainer = createMarkup("div", { className: "__actions" });
    btnContainer.append(getTickets, bookNow);

    btnContainer.addEventListener("click", (e) => {
      const 
      reservationBtn = e.target.closest(".__reservation"),
      getTicketsBtn = e.target.closest(".__tickets");
      if (reservationBtn) {
        createBookingPopup(eventId);
      } else if (getTicketsBtn) {
        createTicketPopup(eventId, {
          popup: {},
          organizer: {name: item.venue, logo: item.imgSrc}
        });
      }
    });

    const contentRight = createMarkup("div");
    contentRight.classList.add("__right");
    contentRight.append(
      price,
      title,
      btnContainer
    );

    const content = createMarkup("div");
    content.classList.add("__content");
    content.append(contentLeft, contentRight);

    const carouselItem = createMarkup("div");
    carouselItem.classList.add("carousel-item");
    carouselItem.setAttribute("role", "group")
    carouselItem.setAttribute("aria-label", `slide - ${item.title}`);
    carouselItem.append(media, content);

    return carouselItem;
  },
  sliderTemplate = (id) => {
    const pagination = createMarkup("div");
    pagination.classList.add("carousel-pagination");

    const next = createMarkup("button");
    next.classList.add("carousel-next");
    next.innerHTML = "<i class='fa-solid fa-angle-right'></i>";

    const prev = createMarkup("button");
    prev.classList.add("carousel-prev");
    prev.innerHTML = "<i class='fa-solid fa-angle-left'></i>";

    const wrapper = createMarkup("div");
    wrapper.classList.add("carousel-wrapper");

    const carousel = createMarkup("div");
    carousel.classList.add("carousel");
    carousel.append(
      wrapper,
      next,
      prev,
      pagination,
    );

    const container = createMarkup("div");
    container.classList.add("__swiper_container");
    container.id = `${id}-carousel-wrapper`;
    container.append(carousel);

    return container;
  },
  /**
   * EVENT CAROUSEL
   * 
   * Generates a carousel with the provided events.
   * 
   * @param {Array} data - the list of carousel items as an object of an array {
   * 
   *  * (string) id - a unique id for the item
   * 
   *  * (string) age - the age range of the item
   * 
   *  * (string) title - the title of the item
   * 
   *  * (string) price - the price of the item
   * 
   *  * (string) startDate - the ISO date of the item
   * 
   *  * (string) permalink - where the item redirects to
   * 
   *  * (string) imgSrc - the image link for the item
   * 
   *  @example let s = [{id:'', age:'', title:''...},...]
   * }
   * 
   * @param {Object} configs - configures the functionality carousel, options includes {
   *
   *  * (string) configs[id] - a unique id to find the current carousel
   *
   *  * (object) configs[swiperOptions] - parameters for swiper js
   *
   *  * (int) configs[limiter] - The maximum number of slides in a carousel, Defaults [infinite]
   *
   *  * (object) configs[styles] - allows simple changes to the carousel, options include {
   *
   *      {string} configs[styles][bgColor] - the background color of the carousel
   *
   *      {string} configs[styles][textColor] - the text color of the carousel
   *
   *      {string} configs[styles][paginationColor] - swiper's pagination color
   *
   *      {string} configs[styles][accentColor] - swiper's pagination color on hover;
   *
   *      {string} configs[styles][buttonColor] -  swiper's navigation color
   *
   *      {string} configs[styles][ageBgColor] - background color for age gate
   *
   *  }
   * 
   * @returns {object} an object {
   * 
   *  - (function) init - the swiper instance when valid
   * 
   *  - (Node) markup - the corresponding markup as a node
   * }
   *
   * }
   */
  eventCarousel = (data = [], configs = {}) => {
    if (!data.length)
      return {
        markup: (() => {
          const empty = createMarkup("div");
          empty.classList.add("__swiper_container");
          empty.innerHTML = `
            <p class="__empty">
              <i class="__icon fa-regular fa-calendar-xmark"></i></span>
              <span class="__empty_text">
                There are currently no events schedule,<br>please check back later!
              </span>
            </p>
          `;
          return empty;
        })(),
        init: () => {},
      };

    const containerId = configs.id || data[0].id || "__eb_carousel",
      markup = sliderTemplate(containerId),
      swiperEl = markup.querySelector(".carousel"),
      swiperWrapper = markup.querySelector(".carousel-wrapper"),
      swiperNext = markup.querySelector(".carousel-next"),
      swiperPrev = markup.querySelector(".carousel-prev"),
      swiperPagination = markup.querySelector(".carousel-pagination");

    const styleMap = {
      bgColor: "--eb-carousel-bg-color",
      textColor: "--eb-carousel-text-color",
      paginationColor: "--eb-carousel-pagination-color",
      accentColor: "--eb-carousel-accent-color",
      buttonColor: "--eb-carousel-button-color",
      ageBgColor: "--eb-carousel-age-background-color"
    };

    if (configs.styles) {
      Object.entries(configs.styles).forEach(([key, value]) => {
        if (styleMap[key]) {
          markup.style.setProperty(styleMap[key], value);
        }
      });
    }

    // Efficient data limiting
    const itemsToRender = configs.limiter
      ? data.slice(0, configs.limiter)
      : data;

    const fragment = document.createDocumentFragment();
    itemsToRender.forEach((item) => {
      fragment.append(slideTemplate(item));
    });
    swiperWrapper.append(fragment);

    const init = () => {
      const attachCustomPaginationClickHandlers = (swiperInst) => {
          const pagEl = swiperInst.pagination.el;
          if (!pagEl || pagEl.dataset.listenerAttached) return;

          pagEl.addEventListener("click", (e) => {
            const marker = e.target.closest(".marker-item");
            if (!marker) return;
            const targetIndex = parseInt(
              marker.getAttribute("data-slide-to"),
              10,
            );
            swiperInst.slideTo(targetIndex);
          });
          pagEl.dataset.listenerAttached = "true";
        },
        // Helper function handle marker clicks
        /*handleMarkerClick = (swiperInst, event) => {
          const slideTo = parseInt(event.target.dataset.slideTo, 10);
          if (!isNaN(slideTo)) swiperInst.slideTo(slideTo);
        },*/
        customPagination = (swiperInst, current, total) => {
          let fractionHtml = `
            <span class="fractions">
              <i class="item current">${current}</i> 
              <i class="item separator">/</i>
              <i class="item total">${total}</i>
            </span>
          `;

          let markersHtml = `<div class="markers">`;

          for (let i = 1; i <= total; i++) {
            let stateClass = "";

            if (i === current) {
              stateClass = "active";
            } else if (i === current - 1) {
              stateClass = "prev-marker";
            } else if (i === current + 1) {
              stateClass = "next-marker";
            }

            markersHtml += `<span class="marker-item ${stateClass}" data-slide-to="${
              i - 1
            }"></span>`;
          }

          markersHtml += `</div>`;

          return markersHtml + fractionHtml;
        },
        handleSlideBeforePrev = (swiper) => {
          const activeIndex = swiper.activeIndex; // Use activeIndex for loop: false

          swiper.slides.forEach((slide, index) => {
            slide.classList.remove("is-before");
            // Use the actual loop index since loop: false
            if (index < activeIndex - 1) {
              slide.classList.add("is-before");
            }
          });
        },
        defaultOptions = {
          loop: false,
          speed: 800,
          rewind: true,
          effect: "coverflow",
          cssMode: false,
          parallax: false,
          freeMode: false,
          grabCursor: true,
          slideClass: "carousel-item",
          wrapperClass: "carousel-wrapper",
          initialSlide:
            itemsToRender.length > 0 ? Math.floor(itemsToRender.length / 2) : 0,
          spaceBetween: 30,
          slidesPerView: "auto",
          centeredSlides: true,
          disableOnInteraction: true,
          coverflowEffect: {
            rotate: 30,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
          },
          pagination: {
            el: swiperPagination,
            type: "custom",
            clickable: true,
            renderCustom: customPagination,
          },
          navigation: {
            nextEl: swiperNext,
            prevEl: swiperPrev,
          },
          autoplay: {
            delay: 5000,
            disableOnInteraction: true,
          },
          on: {
            init: (swiperInst) => {
              // Force initial render and update for custom pagination
              swiperInst.pagination.render();
              swiperInst.pagination.update();
              // slides before prev slide
              handleSlideBeforePrev(swiperInst);
              // Attach click handlers after initial render
              attachCustomPaginationClickHandlers(swiperInst);
            },
            slideChange: (swiperInst) => {
              // slides before prev slide
              handleSlideBeforePrev(swiperInst);
            },
            // Add a handler for when pagination is updated
            /*paginationRender: (swiperInst) => {
              attachCustomPaginationClickHandlers(swiperInst);
            },*/
            paginationUpdate: (swiperInst) => {
              // This is often triggered, good place to ensure handlers are re-attached if DOM completely replaced
              attachCustomPaginationClickHandlers(swiperInst);
            },
          },
          ...(configs?.swiperOptions ? { ...configs.swiperOptions } : {}),
        },
        swiperInst = new Swiper(swiperEl, defaultOptions);

      if (swiperInst) {
        let wheelRAF = null;

        const horizontalScroll = (event) => {
          const isHorizontalScroll =
            Math.abs(event.deltaX) > Math.abs(event.deltaY);

          if (!isHorizontalScroll) return;

          event.preventDefault();

          if (Math.abs(event.deltaX) < 30) return;

          if (wheelRAF) return;

          wheelRAF = requestAnimationFrame(() => {
            if (!swiperInst) {
              wheelRAF = null;
              return;
            }

            if (event.deltaX > 0) {
              if (swiperInst.activeIndex === swiperInst.slides.length - 1) {
                swiperInst.slideTo(0);
              } else {
                swiperInst.slideNext();
              }
            } else {
              if (swiperInst.activeIndex === 0) {
                swiperInst.slideTo(swiperInst.slides.length - 1);
              } else {
                swiperInst.slidePrev();
              }
            }

            wheelRAF = null;
          });
        };
        swiperEl.addEventListener("wheel", horizontalScroll, {
          passive: false,
        });
      }

      // Return a helper to update the carousel later
      return {
        instance: swiperInst,
        /**
         * Dynamically add a new slide to the active carousel
         */
        update: () => swiperInst.update(),
        addSlide: (newItem) => {
          const newSlideMarkup = slideTemplate(newItem);
          // Swiper internal method to handle DOM and virtual logic
          swiperInst.appendSlide(newSlideMarkup);
          swiperInst.update();
        },
      };
    };

    return { markup, init };
  };

  export { eventCarousel };
