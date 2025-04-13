<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { marked } from 'marked';

const $q = useQuasar();

const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  }
});

// チャレンジ生成フォーム
const category = ref('work');
const difficulty = ref(props.userProfile.preferences?.difficulty || 'medium');
const customGoal = ref('');
const notes = ref('');
const isLoading = ref(false);
const challenge = ref('');
const challengeData = ref(null);

// カテゴリーオプション
const categoryOptions = [
  { label: '仕事', value: 'work', icon: 'work' },
  { label: '学習', value: 'study', icon: 'school' },
  { label: '健康', value: 'health', icon: 'favorite' },
  { label: '趣味', value: 'hobby', icon: 'sports_esports' },
  { label: '家庭', value: 'home', icon: 'home' },
  { label: '社会貢献', value: 'social', icon: 'public' },
  { label: 'その他', value: 'other', icon: 'more_horiz' }
];

// 難易度オプション
const difficultyOptions = [
  { label: '簡単', value: 'easy', color: 'positive' },
  { label: '普通', value: 'medium', color: 'warning' },
  { label: '難しい', value: 'hard', color: 'negative' }
];

// 目標の候補（ユーザープロファイルから取得）
const goalOptions = computed(() => {
  return props.userProfile.longTermGoals?.map(goal => ({
    label: goal,
    value: goal
  })) || [];
});

// マークダウンレンダリング
const renderedChallenge = computed(() => {
  return challenge.value ? marked(challenge.value) : '';
});

