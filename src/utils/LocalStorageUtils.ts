import { PackModel } from "model/pack/pack.model";

const ACCESS_TOKEN = "access_token";
const SETTING_APP = "setting_app";
const PACKINFO_APP = "packinfo_app";
const YDPAGE_SOURCE = "ydpage_source";

export const ACCOUNT_CODE_LOCAL_STORAGE = "accountCode";
export const DELIVER_SERVICES_LOCAL_STORAGE = "deliver_services";

const setToken = (token: any) => {
  localStorage.setItem(ACCESS_TOKEN, token);
};

const getToken = (): String | null => {
  return localStorage.getItem(ACCESS_TOKEN);
};

const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN);
};

const removeTourGuide = () => {
  localStorage.removeItem("isShowSummaryTour");
  localStorage.removeItem("isShowAuditTour");
  localStorage.removeItem("isShowForwardTourVar");
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

const setPackInfo = (appSeting: PackModel) => {
  let data: string = JSON.stringify(appSeting);
  localStorage.setItem(PACKINFO_APP, data);
};

const getPackInfo = (): string | null => {
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

function setWithExpiry(key: string, value: string | boolean, ttl: number) {
  const item = {
    value: value,
    expiry: new Date().getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key: string) {
  const itemString = window.localStorage.getItem(key);
  if (!itemString) return null;

  const item = JSON.parse(itemString);
  const isExpired = new Date().getTime() > item.expiry;

  if (isExpired) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

function setSaveSearchhLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}
function getSaveSearchLocalStorage(key: string) {
  return localStorage.getItem(key);
}

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
  getWithExpiry,
  setWithExpiry,
  setSaveSearchhLocalStorage,
  getSaveSearchLocalStorage,
  removeTourGuide
};
