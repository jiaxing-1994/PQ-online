const pages = require('./pages');
const entrys = {};
for(var i in pages){
    if(pages[i].js != ''){
        entrys[i] = pages[i].js;
    }
}

module.exports = entrys;