const { defineConfig } = require('@vue/cli-service');
const path = require('path');
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  productionSourceMap: false,
  transpileDependencies: true,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            '@SE-index': 0
          }
        }
      }
    }
  },
  configureWebpack: {
    name: 'hanyexinPersonalCollection',
    devServer: {
      port: 8080,
      hot: true,
      proxy: {
        '/bing': {
          target: 'https://cn.bing.com/',
          changeOrigin: true,
          secure: false,
          hostRewrite: { 'http://localhost:8080/': 'https://cn.bing.com/' },
          // hostRewrite: { 'http://127.0.0.1:8080/': 'http://127.0.0.1:8000/' },
          pathRewrite: { '/bing': '' }
        },
        '/hitokoto': {
          target: 'https://v1.hitokoto.cn/',
          changeOrigin: true,
          secure: false,
          hostRewrite: { 'http://localhost:8080/': 'https://v1.hitokoto.cn/' },
          pathRewrite: { '/hitokoto': '' }
        },
        '/suggestion': {
          target: 'https://suggestion.baidu.com/',
          changeOrigin: true,
          secure: false,
          hostRewrite: { 'http://localhost:8080/': 'https://suggestion.baidu.com/' },
          pathRewrite: { '/suggestion': '' }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload'); // TODO: need test
    config.plugins.delete('prefetch'); // TODO: need test
    config.when(process.env.NODE_ENV !== 'development', config => {
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
            priority: 20 // the weight needs to be larger than libs and app or it will be packaged into libs or app
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      });
      config.optimization.runtimeChunk('single'),
        {
          from: path.resolve(__dirname, './public/robots.txt'), //防爬虫文件
          to: './' //到根目录下
        };
    });
  }
});
