
/**
 * dev networker
 * --- root /
 *    --- src
 *      |--- pages
 *    --- assets
 *      |--- images
 *      
 */

/**
 * pro networker
 * --- root /
 *    --- dist
 *      |--- pages
 *      |--- assets
 *          |--- images
 *  
 * 
 * 
 */

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob');

// 获取所有入口文件
var getEntry = function(globPath) {
    var entries = {
        // 通用类库  ,'./src/common'
        'common/scripts/vendor': ['react','react-dom'], 
        'common/styles/base': ['./src/common/styles/index.less']
    };

    glob.sync(globPath).forEach(function(entry) {
       // ./src/pages/**/index.js -> **/index
        var pathname = entry.split('/').splice(3).join('/').split('.')[0];
        entries[pathname] = [entry];
    }); 

    return entries;
};

// 判断是否是在当前生产环境
const mode = process.env.WEBPACK_SERVE ? 'development' : 'production';
const isProduction = process.env.NODE_ENV || mode === 'production';
// 多页面入口 ./src/pages/**/*.js
var entries = getEntry('./src/pages/**/index.js'); 

function resolve(dir) {
  return path.resolve(__dirname, './');
}

module.exports = {
  mode: 'development',
  // context: resolve('./'),
  entry: entries,
  output: {
    path: __dirname + '/dist',
    filename: isProduction ?'[name].[hash:8].js':'[name].js',
    // publicPath: isProduction ? '/dist/' : '/pages/',
    chunkFilename: 'chunk/[name].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [__dirname + '/src'],
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }]
      },
      {
        test: /\.less$/,
        // exclude: [__dirname+"/src/common/styles"],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '//localhost:8080/dist/' //isProduction ? '//localhost:8080/dist/' : '//localhost:8080/dist/',
            }
          },
           'css-loader', 'less-loader'
        ]
      },
      /* {
        test: /\.css$/,
        // exclude: [__dirname+"/src/common/styles"],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '//localhost:8080/dist/' //isProduction ? '//localhost:8080/dist/' : '//localhost:8080/dist/',
            }
          },
           'css-loader'
        ]
      },  */ 
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: isProduction ? '[path][name].[ext]' : '[name].[ext]', // [path][name].[ext]
            // outputPath: '/dist',
            publicPath: isProduction ? '//localhost:8080/dist/' : '//localhost:8080/assets/images',
            // useRelativePath: isProduction
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: [ '.js', '.jsx', '.less'],
    alias: {
      // '~': isProduction ?  path.resolve(__dirname, './dist') : path.resolve(__dirname),
      assets: path.resolve(__dirname, './assets'),
      components: path.resolve(__dirname, './src/components'),
      business: path.resolve(__dirname, './src/business'),
      common: path.resolve(__dirname, './src/common'),
    }
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({ // 使jquery变成全局变量,不用在自己文件require('jquery')了
        React: 'react',
        ReactDOM: 'react-dom'
    }),
    new CleanWebpackPlugin(['dist']),
    /* new HtmlWebpackPlugin({
      title: 'webpack hello',
      filename: 'index.html'
    }), */
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: !isProduction ? '[name].css' : '[name].[hash].css',
      chunkFilename: !isProduction ? '[id].css' : '[id].[hash].css',
    })
  ],
  devServer: {
    contentBase:  path.join(__dirname, './dist'),
    host: '0.0.0.0',
    port: '9091',
  },
   optimization: {
    /* splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    } */
  }

};

var chunks = Object.keys(entries);
chunks.forEach(function(pathname) {
    if(pathname.indexOf('/index') === -1) { return; }
    // if (pathname == 'vendor') {
    //     return;
    // }
    var conf = {
        title: 'My App',
        filename:  isProduction? pathname + '.html' : './pages/' + pathname + '.html', //'./pages/' + pathname + '.html',
        template: './src/template.html',
        inject: 'body',
        minify: {
            removeComments: true,
            collapseWhitespace: false
        }
    };
    if (pathname in module.exports.entry) {
        conf.chunks = ['common/scripts/vendor', 'common/styles/base',  pathname]; // 限制允许注入的文件
        conf.hash = false;
    }
    module.exports.plugins.push(new HtmlWebpackPlugin(conf));
});