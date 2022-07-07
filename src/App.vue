<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from "vue";
import { useAccountStore } from "@/store/Account.js";
import { useCommonStore } from "@/store/Common.js";


export default defineComponent({
  name: "App",
  setup() {
    const commonStore = useCommonStore();
    const accountStore = useAccountStore();
    onBeforeMount(async () => {
      try {
        await commonStore.init();
        await accountStore.init();
      } catch (err) {
        console.error("App: ", err);
      }
    });
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
