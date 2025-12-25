<template>
  <div class="flex-center-container row row-equal">
    <div
      v-for="(transaction, index) in state.handledTransactions"
      :key="index"
      class="flex xs12 sm8"
    >
      <va-card
        class="mb-4"
        :stripe="
          transaction.isExecuted || (transaction.rejection ? true : false)
        "
        :stripe-color="getStripeColor(transaction)"
        :color="getCardColor(transaction)"
      >
        <va-card-title class="flex-container">
          <span>{{ `Nonce ${transaction.nonce}` }}</span>
          <span>{{ transaction.submissionDate }}</span>
        </va-card-title>
        <va-card-content>
          <va-card-content>
            <va-collapse
              :header="transaction.decodedData.method"
              :icon="getCollapseIcon(transaction)"
            >
              <va-list>
                <template
                  v-for="(input, inputIdx) in transaction.decodedData.inputs"
                  :key="inputIdx"
                >
                  <va-list-item>
                    <va-list-item-section>
                      <va-list-item-label>
                        {{ transaction.decodedData.names[inputIdx] }}
                      </va-list-item-label>
                      <va-list-item-label caption>
                        {{ transaction.decodedData.types[inputIdx] }}
                      </va-list-item-label>
                    </va-list-item-section>

                    <va-list-item-label>
                      <va-list-item-section class="right-label-container">
                        <va-list-item-label class="right-label-text">
                          {{ input }}
                        </va-list-item-label>
                        <va-list-item-label caption>
                          {{
                            isTokenAddress(
                              transaction.decodedData.names[inputIdx]
                            )
                              ? getTokenName(input)
                              : ""
                          }}
                        </va-list-item-label>
                      </va-list-item-section>
                    </va-list-item-label>
                  </va-list-item>
                </template>
              </va-list>

              <va-card-content>
                <va-list class="data-list">
                  <va-list-label>{{
                    `Confirmations ${transaction.confirmations.length}/${transaction.confirmationsRequired}`
                  }}</va-list-label>

                  <va-list-item
                    v-for="(confirmation, idx) in transaction.confirmations"
                    :key="idx"
                  >
                    <va-list-item-section avatar>
                      <va-avatar
                        :color="idx === 0 ? 'dark' : 'primary'"
                        :icon="idx === 0 ? 'emoji_people' : 'front_hand'"
                        size="small"
                      />
                    </va-list-item-section>

                    <va-list-item-section>
                      <va-list-item-label>
                        {{ confirmation.owner }}
                      </va-list-item-label>
                    </va-list-item-section>

                    <va-list-item-section icon>
                      <va-chip
                        square
                        outline
                        size="small"
                        color="success"
                        icon="verified"
                        >{{
                          `Confirmed${
                            transaction.executor === confirmation.owner
                              ? " & Executed"
                              : ""
                          }`
                        }}</va-chip
                      >
                    </va-list-item-section>
                  </va-list-item>
                </va-list>

                <va-list v-if="transaction.rejection" class="data-list mt-3">
                  <va-list-label>{{
                    `Rejections ${transaction.rejection.confirmations.length}/${transaction.rejection.confirmationsRequired}`
                  }}</va-list-label>

                  <va-list-item
                    v-for="(rejection, idxRejection) in transaction.rejection
                      .confirmations"
                    :key="idxRejection"
                  >
                    <va-list-item-section avatar>
                      <va-avatar
                        :color="idxRejection === 0 ? 'dark' : 'primary'"
                        :icon="
                          idxRejection === 0 ? 'emoji_people' : 'front_hand'
                        "
                        size="small"
                      />
                    </va-list-item-section>

                    <va-list-item-section>
                      <va-list-item-label>
                        {{ rejection.owner }}
                      </va-list-item-label>
                    </va-list-item-section>

                    <va-list-item-section icon>
                      <va-chip
                        square
                        outline
                        size="small"
                        color="danger"
                        icon="cancel"
                        >{{
                          `Rejected${
                            transaction.rejection.executor === rejection.owner
                              ? " & Executed"
                              : ""
                          }`
                        }}</va-chip
                      >
                    </va-list-item-section>
                  </va-list-item>
                </va-list>
              </va-card-content>
            </va-collapse>
          </va-card-content>

          <div
            v-if="transaction.isExecuted || transaction.rejection?.isExecuted"
            class="float-right mb-2"
          >
            <va-icon
              name="open_in_new"
              @click="
                traceToEtherscan(
                  transaction.transactionHash ||
                    transaction.rejection.transactionHash
                )
              "
            />
          </div>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, watch } from "vue";
import { useCommonStore } from "@/store/Common";
import { useAccountStore } from "@/store/Account";
import { useTransactionsStore } from "@/store/Transactions";
import { useTransactions } from "@/services/transactions";

export default defineComponent({
  name: "TransactionsDetail",
  components: {},
  async setup() {
    const commonStore = useCommonStore();
    const accountStore = useAccountStore();
    const transactionsStore = useTransactionsStore();
    if (!accountStore.isInited) {
      await accountStore.init();
    }
    if (!transactionsStore.isInited) {
      await transactionsStore.init();
    }
    let {
      state,
      traceToEtherscan,
      isTokenAddress,
      getTokenName,
      parseTransactions,
      getStripeColor,
      getCollapseIcon,
      getCardColor,
    } = await useTransactions(commonStore, accountStore, transactionsStore);

    watch(
      () => transactionsStore.transactions,
      () => {
        parseTransactions();
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      clearInterval(transactionsStore.timer);
    });

    return {
      state,
      traceToEtherscan,
      isTokenAddress,
      getTokenName,
      getStripeColor,
      getCollapseIcon,
      getCardColor,
    };
  },
});
</script>

<style lang="scss">
.data-list {
  border: 1px gainsboro solid;
  border-radius: 0.3rem;
  padding: 0;
}

#interest-model-chart {
  height: 300px;
  width: 100%;
}

.flex-container {
  display: flex;
  justify-content: space-between;
}

.flex-center-container {
  display: flex;
  justify-content: center;
}

.float-right {
  float: right;
}

.right-label-container {
  text-align: right;
  > .right-label-text {
    color: gray;
  }
}
</style>