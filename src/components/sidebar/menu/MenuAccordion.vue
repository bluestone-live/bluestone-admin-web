<template>
  <va-accordion class="sidebar-accordion va-sidebar__menu__inner" v-model="accordionValue" multiply>
    <va-collapse v-for="(route, idx) in items" :key="idx">
      <template #header>
        <va-sidebar-item :active="isRouteActive(route)" active-color="primary">
          <router-link class="side-item-inactive" :to="route.children ? { name: undefined } : { name: route.name }"
            :active-class="isRouteActive(route) ? 'side-item-active' : undefined">
            <va-sidebar-item-content>
              <va-icon :name="route.meta.icon" class="va-sidebar-item__icon" />

              <va-sidebar-item-title>
                {{ $t(route.displayName) }}
              </va-sidebar-item-title>

              <va-icon v-if="route.children" :name="accordionValue[idx] ? 'expand_less' : 'expand_more'" />
            </va-sidebar-item-content>
          </router-link>
        </va-sidebar-item>
      </template>
      <template v-for="(child, index) in route.children" :key="index">
        <va-sidebar-item :active="isRouteActive(child)" active-color="primary">
          <router-link class="side-item-inactive" :to="{ name: child.name }" active-class="side-item-active">
            <va-sidebar-item-content>
              <div class="va-sidebar-item__icon" />

              <va-sidebar-item-title>
                {{ $t(child.displayName) }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </router-link>
        </va-sidebar-item>
      </template>
    </va-collapse>
  </va-accordion>
</template>

<script>
import { VaIcon } from "vuestic-ui";
export default {
  name: "AppMenuAccordion",
  components: {
    VaIcon,
  },
  props: {
    items: { type: Array, default: () => [] },
  },
  data() {
    return {
      accordionValue: [],
    };
  },
  mounted() {
    this.accordionValue = this.items.map((i) => this.isItemExpanded(i));
  },
  methods: {
    isGroup(item) {
      return !!item.children;
    },
    isRouteActive(item) {
      return item.name === this.$route.name;
    },
    isItemExpanded(item) {
      if (!item.children) {
        return false;
      }

      const isCurrentItemActive = this.isRouteActive(item);
      const isChildActive = !!item.children.find((child) =>
        child.children ? this.isItemExpanded(child) : this.isRouteActive(child)
      );

      return isCurrentItemActive || isChildActive;
    },
  },
};
</script>

<style lang="scss" scoped>
.side-item-inactive {
  color: black;
}

.side-item-active {
  color: white;
}
</style>