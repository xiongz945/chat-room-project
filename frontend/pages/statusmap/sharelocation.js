import { API_ROOT } from '../../config.js';
import userStore from '../../store/user.js';
import locationApis from '../../apis/location-apis.js';
import router from '../../router.js';


const socket = io(API_ROOT);
socket.on('connect', function() {
    console.log('Socket connected');
  });

socket.on('disconnect', function() {
console.log('Socket disconnected');
});
  
document.querySelector("#shareBtn").addEventListener('click', async function(e) {
    let location = document.querySelector("#autocomplete").value;
    let placeID = document.querySelector("#placeID").value;
    let desc = document.querySelector("#descTextArea").value;
    if ((location == '') || (desc == '')) {
        swal({ title: "Missing information", 
                text: "Please fill in all textboxes.",
                type: "warning"});
        return false;
    }
    shareLocation(location, placeID, desc);
    setTimeout(function () { close(); }, 200);
});

async function shareLocation(location, placeID, desc) {
    let name = userStore.userGetters.user().username;
    const Location = {
        name: name,
        desc: desc,
        location: location,
        placeid: placeID,
        status: userStore.userGetters.status()
    };
    try {
        await locationApis.postNewLocation(name, Location);
        socket.emit("NOTIFY_NEW_LOCATION", Location);
        console.log("done posting");
    } catch (e) {
        console.log(e);
    }
}