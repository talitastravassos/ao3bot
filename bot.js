const bot = require("./scripts/twit");

const { tweetSomething, tweetHandle, twit } = bot;

const stream = twit.stream("statuses/filter", { track: "@ao3bot_" });

stream.on("tweet", tweetHandle);
