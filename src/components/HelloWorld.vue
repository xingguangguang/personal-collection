<template>
  <div class="hello">
    <h1 @click="toHomePage">{{ msg }}</h1>
    <div style="display: flex; justify-content: space-between; padding: 0 16px">
      <div style="width: 800px">
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
        />
        <Editor
          style="height: 500px; overflow-y: hidden"
          v-model="valueHtml"
          :defaultConfig="editorConfig"
          @onCreated="handleCreated"
          @onChange="handleChange"
        />
      </div>
      <div
        id="rich_text"
        ref="richText"
      ></div>
    </div>
  </div>
</template>

<script setup name="HelloWorld">
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { useRouter } from 'vue-router';
import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue';
// import axios from 'axios';

const msg = '起始页';
const richText = ref();

const router = useRouter();
const toHomePage = () => {
  router.push('/');
};
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref('<p>Hello World</p>');

// 模拟 ajax 异步获取内容
onMounted(() => {
  // setTimeout(() => {
  //   valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>';
  // }, 1500);
});

const toolbarConfig = {};
const editorConfig = { placeholder: '请输入内容...' };

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const handleChange = () => {
  console.log(richText.value);
  richText.value.innerHTML = valueHtml.value;
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#rich_text {
  width: 50%;
  flex-grow: 0;
  flex-shrink: 0;
  background-color: rgba(133, 133, 133, 0.1);
  border-radius: 5px;
}
</style>
