async function getTimmings(date, location) {
  const apiURL = `http://api.aladhan.com/v1/calendarByCity?city=Lahore&country=Pakistan&method=2&month=04&year=2017`;
  try {
    const results = await fetch(apiURL);
    const json = await results.json();
    const today = new Date();
    return json.data[today.getDate() - 1];
  } catch (err) {
    console.log(err);
  }
}

export const getPrayerTimings = (date, location) => {
  return getTimmings(date, location);
};
