<template>
  <div class="q-pa-md">

    <div class="row justify-start">
      <div class="col-all">
        <q-btn color="primary" label="나가기" icon="close" @click="onLeaveRoomBtn"/>
      </div>
    </div>

    <div class="row justify-start">
      <div class="col-all">
        <q-form ref="chatForm" @submit="onSendMessage" @reset="onSendMessageReset" class="q-gutter-md">
          <q-input
            clearable
            filled
            outlined
            v-model="inputChatMessage"
            label="메시지 입력"
            :rules="[ val => val && val.length > 0 || '' ]"
            lazy-rules
            model-value=""
            autocorrect="off"
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
          >
            <template v-slot:append>
              <q-icon name="send"/>
            </template>

            <template v-slot:after>
              <q-btn icon="sentiment_satisfied_alt" round flat>
                <q-menu fit>
                  <q-list>
                    <q-item-section>
                      <vuemoji-picker @emojiClick="handleEmoji"/>
                    </q-item-section>
                  </q-list>
                </q-menu>
              </q-btn>
            </template>
          </q-input>
        </q-form>
      </div>
    </div>

    <div class="row justify-start">
      <div class="col-3">
        <q-toolbar class="bg-blue text-white shadow-2 q-mb-sm">
          <q-toolbar-title>참가자</q-toolbar-title>
          <q-btn color="blue" icon-right="refresh" label="" @click="refreshRoomUsers"/>
        </q-toolbar>
        <q-list bordered separator v-if="roomUsers.length > 0">
          <q-item clickable v-ripple v-for="user in roomUsers" :key="user">
            <q-item-section>{{ user.username }}</q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col">
        <q-toolbar class="bg-blue text-white shadow-2 q-mb-sm">
          <q-toolbar-title>
            채팅 목록 (<span v-if="roomInfo !== undefined">{{roomInfo.roomTitle}}</span>)
          </q-toolbar-title>
        </q-toolbar>
        <q-list bordered separator v-if="chatMessages.length > 0">
          <q-item clickable v-ripple v-for="chat in chatMessages" :key="chat">
            <q-item-section>
              <q-item-label :style="{color:chat.color}" class="text-wrap">{{ chat.message }}</q-item-label>
              <q-item-label caption>[{{ chat.now }}]</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { messageBuilder, whereConstant, wsErrorNotify } from '../message-builder'
import { VuemojiPicker } from 'vuemoji-picker'

export default defineComponent({
  name: 'Room',
  components: { VuemojiPicker },
  data() {
    return {
      chatMessages: [],
      roomUsers: [],
      inputChatMessage: '',
      roomInfo: undefined
    }
  },
  mounted() {
    this.$eventBus.on('onJoinRoom', this.onJoinRoom)
    this.$eventBus.on('onRoomUsers', this.onRoomUsers)
    this.$eventBus.on('onRoomChat', this.onRoomChat)
    this.$eventBus.on('onLeaveRoom', this.onLeaveRoom)
    this.$eventBus.on('onJoinRoomSucceeded', this.onJoinRoomSucceeded)
    this.$eventBus.on('onLeaveRoomSucceeded', this.onLeaveRoomSucceeded)
    this.$eventBus.on('onDisconnected', this.onDisconnected)
  },
  methods: {
    addChatMessage(msg) {
      if (this.chatMessages.length === 200) {
        this.chatMessages.pop()
      }
      this.chatMessages.unshift(msg)
    },
    handleEmoji(emoji) {
      this.inputChatMessage += emoji.unicode
    },
    onDisconnected(data) {
      const msg = messageBuilder.disconnected(data.data, data.now)
      this.addChatMessage(msg)
    },
    onJoinRoomSucceeded(data) {
      this.$ws.setAttribute('room', data.data)
      this.roomInfo = data.data
    },
    onLeaveRoomSucceeded(data) {
      this.$ws.removeAttribute('room')
    },
    onSendMessage() {
      if (!this.$ws.isConnected()) {
        this.$q.notify(wsErrorNotify.lostConnection)
        this.$router.push({ path: '/login' })
        return
      }

      if (!this.$ws.containsAttribute('user')) {
        this.$q.notify(wsErrorNotify.lostLoginInfo)
        this.$router.push({ path: '/login' })
        return
      }

      this.$ws.send({
        uri: '/room/chat',
        body: {
          message: this.inputChatMessage
        }
      })

      this.onSendMessageReset()
    },
    onSendMessageReset() {
      this.inputChatMessage = ''
      this.$refs.chatForm.resetValidation()
    },
    onJoinRoom(data) {
      const msg = messageBuilder.joinMessage(data.data, data.now, whereConstant.room)
      this.addChatMessage(msg)
    },
    onRoomUsers(data) {
      this.roomUsers = data.data
    },
    onRoomChat(data) {
      const msg = messageBuilder.chatMessage(data.data.userProfile, data.data.message, data.now)
      this.addChatMessage(msg)
    },
    onLeaveRoom(data) {
      const msg = messageBuilder.leaveMessage(data.data, data.now, whereConstant.room)
      this.addChatMessage(msg)
    },
    onLeaveRoomBtn() {
      if (!this.$ws.isConnected()) {
        this.$q.notify(wsErrorNotify.lostConnection)
        this.$router.push({ path: '/login' })
        return
      }

      if (!this.$ws.containsAttribute('user')) {
        this.$q.notify(wsErrorNotify.lostLoginInfo)
        this.$router.push({ path: '/login' })
        return
      }

      this.$router.push({ path: '/lobby' })

      setTimeout(this.lazyLeaveRoom, 500)

      this.$q.loading.show()
    },
    lazyLeaveRoom() {
      this.$ws.send({
        uri: '/room/leave',
        body: {}
      })
      this.$q.loading.hide()
    },
    refreshRoomUsers() {
      if (!this.$ws.isConnected()) {
        this.$q.notify(wsErrorNotify.lostConnection)
        this.$router.push({ path: '/login' })
        return
      }

      if (!this.$ws.containsAttribute('user')) {
        this.$q.notify(wsErrorNotify.lostLoginInfo)
        this.$router.push({ path: '/login' })
        return
      }

      this.$ws.send({
        uri: '/room/users',
        body: {}
      })
    }
  }
})
</script>

<style lang="sass" scoped>
.row > div
  padding: 5px 5px
</style>
