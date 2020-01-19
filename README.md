# JSON Scraper
## Tool for creating complex, multi-step static web scrapers with cookies, auth and more
### Installation
JSON Scraper is built and published on the Github Package Registry.
`npm install @sesamestrong/json-scraper`
```node
const {runEntireScraper}=require("@sesamestrong/json-scraper");
(async ()=>{
  console.log(await runEntireScraper(require('./myScraper.json'),{username:"exampleUsername",password:"exPw"});
})();
```
### Error Reporting
JSON Scraper adds a ```jsonData``` and a ```stepNumber``` property to any error that it may throw.

### Use
`json-scraper` is a library designed to both reduce boilerplate in web scraping and provide a secure, language-agnostic platform on which to write web scrapers.

One writes a scraper in a step-based format, such as the following:

```json
{
"steps":[
{
"headers":{
"uri":"https://google.com/",
"method":"POST",
"headers":{
"Content-Type":"application/json"
}
},
"frame":{
"%title":"meta[property='twitter:title'] @ content",
"%imgSrc":"center img[title] @ src || https://.+$"
}
}]
```

This example will get the current title and image shown on the Google homepage. For example, if one were to run this scraper on the 4th of July, the return value of the scraper will be as follows:

```json
{
"title":"Happy Fourth of July!",
"imgSrc":"https://google.com/logos/doodles/2019/fourth-of-july...2.2-I.png"
}
```

Currently, its only implementation is in NodeJS. Specific parameters are in the format specified by `request`, meaning that `json-scraper` is biased towards NodeJS. This problem can be solved in one of two ways:

1. A change in the default spec
  There is no specification in `json-scraper` yet; the only artifact is the code itself in the library. However, when a specification is written, it can very well include mrome language-agnostic features.
2. Options for individual formats
  This means that one can write their JSON files in many ways (with many different naming practices), but every style still compiles to one common format. This is the most likely option if `json-scraper` is to be continued, because it allows the library to be ergonomic for Python, Java, NodeJS and Go developers alike.
