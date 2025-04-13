<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { marked } from 'marked';

const $q = useQuasar();

const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  }
});

// チャレンジデータ
const challenges = ref([]);
const selectedChallenge = ref(null);
const showChallengeDialog = ref(false);
const filter = ref('all');
const searchText = ref('');

// カテゴリーオプション
const categoryOptions = [
  { label: 'すべて', value: 'all' },
  { label: '仕事', value: 'work', icon: 'work' },
  { label: '学習', value: 'study', icon: 'school' },
  { label: '健康', value: 'health', icon: 'favorite' },
  { label: '趣味', value: 'hobby', icon: 'sports_esports' },
  { label: '家庭', value: 'home', icon: 'home' },
  { label: '社会貢献', value: 'social', icon: 'public' },
  { label: 'その他', value: 'other', icon: 'more_horiz' }
];

// 難易度オプション
const difficultyLabels = {
  easy: { label: '簡単', color: 'positive' },
  medium: { label: '普通', color: 'warning' },
  hard: { label: '難しい', color: 'negative' }
};

// ステータスオプション
const statusOptions = [
  { label: 'すべて', value: 'all' },
  { label: '未着手', value: 'not-started', color: 'grey' },
  { label: '進行中', value: 'in-progress', color: 'info' },
  { label: '完了', value: 'completed', color: 'positive' }
];

// フィルタリングされたチャレンジ
const filteredChallenges = computed(() => {
  let result = [...challenges.value];
  
  // カテゴリーでフィルタリング
  if (filter.value !== 'all') {
    result = result.filter(c => c.category === filter.value);
  }
  
  // 検索テキストでフィルタリング
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    result = result.filter(c => 
      c.title.toLowerCase().includes(searchLower) || 
      c.content.toLowerCase().includes(searchLower)
    );
  }
  
  // 日付でソート（新しい順）
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return result;
});

