<template>
  <div class="container">
    <img
      class="wallpaper"
      v-if="!!wallpaperUrl"
      :src="wallpaperUrl"
    />
    <!-- 搜索功能容器 -->
    <div
      class="box"
      v-on="{ click: handleClickBox, contextmenu: rightKeyMenu }"
    >
      <!-- 切换快捷工具/搜索功能 -->
      <el-icon
        class="menu-icon"
        @click="
          () => {
            searching = !searching;
          }
        "
      >
        <Menu v-if="searching" />
        <HomeFilled v-if="!searching" />
      </el-icon>
      <!-- 搜索框 -->
      <div
        class="search-bar"
        v-if="searching"
      >
        <!-- 输入框 -->
        <input
          class="search-input"
          v-model="keyword"
          @click="
            event => {
              event.stopPropagation();
            }
          "
          @keydown.enter="() => go(wd)"
        />
        <!-- 搜索引擎logo -->
        <div
          class="search-icon"
          @click="
            event => {
              event.stopPropagation();
              showSearchIconList = !showSearchIconList;
            }
          "
        >
          <img
            :src="iconList[SEIndex]"
            width="16"
            height="16"
          />
        </div>
        <!-- 搜索引擎列表 -->
        <div :class="'search-icon-list ' + (showSearchIconList ? 'show' : 'hidden')">
          <div
            class="SE-button"
            v-for="(SE, index) in SEList"
            :key="index"
            @click="changeSE(index)"
          >
            <img
              :src="SE"
              width="64"
            />
          </div>
        </div>
        <!-- 搜索按钮 -->
        <div
          class="search-button"
          @click="() => go(wd)"
        >
          <img src="@/assets/homePage/search-icon.svg" />
        </div>
        <!-- 搜索建议列表 -->
        <div class="suggestion-list suggestion-list-50">
          <ul v-if="showSuggestionList">
            <li
              v-for="suggestion in suggestionList"
              :key="suggestion"
              @click="go(suggestion)"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
      <div class=""></div>
      <!-- 一言 -->
      <div
        class="hitokoto"
        title="点击复制，右键搜索"
        @click="copy"
        @click.right="go(quote.hitokoto)"
      >
        <div class="hitokoto-blur"></div>
        <div class="hitokoto-text">
          <span
            class="content"
            v-if="quote.hitokoto"
          >
            “{{ quote.hitokoto }}”
          </span>
          <br />
          <span
            class="content-from"
            v-if="quote.from"
          >
            ——{{ quote.from + (quote.from_who ? '(' + quote.from_who + ')' : '') }}
          </span>
        </div>
        <div class="hitokoto-action">
          <el-icon
            class="hitokoto-action-button"
            title="复制"
            v-on="{ click: copy, contextmenu: copy }"
          >
            <CopyDocument />
          </el-icon>
          <el-icon
            class="hitokoto-action-button"
            title="下一条"
            v-on="{ click: refreshQuote, contextmenu: refreshQuote }"
          >
            <RefreshRight />
          </el-icon>
          <el-icon
            class="hitokoto-action-button"
            title="“为了一言的长久发展，我们恳求您在使用一言服务的同时尽可能地加入一言的链接”，点击进入《一言》"
            v-on="{ click: toAWord, contextmenu: toAWord }"
          >
            <Right />
          </el-icon>
        </div>
      </div>
    </div>
    <!-- 覆盖图层，阻断切换搜索引擎的hover，如果换成点击触发可以删除 -->
    <div
      class="cover"
      v-if="showCover"
    ></div>
  </div>
</template>

<script setup>
import less from 'less';
import { ref, onBeforeMount, watch } from 'vue';
import { homePageRequest } from '@/api/request';
import { ElMessage } from 'element-plus';
import { CopyDocument, RefreshRight, Right, Menu, HomeFilled } from '@element-plus/icons-vue';
import SEBaidu from '@/assets/homePage/SE-baidu.svg';
import SEBing from '@/assets/homePage/SE-bing.svg';
import SEGoogle from '@/assets/homePage/SE-google.svg';
import IconBaidu from '@/assets/homePage/icon-baidu.svg';
import IconBing from '@/assets/homePage/icon-bing.svg';
import IconGoogle from '@/assets/homePage/icon-google.svg';

