"use strict";

import { __ } from "@wordpress/i18n";
import { plus, chevronUp, chevronDown, media } from "@wordpress/icons";
import { useState } from "@wordpress/element";
import { UnitComponent } from "../../../assets/components/unit.component.js";
import { BorderComponent } from "../../../assets/components/border.component.js";
import { NumericComponent } from "../../../assets/components/numeric.component.js";
import { PaddingComponent } from "../../../assets/components/padding.component.js";
import { FontSizeComponent } from "../../../assets/components/fontsize.component.js";
import { DualTabPanel } from "../../../assets/components/dual.tabpanel.component.js";
import { AppearanceComponent } from "../../../assets/components/appearance.component.js";
import { BorderRadiusComponent } from "../../../assets/components/border.radius.component.js";

import {
  MediaUpload,
  MediaUploadCheck,
  InspectorControls
} from "@wordpress/block-editor";

import {
  Button,
  TabPanel,
  PanelRow,
  PanelBody,
  TextControl,
  ToggleControl,
  SelectControl,
  TextareaControl,
  __experimentalToolsPanel,
  __experimentalToolsPanelItem
} from "@wordpress/components";

import {
  sliderColorOptions,
  autoplayColorOptions,
  navigationColorOptions,
  paginationColorOptions,
  slidesColorOptions,
} from "./comp.config.js";





