<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import DashboardView from './views/DashboardView.vue';
import ChallengeView from './views/ChallengeView.vue';
import HistoryView from './views/HistoryView.vue';
import SettingsView from './views/SettingsView.vue';
import ProfileSetupDialog from './components/ProfileSetupDialog.vue';

const $q = useQuasar();
const currentTab = ref('dashboard');
const showProfileSetup = ref(false);
const userProfile = ref({
  name: '',
  role: '',
  longTermGoals: [],
  preferences: {
    categories: [],
    difficulty: 'medium',
    reminderTime: '08:00'
  }
});

// ローカルストレージからユーザープロファイルを読み込む
onMounted(() => {
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    userProfile.value = JSON.parse(savedProfile);
  } else {
    // 初回利用時はプロファイル設定ダイアログを表示
    showProfileSetup.value = true;
  }
  
  // ダークモード設定の読み込み
  const darkMode = localStorage.getItem('darkMode') === 'true';
  $q.dark.set(darkMode);
});

// プロファイル保存処理
const saveProfile = (profile) => {
  userProfile.value = profile;
  localStorage.setItem('userProfile', JSON.stringify(profile));
  showProfileSetup.value = false;
  
  $q.notify({
    color: 'positive',
    message: 'プロファイルを保存しました',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
};

// ダークモード切り替え
const toggleDarkMode = () => {
  $q.dark.toggle();
  localStorage.setItem('darkMode', $q.dark.isActive.toString());
};

// 現在のビューコンポーネント
const currentView = computed(() => {
  switch (currentTab.value) {
    case 'dashboard':
      return DashboardView;
    case 'challenge':
      return ChallengeView;
    case 'history':
      return HistoryView;
    case 'settings':
      return SettingsView;
    default:
      return DashboardView;
  }
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <!-- ヘッダー -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="./assets/vue.svg" alt="Success Domino Logo">
          </q-avatar>
          Success Domino
        </q-toolbar-title>
        
        <q-btn flat round dense icon="person" @click="showProfileSetup = true" />
        <q-btn flat round dense :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleDarkMode" />
      </q-toolbar>
      
      <q-tabs v-model="currentTab" align="center" class="bg-primary text-white">
        <q-tab name="dashboard" icon="dashboard" label="ダッシュボード" />
        <q-tab name="challenge" icon="add_task" label="チャレンジ" />
        <q-tab name="history" icon="history" label="履歴" />
        <q-tab name="settings" icon="settings" label="設定" />
      </q-tabs>
    </q-header>
    
    <!-- メインコンテンツ -->
    <q-page-container>
      <q-page padding>
        <component :is="currentView" :user-profile="userProfile" />
      </q-page>
    </q-page-container>
    
    <!-- フッター -->
    <q-footer elevated class="bg-grey-2 text-grey-8">
      <q-toolbar>
        <q-toolbar-title class="text-center text-caption">
          © 2025 Success Domino - 小さな成功を積み重ねて大きな目標を達成しよう
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
    
    <!-- プロファイル設定ダイアログ -->
    <ProfileSetupDialog 
      v-model="showProfileSetup" 
      :initial-profile="userProfile" 
      @save="saveProfile" 
    />
  </q-layout>
</template>

<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
}

.q-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* アニメーション */
.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 16px 0;
}

/* トランジションアニメーション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
