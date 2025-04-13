<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  challenges: {
    type: Array,
    default: () => []
  }
});

// 今後のチャレンジ（未着手または進行中のもの）
const upcomingChallenges = computed(() => {
  // 今日の日付
  const today = new Date().toISOString().split('T')[0];
  
  // 今日以降のチャレンジを取得（未着手または進行中のもの）
  return props.challenges
    .filter(c => 
      (c.date >= today && c.status !== 'completed') || 
      (c.status === 'in-progress')
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // 最大5件まで表示
});

// カテゴリーアイコン
const getCategoryIcon = (category) => {
  switch (category) {
    case 'work':
      return 'work';
    case 'study':
      return 'school';
    case 'health':
      return 'favorite';
    case 'hobby':
      return 'sports_esports';
    case 'home':
      return 'home';
    case 'social':
      return 'public';
    default:
      return 'label';
  }
};

// 難易度の色
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'positive';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'negative';
    default:
      return 'warning';
  }
};

// 難易度ラベル
const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return '簡単';
    case 'medium':
      return '普通';
    case 'hard':
      return '難しい';
    default:
      return '普通';
  }
};

// 日付のフォーマット
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
};

// 今日かどうか
const isToday = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};
</script>

<template>
  <q-card class="upcoming-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">今後のチャレンジ</div>
    </q-card-section>
    
    <q-card-section v-if="upcomingChallenges.length > 0">
      <q-list separator>
        <q-item v-for="challenge in upcomingChallenges" :key="challenge.id" clickable to="/challenge">
          <q-item-section avatar>
            <q-avatar :color="challenge.status === 'in-progress' ? 'info' : 'grey'" text-color="white">
              <q-icon :name="getCategoryIcon(challenge.category)" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label>{{ challenge.title }}</q-item-label>
            <q-item-label caption>
              <q-badge :color="getDifficultyColor(challenge.difficulty)">
                {{ getDifficultyLabel(challenge.difficulty) }}
              </q-badge>
              <span class="q-ml-sm">
                進捗: {{ challenge.progress }}%
              </span>
            </q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <q-chip
              :color="isToday(challenge.date) ? 'primary' : 'grey-5'"
              text-color="white"
              size="sm"
            >
              {{ isToday(challenge.date) ? '今日' : formatDate(challenge.date) }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    
    <q-card-section v-else class="text-center">
      <q-icon name="event" size="4rem" color="grey-5" />
      <p class="text-h6 text-grey-7">今後のチャレンジはありません</p>
      <p class="text-grey-6">「チャレンジ」タブから新しいチャレンジを作成しましょう！</p>
    </q-card-section>
    
    <q-card-actions align="right">
      <q-btn flat color="primary" icon="add" label="新しいチャレンジ" to="/challenge" />
    </q-card-actions>
  </q-card>
</template>

<style scoped>
.upcoming-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
