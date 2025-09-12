<template>
  <div class="container">
    <img
      class="wallpaper bg-color"
      v-if="!!wallpaperUrl"
      :src="wallpaperUrl"
    />
    <!-- 搜索功能容器 -->
    <div
      class="box"
      v-on="{ click: handleClickBox, contextmenu: rightKeyMenu }"
    >
      <!-- 切换快捷工具/搜索功能 -->
      <div class="menu-icon">
        <Menu
          class="icons-full"
          v-if="searching"
        />
        <HomeFilled
          class="icons-full"
          v-if="!searching"
        />
      </div>
      <!-- 搜索框 -->
      <div
        class="search-bar"
        v-if="searching"
      >
        <!-- 输入框 -->
        <input
          ref="searchInputRef"
          class="search-input"
          v-model="searchKeyword"
          @input="inputKeyword"
          @focus="focusSearchInput"
          @blur="blurSearchInput"
          @keydown.enter="() => go(wd)"
          @click.stop
        />
        <!-- 搜索引擎logo -->
        <div
          class="search-icon"
          @click.stop="showSearchIconList = !showSearchIconList"
        >
          <img
            :src="currentSEInfo.icon"
            width="16"
            height="16"
          />
        </div>
        <!-- 搜索引擎列表 -->
        <div :class="'search-icon-list ' + (showSearchIconList ? 'show-search-list' : 'hidden-search-list')">
          <div
            class="SE-button"
            v-for="(SE, key) in searchEngineGroup"
            :key="key"
            @click="changeSE(key)"
          >
            <img
              :src="SE.logo"
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
              :class="index === suggestionIndex ? 'selected' : ''"
              v-for="(suggestion, index) in suggestionList"
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
          <div
            class="hitokoto-action-button"
            title="复制"
            @click.stop="copy"
            @contextmenu.stop.prevent
          >
            <CopyDocument class="icons-14" />
          </div>
          <div
            class="hitokoto-action-button"
            title="下一条"
            @click.stop="refreshQuote"
            @contextmenu.stop.prevent
          >
            <RefreshRight class="icons-14" />
          </div>
          <div
            class="hitokoto-action-button"
            title="服务由“一言”提供，点击进入“一言”"
            @click.stop="toAWord"
            @contextmenu.stop.prevent
          >
            <Right class="icons-14" />
          </div>
        </div>
      </div>
    </div>
    <!-- 覆盖图层，阻断切换搜索引擎的hover，如果换成点击触发可以删除 -->
    <div
      class="cover"
      v-if="showCover"
    ></div>
    <div
      :class="`right-click-menu ${showRightClickMenu ? 'show' : 'hidden'}`"
      ref="rightClickMenu"
      @click="
        () => {
          showRightClickMenu = false;
        }
      "
      @click.right="
        e => {
          e.preventDefault();
        }
      "
    >
      <div @click="previewImage">
        <span>预览壁纸</span>
        <Picture class="icons-12" />
      </div>
      <div @click="downloadImage">
        <span>下载壁纸</span>
        <Download class="icons-12" />
      </div>
      <div
        @click.stop.prevent
        class="not-allowed"
      >
        <span>设置</span>
        <Setting class="icons-12" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted } from 'vue';
import { homePageRequest } from '@/api/request';
import { ElMessage } from 'element-plus';
import { Menu, HomeFilled, CopyDocument, RefreshRight, Right, Download, Picture, Setting } from '@element-plus/icons-vue';
import { useSuggestionStore } from '@/store';
import { storeToRefs } from 'pinia';
import { saveToClipBoard } from '@/utils/tools';

