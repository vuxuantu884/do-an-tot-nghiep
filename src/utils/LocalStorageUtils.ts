const ACCESS_TOKEN = "access_token";
const SETTING_APP = "setting_app";
const PACKINFO_APP = "packinfo_app";
const YDPAGE_SOURCE = "ydpage_source";

const setToken = (token: any) => {
  localStorage.setItem(ACCESS_TOKEN, token);
};

const getToken = (): String | null => {
  return localStorage.getItem(ACCESS_TOKEN);
};

const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN);
};

export const clearLocalStorage = () => {
	localStorage.clear();
};

const setAppSetting = (appSeting: any) => {
  let data: string = JSON.stringify(appSeting);
  localStorage.setItem(SETTING_APP, data);
};

const getSettingApp = (): String | null => {
  return localStorage.getItem(SETTING_APP);
};

const setPackInfo = (appSeting: any) => {
  let data: string = JSON.stringify(appSeting);
  localStorage.setItem(PACKINFO_APP, data);
};

const getPackInfo = (): String | null => {
  return localStorage.getItem(PACKINFO_APP);
};

const removePackInfo = () => {
  localStorage.removeItem(PACKINFO_APP);
};

const setYdpageSource = (source: string) => {
  localStorage.setItem(YDPAGE_SOURCE, source);
};

const getYdpageSource = (): string | null => {
  return localStorage.getItem(YDPAGE_SOURCE);
};

export {
  setToken,
  getToken,
  removeToken,
  setAppSetting,
  getSettingApp,
  setPackInfo,
  getPackInfo,
  removePackInfo,
  setYdpageSource,
  getYdpageSource,
};