export const Sidebar = ({ attributes, setAttributes }) => {

    const ToolsPanel = __experimentalToolsPanel,
      ToolsPanelItem = __experimentalToolsPanelItem,
      /**
       * Slider Styles Panels
       *
       * Inspector controls governing slider styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-05
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      sliderStylesPanel = () => {
        return (
          <>
            <AppearanceComponent
              title="Slider Appearance"
              options={[...sliderColorOptions]}
              attributeName="slider"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <FontSizeComponent
              title="Font Size"
              attributeName="slider"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[{ key: "fontSize", label: "Font Size" }]}
            />
            <UnitComponent
              title="Dimensions"
              attributeName="slider"
              //subAttributeName="minHeight" not needed here
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "minHeight",
                  min: 0,
                  max: 1000,
                  step: 1,
                  label: "Minimum Height",
                  isShownByDefault: true,
                  units: [
                    { value: "px", label: "px" },
                    { value: "%", label: "%" },
                    { value: "vh", label: "vh" },
                    { value: "vw", label: "vw" },
                    { value: "em", label: "em" },
                    { value: "rem", label: "rem" },
                    { value: "pt", label: "pt" },
                  ],
                },
              ]}
            />
            <BorderComponent
              attributeName="slider"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderRadiusComponent
              attributeName="slider"
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </>
        );
      },
      /**
       * Slider Settings Panels
       *
       * Inspector controls governing slider settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-05
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      sliderSettingsPanel = () => {
        return (
          <>
            <NumericComponent
              title="Slider Speed"
              attributeName="slider"
              subAttributeName="swiper"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "speed",
                  min: 0,
                  max: 10000,
                  step: 100,
                  label: "Slider Speed",
                  isShownByDefault: true,
                },
              ]}
            />

            <SelectControl
              label="Slider Effect"
              value={attributes.slider.swiper?.effect || "fade"}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
              options={[
                { label: "Fade", value: "fade" },
                { label: "Cube", value: "cube" },
                { label: "Flip", value: "flip" },
                { label: "Slide", value: "slide" },
                { label: "Cards", value: "cards" },
                { label: "Creative", value: "creative" },
                { label: "Coverflow", value: "coverflow" },
              ]}
              onChange={(value) =>
                setAttributes({
                  slider: {
                    ...attributes.slider,
                    swiper: {
                      ...attributes.slider.swiper,
                      effect: value,
                    },
                  },
                })
              }
            />

            <ToolsPanel
              label="Slider Settings"
              className="events-block-settings"
              resetAll={() =>
                setAttributes({
                  slider: {
                    ...(attributes?.slider || {}),
                    display: true,
                    swiper: {
                      ...(attributes?.slider?.swiper || {}),
                      loop: true,
                      parallax: false,
                    },
                  },
                })
              }
            >
              <ToolsPanelItem
                label="Display Slider"
                hasValue={() => attributes?.slider?.display}
                onToggle={(value) =>
                  setAttributes({
                    slider: {
                      ...(attributes?.slider || {}),
                      display: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Slider"
                  checked={attributes?.slider?.display}
                  onChange={(value) =>
                    setAttributes({
                      slider: {
                        ...(attributes?.slider || {}),
                        display: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>

              <ToolsPanelItem
                label="Loop Slider"
                hasValue={() => attributes?.slider?.swiper?.loop}
                onToggle={(value) =>
                  setAttributes({
                    slider: {
                      ...(attributes?.slider || {}),
                      swiper: {
                        ...(attributes?.slider?.swiper || {}),
                        loop: value,
                      },
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Loop Slider"
                  checked={attributes?.slider?.swiper?.loop}
                  onChange={(value) =>
                    setAttributes({
                      slider: {
                        ...(attributes?.slider || {}),
                        swiper: {
                          ...(attributes?.slider?.swiper || {}),
                          loop: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>

              <ToolsPanelItem
                label="Add Parallax Effect"
                hasValue={() => attributes?.slider?.swiper?.parallax}
                onToggle={(value) =>
                  setAttributes({
                    slider: {
                      ...(attributes?.slider || {}),
                      swiper: {
                        ...(attributes?.slider?.swiper || {}),
                        parallax: value,
                      },
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Add Parallax Effect"
                  checked={attributes?.slider?.swiper?.parallax}
                  onChange={(value) =>
                    setAttributes({
                      slider: {
                        ...(attributes?.slider || {}),
                        swiper: {
                          ...(attributes?.slider?.swiper || {}),
                          parallax: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>
            </ToolsPanel>
          </>
        );
      },
      /**
       * Slides Styles Panels
       *
       * Inspector controls governing slides styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-05
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      slideEventsStylesPanel = () => {
        return (
          <>
            <AppearanceComponent
              title="Slide Appearance"
              options={[...slidesColorOptions]}
              attributeName="slides"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderComponent
              title="Button Border"
              attributeName="slides"
              subAttributeName="button"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <PaddingComponent
              title="Button Padding"
              attributeName="slides"
              subAttributeName="button"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderRadiusComponent
              title="Button Border Radius"
              attributeName="slides"
              subAttributeName="button"
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </>
        );
      },
      /**
       * Slides Settings Panels
       *
       * Inspector controls governing slides settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-05
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      slideEventsSettingsPanel = () => {
        return (
          <>
            <ToolsPanel
              label="Age Settings"
              className="events-block-settings"
              resetAll={() =>
                setAttributes({
                  slides: {
                    ...(attributes?.slides || {}),
                    age: true,
                    date: true,
                    time: true,
                    price: true,
                    poster: true,
                    excerpt: true,
                    buttonOne: true,
                    buttonTwo: true,
                  },
                })
              }
            >
              <ToolsPanelItem
                label="Display Age"
                hasValue={() => attributes?.slides?.age}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      age: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Age"
                  checked={attributes?.slides?.age}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        age: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Date"
                hasValue={() => attributes?.slides?.date}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      date: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Date"
                  checked={attributes?.slides?.date}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        date: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Time"
                hasValue={() => attributes?.slides?.time}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      time: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Time"
                  checked={attributes?.slides?.time}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        time: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Title"
                hasValue={() => attributes?.slides?.title}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      title: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Title"
                  checked={attributes?.slides?.title}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        title: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Price"
                hasValue={() => attributes?.slides?.price}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      price: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Price"
                  checked={attributes?.slides?.price}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        price: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Poster"
                hasValue={() => attributes?.slides?.poster}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      poster: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Poster"
                  checked={attributes?.slides?.poster}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        poster: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Excerpt"
                hasValue={() => attributes?.slides?.excerpt}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      excerpt: value,
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Excerpt"
                  checked={attributes?.slides?.excerpt}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        excerpt: value,
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Button One"
                hasValue={() => attributes?.slides?.buttonOne?.display}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      buttonOne: {
                        ...(attributes?.slides?.buttonOne || {}),
                        display: value,
                      },
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Button One"
                  checked={attributes?.slides?.buttonOne?.display}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        buttonOne: {
                          ...(attributes?.slides?.buttonOne || {}),
                          display: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              <ToolsPanelItem
                label="Display Button Two"
                hasValue={() => attributes?.slides?.buttonTwo?.display}
                onToggle={(value) =>
                  setAttributes({
                    slides: {
                      ...(attributes?.slides || {}),
                      buttonTwo: {
                        ...(attributes?.slides?.buttonTwo || {}),
                        display: value,
                      },
                    },
                  })
                }
                isShownByDefault={true}
              >
                <ToggleControl
                  label="Display Button Two"
                  checked={attributes?.slides?.buttonTwo?.display}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        buttonTwo: {
                          ...(attributes?.slides?.buttonTwo || {}),
                          display: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>
            </ToolsPanel>

            {attributes.slides.buttonOne.display === true && (
              <>
                <div className="events-block-separator" />
                <TextControl
                  label="Button One Label"
                  value={attributes.slides.buttonOne.label}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        buttonOne: {
                          ...(attributes?.slides?.buttonOne || {}),
                          label: value,
                        },
                      },
                    })
                  }
                />
                <TextControl
                  label="Button One URL"
                  value={attributes.slides.buttonOne.url}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        buttonOne: {
                          ...(attributes?.slides?.buttonOne || {}),
                          url: value,
                        },
                      },
                    })
                  }
                />
              </>
            )}
            {attributes.slides.buttonTwo.display === true && (
              <>
                <div className="events-block-separator" />
                <TextControl
                  label="Button Two Label"
                  value={attributes.slides.buttonTwo.label}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        buttonTwo: {
                          ...(attributes?.slides?.buttonTwo || {}),
                          label: value,
                        },
                      },
                    })
                  }
                />
                <TextControl
                  label="Button Two URL"
                  value={attributes.slides.buttonTwo.url}
                  onChange={(value) =>
                    setAttributes({
                      slides: {
                        ...(attributes?.slides || {}),
                        buttonTwo: {
                          ...(attributes?.slides?.buttonTwo || {}),
                          url: value,
                        },
                      },
                    })
                  }
                />
              </>
            )}
          </>
        );
      },
      /**
       * Other Slides Styles Panel
       *
       * Inspector controls governing other slides styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      customSlidesStylesPanel = (index, slide, updateSlide) => {
        return (
          <>
            <AppearanceComponent
              title="Appearance"
              attributeName="slides"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: (() => `overlay-${index}`)(),
                  label: "Overlay",
                  before: {
                    // normal state
                    hasText: false,
                    hasBackground: true,
                    hasBackgroundGradient: false,
                    backgroundKey: `customSlide-${index}-overlayBackground`,
                  },
                  after: {
                    // hover state
                    hasText: false,
                    hasBackground: false,
                    hasBackgroundGradient: false,
                  },
                },
              ]}
            />
          </>
        );
      },
      /**
       * Other Slides Settings Panel
       *
       * Inspector controls governing other slides settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      customSlidesSettingsPanel = (index, slide, updateSlide) => {
        return (
          <>
            {index !== null &&
              index !== undefined &&
              !isNaN(index) &&
              slide &&
              typeof slide === "object" &&
              updateSlide &&
              typeof updateSlide === "function" && (
                <>
                  <span
                    style={{
                      width: "100%",
                      height: "1px",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  />
                  <PanelRow>
                    <ToggleControl
                      label="Display Button One"
                      checked={slide.buttonOne.display}
                      onChange={(value) =>
                        updateSlide(index, "buttonOne", {
                          ...(slide.buttonOne || {}),
                          display: value,
                        })
                      }
                      __next40pxDefaultSize="30px"
                    />
                  </PanelRow>
                  {slide.buttonOne.display && (
                    <>
                      <TextControl
                        label="Button One Label"
                        value={slide.buttonOne.label}
                        onChange={(value) =>
                          updateSlide(index, "buttonOne", {
                            ...(slide.buttonOne || {}),
                            label: value,
                          })
                        }
                        __next40pxDefaultSize="30px"
                      />
                      <TextControl
                        label="Button One URL"
                        value={slide.buttonOne.url}
                        onChange={(value) =>
                          updateSlide(index, "buttonOne", {
                            ...(slide.buttonOne || {}),
                            url: value,
                          })
                        }
                        __next40pxDefaultSize="30px"
                      />
                    </>
                  )}
                  <div className="events-block-separator" />
                  <PanelRow>
                    <ToggleControl
                      label="Display Button Two"
                      checked={slide.buttonTwo.display}
                      onChange={(value) =>
                        updateSlide(index, "buttonTwo", {
                          ...(slide.buttonTwo || {}),
                          display: value,
                        })
                      }
                      __next40pxDefaultSize="30px"
                    />
                  </PanelRow>
                  {slide.buttonTwo.display && (
                    <>
                      <TextControl
                        label="Button Two Label"
                        value={slide.buttonTwo.label}
                        onChange={(value) =>
                          updateSlide(index, "buttonTwo", {
                            ...(slide.buttonTwo || {}),
                            label: value,
                          })
                        }
                        __next40pxDefaultSize="30px"
                      />
                      <TextControl
                        label="Button Two URL"
                        value={slide.buttonTwo.url}
                        onChange={(value) =>
                          updateSlide(index, "buttonTwo", {
                            ...(slide.buttonTwo || {}),
                            url: value,
                          })
                        }
                        __next40pxDefaultSize="30px"
                      />
                    </>
                  )}
                  <div className="events-block-separator" />
                </>
              )}
          </>
        );
      },
      /**
       * Other Slides State
       *
       * State governing other slides
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      [editingSlideIndex, setEditingSlideIndex] = useState(null),
      /**
       * Other Slides State
       *
       * State governing other slides
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      [isAddingNewSlide, setIsAddingNewSlide] = useState(false),
      /**
       * Other Slides Slides Panel
       *
       * Inspector controls governing other slides slides
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      customSlidesPanel = () => {
        const API = {
          /**
           * Add Slide
           *
           * Adds a new slide to the other slides
           *
           * @param {void} - no parameters, uses Sidebar scope
           *
           * @date 2026-01-10
           *
           * @author Exenreco Bell
           *
           * @returns {void}
           */
          addSlide: () => {
            const newSlide = {
              title: "",
              tagline: "",
              excerpt: "",
              mediaId: 0,
              mediaUrl: "",
              mediaType: "image",
              slideType: "custom",
              permalink: "",
              colors: {
                overlayBackground: "rgba(0, 0, 0, 0.5)",
              },
              buttonOne: {
                url: "#",
                label: "Get Tickets",
                display: true,
              },
              buttonTwo: {
                url: "#",
                label: "The VIP Experience",
                display: true,
              },
            };
            setAttributes({
              slides: {
                ...(attributes.slides || {}),
                otherSlides: [
                  ...(attributes.slides?.otherSlides || []),
                  { ...newSlide },
                ],
              },
            });
            // Automatically open the new slide for editing
            setEditingSlideIndex(attributes?.slides?.otherSlides?.length);
            setIsAddingNewSlide(true);
          },

          /**
           * Update Slide
           *
           * Updates a slide in the other slides
           *
           * @param {number} index - The index of the slide to update
           * @param {string} key - The key of the slide to update
           * @param {any} value - The value of the slide to update
           *
           * @date 2026-01-10
           *
           * @author Exenreco Bell
           *
           * @returns {void}
           */
          updateSlide: (index, key, value) => {
            const newSlides = [...attributes.slides.otherSlides];
            newSlides[index][key] = value;
            setAttributes({
              slides: {
                ...attributes.slides,
                otherSlides: newSlides,
              },
            });
          },

          /**
           * Delete Slide
           *
           * Deletes a slide from the other slides
           *
           * @param {number} index - The index of the slide to delete
           *
           * @date 2026-01-10
           *
           * @author Exenreco Bell
           *
           * @returns {void}
           */
          removeSlide: (indexToRemove) => {
            // Ensure attributes.slides.otherSlides is an array before filtering
            const currentSlides = Array.isArray(attributes.slides?.otherSlides)
              ? attributes.slides.otherSlides
              : [];

            const updatedSlides = currentSlides.filter(
              (_, index) => index !== indexToRemove,
            );

            setAttributes({
              slides: {
                ...(attributes.slides || {}), // Keep other properties of 'slides' if any
                otherSlides: updatedSlides, // Assign the filtered array directly
              },
            });

            // Handle editingSlideIndex update correctly
            if (editingSlideIndex === indexToRemove) {
              setEditingSlideIndex(null);
            } else if (editingSlideIndex > indexToRemove) {
              setEditingSlideIndex(editingSlideIndex - 1);
            }
          },

          /**
           * On Select Media
           *
           * Selects media for a slide, a callback for MediaUpload
           *
           * @param {object} media - The media to select
           * @param {number} index - The index of the slide to select media for
           *
           * @date 2026-01-10
           *
           * @author Exenreco Bell
           *
           * @returns {void}
           */
          onSelectMedia: (media, index) => {
            API.updateSlide(index, "mediaId", media.id);
            API.updateSlide(index, "mediaUrl", media.url);
          },
        };

        return (
          <>
            {Array.isArray(attributes.slides.otherSlides) &&
              attributes.slides.otherSlides.map((slide, index) => (
                <PanelRow key={index} className="slide-item">
                  <div className="panel-header">
                    <span
                      className="tool toggle"
                      onClick={() =>
                        setEditingSlideIndex(
                          editingSlideIndex === index ? null : index,
                        )
                      }
                    >
                      <span className="icon">
                        {editingSlideIndex === index ? chevronUp : chevronDown}
                      </span>
                      <span className="text">
                        {slide.title
                          ? `Custom Slide ${index + 1} - ${slide.title}`
                          : `Custom Slide ${index + 1}`}
                      </span>
                    </span>
                    <Button
                      isDestructive
                      onClick={() => API.removeSlide(index)}
                      className="tool remove"
                      icon="trash"
                      label={__("Remove Slide", "rhythmz-plugin")}
                    />
                  </div>

                  {editingSlideIndex === index && (
                    <div className="panel-editor">
                      <DualTabPanel
                        styleControls={customSlidesStylesPanel(
                          index,
                          slide,
                          API.updateSlide,
                        )}
                        settingsControls={customSlidesSettingsPanel(
                          index,
                          slide,
                          API.updateSlide,
                        )}
                      />
                      <TextControl
                        label={__("Slide Title", "rhythmz-plugin")}
                        value={slide.title}
                        onChange={(newTitle) =>
                          API.updateSlide(index, "title", newTitle)
                        }
                      />
                      <TextControl
                        label={__("Slide Tagline", "rhythmz-plugin")}
                        value={slide.tagline}
                        onChange={(newTagline) =>
                          API.updateSlide(index, "tagline", newTagline)
                        }
                      />
                      <TextareaControl
                        label={__("Slide Description", "rhythmz-plugin")}
                        value={slide.description}
                        onChange={(newDescription) =>
                          API.updateSlide(index, "description", newDescription)
                        }
                      />
                      <SelectControl
                        label={__("Media Type", "rhythmz-plugin")}
                        value={slide.mediaType}
                        options={[
                          {
                            label: __("Image", "rhythmz-plugin"),
                            value: "image",
                          },
                          {
                            label: __("Video", "rhythmz-plugin"),
                            value: "video",
                          },
                        ]}
                        onChange={(newType) =>
                          API.updateSlide(index, "mediaType", newType)
                        }
                      />
                      <label>Preview</label>
                      <MediaUploadCheck>
                        <MediaUpload
                          onSelect={(media) => API.onSelectMedia(media, index)}
                          allowedTypes={
                            slide.mediaType === "image" ? ["image"] : ["video"]
                          }
                          value={slide.mediaId}
                          render={({ open }) => (
                            <>
                              <div className="media-preview">
                                {slide.mediaUrl ? (
                                  slide.mediaType === "image" ? (
                                    <img
                                      src={slide.mediaUrl}
                                      alt={__(
                                        "Selected image",
                                        "rhythmz-plugin",
                                      )}
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                        display: "block",
                                      }}
                                    />
                                  ) : (
                                    <video
                                      src={slide.mediaUrl}
                                      controls={false}
                                      autoPlay={true}
                                      loop={true}
                                      muted={true}
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                        display: "block",
                                      }}
                                    />
                                  )
                                ) : (
                                  <span className="null">
                                    {__("No media selected", "rhythmz-plugin")}
                                  </span>
                                )}
                              </div>
                              <Button
                                onClick={open}
                                isSecondary
                                className="upload-button"
                              >
                                <span className="icon">{media}</span>
                                {slide.mediaUrl
                                  ? __("Change Media", "rhythmz-plugin")
                                  : __("Select Media", "rhythmz-plugin")}
                              </Button>
                            </>
                          )}
                        />
                      </MediaUploadCheck>
                      <span className="or">
                        {__("-- Or --", "rhythmz-plugin")}
                      </span>
                      <TextControl
                        label={__("Enter URL", "rhythmz-plugin")}
                        value={slide.mediaUrl}
                        onChange={(newUrl) =>
                          API.updateSlide(index, "mediaUrl", newUrl)
                        }
                        placeholder={
                          slide.mediaType === "image"
                            ? "http://example.com/image.jpg"
                            : "http://example.com/video.mp4"
                        }
                      />
                    </div>
                  )}
                </PanelRow>
              ))}
            <Button
              isPrimary
              className="add-slide-button"
              onClick={API.addSlide}
            >
              {plus}
              {__("Add Slide", "rhythmz-plugin")}
            </Button>
          </>
        );
      },
      /**
       * Autoplay Styles Panel
       *
       * Inspector controls governing autoplay styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      autoplayStylesPanel = () => {
        return (
          <>
            <AppearanceComponent
              title="Autoplay Appearance"
              attributeName="slider"
              subAttributeName="autoplay"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[...autoplayColorOptions]}
            />
            <BorderComponent
              attributeName="slider"
              subAttributeName="autoplay"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <PaddingComponent
              attributeName="slider"
              subAttributeName="autoplay"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderRadiusComponent
              attributeName="slider"
              subAttributeName="autoplay"
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </>
        );
      },
      /**
       * Autoplay Settings Panel
       *
       * Inspector controls governing autoplay settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      autoplaySettingsPanel = () => {
        return (
          <>
            <ToolsPanel
              label="Autoplay Settings"
              className="events-block-settings"
              resetAll={() =>
                setAttributes({
                  slider: {
                    ...(attributes?.slider || {}),
                    swiper: {
                      ...(attributes?.slider?.swiper || {}),
                      autoplay: true,
                    },
                    autoplay: {
                      ...(attributes?.slider?.autoplay || {}),
                      display: true,
                    },
                  },
                })
              }
            >
              <ToolsPanelItem
                label="Autoplay"
                hasValue={() => attributes?.slider?.swiper?.autoplay}
                onToggle={(value) =>
                  setAttributes({
                    slider: {
                      ...(attributes?.slider || {}),
                      swiper: {
                        ...(attributes?.slider?.swiper || {}),
                        autoplay: value,
                      },
                    },
                  })
                }
              >
                <ToggleControl
                  label="Autoplay"
                  checked={attributes?.slider?.swiper?.autoplay}
                  onChange={(value) =>
                    setAttributes({
                      slider: {
                        ...(attributes?.slider || {}),
                        swiper: {
                          ...(attributes?.slider?.swiper || {}),
                          autoplay: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>
              {attributes.slider.swiper.autoplay &&
                attributes.slider.swiper.autoplay === true && (
                  <ToggleControl
                    label="Pause On Interactions"
                    checked={attributes?.slider?.swiper?.autoplayOnInteractions}
                    onChange={(value) =>
                      setAttributes({
                        slider: {
                          ...(attributes?.slider || {}),
                          swiper: {
                            ...(attributes?.slider?.swiper || {}),
                            autoplayOnInteractions: value,
                          },
                        },
                      })
                    }
                  />
                )}
            </ToolsPanel>
            {attributes.slider.swiper.autoplay &&
              attributes.slider.swiper.autoplay === true && (
                <NumericComponent
                  title="Autoplay Delay"
                  attributeName="slider"
                  subAttributeName="swiper"
                  attributes={attributes}
                  setAttributes={setAttributes}
                  options={[
                    {
                      key: "autoplayDelay",
                      min: 0,
                      max: 10000,
                      step: 100,
                      label: "Autoplay Delay",
                      isShownByDefault: true,
                    },
                  ]}
                />
              )}
          </>
        );
      },
      /**
       * Pagination Styles Panel
       *
       * Inspector controls governing pagination styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      paginationStylesPanel = () => {
        return (
          <>
            <AppearanceComponent
              title="Pagination Appearance"
              attributeName="slider"
              subAttributeName="pagination"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[...paginationColorOptions]}
            />
            <BorderComponent
              attributeName="slider"
              subAttributeName="pagination"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <PaddingComponent
              attributeName="slider"
              subAttributeName="pagination"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderRadiusComponent
              attributeName="slider"
              subAttributeName="pagination"
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </>
        );
      },
      /**
       * Pagination Settings Panel
       *
       * Inspector controls governing pagination settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      paginationSettingsPanel = () => {
        return (
          <>
            <ToolsPanel
              label="Pagination Settings"
              className="events-block-settings"
              resetAll={() =>
                setAttributes({
                  slider: {
                    ...(attributes?.slider || {}),
                    pagination: {
                      ...(attributes?.slider?.pagination || {}),
                      display: true,
                    },
                  },
                })
              }
            >
              <ToolsPanelItem
                label="Pagination Visibility"
                hasValue={() => attributes?.slider?.pagination?.display}
                onToggle={(value) =>
                  setAttributes({
                    slider: {
                      ...(attributes?.slider || {}),
                      pagination: {
                        ...(attributes?.slider?.pagination || {}),
                        display: value,
                      },
                    },
                  })
                }
              >
                <ToggleControl
                  label="Pagination Visibility"
                  checked={attributes?.slider?.pagination?.display}
                  onChange={(value) =>
                    setAttributes({
                      slider: {
                        ...(attributes?.slider || {}),
                        pagination: {
                          ...(attributes?.slider?.pagination || {}),
                          display: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>

              {attributes?.slider?.pagination?.display &&
                attributes.slider.pagination.display === true && (
                  <>
                    <ToolsPanelItem
                      label="Markers Visibility"
                      hasValue={() => attributes?.slider?.pagination?.markers}
                      onToggle={(value) =>
                        setAttributes({
                          slider: {
                            ...(attributes?.slider || {}),
                            pagination: {
                              ...(attributes?.slider?.pagination || {}),
                              markers: value,
                            },
                          },
                        })
                      }
                    >
                      <ToggleControl
                        label="Markers Visibility"
                        checked={attributes?.slider?.pagination?.markers}
                        onChange={(value) =>
                          setAttributes({
                            slider: {
                              ...(attributes?.slider || {}),
                              pagination: {
                                ...(attributes?.slider?.pagination || {}),
                                markers: value,
                              },
                            },
                          })
                        }
                      />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                      label="Fractions Visibility"
                      hasValue={() => attributes?.slider?.pagination?.fractions}
                      onToggle={(value) =>
                        setAttributes({
                          slider: {
                            ...(attributes?.slider || {}),
                            pagination: {
                              ...(attributes?.slider?.pagination || {}),
                              fractions: value,
                            },
                          },
                        })
                      }
                    >
                      <ToggleControl
                        label="Fractions Visibility"
                        checked={attributes?.slider?.pagination?.fractions}
                        onChange={(value) =>
                          setAttributes({
                            slider: {
                              ...(attributes?.slider || {}),
                              pagination: {
                                ...(attributes?.slider?.pagination || {}),
                                fractions: value,
                              },
                            },
                          })
                        }
                      />
                    </ToolsPanelItem>
                  </>
                )}
            </ToolsPanel>
          </>
        );
      },
      /**
       * Navigation Styles Panel
       *
       * Inspector controls governing navigation styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      navigationStylesPanel = () => {
        return (
          <>
            <AppearanceComponent
              title="Navigation Appearance"
              attributeName="slider"
              subAttributeName="navigation"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[...navigationColorOptions]}
            />
            <UnitComponent
              title="Navigation Icon Size"
              attributeName="slider"
              subAttributeName="navigation"
              attributes={attributes}
              setAttributes={setAttributes}
              options={[
                {
                  key: "size",
                  min: 0,
                  max: 1000,
                  step: 1,
                  label: "icon size",
                  isShownByDefault: true,
                  units: [
                    { value: "px", label: "px" },
                    { value: "em", label: "em" },
                    { value: "rem", label: "rem" },
                    { value: "pt", label: "pt" },
                  ],
                },
              ]}
            />
            <PaddingComponent
              attributeName="slider"
              subAttributeName="navigation"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderComponent
              attributeName="slider"
              subAttributeName="navigation"
              attributes={attributes}
              setAttributes={setAttributes}
            />
            <BorderRadiusComponent
              attributeName="slider"
              subAttributeName="navigation"
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </>
        );
      },
      /**
       * Navigation Settings Panel
       *
       * Inspector controls governing navigation settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-10
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      navigationSettingsPanel = () => {
        return (
          <>
            <ToolsPanel
              label="Navigation Settings"
              className="events-block-settings"
              resetAll={() =>
                setAttributes({
                  slider: {
                    ...(attributes?.slider || {}),
                    navigation: {
                      ...(attributes?.slider?.navigation || {}),
                      display: true,
                    },
                  },
                })
              }
            >
              <ToolsPanelItem
                label="Navigation Visibility"
                hasValue={() => attributes?.slider?.navigation?.display}
                onToggle={(value) =>
                  setAttributes({
                    slider: {
                      ...(attributes?.slider || {}),
                      navigation: {
                        ...(attributes?.slider?.navigation || {}),
                        display: value,
                      },
                    },
                  })
                }
              >
                <ToggleControl
                  label="Navigation Visibility"
                  checked={attributes?.slider?.navigation?.display}
                  onChange={(value) =>
                    setAttributes({
                      slider: {
                        ...(attributes?.slider || {}),
                        navigation: {
                          ...(attributes?.slider?.navigation || {}),
                          display: value,
                        },
                      },
                    })
                  }
                />
              </ToolsPanelItem>
            </ToolsPanel>
          </>
        );
      },
      /**
       * Events Styles Panel
       *
       * Inspector controls governing events styles
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-05
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      eventsStylesPanel = () => (<>
        Events Styles
      </>)
      ,
      /**
       * Events Settings Panels
       *
       * Inspector controls governing events settings
       *
       * @param {void} - no parameters, uses Sidebar scope
       *
       * @date 2026-01-05
       *
       * @author Exenreco Bell
       *
       * @returns {JSX.Element}
       */
      eventsSettingsPanel = () => {
        return (
          <>
            <ToggleControl
              label="Display Events Panel"
              checked={attributes?.events?.display}
              onChange={(value) =>
                setAttributes({
                  events: {
                    ...(attributes?.events || {}),
                    display: value,
                  },
                })
              }
            />
            <SelectControl
              label="Events layout"
              value={attributes?.events?.layout || "grid"}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
              options={[
                { label: "Grid", value: "grid" },
                { label: "Carousel", value: "carousel" },
              ]}
              onChange={(value) =>
                setAttributes({
                  events: {
                    ...attributes?.events,
                    layout: value,
                  },
                })
              }
            />
          </>
        );
      },
      bookingStylesPanel = () => (<>
        booking styles
      </>),
      bookingSettingsPanel = () => (<>
        <ToggleControl
          label="Display Booking Panel"
          checked={attributes?.booking?.display}
          onChange={(value) =>
            setAttributes({
              booking: {
                ...(attributes?.booking || {}),
                display: value,
              },
            })
          }
        />
      </>);

    return (
      <>
        <InspectorControls>
          <TabPanel
            className="events-block-sidebar-tabs"
            activeClass="is-active"
            tabs={[
              { name: "slider", title: "Slider", className: "tab-slider" },
              { name: "slides", title: "Slides", className: "tab-slides" },
              { name: "events", title: "Events", className: "tab-events" },
              { name: "booking", title: "Booking", className: "tab-booking" },
            ]}
          >
            {(tab) => (
              <>
                {tab.name === "slider" && (
                  <>
                    <PanelBody title="Slider Settings" initialOpen={false}>
                      <DualTabPanel
                        styleControls={sliderStylesPanel()}
                        settingsControls={sliderSettingsPanel()}
                      />
                    </PanelBody>
                    <PanelBody title="Autoplay Settings" initialOpen={false}>
                      <DualTabPanel
                        styleControls={autoplayStylesPanel()}
                        settingsControls={autoplaySettingsPanel()}
                      />
                    </PanelBody>
                    <PanelBody title="Pagination Settings" initialOpen={false}>
                      <DualTabPanel
                        styleControls={paginationStylesPanel()}
                        settingsControls={paginationSettingsPanel()}
                      />
                    </PanelBody>
                    <PanelBody title="Navigation Settings" initialOpen={false}>
                      <DualTabPanel
                        styleControls={navigationStylesPanel()}
                        settingsControls={navigationSettingsPanel()}
                      />
                    </PanelBody>
                  </>
                )}
                {tab.name === "slides" && (
                  <>
                    <PanelBody
                      title="Events Slides Settings"
                      initialOpen={false}
                    >
                      <DualTabPanel
                        styleControls={slideEventsStylesPanel()}
                        settingsControls={slideEventsSettingsPanel()}
                      />
                    </PanelBody>
                    {customSlidesPanel()}
                  </>
                )}
                {tab.name === "events" && (
                  <>
                    <PanelBody title="Events Settings" initialOpen={false}>
                      <DualTabPanel
                        styleControls={eventsStylesPanel()}
                        settingsControls={eventsSettingsPanel()}
                      />
                    </PanelBody>
                  </>
                )}
                {tab.name === "booking" && (
                  <>
                    <PanelBody title="Booking Settings" initialOpen={false}>
                      <DualTabPanel
                        styleControls={bookingStylesPanel()}
                        settingsControls={bookingSettingsPanel()}
                      />
                    </PanelBody>
                  </>
                )}
              </>
            )}
          </TabPanel>
        </InspectorControls>
      </>
    );
};
