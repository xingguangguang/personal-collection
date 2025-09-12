import { defineStore } from 'pinia';
import SEBaidu from '@/assets/homePage/SE-baidu.svg';
import SEBing from '@/assets/homePage/SE-bing.svg';
import SEGoogle from '@/assets/homePage/SE-google.svg';
import IconBaidu from '@/assets/homePage/icon-baidu.svg';
import IconBing from '@/assets/homePage/icon-bing.svg';
import IconGoogle from '@/assets/homePage/icon-google.svg';

export const useSuggestionStore = defineStore('suggestion', {
  state: () => ({
    // 搜索引擎集合
    searchEngineGroup: {
      baidu: {
        icon: IconBaidu,
        logo: SEBaidu,
        searchPath: 'https://www.baidu.com/s?ie=utf-8&wd='
      },
      bing: {
        icon: IconBing,
        logo: SEBing,
        searchPath: 'https://www.bing.com/search?q='
      },
      google: {
        icon: IconGoogle,
        logo: SEGoogle,
        searchPath: 'https://www.google.com/search?q='
      }
    },
    currentSEKey: 'baidu' // 当前选中的搜索引擎的键名
  }),
  getters: {
    currentSEInfo: state => {
      const { searchEngineGroup, currentSEKey } = state;
      return searchEngineGroup[currentSEKey];
    }
  },
  actions: {
    setCurrentSEKeys(currentSEKey) {
      this.currentSEKey = currentSEKey;
    }
  }
});
