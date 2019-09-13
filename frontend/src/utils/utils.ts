import moment from 'moment';

// convert obj to formData
export function convertObjToForm(obj: any) {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => {
    formData.append(key, obj[key]);
  });
  return formData;
}

// 延迟执行
export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
