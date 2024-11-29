<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input type="text" v-model="role" placeholder="ロール" />
      <input type="text" v-model="goal" placeholder="目的" />
      <input type="text" v-model="notes" placeholder="備考" />
      <button type="submit">チャレンジ生成</button>
    </form>
    <div v-if="challenge">
      <h2>生成されたチャレンジ</h2>
      <div v-html="renderedChallenge"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';

export default {
  data() {
    return {
      role: '',
      goal: '',
      notes: '',
      challenge: ''
    };
  },
  computed: {
    renderedChallenge() {
      return this.challenge ? marked(this.challenge) : '';
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axios.post('/.netlify/functions/generate-challenge-google', {
          role: this.role,
          goal: this.goal,
          notes: this.notes
        });
        this.challenge = response.data.challenge;
      } catch (error) {
        console.error('Error generating challenge:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Markdownスタイルの調整 */
/* フォーム全体のスタイリング */
form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
  gap: 10px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 入力フィールドのスタイリング */
input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
}

/* ボタンのスタイリング */
button {
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #357abd;
}

/* レスポンシブ対応 */
@media (max-width: 480px) {
  form {
    width: 90%;
    margin: 0 auto;
    padding: 15px;
  }
}
:deep(*) {
  text-align: left; /* すべての要素を左寄せに */
}
:deep(h1) {
  font-size: 2em;
  margin-bottom: 0.5em;
}
:deep(h2) {
  font-size: 1.5em;
  margin-bottom: 0.5em;
}
:deep(p) {
  margin-bottom: 1em;
}
:deep(ul), :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}
:deep(pre) {
  background-color: #f4f4f4;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}
:deep(code) {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
</style>