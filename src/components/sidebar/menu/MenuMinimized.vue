<template>
  <va-dropdown v-for="(route, idx) in items" :key="idx" position="right" fixed :offset="[0, 8]" :preventOverflow="false"
    v-model="dropdownsValue[idx]">
    <template #anchor>
      <va-sidebar-item :active="isRouteActive(route) || isItemChildsActive(route)">
        <router-link class="side-item-inactive" :to="route.children ? { name: undefined } : { name: route.name }"
          :active-class="isRouteActive(route) || isItemChildsActive(route) ? 'side-item-active' : undefined">
          <va-sidebar-item-content>
            <va-sidebar-item-title>
              <va-icon :name="route.meta.icon" class="va-sidebar-item__icon" />
            </va-sidebar-item-title>
            <va-icon v-if="route.children" class="more_icon"
              :name="dropdownsValue[idx] ? 'chevron_left' : 'chevron_right'" />
          </va-sidebar-item-content>
        </router-link>
      </va-sidebar-item>
    </template>
    <div class="sidebar-item__children">
      <template v-for="(child, index) in route.children" :key="index">
        <va-sidebar-item :active="isRouteActive(child)">
          <router-link class="side-item-inactive" :to="{ name: child.name }" active-class="side-item-active">
            <va-sidebar-item-content>
              <va-sidebar-item-title>
                {{ $t(child.displayName) }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </router-link>
        </va-sidebar-item>
      </template>
    </div>
  </va-dropdown>
</template>

<script>
import { useGlobalConfig } from 'vuestic-ui';

export default {
  name: "AppMenuMinimized",
  props: {
    items: { type: Array, default: () => [] }
  },
  data() {
    return {
      dropdownsValue: []
    }
  },
  computed: {
    theme() {
      return useGlobalConfig().getGlobalConfig().colors
    },
  },
  methods: {
    isGroup(item) {
      return !!item.children;
    },
    isRouteActive(item) {
      return item.name === this.$route.name;
    },
    isItemChildsActive(item) {
      if (!item.children) {
        return false;
      }

      const isCurrentItemActive = this.isRouteActive(item);
      const isChildActive = !!item.children.find(child =>
        child.children ? this.isItemChildsActive(child) : this.isRouteActive(child)
      );

      return isCurrentItemActive || isChildActive;
    },
  }
};
</script>

<style lang="scss" scoped>
.side-item-inactive {
  color: black;
}

.side-item-active {
  color: white;
}

.sidebar-item {
  position: relative;

  &__children {
    max-height: 60vh;
    overflow-y: auto;
    overflow-x: visible;
    min-width: 8rem;
    color: var(--va-gray);
    background: var(--va-white);
    box-shadow: var(--va-box-shadow);
  }
}

.va-sidebar-item {
  &__icon {
    margin: 0;
  }

  &-content {
    position: relative;

    .more_icon {
      text-align: center;
      position: absolute;
      bottom: 0.5rem;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }
  }
}
</style>
