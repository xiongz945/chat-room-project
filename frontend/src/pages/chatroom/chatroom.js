import { API_ROOT } from '../../config.js';

import messageApis from '../../apis/message-apis.js';
import messageStore from '../../store/message.js';

import userStore from '../../store/user.js';
import router from '../../router.js';

// Set up Socket
const socket = io(API_ROOT);
socket.on('connect', function(){
    console.log('Socket connected')
});

socket.on('PULL_NEW_MESSAGE', function(id){
    console.log(id)
    recievePublicMessage();
});

socket.on('disconnect', function(){
    console.log('Socket disconnected')
});

// UI change based on user login status
if (userStore.userGetters.isLogin) {
    document.getElementById('join-community-button').style.display = 'none';
    document.getElementById('welcome-message').innerText = `Welcome, ${userStore.userGetters.user().username}!`;
    document.getElementById('logout-button').style.display = 'block';
}

// Bind event listener
document.getElementById('logout-button').onclick = () => {
    userStore.userActions.logoutUser();
    router('login');
}


document.querySelector('#message').addEventListener('keypress', function (e) {
    const key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
       sendPublicMessage();
    }
});

// Function definations
async function sendPublicMessage(){
    const newMessage = {
        senderName: userStore.userGetters.user().username,
        senderId: userStore.userGetters.user().id,
        message: document.querySelector('#message').value,
    };
    try {
        await messageApis.postPublicMessage(newMessage)
    } catch(e) {
        console.log(e)
    }

}

function recievePublicMessage(){
}


