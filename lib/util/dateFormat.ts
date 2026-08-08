function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatClockTime(date: Date) {
  const hour = date.getHours() % 12 || 12;
  const meridiem = date.getHours() < 12 ? "AM" : "PM";
  return `${hour}:${pad2(date.getMinutes())} ${meridiem}`;
}

export function formatMonthDay(date: Date) {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

export function formatDateTime(date: Date) {
  return `${date.getMonth() + 1}/${pad2(date.getDate())} ${formatClockTime(
    date,
  )}`;
}
