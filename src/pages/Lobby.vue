<template>

  <div class="q-pa-md">

    <div class="row justify-start">
      <div class="col-all">
        <q-btn color="primary" label="방 만들기" @click="createRoomDialog = true" icon="create_new_folder"/>
      </div>
    </div>

    <q-dialog v-model="createRoomDialog">
      <div class="dialog-width">
        <q-form @submit="onCreateRoom" @reset="onCreateRoomReset">
          <q-card>
            <q-card-section class="bg-primary text-white">
              <div class="text-h6 col text-center">방 만들기</div>
            </q-card-section>

            <q-separator/>

            <q-card-section>
              <q-input
                clearable
                filled
                outlined
                v-model="roomTitle"
                label="방 제목"
                lazy-rules
                :rules="[ val => val && val.length > 0 || '필수입력' ]"
                model-value=""
                autocorrect="off"
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
              />
            </q-card-section>

            <q-card-actions align="center">
              <q-btn type="reset" label="취소" icon="close"/>
              <q-btn type="submit" color="primary" label="확인" icon="done"/>
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
    </q-dialog>

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
        <q-toolbar class="bg-secondary text-white shadow-2 q-mb-sm">
          <q-toolbar-title>참가자 ({{ lobbyUsers.length }})</q-toolbar-title>
          <q-btn round color="secondary" icon="refresh" @click="refreshLobbyUsers"/>
        </q-toolbar>
        <q-list bordered separator v-if="lobbyUsers.length > 0">
          <q-item clickable v-ripple v-for="user in lobbyUsers" :key="user">
            <q-item-section>
              <q-item-label>{{ user.username }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col">
        <q-toolbar class="bg-secondary text-white shadow-2 q-mb-sm">
          <q-toolbar-title>채팅 목록</q-toolbar-title>
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
      <div class="col-3">
        <q-toolbar class="bg-orange text-white shadow-2 q-mb-sm">
          <q-toolbar-title>방 목록 ({{ lobbyRooms.length }})</q-toolbar-title>
          <q-btn round color="orange" icon="refresh" @click="refreshRooms"/>
        </q-toolbar>
        <q-list bordered separator v-if="lobbyRooms.length > 0">
          <q-item clickable v-ripple v-for="room in lobbyRooms" :key="room">
            <q-item-section>{{ room.roomTitle }}</q-item-section>
            <q-item-section>
              <q-btn color="primary" label="참가" @click="onJoinRoom(room)"/>
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
  name: 'Lobby',
  components: { VuemojiPicker },
  data() {
    return {
      createRoomDialog: false,
      roomTitle: '',
      chatMessages: [],
      lobbyUsers: [],
      lobbyRooms: [],
      inputChatMessage: '',
      joinRoom: undefined,
      emoji: false
    }
  },
  mounted() {
    this.$eventBus.on('onJoinLobby', this.onJoinLobby)
    this.$eventBus.on('onLobbyUsers', this.onLobbyUsers)
    this.$eventBus.on('onLobbyChat', this.onLobbyChat)
    this.$eventBus.on('onLeaveLobby', this.onLeaveLobby)
    this.$eventBus.on('onLobbyRooms', this.onLobbyRooms)
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
    onLobbyRooms(data) {
      this.lobbyRooms = data.data
    },
    onLeaveLobby(data) {
      const msg = messageBuilder.leaveMessage(data.data, data.now, whereConstant.lobby)
      this.addChatMessage(msg)
    },
    onLobbyChat(data) {
      const msg = messageBuilder.chatMessage(data.data.userProfile, data.data.message, data.now)
      this.addChatMessage(msg)
    },
    onJoinLobby(data) {
      const msg = messageBuilder.joinMessage(data.data, data.now, whereConstant.lobby)
      this.addChatMessage(msg)
    },
    onLobbyUsers(data) {
      this.lobbyUsers = data.data
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
        uri: '/lobby/chat',
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
    onCreateRoom() {
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

      this.$router.push({ path: '/room' })
      setTimeout(this.lazyCreateRoom, 500)
      this.$q.loading.show()
    },
    lazyCreateRoom() {
      this.$ws.send({
        uri: '/room/create',
        body: {
          roomTitle: this.roomTitle,
          roomDescription: this.roomTitle
        }
      })

      this.onCreateRoomReset()
      this.$q.loading.hide()
    },
    onCreateRoomReset() {
      this.roomTitle = ''
      this.createRoomDialog = false
    },
    onJoinRoom(room) {
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

      this.joinRoom = room
      this.$router.push({ path: '/room' })
      setTimeout(this.lazyJoinRoom, 500)
      this.$q.loading.show()
    },
    lazyJoinRoom() {
      this.$ws.send({
        uri: '/room/join',
        body: {
          roomId: this.joinRoom.roomId
        }
      })
      this.joinRoom = undefined
      this.$q.loading.hide()
    },
    refreshRooms() {
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
        uri: '/room/rooms',
        body: {}
      })
    },
    refreshLobbyUsers() {
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
        uri: '/lobby/users',
        body: {}
      })
    }
  }
})
</script>

<style lang="sass" scoped>
.row > div
  padding: 5px 5px

.dialog-width
  width: 20rem
</style>
