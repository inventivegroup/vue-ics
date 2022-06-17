import { saveAs } from 'file-saver'
import { IEvent } from './IEvent'
import { IRecuranceRule } from './IRecuranceRule'
import Vue from 'vue'
const version = '__VERSION__'

/**
 * Reccurence rule
 * @typedef {Object} RRule
 * @property {string} freq - Required. The frequency of event recurrence. Can be DAILY, WEEKLY, MONTHLY, or YEARLY.
 * @property {string | number | Date} until - date stringA date string representing the date on which to end repitition. Must be friendly to Date()
 * @property {number} interval - The interval of freq to recur at. For example, if freq is WEEKLY and interval is 2, the event will repeat every 2 weeks
 * @property {array} byday - Which days of the week the event is to occur. An array containing any of SU, MO, TU, WE, TH, FR, SA
 */

const Events: string[] = []

/**
 * Reccurence rule validation
 * @function
 * @param {RRule} rrule - Reccurence rule
 * @returns {boolean}
 */
function validateRepeatRule(rrule: IRecuranceRule) {
  let counter = 0
  const BYDAY_VALUES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  if (rrule.freq !== 'YEARLY' && rrule.freq !== 'MONTHLY' && rrule.freq !== 'WEEKLY' && rrule.freq !== 'DAILY') {
    counter += 1
    throw "Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
  }

  if (typeof rrule.byday !== 'undefined') {
    if ((Object.prototype.toString.call(rrule.byday) !== '[object Array]')) {
      counter += 1
      throw "Recurrence rrule 'byday' must be an array";
    }

    if (rrule.byday.length > 7) {
      counter += 1
      throw "Recurrence rrule 'byday' array must not be longer than the 7 days in a week";
    }

    rrule.byday = rrule.byday.filter(function (elem, pos) {
      return rrule.byday.indexOf(elem) == pos;
    });

    for (const d in rrule.byday) {
      if (BYDAY_VALUES.indexOf(rrule.byday[d]) < 0) {
        counter += 1
        throw "Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'";
      }
    }
  }
  return (counter === 0)
}

/**
 * Helper function for appending CRLF at start and end of file according to RFC rules.
 * @function
 * @param {string} string - iCalendar source string
 * @return {string}
 */
function addCRLF(strings: string[]) {
  return strings.join(lineEndings);
}


let counter = 0;
let lineEndings = `\r\n`;

function getUniqueNumber() {
  return counter++;
}

