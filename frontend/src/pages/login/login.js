import {SHA256} from "../../utils/hash.js";
import userApis from "../../apis/user-apis.js";


async function validateForm(event) {
  event.preventDefault();

  const username = document.getElementById("username");
  const password = document.getElementById("password");

  const passwordHash = SHA256(password.value);
  let data = {
    "username": username.value,
    "password": passwordHash
  };

  let response = await userApis.login(data);
  let message = response["data"]["message"];

  if (message == "authenticated") {
    // Log into the system and then do nothing.
    window.location.replace("http://localhost:4000/");
    return;
  }

  if (message == "invalid password") {
    // Pop an alert message and reset the input text boxes.
    alert("Oops! Invalid password...");
    username.value = "";
    password.value = "";
    return;
  }

  // The case that the username is not existing.
  const intended = confirm("Do you want to create a new account?");
  if (!intended) {
    // Reset the input text boxes.
    username.value = "";
    password.value = "";
    return;
  }

  // Notify the backend to create a new account.
  data["confirm"] = true;
  response = await userApis.login(data);
  message = response["data"]["message"];

  if (message == "registered") {
    // Show the welcome message.

  } else {
    // Reset the input text boxes.
    alert("Oops! Unexpected result...");
    username.value = "";
    password.value = "";
  }
}


let form = document.getElementById("userForm");
form.addEventListener("submit", validateForm, true);
