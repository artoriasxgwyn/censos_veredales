<template>
  <div class="pagination">
    <q-btn
      flat
      dense
      round
      icon="keyboard_arrow_left"
      @click="prevPage"
      :disable="currentPage <= 1"
      aria-label="Página anterior"
    />

    <template v-if="totalPages <= 7">
      <q-btn
        v-for="page in totalPages"
        :key="page"
        :flat="currentPage !== page"
        :label="page"
        @click="goToPage(page)"
        :class="{ active: currentPage === page }"
        class="page-btn"
      />
    </template>

    <template v-else>
      <q-btn
        v-if="currentPage <= 4"
        v-for="page in 5"
        :key="page"
        :flat="currentPage !== page"
        :label="page"
        @click="goToPage(page)"
        :class="{ active: currentPage === page }"
        class="page-btn"
      />
      <q-btn v-if="currentPage <= 4" label="..." disable class="page-btn ellipsis" />
      <q-btn :label="totalPages" flat @click="goToPage(totalPages)" class="page-btn" v-if="currentPage <= 4" />

      <template v-else-if="currentPage >= totalPages - 3">
        <q-btn label="1" flat @click="goToPage(1)" class="page-btn" />
        <q-btn label="..." disable class="page-btn ellipsis" />
        <q-btn
          v-for="page in totalPages - 4"
          :key="page + 4"
          :flat="currentPage !== page + 4"
          :label="page + 4"
          @click="goToPage(page + 4)"
          :class="{ active: currentPage === page + 4 }"
          class="page-btn"
        />
      </template>

      <template v-else>
        <q-btn label="1" flat @click="goToPage(1)" class="page-btn" />
        <q-btn label="..." disable class="page-btn ellipsis" />
        <q-btn
          v-for="page in 3"
          :key="page + currentPage - 2"
          :flat="currentPage !== page + currentPage - 2"
          :label="page + currentPage - 2"
          @click="goToPage(page + currentPage - 2)"
          :class="{ active: currentPage === page + currentPage - 2 }"
          class="page-btn"
        />
        <q-btn label="..." disable class="page-btn ellipsis" />
        <q-btn :label="totalPages" flat @click="goToPage(totalPages)" class="page-btn" />
      </template>
    </template>

    <q-btn
      flat
      dense
      round
      icon="keyboard_arrow_right"
      @click="nextPage"
      :disable="currentPage >= totalPages"
      aria-label="Página siguiente"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    validator: (value) => value >= 1
  },
  totalPages: {
    type: Number,
    required: true,
    validator: (value) => value >= 1
  }
})

const emit = defineEmits(['update:currentPage', 'page-change'])

const goToPage = (page) => {
  emit('update:currentPage', page)
  emit('page-change', page)
}

const prevPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 0;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.page-btn.active {
  background: var(--primary);
  color: var(--on-primary);
}

.page-btn.ellipsis {
  cursor: default;
}
</style>
