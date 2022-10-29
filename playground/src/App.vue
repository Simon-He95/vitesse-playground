<script lang="ts" setup>
import { Repl } from '@vue/repl'
import { watchEffect } from 'vue'
import { ReplStore as MyReplStore } from './store'
import '@vue/repl/style.css'
import HeaderVue from './components/Header.vue'

const store = new MyReplStore({
  serializedState: location.hash.slice(1),
  defaultVueRuntimeURL:
      'https://cdn.jsdelivr.net/npm/vue/dist/vue.esm-browser.js',
})

// 将状态持久化到 URL 哈希
watchEffect(() => history.replaceState({}, '', store.serialize()))
</script>

<template>
  <HeaderVue />
  <Repl :store="store" show-compile-output fixed top="55px" right-0 bottom-0 left-0 />
</template>

