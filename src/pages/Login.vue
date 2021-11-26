<template>
  <div class="q-pa-md">
    <div class="row justify-center">
      <div class="login-width">
        <q-form ref="loginForm" @submit="onLogin" @reset="onLoginReset">
          <q-card>
            <q-card-section class="bg-primary text-white">
              <div class="text-h6 col text-center">Chat Service</div>
            </q-card-section>

            <q-separator/>

            <q-card-section>
              <q-input
                clearable
                filled
                outlined
                v-model="username"
                label="이름"
                lazy-rules
                :rules="[ val => val && val.length > 0 || '필수입력' ]"
                model-value=""
                autocorrect="off"
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
              />
            </q-card-section>

            <q-card-section>
              <input type="color" v-model="userColor" disabled/>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn type="submit" color="primary" label="로그인" icon="login" class="full-width"/>
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { wsErrorNotify } from '../message-builder'

const colors = ['#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7']

const userColor = colors[Math.floor(Math.random() * colors.length)]

export default defineComponent({
  name: 'Login',
  data() {
    return {
      username: '',
      userColor: userColor
    }
  },
  mounted() {
    this.$eventBus.on('onLoginSucceeded', this.onLoginSucceeded)
  },
  methods: {
    onLoginSucceeded(data) {
      this.$ws.setAttribute('user', data.data)
    },
    onLogin() {
      if (!this.$ws.isConnected()) {
        this.$q.notify(wsErrorNotify.notConnected)
        this.$ws.reconnect()
        return
      }

      this.$ws.send({
        uri: '/auth/login',
        body: { userId: this.username, username: this.username, userColor: this.userColor }
      })

      this.$router.push({ path: '/lobby' })
      setTimeout(this.lazyLobbyJoin, 500)
      this.$q.loading.show()
    },
    onLoginReset() {
      this.username = ''
      this.userColor = userColor
    },
    lazyLobbyJoin() {
      this.$ws.send({
        uri: '/lobby/join',
        body: {}
      })

      this.onLoginReset()

      this.$q.loading.hide()
    }
  }
})
</script>

<style lang="sass" scoped>
.login-width
  width: 20rem
</style>
