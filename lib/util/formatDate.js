export default function formatDate(date) {
  const month = date.toLocaleDateString("default", {
    month: "long",
    timeZone: "UTC",
  });
  const day = date.toLocaleDateString("default", {
    day: "numeric",
    timeZone: "UTC",
  });
  const year = date.toLocaleDateString("default", {
    year: "numeric",
    timeZone: "UTC",
  });

  const suffix =
    { 1: "st", 2: "nd", 3: "rd", 21: "st", 22: "nd", 23: "rd", 31: "st" }[
      day
    ] || "th";

  return `${month} ${day}${suffix}, ${year}`;
}
