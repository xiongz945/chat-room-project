import router from '../router.js';

const storage = window.localStorage;

const messageActions = {
  appendEndMessage(messages, id) {
    const localMessageList = messageGetters.messages();
    if (localMessageList[id]) {
        localMessageList[id] = localMessageList[id].concat(messages)
    } else {
        localMessageList[id] = messages
    }

    storage.setItem('messages', JSON.stringify(localMessageList));
  },
  appendFrontMessage(messages, id) {
    const localMessageList = messageGetters.messages();
    if (localMessageList[id]) {
        localMessageList[id] = localMessageList[id].unshift(...messages)
    } else {
        localMessageList[id] = messages
    }

    storage.setItem('messages', JSON.stringify(localMessageList));
  },
};

const messageGetters = {
  messages: () => JSON.parse(storage.getItem('messages')),
  messagesById: (id) => JSON.parse(storage.getItem('messages'))[id]
};

export default {
  messageActions,
  messageGetters,
};
