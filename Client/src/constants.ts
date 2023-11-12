export enum MessageKind {
    MESSAGE_TYPE_CHAT = 1,
      MESSAGE_TYPE_START_GAME,
      MESSAGE_TYPE_END_GAME,
      MESSAGE_TYPE_USER_JOIN,
      MESSAGE_TYPE_USER_LEAVE,
      MESSAGE_TYPE_DRAW,
      MESSAGE_TYPE_GUESS,
      MESSAGE_TYPE_CLEAR,
      MESSAGE_TYPE_IS_OWNER,
      MESSAGE_TYPE_START_ROUND,
      MESSAGE_TYPE_IS_PAINTER,
      MESSAGE_TYPE_SAY_PAINTER,
      MESSAGE_TYPE_END_ROUND,
      MESSAGE_TYPE_WHO_GUESS,
      MESSAGE_TYPE_SHOW_POINTS
  }
  
export const SERVER = 'localhost:8080'
//export const SERVER = 'guess-it.onrender.com'

export const PROTOCOL = 'ws://'
//export const PROTOCOL = 'wss://'