import moment from 'moment';

// convert obj to formData
export function convertObjToForm(obj) {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => {
    formData.append(key, obj[key]);
  });
  return formData;
}

// delay execuation
export function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
