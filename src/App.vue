<template>
  <router-view/>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  data() {
    return {
      check: true
    }
  },
  created () {
    window.addEventListener('beforeunload', this.unLoadEvent)
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.unLoadEvent)
  },
  methods: {
    unLoadEvent(event) {
      event.preventDefault()
      event.returnValue = ''
    }
  }
})
</script>
