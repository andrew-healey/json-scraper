//Requires some stuff set in .env
require("dotenv").config();
const {runJson,getGenerator,runEntireScraper}=require("../index.js");

 (async ()=>{

   console.log(await runEntireScraper(require("./gocomics.json"),{
    comicName:"pearlsbeforeswine",
    year:"2019",
    month:"10",
    day:"4",
  }));

  //TODO Add in mcpl scraping
  
 })().catch(err=>console.log(err.toString(),err.jsonData,err.stepNumber));
