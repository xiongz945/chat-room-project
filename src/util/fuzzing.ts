import {findBestMatch} from 'string-similarity';

export const matchQuestion = (content: string, dict: any) => {
  let list = [];
  for (const key in dict) {
    list.push(key);
  }

  const res = findBestMatch(content, list);
  if (res.bestMatch.rating >= 0.6) {
    return dict[res.bestMatch.target];
  }
  return '';
};
