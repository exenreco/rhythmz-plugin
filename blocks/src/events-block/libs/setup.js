import Swiper from 'swiper/bundle';
import { Layouts } from './layouts.js';
import { isValidObject } from './utils.js';
import { initBookingApp } from "../../../assets/js/venue_map_svg.js";
import { eventCarousel } from "./events.carousel.js";
import { EventsBlog } from './events.blog.js';
import { registerDefaultIcons } from "../../../assets/js/icons.default.js";

import 'swiper/css/bundle';
import '../css/slider.css';

registerDefaultIcons();

const Setup = ({ block, swiperRef, attributes, otherSlides, calendarData }) => {
    
    if (!block) return;

    const setup = {
      block: null,

      /**
       * SLIDES (DATA)
       *
       * All slides that gets added to swiper js,
       * that is events data are converted to slides
       * and otherSlides are also includes
       *
       * @type {Map}
       * @property Slides
       * @since version 1.0.0
       */
      slides: new Map(),

      /**
       * EVENTS (DATA)
       *
       * All events data used to generate the events sections.
       *
       * @type {Map}
       * @property Events
       * @since version 1.0.0
       */
      events: new Map(),

      layouts: { ...Layouts() },

      swiperEl: null,

      eventsEl: null,

      bookingEl: null,

      swiperInstance: null,

      getBlock: () => setup.block,

      getSlides: () => setup.slides,

      getEvents: () => setup.events,

      getEventsEl: () => setup.eventsEl,

      getSwiperEl: () => setup.swiperEl,

      getBookingEl: () => setup.bookingEl,

      getSwiperInstance: () => setup.swiperInstance,

      setBlock: (block) => {
        setup.block = typeof block === "object" ? block : null;
        return;
      },

      setSlides: (data = {}) => {
        if (!data || !isValidObject(data)) return;
        let counter = 0;
        for (const key in data) {
          if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

          const event = data[key];

          if (isValidObject(data[key]))
            setup.slides.set(`slide-${counter}`, {
              id: `item-${counter}`,
              age: event.age,
              title: event.title,
              tagline: event.tagline,
              excerpt: event.excerpt,
              startDate: event.startDate,
              endDate: event.endDate,
              poster: event.mediaUrl,
              posterId: event.mediaId,
              mimetype: event.mediaType || "image",
              permalink: event.permalink,
              slideType: event.slideType,
              parallax: attributes?.slider?.swiper?.parallax,

              // Event uses buttons directly from slides attributes
              // while custom slides has there own button options
              buttonOne:
                event.slideType && event.slideType === "event"
                  ? attributes?.slides?.buttonOne
                  : event.buttonOne,
              buttonTwo:
                event.slideType && event.slideType === "event"
                  ? attributes?.slides?.buttonTwo
                  : event.buttonTwo,
            });
          counter++;
        }
        return;
      },

      setEvents: (data = {}) => {
        if (!data || !isValidObject(data)) return;
        for (const key in data) {
          if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

          const event = data[key];

          if (isValidObject(data[key]))
            setup.events.set(`event-${key}`, {
              id: key,
              age: event.age,
              title: event.title,
              excerpt: event.description,
              startDate: event.startDate,
              endDate: event.endDate,
              poster: event.mediaUrl,
              posterId: event.mediaId,
              mimetype: event.mediaType || "image",
              permalink: event.permalink,
              tickets: event.tickets,
            });
        }
        return;
      },

      setEventsEl: (eventsEl) => {
        setup.eventsEl = eventsEl instanceof HTMLElement ? eventsEl : null;
        return;
      },

      setBookingEl: (bookingEl) => {
        setup.bookingEl = bookingEl instanceof HTMLElement ? bookingEl : null;
        return;
      },

      setSwiperEl: (El) => {
        if (El instanceof HTMLElement) swiperRef = setup.swiperEl = El;
        return;
      },

      sliderTemplate: () => {
        const slides = [],
          slidesData = setup.getSlides();

        for (const [key, value] of slidesData) {
          slides.push(
            setup.layouts.slide(slidesData.get(key), {}, (el) => {}).wrapper,
          );
        }

        if (slides.length < 1) {
          // add placeholder
          const placeholder = document.createElement("span");
          placeholder.setAttribute("class", "placeholder");
          placeholder.innerHTML += (() =>
            `NO Events, failed to create slider!`)();
          slides.push(placeholder);
        }

        const slider = setup.layouts.slider([...slides]);

        setup.setSwiperEl(slider.wrapper);

        return slider;
      },

      /**
       * BOOKING TEMPLATE
       * 
       * creates a template intended for a booking page
       * 
       * @returns 
       */
      bookingContainer: () => {
        const temp = document.createElement("div");
        temp.classList.add('__eb_booking', 'in_page');
        temp.append(initBookingApp());

        /*const fragment = document.createDocumentFragment();
        fragment.append(temp);

        setup.setBookingEl(fragment);
        return fragment;*/
        setup.setBookingEl(temp);
        return temp;
      },

      eventsTemplate: () => {
        const 
        layout = 'grid',//attributes?.events?.layout || 'grid',
        perPage = 1,
        events = [],
        eventsData = setup.getEvents();

        for (const [key, value] of eventsData) {
          events.push(setup.layouts.event(
            layout  ? layout : 'grid',
            eventsData.get(key), 
            {}, 
            (el) => {}
          ));
        }

        if (events.length < 1) {
          // add placeholder
          const placeholder = document.createElement("span");
          placeholder.setAttribute("class", "placeholder");
          placeholder.innerHTML += (() => `NO EVENTS!`)();
          events.push(placeholder);
        }

        const eventsEl = setup.layouts.events(
          layout,
          perPage,
          events,
          {},
          (template) => {},
        );

        //setup.setEventsEl(eventsEl);
        //return eventsEl;

        const carouselView = eventCarousel(
          (() => {
            const carouselData = [
              {
                id: 'test-123',
                age: '18+',
                title: 'Event Title',
                price: "3.99",
                imgSrc: '',
                endDate: new Date().toISOString(),
                startDate: new Date().toISOString(),
                permalink: '#',
              }
            ];
            for (const [key, value] of eventsData)
              carouselData.push({
                id: eventsData.get(key).id,
                age: eventsData.get(key).age,
                title: eventsData.get(key).title,
                price: "3.99",
                imgSrc: eventsData.get(key).poster,
                endDate: eventsData.get(key).endDate,
                startDate: eventsData.get(key).startDate,
                permalink: eventsData.get(key).permalink,
              });
            return carouselData.length >= 1 ? carouselData : [];
          })(), {
            id: "test",
            /*styles: {
              bgColor: "red",
              textColor: "blue",
              accentColor: "yellow",
              buttonColor: "orange",
              paginationColor: "green",
              ageBgColor: "purple"
            },*/
            limiter: 6,
            swiperOptions: {},
          },
        );
        const gridView = EventsBlog(
          (() => {
            const gridData = [];
            for (const [key, value] of eventsData) {
              gridData.push({
                id: eventsData.get(key).id,
                age: eventsData.get(key).age,
                title: eventsData.get(key).title,
                price: "3.99",
                imgSrc: eventsData.get(key).poster,
                endDate: eventsData.get(key).endDate,
                startDate: eventsData.get(key).startDate,
                permalink: eventsData.get(key).permalink,
                excerpt: eventsData.get(key).excerpt,
                status: eventsData.get(key).status || "",
                //templateName: "default"
              });
              console.log(eventsData.get(key).tickets);
            }
            return gridData.length >= 1 ? gridData : [];
          })(),
          {
            id: "test2",
            itemsPerPage: 12,
            styles: {
              bgColor: "red",
              textColor: "blue",
              accentColor: "yellow",
              buttonColor: "orange",
              paginationColor: "green",
              ageBgColor: "purple",
            },
            seo: {
              title: "Rhythmz Lounge - Night Club | Upcoming Events",
              //description: "A list of upcoming events at Rhythmz Lounge - Night Club",
              keywords:
                "Events, Omaha, Nebraska, Rhythmz Lounge, Nightclub, Nightclub in Omaha, Nightclub in Nebraska, Nightclub in Omaha, NE, Nightclub in 68137, Nightclub at 10841 Q Street, Omaha, NE 68137",
            },
            organizer: {
              url: "https://rhythmzlounge.com",
              name: "Rhythmz Lounge - Night Club",
              logo: "https://www.rhythmzlounge.com/wp-content/uploads/2020/05/detaillogoGreen.png",
              shortName: "Rhythmz",
              eventUrl: "https://rhythmzlounge.com/upcoming-events/",
              location: "10841 Q Street, Omaha, NE 68137",
              address: {
                street: "10841 Q Street",
                city: "Omaha",
                state: "Nebraska",
                zip: "68137",
                country: "US",
              },
              socialLinks: {
                youtube: "https://www.youtube.com/rhythmzloungeomaha",
                twitter: "https://twitter.com/rhythmzloungeomaha",
                facebook: "https://www.facebook.com/rhythmzloungeomaha",
                instagram: "https://www.instagram.com/rhythmzloungeomaha"
              },
            },
            popupStyles: {},
          },
        );
        const both = document.createElement('div');
        both.append(carouselView.markup, gridView, eventsEl);
        setup.setEventsEl(both);

        carouselView.init();

        return both;
      },

      initializeSwiper: (elRef) => {
        const progressCircle = elRef.querySelector("svg"),
          progressContent = elRef.querySelector(".counter"),
          swiperAttributes = attributes?.slider?.swiper || {},
          // Helper function to attach click handlers
          attachCustomPaginationClickHandlers = (swiper) => {
            const pagEl = swiper.el.querySelector(".swiper-pagination");
            if (pagEl) {
              const markers = pagEl.querySelectorAll(".marker-item");
              markers.forEach((marker) => {
                // Remove existing listener to prevent duplicates if this is called multiple times
                marker.removeEventListener("click", handleMarkerClick);
                // Add new listener
                marker.addEventListener(
                  "click",
                  handleMarkerClick.bind(null, swiper),
                );
              });
            }
          },
          // Helper function handle marker clicks
          handleMarkerClick = (swiper, event) => {
            const slideTo = parseInt(event.target.dataset.slideTo, 10);
            if (!isNaN(slideTo)) {
              swiper.slideTo(slideTo);
            }
          },
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
              markersHtml += `<span class="marker-item ${
                i === current ? "active" : ""
              }" data-slide-to="${i - 1}"></span>`;
            }
            markersHtml += `</div>`;

            // Return the complete HTML string
            return markersHtml + fractionHtml;
          },
          swiperOptions = {
            loop: true,
            speed: 800,
            rewind: true,
            cssMode: false,
            parallax: false,
            freeMode: false,
            effect: "slide",
            spaceBetween: 0,
            slidesPerView: 1,
            centeredSlides: false,
            disableOnInteraction: true,

            autoplay: {
              delay: 4200,
              disableOnInteraction: false,
            },
            pagination: {
              el: ".swiper-pagination",
              type: "custom",
              clickable: true,
              renderCustom: customPagination,
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
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
              paginationRender: (swiper) => {
                attachCustomPaginationClickHandlers(swiper);
              },
              paginationUpdate: (swiper) => {
                // This is often triggered, good place to ensure handlers are re-attached if DOM completely replaced
                attachCustomPaginationClickHandlers(swiper);
              },
              //auto play handler
              autoplayTimeLeft: (() => {
                const autoPalyFn = (s, time, progress) => {
                  progressCircle.style.setProperty("--progress", 1 - progress);
                  progressContent.textContent = `${Math.ceil(time / 1000)}s`;
                };
                return swiperAttributes?.autoplay &&
                  swiperAttributes?.autoplay === true
                  ? autoPalyFn
                  : null;
              })(),
            },
            ...swiperAttributes,

            autoplay: (() => {
              return swiperAttributes?.autoplay &&
                swiperAttributes?.autoplay === true
                ? {
                    delay: swiperAttributes?.autoplayDelay || 4200,
                    disableOnInteraction:
                      swiperAttributes?.autoplayOnInteractions || false,
                  }
                : false;
            })(),
          };

        setup.swiperInstance = new Swiper(elRef, swiperOptions);

        // Horizontal scroll event
        if (setup.swiperInstance) {
          let isScrolling = false;
          elRef.addEventListener(
            "wheel",
            (event) => {
              const isHorizontalScroll =
                Math.abs(event.deltaX) > Math.abs(event.deltaY);

              if (!isHorizontalScroll) return;

              event.preventDefault();

              if (isScrolling || Math.abs(event.deltaX) < 30) return;

              isScrolling = true;

              if (event.deltaX > 0 && setup.swiperInstance) {
                if (
                  setup.swiperInstance.activeIndex ===
                  setup.swiperInstance.slides.length - 1
                ) {
                  setup.swiperInstance.slideTo(0);
                } else {
                  setup.swiperInstance.slideNext();
                }
              } else {
                if (setup.swiperInstance.activeIndex === 0) {
                  setup.swiperInstance.slideTo(
                    setup.swiperInstance.slides.length - 1,
                  );
                } else {
                  setup.swiperInstance.slidePrev();
                }
              }

              setTimeout(
                () => (isScrolling = false),
                setup.swiperInstance.params.speed + 100,
              );
            },
            { passive: false },
          );
        }

        return;
      },

      cleanup: () => {
        if (setup.block) setup.block.innerHTML = "";

        if (setup.swiperEl) setup.swiperEl.innerHTML = "";

        if (setup.swiperInstance) {
          setup.swiperInstance.destroy(true, true); // Destroy Swiper instance
          setup.swiperInstance = null;
        }
        return;
      },

      load: () => {
        setup.setBlock(block);
        setup.setEvents(calendarData);
        setup.setSlides({
          ...calendarData,
          ...(attributes?.slides?.otherSlides || []),
          ...otherSlides,
        });
      },

      update: (block, swiperEl, otherSlides, calendarData) => {
        setup.setBlock(block);

        setup.sliderTemplate({
          elRef: swiperEl,
          otherSlides: otherSlides,
          calendarData: calendarData,
          enableOtherSlides: true,
          enableCalendarSlides: true,
        });

        setup.eventsTemplate({
          calendarData: calendarData,
        });

        const blockEl = setup.getBlock(),
          sliderEl = setup.getSwiperEl(),
          eventsEl = setup.getEventsEl();

        if (sliderEl && sliderEl instanceof HTMLElement) {
          blockEl.appendChild(sliderEl);
          setup.initializeSwiper(sliderEl);
        } else blockEl.innerHTML = (() => `Block Error!`)();

        if (eventsEl && eventsEl instanceof HTMLElement)
          blockEl.appendChild(eventsEl);
        else blockEl.innerHTML = (() => `Block Error!`)();
      },

      render: () => {
        setup.load();
        setup.sliderTemplate();
        setup.eventsTemplate();
        setup.bookingContainer();

        const 
        blockEl = setup.getBlock(),
        sliderEl = setup.getSwiperEl(),
        eventsEl = setup.getEventsEl(),
        bookingEl = setup.getBookingEl();

        // Slider view
        if (attributes?.slider?.display === true) {
          if (sliderEl && sliderEl instanceof HTMLElement) {
            blockEl.appendChild(sliderEl);
            setup.initializeSwiper(sliderEl);
          } else blockEl.innerHTML = (() => `Block Error!`)();
        }

        // Event view
        if (attributes?.events?.display === true) {
          if (eventsEl && eventsEl instanceof HTMLElement)
            blockEl.appendChild(eventsEl);
          else blockEl.innerHTML = (() => `Block Error!`)();
        }

        // Booking view
        if (attributes?.booking?.display === true) {
          if (bookingEl && bookingEl instanceof HTMLElement)
            blockEl.appendChild(bookingEl);
          else blockEl.innerHTML = (() => `Block Error!`)();
        }
      },
    };

    return setup;
};

export { Setup };
