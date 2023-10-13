<template>
  <div class="container">
    <img
      class="wallpaper"
      :src="wallpaperUrl"
    />
    <div
      class="box"
      @click="handleClickBox"
      @dblclick="handleClickBox"
    >
      <div class="search-bar">
        <!-- 输入框 -->
        <input
          class="search-input"
          v-model="keyword"
          @keydown.enter="go"
        />
        <!-- 搜索引擎logo -->
        <div class="search-icon">
          <img
            :src="iconList[SEIndex]"
            width="16"
            height="16"
          />
        </div>
        <!-- 搜索引擎列表 -->
        <div class="search-icon-list">
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
          @click="go"
        >
          <img src="@/assets/homePage/search-icon.svg" />
        </div>
      </div>
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
    <div
      class="cover"
      v-if="showCover"
    ></div>
  </div>
</template>

<script setup>
import less from 'less';
import { ref, onMounted } from 'vue';
import { getWallpaper, getQuote } from '@/api/request';
import { ElMessage } from 'element-plus';
import { CopyDocument, RefreshRight, Right } from '@element-plus/icons-vue';
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
const searching = ref(false);
const wallpaperUrl = ref('');
const showCover = ref(false);
const keyword = ref('');
const quote = ref({});

onMounted(() => {
  getWallpaper().then(res => {
    const url = res.images[0].url;
    const uhdUrl = url.replace(/1920x1080.jpg&rf/, 'UHD.jpg&rf');
    const uhdWallpaperUrl = 'https://cn.bing.com' + uhdUrl;
    wallpaperUrl.value = uhdWallpaperUrl;
  });
  refreshQuote();
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

// 点击空白区域，目前没加任何逻辑
const handleClickBox = () => {
  searching.value = !searching.value;
};

// 更新一言内容
const refreshQuote = event => {
  if (event) {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
  }
  getQuote().then(res => {
    quote.value = res;
  });
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
      }
      .search-icon {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 2px;
        left: 22px;
        transform: translateX(-50%);
        width: 36px;
        height: 36px;
        border-radius: 18px;
      }
      .search-icon-list {
        opacity: 0;
        position: absolute;
        z-index: 3;
        top: 2px;
        left: 22px;
        transform: translateX(-50%);
        background-color: rgba(255, 255, 255, 1);
        border-radius: 10px;
        // width: 150px;
        width: 36px;
        height: 36px;
        // padding: 10px 10px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        .SE-button {
          height: 30px;
          width: 0px;
          border-radius: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 10px;
          cursor: pointer;
        }
        .SE-button:hover {
          width: 110px;
          background-color: rgba(0, 0, 0, 0.3);
          transition: width 0.5s ease-in-out;
        }
      }
      .search-icon-list:hover {
        top: calc(-15px + (-40px * @SE-index));
        opacity: 1;
        width: 150px;
        height: auto;
        padding: 10px 10px 20px;
        transition: all 0.3s;
      }
      .search-button {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 2px;
        right: 22px;
        transform: translateX(50%);
        width: 36px;
        height: 36px;
        border-radius: 18px;
      }
      .search-button:hover {
        background-color: white;
        transition: all 0.5s;
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
      }
      .hitokoto-action {
        opacity: 0;
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        .hitokoto-action-button:first-child {
          margin-bottom: 5px;
        }
        .hitokoto-action-button:last-child {
          margin-top: 5px;
        }
      }
    }
    .hitokoto:hover {
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
</style>
