<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialProfile: {
    type: Object,
    default: () => ({
      name: '',
      role: '',
      longTermGoals: [],
      preferences: {
        categories: [],
        difficulty: 'medium',
        reminderTime: '08:00'
      }
    })
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

// ローカルプロファイルデータ
const localProfile = ref({
  name: props.initialProfile.name || '',
  role: props.initialProfile.role || '',
  longTermGoals: [...(props.initialProfile.longTermGoals || [])],
  preferences: {
    categories: [...(props.initialProfile.preferences?.categories || [])],
    difficulty: props.initialProfile.preferences?.difficulty || 'medium',
    reminderTime: props.initialProfile.preferences?.reminderTime || '08:00'
  }
});

// 新しい目標の入力
const newGoal = ref('');

// 現在のステップ
const currentStep = ref(0);

// ステップの総数
const totalSteps = 3;

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
};

// 目標を削除
const removeGoal = (index) => {
  localProfile.value.longTermGoals.splice(index, 1);
};

// 次のステップへ
const nextStep = () => {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++;
  } else {
    saveProfile();
  }
};

// 前のステップへ
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 現在のステップが有効かどうか
const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 0: // 基本情報
      return !!localProfile.value.name && !!localProfile.value.role;
    case 1: // 目標設定
      return localProfile.value.longTermGoals.length > 0;
    case 2: // 設定
      return true;
    default:
      return false;
  }
});

// 次へボタンのラベル
const nextButtonLabel = computed(() => {
  return currentStep.value === totalSteps - 1 ? '完了' : '次へ';
});

// プロファイルを保存
const saveProfile = () => {
  emit('save', { ...localProfile.value });
  emit('update:modelValue', false);
};

// ダイアログを閉じる
const closeDialog = () => {
  emit('update:modelValue', false);
};

// プロップの変更を監視
watch(() => props.initialProfile, (newProfile) => {
  localProfile.value = {
    name: newProfile.name || '',
    role: newProfile.role || '',
    longTermGoals: [...(newProfile.longTermGoals || [])],
    preferences: {
      categories: [...(newProfile.preferences?.categories || [])],
      difficulty: newProfile.preferences?.difficulty || 'medium',
      reminderTime: newProfile.preferences?.reminderTime || '08:00'
    }
  };
}, { deep: true });

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // ダイアログが開かれたときにステップをリセット
    currentStep.value = 0;
  }
});
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="fade"
    transition-hide="fade"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="column">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">プロファイル設定</div>
        <div class="text-subtitle2">Success Dominoをカスタマイズしましょう</div>
      </q-card-section>
      
      <q-card-section class="q-pa-lg flex-center">
        <!-- ステッパー -->
        <q-stepper
          v-model="currentStep"
          vertical
          color="primary"
          animated
          class="stepper-container"
        >
          <!-- ステップ1: 基本情報 -->
          <q-step
            :name="0"
            title="基本情報"
            icon="person"
            :done="currentStep > 0"
            :header-nav="currentStep > 0"
          >
            <div class="text-subtitle1 q-mb-md">
              あなたの基本情報を教えてください。これにより、あなたに最適なチャレンジを提案できます。
            </div>
            
            <q-form class="q-gutter-md">
              <q-input
                v-model="localProfile.name"
                label="名前"
                outlined
                :rules="[val => !!val || '名前を入力してください']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              
              <q-input
                v-model="localProfile.role"
                label="ロール（職業や立場）"
                outlined
                hint="例: 大学生、営業マネージャー、主婦、エンジニアなど"
                :rules="[val => !!val || 'ロールを入力してください']"
              >
                <template v-slot:prepend>
                  <q-icon name="work" />
                </template>
              </q-input>
            </q-form>
            
            <q-stepper-navigation>
              <q-btn
                color="primary"
                :label="nextButtonLabel"
                @click="nextStep"
                :disable="!isCurrentStepValid"
              />
              <q-btn
                flat
                color="primary"
                label="キャンセル"
                @click="closeDialog"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>
          
          <!-- ステップ2: 目標設定 -->
          <q-step
            :name="1"
            title="目標設定"
            icon="flag"
            :done="currentStep > 1"
            :header-nav="currentStep > 1"
          >
            <div class="text-subtitle1 q-mb-md">
              あなたの長期的な目標を設定しましょう。これらの目標に向けた小さなチャレンジを提案します。
            </div>
            
            <q-list bordered separator class="rounded-borders q-mb-md">
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
            
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col">
                <q-input
                  v-model="newGoal"
                  label="新しい目標"
                  outlined
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
            
            <q-stepper-navigation>
              <q-btn
                color="primary"
                :label="nextButtonLabel"
                @click="nextStep"
                :disable="!isCurrentStepValid"
              />
              <q-btn
                flat
                color="primary"
                label="戻る"
                @click="prevStep"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>
          
          <!-- ステップ3: 設定 -->
          <q-step
            :name="2"
            title="設定"
            icon="settings"
            :done="currentStep > 2"
            :header-nav="currentStep > 2"
          >
            <div class="text-subtitle1 q-mb-md">
              チャレンジの設定をカスタマイズしましょう。
            </div>
            
            <div class="q-mb-md">
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
            
            <div class="q-mb-md">
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
            
            <q-stepper-navigation>
              <q-btn
                color="positive"
                :label="nextButtonLabel"
                @click="nextStep"
              />
              <q-btn
                flat
                color="primary"
                label="戻る"
                @click="prevStep"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.stepper-container {
  width: 100%;
  max-width: 800px;
}

.flex-center {
  display: flex;
  justify-content: center;
}
</style>
