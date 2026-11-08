import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/vi';

import { I18N_LANG_KEY } from '../storage/keys';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export function getLang() {
  return localStorage.getItem(I18N_LANG_KEY) || 'en';
}

const LOCALE_MAP = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-cn',
  vi: 'vi',
};

function toDayjsLocale(lang) {
  return LOCALE_MAP[lang] || 'en';
}

const PATTERN_BY_LANG = {
  en: { date: 'MMM D, YYYY', dateTime: 'MMM D, YYYY h:mm A' },
  ko: { date: 'YYYY/MM/DD', dateTime: 'YYYY/MM/DD HH:mm' },
  ja: { date: 'YYYY/MM/DD', dateTime: 'YYYY/MM/DD HH:mm' },
  zh: { date: 'YYYY/MM/DD', dateTime: 'YYYY/MM/DD HH:mm' },
  vi: { date: 'DD/MM/YYYY', dateTime: 'HH:mm DD/MM/YYYY' },
};

function getPatterns(lang) {
  return PATTERN_BY_LANG[lang] || PATTERN_BY_LANG.en;
}

// ---------------------------
// Timezone
// ---------------------------
// Browser local timezone (ex: "Asia/Seoul")
export function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

// ---------------------------
// Validator
// ---------------------------
const isValidDate = (date) => date !== null && date !== undefined && dayjs(date).isValid();

// ---------------------------
// Formatters (UTC -> TZ -> locale)
// ---------------------------

export function formatDateTime(date, { timezoneStr, template } = {}) {
  if (!isValidDate(date)) return '-';

  const lang = getLang();
  const locale = toDayjsLocale(lang);
  const patterns = getPatterns(lang);

  const tz = timezoneStr || getLocalTimeZone();

  // Treat input as UTC, convert to tz for display
  const d = dayjs.utc(date).tz(tz);

  return d.locale(locale).format(template || patterns.dateTime);
}

export function formatDate(date, { timezoneStr, template } = {}) {
  if (!isValidDate(date)) return '-';

  const lang = getLang();
  const locale = toDayjsLocale(lang);
  const patterns = getPatterns(lang);

  const tz = timezoneStr || getLocalTimeZone();

  const d = dayjs.utc(date).tz(tz);

  return d.locale(locale).format(template || patterns.date);
}

// ----------------------------------------------------------------------

/**
 * @Docs
 * https://day.js.org/docs/en/display/format
 */

/**
 * Default timezones
 * https://day.js.org/docs/en/timezone/set-default-timezone#docsNav
 *
 */

/**
 * UTC
 * https://day.js.org/docs/en/plugin/utc
 * @install
 * import utc from 'dayjs/plugin/utc';
 * dayjs.extend(utc);
 * @usage
 * dayjs().utc().format()
 *
 */

// ----------------------------------------------------------------------

export const formatPatterns = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'DD MMM YYYY', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

// ----------------------------------------------------------------------

export function today(template) {
  return dayjs(new Date()).startOf('day').format(template);
}

export function todayWithTZ(template) {
  const date = dayjs(new Date());

  const userTimezone = getLocalTimeZone();
  const dateWithTZ =
    userTimezone && userTimezone !== 'UTC' ? dayjs.utc(date).tz(userTimezone) : dayjs.utc(date);

  return dateWithTZ.startOf('day').format(template);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Apr 2022 12:00 am
 */

// ----------------------------------------------------------------------

export function fDateTime(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Apr 2022
 */

// ----------------------------------------------------------------------

export function fDate(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}

// ----------------------------------------------------------------------

/**
 * @output 12:00 am
 */

// ----------------------------------------------------------------------

export function fTime(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.time);
}

// ----------------------------------------------------------------------

/**
 * @output 1713250100
 */

// ----------------------------------------------------------------------

export function fTimestamp(date) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).valueOf();
}

// ----------------------------------------------------------------------

/**
 * @output a few seconds, 2 years
 */

// ----------------------------------------------------------------------

export function fToNow(date) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).toNow(true);
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsBetween(inputDate, startDate, endDate) {
  if (!isValidDate(inputDate) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (
    formattedInputDate === 'Invalid date' ||
    formattedStartDate === 'Invalid date' ||
    formattedEndDate === 'Invalid date'
  ) {
    return false;
  }

  return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsAfter(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isAfter(endDate);
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsSame(startDate, endDate, unitToCompare) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isSame(endDate, unitToCompare ?? 'year');
}

/**
 * @output
 * Same day: 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same year: 25 Apr - 26 May 2024
 */

// ----------------------------------------------------------------------

export function fDateRangeShortLabel(startDate, endDate, initial) {
  if (!isValidDate(startDate) || !isValidDate(endDate) || fIsAfter(startDate, endDate)) {
    return 'Invalid date';
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, 'year');
  const isSameMonth = fIsSame(startDate, endDate, 'month');
  const isSameDay = fIsSame(startDate, endDate, 'day');

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

// ----------------------------------------------------------------------

export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const date = dayjs().add(
    dayjs.duration({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    })
  );

  const userTimezone = getLocalTimeZone();
  const dateWithTZ =
    userTimezone && userTimezone !== 'UTC' ? dayjs.utc(date).tz(userTimezone) : dayjs.utc(date);

  return dateWithTZ.format();
}

/**
 * @output 2024-05-28T05:55:31+00:00
 */

// ----------------------------------------------------------------------

export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const date = dayjs().subtract(
    dayjs.duration({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    })
  );

  const userTimezone = getLocalTimeZone();
  const dateWithTZ =
    userTimezone && userTimezone !== 'UTC' ? dayjs.utc(date).tz(userTimezone) : dayjs.utc(date);

  return dateWithTZ.format();
}

/**
 * @output 17 Apr 2022 12:00 am (with timezone)
 */

export function fDateTimeWithTZ(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const userTimezone = getLocalTimeZone();
  // userTimezone이 없거나 'UTC'이면 UTC 시간을 그대로 사용
  const dateWithTZ =
    userTimezone && userTimezone !== 'UTC' ? dayjs.utc(date).tz(userTimezone) : dayjs.utc(date);

  return dateWithTZ.format(template ?? formatPatterns.dateTime);
}

export function fDateWithTZ(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const userTimezone = getLocalTimeZone();
  const dateWithTZ =
    userTimezone && userTimezone !== 'UTC' ? dayjs.utc(date).tz(userTimezone) : dayjs.utc(date);

  return dateWithTZ.format(template ?? formatPatterns.date);
}

export function fTimeWithTZ(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const userTimezone = getLocalTimeZone();
  const dateWithTZ =
    userTimezone && userTimezone !== 'UTC' ? dayjs.utc(date).tz(userTimezone) : dayjs.utc(date);

  return dateWithTZ.format(template ?? formatPatterns.time);
}
