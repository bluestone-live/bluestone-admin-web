<template>
  <div class="app-layout__navbar">
    <va-navbar>
      <template v-slot:left>
        <va-icon-menu-collapsed
          @click="isSidebarMinimized = !isSidebarMinimized"
          :class="{ 'x-flip': isSidebarMinimized }"
          class="va-navbar__item"
          :color="colors.primary"
        />
        <router-link to="/">
          <vuestic-logo class="logo" />
        </router-link>
      </template>

      <template v-slot:center>
        <h1>{{ $t("navbar.title") }}</h1>
      </template>

      <template v-slot:right>
        <Suspense>
          <template #fallback> </template>
          <app-navbar-actions class="app-navbar__actions md5 lg4" />
        </Suspense>
      </template>
    </va-navbar>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCommonStore } from "@/store/Common";
import { useNavbarStore } from "@/store/Navbar";
import { useColors } from "vuestic-ui";
import VuesticLogo from "@/components/vuestic-logo.vue";
import VaIconMenuCollapsed from "@/components/icons/VaIconMenuCollapsed.vue";
import AppNavbarActions from "./components/AppNavbarActions.vue";
import { WalletSelector } from "@/services/types";

export default {
  name: "Navbar",
  components: {
    VuesticLogo,
    VaIconMenuCollapsed,
    AppNavbarActions,
  },
  setup() {
    const { getColors } = useColors();
    const colors = computed(() => getColors());
    const sidebarStore = useNavbarStore();
    const commonStore = useCommonStore();
    const isSidebarMinimized = computed({
      get: () => sidebarStore.sidebarMinimized,
      set: (value) => sidebarStore.updateSidebarCollapsedState(value),
    });
    onMounted(() => {
      (commonStore.getEthersProvider as any).provider.on(
        "accountsChanged",
        () => {
          location.reload();
        }
      );
      (commonStore.getEthersProvider as any).provider.on("chainChanged", () => {
        location.reload();
      });
      (commonStore.getEthersProvider as any).provider.on(
        "disconnect",
        (code: number, reason: string) => {
          commonStore.initWallet(WalletSelector.Disconnect);
        }
      );
    });

    return {
      colors,
      isSidebarMinimized,
    };
  },
};
</script>

<style lang="scss" scoped>
.va-navbar {
  box-shadow: var(--va-box-shadow);
  z-index: 2;

  &__center {
    @media screen and (max-width: 1200px) {
      .app-navbar__github-button {
        display: none;
      }
    }

    @media screen and (max-width: 950px) {
      .app-navbar__text {
        display: none;
      }
    }
  }

  @media screen and (max-width: 950px) {
    .left {
      width: 100%;
    }

    .app-navbar__actions {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}

.left {
  display: flex;
  align-items: center;

  & > * {
    margin-right: 1.5rem;
  }

  & > *:last-child {
    margin-right: 0;
  }
}

.x-flip {
  transform: scaleX(-100%);
}

.app-navbar__text > * {
  margin-right: 0.5rem;

  &:last-child {
    margin-right: 0;
  }
}
</style>