<template>

</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance } from "vue";
import { useCommonStore } from "@/store/Common";
import { useAccountStore } from "@/store/Account";
import { useWhitelistStore } from "@/store/Whitelist";
import { usePendingStore } from "@/store/Pending";
import utils from "@/utils";

export default defineComponent({
  name: "ConfigurationDetail",
  components: {},
  async setup(props, ctx) {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const commonStore = useCommonStore();
    const accountStore = useAccountStore();
    const pendingStore = usePendingStore();
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.isInited) {
      await whitelistStore.init();
    }

    const openNotification = (message: string, color: string) => {
      _this?.$vaToast.init({
        message: message,
        color: color,
        iconClass: "fa-star-o",
        position: "bottom-right",
        duration: Number(10000),
        title: "Configuration",
        fullWidth: false,
      });
    };

    return {

    };
  },
});
</script>

<style lang="scss">
.markup-tables {
  .table-wrapper {
    overflow: auto;
  }

  .va-table {
    width: 100%;
  }
}
</style>