<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ChallengeProgressCard from '../components/dashboard/ChallengeProgressCard.vue';
import ChallengeStatsCard from '../components/dashboard/ChallengeStatsCard.vue';
import UpcomingChallengesCard from '../components/dashboard/UpcomingChallengesCard.vue';

const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  }
});

// チャレンジデータ（実際にはローカルストレージから取得）
const challenges = ref([]);
const todayChallenge = ref(null);

// 統計データ
const stats = computed(() => {
  const completed = challenges.value.filter(c => c.status === 'completed').length;
  const total = challenges.value.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    inProgress: challenges.value.filter(c => c.status === 'in-progress').length,
    completionRate,
    streak: calculateStreak()
  };
});

// 連続達成日数を計算
const calculateStreak = () => {
  if (challenges.value.length === 0) return 0;
  
  // 日付でソート
  const sortedChallenges = [...challenges.value]
    .filter(c => c.status === 'completed')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  
  if (sortedChallenges.length === 0) return 0;
  
  let streak = 1;
  let currentDate = new Date(sortedChallenges[0].completedAt);
  
  for (let i = 1; i < sortedChallenges.length; i++) {
    const prevDate = new Date(sortedChallenges[i].completedAt);
    const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

// データの読み込み
onMounted(() => {
  // ローカルストレージからチャレンジデータを読み込む
  const savedChallenges = localStorage.getItem('challenges');
  if (savedChallenges) {
    challenges.value = JSON.parse(savedChallenges);
  }
  
  // 今日のチャレンジを取得
  const today = new Date().toISOString().split('T')[0];
  todayChallenge.value = challenges.value.find(c => 
    c.date === today && (c.status === 'not-started' || c.status === 'in-progress')
  );
});

// 新しいチャレンジを生成するページへ移動
const goToNewChallenge = () => {
  // 親コンポーネントのタブを変更する方法を検討
  // 現在はイベントを発火する形で実装
  const event = new CustomEvent('change-tab', { detail: 'challenge' });
  window.dispatchEvent(event);
};
</script>

<template>
  <div class="dashboard-container">
    <div class="row q-col-gutter-md">
      <!-- ウェルカムカード -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">こんにちは、{{ userProfile.name || 'ゲスト' }}さん</div>
            <div class="text-subtitle2">今日も小さな成功を積み重ねていきましょう！</div>
          </q-card-section>
          
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <div class="col">
                <p v-if="todayChallenge">
                  今日のチャレンジが設定されています。進捗を更新しましょう！
                </p>
                <p v-else>
                  今日のチャレンジはまだ設定されていません。新しいチャレンジを作成しましょう！
                </p>
              </div>
              
              <q-btn 
                v-if="!todayChallenge"
                color="primary" 
                icon-right="add_circle" 
                label="新しいチャレンジ" 
                @click="goToNewChallenge" 
              />
              
              <q-btn 
                v-else
                color="secondary" 
                icon-right="edit" 
                label="進捗を更新" 
                @click="goToNewChallenge" 
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- 進捗カード -->
      <div class="col-12 col-md-6">
        <ChallengeProgressCard :challenge="todayChallenge" />
      </div>
      
      <!-- 統計カード -->
      <div class="col-12 col-md-6">
        <ChallengeStatsCard :stats="stats" />
      </div>
      
      <!-- 今後のチャレンジ -->
      <div class="col-12">
        <UpcomingChallengesCard :challenges="challenges" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 16px;
}

.welcome-card {
  margin-bottom: 24px;
}
</style>
