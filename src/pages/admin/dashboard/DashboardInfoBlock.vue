<template>
  <div class="row row-equal">
    <div class="flex xl12 xs12">
      <div class="row">
        <div class="flex xs12 sm4" v-for="(info, idx) in infoTiles" :key="idx">
          <va-card class="mb-4" :color="info.color" gradient>
            <va-card-content>
              <p class="display-2 mb-0" style="color: white">
                {{ info.value }}
              </p>
              <p style="color: white">
                {{ $t("dashboard.info." + info.text) }}
              </p>
            </va-card-content>
          </va-card>
        </div>
      </div>

      <div class="row">
        <div class="flex xs12 md6">
          <va-card>
            <va-card-content>
              <p class="display-2 mb-1" :style="{ color: theme.danger }">291</p>
              <p class="no-wrap">
                {{ $t("dashboard.info.totalLoabOutstandingBalance") }}
              </p>
            </va-card-content>
          </va-card>
        </div>
        <div class="flex xs12 md6">
          <va-card>
            <va-card-content>
              <div class="row row-separated">
                <div class="flex xs4">
                  <p
                    class="display-2 mb-1 text--center"
                    :style="{ color: theme.primary }"
                  >
                    3
                  </p>
                  <p class="text--center mb-1">
                    {{ $t("dashboard.info.lenders") }}
                  </p>
                </div>
                <div class="flex xs4">
                  <p
                    class="display-2 mb-1 text--center"
                    :style="{ color: theme.info }"
                  >
                    24
                  </p>
                  <p class="text--center no-wrap mb-1">
                    {{ $t("dashboard.info.borrowers") }}
                  </p>
                </div>
                <div class="flex xs4">
                  <p
                    class="display-2 mb-1 text--center"
                    :style="{ color: theme.warning }"
                  >
                    91
                  </p>
                  <p class="text--center mb-1">
                    {{ $t("dashboard.info.units") }}
                  </p>
                </div>
              </div>
            </va-card-content>
          </va-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGlobalConfig } from "vuestic-ui";

export default {
  name: "DashboardInfoBlock",
  data() {
    return {
      infoTiles: [
        {
          color: "primary",
          value: "803",
          text: "btc",
          icon: "",
        },
        {
          color: "primary",
          value: "57",
          text: "eth",
          icon: "",
        },
        {
          color: "danger",
          value: "5",
          text: "sgc",
          icon: "",
        },
      ],
      modal: false,
      currentImageIndex: 0,
      images: [
        "https://i.imgur.com/qSykGko.jpg",
        "https://i.imgur.com/jYwT08D.png",
        "https://i.imgur.com/9930myH.jpg",
        "https://i.imgur.com/2JxhWD6.jpg",
        "https://i.imgur.com/MpiOWbM.jpg",
      ],
    };
  },
  methods: {},
  computed: {
    theme() {
      return useGlobalConfig().getGlobalConfig().colors || {};
    },
  },
};
</script>

<style lang="scss" scoped>
.row-separated {
  .flex + .flex {
    border-left: 1px solid var(--va-background);
  }

  // @include media-breakpoint-down(xs) {
  //   p:not(.display-2) {
  //     font-size: 0.875rem;
  //   }
  // }
}

.rich-theme-card-text {
  line-height: 24px;
}

.dashboard {
  .va-card__header--over {
    // @include media-breakpoint-up(md) {
    //   padding-top: 0 !important;
    // }
  }

  .va-card__image {
    // @include media-breakpoint-up(md) {
    //   padding-bottom: 0 !important;
    // }
  }
  // .image-card {
  //   position: relative;
  //   .va-button {
  //     position: absolute;
  //   }
  // }
}
</style>
