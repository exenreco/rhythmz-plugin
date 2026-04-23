const /**
   * Swiper Color options
   *=====================================*/
  sliderColorOptions = [
    {
      key: "sliderColor",
      label: "Color",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: false,
        textKey: "sliderColor",
        backgroundKey: "sliderBackground",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      }
    },
  ],
  autoplayColorOptions = [
    {
      key: "autoplayColor",
      label: "Color",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: false,
        textKey: "autoplayColor",
        backgroundKey: "autoplayBg",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      }
    }
  ],
  navigationColorOptions = [
    {
      key: "navColor",
      label: "Color",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: false,
        textKey: "navColor",
        backgroundKey: "navBg",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      }
    }
  ],
  paginationColorOptions = [
    {
      key: "pagColor",
      label: "Color",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: false,
        textKey: "pagColor",
        backgroundKey: "pagBg",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: true,
        hasBackgroundGradient: false,
        backgroundKey: "pagBgHover",
      }
    },
    {
      key: "pagBgActive",
      label: "Active Marker",
      before: {
        // normal state
        hasText: false,
        hasBackground: true,
        hasBackgroundGradient: false,
        backgroundKey: "pagBgActive",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      }
    },
    {
      key: "pagSeparator",
      label: "Separator",
      before: {
        // normal state
        hasText: true,
        hasBackground: false,
        hasBackgroundGradient: false,
        textKey: "separatorColor",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      }
    },
  ],
  /**
   * Swiper Slides Color options
   *=====================================*/
  slidesColorOptions = [
    {
      key: "slide",
      label: "Slide",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: false,
        textKey: "slideText",
        backgroundKey: "slideBackground",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      },
    },
    {
      key: "metaTags",
      label: "Meta Tags",
      before: {
        // normal state
        hasText: true,
        hasBackground: false,
        hasBackgroundGradient: false,
        textKey: "metaColor",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      },
    },
    {
      key: "overlay",
      label: "Slide Overlay",
      before: {
        // normal state
        hasText: false,
        hasBackground: true,
        hasBackgroundGradient: false,
        backgroundKey: "overlayColor",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      },
    },
    {
      key: "accent",
      label: "Slide Accents",
      before: {
        // normal state
        hasText: false,
        hasBackground: true,
        hasBackgroundGradient: false,
        backgroundKey: "accentColor",
      },
      after: {
        // hover state
        hasText: false,
        hasBackground: false,
        hasBackgroundGradient: false,
      },
    },
    {
      key: "link",
      label: "Slide Links",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: true,
        textKey: "linkColor",
        backgroundKey: "linkBackground",
        gradientKey: "linkGradient",
      },
      after: {
        // hover state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: true,
        textKey: "linkColorHover",
        backgroundKey: "linkBackgroundHover",
        gradientKey: "linkGradientHover",
      },
    },
    {
      key: "buttonOne",
      label: "Slide Button One",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: true,
        textKey: "slideBtnOneText",
        gradientKey: "slideBtnOneGradient",
        backgroundKey: "slideBtnOneBackground",
      },
      after: {
        // hover state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: true,
        textKey: "slideBtnOneTextHover",
        backgroundKey: "slideBtnOneBackgroundHover",
        gradientKey: "slideBtnOneGradientHover",
      },
    },
    {
      key: "buttonTwo",
      label: "Slide Button Two",
      before: {
        // normal state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: false,
        textKey: "slideBtnTwoText",
        backgroundKey: "slideBtnTwoBackground",
      },
      after: {
        // hover state
        hasText: true,
        hasBackground: true,
        hasBackgroundGradient: true,
        textKey: "slideBtnTwoTextHover",
        backgroundKey: "slideBtnTwoBackgroundHover",
        gradientKey: "slideBtnTwoGradientHover",
      },
    },
  ],
  /**
   * Events Color options
   *=====================================*/
  eventsColorOptions = [{}, {}];

export {
  sliderColorOptions,
  autoplayColorOptions,
  navigationColorOptions,
  paginationColorOptions,

  slidesColorOptions,

  eventsColorOptions,
}
