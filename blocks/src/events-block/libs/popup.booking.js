import { createMarkup } from "./utils.js";
import { popup } from "../../../assets/js/popup.js";
import { initBookingApp } from "../../../assets/js/venue_map_svg.js";

const createBookingPopup = (eventID) => {

  const bookingTemp = initBookingApp(eventID);

  popup(document.body, 'fullWidth', {
    title: "booking",
    content: bookingTemp 
      ? bookingTemp 
      : createMarkup("div", { textContent: "No tickets available" }),
  });
}

export { createBookingPopup };
