<script setup lang="ts">
import ChallengeForm from '@/components/ChallengeForm.vue'
</script>

<template>
  <div class="q-pa-md app-container">
    <div class="header q-mb-xl">
      <h1 class="text-h3 text-weight-bold text-primary q-mb-sm">Success Domino</h1>
      <p class="text-subtitle1 q-mb-lg">あなたの役割や目標に合わせた、今日1日でこなせる小さな目標を設定します</p>
      
      <q-card class="app-description q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">このアプリについて</div>
          <p>Success Dominoは、あなたの日々の小さな成功を積み重ねるお手伝いをします。</p>
          <p>大きな目標を達成するには、毎日の小さな一歩が重要です。このアプリは、あなたの役割や長期的な目標に基づいて、今日1日で達成できる具体的な小さな目標（チャレンジ）を提案します。</p>
        </q-card-section>
      </q-card>
      
      <q-card class="how-to-use q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">使い方</div>
          <ol>
            <li>あなたの<strong>ロール</strong>（職業や立場）を入力してください</li>
            <li>達成したい<strong>目的</strong>（長期的な目標）を入力してください</li>
            <li>必要に応じて<strong>備考</strong>（制約条件や追加情報）を入力してください</li>
            <li>「チャレンジ生成」ボタンをクリックすると、AIがあなたに最適な今日の目標を提案します</li>
          </ol>
        </q-card-section>
      </q-card>
    </div>

    <div class="content-container">
      <ChallengeForm />
    </div>
    
    <div class="footer q-mt-xl q-pt-md">
      <p class="text-caption text-grey">© 2025 Success Domino - あなたの小さな成功を積み重ねるアプリ</p>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  text-align: center;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.app-description, .how-to-use {
  text-align: left;
  background-color: #f8f9fa;
}

.app-description p, .how-to-use li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}
</style>
