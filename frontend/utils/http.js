import { API_ROOT } from '../config.js';
import userStore from '../store/user.js';

//import axios from 'axios';
// import store from '@/store/index';

function handleError(error) {
  // Error 😨
  if (error.response) {
    /*
      * The request was made and the server responded with a
      * status code that falls out of the range of 2xx
      */
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
    return error.response;
  } else if (error.request) {
    /*
      * The request was made but no response was received, `error.request`
      * is an instance of XMLHttpRequest in the browser and an instance
      * of http.ClientRequest in Node.js
      */
    console.log(error.request);
    return error.request;
  } else {
    // Something happened in setting up the request and triggered an Error
    console.log('Error', error.message);
    return error.message;
  }
}

async function send(how, required, headers, options) {
  const url = required['url'];
  const params = required['params'];
  const data = required['data'];

  try {
    const response = await axios({
      method: how,
      url: `${API_ROOT}${url}`,
      params,
      data,
      headers: {
        Authorization: `Bearer ${userStore.userGetters.userJWT()}`,
        ...headers,
      },
      ...options,
    });
    // Success 🎉
    return response;
  } catch (error) {
    return handleError(error);
  }
}

// Send a GET request to URL and return the json from the server.
export async function get(url, params = {}, headers = {}, options = {}) {
  const required = {
    url: url,
    params: params,
    data: {},
  }
  return send('get', required, headers, options);
}

// Send a POST request to URL with json DATA and return the json from the
// server.
export async function post(url, data = {}, headers = {}, options = {}) {
  const required = {
    url: url,
    params: {},
    data: data,
  }
  return send('post', required, headers, options);
}

// Send a PUT request to URL with json DATA and return the json from the
// server.
export async function patch(url, data = {}, headers = {}, options = {}) {
  const required = {
    url: url,
    params: {},
    data: data,
  }
  return send('patch', required, headers, options);
}

// Send a DELETE request to URL and return the json from the server.
export async function del(url, headers = {}, options = {}) {
  const required = {
    url: url,
    params: {},
    data: {},
  }
  return delete('delete', required, headers, options);
}
