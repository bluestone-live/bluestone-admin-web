<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, watch } from "vue";
import { usePendingStore } from "@/store/Pending";

export default defineComponent({
  name: "App",
  setup() {
    const pendingStore = usePendingStore();
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const openNotification = (
      title: string,
      message: string,
      color: string
    ) => {
      _this?.$vaToast.init({
        message,
        color,
        iconClass: "fa-star-o",
        position: "bottom-right",
        duration: Number(10000),
        title,
        fullWidth: false,
      });
    };

    watch(
      () => pendingStore.queueLenth,
      (newValue) => {
          const { title, message, color } = pendingStore.notifyQueue[newValue-1];
          openNotification(title, message, color);
      }
    );
  },
});
</script>

<style lang="scss">
@import "@/sass/main.scss";
#app {
  font-family: "Source Sans Pro", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
  background: var(--va-background);
}
</style>
