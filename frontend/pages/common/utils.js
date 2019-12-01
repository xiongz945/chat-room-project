import userApis from '../../apis/user-apis.js';
import userStore from '../../store/user.js';
import router from '../../router.js';

export async function cleanAndLogout() {
  await userApis.logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
}
