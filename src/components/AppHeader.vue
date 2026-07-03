<template>
  <header class="appHeader">
    <div class="appHeaderLeft">
      <span class="appHeaderBrand">万达花园物业</span>
      <span class="appHeaderDivider">/</span>
      <span class="appHeaderCurrent">{{ pageTitle }}</span>
    </div>

    <div class="appHeaderRight">
      <button class="appHeaderIconBtn">
        <IconSvg name="bell" />
      </button>
      <button class="appHeaderIconBtn">
        <IconSvg name="setting" />
      </button>
      <div class="appHeaderSeparator" />
      <button class="appHeaderLogout" @click="handleLogout">
        <span>退出</span>
        <IconSvg name="logout" />
      </button>
      <div class="appHeaderAvatar">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="avatar" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconSvg from './IconSvg.vue'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const pageTitle = computed(() => (route.meta.title as string) || '')

function handleLogout() {
  auth.logout()
  router.push('/login')
}

</script>

<style scoped>
.appHeader {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8ec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.appHeaderLeft {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.appHeaderBrand {
  color: #1f1f2e;
  font-weight: 500;
}

.appHeaderDivider {
  margin: 0 8px;
  color: #8c8c9a;
}

.appHeaderCurrent {
  color: #5c5c9a;
}

.appHeaderRight {
  display: flex;
  align-items: center;
  gap: 12px;
}

.appHeaderIconBtn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c5c66;
  border-radius: 8px;
  transition: background 0.2s;
}

.appHeaderIconBtn:hover {
  background: #f4f5f7;
}

.appHeaderIconBtn svg {
  width: 20px;
  height: 20px;
}

.appHeaderSeparator {
  width: 1px;
  height: 20px;
  background: #e8e8ec;
  margin: 0 4px;
}

.appHeaderLogout {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5c5c66;
  font-size: 14px;
}

.appHeaderLogout svg {
  width: 18px;
  height: 18px;
}

.appHeaderAvatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e8e8ec;
}

.appHeaderAvatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
