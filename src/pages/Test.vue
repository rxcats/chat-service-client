<template>
  <div>
    <q-btn type="button" @click="notify" label="notify"/>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { wsErrorNotify } from '../message-builder'

export default defineComponent({
  name: "Test",
  methods: {
    notify() {
      this.$q.notify(wsErrorNotify.lostLoginInfo)
    }
  }
})
</script>

<style scoped>

</style>
