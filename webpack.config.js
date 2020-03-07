const autoprefixer = require('autoprefixer');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require ('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
module.exports = {
    entry   : './src/app/index.js',
    output  : {
        filename : 'index.js',
        // path     : path.resolve(__dirname, './dist'),
        publicPath: '/',


        path     : path.resolve('W:/domains/', './dist')
    },
    devServer:{
        publicPath: '/',
        overlay: true,
        historyApiFallback: true
    },
    devtool : 'eval-source-map',
    mode    : 'development',
    module  : {
        rules: [
            {
                // JS LOADER
                test: /.jsx?$/,
                use :'babel-loader', 
                exclude: /node_modules/
            }, 
            {
                // ASSET LOADER
                test: /\.(woff|woff2|ttf|eot)$/,
                use : [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            },
            {
                //SVG LOADER
                test: /\.(svg)$/i,
                use : [
                    {
                        loader :'file-loader',
                        options: {
                            esModule: false,
                            name: '[name].[ext]',
                            outputPath: 'svg/',
                            context: './src/svg/'
                        }
                    }
                ]
            },
            {
                // html images loader
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                            disable: true
                        }
                    }
                ]
            },
            {
                // HTML LOADER
                test: /\.html$/,    
                use: {                    loader: 'html-loader'
                }
            },
            {
                //SCSS LOADER
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader", "sass-loader?indentedSyntax"]
            },
            {
                // CSS LOADER
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer({
                                    overrideBrowserslist: ['ie >= 8', 'last 8 version']
                                })
                            ]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new FaviconsWebpackPlugin('./src/favicon.ico'),
        new CopyWebpackPlugin([
            {from:'src/pages',to:'pages'} 
        ]),
        new CopyWebpackPlugin([
            {from:'src/polygon',to:'polygon'} 
        ]),
        new CopyWebpackPlugin([
            {from:'src/svg',to:'svg'} 
        ]),
        new CopyWebpackPlugin([
            {from:'src/goods',to:'goods'} 
        ]),
        new CopyWebpackPlugin([
            {from:'src/music',to:'music'} 
        ]),
        new CopyWebpackPlugin([
            {from:'src/avatars',to:'avatars'} 
        ])
    ]
}