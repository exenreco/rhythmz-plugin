import { isValidObject } from "./utils.js";
import { EventsBlog } from './events.blog.js';
import { eventsSlider } from './events.slider.js';
import { eventCarousel } from "./events.carousel.js";
import { initBookingApp } from "../../../assets/js/venue_map_svg.js";
import { registerDefaultIcons } from "../../../assets/js/icons.default.js";
registerDefaultIcons(); // register default icons

// Default data presets for block
const PRESETS = {};
PRESETS.event = {
  id: 0,
  title: "",
  eventId: null,
  excerpt: "",
  endDate: "",
  tickets: [],
  mediaId: null,
  mediaSrc: null,
  mimeType: "image",
  lowPrice: "",
  startDate: "",
  permalink: "",
  ageRestriction: null,
};
PRESETS.organizer = {
  logo: "",
  name: "Rhythmz Lounge",
  shortName: "Rhythm",
  address: {street: "",city: "",state: "",zip: "",country: ""},
  socialLinks: {
    facebook: "",
    twitter: "",
    instagram: "",
  }
};
PRESETS.slider = {
  ...PRESETS.event,
  tagline: "",
  slideType: "event-slide",
  buttonOne: { label: "Get Tickets", url: "#", display: true },
  buttonTwo: { label: "The VIP Experience", url: "#", display: true },
};
PRESETS.otherSlides = {
  title: "",
  tagline: "",
  excerpt: "",
  mediaId: null,
  mimeType: "image",
  mediaSrc: null,
  slideType: "other-slide",
  buttonOne: { label: "Get Tickets", url: "#", display: true },
  buttonTwo: { label: "The VIP Experience", url: "#", display: true },
};
PRESETS.carousel = {
  ...PRESETS.event,
  tagline: "",
  parallax: false,
};
PRESETS.blog = {
  ...PRESETS.event,
  datePublished: "",
  category: "",
};

/**
 * CONTROLLER
 * 
 * Communicates Block Settings with Block View Components, 
 * this component serves as a bridge between the block and its 
 * view components sending messages when needed
 * 
 * @param {object} options - block options including {
 * 
 *  - swiperRef {HTMLElement} - ref to the swiper instance
 * 
 *  - attributes {Object} - block attributes
 * 
 *  - otherSlides {Array} - other slides
 * 
 *  - calendarData {Array} - calendar data
 * 
 *  - eventsData {Array} - events data
 *  
 * }
 * 
 * @returns {Object}
 
 */
