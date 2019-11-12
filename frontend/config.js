export const ENV = 'local';
export const API_ROOT =
  ENV === 'production'
    ? 'https://f19-esn-sa3.herokuapp.com'
    : 'http://localhost:3000';