const suggestionStore = useSuggestionStore();
const { searchEngineGroup, currentSEInfo } = storeToRefs(suggestionStore);
const showSearchIconList = ref(false); // 显示搜索引擎选择框
const searchInputRef = ref(); // 搜索框实例
const suggestionIndex = ref(-1); // 当前选中的搜索建议
const wallpaperUrl = ref(''); // 壁纸地址
const uhdUrl = ref(''); // 高清壁纸地址
const showCover = ref(false); // 阻断搜索引擎选择框的覆盖层
const suggestionKeyword = ref(''); // 获取搜索建议的关键词
const searchKeyword = ref(''); // 搜索框的内容，按上下方向键选择搜索建议时，会把建议赋值到这个变量
const quote = ref({}); // 一言的内容
const suggestionList = ref([]); // 搜索建议列表
const showSuggestionList = ref(false); // 显示搜索建议列表
const searching = ref(true); // 显示搜索功能（工具栏的功能没做，目前固定为true）
const rightClickMenu = ref(null); // 右击菜单
const showRightClickMenu = ref(false);
let lastSuggestionTimestamp = 0; // 最新的搜索建议请求发出的时间戳
/**
 * 多个监听器可以绑定同一个AbortController对象的signal，调用abort方法结束所有绑定该对象的监听事件，无需调用removeEventListener
 */
let listenerAbortSignal = null; // 按键监听事件的信号对象

/** 在页面挂载之前，
 * 1、从缓存获取之前选中的搜索引擎
 * 2、获取必应壁纸
 * 3、获取一言
 */
onBeforeMount(() => {
  homePageRequest.getWallpaper().then(res => {
    const url = 'https://cn.bing.com' + res.images[0].url;
    const uhdWallpaperUrl = url.replaceAll('1920x1080', 'UHD');
    uhdUrl.value = uhdWallpaperUrl;
    const imgUHD = new Image();
    imgUHD.onload = function () {
      imgUHD.onload = null;
      wallpaperUrl.value = uhdWallpaperUrl;
    };
    imgUHD.src = uhdWallpaperUrl;
    wallpaperUrl.value = url;
  });
  refreshQuote();
});
// 聚焦到搜索框
onMounted(() => {
  searchInputRef.value.focus();
});

// 输入内容请求百度联想搜索接口
const inputKeyword = () => {
  suggestionIndex.value = -1;
  suggestionKeyword.value = searchKeyword.value;
  const timestamp = Date.now();
  lastSuggestionTimestamp = timestamp;
  if (!searchKeyword.value) {
    suggestionList.value = [];
    showSuggestionList.value = false;
    return;
  }
  const dealList = params => {
    if (lastSuggestionTimestamp !== timestamp) return;
    const { s: list } = params;
    suggestionList.value = list;
    showSuggestionList.value = !!list.length;
  };
  console.log(dealList);
  const params = {
    ie: 'utf-8',
    p: 3,
    wd: suggestionKeyword.value,
    cb: 'dealList'
  };
  homePageRequest.getSuggestion(params).then(res => {
    try {
      eval(res);
    } catch (error) {
      console.error('百度返回参数出错');
    }
  });
};
// 切换搜索引擎
const changeSE = key => {
  suggestionStore.setCurrentSEKeys(key);
  showCover.value = true;
  localStorage.setItem('SE', key);
  setTimeout(() => {
    showCover.value = false;
  }, 100);
};

// 跳转搜索
const go = wd => {
  let url = '';
  if (wd) {
    url = currentSEInfo.value.searchPath + wd;
  } else {
    url = currentSEInfo.value.searchPath + searchKeyword.value;
  }
  window.open(url, '_blank');
};

