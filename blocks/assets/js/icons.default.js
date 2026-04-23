import { registerIcon } from "./icons.js";

export function registerDefaultIcons() {
  registerIcon({ // info icon
    name: "info",
    elements: {
      circle: [{ cx: "12", cy: "12", r: "10" }],
      path: [{ d: "M12 7h.01" }, { d: "M10 11h2v6m-2 0h4" }],
    },
  });
  registerIcon({ // calendar icon
    name: "calendar",
    elements: {
      rect: [{ x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }],
      line: [
        {x1:"16", y1:"2", x2:"16", y2:"6"},
        {x1:"8", y1:"2", x2:"8", y2:"6"},
        {x1:"3", y1:"10", x2:"21", y2:"10"}
      ]
    },
  });
  registerIcon({ // close icon
    name: "close",
    elements: {
      path: [{d:"M18 6L6 18M6 6l12 12"}]
    },
  });
  registerIcon({
    // chevron-left icon
    name: "chevron-left",
    elements: {
      polyline: [{ points: "15 18 9 12 15 6" }],
    },
  });
  registerIcon({
    // chevron-right icon
    name: "chevron-right",
    elements: {
      polyline: [{ points: "9 18 15 12 9 6" }],
    },
  });
  // Add more default icons here
}
