
const isValidArray = (arr) => {
    return arr && Array.isArray(arr) && arr.length > 0 ? true : false;
  },
  isValidObject = (obj) => {
    return obj && obj instanceof Object && Object.keys(obj).length > 0
      ? true
      : false;
  },
  isValidString = (str) => {
    return str && typeof str === "string" && str.trim().length > 0
      ? true
      : false;
  },
  isValidNumber = (num) => {
    return num && typeof num === "number" && !isNaN(num) ? true : false;
  },
  /**
   * CREATE MARKUP
   *
   * Creates a new DOM element with the specified tag name.
   *
   * @param {string} [tagName="div"] - A valid HTML tag name (e.g., 'div', 'p', 'span') {
   *    Defaults to "div" if the input
   * }
   *
   * @returns {HTMLElement} - The newly created HTML element.
   */
  createMarkup = (tagName = "div", props = {}, attributes = {}) => {
    const el = document.createElement(tagName);
    Object.assign(el, props);
    // Separate attributes (like aria-labels, data-ids)
    Object.entries(attributes).forEach(([key, val]) =>
      el.setAttribute(key, val),
    );
    return el;
  },
  /**
   * CREATE FRAGMENT
   *
   * Creates a DocumentFragment from a DOM Node or an HTML string.
   *
   * @param {Node|string} content - The DOM Node or HTML string to wrap in a fragment.
   *
   * @returns {DocumentFragment|null} - The resulting fragment containing the content,
   *                                     or null if input is invalid.
   */
  createFragment = (content) => {
    if (!content) return null;

    const fragment = document.createDocumentFragment();

    // Case 1: content is already a DOM Node
    if (content instanceof Node) {
      fragment.append(content);
      return fragment;
    }

    // Case 2: content is an HTML string
    if (typeof content === "string") {
      // Create a wrapper to parse the HTML string
      const template = document.createElement("template");
      template.innerHTML = content;
      fragment.append(template.content);
      return fragment;
    }

    return null;
  },
  formatDate = (date) => {
    if (!date) return {};

    const d = new Date(date);
    if (isNaN(d.getTime())) return {};

    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.toLocaleDateString("en-US", { day: "2-digit" }),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      time: d.toLocaleTimeString("en-US", {
        timeStyle: "short",
      }),
      year: d.toLocaleDateString("en-US", {
        year: "numeric",
      }),
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      timezone: d.toLocaleTimeString("en-US", {
        timeZoneName: "short",
      }),
    };
  },
  /**
   * MEDIA PLACE HOLDER
   *
   * Creates a placeholder image for missing images
   *
   * @param {object} contents -  list of required content to generate the placeholder {
   *
   *  - {string} venue - the name of the venue
   *
   *  - {string} title - the title of the event
   *
   *  - {string} subtitle - a subtitle for the event
   *
   *  - {string} date - the date of the event
   * }
   *
   * @returns {Node} the markup of the place holder
   */
  mediaPlaceholder = (config = { venue: "", title: "", date: "" }) => {
    const 
    { venue, title, date } = config;

    const 
    eVenue = typeof venue === "string" ? venue : "Rhythmz",
    eTitle = typeof title === "string" ? title : "Event";

    const _venue = createMarkup(
      "h2", 
      {className: "__venue", textContent: eVenue || ""}, 
      {'data-venue': ''}
    );

    const _title = createMarkup(
      "h3", 
      {className: "__title", textContent:  eTitle || ""},
      {'data-title': ''}
    );


    const _dateTime = createMarkup(
      "span", 
      {className: "__date_time", textContent: date ? date : ""}, 
      {'data-start-date': ''}
    );

    const separator = createMarkup("hr", {className: "__separator"});

    const container = createMarkup("div", {className: "__container"});
    container.append(_venue, _dateTime, separator, _title);

    const content = createMarkup("div", {className: "__inner"});
    content.append(container);

    const placeholder = createMarkup("div", {className: "__placeholder"});
    placeholder.append(content);

    const wrapper = createMarkup("div", {className: "__placeholder_wrapper"});
    wrapper.append(placeholder);

    return wrapper;
  };

(() => {
  // Inject Global Styles only once
  if (!document.getElementById("__eb_media_placeholder")) {
    const styleTag = createMarkup(
      "style",
      {
        id: "__eb_media_placeholder",
        textContent: `
          .__placeholder {
            width: 100%;
            height: 100%;
            display: block;
            background-color: #333; /* A light background color */
            background-image: 
              linear-gradient(45deg, red 25%, transparent 25%),
              linear-gradient(-45deg, red 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, red 75%),
              linear-gradient(-45deg, transparent 75%, red 75%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px -5px, 5px 0px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          } .__placeholder .__inner {
            top: 0;
            left: 0;
            z-index: 3;
            width: 100%;
            height: 100%;
            display: flex;
            flex: 0 0 auto;
            overflow: hidden;
            position: absolute;
            align-items: center;
            line-height: 1.84rem;
            flex-direction: column;
            justify-content: center;
          } .__placeholder .__inner:before {
            top: 0;
            left: 0;
            z-index: -1;
            content: "";
            width: 100%;
            height: 100%;
            opacity: 0.8;
            display: block;
            position: absolute;
            background-image: 
              linear-gradient(211deg,rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 77%),
              linear-gradient(0deg,rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
            background-size: cover;
            background-position: center;
            background-color: rgba(255, 0, 0, 0.55);
          }
          .__placeholder .__inner .__venue, 
          .__placeholder .__inner .__title,
          .__placeholder .__inner .__date_time,
          .__placeholder .__inner .__subtitle {
            opacity: 1;
            padding: 0;
            width: auto;
            margin: auto;
            height: auto;
            color: #fff;
            display: flex;
            align-items: center;
            text-align: center;
            font-size: 2.425rem;
            line-height: 1.825rem;
            justify-content: center;
            text-transform: capitalize;
          } .__placeholder .__inner .__venue {
            text-stroke: 2px rgba(226, 64, 64, 0.89);
            -webkit-text-stroke: 2px rgba(226, 64, 64, 0.89);
          } .__placeholder .__inner .__title {
            width: 85%;
            line-height: 1.225rem;
            font-size: 0.9045rem;
          } .__placeholder .__inner .__subtitle {
            width: 75%;
            font-size: 0.985rem;
            margin: 5px auto 5px auto;
            text-stroke: 1px rgba(226, 64, 64, 0.89);
            -webkit-text-stroke: 1px rgba(226, 64, 64, 0.89);
          } .__placeholder .__inner .__separator {
            width: 85%;
            height: 1px;
            margin: auto;
            border: none;
            display: block;
            background: #fff;
          }
          .__placeholder .__inner .__date_time {
            font-weight: bold;
            font-size: 0.985rem;
            margin: 10px auto 10px auto;
          }
        `,
      },
      {
        type: "text/css",
        rel: "stylesheet",
      },
    );
    document.head.append(styleTag);
  }
})();

export {
  isValidArray,
  isValidObject,
  isValidString,
  isValidNumber,
  createMarkup,
  createFragment,
  formatDate,
  mediaPlaceholder
};
