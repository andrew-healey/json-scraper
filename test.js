require("dotenv").config();
/*const loadJson= async (directory=__dirname,jsonRx = /^(.*)\.json$/,jsonStr="$1.json") => {
    let providers = {};
    const filenames = await fs.readdirAsync(directory + "/providers/");
    filenames.forEach(filename => {
        if (filename.match(jsonRx)) {
            const name = filename.replace(jsonRx, "$1");
            providers[name] = require(directory+`/${name.replace(/(.*)/,jsonStr)}`);
        }
    });
    return providers;
}; 
*/
const {runJson}=require("./index.js");
/*
(async () => {
  const toTest=require("./gocomics.json");
  let done=false;
  let value=undefined;
  const gen=runJson(toTest,{
    comicName:"pearlsbeforeswine",
    year:"2019",
    month:"10",
    day:"4",
  });
  while(!done){
    const ret=await gen.next();
    done=ret.done;
    value=value||ret.value;
  }
})();*/

const getGenerator=(fileUrl,inputInfo)=>{
  const json=require("./"+fileUrl);
  return runJson(json,inputInfo);
};

const runEntireGenerator=async (fileUrl,inputInfo)=>{
  let value,done;
  const gen=getGenerator(fileUrl,inputInfo);
  let i=0;
  while(!done){
    const ret=await gen.next();
    done=ret.done;
    value=value||ret.value;
    if(ret.value)console.log(`Step ${i++} completed`);
  }
  return value;
};
(async ()=>{

  /*console.log(await runEntireGenerator("gocomics.json",{
    comicName:"pearlsbeforeswine",
    year:"2019",
    month:"10",
    day:"4",
  }));
  */
  console.log(await runEntireGenerator("freenom.json",{
    username:process.env.EMAIL,
    password:process.env.PASSWORD,
  }));
})();
