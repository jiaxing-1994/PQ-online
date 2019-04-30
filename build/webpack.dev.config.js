const entrys = require('./entry.js');
const plugins = require('./plugins.js');
const path = require('path');
module.exports = {
    mode:'development',
    entry:entrys,
    output:{
        publicPath:'/PQ/WPJS',
        path:path.resolve(__dirname,'../dev/PQ/WPJS'),
        filename:'[name].js'
    },
    optimization:{
        // runtimeChunk:true,
        // minimize:true
    },
    plugins:plugins,
    module:{
        rules:[   
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
                }
            },
            {
                test:/\.(sa|sc|c)ss$/,
                use: [
                  {
                    loader: 'style-loader'
                  },
                  {
                     loader: 'css-loader',
                  },
                  {
                     loader: 'sass-loader',
                  }
                ]
            },
            {
                test:/\.(ttf|eot|svg|woff|woff2)$/,
                use: 'url-loader'
            }
        ]
    },
    devServer: { //开发模式启用服务器
        contentBase: './dev',
        port: 8081,
        compress: true
    }
}