const install = (Vue: Vue, globalOptions = { uidDomain: 'evildvl', prodId: 'vueICS' }) => {
  (Vue as any).prototype.$ics = {

    removeAllEvents: () => {
      Events.splice(0, Events.length);
    },
    addEvent: (options: IEvent) => {
      let rruleString
      const rrule = options.recuranceRule;
      if (rrule && validateRepeatRule(rrule)) {
        rruleString = `RRULE:FREQ=${rrule.freq}`
        if (rrule.until) {
          const untilDate = new Date(rrule.until).toISOString();
          rruleString += `;UNTIL=${untilDate.substring(0, untilDate.length - 13).replace(/[-]/g, '')}000000Z`
        }
        if (rrule.interval) rruleString += `;INTERVAL=${rrule.interval}`
        if (rrule.count) rruleString += `;COUNT=${rrule.count}`
        if (rrule.byday && rrule.byday.length > 0) rruleString += `;BYDAY=${rrule.byday.join(',')}`
      }

      const start_date = options.begin;
      const end_date = options.stop;
      const now_date = new Date();
      const UID = `${now_date.getDay()}${now_date.getMonth()}${now_date.getFullYear()}-${now_date.getHours()}${now_date.getMinutes()}${now_date.getSeconds()}${getUniqueNumber()}`

      const start_year = (`0000${(start_date.getFullYear().toString())}`).slice(-4)
      const start_month = (`00${((start_date.getMonth() + 1).toString())}`).slice(-2)
      const start_day = (`00${((start_date.getDate()).toString())}`).slice(-2)
      const start_hours = (`00${(start_date.getHours().toString())}`).slice(-2)
      const start_minutes = (`00${(start_date.getMinutes().toString())}`).slice(-2)
      const start_seconds = (`00${(start_date.getSeconds().toString())}`).slice(-2)

      const end_year = (`0000${(end_date.getFullYear().toString())}`).slice(-4)
      const end_month = (`00${((end_date.getMonth() + 1).toString())}`).slice(-2)
      const end_day = (`00${((end_date.getDate()).toString())}`).slice(-2)
      const end_hours = (`00${(end_date.getHours().toString())}`).slice(-2)
      const end_minutes = (`00${(end_date.getMinutes().toString())}`).slice(-2)
      const end_seconds = (`00${(end_date.getSeconds().toString())}`).slice(-2)

      const now_year = (`0000${(now_date.getFullYear().toString())}`).slice(-4)
      const now_month = (`00${((now_date.getMonth() + 1).toString())}`).slice(-2)
      const now_day = (`00${((now_date.getDate()).toString())}`).slice(-2)
      const now_hours = (`00${(now_date.getHours().toString())}`).slice(-2)
      const now_minutes = (`00${(now_date.getMinutes().toString())}`).slice(-2)
      const now_seconds = (`00${(now_date.getSeconds().toString())}`).slice(-2)

      let start_time = '';
      let end_time = '';
      if (start_hours || start_minutes || start_seconds || end_hours || end_minutes || end_seconds) {
        start_time = `T${start_hours}${start_minutes}${start_seconds}`
        end_time = `T${end_hours}${end_minutes}${end_seconds}`
      }
      const now_time = `T${now_hours}${now_minutes}${now_seconds}`

      const start = start_year + start_month + start_day + start_time
      const end = end_year + end_month + end_day + end_time
      const now = now_year + now_month + now_day + now_time

      const Event = addCRLF([
        `BEGIN:VEVENT`,
        `UID:${UID}@${globalOptions.uidDomain}`,
        `${(options.url) ? 'URL:' + options.url : ''}`,
        `DESCRIPTION:${options.description}${(rruleString) ? '\n' + rruleString : ''}`,
        `DTSTAMP;VALUE=DATE-TIME:${now},`,
        `DTSTART;VALUE=DATE-TIME:${start}`,
        `DTEND;VALUE=DATE-TIME:${end}`,
        `LOCATION:${location}`,
        `${(options.organizer) ? 'ORGANIZER;CN=' + options.organizer.name + ':MAILTO:' + options.organizer.email : ''}`,
        `SUMMARY;LANGUAGE=${options.language}:${options.subject}`,
        `END:VEVENT`
      ].filter(s => s!==''))
      
      Events.push(Event)
      return Event
    },
    /**
     * Returns calendar
     * @function
     * @return {string} Calendar in iCalendar format
     */
    calendar: () => {
      return addCRLF([
        `BEGIN:VCALENDAR`,
        `PRODID:${globalOptions.prodId}`,
        `VERSION:2.0`,
        `${Events.join(lineEndings)}`,
        `END:VCALENDAR`
      ].filter(s => s!=='')) // .replace(/^\s*[\r\n]/gm, "").replace(/^\s+/gm, '')
    },
    /**
     * Download iCalendar file
     * @function
     * @param {string} filename  - Name of the file without extension
     */
    download: (filename: string) => {
      const Calendar = addCRLF([
        `BEGIN:VCALENDAR`,
        `PRODID:${globalOptions.prodId}`,
        `VERSION:2.0`,
        `${Events.join(lineEndings)}`,
        `END:VCALENDAR`
      ].filter(s => s!==''));
      const blob = new Blob([Calendar], { type: "text/x-vCalendar;charset=utf-8" });
      saveAs(blob, `${filename}.ics`);
    }

  }
}

const plugin = {
  install,
  version
}

export default plugin

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}
