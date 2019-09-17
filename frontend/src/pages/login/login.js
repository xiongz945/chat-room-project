import {SHA256} from "../../utils/hash.js";


async function post(data) {

  const response = await axios({
    method: "post",
    url: "http://localhost:3000/users/login",
    data: data
  });

  return response;
}


function validateForm(event) {
  event.preventDefault();

  const username = document.getElementById("username");
  const password = document.getElementById("password");

  const passwordHash = SHA256(password.value);
  const data = {
    "username": username.value,
    "password": passwordHash
  };

  const response = post(data);
  response.then(function(payload) {
    const message = payload["data"]["message"];

    if (message == "authenticated") {
      // Log into the system and then do nothing.
      window.location.replace("http://localhost:4000/");
    } else if (message == "invalid user") {
      const intended = confirm("Do you want to create a new account?");

      if (intended) {
        // Notify the backend to create a new account.
        const data = {
          "username": username.value,
          "password": passwordHash,
          "confirm": true
        };

        const response = post(data);
        response.then(function(payload) {
          const message = payload["data"]["message"];

          if (message == "registered") {
            // Show the welcome message.

          } else {
            // Reset the input text boxes.
            alert("Oops! Unexpected result...");
            username.value = "";
            password.value = "";
          }
        });
      } else {
        // Reset the input text boxes.
        username.value = "";
        password.value = "";
      }
    } else if (message == "invalid password") {
        // Reset the input text boxes.
        alert("Oops! Invalid password...");
        username.value = "";
        password.value = "";
    }
  });
}


let form = document.getElementById("userForm");
form.addEventListener("submit", validateForm, true);
