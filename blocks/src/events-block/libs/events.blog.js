import { createMarkup, mediaPlaceholder, formatDate } from "./utils.js";
import { createBlog } from "./model.blog.js";
import { popup } from "../../../assets/js/popup.js";

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
        { className: "__btn __book", innerHTML: "VIP Reservations" },
        {
          "data-book": "",
          role: "button",
          type: "button",
          title: "VIP Reservations",
          "aria-label": "VIP Reservations",
        },
      ),
      tickets = createMarkup(
        "button",
        { className: "__btn __tickets", innerHTML: "Get Tickets" },
        {
          "data-tickets": "",
          role: "button",
          type: "button",
          title: "Get Tickets",
          "aria-label": "Get Tickets",
        },
      );

    actions.append(book, tickets);

    const title = createMarkup(
      "h3",
      { className: "__title" },
      { "data-title": "", "aria-label": "Event Title" },
    );

    detailsRight.append(dateTime, title, actions);

    detailFragment.append(detailsLeft, detailsRight);
    details.append(detailFragment);

    fragment.append(banner, details);

    const article = createMarkup("article", {
      className: "__template __event",
    });
    article.append(fragment);

    return article;
  },
  __popupViewTickets = (e, eventID = "", config = {}) => {
    const 
    events = window?.RhythmzEventsBlockData?.events || {},
    match = Object.keys(events).find((k) => k === eventID);

    const 
    popup = createMarkup("div", { className: "__eb_ticket_popup" }),
    overlay = createMarkup("div", { className: "__overlay" }),
    posterContainer = createMarkup("div", {className: "__poster_container"});

    const 
    layout = createMarkup("div", { className: "__ticket_layout" }),
    layoutLeft = createMarkup("div", { className: "__left" }),
    layoutRight = createMarkup("div", { className: "__right" }),
    rightContainer = createMarkup("div", { className: "__container" });

    const 
    titleEl = createMarkup("h1", { className: "__title" }),
    dateEl = createMarkup("div", { className: "__date" }),
    descEl = createMarkup("div", { className: "__desc" }),
    venueEl = createMarkup("p", { className: "__venue" });

    descEl.append(
      createMarkup(
        "h3",
        { textContent: "Details" },
        { "aria-label": "Event details" },
      ),
    );
    venueEl.innerHTML = `
      <img src="${config?.organizer?.logo || ""}" alt="${
        config?.organizer?.name || ""
        }" />
      <span>${config?.organizer?.name || ""}</span>
    `;

    let 
    fragment = document.createDocumentFragment(),
    __media = mediaPlaceholder({
      venue: config?.organizer?.shortName || "",
      title: "Img not found",
      date: "--/--/----",
    });

    if (!match) {
      // events not found
      rightContainer.classList.add("__404");

      titleEl.textContent = "Event not found (404 Error)";

      dateEl.textContent = "--/--/----";
      descEl.append(
        createMarkup("p", {
          textContent: "The event you are looking for is not available.",
        }),
      );

      overlay.append(__media);
      posterContainer.append(__media.cloneNode(true));
      rightContainer.append(titleEl, venueEl, dateEl, descEl);
      fragment.append(rightContainer);
    } else {
      rightContainer.classList.add("__event");

      const {
        age,
        title,
        tickets,
        mediaUrl,
        excerpt,
        startDate,
        mediaType,
        cartUrl,
      } = events[match];

      if (mediaType && mediaUrl) {
        if (mediaType === "video") {
          __media = createMarkup("video", {}, {
              src: mediaUrl,
              alt: `${title || ""} - poster`,
              loop: true,
              muted: true,
              controls: false,
              playsinline: true,
              autoplay: true,
          });
        }
        if (mediaType === "image") {
          __media = createMarkup("img", {}, {
              src: mediaUrl,
              alt: `${title || ""} - poster`,
          });
        }
      }

      // left content
      overlay.append(__media);
      posterContainer.append(__media.cloneNode(true));

      titleEl.textContent = title || "";
      dateEl.textContent = "--/--/----";

      // description
      const policyList = createMarkup("ul", { className: "__policy_list" });
      policyList.append(
        createMarkup("li", { textContent: `${age || "All ages"} Event` || "" }),
        createMarkup("li", {
          textContent: `Ticket sales are final upon purchase.`,
        }),
      );
      descEl.append(
        createMarkup("p", { textContent: excerpt || "" }),
        createMarkup("h3", { textContent: "Policy" }),
        policyList,
      );

      // organizer
      const organizerEl = createMarkup("div", { className: "__organizer" });
      const { address, name } = config?.organizer || {};
      organizerEl.append(
        createMarkup("h3", { textContent: "Venue" }),
        createMarkup("div", { textContent: name || "" }),
        createMarkup("div", {
          textContent:
            `${address?.street || ""}, ${address?.city || ""} ${
              address?.state || ""
            } ${address?.zip || ""}` || "",
        }),
        createMarkup(
          "a",
          { textContent: "Open Map" || "" },
          {
            role: "button",
            tabindex: 0,
            "aria-label": "link to google maps",
            target: "_blank",
            href: `https://maps.google.com/?q=${name}` || "",
          },
        ),
      );

      // Ticket Forms
      const formList = createMarkup("ul", { className: "__form_list" });
      let formFragment = document.createDocumentFragment();
      if (tickets && tickets instanceof Array && tickets.length >= 1) {
        tickets.forEach((ticket) => {
          const { name, stock, description, markup } = ticket,
            status = stock > 0 ? "Available" : "Sold Out",
            price = `$${ticket?.price?.totalPrice}` || 0;

          // ticket header
          const header = createMarkup("div", { className: "__header" });
          header.append(
            createMarkup("h3", {
              className: "__name",
              textContent: name || "",
            }),
          );
          const ticketDesc = createMarkup("div", { className: "__description" });
          ticketDesc.append(
            createMarkup("i", { 
                className: "__ticket_desc",
                innerHTML: description || "" 
            }),
          );

          // ticket info
          const infoRow = createMarkup("div", { className: "__row info" });
          infoRow.append(
            createMarkup("span", {
              className: "__price",
              textContent: "Price",
            }),
            createMarkup("span", { className: "__sep" }),
            createMarkup("span", {
              className: "__quantity",
              textContent: "Quantity",
            }),
            createMarkup("span", {
              className: "__total",
              textContent: "Total",
            }),
          );

          // ticket price col
          const priceCol = createMarkup("div", { className: "__price" });
          priceCol.append(
            createMarkup("span", { textContent: `${price}` || "" }),
          );

          // ticket quantity col
          const decreaseBtn = createMarkup(
              "button",
              { innerHTML: "<i class='fa-solid fa-minus'></i>", className: "__step __decrease" },
              {
                role: "button",
                tabindex: 0,
                "aria-label": `Decrease ${ticket.name || ""} quantity`,
              },
            ),
            increaseBtn = createMarkup(
              "button",
              { innerHTML: "<i class='fa-solid fa-plus'></i>", className: "__step __increase" },
              {
                role: "button",
                tabindex: 0,
                "aria-label": `Increase ${ticket.name || ""} quantity`,
              },
            );

          const quantityCol = createMarkup("div", { className: "__quantity" });
          quantityCol.append(decreaseBtn);
          quantityCol.innerHTML += markup;
          quantityCol.append(increaseBtn);

          // ticket total
          const totalCol = createMarkup("div", { className: "__total" });
          totalCol.append(
            createMarkup("span", { textContent: `${price}` || "" }),
          );

          // ticket data
          const dataRow = createMarkup("div", { className: "__row data" });
          dataRow.append(
            priceCol,
            createMarkup(
                "span", 
                { className: "__sep", innerHTML: "<i class='fa-solid fa-xmark'></i>" }
            ),
            quantityCol,
            totalCol,
          );

          const inputRow = createMarkup("div", { className: "__row input" });
          inputRow.append(
            createMarkup(
              "label",
              { className: "__label", textContent: "Add to Cart" },
              {
                for: `ticket-${ticket.id || ""}`,
                "aria-label": `Add ${ticket.name || ""} to Cart`,
              },
            ),
            createMarkup(
              "button",
              { id: `ticket-${ticket.id}`, className: "__add_to_cart", textContent: "Add to Cart" },
              {
                type: "submit",
                name: "add-to-cart",
                value: `${ticket.id || ""}`,
              },
            ),
          );

          const group = createMarkup("div", { className: "__group" });
          group.append(dataRow, inputRow);

          const form = createMarkup(
            "form",
            { className: "__form" },
            {
              method: "POST",
              action: cartUrl || "",
              enctype: "multipart/form-data",
              autocomplete: false,
              "data-provider":
                "Tribe__Tickets_Plus__Commerce__WooCommerce__Main",
              "data-provider-id": "woo",
            },
          );
          form.append(header, ticketDesc, infoRow, group);

          // form event listener for changes
          form.addEventListener("change", (e) => {
            const input = e.target
              .closest(".__quantity")
              .querySelector("input.input-text"); // user element input

            if (input) {
              e.preventDefault();
              e.stopImmediatePropagation();
              console.log(input);
            }
          });

          // form event listener for clicks
          form.addEventListener("click", (e) => {
            const increaseBtn = e.target.closest("button.__increase"),
              decreaseBtn = e.target.closest("button.__decrease"),
              addToCartBtn = e.target.closest("button[name='add-to-cart']");

            if (increaseBtn || decreaseBtn) {
              e.preventDefault();
              e.stopImmediatePropagation();

              const // user element input
                qty = e.target
                  .closest(".__quantity")
                  .querySelector("input.input-text"),
                qtyValue = Number(qty?.value || 1),
                maxQty = Number(qty?.max || 5),
                minQty = Number(qty?.min || 1),
                stepQty = Number(qty?.step || 1);

              if (qty) {
                if (increaseBtn) {
                  if (qtyValue + stepQty <= maxQty)
                    qty.value = `${Math.floor(qtyValue + stepQty)}`;
                }
                if (decreaseBtn) {
                  if (qtyValue - stepQty >= minQty)
                    qty.value = `${Math.floor(qtyValue - stepQty)}`;
                }
                qty.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
            if (addToCartBtn) return;
          });

          const formItem = createMarkup("li", { className: "__form_item" });
          formItem.append(form);
          formFragment.append(formItem);
        });
        formList.append(formFragment);
      } else {
        formFragment.append(
          createMarkup("p", { textContent: "No tickets available" }),
        );
      }

      rightContainer.append(
        titleEl,
        venueEl,
        dateEl,
        formList,
        descEl,
        organizerEl,
        //createMarkup("span", { textContent: `${JSON.stringify(tickets)}` }, {}),
      );
      fragment.append(rightContainer);
    }

    layoutLeft.append(posterContainer);
    layoutRight.append(fragment);
    layout.append(layoutLeft, layoutRight);

    popup.append(overlay, layout);
    
    return popup;
  },
  __popupViewBooking = (e, eventID = "", config = {}) => {

  },
  __blogPopups = (e, view = "", eventID = "", config = {}) => {
    let _view = "dialog",
      layout = createMarkup("div", {
        className: "__empty_layout",
        textContent: "No Content",
      }),
      sanitized =
        view && typeof view === "string"
          ? view.toLocaleLowerCase().trim()
          : "error";

    if (sanitized === "tickets" || sanitized === "booking") {
      if (sanitized === "tickets") {
        _view = "fullWidth";
        layout = __popupViewTickets(e, eventID, config);
      }
      if (sanitized === "booking") {
        _view = "fullWidth";
        layout = __popupViewBooking(e, eventID, config);
      }
    }

    popup(document.body, _view, {title: sanitized, content: layout});
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
          key: String(item.id),
          age: `${item?.age || "21+"} Event`,
          alt: item.title ? `${item.title} - poster` : "",
          src: item?.imgSrc || "",
          price: `From ${item?.price}`,
          title: item?.title || "",
          description: item?.excerpt || "",
          startMonth: startDate.month || "",
          startDay: startDate.day || "",
          startDate: `${startDate?.date} from: ${startDate?.time}`,
          endDate: `${endDate?.timezone}`,
          venue: config?.organizer?.shortName || "",
          templateName: "event",
        };
      });
      const blogListeners = (container, blogWrapper, paginationWrapper) => {
        if (blogWrapper && blogWrapper instanceof Node) {
          blogWrapper.addEventListener("click", (e) => {
            // Check if the clicked element (or its parent) has the data-tickets attribute
            const ticketBtn = e.target.closest("[data-tickets]");
            const bookBtn = e.target.closest("[data-book]");
            if (ticketBtn) __blogPopups(e, "tickets", ticketBtn.closest(".__template").id, {
                ...(config && typeof config === "object" ? config : {}),
            });
            if (bookBtn) __blogPopups(e, "booking", bookBtn.closest(".__template").id, {
              ...(config && typeof config === "object" ? config : {}),
            });
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
