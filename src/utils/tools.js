import { ElMessage } from 'element-plus';
export const saveToClipBoard = content => {
  try {
    if (window.navigator) {
      window.navigator.clipboard
        .writeText(content)
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
    textarea.value = content;
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
