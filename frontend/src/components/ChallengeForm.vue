<template>
  <div class="challenge-form-container">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">チャレンジ生成フォーム</div>
        
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input 
            v-model="role" 
            label="ロール" 
            outlined
            stack-label
            :rules="[val => !!val || 'ロールを入力してください']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
            <template v-slot:hint>
              あなたの職業や立場（例：大学生、営業マネージャー、主婦、エンジニアなど）
            </template>
          </q-input>
          
          <q-input 
            v-model="goal" 
            label="目的" 
            outlined
            stack-label
            :rules="[val => !!val || '目的を入力してください']"
          >
            <template v-slot:prepend>
              <q-icon name="flag" />
            </template>
            <template v-slot:hint>
              あなたが達成したい長期的な目標（例：プログラミングを習得する、売上を20%増加させる）
            </template>
          </q-input>
          
          <q-input 
            v-model="notes" 
            label="備考" 
            outlined
            stack-label
            type="textarea"
            autogrow
          >
            <template v-slot:prepend>
              <q-icon name="notes" />
            </template>
            <template v-slot:hint>
              制約条件や追加情報（例：1日に使える時間は2時間まで、予算は5000円以内）
            </template>
          </q-input>
          
          <div class="row justify-center q-mt-md">
            <q-btn 
              type="submit" 
              color="primary" 
              label="チャレンジ生成" 
              icon-right="add_circle"
              :loading="isLoading"
              size="lg"
              class="full-width"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  
    <q-card v-if="challenge" class="challenge-card q-mt-lg">
      <q-card-section class="challenge-header bg-primary text-white">
        <div class="text-h6">今日のチャレンジ</div>
        <div class="text-subtitle2">{{ new Date().toLocaleDateString('ja-JP') }} 生成</div>
      </q-card-section>
      
      <q-card-section>
        <div v-html="renderedChallenge" class="challenge-content"></div>
      </q-card-section>
      
      <q-card-actions align="right">
        <q-btn flat color="grey" icon="content_copy" label="コピー" @click="copyChallenge" />
        <q-btn flat color="primary" icon="print" label="印刷" @click="printChallenge" />
        <q-btn flat color="positive" icon="save" label="保存" @click="saveChallenge" />
      </q-card-actions>
    </q-card>
    
    <q-dialog v-model="showSaveDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">チャレンジを保存</div>
        </q-card-section>
        
        <q-card-section>
          <q-input v-model="challengeTitle" label="タイトル" outlined dense />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="キャンセル" color="negative" v-close-popup />
          <q-btn flat label="保存" color="positive" @click="confirmSave" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <q-dialog v-model="showSuccessNotification">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="check_circle" color="positive" text-color="white" />
          <span class="q-ml-sm">チャレンジが保存されました！</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="閉じる" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { marked } from 'marked';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const role = ref('');
const goal = ref('');
const notes = ref('');
const challenge = ref('');
const isLoading = ref(false);
const showSaveDialog = ref(false);
const showSuccessNotification = ref(false);
const challengeTitle = ref('');
const savedChallenges = ref<Array<{title: string, content: string, date: string}>>([]);

// ローカルストレージから保存されたチャレンジを読み込む
const loadSavedChallenges = () => {
  const saved = localStorage.getItem('savedChallenges');
  if (saved) {
    savedChallenges.value = JSON.parse(saved);
  }
};

// 初期化時に保存されたチャレンジを読み込む
loadSavedChallenges();

const renderedChallenge = computed(() => {
  return challenge.value ? marked(challenge.value) : '';
});

const handleSubmit = async () => {
  isLoading.value = true;
  
  try {
    const response = await axios.post('/.netlify/functions/generate-challenge-google', {
      role: role.value,
      goal: goal.value,
      notes: notes.value
    });
    challenge.value = response.data.challenge;
    
    // デフォルトのタイトルを設定
    challengeTitle.value = `${role.value}の${goal.value}に関するチャレンジ`;
    
    // 成功通知を表示
    $q.notify({
      color: 'positive',
      message: 'チャレンジが生成されました！',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    
    // エラー通知を表示
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

// チャレンジ保存ダイアログを表示
const saveChallenge = () => {
  showSaveDialog.value = true;
};

// チャレンジを保存
const confirmSave = () => {
  const newChallenge = {
    title: challengeTitle.value,
    content: challenge.value,
    date: new Date().toISOString()
  };
  
  savedChallenges.value.push(newChallenge);
  localStorage.setItem('savedChallenges', JSON.stringify(savedChallenges.value));
  
  showSuccessNotification.value = true;
};
</script>

<style scoped>
.challenge-form-container {
  width: 100%;
}

.form-card, .challenge-card {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.challenge-header {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.challenge-content {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* マークダウンスタイルの調整 */
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

:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

:deep(th), :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
}

:deep(th) {
  background-color: #f2f2f2;
  text-align: left;
}

/* レスポンシブ対応 */
@media (max-width: 600px) {
  :deep(h1) {
    font-size: 1.5em;
  }
  
  :deep(h2) {
    font-size: 1.3em;
  }
  
  :deep(h3) {
    font-size: 1.1em;
  }
}
</style>
