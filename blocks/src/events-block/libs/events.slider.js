
import "swiper/css";
import Swiper from "swiper/bundle";
import { getIcon } from "../../../assets/js/icons.js";
import { createMarkup, mediaPlaceholder, formatDate } from "./utils.js";

const
slideTemplate = (item) => {
  const
  hasMedia = item && 'mediaSrc' in item && item?.mediaSrc?.trim().length > 0 ? true : false,
  eventSlideTemp = `
    <div class="__template two-column"> 
      <div class="__left">
        <div class="__backdrop"></div>
        <div class="__poster"></div>
      </div>
      <div class="__right">
        <div class="__container">
          <span class="featured">Featured Event</span>
          <h2 class="title"></h2>
          <span class="meta">
            <span class="item date">
              <i class="meta-icon"></i>
              <i class="meta-text"></i>
            </span>
            <span class="item time">
              <i class="meta-icon"></i>
              <i class="meta-text"></i>
            </span>
            <span class="item age">
              <i class="meta-icon"></i>
              <i class="meta-text"></i>
            </span>
            <span class="item price">
              <i class="meta-icon"></i>
              <i class="meta-text"></i>
            </span>
          </span>
          <span class="excerpt"><p class="text"></p></span>
          <span class="__actions">
            <a class="__ticket btn">Get Tickets</a>
            <a class="__booking btn">The VIP Experience</a>
          </span>
        </div>
      </div>
    </div>
  `,
  otherSlideTemp = `
    <div class="__template one-column">
      <div class="__poster"></div>
      <div class="__container">
      <h2 class="title zapfino">EVENT TITLE</h2>
      <h3 class="tagline">event tagline</h2>
      <span class="excerpt hidden"><p class="text">event excerpt</p></span>
        <span class="__actions">
          <a class="__ticket btn">Get Tickets</a>
          <a class="__booking btn">The VIP Experience</a>
        </span>
      </div>
    </div>
  `,
  eventDateTime = formatDate(item?.startDate || new Date().toISOString());

  let tempMedia;
  if( hasMedia ) {
    if( item?.mimeType === 'video' ) {
      tempMedia = createMarkup('video', 
        {src: item?.mediaSrc || '', alt: `${item?.title || 'event'} poster`},
        {loading: "lazy", class: 'poster'}
      );

      tempMedia.loop = true;
      tempMedia.muted = true;
      tempMedia.autoplay = true;
      tempMedia.controls = false;
      tempMedia.playsInline = true;
    } else {
      tempMedia = createMarkup('img', 
        {src: item?.mediaSrc || '', alt: `${item?.title || 'event'} poster`},
        {class: 'poster', loading: "lazy"}
      );
    }
  } else {
    tempMedia = mediaPlaceholder({
      date: `${eventDateTime.month || '--'} ${eventDateTime.day || '--'}, ${eventDateTime.year || '----'} @ ${eventDateTime.time || '--:--'}`,
      title: item?.title || '',
      venue: item?.venueName || 'Rhythmz'
    });
  }
  console.log('item', item);

  if(item?.slideType && item?.slideType?.trim()?.toLowerCase() === 'event-slide') {
    // event-slide template
    const slideItem = createMarkup('div', 
      {innerHTML: eventSlideTemp}, 
      {class: 'slider-item event-slide'}
    );
    slideItem._ref = {
      title: slideItem.querySelector('.title'),
      poster: slideItem.querySelector('.__poster'),
      action: slideItem.querySelector('.__actions'),
      backdrop: slideItem.querySelector('.__backdrop'),
      date: slideItem.querySelector('.meta .date .meta-text'),
      time: slideItem.querySelector('.meta .time .meta-text'),
      age: slideItem.querySelector('.meta .age .meta-text'),
      price: slideItem.querySelector('.meta .price .meta-text'),
      dateIcon: slideItem.querySelector('.meta .date .meta-icon'),
      timeIcon: slideItem.querySelector('.meta .time .meta-icon'),
      ageIcon: slideItem.querySelector('.meta .age .meta-icon'),
      priceIcon: slideItem.querySelector('.meta .price .meta-icon'),
      excerpt: slideItem.querySelector('.excerpt .text'),
      slideType: item?.slideType?.toLowerCase() || 'event-slide',
      bookBtn: slideItem.querySelector('.__actions .__booking'),
      ticketBtn: slideItem.querySelector('.__actions .__ticket'),
    };

    // event date
    const dateLabel = createMarkup('span', {textContent:  'Date: '}, {class: 'icon-label'});
    slideItem._ref.dateIcon.append(getIcon('calendar-regular'), dateLabel);
    slideItem._ref.date.textContent = `${eventDateTime.month} ${eventDateTime.day}, ${eventDateTime.year}`;

    // event time
    const timeLabel = createMarkup('span', {textContent:  'Time: '}, {class: 'icon-label'});
    slideItem._ref.timeIcon.append(getIcon('clock-solid'), timeLabel);
    slideItem._ref.time.textContent = eventDateTime.time;

    // event age
    const ageLabel = createMarkup('span', {textContent:  'Age: '}, {class: 'icon-label'});
    slideItem._ref.ageIcon.append(getIcon('user-solid'), ageLabel);
    slideItem._ref.age.textContent = `${item?.ageRestriction || '--'} Event`;

    // event price
    const priceLabel = createMarkup('span', {textContent:  'From: '}, {class: 'icon-label'});
    slideItem._ref.priceIcon.append(getIcon('dollar-solid'), priceLabel);
    slideItem._ref.price.textContent = `$${item?.lowPrice || '_.__'}`;

    // event excerpt
    slideItem._ref.excerpt.textContent = item?.excerpt || 'missing excerpt';

    // append media
    slideItem._ref.poster.append(tempMedia);

    // append title
    slideItem._ref.title.textContent = item?.title || '';
    console.log('item', item);

    // append backdrop
    if( hasMedia ){
       slideItem._ref.backdrop.append(tempMedia.cloneNode(true));
      //slideItem._ref.backdrop.style.backgroundImage = `url(${item.imgSrc})`;
    } else {
      slideItem._ref.backdrop.classList.add('no-image');
    }

    // set ticket action
    slideItem._ref.ticketBtn.textContent = item?.buttonOne?.label || 'Get Tickets';
    slideItem._ref.ticketBtn.setAttribute('href', item?.buttonOne?.url || '#');

    // set booking action
    slideItem._ref.bookBtn.textContent = item?.buttonTwo?.label || 'The VIP Experience';
    slideItem._ref.bookBtn.setAttribute('href', item?.buttonTwo?.url || '#');

    return slideItem;
  } else {
    // other-slide template
    const slideItem = createMarkup('div', 
      {innerHTML: otherSlideTemp}, 
      {class: 'slider-item other-slide'}
    );
    slideItem._ref = {
      title: slideItem.querySelector('.title'),
      tagline: slideItem.querySelector('.tagline'),
      action: slideItem.querySelector('.__actions'),
      poster: slideItem.querySelector('.__poster'),
      excerpt: slideItem.querySelector('.excerpt .text'),
      excerptText: slideItem.querySelector('.excerpt .text'),
      slideType: item?.slideType?.toLowerCase() || 'other-slide',
      bookBtn: slideItem.querySelector('.__actions .__booking'),
      ticketBtn: slideItem.querySelector('.__actions .__ticket'),
    };

    if( hasMedia ) {
      slideItem._ref.poster.append(tempMedia);
    } else {
      slideItem._ref.poster.classList.add('no-image');
    }

    slideItem._ref.title.textContent = item?.title || '';
    slideItem._ref.tagline.textContent = item?.tagline || '';
    slideItem._ref.excerptText.textContent = item?.excerpt || '';
    slideItem._ref.excerpt = item?.excerpt && item?.excerpt?.trim().length >= 1
     ? slideItem._ref.excerpt.classList.remove('hidden')
     : slideItem._ref.excerpt.classList.add('hidden');

    // set ticket action
    slideItem._ref.ticketBtn.textContent = item?.buttonOne?.label || 'Get Tickets';
    slideItem._ref.ticketBtn.setAttribute('href', item?.buttonOne?.url || '#');

    // set booking action
    slideItem._ref.bookBtn.textContent = item?.buttonTwo?.label || 'The VIP Experience';
    slideItem._ref.bookBtn.setAttribute('href', item?.buttonTwo?.url || '#');
    
    return slideItem;
  }
},
sliderTemplate = (id)=> {
  const
  sliderTemp = `
    <div id="${id}-slider" class="slider slider-container">
      <div class="slider-wrapper"></div>
      <div class="slider-pagination"></div>
      <div class="slider-next"></div>
      <div class="slider-prev"></div>
    </div>
  `,
  container = createMarkup('div',
    {id: `${id}-slider-container`, innerHTML: sliderTemp},
    {class: '__slider_container'}
  );

  container._ref = {
    next: container.querySelector(`#${id}-slider .slider-next`),
    prev: container.querySelector(`#${id}-slider .slider-prev`),
    slider: container.querySelector(`#${id}-slider`),
    wrapper: container.querySelector(`#${id}-slider .slider-wrapper`),
    pagination: container.querySelector(`#${id}-slider .slider-pagination`),
  };

  container._ref.next.append(getIcon('chevron-right-solid'));
  container._ref.prev.append(getIcon('chevron-left-solid'));

  return container;
},
eventsSlider = (data = [], configs = {}, callback = null)=>{
  if(!data.length) return {
    markup: createMarkup(
      'div',
      {innerHTML:`
        <p class="__empty">
          <i class="__icon fa-regular fa-calendar-xmark"></i></span>
          <span class="__empty_text">
            There was an error retrieving events,<br>please try again later!
          </span>
        </p>
      `},
      {class: '__slider_container'},
    ),
    init: () => {}
  }

  const
  sliderId = configs.id || data[0].id || "__eb_slider",
  markup = sliderTemplate(sliderId),
  swiperEl = markup._ref.slider || null,
  swiperNext = markup._ref.next || null,
  swiperPrev = markup._ref.prev || null,
  swiperPagination = markup._ref.pagination || null,
  swiperWrapper = markup._ref.wrapper || null;

  // css variables map
  const styleMap = {
    bgColor: "--eb-carousel-bg-color",
    textColor: "--eb-carousel-text-color",
    paginationColor: "--eb-carousel-pagination-color",
    accentColor: "--eb-carousel-accent-color",
    buttonColor: "--eb-carousel-button-color",
    ageBgColor: "--eb-carousel-age-background-color"
  };

  // style configuration
  if(configs.styles) {
    Object.entries(configs.styles).forEach(([key, value]) => {
      if (styleMap[key]) {
        markup.style.setProperty(styleMap[key], value);
      }
    });
  }

  // data limiting
  // const itemsToRender = configs.limiter ? data.slice(0, configs.limiter) : data;

  // creating slides
  const frag = document.createDocumentFragment();
  data.forEach((item) => {
    frag.append(slideTemplate(item));
  });
  if(swiperWrapper) swiperWrapper.append(frag);

  const init = () => {
    const attachCustomPaginationClickHandlers = (swiperInst) => {
      const pagEl = swiperInst.pagination.el;
      if (!pagEl || pagEl.dataset.listenerAttached) return;

      pagEl.addEventListener("click", (e) => {
        const marker = e.target.closest(".marker-item");
        if (!marker) return;
        const targetIndex = parseInt(marker.getAttribute("data-slide-to"), 10);
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
      loop: true,
      speed: 800,
      rewind: true,
      cssMode: false,
      parallax: false,
      freeMode: false,
      effect: "slide",
      grabCursor: true,
      slideClass: "slider-item",
      wrapperClass: "slider-wrapper",
      initialSlide: 0,
      spaceBetween: 0,
      slidesPerView: 1,
      centeredSlides: false,
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
        delay: 4200,
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

export { eventsSlider };
