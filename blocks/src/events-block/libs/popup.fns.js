import { popup } from "../../../assets/js/popup.js";
import { submit, increment, decrement } from "./cart.fns.js";
import { initBookingApp } from "../../../assets/js/venue_map_svg.js";
import { formatDate, createMarkup, mediaPlaceholder } from "./utils.js";


const getEventTemplate = () => {
    const el = document.createElement("div"),
      left = el.cloneNode(true),
      right = el.cloneNode(true),
      layout = el.cloneNode(true),
      container = el.cloneNode(true);

    left.className = "__left";
    right.className = "__right";
    layout.append(left, right);
    layout.className = "__layout";

    container.append(layout);
    container.className = "__eb_ticket_popup";

    return {
      left: left,
      right: right,
      layout: layout,
      container: container,
    };
  },
  getTicketTemplate = () => createMarkup("div", {
    className: "__ticket",
    innerHTML: `
    <div class="__header">
        <h1 class="__title"></h1>
        <small class="__low_stock"></small>
    </div>
    <div class="__description"></div>
    <div class="__messages"></div>
    <div class="__section_container">
        <div class="__left">
            <div class="__field_group heading">
                <div class="__price"><i>price</i></div>
                <div class="__multiplier"><i>-</i></div>
                <div class="__quantity"><i>Quantity</i></div>
                <div class="__total"><i>Total</i></div>
            </div>
            <div class="__field_group fields">
                <div class="__price"><i>$0.00</i></div>
                <div class="__multiplier"><i>&#967;</i></div>
                <div class="__quantity">
                    <div class="__quantity_container">
                        <button class="__decrement">-</button>
                        <label for="" class="__quantity_label" hidden>Quantity</label>
                        <input
                            id=""
                            name=""
                            type="number"
                            value="1"
                            class="__quantity_input"
                            data-product-id=""
                            data-price=""
                            data-quantity=""
                        />
                        <button class="__increment">+</button>
                    </div>
                </div>
                <div class="__total"><i>$0.00</i></div>
            </div>
        </div>
        <div class="__right">
            <button type="button" role="button" name="add-to-cart" class="__add_to_cart">Add to Cart</button>
        </div>
    </div>
    <div class="__sold_out" style="display: none;">Sold Out</div>
    `,
  }),
  getEventTickets = (tickets) => {
    const 
    ticketContainer = createMarkup("div", { className: "__tickets" }),
    ticketsFragment = document.createDocumentFragment(),
    ticketTemplate = getTicketTemplate();

    function createTicket(ticket = {}) {
      if (ticket && typeof ticket === "object") {

        if( ! ticket?.id ) return;

        if( ! ticket?.name ) return;

        const nameLower = ticket.name.toLowerCase();

        const excluded = ["vip", "table"];
        if (excluded.some((x) => nameLower.includes(x))) return;

        const 
        { id, name, price, stocks, description } = ticket,
        { status, quantity } = stocks,
        { totalPrice } = price;

        const ticketEl = ticketTemplate.cloneNode(true);
        ticketEl.id = `ticket_${id}`;
        ticketEl._ref = {
          total: ticketEl.querySelector(".__field_group.fields .__total i"),
          title: ticketEl.querySelector(".__title"),
          message: ticketEl.querySelector(".__messages"),
          soldOut: ticketEl.querySelector(".__sold_out"),
          priceEl: ticketEl.querySelector(".__field_group.fields .__price i"),
          lowStock: ticketEl.querySelector(".__low_stock"),
          addToCartBtn: ticketEl.querySelector(".__add_to_cart"),
          incrementBtn: ticketEl.querySelector(".__increment"),
          decrementBtn: ticketEl.querySelector(".__decrement"),
          descriptionEl: ticketEl.querySelector(".__description"),
          quantityInput: ticketEl.querySelector(`.__quantity_input`),
          quantityLabel: ticketEl.querySelector(`.__quantity_label`),
        };

        const {
          total,
          title,
          priceEl,
          message,
          soldOut,
          lowStock,
          addToCartBtn,
          incrementBtn,
          decrementBtn,
          quantityInput,
          quantityLabel,
          descriptionEl,
        } = ticketEl._ref;

        title.textContent = name || "";
        
        descriptionEl.textContent = description || "";

        // display low stock message
        lowStock.textContent = quantity && quantity > 0 && quantity <= 5
            ? `Only ${quantity} left`
            : "";

        priceEl.textContent = `$${totalPrice || "--"}`;

        quantityLabel.setAttribute("for", `quantity_input_${id}`);
        quantityLabel.textContent = "Quantity";

        quantityInput.id = `quantity_input_${id}`;
        quantityInput.name = `quantity_${id}`;
        quantityInput.value = 1;
        quantityInput.min = 1;
        quantityInput.max = 5;
        quantityInput.dataset.productId = id;
        quantityInput.dataset.price = totalPrice;
        quantityInput.dataset.quantity = quantity;

        total.textContent = `$${totalPrice || "--"}`;

        addToCartBtn.textContent = "Add to Cart";

        // add overlay if sold out
        if( status && status !== "instock" || status === "outofstock" ) {
          soldOut.style.display = "flex";
          addToCartBtn.disabled = true;
          incrementBtn.disabled = true;
          decrementBtn.disabled = true;
          quantityInput.disabled = true;
        }

        return ticketEl;
      } else {
        return createMarkup("div", {
          className: "__no_ticket",
          textContent: "Whoops! The event tickets are yet to be released!",
        });
      }
    }

    if (tickets && typeof tickets === "object" && tickets.length > 0) {
      tickets.forEach((ticket) => {
        let newTicket = createTicket(ticket);
        if (newTicket && newTicket instanceof Node) ticketsFragment.append(newTicket);
      });
    } else {
      ticketsFragment.append(
        createMarkup("div", {
          className: "__no_ticket",
          textContent: "Whoops! The event tickets are yet to be released!",
        }),
      );
    }
    ticketContainer.append(ticketsFragment);

    ticketContainer.addEventListener("change", (e) => {
      const 
      input = e.target.closest("input.__quantity_input");

      if (!input) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const ticketCache = input.closest(".__ticket")._ref,
      { total } = ticketCache;

      if (isNaN(parseInt(input.value))) {
        input.value = 1;
        input.setAttribute("value", 1);
      }

      if (total) {
        const quantity = Number(input?.value || 1);
        const price = Number(input?.getAttribute("data-price") || 0);
        const newPrice = quantity * price;
        total.textContent = `$${newPrice}`;
      }
      return;
    });

    ticketContainer.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");

      if (!btn) return;

      const 
      ticketCache = btn.closest(".__ticket")._ref,
      { message, quantityInput } = ticketCache;

      if (btn.classList.contains("__increment") && ticketCache) {
        increment(e, ticketCache);
      } else if (btn.classList.contains("__decrement") && ticketCache) {
        decrement(e, ticketCache);
      } else if (btn.classList.contains("__add_to_cart") && message && quantityInput) {
        const 
        quantity = quantityInput.value,
        productId = quantityInput.getAttribute("data-product-id");
        submit(productId, quantity, message);
      }

      clearTimeout(message._timer);
      message._timer = setTimeout(() => {
        message.textContent = "";
        message.classList.remove("error", "success");
      }, 2500);
    });
    return ticketContainer;
  },
  getEventPoster = (config = {}) => {
    const media = createMarkup("div", { className: "__media" });
    media.append(
      config?.imgSrc && config?.imgSrc.trim() !== ""
        ? createMarkup(
            "img",
            { className: "__poster" },
            {
              src: config?.imgSrc,
              alt: `${config?.eventTitle || ""} poster`,
              loading: "lazy",
            },
          )
        : mediaPlaceholder({
            venue: config?.organizer || "Rhythmmz",
            title: config?.eventTitle || "Img not found",
            date: config?.eventDate || "--/--/----",
          }),
    );
    return media;
  },
  getEventDetails = (excerpt = "", policies = []) => {
    const details = createMarkup("div", { className: "__details" });

    if (excerpt && typeof excerpt === "string" && excerpt.trim() !== "") {
      const detailsTitle = createMarkup("h3", {
        className: "__details_title",
        textContent: "Details",
      });
      const detailsText = createMarkup("p", {
        className: "__details_text",
        innerHTML: excerpt,
      });
      details.append(detailsTitle, detailsText);
    }

    if (policies && Array.isArray(policies) && policies.length > 0) {
      const policyEl = createMarkup("div", { className: "__policies" }),
        policyFrag = document.createDocumentFragment(),
        policyUl = createMarkup("ul", { className: "__policy_list" }),
        policyTitle = createMarkup("h4", {
          className: "__policy_title",
          textContent: "Policies",
        });
      policies.forEach((policy) => {
        policyFrag.append(createMarkup("li", { innerHTML: policy }));
      });
      policyUl.append(policyFrag);
      policyEl.append(policyTitle, policyUl);
      details.append(policyEl);
    }
    return details;
  },
  getEventTitle = (title) => {
    const _title = createMarkup("h1", {
      className: "__title",
      innerHTML: title || "",
    });
    return _title;
  },
  getVenueLogo = (logo, alt = "") => {
    const _logo = createMarkup("img", {
      className: "__logo",
      src: logo || "",
      alt: `${alt || ""} logo`,
    });
    return _logo;
  },
  getVenue = (organizer = {name:"", address:"", link:"", logo:""}) => {
    const venue = createMarkup("div", { className: "__venue" });
    if (organizer && typeof organizer === "object") {
      const venueLogo = createMarkup("div", {
        className: "__venue_logo",
        innerHTML: `<img src="${organizer?.logo || ""}" alt="${
          organizer?.name || ""
        } logo" loading="lazy">`,
      });
      const venueAddress = createMarkup("div", {
        className: "__venue_address",
        textContent: organizer?.address || "",
      });
      const venueLink = createMarkup("div", {
        className: "__venue_link",
        innerHTML: `<a target="_blank" href="https://maps.google.com/?q=${
          organizer?.name || ""
        }">Open Map</a>`,
      });
      venue.append(venueLogo, venueAddress, venueLink);
    }
    return venue;
  },
  getEventHeader = (
    eventTitle = "",
    venuName = "",
    venueLogo = "",
    startDate = "",
  ) => {
    const header = createMarkup("div", { className: "__header event" });
    const titleRow = createMarkup("div", { className: "__title_row" });
    const venueRow = createMarkup("div", { className: "__venue_row" });
    const dateRow = createMarkup("div", { className: "__date_row" });
    const dateParts = formatDate(startDate);

    if (venueLogo && venueLogo.trim() !== "") {
      const logo = createMarkup(
        "img",
        { className: "__logo" },
        { src: venueLogo, alt: `${venuName || ""} logo`, loading: "lazy" },
      );
      venueRow.append(logo);
    }

    if (venuName && venuName.trim() !== "") {
      const venueNameEl = createMarkup("span", {
        className: "__title",
        innerHTML: venuName,
      });
      venueRow.append(venueNameEl);
    }

    if (eventTitle && eventTitle.trim() !== "") {
      const eventTitleEl = createMarkup("h1", {
        className: "__title",
        innerHTML: eventTitle,
      });
      titleRow.append(eventTitleEl);
    }

    if (dateParts && typeof dateParts === "object") {
      const dateEl = createMarkup("div", {
        className: "__date",
        innerHTML: `${dateParts?.dayName || ""}, ${dateParts.date} at ${
          dateParts.time
        }`,
      });
      dateRow.append(dateEl);
    }

    header.append(titleRow, venueRow, dateRow);

    return header;
  },
  getEventFooter = (venueName = "", venueLogo = "", venueSocials = []) => {
    const footer = createMarkup("div", { className: "__footer" });
  },
  getPopupTitle = (title, logo) => {
    const _title = createMarkup("h1", {
      className: "__title",
      innerHTML: title || "",
    });
    return _title;
  };

