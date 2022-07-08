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
        <app-navbar-actions
          class="app-navbar__actions md5 lg4"
          :user-name="userName"
        />
      </template>
    </va-navbar>
  </div>
</template>

<script>
import { computed, onBeforeMount, onMounted } from "vue";
import { useStore } from "vuex";
import { useColors } from "vuestic-ui";
import VuesticLogo from "@/components/vuestic-logo.vue";
import VaIconMenuCollapsed from "@/components/icons/VaIconMenuCollapsed.vue";
import AppNavbarActions from "./components/AppNavbarActions.vue";
import utils from "@/utils";

import { useAccountStore } from "@/store/Account";
// const accountStore = useAccountStore();

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
    const store = useStore();
    const isSidebarMinimized = computed({
      get: () => store.state.isSidebarMinimized,
      set: (value) => store.commit("updateSidebarCollapsedState", value),
    });
    const accountStore = useAccountStore();
    const userName = computed(() => {
      if (accountStore.getAccount) {
        return utils.shortenAddress(accountStore.getAccount);
      } else {
        return "Connect Wallet";
      }
    });

    return {
      colors,
      isSidebarMinimized,
      userName,
      // accountAddress,
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