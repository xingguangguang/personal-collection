// router/transition.js
export function setupRouterTransition(router) {
  console.log('✅ setupRouterTransition 被调用');

  // 1. 添加必要的CSS
  const styleId = 'view-transition-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* 基础View Transitions配置 */
      ::view-transition {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
      }
      
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 1;
        mix-blend-mode: normal;
        overflow: hidden;
      }
      
      /* 可选：为不支持View Transitions的浏览器提供基础过渡 */
      .view-transition-fade {
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // 2. 修改全局后置守卫
  router.afterEach((to, from) => {
    // 跳过没有meta标记的路由
    if (!to.meta.viewTransition && !from.meta.viewTransition) {
      return;
    }

    // 检查API支持
    if (!document.startViewTransition) {
      // 不支持时的回退方案
      document.documentElement.classList.add('view-transition-fade');
      setTimeout(() => {
        document.documentElement.classList.remove('view-transition-fade');
      }, 300);
      return;
    }

    // 获取点击坐标，优先从router实例获取
    let { clickX, clickY } = router.viewTransitionData || {};
    const x = clickX || window.innerWidth / 2;
    const y = clickY || window.innerHeight / 2;

    // 开始视图过渡
    const transition = document.startViewTransition(async () => {
      // 这里可以添加一些状态更新，如果需要的话
      // 但Vue Router已经处理了组件切换
    });

    // 设置自定义动画
    transition.ready
      .then(() => {
        // 计算最大半径
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        // 创建圆形裁剪动画
        const clipPath = [`circle(0% at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];

        // 对新页面应用展开动画
        document.documentElement.animate(
          {
            clipPath
          },
          {
            duration: 600,
            easing: 'ease-out',
            pseudoElement: '::view-transition-new(root)'
          }
        );

        // 可选：同时为旧页面添加淡出动画
        document.documentElement.animate(
          {
            opacity: [1, 1]
          },
          {
            duration: 600,
            easing: 'ease-out',
            pseudoElement: '::view-transition-old(root)'
          }
        );
      })
      .catch(err => {
        console.warn('View transition failed:', err);
      });

    // 3. 重置点击坐标
    if (router.viewTransitionData) {
      router.viewTransitionData.clickX = 0;
      router.viewTransitionData.clickY = 0;
    }
  });
}