const Controller = ({ block, swiperRef, attributes, otherSlides, calendarData, organizerData }) => {

  const  isValidBlock = block && block instanceof HTMLElement;

  // must include block instances
  if(!block || !isValidBlock) return;

  const controller = {
    /**
     * EVENTS DATA
     * 
     * Store normalized events data
     * 
     * @property {Map} eventsData - normalized events data
     * 
     * @since version 1.0.0
     */
    eventsData: new Map(),

    /**
     * ORGANIZER DATA
     * 
     * Store normalized organizer data
     * 
     * @property {Map} organizer - normalized organizer data
     * 
     * @since version 1.0.0
     */
    organizer: new Map(),

    /**
     * SLIDER DATA
     * 
     * Store normalized slider data
     * 
     * @property {Map} sliderData - normalized slider data
     * 
     * @since version 1.0.0
     */
    sliderData: new Map(),

    /**
     * BLOG DATA
     * 
     * Store normalized blog data
     * 
     * @property {Map} blogData - normalized blog data
     * 
     * @since version 1.0.0
     */
    blogData: new Map(),

    /**
     * OTHER SLIDES DATA
     * 
     * Store normalized other slides data
     * 
     * @property {Map} otherSlides - normalized other slides data
     * 
     * @since version 1.0.0
     */
    otherSlides: new Map(),

    /**
     * CAROUSEL DATA
     * 
     * Store normalized carousel data
     * 
     * @property {Map} carouselData - normalized carousel data
     * 
     * @since version 1.0.0
     */
    carouselData: new Map(),

    /**
     * Normalize Data
     * 
     * Normalize data
     * 
     * @param {string} key - data key
     * @param {Array} data - data
     * 
     * @returns {void}
     * 
     * @since version 1.0.0
     */
    normalizeData: (key = "", data = {}) => {
      // Fix: Check for null/undefined or empty arrays/objects correctly
      const hasData = data && (Object.keys(data).length > 0);

      switch(key) {
        case "organizer":
          if(!hasData) {
            Object.entries(PRESETS.organizer).forEach(([k, v]) => controller.organizer.set(k, v));
            return;
          }
          const orgMerged = {...PRESETS.organizer, ...data};
          Object.entries(orgMerged).forEach(([k, v]) => controller.organizer.set(k, v));
          break;

        case "events":
          if(!hasData) return;
          for(const [index, value] of Object.entries(data)) {
            const evtMerged = {
              ...PRESETS.event, 
              ...value, 
              id: `event-${index}`, 
              eventId: index || null
            }
            controller.eventsData.set(`events-${index}`, evtMerged);
          }
          break;

        case "slider":
          if(!hasData) return;
          for(const [index, value] of Object.entries(data)) {
            const slMerged = {
              ...PRESETS.slider, 
              ...value, 
              id: `slider-${index}`, 
              eventId: index || null
            }
            controller.sliderData.set(`slide-${index}`, slMerged);
          }
          break;

        case "carousel":
          if(!hasData) return;
          for(const [index, value] of Object.entries(data)) {
            const crMerged = {
              ...PRESETS.carousel, 
              ...value, 
              id: `carousel-${index}`, 
              eventId: index || null
            }
            controller.carouselData.set(`carousel-${index}`, crMerged);
          }
          break;

        case "blog":
          if(!hasData) return;
          for(const [index, value] of Object.entries(data)) {
            const blMerged = {
              ...PRESETS.blog, 
              ...value, 
              id: `event-${index}`, 
              eventId: index || null
            }
            controller.blogData.set(`blog-${index}`, blMerged);
          }
          break;

        case "otherSlides":
          if(!hasData) return;
          const otherArray = Array.isArray(data) ? data : [data];
          otherArray.forEach((item, index) => {
            if( item && typeof item === "object" && Object.keys(item).length ) {
              const oSMerged = {
                ...PRESETS.otherSlides, 
                ...item, 
                id: `other-slide-${index}`, 
                eventId: index || null
              };
              controller.otherSlides.set(`other-slide-${index}`, oSMerged);
            }
          });
          break;
      }
      return;
    },

    /**
     * RENDER CAROUSEL
     * 
     * render carousel template
     * 
     * @returns {HTMLElement}
     * 
     * @since version 1.0.0
     */
    renderEventsCarousel: () => {
      const 
      carouselItems = [],
      carouselData = controller.carouselData,
      carouselConfig = {
        id: "test",
        styles: {
          /*bgColor: "transparent",
          textColor: "blue",
          accentColor: "yellow",
          buttonColor: "orange",
          paginationColor: "green",
          ageBgColor: "purple"*/
        },
        limiter: 6,
        swiperOptions: {},
      };

      for(const value of carouselData.values()) {
        carouselItems.push(value);
      }
      
      const carousel = eventCarousel(
        carouselItems,   // carrousel items
        carouselConfig,  // carrousel configs
      );

      return carousel;
    },

    /**
     * RENDER BLOG
     * 
     * render blog template
     * 
     * @returns {HTMLElement}
     * 
     * @since version 1.0.0
     */
    renderEventsBlog: () => {
      const 
      blogItems = [],
      blogData = controller.blogData,
      organizerData = controller.organizer,
      blogConfig = {
        id: "test",
        styles: {
          bgColor: "red",
          textColor: "blue",
          accentColor: "yellow",
          buttonColor: "orange",
          paginationColor: "green",
          ageBgColor: "purple"
        },
        seo: {
          title: "Rhythmz Lounge - Night Club | Upcoming Events",
          keywords:
            "Events, Omaha, Nebraska, Rhythmz Lounge, Nightclub, Nightclub in Omaha, Nightclub in Nebraska, Nightclub in Omaha, NE, Nightclub in 68137, Nightclub at 10841 Q Street, Omaha, NE 68137",
          description: "A list of upcoming events at Rhythmz Lounge - Night Club",
        },
        organizer: organizerData,
        popupStyle: {},
      };

      for(const [key, value] of blogData) {
        blogItems.push(value);
      }

      const blog = EventsBlog(blogItems, blogConfig);
      return blog;
    },

    /**
     * RENDER BOOKING MAP
     * 
     * render booking map template
     * 
     * @returns {HTMLElement}
     * 
     * @since version 1.0.0
     */
    renderBookingMap: () => {
      const 
      temp = document.createElement("div"),
      mapEl = initBookingApp();

      // assign class to map element
      temp.classList.add('__eb_booking', 'in_page');

      // mapEl is valid and an HTMLElement
      // append map to temp
      // else assign text content
      (mapEl && mapEl instanceof HTMLElement)
      ? temp.append(mapEl)
      : temp.textContent = "Booking App Not Loaded. Contact Admin for more information";

      return temp; // return the temp element
    },

    /**
     * RENDER SLIDER
     * 
     * render slider template
     * 
     * @returns {Object}
     * 
     * @since version 1.0.0
     */
    renderEventsSlider: () => {
      const 
      eventSlides = controller.sliderData,
      otherSlides = controller.otherSlides,
      eventSlidesCollection = [],
      otherSlidesCollection = [];

      console.log("calendarData",calendarData);
      console.log("eventSlides",eventSlides);
      console.log("otherSlides", otherSlides);
      console.log("organizerData", controller.organizer);

      // create slides
      for(const value of eventSlides.values()) {
        eventSlidesCollection.push(value);
      }

      // create all other slides
      for(const [key, value] of otherSlides) {
        otherSlidesCollection.push(otherSlides.get(key));
      }

      // event slide limiter
      const limiter = attributes?.slider?.limiter && typeof attributes?.slider?.limiter === "number" && attributes?.slider?.limiter > 0
      ? attributes.slider.limiter
      : 4;

      // only limit the number of events slides based on the slider settings
      const allowedSlides = [
        ...otherSlidesCollection,
        ...eventSlidesCollection.slice(0, limiter) 
      ];

      // create slider
      const slider = eventsSlider(allowedSlides, {id: 'test'});
      
      return slider;
    },

    /**
     * LOAD
     * 
     * Load events data
     * 
     * @returns {void}
     * 
     * @since version 1.0.0
     */
    load: (calendarData = {}, organizer = {}, otherSlidesData = {}) => {
      // check if calendar data or organizer data is not available
      if(!calendarData || !isValidObject(calendarData)) {
        // show message
        console.error("Calendar data is not available");
        return false;
      }
      if (!organizer || !isValidObject(organizer)) {
        // show message
        console.error("Organizer data is not available");
        return false;
      }

      // assign values to controller
      controller.normalizeData("events", calendarData);
      controller.normalizeData("organizer", organizer);
      controller.normalizeData("blog", calendarData);
      controller.normalizeData("slider", calendarData);
      controller.normalizeData("carousel", calendarData);
      controller.normalizeData("otherSlides", attributes?.slides?.otherSlides || []);

      // add additional options to slider collection
      for( const [key, value] of controller.sliderData) {
        const prevData = controller.sliderData.get(key);

        if( prevData?.slideType === 'event-slide') {
          controller.sliderData.set(key, {
            ...prevData,
            buttonOne: { ...attributes?.slides?.buttonOne || {} },
            buttonTwo: { ...attributes?.slides?.buttonTwo || {} }
          });
        } else {
          controller.sliderData.set(key, {
            ...prevData,
            buttonOne: { ...attributes?.slides?.otherSlides?.buttonOne || {} },
            buttonTwo: { ...attributes?.slides?.otherSlides?.buttonTwo || {} }
          });
        }
      }

      // return true
      return true;
    },

    

    /**
     * CLEANUP
     * 
     * Cleanup events data
     * 
     * @returns {void}
     * 
     * @since version 1.0.0
     */
    cleanup: () => {
      if(isValidBlock) block.innerHTML = '';
      return;
    },

    /**
     * RENDER
     * 
     * Render events data
     * 
     * @returns {void}
     * 
     * @since version 1.0.0
     */
    render: () => {
      if(!isValidBlock) return;
      
      controller.cleanup();

      // append event slider to block
      if(attributes?.slider?.display === true) {
        const slider = controller.renderEventsSlider(); // add slider render view template
        if(slider && slider instanceof Object && Object.keys(slider).length) {
          if (slider?.markup && slider?.markup instanceof HTMLElement) {
            // if slider is true and slider is an HTMLElement
            block.append(slider.markup);
            // initialize slider
            slider?.init?.();
          }
        }
      }

      // append events carousel to block
      if(attributes?.events?.display === true) {
        if(attributes?.events?.layout && attributes?.events?.layout === 'carousel') {
          const carousel = controller.renderEventsCarousel();
          if(carousel && carousel instanceof Object && Object.keys(carousel).length) {
            if(carousel?.markup && carousel.markup instanceof HTMLElement) {
              block.append(carousel.markup);
              carousel?.init?.();
            }
          }
        }
      }

      // append events blog to block
      if(attributes?.events?.display === true) {
        if(attributes?.events?.layout && attributes?.events?.layout === 'blog') {
          const blog = controller.renderEventsBlog();
          if(blog && blog instanceof HTMLElement) {
            block.append(blog);
          }
        }
      }

      // append booking map to block
      if(attributes?.booking?.display === true) {
        const bookingEl = controller.renderBookingMap();
        if(bookingEl && bookingEl instanceof HTMLElement) {
          // if booking map is true and booking map is an HTMLElement
          block.append(bookingEl);
        }
      }

      return;
    },

    /**
     * UPDATE
     * 
     * Update events data
     * 
     * @returns {void}
     * 
     * @since version 1.0.0
     */
    update: (calendarData, organizerData, otherSlidesData) => {
      const isLoaded = controller.load(calendarData, organizerData, otherSlidesData);
      if(isLoaded && isValidBlock) {
        controller.render();
        return true;
      }
      return false;
    },
  };

  return controller;
}

export { Controller };
