<template>
  <div class="auth-layout row align-content--center">
    <div class="flex xs12 pa-3 flex-center">
      <router-link class="py-5 flex-center" to="/">
        <img class="img-logo" src="@/assets/logo-large.svg" />
      </router-link>
    </div>

    <div class="flex xs12 pa-3">
      <div class="d-flex justify--center">
        <va-card class="auth-layout__card">
          <va-card-content>
            <va-separator />
            <div class="pa-3">
              <router-view />
            </div>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AuthLayout",
  setup() {
    return {
    };
  },
});
</script>

<style lang="scss">
.auth-layout {
  min-height: 100vh;
  background-image: linear-gradient(
    to right,
    var(--va-background),
    var(--va-white)
  );

  &__card {
    width: 100%;
    max-width: 600px;
  }
  .img-logo {
    animation: fade 1.5s infinite linear alternate;
    width: 40vh;
  }
  @keyframes fade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
