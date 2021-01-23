const bot = require("./scripts/twit");

const { dailyTweet, tweetHandle, twit } = bot;

const stream = twit.stream("statuses/filter", { track: "@ao3bot_" });

stream.on("tweet", tweetHandle);

const oneHour = 60 * 60 * 1000;

// Takes an array of hours as number and a function to execute
function executeOnHours(hours, callback) {
  let now = new Date();
  const hoursWithToogle = hours.map((h) => {
    return {
      value: h,
      executedToday: now.getHours() === h, // Don't run now if already on the given hour
    };
  });
  setInterval(() => {
    now = new Date();
    const triggers = hoursWithToogle.filter((h) => {
      if (!h.executedToday && h.value === now.getHours()) {
        return (h.executedToday = true);
      } else if (h.value !== now.getHours()) {
        h.executedToday = false; // Clean the boolean on the next hour
      }
    });
    if (triggers.length) callback(); // Trigger the action if some hours match
  }, oneHour);
}

executeOnHours([10, 16, 22], dailyTweet);
