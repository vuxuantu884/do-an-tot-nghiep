import { generateQuery } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import { AppConfig } from "config/app.config";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";
import { ICustomerNoteTags } from ".";

export const SOCIAL_CHANNEL = {
  YDPAGE: "YDpage",
  UNICHAT: "unichat",
};

interface IUpdateNoteData {
  idNoteTag: string;
  updated_at?: Date;
  updated_by?: string;
  content: string;
}

export const getUnichatCustomerInfo = (
  userId: string,
  setYDPageCustomerInfo: (data: YDPageCustomerResponse) => void,
) => {
  const queryParams = {
    sender_id: userId,
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info?${params}`;
  fetch(link, { method: "GET" })
    .then((response) => response.json())
    .then((res) => {
      setYDPageCustomerInfo(res.data);
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const addUnichatCustomerPhone = (userId: string, phone: string, callback: () => void) => {
  const queryParams = {
    sender_id: userId,
    phone,
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/add-phone?${params}`;
  return fetch(link, { method: "POST" })
    .then((response) => response.json())
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const addUnichatCustomerNote = (userId: string, noteInfo: ICustomerNoteTags) => {
  const data = {
    sender_id: userId,
    ...noteInfo,
  };
  const link = `${AppConfig.unichatApi}conversation/customer-info/add-note`;
  return fetch(link, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw Error("Lỗi tạo ghi chú");
      }

      return response.json();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const updateUnichatCustomerNote = (userId: string, updateNoteData: IUpdateNoteData) => {
  const data = {
    sender_id: userId,
    ...updateNoteData,
  };
  const link = `${AppConfig.unichatApi}conversation/customer-info/update-note`;
  return fetch(link, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw Error("Lỗi sửa ghi chú");
      }

      return response.json();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const deleteUnichatCustomerNote = (userId: string, idNoteTag: string) => {
  const queryParams = {
    sender_id: userId,
    idNoteTag,
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/delete-note?${params}`;
  return fetch(link, { method: "DELETE" })
    .then((response) => {
      if (!response.ok) {
        throw Error("Lỗi xóa ghi chú");
      }

      return response.json();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const deleteUnichatCustomerPhone = (
  userId: string,
  phone: string,
  setYDPageCustomerInfo: (data: YDPageCustomerResponse) => void,
) => {
  const queryParams = {
    sender_id: userId,
    phone,
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/delete-phone?${params}`;
  return fetch(link, { method: "DELETE" })
    .then((response) => response.json())
    .then((res) => {
      setYDPageCustomerInfo(res.data);
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};

export const setUnichatDefaultPhone = (userId: string, phone: string, callback: () => void) => {
  const queryParams = {
    sender_id: userId,
    default_phone: phone,
  };
  const params = generateQuery(queryParams);
  const link = `${AppConfig.unichatApi}conversation/customer-info/default-phone?${params}`;
  return fetch(link, { method: "PUT" })
    .then((response) => response.json())
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.log(err?.message);
      showError(err?.message);
    });
};
