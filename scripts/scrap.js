const cheerio = require("cheerio");
const axios = require("axios");

//scraping page script
const scraping = async (url) => {
  let foundNumber = "";
  await axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    let text = $("#main")
      .find("h3.heading")
      .first()
      .text()
      .replace(/\s\s+/g, "");

    foundNumber = text.replace(" Found?", "");
  });

  return foundNumber;
};

module.exports = {
  scraping,
};