// チャレンジ生成
const generateChallenge = async () => {
  if (!props.userProfile.role) {
    $q.notify({
      color: 'negative',
      message: 'プロファイル設定でロールを設定してください',
      icon: 'error',
      position: 'top',
      timeout: 2000
    });
    return;
  }
  
  isLoading.value = true;
  
  try {
    const response = await axios.post('/.netlify/functions/generate-challenge-google', {
      role: props.userProfile.role,
      goal: customGoal.value || props.userProfile.longTermGoals?.[0] || '',
      notes: `カテゴリー: ${getCategoryLabel(category.value)}, 難易度: ${getDifficultyLabel(difficulty.value)}, ${notes.value}`
    });
    
    challenge.value = response.data.challenge;
    
    // チャレンジデータを構造化
    challengeData.value = {
      id: Date.now().toString(),
      title: extractTitle(challenge.value),
      content: challenge.value,
      category: category.value,
      difficulty: difficulty.value,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'not-started',
      progress: 0,
      steps: extractSteps(challenge.value)
    };
    
    $q.notify({
      color: 'positive',
      message: 'チャレンジが生成されました！',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    
    $q.notify({
      color: 'negative',
      message: 'チャレンジの生成中にエラーが発生しました。',
      icon: 'error',
      position: 'top',
      timeout: 2000
    });
  } finally {
    isLoading.value = false;
  }
};

// チャレンジを保存
const saveChallenge = () => {
  if (!challengeData.value) return;
  
  // ローカルストレージからチャレンジデータを読み込む
  const savedChallenges = localStorage.getItem('challenges');
  let challenges = [];
  
  if (savedChallenges) {
    challenges = JSON.parse(savedChallenges);
  }
  
  // 新しいチャレンジを追加
  challenges.push(challengeData.value);
  
  // ローカルストレージに保存
  localStorage.setItem('challenges', JSON.stringify(challenges));
  
  $q.notify({
    color: 'positive',
    message: 'チャレンジが保存されました！',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
  
  // フォームをリセット
  resetForm();
};

// フォームをリセット
const resetForm = () => {
  category.value = 'work';
  difficulty.value = props.userProfile.preferences?.difficulty || 'medium';
  customGoal.value = '';
  notes.value = '';
  challenge.value = '';
  challengeData.value = null;
};

// カテゴリーラベルを取得
const getCategoryLabel = (value) => {
  const option = categoryOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

// 難易度ラベルを取得
const getDifficultyLabel = (value) => {
  const option = difficultyOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

// チャレンジからタイトルを抽出
const extractTitle = (markdown) => {
  const match = markdown.match(/^# (.+)$/m);
  return match ? match[1] : 'チャレンジ';
};

// チャレンジからステップを抽出
const extractSteps = (markdown) => {
  const stepsSection = markdown.match(/## 実行ステップ\s+([\s\S]*?)(?=##|$)/);
  
  if (!stepsSection) return [];
  
  const stepsText = stepsSection[1];
  const stepMatches = stepsText.matchAll(/\d+\.\s+(.+)$/gm);
  
  const steps = [];
  for (const match of stepMatches) {
    steps.push({
      text: match[1].trim(),
      completed: false
    });
  }
  
  return steps;
};

// チャレンジをクリップボードにコピー
const copyChallenge = () => {
  navigator.clipboard.writeText(challenge.value).then(() => {
    $q.notify({
      color: 'info',
      message: 'クリップボードにコピーしました',
      icon: 'content_copy',
      position: 'top',
      timeout: 2000
    });
  });
};

// チャレンジを印刷
const printChallenge = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Success Domino - 今日のチャレンジ</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .date { color: #666; margin-bottom: 20px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Success Domino - 今日のチャレンジ</h1>
            <div class="date">${new Date().toLocaleDateString('ja-JP')}</div>
          </div>
          <div class="content">${renderedChallenge.value}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

// ユーザープロファイルの変更を監視
watch(() => props.userProfile, (newProfile) => {
  if (newProfile.preferences?.difficulty) {
    difficulty.value = newProfile.preferences.difficulty;
  }
}, { deep: true });
</script>

<template>
  <div class="challenge-container">
    <q-card class="form-card q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">新しいチャレンジを作成</div>
        <div class="text-subtitle2">あなたの目標に合わせた今日のチャレンジを生成します</div>
      </q-card-section>
      
      <q-card-section>
        <q-form @submit.prevent="generateChallenge" class="q-gutter-md">
          <!-- カテゴリー選択 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">カテゴリー</div>
            <q-option-group
              v-model="category"
              :options="categoryOptions"
              color="primary"
              inline
            >
              <template v-slot:label="{ opt, index }">
                <div class="row items-center">
                  <q-icon :name="opt.icon" size="sm" class="q-mr-xs" />
                  {{ opt.label }}
                </div>
              </template>
            </q-option-group>
          </div>
          
          <!-- 難易度選択 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">難易度</div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="opt in difficultyOptions"
                :key="opt.value"
                :label="opt.label"
                :color="difficulty === opt.value ? opt.color : 'grey-4'"
                :text-color="difficulty === opt.value ? 'white' : 'grey-8'"
                @click="difficulty = opt.value"
                unelevated
                rounded
                class="q-px-md"
              />
            </div>
          </div>
          
          <!-- 目標選択 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">目標</div>
            <div v-if="goalOptions.length > 0">
              <q-select
                v-model="customGoal"
                :options="goalOptions"
                label="長期目標を選択"
                outlined
                dense
                emit-value
                map-options
                class="q-mb-sm"
              />
              <div class="text-caption">または新しい目標を入力</div>
            </div>
            <q-input
              v-model="customGoal"
              label="達成したい目標"
              outlined
              dense
              :hint="goalOptions.length === 0 ? '例: プログラミングを習得する、売上を20%増加させる' : ''"
            />
          </div>
          
          <!-- 備考 -->
          <q-input
            v-model="notes"
            label="備考（任意）"
            outlined
            type="textarea"
            autogrow
            hint="制約条件や追加情報（例: 1日に使える時間は2時間まで、予算は5000円以内）"
          />
          
          <!-- 送信ボタン -->
          <div class="row justify-center q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              label="チャレンジを生成"
              icon-right="add_circle"
              :loading="isLoading"
              size="lg"
              class="full-width"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    
    <!-- 生成されたチャレンジ -->
    <q-card v-if="challenge" class="challenge-result-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">今日のチャレンジ</div>
        <div class="text-subtitle2">{{ new Date().toLocaleDateString('ja-JP') }} 生成</div>
      </q-card-section>
      
      <q-card-section>
        <div v-html="renderedChallenge" class="challenge-content"></div>
      </q-card-section>
      
      <q-card-actions align="right">
        <q-btn flat color="grey" icon="content_copy" label="コピー" @click="copyChallenge" />
        <q-btn flat color="primary" icon="print" label="印刷" @click="printChallenge" />
        <q-btn flat color="negative" icon="refresh" label="リセット" @click="resetForm" />
        <q-btn color="positive" icon="save" label="保存" @click="saveChallenge" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<style scoped>
.challenge-container {
  padding: 16px;
}

.form-card, .challenge-result-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.challenge-content {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* マークダウンスタイル */
:deep(*) {
  text-align: left;
}

:deep(h1) {
  font-size: 1.8em;
  margin-bottom: 0.5em;
  color: #1976d2;
}

:deep(h2) {
  font-size: 1.5em;
  margin-bottom: 0.5em;
  color: #1976d2;
}

:deep(h3) {
  font-size: 1.2em;
  margin-bottom: 0.5em;
  color: #1976d2;
}

:deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
}

:deep(ul), :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

:deep(li) {
  margin-bottom: 0.5em;
}

:deep(pre) {
  background-color: #f4f4f4;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 1em;
}

:deep(code) {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

:deep(blockquote) {
  border-left: 4px solid #1976d2;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
  font-style: italic;
}
</style>