// 更新一言内容
// const refreshQuote = event => {
//   if (event) {
//     console.log(event);
//     event.preventDefault();
//     event.stopPropagation();
//   }
//   homePageRequest.getQuote().then(res => {
//     quote.value = res;
//   });
// };
// 固定的一言内容，开发的时候用这个，避免频繁请求
const refreshQuote = () => {
  quote.value = {
    id: 5817,
    uuid: '6e7cc075-3fa1-42c3-b215-fdfe6cc56988',
    hitokoto: '若似月轮终皎洁，不辞冰雪为卿热。',
    type: 'i',
    from: '蝶恋花·辛苦最怜天上月',
    from_who: '纳兰性德',
    creator: 'a632079',
    creator_uid: 1044,
    reviewer: 1044,
    commit_from: 'api',
    created_at: '1586395491',
    length: 16
  };
};
/** 搜索框焦点事件，监听方向键↑↓ */
const focusSearchInput = () => {
  inputKeyword();
  // 先解绑所有的监听事件
  if (listenerAbortSignal) {
    listenerAbortSignal.abort();
  }
  listenerAbortSignal = new AbortController();
  // 监听搜索快捷键
  document.addEventListener(
    'keydown',
    e => {
      if (Array.isArray(suggestionList.value)) {
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          // index加到超出建议长度了，就设置为-1，根据index值给输入框的文字赋值
          suggestionIndex.value += 1;
          if (suggestionIndex.value >= suggestionList.value.length) {
            suggestionIndex.value = -1;
          }
          if (suggestionIndex.value === -1) {
            searchKeyword.value = suggestionKeyword.value;
          } else {
            searchKeyword.value = suggestionList.value[suggestionIndex.value];
          }
        } else if (e.code === 'ArrowUp') {
          e.preventDefault();
          suggestionIndex.value -= 1;
          if (suggestionIndex.value <= -2) {
            suggestionIndex.value = suggestionList.value.length - 1;
          }
          if (suggestionIndex.value === -1) {
            searchKeyword.value = suggestionKeyword.value;
          } else {
            searchKeyword.value = suggestionList.value[suggestionIndex.value];
          }
        }
      }
    },
    { signal: listenerAbortSignal.signal }
  );
};
const blurSearchInput = () => {
  // 先解绑所有的监听事件
  if (listenerAbortSignal) {
    listenerAbortSignal.abort();
  }
  listenerAbortSignal = new AbortController();
  // 监听搜索快捷键
  document.addEventListener(
    'keydown',
    e => {
      console.log(e);
      if (e.ctrlKey && e.code === 'KeyK') {
        console.log('ctrl + K', e);
        e.preventDefault();
        toggleLocationSearchBox();
      }
      if (!e.ctrlKey && e.code === 'Slash') {
        searchInputRef.value.focus();
        e.preventDefault();
      }
    },
    { signal: listenerAbortSignal.signal }
  );
};

// 一言内容复制到剪切板
const copy = event => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  saveToClipBoard(quote.value.hitokoto);
};

// 跳转到一言官网
const toAWord = event => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  window.open('https://hitokoto.cn/', '_blank');
};

// 新窗口预览壁纸
const previewImage = () => {
  window.open(uhdUrl.value, '_blank');
};

// 下载壁纸
const downloadImage = () => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', uhdUrl.value);
  xhr.responseType = 'blob';
  xhr.onload = function () {
    const a = document.createElement('a');
    if (this.status !== 200) {
      ElMessage.error('网络请求失败');
      return;
    }
    const url = URL.createObjectURL(this.response); // this指向xhr
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    a.href = url;
    a.download = 'wallpaper' + today;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  xhr.send();
};

// 切换本地搜索框的显隐
const toggleLocationSearchBox = () => {
  // console.log('toggleLocationSearchBox');
  searchInputRef.value.focus();
};

// 点击空白区域
const handleClickBox = () => {
  showSuggestionList.value = false;
  showSearchIconList.value = false;
  showRightClickMenu.value = false;
};

const rightKeyMenu = e => {
  e.preventDefault();
  const { clientWidth, clientHeight } = e.target;
  const { clientX, clientY } = e;
  showRightClickMenu.value = true;

  const gapY = clientHeight - clientY;
  // rightClickMenu.value.style.top = gapY > 100 ? clientY + 'px' : 'auto';
  // rightClickMenu.value.style.bottom = gapY > 100 ? 'auto' : gapY + 'px';
  const top = gapY > 100 ? clientY + 'px' : clientY - 100 + 'px';
  rightClickMenu.value.style.top = top;
  const gapX = clientWidth - clientX;
  // rightClickMenu.value.style.left = gapX > 120 ? clientX + 'px' : 'auto';
  // rightClickMenu.value.style.right = gapX > 120 ? 'auto' : gapX + 'px';
  const left = gapX > 120 ? clientX + 'px' : clientX - 120 + 'px';
  rightClickMenu.value.style.left = left;
};
</script>

<style scoped lang="less">
@import './HomePage.less';
</style>
