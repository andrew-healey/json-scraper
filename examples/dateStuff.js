const {
    runEntireScraper
} = require('../index.js');

const json = require('./dateStuff.json');
const moment=require('moment');

runEntireScraper(json, {
    year: 2018,
    month: 3,
    day: 12
}, [{
    regex: /\$\{([^{}]+)\}/g,
    edit: (inputInfo,[_, key]) => inputInfo[key],
},{
    regex:/\$convert\{\"([^\"]+)\",\"([^\"]+)\",\"([^\"]+)\"\}/g,
    edit: (inputInfo,[_,str,fromFormat,toFormat]) => moment(str,fromFormat).format(toFormat),
}]).then(console.log);
