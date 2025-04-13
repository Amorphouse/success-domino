<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      completed: 0,
      inProgress: 0,
      completionRate: 0,
      streak: 0
    })
  }
});

// モチベーションメッセージのリスト
const motivationalQuotes = [
  "小さな一歩の積み重ねが、大きな成功につながります。",
  "今日の努力は、明日の自分への最高の贈り物です。",
  "目標を達成するには、まず始めることが大切です。",
  "成功とは、小さな努力を毎日積み重ねることです。",
  "できない理由を探すより、できる方法を考えましょう。",
  "失敗は成功への一歩です。諦めずに続けることが大切です。",
  "今日という日は、残りの人生の最初の日です。",
  "計画なしでは、目標は単なる願望にすぎません。",
  "困難があるから成長できる。挑戦があるから強くなれる。",
  "一度にすべてを変えようとしないで、一つずつ変えていきましょう。"
];

// ランダムなモチベーションメッセージを取得
const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
const motivationalQuote = ref(motivationalQuotes[randomIndex]);
</script>

<template>
  <q-card class="stats-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">チャレンジの統計</div>
    </q-card-section>
    
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- 達成率 -->
        <div class="col-12 col-md-6 text-center">
          <q-circular-progress
            :value="stats.completionRate"
            size="120px"
            :thickness="0.2"
            color="positive"
            center-color="grey-1"
            track-color="grey-3"
            class="q-ma-md"
          >
            <div class="text-center">
              <div class="text-h6">{{ stats.completionRate }}%</div>
              <div class="text-caption">達成率</div>
            </div>
          </q-circular-progress>
        </div>
        
        <!-- チャレンジ数 -->
        <div class="col-12 col-md-6">
          <div class="row q-col-gutter-sm">
            <div class="col-4 text-center">
              <q-icon name="check_circle" color="positive" size="2rem" />
              <div class="text-h6">{{ stats.completed }}</div>
              <div class="text-caption">完了</div>
            </div>
            <div class="col-4 text-center">
              <q-icon name="pending" color="info" size="2rem" />
              <div class="text-h6">{{ stats.inProgress }}</div>
              <div class="text-caption">進行中</div>
            </div>
            <div class="col-4 text-center">
              <q-icon name="assignment" color="grey" size="2rem" />
              <div class="text-h6">{{ stats.total }}</div>
              <div class="text-caption">合計</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 連続達成日数 -->
      <div class="streak-container q-mt-lg">
        <div class="text-subtitle1 q-mb-sm">連続達成日数</div>
        <div class="row items-center">
          <div class="col-auto">
            <q-icon name="local_fire_department" color="orange" size="2rem" />
          </div>
          <div class="col">
            <div class="text-h4 q-ml-sm">{{ stats.streak }} 日</div>
          </div>
        </div>
        
        <div class="streak-bar q-mt-sm">
          <div 
            v-for="i in 7" 
            :key="i" 
            class="streak-day" 
            :class="{ 'streak-active': i <= stats.streak % 7 || (stats.streak % 7 === 0 && stats.streak > 0 && i === 7) }"
          >
            {{ ['月', '火', '水', '木', '金', '土', '日'][i-1] }}
          </div>
        </div>
        
        <div class="text-caption q-mt-sm">
          <span v-if="stats.streak > 0">
            素晴らしい！{{ stats.streak }}日連続でチャレンジを達成しています！
          </span>
          <span v-else>
            チャレンジを完了して、連続達成記録を始めましょう！
          </span>
        </div>
      </div>
      
      <!-- モチベーションメッセージ -->
      <div class="motivation-container q-mt-lg">
        <q-card class="bg-grey-2">
          <q-card-section>
            <div class="text-subtitle1">今日のモチベーション</div>
            <div class="text-body1 q-mt-sm">
              <q-icon name="format_quote" size="sm" />
              {{ motivationalQuote }}
              <q-icon name="format_quote" size="sm" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.stats-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.streak-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.streak-day {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  font-size: 12px;
  color: #666;
}

.streak-active {
  background-color: #ff9800;
  color: white;
}

.motivation-container {
  border-radius: 8px;
  overflow: hidden;
}
</style>
