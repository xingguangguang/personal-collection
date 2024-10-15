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
            :src="iconList[SEIndex]"
            width="16"
            height="16"
          />
        </div>
        <!-- 搜索引擎列表 -->
        <div :class="'search-icon-list ' + (showSearchIconList ? 'show-search-list' : 'hidden-search-list')">
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
            title="“为了一言的长久发展，我们恳求您在使用一言服务的同时尽可能地加入一言的链接”，点击进入《一言》"
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
        <span>预览壁纸(4k)</span>
        <Picture class="icons-12" />
      </div>
      <div @click="downloadImage">
        <span>下载壁纸(4k)</span>
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
import less from 'less';
import { ref, onBeforeMount, onMounted } from 'vue';
import { homePageRequest } from '@/api/request';
import { ElMessage } from 'element-plus';
import { Menu, HomeFilled, CopyDocument, RefreshRight, Right, Download, Picture, Setting } from '@element-plus/icons-vue';
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
const searchInputRef = ref();
const suggestionIndex = ref(-1);
const wallpaperUrl = ref('');
const uhdUrl = ref('');
const showCover = ref(false);
const suggestionKeyword = ref('');
const searchKeyword = ref('');
const quote = ref({});
const suggestionList = ref([]);
const showSuggestionList = ref(false);
const searching = ref(true);
const rightClickMenu = ref(null);
const showRightClickMenu = ref(false);
let listenerAbortSignal = null; // 按键监听事件的信号对象，abort方法结束addEventListener监听时间

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
onMounted(() => {
  searchInputRef.value.focus();
});

// 百度联想搜索
const inputKeyword = () => {
  suggestionIndex.value = -1;
  suggestionKeyword.value = searchKeyword.value;
  let dealList = null;
  if (!searchKeyword.value) {
    // 修改回调函数，避免接口返回覆盖此处逻辑
    dealList = () => {
      suggestionList.value = [];
      showSuggestionList.value = false;
    };
    dealList();
    return;
  }
  dealList = params => {
    const { s: list } = params;
    if (!list.length) return;
    suggestionList.value = list;
    showSuggestionList.value = !!list.length;
  };
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
    url = searchUrl[SEIndex.value] + searchKeyword.value;
  }
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
// 固定的一言内容，开发的时候用这个，避免频繁请求
// const refreshQuote = () => {
//   quote.value = {
//     id: 5817,
//     uuid: '6e7cc075-3fa1-42c3-b215-fdfe6cc56988',
//     hitokoto: '若似月轮终皎洁，不辞冰雪为卿热。',
//     type: 'i',
//     from: '蝶恋花·辛苦最怜天上月',
//     from_who: '纳兰性德',
//     creator: 'a632079',
//     creator_uid: 1044,
//     reviewer: 1044,
//     commit_from: 'api',
//     created_at: '1586395491',
//     length: 16
//   };
// };
const focusSearchInput = () => {
  inputKeyword();
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
  if (listenerAbortSignal) {
    listenerAbortSignal.abort();
  }
  listenerAbortSignal = new AbortController();
  // 监听搜索快捷键
  document.addEventListener(
    'keydown',
    e => {
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
  try {
    if (window.navigator) {
      window.navigator.clipboard
        .writeText(quote.value.hitokoto)
        .then(() => {
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
  } catch (error) {
    // 动态创建 textarea 标签
    const textarea = document.createElement('textarea');
    // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
    textarea.readOnly = 'readonly';
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    // 将要 copy 的值赋给 textarea 标签的 value 属性
    textarea.value = quote.value.hitokoto;
    // 将 textarea 插入到 body 中
    document.body.appendChild(textarea);
    // 选中值并复制
    textarea.select();
    const result = document.execCommand('Copy');
    if (result) {
      ElMessage({
        message: '内容已复制到剪切板',
        type: 'success',
        offset: 10
      });
    } else {
      console.error('复制文本失败');
    }
    document.body.removeChild(textarea);
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
  console.log('toggleLocationSearchBox');
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
  rightClickMenu.value.style.top = gapY > 100 ? clientY + 'px' : 'auto';
  rightClickMenu.value.style.bottom = gapY > 100 ? 'auto' : gapY + 'px';
  const gapX = clientWidth - clientX;
  rightClickMenu.value.style.left = gapX > 120 ? clientX + 'px' : 'auto';
  rightClickMenu.value.style.right = gapX > 120 ? 'auto' : gapX + 'px';
};
</script>

<style scoped lang="less">
@import './HomePage.less';
</style>
