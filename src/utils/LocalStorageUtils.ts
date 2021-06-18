const ACCESS_TOKEN = 'access_token';
const SETTING_APP = 'setting_app';

const setToken = (token: any) => {
  localStorage.setItem(ACCESS_TOKEN, token);
};


const getToken = (): String | null => {
  return localStorage.getItem(ACCESS_TOKEN);
};

const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN);
};


const setAppSetting = (appSeting: any) => {
  let data: string = JSON.stringify(appSeting)
  localStorage.setItem(SETTING_APP, data);
};


const getSettingApp = (): String | null => {
  return localStorage.getItem(SETTING_APP);
};


export {setToken, getToken, removeToken, setAppSetting, getSettingApp};