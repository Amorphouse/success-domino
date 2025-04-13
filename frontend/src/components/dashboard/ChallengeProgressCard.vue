<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  challenge: {
    type: Object,
    default: null
  }
});

// マークダウンレンダリング
const renderedContent = computed(() => {
  if (!props.challenge || !props.challenge.content) return '';
  return marked(props.challenge.content);
});

// チャレンジのタイトル
const title = computed(() => {
  if (!props.challenge) return 'チャレンジがありません';
  return props.challenge.title || 'チャレンジ';
});

// 進捗率
const progress = computed(() => {
  if (!props.challenge) return 0;
  return props.challenge.progress || 0;
});

// 進捗状況のラベル
const progressLabel = computed(() => {
  if (!props.challenge) return '未設定';
  
  switch (props.challenge.status) {
    case 'completed':
      return '完了';
    case 'in-progress':
      return '進行中';
    case 'not-started':
      return '未着手';
    default:
      return '未設定';
  }
});

// 進捗状況の色
const progressColor = computed(() => {
  if (!props.challenge) return 'grey';
  
  switch (props.challenge.status) {
    case 'completed':
      return 'positive';
    case 'in-progress':
      return 'info';
    case 'not-started':
      return 'grey';
    default:
      return 'grey';
  }
});

// カテゴリーアイコン
const categoryIcon = computed(() => {
  if (!props.challenge) return 'help_outline';
  
  switch (props.challenge.category) {
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
});

// 難易度ラベル
const difficultyLabel = computed(() => {
  if (!props.challenge) return '普通';
  
  switch (props.challenge.difficulty) {
    case 'easy':
      return '簡単';
    case 'medium':
      return '普通';
    case 'hard':
      return '難しい';
    default:
      return '普通';
  }
});

// 難易度の色
const difficultyColor = computed(() => {
  if (!props.challenge) return 'warning';
  
  switch (props.challenge.difficulty) {
    case 'easy':
      return 'positive';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'negative';
    default:
      return 'warning';
  }
});
</script>

<template>
  <q-card class="progress-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">今日のチャレンジ</div>
    </q-card-section>
    
    <q-card-section v-if="challenge">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h6">{{ title }}</div>
          <div class="text-caption">
            <q-icon :name="categoryIcon" size="xs" />
            {{ challenge.category }}
            <q-badge :color="difficultyColor">
              {{ difficultyLabel }}
            </q-badge>
          </div>
        </div>
        <div class="col-auto">
          <q-circular-progress
            :value="progress"
            size="60px"
            :thickness="0.2"
            :color="progressColor"
            center-color="grey-1"
            track-color="grey-3"
            class="q-mr-md"
          >
            <div class="text-center">
              <div class="text-caption">{{ progress }}%</div>
            </div>
          </q-circular-progress>
        </div>
      </div>
      
      <q-linear-progress
        :value="progress / 100"
        :color="progressColor"
        size="md"
        class="q-mb-sm"
      />
      
      <div class="row justify-between q-mb-md">
        <div class="text-caption">進捗状況</div>
        <div class="text-caption">{{ progressLabel }}</div>
      </div>
      
      <div v-if="challenge.steps && challenge.steps.length > 0" class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">実行ステップ</div>
        <q-list dense bordered separator>
          <q-item v-for="(step, index) in challenge.steps" :key="index">
            <q-item-section avatar>
              <q-checkbox v-model="step.completed" dense />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{ 'text-strike': step.completed }">
                {{ step.text }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>
    
    <q-card-section v-else class="text-center">
      <q-icon name="assignment" size="4rem" color="grey-5" />
      <p class="text-h6 text-grey-7">今日のチャレンジはまだ設定されていません</p>
      <p class="text-grey-6">「チャレンジ」タブから新しいチャレンジを作成しましょう！</p>
    </q-card-section>
    
    <q-card-actions v-if="challenge" align="right">
      <q-btn flat color="primary" icon="visibility" label="詳細" to="/challenge" />
    </q-card-actions>
  </q-card>
</template>

<style scoped>
.progress-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
