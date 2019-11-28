import { closeMenu } from '../../chatroom/utils/cleaners.js';
import { statusMap } from '../../chatroom/config.js';
import { setUserStatus } from '../utils/api-senders.js';
import userStore from '../../../store/user.js';


export const shareStatusClickListener = async () => {
    closeMenu();
    const statusCode = document.getElementById('statusSelect').value;
    if (statusCode in statusMap) {
      const status = statusMap[statusCode];
      // the status remains the same actually
      console.log('update status to ' + status);
      await setUserStatus({ status: status });
      userStore.userActions.updateStatus(status);
    }
  };