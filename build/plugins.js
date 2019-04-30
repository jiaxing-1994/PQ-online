const pages = require('./pages');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const plugins = [];
for(var i in pages){
    plugins.push(new HtmlWebpackPlugin({
        chunks:[i],
        template:pages[i].template,
        filename:pages[i].filename,
        hash:true,
        cache:true,
        minify:{
            // removeComments:true, //去除注释
            // collapseWhitespace:true, //去除空格
            // minifyCSS:true,
        }
    }));
}
module.exports = plugins;