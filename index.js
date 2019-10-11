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
  setNames,
} = require("./util.js");

const bannedProps = [
  "resolveWithFullResponse" //This changes the structure of the response and breaks scraping via jsonframe
];

/**
 * Returns a generator given JSON and optional starting state
 * Each call of .next() returns the updated state (data) of the scraper after one more step
 * This allows for modification of state in between calls of .next() because the state is returned by reference
 */
const runJson = async function*(scraper, inputInfo = {}) {
  const {
    steps
  } = scraper;
  let data = { ...inputInfo
  }; //data, the state of the scraper between steps, allows for the passing of initial state via inputInfo
  let jars = {};

  for (let step of steps) {
    const headers = replaceEachString(step.headers, data); //Converts all ${varName} to the varName property of the data variable

    if (headers.jar) { //Named jars are for auth
      if (!jars[headers.jar]) jars[headers.jar] = request.jar();
      headers.jar = jars[headers.jar];
    }
    //Remove all banned properties from the options
    if (headers.resolveWithFullResponse) headers = Object.keys(headers).reduce((last, next) => (bannedProps.includes(next) ? last : { ...last,
      [next]: headers[next]
    }), {});

    //TODO Add breakOnError property - default (true), false -> continue and not change data
    let res;
    try {
      res = await request(headers);
    } catch (err) {
      //TODO Decide if or if not an error within the expected status codes should be scraped via cheerio

      //Two possible errors: StatusCodeError and RequestError

      //We only allow handling of StatusCodeError
      if (err instanceof StatusCodeError &&
        //If status-codes property exists and it contains the thrown status code
        headers["status-codes"] && Object.values(headers["status-codes"]).includes(err.statusCode.toString())
      ) {
        //Do not run the frame to scrape, just return the unchanged data
        yield data;
        continue;
      }

      //Throw the error if it is not a StatusCodeError with an expected status code
      throw err;
    }

    //This point is only reached if res is an HTML body of the response and there was no error status code
    if (step.json) {
      const json=JSON.parse(res);
      namedData=setNames(json,step.frame);
      console.log(namedData)
      data=getVars(namedData,"",data);
    } else {
      //$ is part of cheerio and can be used for JQuery-esque selection
      const $ = cheerio.load(res);
      //Add JSONFrame capabilities to cheerio (adds $(selector).scrape(json))
      jsonframe($);

      const scrapedData = ($("*").scrape(step.frame || {}));

      data = getVars(scrapedData, "", data); //See util.js
    }


    yield data; //Note that this is returning data by reference in order to allow the user to modify it before running the next step
  }
};

const runEntireScraper = async (json, inputInfo) => {
  let value, done;
  const gen = runJson(json, inputInfo);
  let i = 0;
  while (!done) {
    const ret = await gen.next();
    done = ret.done;
    value = ret.value || value;
  }
  return value;
};

module.exports = {
  runJson,
  runEntireScraper
};
