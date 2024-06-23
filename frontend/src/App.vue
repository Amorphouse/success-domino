<template>
  <div id="app">
    <h1>SuccessDomino</h1>
    <ChallengeForm />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import ChallengeForm from './components/ChallengeForm.vue';


export default {
  name: 'App',
  components: {
    ChallengeForm
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