const SEList = [SEBaidu, SEBing, SEGoogle];
const iconList = [IconBaidu, IconBing, IconGoogle];
const searchUrl = ['https://www.baidu.com/s?ie=utf-8&wd=', 'https://www.bing.com/search?q=', 'https://www.google.com/search?q='];
const SEIndex = ref(0);
const showSearchIconList = ref(false);
const wallpaperUrl = ref('');
const showCover = ref(false);
const keyword = ref('');
const quote = ref({});
const searchSuggestion = ref(true);
const suggestionList = ref([]);
const showSuggestionList = ref(false);
const searching = ref(true);

onBeforeMount(() => {
  homePageRequest.getWallpaper().then(res => {
    const url = res.images[0].url;
    const uhdUrl = url.replace(/1920x1080.jpg&rf/, 'UHD.jpg&rf');
    const normalUrl = url.replace(/1920x1080.jpg&rf/, '1280x720.jpg&rf');
    const uhdWallpaperUrl = 'https://cn.bing.com' + uhdUrl;
    const highWallpaperUrl = 'https://cn.bing.com' + url;
    const normalWallpaperUrl = 'https://cn.bing.com' + normalUrl;
    wallpaperUrl.value = normalWallpaperUrl;
    const imgHigh = new Image();
    imgHigh.onload = function () {
      imgHigh.onload = null;
      wallpaperUrl.value = highWallpaperUrl;
    };
    imgHigh.src = highWallpaperUrl;
    const imgUHD = new Image();
    imgUHD.onload = function () {
      imgHigh.onload = null;
      imgUHD.onload = null;
      wallpaperUrl.value = uhdWallpaperUrl;
    };
    imgUHD.src = uhdWallpaperUrl;
  });
  refreshQuote();
  // 监听搜索快捷键
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'KeyK') {
      e.preventDefault();
      toggleLocationSearchBox();
    }
  });
});

// 联想搜索，双向绑定的值改变时间晚于键盘事件触发时间，所以用监听属性，或者用在键盘事件中赋值替代双向绑定
watch(keyword, async () => {
  if (searchSuggestion.value === false) return;
  if (!keyword.value) {
    // 修改回调函数，避免接口返回覆盖此处逻辑
    window.dealList = () => {
      suggestionList.value = [];
      showSuggestionList.value = false;
    };
    window.dealList();
    return;
  }
  window.dealList = params => {
    const { s: list } = params;
    suggestionList.value = list;
    showSuggestionList.value = !!list.length;
  };
  const params = {
    ie: 'utf-8',
    p: 3,
    wd: keyword.value,
    cb: 'dealList'
  };
  homePageRequest.getSuggestion(params).then(res => {
    eval(res);
  });
});

// 切换搜索引擎
const changeSE = index => {
  less
    .modifyVars({ '@SE-index': index })
    .then(() => {
      console.log('成功回调');
    })
    .catch(err => {
      console.error(err);
    });
  // 以上代码没生效
  SEIndex.value = index;
  showCover.value = true;
  setTimeout(() => {
    showCover.value = false;
  }, 100);
};

// 跳转搜索
const go = wd => {
  let url = '';
  if (wd) {
    url = searchUrl[SEIndex.value] + wd;
  } else {
    url = searchUrl[SEIndex.value] + keyword.value;
  }
  keyword.value = '';
  window.open(url, '_blank');
};

// 更新一言内容
const refreshQuote = event => {
  if (event) {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
  }
  homePageRequest.getQuote().then(res => {
    quote.value = res;
  });
};

