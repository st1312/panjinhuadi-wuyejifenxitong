<template>
  <aside class="appSidebar">
    <div class="appSidebarHeader">
      <div class="appSidebarLogo">
        <svg viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#5c5c9e" />
          <path d="M12 28V14l8-5 8 5v14h-6v-7h-4v7H12z" fill="white" />
        </svg>
      </div>
      <div class="appSidebarTitle">
        <div class="appSidebarBrand">万达物业</div>
        <div class="appSidebarSub">管理后台</div>
      </div>
    </div>
    <nav class="appSidebarNav">
      <RouterLink
        v-for="menu in menuList"
        :key="menu.name"
        :to="{ name: menu.route }"
        class="appSidebarItem"
        :class="{ appSidebarItemActive: currentRoute.name === menu.route }"
      >
        <IconSvg :name="menu.icon" class="appSidebarIcon" />
        <span>{{ menu.name }}</span>
      </RouterLink>
    </nav>

  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { menus } from '../constants/menus'
import IconSvg from './IconSvg.vue'

const currentRoute = useRoute()
const menuList = computed(() => menus)

</script>

<style scoped>
.appSidebar {
  width: 220px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e8e8ec;
  display: flex;
  flex-direction: column;
}

.appSidebarHeader {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e8e8ec;
}

.appSidebarLogo {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.appSidebarBrand {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f2e;
  line-height: 22px;
}

.appSidebarSub {
  font-size: 12px;
  color: #8c8c9a;
  line-height: 18px;
}

.appSidebarNav {
  flex: 1;
  padding: 12px 16px;
  overflow: auto;
}

.appSidebarItem {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  color: #5c5c66;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.appSidebarItem:hover {
  background: #f4f5f7;
  color: #1f1f2e;
}

.appSidebarItemActive {
  background: #5c5c9e;
  color: #ffffff;
}

.appSidebarItemActive:hover {
  background: #5c5c9e;
  color: #ffffff;
}

.appSidebarIcon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
}
</style>
