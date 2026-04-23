import { createMarkup } from "./utils.js";
import { popup } from "../../../assets/js/popup.js";
import { MAP_CONFIG, bookingTemplate } from "../../../assets/js/venue_map_svg.js";

function changeEventTemplate () {
}

function changeSelectedEvent() {
}

const createBookingPopup = (eventID) => {

  const 
  events = window?.RhythmzEventsBlockData?.events || {},
  eventData = events[eventID],
  eventTickets = eventData?.tickets || {},
  EVENT_CONFIG = [];
  
  if (eventTickets && eventTickets.length > 0) {
    eventTickets.forEach((ticket) => {
      const nameLowered = ticket?.name?.toLowerCase().trim();

      if (nameLowered) {
        MAP_CONFIG.forEach((item) => {
          const mapNameLowered = item?.name?.toLowerCase().trim();

          if (mapNameLowered) {
            // 1. Reversed the logic: Does the long Map Name contain the Ticket Name?
            // OR: Does the Ticket Name contain the Map Name?
            if (
              mapNameLowered.includes(nameLowered) ||
              nameLowered.includes(mapNameLowered)
            ) {
              // 2. Removed Array.isArray(item) because 'item' is an Object
              EVENT_CONFIG.push({
                ...item,
                price: ticket?.price?.totalPrice || 0,
                ticket: ticket || {},
              });
            }
          }
        });
      }
    });
  }

  const bookingTemp = bookingTemplate(EVENT_CONFIG, eventID);

  popup(document.body, 'fullWidth', {
    title: "booking",
    content: bookingTemp 
      ? bookingTemp 
      : createMarkup("div", { textContent: "No tickets available" }),
  });
}

export { createBookingPopup };