// 一言内容复制到剪切板
const copy = event => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (window.navigator) {
    window.navigator.clipboard
      .writeText(quote.value.hitokoto)
      .then(() => {
        // ElMessage.success('内容已复制到剪切板');
        ElMessage({
          message: '内容已复制到剪切板',
          type: 'success',
          offset: 10
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
};

// 跳转到一言官网
const toAWord = event => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  window.open('https://developer.hitokoto.cn/', '_blank');
};

// 切换本地搜索框的显隐
const toggleLocationSearchBox = () => {
  console.log('toggleLocationSearchBox');
};

// 点击空白区域
const handleClickBox = () => {
  showSuggestionList.value = false;
  showSearchIconList.value = false;
};

const rightKeyMenu = e => {
  console.log(e);
};
</script>

<style scoped lang="less">
// @SE-index: 0;
.blur {
  filter: blur(5px);
}
.cover {
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
.container {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  .wallpaper {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  .box {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%), radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);
    // 内阴影
    .menu-icon {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 20px;
      color: rgba(255, 255, 255, 0.35);
      transition: color 0.5s;
      cursor: pointer;
      &:hover {
        color: rgba(245, 245, 245, 0.7);
        transition: all 0.5s;
      }
    }
    .search-bar {
      position: absolute;
      top: 200px;
      left: 50%;
      transform: translateX(-50%);
      .search-input {
        width: 500px;
        height: 40px;
        border-radius: 20px;
        border: rgba(255, 255, 255, 0.6);
        background-color: rgba(245, 245, 245, 0.762);
        outline: none;
        padding: 0 20px 0 50px;
        font-size: 14px;
        &::selection {
          background-color: rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 1);
        }
      }
      .search-icon {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 4px;
        left: 4px;
        // transform: translateX(-50%);
        width: 32px;
        height: 32px;
        border-radius: 16px;
        cursor: pointer;
        &:hover {
          background-color: white;
          transition: all 0.5s;
        }
      }
      .search-icon-list {
        position: absolute;
        z-index: 3;
        background-color: rgba(255, 255, 255, 1);
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        width: 150px;
        height: 130px;
        padding: 0 0 10px;
        &.hidden {
          transform: scale(1, 0);
          transition-property: transform, top, left;
          transition-duration: 0.3s;
          top: -30px;
        }
        &.show {
          transform: scale(1, 1);
          transition-property: transform, top, left;
          transition-duration: 0.3s;
          top: 40px;
        }
        .SE-button {
          position: relative;
          height: 30px;
          width: 140px;
          border-radius: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 10px;
          cursor: pointer;
          &:hover {
            background-color: rgba(0, 0, 0, 0.3);
            transition: all 0.5s ease-in-out;
          }
        }
      }
      .search-button {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 4px;
        right: 4px;
        // transform: translateX(50%);
        width: 32px;
        height: 32px;
        border-radius: 16px;
        &:hover {
          background-color: white;
          transition: all 0.5s;
        }
      }
      .suggestion-list {
        background-color: rgba(60, 60, 60, 0.4);
        transition: height 0.5s;
        border-radius: 15px;
        overflow: hidden;
        margin-top: 10px;
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          li {
            height: 30px;
            color: rgba(255, 255, 255, 0.8);
            text-align: left;
            padding-left: 20px;
            line-height: 30px;
            cursor: pointer;
            transition: padding-left 0.25s;
            &:hover {
              padding-left: 30px;
              transition: padding-left 0.25s;
              background-color: rgba(255, 255, 255, 0.3);
            }
          }
        }
      }
    }
    .hitokoto {
      max-width: 400px;
      max-height: 100px;
      position: absolute;
      padding: 20px 100px;
      z-index: 5;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
      color: white;
      font-size: 14px;
      text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
      border-radius: 15px;
      overflow: hidden;
      .hitokoto-blur {
        background-color: rgba(255, 255, 255, 0.2);
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(2px);
        opacity: 0;
        transition: opacity 0.7s;
      }
      .hitokoto-action {
        opacity: 0;
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        transition: opacity 0.7s;
        .hitokoto-action-button {
          width: 20px;
          height: 20px;
          border-radius: 8px;
          &:hover {
            background-color: rgba(245, 245, 245, 0.7);
          }
        }
        .hitokoto-action-button:first-child {
          margin-bottom: 5px;
        }
        .hitokoto-action-button:last-child {
          margin-top: 5px;
        }
      }
      &:hover {
        .hitokoto-blur {
          opacity: 1;
          transition: all 0.7s;
        }
        .hitokoto-action {
          opacity: 1;
          transition: all 0.7s;
        }
      }
    }
  }
  .tools-box {
    .home-icon {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 20px;
      color: rgba(255, 255, 255, 0.35);
      transition: color 0.5s;
      cursor: pointer;
      &:hover {
        color: rgba(245, 245, 245, 0.7);
        transition: all 0.5s;
      }
    }
  }
}
</style>
