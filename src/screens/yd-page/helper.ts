import { generateQuery } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import { AppConfig } from "config/app.config";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";

export const SOCIAL_CHANNEL = {
  YDPAGE: "YDpage",
  UNICHAT: "unichat",
};

export const getUnichatCustomerInfo = (
  userId: string,
  setYDPageCustomerInfo: (data: YDPageCustomerResponse) => void
) => {
  const queryParams = {
    sender_id: userId,
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info?${params}`;
  fetch(link, { method: 'GET' })
    .then((response) => response.json())
    .then((res) => {
      setYDPageCustomerInfo(res.data);
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const addUnichatCustomerPhone = (
  userId: string,
  phone: string,
  callback: () => void
) => {
  const queryParams = {
    sender_id: userId,
    phone
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/add-phone?${params}`;
  return fetch(link, { method: 'POST' })
    .then(response => response.json())
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const deleteUnichatCustomerPhone = (
  userId: string,
  phone: string,
  setYDPageCustomerInfo: (data: YDPageCustomerResponse) => void
) => {
  const queryParams = {
    sender_id: userId,
    phone
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/delete-phone?${params}`;
  return fetch(link, { method: "DELETE" })
    .then(response => response.json())
    .then((res) => {
      setYDPageCustomerInfo(res.data);
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const setUnichatDefaultPhone = (
  userId: string,
  phone: string,
  callback: () => void
) => {
  const queryParams = {
    sender_id: userId,
    default_phone: phone
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/default-phone?${params}`;
  return fetch(link, { method: 'PUT' })
    .then(response => response.json())
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

