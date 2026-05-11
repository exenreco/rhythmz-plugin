import { createBlog } from "./model.blog.js";
import { createBookingPopup, createTicketPopup } from "./popup.fns.js";
import { createMarkup, mediaPlaceholder, formatDate } from "./utils.js";

const
 __blogTemplate = () => {
    const fragment = document.createDocumentFragment();

    const info = createMarkup("div", { className: "__info" });
    info.append(
      createMarkup(
        "span",
        { className: "__age" },
        { "data-age": "", "aria-label": "Age Restriction" },
      ),
      createMarkup(
        "span",
        { className: "__price" },
        { "data-price": "", "aria-label": "Price" },
      ),
    );

    const img = createMarkup(
      "img",
      { className: "__poster" },
      {
        loading: "lazy",
        "data-src": "",
        "data-alt": "",
        "aria-label": "Event Poster",
      },
    );
    img.onerror = () => {
      img.style.display = "none";
      placeholder.style.display = "block";
    };
    // If the image successfully loads after a previous error, ensure it shows
    img.onload = () => {
      if (img.src && img.src.trim() !== "") {
        img.style.display = "block";
        placeholder.style.display = "none";
      }
    };

    const placeholder = createMarkup(
      "div",
      { className: "__poster_placeholder" },
      { "data-src": "" }, // We bind it to 'src' so the renderer sees it
    );
    placeholder.append(mediaPlaceholder());
    const imgContainer = createMarkup("div", { className: "__img_container" });
    imgContainer.append(placeholder, img, info);

    const banner = createMarkup("div", { className: "__banner" });
    banner.append(imgContainer);

    const details = createMarkup("div", { className: "__details" }),
      detailFragment = document.createDocumentFragment();

    const detailsLeft = createMarkup("div", { className: "__left" });
    detailsLeft.append(
      createMarkup(
        "span",
        { className: "__start_month" },
        { "data-start-month": "" },
      ),
      createMarkup(
        "span",
        { className: "__start_day" },
        { "data-start-day": "" },
      ),
    );

    const detailsRight = createMarkup("div", { className: "__right" });
    const dateTime = createMarkup("div", { className: "__date_time" });
    dateTime.append(
      createMarkup(
        "span",
        { className: "__start_date" },
        { "data-start-date": "", "aria-label": "start date" },
      ),
      createMarkup("span", { className: "__spacer", innerHTML: " - " }),
      createMarkup(
        "span",
        { className: "__end_date" },
        { "data-end-date": "", "aria-label": "end date" },
      ),
    );
    const actions = createMarkup("div", { className: "__actions" }),
      book = createMarkup(
        "button",
        { className: "__btn __book", textContent: "VIP Reservations" },
        {
          "data-id": "",
          role: "button",
          type: "button",
          title: "VIP Reservations",
          "aria-label": "VIP Reservations",
        },
      ),
      tickets = createMarkup(
        "button",
        { className: "__btn __tickets", textContent: "Get Tickets" },
        {
          "data-id": "",
          role: "button",
          type: "button",
          title: "Get Tickets",
          "aria-label": "Get Tickets",
        },
      );

    actions.append(book, tickets);

    const link = createMarkup("a", 
      { className: "link", href: "#"},
      { "data-permalink": ""}
    );
    const title = createMarkup(
      "h3",
      { className: "__title" },
      { "data-title": "", "aria-label": "Event Title" },
    );
    link.appendChild(title);

    detailsRight.append(dateTime, link, actions);

    detailFragment.append(detailsLeft, detailsRight);
    details.append(detailFragment);

    fragment.append(banner, details);

    const article = createMarkup("article", {
      className: "__template __event",
    });
    article.append(fragment);

    return article;
  },
  SEO = (events = [], info = {}) => {
    const { seo, organizer } = info;

    // 1️⃣ Page title
    const pageTitle =
      seo?.title ||
      `${organizer?.name} | ${events[0]?.title}` ||
      `Upcoming Events`;

    let titleEl = document.head.querySelector("title");

    if (!titleEl) {
      titleEl = createMarkup("title");
      document.head.append(titleEl);
    }
    titleEl.textContent = pageTitle;

    const updateMeta = (name, content) => {
      let el = document.head.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.append(el);
      }
      el.setAttribute("content", content || "");
    };

    const desc =
      seo?.description ||
      `Upcoming events at ${organizer?.name || ""} in ${
        organizer?.address?.city || ""
      } ${organizer?.address?.state || ""}. Featuring ${
        events?.length || 0
      } event(s).`;

    updateMeta("description", desc);
    updateMeta("keywords", seo?.keywords || "");

    let eventsSchema;

    if (events.length >= 1) {
      // 3️⃣ Structured data JSON-LD
      eventsSchema = events.map((event) => {
        const startDate = event?.startDate || "";
        const endDate = event?.endDate || startDate;
        const image = event?.imgSrc ? [event.imgSrc] : [];
        const price = event?.price
          ? String(event.price).replace(/\s/g, "")
          : "0";

        return {
          "@context": "https://schema.org",
          "@type": "Event",
          name: event?.title || "",
          startDate,
          endDate,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: organizer?.name || "",
            address: {
              "@type": "PostalAddress",
              streetAddress: organizer?.address?.street || "",
              addressLocality: organizer?.address?.city || "",
              postalCode: organizer?.address?.zip || "",
              addressRegion: organizer?.address?.state || "",
              addressCountry: organizer?.address?.country || "",
            },
          },
          image,
          description: event?.excerpt || "",
          offers: {
            "@type": "Offer",
            url:
              event?.permalink || organizer?.eventUrl || organizer?.url || "",
            price: price,
            priceCurrency: "USD",
            availability:
              event?.status === "available" // CHECK HERE
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            validFrom: startDate,
          },
          organizer: {
            "@type": "Organization",
            name: organizer?.name || "",
            url: organizer?.url || "",
          },
          performer:
            event.performers?.map((p) => ({
              "@type": "Person",
              name: p,
            })) || [],
        };
      });
    }

    // 4️⃣ Inject JSON-LD only once
    let script = document.getElementById("__eb_events_schema");
    if (!script) {
      script = document.createElement("script");
      script.id = "__eb_events_schema";
      script.type = "application/ld+json";
      document.body.append(script);
    }
    script.textContent = JSON.stringify(eventsSchema, null, 2);
  },
  EventsBlog = (data, config = {}) => {
    const layout = createMarkup("div"),
      layoutId =
        config.id && typeof config.id === "string"
          ? config.id
          : crypto.getRandomValues(new Int16Array(5));
    layout.classList.add("__eb_blog_container");
    layout.id = layoutId;

    /*const styleMap = {
      bgColor: "--eb-blog-bg-color",
      textColor: "--eb-blog-text-color",
      paginationColor: "--eb-blog-pagination-color",
      accentColor: "--eb-blog-accent-color",
      buttonColor: "--eb-blog-button-color",
      ageBgColor: "--eb-blog-age-background-color",
    };

    if (config.styles) {
      Object.entries(config.styles).forEach(([key, value]) => {
        if (styleMap[key]) {
          layout.style.setProperty(styleMap[key], value);
        }
      });
    }*/
    if (data instanceof Array && data.length >= 1) {
      const formattedData = data.map((item) => {
        const startDate = formatDate(item.startDate);
        const endDate = formatDate(item.endDate);

        return {
          id: String(item.eventId || ""),
          key: String(item.id),
          age: `${item?.ageRestriction || "21+"} Event`,
          alt: item.title ? `${item.title} - poster` : "",
          src: item?.mediaSrc || "",
          price: `From $${item?.lowPrice || '--'}`,
          title: item?.title || "",
          description: item?.excerpt || "",
          startMonth: startDate.month || "",
          startDay: startDate.day || "",
          startDate: `${startDate?.date} from: ${startDate?.time}`,
          endDate: `${endDate?.timezone}`,
          permalink: item?.permalink || "",
          venue: config?.organizer?.shortName || "",
          templateName: "event",
        };
      });
      const blogListeners = (container, blogWrapper, paginationWrapper) => {
        if (blogWrapper && blogWrapper instanceof Node) {
          blogWrapper.addEventListener("click", (e) => {
            // Check if the clicked element (or its parent) has the data-tickets attribute
            const btn = e.target.closest("[data-id]");
            if (btn && btn.classList.contains("__tickets")) {
              createTicketPopup(
                btn.dataset.id,
                {...(config && typeof config === "object" ? config : {})},
              );
            }
            if (btn && btn.classList.contains("__book")) {
              createBookingPopup(
                btn.dataset.id,
                {...(config && typeof config === "object" ? config : {})}
              );
            }
          });
        }
      };
      const blog = createBlog(
        [
          {
            key: "test",
            age: "18+",
            alt: "",
            src: "",
            price: "32.99",
            title: "Test Event",
            description: "Test Event Description",
            startMonth: "Mar",
            startDay: "21",
            startDate: "Mar 21 from: 12:00 PM",
            endDate: "2:00 AM CST",
            venue: "Rhythm",
            templateName: "event",
          },
          ...formattedData,
        ],
        parseInt(config?.itemsPerPage) ? Number(config?.itemsPerPage) : 12,
        blogListeners,
      );
      blog.registerTemplate("event", __blogTemplate());
      layout.append(blog.element);
    } else {
      const e = createMarkup("span");
      e.innerHTML = "Empty";
      layout.append(e);
    }

    SEO(data, {
      seo: { ...config?.seo },
      organizer: { ...config?.organizer },
    });

    return layout;
  };

export { EventsBlog };
