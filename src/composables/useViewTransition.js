// composables/useViewTransition.js
import { ref } from 'vue';

export function useViewTransition(router) {
  const lastClickPosition = ref({ x: 0, y: 0 });

  // 记录点击位置
  const recordClickPosition = event => {
    lastClickPosition.value = {
      x: event.clientX,
      y: event.clientY
    };

    // 存储到router实例，供全局守卫使用
    if (router && router.viewTransitionData) {
      router.viewTransitionData.clickX = event.clientX;
      router.viewTransitionData.clickY = event.clientY;
    }
  };

  return {
    lastClickPosition,
    recordClickPosition
  };
}
