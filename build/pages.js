var glob = require('glob'); 
let pages = {};
var htmls =  glob.sync('PQ/pages/**/*.html');
// var htmls =  glob.sync('PQ/pages/home/*.html');
pages.indexWP = {
    template:'./PQ/index.html',
    js:'./PQ/indexWP.js',
    filename:'../index.html',
};
for(var i=0;i<htmls.length;i++){
    var fileArray = htmls[i].split("/");
    var name = fileArray[fileArray.length-2];
    var obj = {
        template:'./'+htmls[i],
        js:'./'+htmls[i].split('.')[0]+'WP.js',
        filename:'../'+htmls[i].split('PQ/')[1],
    }
    pages[name+'WP'] = obj;
}
module.exports = pages;