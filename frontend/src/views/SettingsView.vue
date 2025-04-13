<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:userProfile']);

// ローカルプロファイルデータ
const localProfile = ref({
  name: props.userProfile.name || '',
  role: props.userProfile.role || '',
  longTermGoals: [...(props.userProfile.longTermGoals || [])],
  preferences: {
    categories: [...(props.userProfile.preferences?.categories || [])],
    difficulty: props.userProfile.preferences?.difficulty || 'medium',
    reminderTime: props.userProfile.preferences?.reminderTime || '08:00',
    reminderEnabled: props.userProfile.preferences?.reminderEnabled || false,
    autoArchive: props.userProfile.preferences?.autoArchive || false,
    autoArchiveDays: props.userProfile.preferences?.autoArchiveDays || 30
  }
});

// 新しい目標の入力
const newGoal = ref('');

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

// 目標を追加
const addGoal = () => {
  if (!newGoal.value.trim()) return;
  
  localProfile.value.longTermGoals.push(newGoal.value.trim());
  newGoal.value = '';
  
  saveProfile();
};

// 目標を削除
const removeGoal = (index) => {
  localProfile.value.longTermGoals.splice(index, 1);
  saveProfile();
};

// プロファイルを保存
const saveProfile = () => {
  // 親コンポーネントに更新を通知
  emit('update:userProfile', { ...localProfile.value });
  
  // ローカルストレージに保存
  localStorage.setItem('userProfile', JSON.stringify(localProfile.value));
  
  $q.notify({
    color: 'positive',
    message: '設定を保存しました',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
};

// データをエクスポート
const exportData = () => {
  // チャレンジデータを取得
  const challenges = localStorage.getItem('challenges') || '[]';
  
  // エクスポートデータを作成
  const exportData = {
    userProfile: localProfile.value,
    challenges: JSON.parse(challenges),
    exportDate: new Date().toISOString()
  };
  
  // JSONに変換
  const jsonData = JSON.stringify(exportData, null, 2);
  
  // ダウンロードリンクを作成
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `success-domino-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  $q.notify({
    color: 'positive',
    message: 'データをエクスポートしました',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
};

// データをインポート
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // ユーザープロファイルをインポート
      if (data.userProfile) {
        localProfile.value = data.userProfile;
        localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
        emit('update:userProfile', { ...data.userProfile });
      }
      
      // チャレンジデータをインポート
      if (data.challenges) {
        localStorage.setItem('challenges', JSON.stringify(data.challenges));
      }
      
      $q.notify({
        color: 'positive',
        message: 'データをインポートしました',
        icon: 'check_circle',
        position: 'top',
        timeout: 2000
      });
    } catch (error) {
      console.error('Import error:', error);
      
      $q.notify({
        color: 'negative',
        message: 'インポートに失敗しました。ファイル形式が正しくありません。',
        icon: 'error',
        position: 'top',
        timeout: 2000
      });
    }
  };
  
  reader.readAsText(file);
};

// データをリセット
const resetData = () => {
  $q.dialog({
    title: 'データのリセット',
    message: 'すべてのデータをリセットしてもよろしいですか？この操作は元に戻せません。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    // ローカルストレージをクリア
    localStorage.removeItem('userProfile');
    localStorage.removeItem('challenges');
    
    // デフォルト値に戻す
    localProfile.value = {
      name: '',
      role: '',
      longTermGoals: [],
      preferences: {
        categories: [],
        difficulty: 'medium',
        reminderTime: '08:00',
        reminderEnabled: false,
        autoArchive: false,
        autoArchiveDays: 30
      }
    };
    
    // 親コンポーネントに通知
    emit('update:userProfile', { ...localProfile.value });
    
    $q.notify({
      color: 'positive',
      message: 'データをリセットしました',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  });
};

// ユーザープロファイルの変更を監視
watch(() => props.userProfile, (newProfile) => {
  localProfile.value = {
    name: newProfile.name || '',
    role: newProfile.role || '',
    longTermGoals: [...(newProfile.longTermGoals || [])],
    preferences: {
      categories: [...(newProfile.preferences?.categories || [])],
      difficulty: newProfile.preferences?.difficulty || 'medium',
      reminderTime: newProfile.preferences?.reminderTime || '08:00',
      reminderEnabled: newProfile.preferences?.reminderEnabled || false,
      autoArchive: newProfile.preferences?.autoArchive || false,
      autoArchiveDays: newProfile.preferences?.autoArchiveDays || 30
    }
  };
}, { deep: true });
</script>

<template>
  <div class="settings-container">
    <q-card class="settings-card q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">プロファイル設定</div>
      </q-card-section>
      
      <q-card-section>
        <q-form @submit.prevent="saveProfile" class="q-gutter-md">
          <!-- 名前 -->
          <q-input
            v-model="localProfile.name"
            label="名前"
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          
          <!-- ロール -->
          <q-input
            v-model="localProfile.role"
            label="ロール（職業や立場）"
            outlined
            dense
            hint="例: 大学生、営業マネージャー、主婦、エンジニアなど"
          >
            <template v-slot:prepend>
              <q-icon name="work" />
            </template>
          </q-input>
          
          <!-- 長期目標 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">長期目標</div>
            <q-list bordered separator class="rounded-borders q-mb-sm">
              <q-item v-for="(goal, index) in localProfile.longTermGoals" :key="index">
                <q-item-section>
                  <q-item-label>{{ goal }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="delete" color="negative" @click="removeGoal(index)" />
                </q-item-section>
              </q-item>
              
              <q-item v-if="localProfile.longTermGoals.length === 0">
                <q-item-section>
                  <q-item-label class="text-grey">目標が設定されていません</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            
            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input
                  v-model="newGoal"
                  label="新しい目標"
                  outlined
                  dense
                  hint="例: プログラミングを習得する、売上を20%増加させる"
                  @keyup.enter="addGoal"
                >
                  <template v-slot:prepend>
                    <q-icon name="flag" />
                  </template>
                </q-input>
              </div>
              <div class="col-auto">
                <q-btn color="primary" icon="add" label="追加" @click="addGoal" />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    
    <q-card class="settings-card q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">チャレンジ設定</div>
      </q-card-section>
      
      <q-card-section>
        <q-form @submit.prevent="saveProfile" class="q-gutter-md">
          <!-- 好みのカテゴリー -->
          <div>
            <div class="text-subtitle2 q-mb-sm">好みのカテゴリー</div>
            <div class="row q-col-gutter-sm">
              <div v-for="cat in categoryOptions" :key="cat.value" class="col-auto">
                <q-checkbox
                  v-model="localProfile.preferences.categories"
                  :val="cat.value"
                  :label="cat.label"
                />
              </div>
            </div>
          </div>
          
          <!-- デフォルトの難易度 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">デフォルトの難易度</div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="opt in difficultyOptions"
                :key="opt.value"
                :label="opt.label"
                :color="localProfile.preferences.difficulty === opt.value ? opt.color : 'grey-4'"
                :text-color="localProfile.preferences.difficulty === opt.value ? 'white' : 'grey-8'"
                @click="localProfile.preferences.difficulty = opt.value"
                unelevated
                rounded
                class="q-px-md"
              />
            </div>
          </div>
          
          <!-- リマインダー設定 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">リマインダー設定</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="localProfile.preferences.reminderEnabled"
                  label="チャレンジのリマインダーを有効にする"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="localProfile.preferences.reminderTime"
                  type="time"
                  label="リマインダー時間"
                  outlined
                  dense
                  :disable="!localProfile.preferences.reminderEnabled"
                >
                  <template v-slot:prepend>
                    <q-icon name="access_time" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
          
          <!-- 自動アーカイブ設定 -->
          <div>
            <div class="text-subtitle2 q-mb-sm">自動アーカイブ設定</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="localProfile.preferences.autoArchive"
                  label="古いチャレンジを自動的にアーカイブする"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="localProfile.preferences.autoArchiveDays"
                  type="number"
                  label="アーカイブする日数"
                  outlined
                  dense
                  :disable="!localProfile.preferences.autoArchive"
                  min="1"
                  max="365"
                >
                  <template v-slot:prepend>
                    <q-icon name="archive" />
                  </template>
                  <template v-slot:append>
                    <div class="text-grey">日</div>
                  </template>
                </q-input>
              </div>
            </div>
          </div>
          
          <!-- 保存ボタン -->
          <div class="row justify-center q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              label="設定を保存"
              icon-right="save"
              size="lg"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    
    <q-card class="settings-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">データ管理</div>
      </q-card-section>
      
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-btn
              color="info"
              icon="download"
              label="データをエクスポート"
              class="full-width"
              @click="exportData"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-btn
              color="warning"
              icon="upload"
              label="データをインポート"
              class="full-width"
              @click="$refs.fileInput.click()"
            />
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              style="display: none"
              @change="importData"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-btn
              color="negative"
              icon="delete_forever"
              label="データをリセット"
              class="full-width"
              @click="resetData"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 16px;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
