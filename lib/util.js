export function prettifyData(data) {
  return isNaN(data) ? data : +data.toFixed(2);
}

export function last(arr, def = null) {
  return arr.length > 0 ? arr[arr.length - 1] : def;
}
