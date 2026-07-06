<template>
  <div class="appLayout">
    <AppSidebar />
    <div class="appLayoutRight">
      <AppHeader />
      <main class="appLayoutMain">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page-fade" mode="out-in">
            <div v-if="Component" :key="route.fullPath" class="pageView">
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
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
  min-width: 0;
}

.pageView {
  min-height: 100%;
}
</style>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
