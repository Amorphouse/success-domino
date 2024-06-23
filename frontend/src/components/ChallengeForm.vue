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
      <p>{{ challenge }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      role: '',
      goal: '',
      notes: '',
      challenge: ''
    };
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