// 統計データ
const stats = computed(() => {
  const total = challenges.value.length;
  const completed = challenges.value.filter(c => c.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // カテゴリー別の達成率
  const categoryStats = {};
  categoryOptions.forEach(cat => {
    if (cat.value === 'all') return;
    
    const catChallenges = challenges.value.filter(c => c.category === cat.value);
    const catCompleted = catChallenges.filter(c => c.status === 'completed').length;
    const catTotal = catChallenges.length;
    
    categoryStats[cat.value] = {
      label: cat.label,
      icon: cat.icon,
      total: catTotal,
      completed: catCompleted,
      rate: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0
    };
  });
  
  return {
    total,
    completed,
    inProgress: challenges.value.filter(c => c.status === 'in-progress').length,
    notStarted: challenges.value.filter(c => c.status === 'not-started').length,
    completionRate,
    categoryStats
  };
});

// チャレンジの詳細を表示
const showChallengeDetails = (challenge) => {
  selectedChallenge.value = challenge;
  showChallengeDialog.value = true;
};

// チャレンジのステータスを更新
const updateChallengeStatus = (challenge, status) => {
  const index = challenges.value.findIndex(c => c.id === challenge.id);
  if (index === -1) return;
  
  challenges.value[index].status = status;
  
  if (status === 'completed') {
    challenges.value[index].completedAt = new Date().toISOString();
    challenges.value[index].progress = 100;
  } else if (status === 'not-started') {
    challenges.value[index].progress = 0;
  }
  
  // ローカルストレージに保存
  localStorage.setItem('challenges', JSON.stringify(challenges.value));
  
  $q.notify({
    color: 'positive',
    message: 'チャレンジのステータスを更新しました',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
};

// チャレンジの進捗を更新
const updateChallengeProgress = (challenge, progress) => {
  const index = challenges.value.findIndex(c => c.id === challenge.id);
  if (index === -1) return;
  
  challenges.value[index].progress = progress;
  
  // ステータスの自動更新
  if (progress === 100) {
    challenges.value[index].status = 'completed';
    challenges.value[index].completedAt = new Date().toISOString();
  } else if (progress > 0) {
    challenges.value[index].status = 'in-progress';
  } else {
    challenges.value[index].status = 'not-started';
  }
  
  // ローカルストレージに保存
  localStorage.setItem('challenges', JSON.stringify(challenges.value));
  
  $q.notify({
    color: 'positive',
    message: 'チャレンジの進捗を更新しました',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
};

// チャレンジのステップを更新
const updateChallengeStep = (challenge, stepIndex, completed) => {
  const index = challenges.value.findIndex(c => c.id === challenge.id);
  if (index === -1) return;
  
  challenges.value[index].steps[stepIndex].completed = completed;
  
  // 進捗の自動計算
  const totalSteps = challenges.value[index].steps.length;
  const completedSteps = challenges.value[index].steps.filter(s => s.completed).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  updateChallengeProgress(challenge, progress);
};

// チャレンジを削除
const deleteChallenge = (challenge) => {
  $q.dialog({
    title: 'チャレンジの削除',
    message: 'このチャレンジを削除してもよろしいですか？',
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = challenges.value.findIndex(c => c.id === challenge.id);
    if (index === -1) return;
    
    challenges.value.splice(index, 1);
    
    // ローカルストレージに保存
    localStorage.setItem('challenges', JSON.stringify(challenges.value));
    
    $q.notify({
      color: 'positive',
      message: 'チャレンジを削除しました',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
    
    if (selectedChallenge.value?.id === challenge.id) {
      showChallengeDialog.value = false;
    }
  });
};

// マークダウンレンダリング
const renderMarkdown = (markdown) => {
  return markdown ? marked(markdown) : '';
};

// データの読み込み
onMounted(() => {
  // ローカルストレージからチャレンジデータを読み込む
  const savedChallenges = localStorage.getItem('challenges');
  if (savedChallenges) {
    challenges.value = JSON.parse(savedChallenges);
  }
});
</script>

<template>
  <div class="history-container">
    <!-- 統計カード -->
    <q-card class="stats-card q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">チャレンジの統計</div>
      </q-card-section>
      
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-subtitle1 q-mb-sm">全体の達成率</div>
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
          
          <div class="col-12 col-md-6">
            <div class="text-subtitle1 q-mb-sm">チャレンジの状況</div>
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
                <q-icon name="schedule" color="grey" size="2rem" />
                <div class="text-h6">{{ stats.notStarted }}</div>
                <div class="text-caption">未着手</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="q-mt-md">
          <div class="text-subtitle1 q-mb-sm">カテゴリー別の達成率</div>
          <div class="row q-col-gutter-md">
            <div 
              v-for="(stat, key) in stats.categoryStats" 
              :key="key"
              class="col-12 col-sm-6 col-md-4"
              v-if="stat.total > 0"
            >
              <q-item>
                <q-item-section avatar>
                  <q-icon :name="stat.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ stat.label }}</q-item-label>
                  <q-linear-progress
                    :value="stat.rate / 100"
                    :color="stat.rate > 66 ? 'positive' : stat.rate > 33 ? 'warning' : 'negative'"
                    class="q-mt-xs"
                  />
                  <q-item-label caption>
                    {{ stat.completed }}/{{ stat.total }} ({{ stat.rate }}%)
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <!-- フィルターと検索 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="filter"
          :options="categoryOptions"
          label="カテゴリーでフィルター"
          outlined
          dense
          emit-value
          map-options
        >
          <template v-slot:option="{ opt }">
            <q-item v-if="opt.icon">
              <q-item-section avatar>
                <q-icon :name="opt.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-else>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchText"
          outlined
          dense
          label="チャレンジを検索"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    
    <!-- チャレンジリスト -->
    <q-card v-if="filteredChallenges.length > 0">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">チャレンジ履歴</div>
      </q-card-section>
      
      <q-list separator>
        <q-item
          v-for="challenge in filteredChallenges"
          :key="challenge.id"
          clickable
          @click="showChallengeDetails(challenge)"
        >
          <q-item-section avatar>
            <q-avatar :color="challenge.status === 'completed' ? 'positive' : challenge.status === 'in-progress' ? 'info' : 'grey'" text-color="white">
              {{ challenge.title.charAt(0) }}
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label>{{ challenge.title }}</q-item-label>
            <q-item-label caption>
              <q-icon :name="categoryOptions.find(c => c.value === challenge.category)?.icon || 'label'" size="xs" />
              {{ categoryOptions.find(c => c.value === challenge.category)?.label || challenge.category }}
              <q-badge :color="difficultyLabels[challenge.difficulty]?.color || 'grey'">
                {{ difficultyLabels[challenge.difficulty]?.label || challenge.difficulty }}
              </q-badge>
            </q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <div class="text-caption">
              {{ new Date(challenge.createdAt).toLocaleDateString('ja-JP') }}
            </div>
            <q-linear-progress
              :value="challenge.progress / 100"
              :color="challenge.status === 'completed' ? 'positive' : 'info'"
              class="q-mt-xs"
              style="width: 100px"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    
    <div v-else class="text-center q-pa-lg">
      <q-icon name="history" size="4rem" color="grey-5" />
      <p class="text-h6 text-grey-7">チャレンジの履歴がありません</p>
      <p class="text-grey-6">新しいチャレンジを作成して、目標達成に向けて一歩踏み出しましょう！</p>
    </div>
    
    <!-- チャレンジ詳細ダイアログ -->
    <q-dialog v-model="showChallengeDialog" maximized>
      <q-card v-if="selectedChallenge">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ selectedChallenge.title }}</div>
          <div class="text-subtitle2">
            {{ new Date(selectedChallenge.createdAt).toLocaleDateString('ja-JP') }} 作成
          </div>
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <div v-html="renderMarkdown(selectedChallenge.content)" class="challenge-content"></div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-card class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1">チャレンジの詳細</div>
                  <q-list dense>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="category" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>カテゴリー</q-item-label>
                        <q-item-label caption>
                          {{ categoryOptions.find(c => c.value === selectedChallenge.category)?.label || selectedChallenge.category }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="signal_cellular_alt" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>難易度</q-item-label>
                        <q-item-label caption>
                          <q-badge :color="difficultyLabels[selectedChallenge.difficulty]?.color || 'grey'">
                            {{ difficultyLabels[selectedChallenge.difficulty]?.label || selectedChallenge.difficulty }}
                          </q-badge>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="event" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>作成日</q-item-label>
                        <q-item-label caption>
                          {{ new Date(selectedChallenge.createdAt).toLocaleDateString('ja-JP') }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item v-if="selectedChallenge.status === 'completed' && selectedChallenge.completedAt">
                      <q-item-section avatar>
                        <q-icon name="check_circle" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>完了日</q-item-label>
                        <q-item-label caption>
                          {{ new Date(selectedChallenge.completedAt).toLocaleDateString('ja-JP') }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
              
              <q-card class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1">進捗状況</div>
                  <q-linear-progress
                    :value="selectedChallenge.progress / 100"
                    :color="selectedChallenge.status === 'completed' ? 'positive' : 'info'"
                    size="lg"
                    class="q-mt-sm"
                  />
                  <div class="text-center q-mt-sm">
                    {{ selectedChallenge.progress }}%
                  </div>
                  
                  <div class="row q-col-gutter-sm q-mt-md">
                    <div class="col-4">
                      <q-btn
                        color="grey"
                        label="未着手"
                        class="full-width"
                        :outline="selectedChallenge.status !== 'not-started'"
                        @click="updateChallengeStatus(selectedChallenge, 'not-started')"
                      />
                    </div>
                    <div class="col-4">
                      <q-btn
                        color="info"
                        label="進行中"
                        class="full-width"
                        :outline="selectedChallenge.status !== 'in-progress'"
                        @click="updateChallengeStatus(selectedChallenge, 'in-progress')"
                      />
                    </div>
                    <div class="col-4">
                      <q-btn
                        color="positive"
                        label="完了"
                        class="full-width"
                        :outline="selectedChallenge.status !== 'completed'"
                        @click="updateChallengeStatus(selectedChallenge, 'completed')"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              
              <q-card v-if="selectedChallenge.steps && selectedChallenge.steps.length > 0">
                <q-card-section>
                  <div class="text-subtitle1">実行ステップ</div>
                  <q-list>
                    <q-item v-for="(step, index) in selectedChallenge.steps" :key="index">
                      <q-item-section avatar>
                        <q-checkbox
                          v-model="step.completed"
                          @update:model-value="updateChallengeStep(selectedChallenge, index, step.completed)"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label :class="{ 'text-strike': step.completed }">
                          {{ step.text }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat color="negative" icon="delete" label="削除" @click="deleteChallenge(selectedChallenge)" />
          <q-btn flat color="primary" icon="print" label="印刷" @click="printChallenge" />
          <q-btn flat color="primary" icon="close" label="閉じる" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.history-container {
  padding: 16px;
}

.stats-card {
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
</style>
