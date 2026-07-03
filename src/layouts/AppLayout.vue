<template>
  <div class="appLayout">
    <AppSidebar />
    <div class="appLayoutRight">
      <AppHeader />
      <main class="appLayoutMain">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'
</script>

<style scoped>
.appLayout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f4f5f7;
}

.appLayoutRight {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.appLayoutMain {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
