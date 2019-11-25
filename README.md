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
