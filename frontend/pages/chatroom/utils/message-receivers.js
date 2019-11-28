import messageApis from '../../../apis/message-apis.js';
import clockStore from '../../../store/clock.js';
import userStore from '../../../store/user.js';
import {
  updateMessageBoard,
  updateAnnouncementBar,
} from './content-updaters.js';

export async function receivePublicHistoryMessage() {
  // FIXME: Decide the number of messages to be loaded.
  const query = {
    start: 0,
    end: 10,
  };

  try {
    const response = await messageApis.getPublicHistoryMessage(query);
    const messages = response['data']['messages'];
    messages.forEach((message) => {
      updateMessageBoard(message);
    });

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}

export async function receivePrivateHistoryMessage() {
  // FIXME: Decide the number of messages to be loaded.
  const query = {
    start: 0,
    end: 5,
  };

  try {
    const me = userStore.userGetters.user()['username'];
    const peer = userStore.userGetters.chatPeer();

    let messages = [];

    query['senderName'] = me;
    query['receiverName'] = peer;
    let response = await messageApis.getPrivateHistoryMessage(peer, query);

    for (const messageIndex in response['data']['messages']) {
      messages.push(response['data']['messages'][messageIndex]);
    }

    if (me !== peer) {
      query['senderName'] = peer;
      query['receiverName'] = me;
      response = await messageApis.getPrivateHistoryMessage(me, query);
      for (const messageIndex in response['data']['messages']) {
        messages.push(response['data']['messages'][messageIndex]);
      }
    }

    messages.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    messages.forEach((message) => {
      updateMessageBoard(message);
    });

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}

export async function receiveHistoryAnnouncement() {
  try {
    const query = {
      receiverName: 'announcement',
    };

    const response = await messageApis.getAnnouncement(query);
    const announcements = response['data']['announcements'];

    for (let i = announcements.length - 1; i >= 0; --i) {
      updateAnnouncementBar(announcements[i]);
    }
  } catch (e) {
    console.log(e);
  }
}

export async function receivePublicMessage() {
  const query = {
    timestamp: clockStore.clockGetters.clock(),
  };

  try {
    const response = await messageApis.getPublicMessage(query);
    const messages = response['data']['messages'];
    messages.forEach((message) => {
      updateMessageBoard(message);
    });

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}

export async function receivePrivateMessage(payload) {
  const query = {
    timestamp: payload.timestamp,
    receiverName: payload.receiverName,
  };

  try {
    const response = await messageApis.getPrivateMessage(
      payload.receiverName,
      query
    );
    const messages = response['data']['messages'];
    messages.forEach((message) => {
      updateMessageBoard(message);
    });

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}
