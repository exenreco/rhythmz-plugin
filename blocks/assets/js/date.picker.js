import { getIcon } from "./icons.js";

const 
// utility for date
DateOnly = {
  fromDate: (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },

  toDate: (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // always local
  },

  today: () => {
    return DateOnly.fromDate(new Date());
  },

  from: (input) => {
    if (!input) return DateOnly.today();

    if (typeof input === "string") {
      const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    }

    if (input instanceof Date) {
      return DateOnly.fromDate(input);
    }

    // fallback
    return DateOnly.fromDate(new Date(input));
  },
},
pickerTemplate = () => {
    const container = document.createElement("div");
    container.classList.add("__date_picker");

    const trigger = document.createElement('button');
    trigger.classList.add('__current_date');
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('role', 'button');
    trigger.innerHTML = `
        <span class="__date"></span>
    `;
    const iconWrapper = document.createElement('span');
    iconWrapper.classList.add('__icon');
    iconWrapper.append(getIcon('calendar-thin'));

    trigger.append(iconWrapper);

    const prevMonth = document.createElement('button');
    prevMonth.classList.add('prev-month');
    prevMonth.setAttribute('type', 'button');
    prevMonth.setAttribute('role', 'button');
    prevMonth.append(getIcon('chevron-left-solid'));

    const nextMonth = document.createElement('button');
    nextMonth.classList.add('next-month');
    nextMonth.setAttribute('type', 'button');
    nextMonth.setAttribute('role', 'button');
    nextMonth.append(getIcon('chevron-right-solid'));

    const monthDisplay = document.createElement('h2');
    monthDisplay.classList.add('month-display');

    const calendarDays = document.createElement('div');
    calendarDays.classList.add('calendar-days');

    const calendarHeader = document.createElement('div');
    calendarHeader.classList.add('calendar-header');
    calendarHeader.append(prevMonth, monthDisplay, nextMonth);

    const calendarWeekdays = document.createElement('div');
    calendarWeekdays.classList.add('calendar-weekdays');
    calendarWeekdays.innerHTML = `
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    `;

    const calendarContainer = document.createElement('div');
    calendarContainer.classList.add('calendar-container');
    calendarContainer.append(calendarHeader, calendarWeekdays, calendarDays);

    container.append(trigger, calendarContainer);

    /*container.innerHTML = `
        <div class="calendar-container">
            <div class="calendar-header">
                <button class="prev-month" type="button" role="button">
                    ${getIcon('chevron-left-thin')}
                </button>
                <h2 class="month-display"></h2>
                <button class="next-month" type="button" role="button">
                    ${getIcon('chevron-right-thin')}
                </button>
            </div>
            <div class="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div class="calendar-days"></div>
        </div>
    `;
    container.prepend(trigger);*/
    container._ref = {
      prevMonth: container.querySelector(".prev-month"),
      nextMonth: container.querySelector(".next-month"),
      currentDate: container.querySelector(".__current_date"),
      monthDisplay: container.querySelector(".month-display"),
      calendarDays: container.querySelector(".calendar-days"),
      currentDateText: container.querySelector(".__current_date .__date"),
      calendarContainer: container.querySelector(".calendar-container"),
    };
    return container;
},
datePicker = (selectedDate, markedDates = [], onChange) => {

 
  const 
  calendar = pickerTemplate(),
  formatters = {
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit" }),
    year: new Intl.DateTimeFormat("en-US", { year: "numeric" }),
    time: new Intl.DateTimeFormat("en-US", { timeStyle: "short" }),
    month: new Intl.DateTimeFormat("en-US", { month: "short" }),
    monthLong: new Intl.DateTimeFormat("en-US", { month: "long" }),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }),
    timezone: new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }),
  },

   // 1. NORMALIZE MARKED DATES
  // This converts "January 13, 2026..." into "2026-01-13"
  normalizedMarkers = new Set((markedDates || []).map(DateOnly.from).filter(Boolean));

  // 1. Keep track of the "viewing" date in state
  let 
  viewDate = selectedDate ? DateOnly.toDate(DateOnly.from(selectedDate)) : new Date(),
  activeDate = selectedDate ? DateOnly.from(selectedDate) : null;

  // 2. Wrap the drawing logic in a function
  function render() {
    const 
    year = viewDate.getFullYear(),
    month = viewDate.getMonth(),
    currentDate = activeDate ? DateOnly.toDate(activeDate) : viewDate;

    // update header text
    calendar._ref.currentDateText.textContent = `
        ${formatters.weekday.format(currentDate)}, 
        ${formatters.month.format(currentDate)} 
        ${formatters.day.format(currentDate)},
        ${formatters.year.format(currentDate)}
    `;

    // Set Header
    const monthName = formatters.monthLong.format(viewDate);
    calendar._ref.monthDisplay.textContent = `${monthName} ${year}`;

    // Clear previous cells
    calendar._ref.calendarDays.innerHTML = "";

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty slots
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDiv = document.createElement("div");
      calendar._ref.calendarDays.append(emptyDiv);
    }

    const todayStr = DateOnly.today();

    // Create day cells
    const daysFragment = document.createDocumentFragment();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.classList.add("day");
      dayElement.textContent = day;

      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;

      // ADDED: Check if this day is the ACTIVE/SELECTED day
      if (activeDate === dateStr) {
        dayElement.classList.add("selected");
      }

      // 2. CHECK THE NORMALIZED LIST
      if (normalizedMarkers.has(dateStr)) {
        dayElement.classList.add("has-marker");
      } else {
        dayElement.classList.add("disabled");
      }

      if (dateStr === todayStr) {
        dayElement.classList.add("today");
      }

      daysFragment.append(dayElement);
    }
    calendar._ref.calendarDays.append(daysFragment);
  }

  // 3. Updated Click Listener
  calendar.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const 
    btn = e.target.closest("button"),
    dayEl = e.target.closest(".day");

    if (btn) {
      // Set selected month
      if (btn.classList.contains("__current_date")) {
        calendar._ref.calendarContainer.classList.toggle("active");
      } else if (btn.classList.contains("prev-month")) {
        // Fixed class name
        viewDate.setMonth(viewDate.getMonth() - 1);
      } else if (btn.classList.contains("next-month")) {
        // Fixed class name
        viewDate.setMonth(viewDate.getMonth() + 1);
      } else {
        return;
      }
      render();
      return;
    } else if (dayEl) {

      if(dayEl.classList.contains("disabled")) return;
      if (dayEl.classList.contains("selected")) return;

      const day = Number(dayEl.textContent);
      // Create TWO separate Date objects so they don't share a reference
      activeDate = DateOnly.from(
        new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
      );
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

      if (onChange && typeof onChange === "function") onChange(activeDate);

      render();
      return;

    } else {
      return;
    }
  });

  // Initial render
  render();

  return calendar;
};

export { datePicker };