const createTicketPopup = (eventID, config = {}) => {
  console.log("event id", eventID)
  const 
  events = window?.RhythmzEventsBlockData?.events || {},
  organizer = window?.RhythmzEventsBlockData?.organizer || {},
  eventData = events[eventID],
  popupLayout = getEventTemplate(),
  content = popupLayout.container,
  leftContent = popupLayout.left,
  rightContent = popupLayout.right;

  if (eventData) {
    const { ageRestriction, title, tickets, mediaSrc, startDate, endDate, excerpt } =
      eventData;
    // create event poster
    let poster = getEventPoster({
      imgSrc: mediaSrc || "",
      organizer: organizer?.shortName || "Rhythmz",
      eventDate: startDate,
      eventTitle: title,
    });
    content.prepend(poster);
    leftContent.append(poster.cloneNode(true));

    // create event contents
    rightContent.append(
      getEventHeader(
        title,
        organizer?.name || "Rhythmz",
        "", //`${organizer?.logo || ''}`,
        startDate,
      ),
      getEventTickets(tickets),
      getEventDetails(excerpt, [
        `${ageRestriction || "21+"} Event`,
        "Ticket sales are final upon purchase.",
        ...(config?.policies && Array.isArray(config.policies)
          ? config.policies
          : []),
      ]),
      getVenue({
        name: organizer?.shortName || "",
        address: `${organizer?.address?.street || ''}, ${organizer?.address?.city || ''}, ${organizer?.address?.state || ''} ${organizer?.address?.zip || ''}`,
        link: `https://maps.google.com/?q=${organizer?.shortName.replaceAll(' ', '+') || ''}`,
        logo: `${organizer?.logo || ''}`,
      }),
    );
  } else {
    const $title_text = "(404) Error: Event not found";
    // create event poster
    let poster = getEventPoster({
      imgSrc: "",
      organizer: organizer?.shortName || "Rhythmz",
      eventDate: "",
      eventTitle: $title_text,
    });
    content.prepend(poster);
    leftContent.append(poster.cloneNode(true));

    // create event contents
    rightContent.append(
      getEventTitle($title_text),
      createMarkup("div", { className: "__date" }),
      getEventTickets([]),
      createMarkup("div", { className: "__desc" }),
      createMarkup("p", { className: "__venue" }),
    );
  }

  popup(document.body, "fullWidth", {
    title: createMarkup("div", {
      className: "__popup_title",
      textContent: "Tickets",
    }),
    content: content,
    ...(config && "popup" in config && typeof config.popup === "object"
      ? config.popup
      : {}),
  });
  
},
createBookingPopup = (eventID, config = {}) => {

  const bookingTemp = initBookingApp(eventID);

  popup(document.body, 'fullWidth', {
    title: "Booking",
    content: bookingTemp 
      ? bookingTemp 
      : createMarkup("div", { textContent: "No tickets available" }),
    ...(config && "popup" in config && typeof config.popup === "object"
      ? config.popup
      : {}),
  });
}

export { createBookingPopup, createTicketPopup };
