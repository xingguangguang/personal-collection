const { defineConfig } = require('@vue/cli-service');
const path = require('path');
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
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
          // hostRewrite: { 'http://127.0.0.1:8080/': 'https://cn.bing.com/' },
          pathRewrite: { '/bing': '' }
        },
        '/hitokoto': {
          target: 'https://v1.hitokoto.cn/',
          changeOrigin: true,
          secure: false,
          hostRewrite: { 'http://127.0.0.1:8080/': 'https://v1.hitokoto.cn/' },
          pathRewrite: { '/hitokoto': '' }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
});
