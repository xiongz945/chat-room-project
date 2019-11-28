import userApis from '../../../apis/user-apis.js';

export async function setUserStatus(status) {
    return await userApis.patchUserStatus(status);
}