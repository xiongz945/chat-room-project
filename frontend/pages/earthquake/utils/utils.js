export function prefixInteger(num, length) {
  return ('0000000000000000' + num).substr(-length);
}

export function date2Str(date) {
  const yyyy = prefixInteger(date.getFullYear(), 4);
  const MM = prefixInteger(date.getMonth() + 1, 2);
  const dd = prefixInteger(date.getDate(), 2);
  return yyyy + '-' + MM + '-' + dd;
}

export function time2Str(time) {
  const HH = prefixInteger(time.getHours(), 2);
  const mm = prefixInteger(time.getMinutes(), 2);
  return HH + ':' + mm;
}

export function str2Date(dateStr) {
  const yearMonthDay = dateStr.split('-');
  return new Date(
    Number(yearMonthDay[0]),
    Number(yearMonthDay[1]) - 1,
    Number(yearMonthDay[2])
  );
}
