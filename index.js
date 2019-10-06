const request = require("request-promise");
const cheerio = require("cheerio");
const jsonframe = require("jsonframe-cheerio");
const {
  StatusCodeError,
  RequestError
} = require("request-promise/errors");
const {
  getString,
  replaceEachString,
  getVars,
  flatObject
} = require("./getComponents.js");

const runJson = async function*(scraper, inputInfo = {}) {
  const {
    steps
  } = scraper;
  //console.log("STARTING", inputInfo);
  let data = { ...inputInfo
  };
  let jars = {};
  for (let step of steps) {
    //console.log(step.headers,data);
    const headers = replaceEachString(step.headers, data);
    if (headers.jar) {
      if (!jars[headers.jar]) jars[headers.jar] = request.jar();
      headers.jar = jars[headers.jar];
    }
    delete headers.resolveWithFullResponse;
    console.log(headers);
    let res;
    try {
      res = await request(headers);
    } catch (err) {
      //TODO Decide if or if not an error within the expected status codes should be scraped via cheerio
      if (err instanceof StatusCodeError && headers["status-codes"] && Object.values(headers["status-codes"]).includes(err.statusCode.toString())) {
        yield data;
        continue;
      }
      throw err;
    }
    const $ = cheerio.load(res);
    jsonframe($);
    //console.log("Does frame exist?",step.frame);
    //console.log(res);
    data = { ...data,
      ...getVars(flatObject($("*").scrape(step.frame || {})))
    };
    yield data; //Note that this is returning it by reference in order to allow the user to modify it before running the next step
  }
};

module.exports = {
  runJson
};
