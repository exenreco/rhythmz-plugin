"use strict";
import { isValidObject } from "../libs/utils.js";
import { Controller } from "../libs/controller.js";

((Controller, RhythmzEventsBlockData) => {
  function eventsBlock({ blockRef, targetRef, swiperEl }) {
    if (!blockRef || !targetRef) return;

    // PRE-CLEANUP
    // If an instance already exists on this element, clean it up first.
    // This prevents double-initialization bugs (e.g., two Swiper instances).
    if (targetRef.__blockInstance && typeof targetRef.__blockInstance.cleanup === "function") {
      console.log("Cleaning up existing instance before re-initializing");
      targetRef.__blockInstance.cleanup();
    }

    // PREPARE DATA
    const 
    eventsAttrString = blockRef.getAttribute("data-events"),
    sliderAttrString = blockRef.getAttribute("data-slider"),
    slidesAttrString = blockRef.getAttribute("data-slides"),
    bookingAttrString = blockRef.getAttribute("data-booking");

    const 
    eventsAttr = eventsAttrString ? JSON.parse(eventsAttrString) : {},
    sliderAttr = sliderAttrString ? JSON.parse(sliderAttrString) : {},
    slidesAttr = slidesAttrString ? JSON.parse(slidesAttrString) : {},
    bookingAttr = bookingAttrString ? JSON.parse(bookingAttrString) : {};



    const 
    RhythmzData = RhythmzEventsBlockData || {},
    hasLoaded = isValidObject(RhythmzData) ? true : false;

    if( hasLoaded ) {
      const calendarData = Object.hasOwn(RhythmzData, "events") && isValidObject(RhythmzData.events)
        ? RhythmzData.events
        : {};

      const otherSlides = Object.hasOwn(RhythmzData, "otherSlides") && isValidObject(RhythmzData.otherSlides)
        ? RhythmzData.otherSlides
        : {};
        
      const organizerData = Object.hasOwn(RhythmzData, "organizer") && isValidObject(RhythmzData.organizer)
        ? RhythmzData.organizer
        : {};

      const instance = Controller({
        block: targetRef,
        swiperEl: swiperEl,
        attributes: {
          events: eventsAttr,
          slider: sliderAttr,
          slides: slidesAttr,
          booking: bookingAttr,
        },
        otherSlides: otherSlides,
        calendarData: calendarData,
        organizerData: organizerData,
      });

      console.log("Instance", instance);

      if (instance && typeof instance.render === "function") {
        // instance.render();
        instance?.load?.(calendarData, organizerData, otherSlides);
        instance?.render?.();
        // keep instance on element so we can clean up if needed
        targetRef.__blockInstance = instance;
      } else if (typeof instance === "function") {
        // older setup style that returned a cleanup func; call it then use other APIs
        console.warn(
          "setup returned cleanup function — please adapt to instance API for frontend usage"
        );
      }
    }
  }

  function bootAllEventsBlock() {
    const blocks = document.querySelectorAll(".events-block");

    blocks.forEach((block) => {
      const BlockInstTarget = block.querySelector(".__eb_inst_tar"),
        swiperEl = document.createElement("div"),
        params = {
          blockRef: block,
          targetRef: BlockInstTarget,
          swiperEl: swiperEl,
        };

      if (block && BlockInstTarget) eventsBlock(params);
    });
  }

  // DOM READY TRIGGER ---
  (document.readyState === "loading") 
    ? document.addEventListener("DOMContentLoaded", bootAllEventsBlock)
    : bootAllEventsBlock();
})(Controller, window.RhythmzEventsBlockData);
