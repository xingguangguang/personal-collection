import request from '@/utils/request';

const homePageRequest = {
  getWallpaper() {
    return request({
      url: '/bing/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
      // url: '/bing/app/bingWallpaper?format=js&idx=0&n=1&mkt=zh-CN',
      method: 'get'
    });
  },
  getQuote() {
    return request({
      url: '/hitokoto?c=a&c=b&c=d&c=i&c=k&encode=json&min_length=9',
      method: 'get'
    });
  },
  getSuggestion(params) {
    return request({
      url: '/suggestion/su',
      method: 'get',
      params: { ...params }
    });
  }
};

export { homePageRequest };
