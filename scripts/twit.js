const Twit = require("twit");
const fs = require("fs");
const config = require("../config");
const scrap = require("./scrap");

const twit = new Twit(config);

const url =
  "https://archiveofourown.org/works/search?utf8=%E2%9C%93&commit=Search&work_search%5Bquery%5D=";

const completePossibilities = [
  "complete",
  "only complete",
  "complete only",
  "concluídas",
  "concluidas",
  "completas",
];

const tweetSomething = (message, nameID) => {
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
  const text = removeCompleteQuery(tweetMSG.text.replace(`@ao3bot_`, ""));
  const query = tweetMSG.text.replace(`@ao3bot_`, "").trim();

  const from = tweetMSG.user.screen_name;
  const nameID = tweetMSG.id_str;
  const foundNumber = await scrap.scraping(generateSearch(query));

  // console.log("query", query);
  // console.log("replyTo", replyTo);
  // console.log("from", from);

  console.log(text);
  console.log(foundNumber);

  let reply = "";
  if (Number(foundNumber)) {
    reply = `@${from} your search for "${text}" returns ${foundNumber} works 🥳 ${generateSearch(
      query
    )}`;
  } else {
    reply = `@${from} I'm sorry, your search has no results 😔`;
  }
  tweetSomething(reply, nameID);
};

const completeCheck = (search) => {
  const onlyComplete = completePossibilities.map((possibility) =>
    search.includes(possibility)
  );

  return onlyComplete.includes(true);
};

const generateSearch = (search) => {
  const completeQuery = completeCheck(search)
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
};
