import request from '@/utils/request';

const homePageRequest = {
  getWallpaper() {
    return request({
      url: 'http://127.0.0.1:8080/bing/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
      method: 'get'
    });
  },
  getQuote() {
    return request({
      url: 'http://127.0.0.1:8080/hitokoto?c=a&c=b&c=d&c=i&c=k&encode=json&min_length=9',
      method: 'get'
    });
  },
  getSuggestion(params) {
    return request({
      url: 'http://127.0.0.1:8080/suggestion/su',
      method: 'get',
      params: { ...params }
    });
  }
};

export { homePageRequest };
