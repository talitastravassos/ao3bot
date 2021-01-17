const Twit = require("twit");
const fs = require("fs");
const config = require("../config");

const twit = new Twit(config);

const url =
  "https://archiveofourown.org/works/search?utf8=%E2%9C%93&commit=Search&work_search%5Bquery%5D=";

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

const tweetHandle = (tweetMSG) => {
  console.log(tweetMSG);
  const json = JSON.stringify(tweetMSG, null, 2);

  fs.writeFile("tweets.json", json, (error, result) => {
    // console.log(error, result);
  });

  const replyTo = tweetMSG.in_reply_to_screen_name;
  const text = tweetMSG.text.replace(`@${replyTo}`, "");
  const from = tweetMSG.user.screen_name;
  const nameID = tweetMSG.id_str;

  console.log(replyTo + from);
  console.log(text);

  if (replyTo === "ao3bot_") {
    const reply = `@${from} hey mom ${generateSearch(text)}`;
    tweetSomething(reply, nameID);
  }
};

const generateSearch = (search) => {
  return url + encodeURI(search);
};

module.exports = {
  twit,
  tweetHandle,
  tweetSomething,
};
