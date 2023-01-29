// floor minute to every [minute] minutes.
export const floorMinute = (date: Date, minute: number): Date => {
  date.setMinutes(Math.floor(date.getMinutes() / minute) * minute, 0, 0);
  return date;
};
// cail minute to every [minute] minutes.
export const ceilMinute = (date: Date, minute: number): Date => {
  date.setMinutes(Math.ceil(date.getMinutes() / minute) * minute, 0, 0);
  return date;
};
