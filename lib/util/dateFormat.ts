function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatClockTime(date: Date) {
  if (isNaN(date.getTime())) return "Invalid date";
  const hour = date.getHours() % 12 || 12;
  const meridiem = date.getHours() < 12 ? "AM" : "PM";
  return `${hour}:${pad2(date.getMinutes())} ${meridiem}`;
}

export function formatMonthDay(date: Date) {
  if (isNaN(date.getTime())) return "Invalid date";
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

export function formatDateTime(date: Date) {
  if (isNaN(date.getTime())) return "Invalid date";
  return `${date.getMonth() + 1}/${pad2(date.getDate())} ${formatClockTime(
    date,
  )}`;
}
