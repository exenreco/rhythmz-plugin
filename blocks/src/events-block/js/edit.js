"use strict";

import { useBlockProps } from "@wordpress/block-editor";
import { useState, useEffect, useRef } from "@wordpress/element";
import { Setup } from "../libs/setup.js";
import { Sidebar } from "./sidebar.js";
import { ToolBar } from "./toolbar.js";


const Edit = (props) => {
  // Create a specific ref for the inner content, not the wrapper
  const 

  contentRef = useRef(null),

  swiperRef = useRef(null),

  [hasLoaded, setHasLoaded] = useState(false),

  [cartData, setCartData] = useState({}),

  [calendarData, setCalendarData] = useState({}),

  [otherSlides, setOtherSlides] = useState({}),

  { attributes, setAttributes, clientId } = props,

  { blockClassName, slider, slides, events } = attributes;

  // Apply block id if not already set
  useEffect(() => {
    if ( ! blockClassName ) setAttributes( { 
      blockClassName: `events-block-${ clientId }` 
    } );
  }, [ clientId, blockClassName, setAttributes ] );


  const // Use the saved blockClassName (or fall back to clientId for the immediate first render)
    uniqueClassName = blockClassName || `events-block-${clientId}`,
    classes = [
      "events-block",
      `${uniqueClassName}`,
      attributes.align ? `align-${attributes.align}` : null,
      attributes.justify ? `justify-${attributes.justify}` : null,
    ]
      .filter(Boolean)
      .join(" "),
    eventsJson = JSON.stringify(attributes.events || {}),
    sliderJson = JSON.stringify(attributes.slider || {}),
    slidesJson = JSON.stringify(attributes.slides || {}),
    bookingJson = JSON.stringify(attributes.booking || {}),
    blockProps = useBlockProps({
      onClick: () => console.log("Attributes:", attributes),
      className: classes,
      "data-events": eventsJson,
      "data-slider": sliderJson,
      "data-slides": slidesJson,
      "data-booking": bookingJson,
    });

  // 1. Data Fetching Effect
  useEffect(() => {
    const checkData = setInterval(() => {
      // Check if the global object exists (regardless of whether it has events inside)
      const RhythmzData = window?.RhythmzEventsBlockData;

      if (RhythmzData) {
        // 1. Load the data (even if it is empty)
        setCartData(window?.cart_data || {});
        setCalendarData(RhythmzData.events || {});
        setOtherSlides(RhythmzData.otherSlides || {});

        // 2. Mark as Loaded
        setHasLoaded(true);

        // 3. Stop checking
        clearInterval(checkData);
      }
    }, 50);

    // Timeout fallback: If data doesn't load in 5 seconds, stop trying so we don't run forever
    const timeout = setTimeout(() => {
      clearInterval(checkData);
      // Optional: setHasLoaded(true) here if you want to render an empty state on timeout
    }, 5000);

    return () => {
      clearInterval(checkData);
      clearTimeout(timeout);
    };
  }, []);


  // 2. Rendering Effect
  useEffect(() => {
    // Guard 1: Element must exist
    if (!contentRef.current) return;

    // Guard 2: Data must have finished loading (even if it's empty)
    if (!hasLoaded) return;

    // Initialize the Vanilla JS Logic on the INNER ref
    const instance = Setup({
      block:        contentRef.current, // Pass the inner div
      hasLoaded:    hasLoaded,
      swiperRef:    swiperRef.current,
      attributes:   attributes,
      cartData:     cartData,
      otherSlides:  otherSlides,
      calendarData: calendarData,
    });

    instance.render();
    
    return () => instance?.cleanup?.();

    // FIX: Removed 'isSelected' from dependencies to prevent flash on click.
    // Only re-render if data or deep attributes change.
  }, [attributes, calendarData, otherSlides, cartData]);

  return (
    <>
      <Sidebar {...props} />
      <ToolBar {...props} />
      <style type="text/css" rel="stylesheet">
        {(() => `
          .events-block.${uniqueClassName} {
            ${
              slider?.display && slider.display === true
                ? `
              /*
              ** SLIDER
              **=========================================================*/
              /* Slider */
              --EB-slider-min-height: ${slider?.minHeight || "100vh"};

              /* Autoplay colors */
              --EB-autoplay-bg: ${
                slider?.autoplay?.colors?.autoplayBg || "cornflowerblue"
              };
              --EB-autoplay-color: ${
                slider?.autoplay?.colors?.autoplayColor || "white"
              };

              /* pagination colors */
              --EB-pagination-color: ${
                slider?.pagination?.colors?.pagColor || "white"
              };
              --EB-pagination-bg: ${
                slider?.pagination?.colors?.pagBg || "gray"
              };
              --EB-pagination-hover-bg: ${
                slider?.pagination?.colors?.pagBgHover || "cornflowerblue"
              };
              --EB-pagination-active-bg: ${
                slider?.pagination?.colors?.pagBgActive || "cornflowerblue"
              };

              /* navigation colors */
              --EB-nav-color: ${
                slider?.navigation?.colors?.navColor || "white"
              };
              --EB-nav-hover-color: ${
                slider?.navigation?.colors?.navColorHover || "white"
              };
              --EB-nav-bg: ${
                slider?.navigation?.colors?.navBgGradient
                  ? slider?.navigation?.colors?.navBgGradient
                  : slider?.navigation?.colors?.navBg || "#333"
              };
              --EB-nav-hover-bg: ${
                slider?.navigation?.colors?.navBgGradientHover
                  ? slider?.navigation?.colors?.navBgGradientHover
                  : slider?.navigation?.colors?.navBgHover || "#333"
              };
              --EB-nav-iconSize: ${slider?.navigation?.size || "1.8rem"};

              /* slides template colors */
              --EB-text-color: ${slides?.colors?.slideText || "white"};
              --EB-title-color: ${slides?.colors?.slideText || "white"};
              --EB-accent-color: ${
                slides?.colors?.accentColor || "cornflowerblue"
              };

              --EB-meta-tag-color: ${slides?.colors?.metaColor || "#333"};
              --EB-meta-text-color: ${slides?.colors?.textColor || "white"};

              --EB-template-bg: ${slides?.colors?.slideBackground || "#000"};
              --EB-template-fader-bg: ${
                slides?.colors?.slideBackground || "#000"
              };
              --EB-template-overlay-bg: ${
                slides?.colors?.overlayColor || "#333"
              };
            `
                : ""
            }
          }
          
          /* SLIDER */
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper {
            border-top: 
              ${slider?.borders?.top?.width || "none"}
              ${slider?.borders?.top?.style || "none"}
              ${slider?.borders?.top?.color || "#000"};
            border-left: 
              ${slider?.borders?.left?.width || "none"}
              ${slider?.borders?.left?.style || "none"}
              ${slider?.borders?.left?.color || "#000"};
            border-right: 
              ${slider?.borders?.right?.width || "none"}
              ${slider?.borders?.right?.style || "none"}
              ${slider?.borders?.right?.color || "#000"};
            border-bottom: 
              ${slider?.borders?.bottom?.width || "none"}
              ${slider?.borders?.bottom?.style || "none"}
              ${slider?.borders?.bottom?.color || "#000"};
            border-top-left-radius: ${slider?.radius?.topLeft || "0px"};
            border-top-right-radius: ${slider?.radius?.topRight || "0px"};
            border-bottom-left-radius: ${slider?.radius?.bottomLeft || "0px"};
            border-bottom-right-radius: ${slider?.radius?.bottomRight || "0px"};
            font-size: ${slider?.fontSize || "1rem"};
            color: ${slider?.colors?.sliderColor || "initial"};
            background-color: ${slider?.colors?.sliderBackground || "initial"};
          }

          /* SLIDER NAVIGATION */
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper .swiper-button-next,
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper .swiper-button-prev {
            display: ${
              slider?.navigation?.display &&
              slider?.navigation?.display === true
                ? "flex"
                : "none"
            };
            visibility: ${
              slider?.navigation?.display &&
              slider?.navigation?.display === true
                ? "visible"
                : "hidden"
            };
            padding-top: ${slider?.navigation?.padding?.top || "0px"};
            padding-left: ${slider?.navigation?.padding?.left || "0px"};
            padding-right: ${slider?.navigation?.padding?.right || "0px"};
            padding-bottom: ${slider?.navigation?.padding?.bottom || "0px"};
            border-top: 
              ${slider?.navigation?.borders?.top?.width || "none"}
              ${slider?.navigation?.borders?.top?.style || "none"}
              ${slider?.navigation?.borders?.top?.color || "#000"};
            border-left: 
              ${slider?.navigation?.borders?.left?.width || "none"}
              ${slider?.navigation?.borders?.left?.style || "none"}
              ${slider?.navigation?.borders?.left?.color || "#000"};
            border-right: 
              ${slider?.navigation?.borders?.right?.width || "none"}
              ${slider?.navigation?.borders?.right?.style || "none"}
              ${slider?.navigation?.borders?.right?.color || "#000"};
            border-bottom: 
              ${slider?.navigation?.borders?.bottom?.width || "none"}
              ${slider?.navigation?.borders?.bottom?.style || "none"}
              ${slider?.navigation?.borders?.bottom?.color || "#000"};
            border-top-left-radius: ${
              slider?.navigation?.radius?.topLeft || "100px"
            };
            border-top-right-radius: ${
              slider?.navigation?.radius?.topRight || "100px"
            };
            border-bottom-left-radius: ${
              slider?.navigation?.radius?.bottomLeft || "100px"
            };
            border-bottom-right-radius: ${
              slider?.navigation?.radius?.bottomRight || "100px"
            };
          }

          /* SLIDER PAGINATION */
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper-pagination {
            display: ${
              slider?.pagination?.display &&
              slider?.pagination?.display === true
                ? "flex"
                : "none"
            };
            visibility: ${
              slider?.pagination?.display &&
              slider?.pagination?.display === true
                ? "visible"
                : "hidden"
            };
          }
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper-pagination .markers {
            display: ${
              slider?.pagination?.markers &&
              slider?.pagination?.markers === true
                ? "flex"
                : "none"
            };
            visibility: ${
              slider?.pagination?.markers &&
              slider?.pagination?.markers === true
                ? "visible"
                : "hidden"
            };
          }
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper-pagination .markers .marker-item {
            border-top: 
              ${slider?.pagination?.borders?.top?.width || "none"}
              ${slider?.pagination?.borders?.top?.style || "none"}
              ${slider?.pagination?.borders?.top?.color || "#333333"};
            border-left: 
              ${slider?.pagination?.borders?.left?.width || "none"}
              ${slider?.pagination?.borders?.left?.style || "none"}
              ${slider?.pagination?.borders?.left?.color || "#333333"};
            border-right: 
              ${slider?.pagination?.borders?.right?.width || "none"}
              ${slider?.pagination?.borders?.right?.style || "none"}
              ${slider?.pagination?.borders?.right?.color || "#333333"};
            border-bottom: 
              ${slider?.pagination?.borders?.bottom?.width || "none"}
              ${slider?.pagination?.borders?.bottom?.style || "none"}
              ${slider?.pagination?.borders?.bottom?.color || "#333333"};
            border-top-left-radius: ${
              slider?.pagination?.radius?.topLeft || "100px"
            };
            border-top-right-radius: ${
              slider?.pagination?.radius?.topRight || "100px"
            };
            border-bottom-left-radius: ${
              slider?.pagination?.radius?.bottomLeft || "100px"
            };
            border-bottom-right-radius: ${
              slider?.pagination?.radius?.bottomRight || "100px"
            };
            padding-top: ${slider?.pagination?.padding?.top || "0px"};
            padding-left: ${slider?.pagination?.padding?.left || "0px"};
            padding-right: ${slider?.pagination?.padding?.right || "0px"};
            padding-bottom: ${slider?.pagination?.padding?.bottom || "0px"};
          }
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper-pagination .fractions {
            display: ${
              slider?.pagination?.fractions &&
              slider?.pagination?.fractions === true
                ? "flex"
                : "none"
            };
            visibility: ${
              slider?.pagination?.fractions &&
              slider?.pagination?.fractions === true
                ? "visible"
                : "hidden"
            };
          }
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper-pagination .fractions .separator {
            color: ${slider?.pagination?.colors?.separatorColor || "#fff"};
          }
          
          /* SLIDER AUTOPLAY */
          .events-block.${uniqueClassName} .__eb_inst_tar .swiper .autoplay-progress {
            display: ${
              slider?.swiper?.autoplay && slider?.swiper?.autoplay === true
                ? "flex"
                : "none"
            };
            visibility: ${
              slider?.swiper?.autoplay && slider?.swiper?.autoplay === true
                ? "flex"
                : "none"
            };
            border-top: 
              ${slider?.autoplay?.borders?.top?.width || "none"}
              ${slider?.autoplay?.borders?.top?.style || "none"}
              ${slider?.autoplay?.borders?.top?.color || "#333333"};
            border-left: 
              ${slider?.autoplay?.borders?.left?.width || "none"}
              ${slider?.autoplay?.borders?.left?.style || "none"}
              ${slider?.autoplay?.borders?.left?.color || "#333333"};
            border-right: 
              ${slider?.autoplay?.borders?.right?.width || "none"}
              ${slider?.autoplay?.borders?.right?.style || "none"}
              ${slider?.autoplay?.borders?.right?.color || "#333333"};
            border-bottom: 
              ${slider?.autoplay?.borders?.bottom?.width || "none"}
              ${slider?.autoplay?.borders?.bottom?.style || "none"}
              ${slider?.autoplay?.borders?.bottom?.color || "#333333"};
            border-top-left-radius: ${
              slider?.autoplay?.radius?.topLeft || "100px"
            };
            border-top-right-radius: ${
              slider?.autoplay?.radius?.topRight || "100px"
            };
            border-bottom-left-radius: ${
              slider?.autoplay?.radius?.bottomLeft || "100px"
            };
            border-bottom-right-radius: ${
              slider?.autoplay?.radius?.bottomRight || "100px"
            };
            padding-top: ${slider?.autoplay?.padding?.top || "0px"};
            padding-left: ${slider?.autoplay?.padding?.left || "0px"};
            padding-right: ${slider?.autoplay?.padding?.right || "0px"};
            padding-bottom: ${slider?.autoplay?.padding?.bottom || "0px"};
          }

          /* Slide Template & links */
          .events-block .swiper .content .__template .__meta_tag.__date {
            ${
              slides?.date === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          .events-block .swiper .content .__template .__meta_tag.__time {
            ${
              slides?.time === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          .events-block .swiper .content .__template .__meta_tag.__age {
            ${
              slides?.age === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          .events-block .swiper .content .__template .__meta_tag.__price {
            ${
              slides?.price === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          .events-block .swiper .content .__template .__excerpt {
            ${
              slides?.excerpt === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          .events-block .swiper .content .__template .__left {
            ${
              slides?.poster === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          ${
            slides?.poster === true
              ? `
              .events-block .swiper .content .__template .__left {
                display: flex;
                visibility: visible;
              }
            `
              : `
              .events-block .swiper .content .__template .__left {
                display: none;
                visibility: hidden;
              }
              .events-block .swiper .content .__template .__right {
                width: 100%;
                display: flex;
                max-width: 1440px;
                align-items: center;
                justify-content: center;
                
              }
            `
          }
          .events-block .swiper .content .__template .__title {
            ${
              slides?.title === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
          }
          .events-block .swiper .content .__template .__excerpt a,
          .events-block .swiper .content .__template .__excerpt a:link,
          .events-block .swiper .content .__template .__excerpt a:visited,
          .events-block .swiper .content .__template .__excerpt a:active,
          .events-block .swiper .content .__template .__excerpt a:focus {
            color: ${slides?.colors?.linkColor || "initial"};
            background: ${
              slides?.colors?.linkGradient
                ? slides?.colors?.linkGradient
                : slides?.colors?.linkBackground
                ? slides?.colors?.linkBackground
                : "initial"
            };
          }
          .events-block .swiper .content .__template .__excerpt a:hover {
            color: ${slides?.colors?.linkColorHover || "initial"};
            background: ${
              slides?.colors?.linkGradientHover
                ? slides?.colors?.linkGradientHover
                : slides?.colors?.linkBackgroundHover
                ? slides?.colors?.linkBackgroundHover
                : "initial"
            };
          }
          .events-block .swiper .content .__template .__actions .__btn,
          .events-block .swiper .content .__template .__actions .__btn.__ticket,
          .events-block .swiper .content .__template .__actions .__btn.__vip {
            padding-top: ${slides?.button?.padding?.top || "none"};
            padding-left: ${slides?.button?.padding?.left || "none"};
            padding-right: ${slides?.button?.padding?.right || "none"};
            padding-bottom: ${slides?.button?.padding?.bottom || "none"};
            border-top: 
              ${slides?.button?.borders?.top?.width || "none"}
              ${slides?.button?.borders?.top?.style || "none"}
              ${slides?.button?.borders?.top?.color || "initial"};
            border-left: 
              ${slides?.button?.borders?.left?.width || "none"}
              ${slides?.button?.borders?.left?.style || "none"}
              ${slides?.button?.borders?.left?.color || "initial"};
            border-right: 
              ${slides?.button?.borders?.right?.width || "none"}
              ${slides?.button?.borders?.right?.style || "none"}
              ${slides?.button?.borders?.right?.color || "initial"};
            border-bottom: 
              ${slides?.button?.borders?.bottom?.width || "none"}
              ${slides?.button?.borders?.bottom?.style || "none"}
              ${slides?.button?.borders?.bottom?.color || "initial"};
            border-top-left-radius: ${
              slides?.button?.radius?.topLeft || "initial"
            };
            border-top-right-radius: ${
              slides?.button?.radius?.topRight || "initial"
            };
            border-bottom-left-radius: ${
              slides?.button?.radius?.bottomLeft || "initial"
            };
            border-bottom-right-radius: ${
              slides?.button?.radius?.bottomRight || "initial"
            };
          }

          .events-block .swiper .content .__template .__actions .__btn.__ticket {
            ${
              slides?.buttonOne?.display === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
            color: ${slides?.colors?.slideBtnOneText || "initial"};
            background: ${
              slides?.colors?.slideBtnOneGradient
                ? slides?.colors?.slideBtnOneGradient
                : slides?.colors?.slideBtnOneBackground
                ? slides?.colors?.slideBtnOneBackground
                : "cornflowerblue"
            };
          }
          .events-block .swiper .content .__template .__actions .__btn.__ticket:hover {
            color: ${slides?.colors?.slideBtnOneTextHover || "initial"};
            background: ${
              slides?.colors?.slideBtnOneGradientHover
                ? slides?.colors?.slideBtnOneGradientHover
                : slides?.colors?.slideBtnOneBackgroundHover
                ? slides?.colors?.slideBtnOneBackgroundHover
                : "initial"
            };
          }
          .events-block .swiper .content .__template .__actions .__btn.__vip {
            ${
              slides?.buttonTwo?.display === true
                ? `display: flex; visibility: visible;`
                : `display: none; visibility: hidden;`
            }
            color: ${slides?.colors?.slideBtnTwoText || "initial"};
            background: ${
              slides?.colors?.slideBtnTwoGradient
                ? slides?.colors?.slideBtnTwoGradient
                : slides?.colors?.slideBtnTwoBackground
                ? slides?.colors?.slideBtnTwoBackground
                : "initial"
            };
          }
          .events-block .swiper .content .__template .__actions .__btn.__vip:hover {
            color: ${slides?.colors?.slideBtnTwoTextHover || "initial"};
            background: ${
              slides?.colors?.slideBtnTwoGradientHover
                ? slides?.colors?.slideBtnTwoGradientHover
                : slides?.colors?.slideBtnTwoBackgroundHover
                ? slides?.colors?.slideBtnTwoBackgroundHover
                : "initial"
            };
          }
          ${
            slides?.otherSlides &&
            slides?.otherSlides.length > 0 &&
            slides?.otherSlides.map(
              (slide, index) => `
              .events-block .swiper .content .__template.custom.custom-item-${index} .__overlay {
                background: ${
                  slides?.colors[`customSlide-${index}-overlayBackground`] ||
                  "#000000"
                };
                background-color: ${
                  slides?.colors[`customSlide-${index}-overlayBackground`] ||
                  "#000000"
                };
              }
            `,
            )
          }
        `)()}
      </style>
      <div {...blockProps}>
        <div ref={contentRef} className="__eb_inst_tar" />
      </div>
    </>
  );
};

export { Edit };
