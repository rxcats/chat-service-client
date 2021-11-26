import { DateTime } from 'luxon'

const whereConstant = {
  lobby: '로비',
  room: '방'
}

const wsErrorNotify = {
  notConnected: {
    message: '서버와 연결 중입니다. 다시 시도해 주세요.',
    spinner: true,
    position: 'top',
    timeout: 300
  },
  lostConnection: {
    message: '서버와 연결이 종료되었습니다. 로그인 화면으로 이동합니다.',
    spinner: true,
    position: 'top',
    timeout: 300
  },
  lostLoginInfo: {
    message: '로그인 정보가 없습니다. 로그인 화면으로 이동합니다.',
    spinner: true,
    position: 'top',
    timeout: 300
  }
}

function toDateTime(now) {
  return DateTime.fromISO(now).toFormat('HH:mm')
}

class MessageBuilder {
  joinMessage(user, now, where) {
    return {
      color: '#000000',
      message: `${user.username}님이 ${where}에 참여했습니다.`,
      now: toDateTime(now)
    }
  }

  leaveMessage(user, now, where) {
    return {
      color: '#000000',
      message: `${user.username}님이 ${where}에서 나갔습니다.`,
      now: toDateTime(now)
    }
  }

  chatMessage(user, message, now) {
    return {
      color: user.userColor,
      message: `${user.username}: ${message}`,
      now: toDateTime(now)
    }
  }

  disconnected(user, now) {
    return {
      color: '#000000',
      message: `${user.username}님의 연결이 종료되었습니다.`,
      now: toDateTime(now)
    }
  }
}

const messageBuilder = new MessageBuilder()

export { messageBuilder, whereConstant, wsErrorNotify }
