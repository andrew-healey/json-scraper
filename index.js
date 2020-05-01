const request = require("request-promise");
const cheerio = require("cheerio");
const jsonframe = require("@sesamestrong/jsonframe-cheerio");
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
const runJson = async function*(scraper, {
    vars: inputInfo,
    jars = {}
} = {}, extensions,defaultHeaders={}) {
    const {
        steps
    } = scraper;
    let data = { ...inputInfo
    }; //data, the state of the scraper between steps, allows for the passing of initial state via inputInfo

    let count = 0;
    for (let step of steps) {
        if (step.headers) {
            const headers = replaceEachString(step.headers, data, extensions); //Converts all ${varName} to the varName property of the data variable

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
                    headers["status-codes"] && Object.values(headers["status-codes"]).map(i => i.toString()).includes(err.statusCode.toString())
                ) {
                    //Do not run the frame to scrape, just return the unchanged data
                    yield data;
                    continue;
                }

                //Throw the error if it is not a StatusCodeError with an expected status code
                err.jsonData = data;
                err.stepNumber = count;
                err.headers=headers;
                throw err;
            }

            //This point is only reached if res is an HTML body of the response and there was no error status code
            if (step.json) {
                const json = res instanceof Object ? res : !res ? {} : JSON.parse(res);
                namedData = setNames(json, step.json);
                data = getVars(namedData, "", data);
            } else if (step.frame) {
                //$ is part of cheerio and can be used for JQuery-esque selection
                const $ = cheerio.load(res, {
                    xmlMode: false
                });
                //Add JSONFrame capabilities to cheerio (adds $(selector).scrape(json))
                jsonframe($);

                const scrapedData = ($.root().scrape(replaceEachString(step.frame, data, extensions)));

                data = getVars(scrapedData, "", data); //See util.js
            } else if (step.text) {
                data = getVars({
                    [step.text]: res
                }, "", data);
            }
        }

        if (step.set) {
            data = getVars(replaceEachString(step.set, data, extensions), "", data);
        }


        yield {
            vars: data,
            jars
        }; //Note that this is returning data by reference in order to allow the user to modify it before running the next step
        count++;
    }
    return jars;
};

const runEntireScraper = async (json, inputInfo, extensions, doCookies) => {
    let value, done;
    const gen = runJson(json, inputInfo, extensions);
    let i = 0;
    let endCookies = undefined;
    while (!done) {
        const ret = await gen.next();
        done = ret.done;
        if (done) endCookies = ret.value;
        else value = ret.value || value;
    }
    return doCookies ? ({
        vars: value,
        jars: endCookies
    }) : (value || {});
};

module.exports = {
    runJson,
    runEntireScraper,
    replaceEachString,
    getString,
};
