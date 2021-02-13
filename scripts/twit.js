const Twit = require("twit");
const fs = require("fs");
const config = require("../config");
const scrap = require("./scrap");
const ships = require("../ships.json");

const twit = new Twit(config);

const url =
  "https://archiveofourown.org/works/search?utf8=%E2%9C%93&commit=Search&work_search%5Bquery%5D=";

const urlPattern = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/g;

const completePossibilities = [
  "complete",
  "only complete",
  "complete only",
  "concluídas",
  "concluidas",
  "completas",
];

const acknowledgementPossibilities = [
  "thanks",
  "thank you",
  "obrigada",
  "obrigado",
  "agradecida",
  "valeu",
];

const tweetSomething = (message, nameID = null) => {
  console.log("tweetSomething", nameID);

  const tweet = {
    status: message,
    in_reply_to_status_id: nameID,
  };

  twit.post("statuses/update", tweet, (error, data, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log("tweet replied");
      // console.log(data, response);
    }
  });
};

const tweetHandle = async (tweetMSG) => {
  console.log(tweetMSG);
  const json = JSON.stringify(tweetMSG, null, 2);

  fs.writeFile("tweets.json", json, (error, result) => {
    // console.log(error, result);
  });

  const replyTo = tweetMSG.in_reply_to_screen_name;
  const text = removeCompleteQuery(
    tweetMSG.text.replace(/@ao3bot_/gi, "").replace(urlPattern, "")
  );
  const query = tweetMSG.text
    .replace(/@ao3bot_/gi, "")
    .replace(urlPattern, "")
    .trim();
  const found = await foundNumber(query);

  const from = tweetMSG.user.screen_name;
  const nameID = tweetMSG.id_str;

  if (checkPossibilities(query, acknowledgementPossibilities)) {
    return thanksTweet(from, nameID);
  }

  console.log("query", query);
  console.log("replyTo", replyTo);
  console.log("from", from);

  console.log({ text });
  console.log({ found });

  let reply = "";
  if (Number(found)) {
    reply = `@${from} bestie your search for "${text}" returns ${found} works 🥳 ${generateSearch(
      query
    )}`;
  } else {
    reply = `@${from} I'm sorry bestie, your search has no results 😔`;
  }
  tweetSomething(reply, nameID);
};

const dailyTweet = async () => {
  const random = Math.floor(Math.random() * ships.length);
  const ship = ships[random];
  const found = await foundNumber(`${ship.query} ${ship.from}`);

  const tweet = `Hey besties! Do you guys know that "${ship.query}" from ${
    ship.from
  } has ${found} works on ao3? check this out 😝 ${generateSearch(
    `${ship.query.replace("(", "").replace(")", "")} ${ship.from
      .replace("(", "")
      .replace(")", "")}`
  )}`;

  tweetSomething(tweet);
};

const checkPossibilities = (search, possibilities) => {
  const checklist = possibilities.map((possibility) =>
    search.includes(possibility)
  );

  return checklist.includes(true);
};

const thanksTweet = (from, nameID) => {
  const tweet = `@${from} You're welcome, bestie! 🥰🥰🥰`;

  tweetSomething(tweet, nameID);
};

const foundNumber = (search) => scrap.scraping(generateSearch(search));

const generateSearch = (search) => {
  const completeQuery = checkPossibilities(search, completePossibilities)
    ? "&work_search%5Bcomplete%5D=T"
    : "";

  search = removeCompleteQuery(search);

  return url + encodeURI(search) + completeQuery;
};

const removeCompleteQuery = (text) => {
  completePossibilities.map(
    (possibility) => (text = text.replace(possibility, "").trim())
  );

  return text;
};

module.exports = {
  twit,
  tweetHandle,
  tweetSomething,
  dailyTweet,
};
