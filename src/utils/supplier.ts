import { RegUtil } from "./RegUtils";
import { SupplierResponse } from "../model/core/supplier.model";

type ValidationPhoneType = {
  value: any;
  callback: any;
  phoneCurrent?: string | null;
  phoneList?: SupplierResponse[];
};
export const validatePhoneSupplier = ({
  value,
  callback,
  phoneCurrent,
  phoneList,
}: ValidationPhoneType) => {
  if (value) {
    if (!RegUtil.PHONE.test(value)) {
      callback(`Số điện thoại không đúng định dạng`);
    } else {
      phoneList?.forEach((supplier) => {
        if (phoneCurrent === value) callback();
        if (supplier?.phone === value) callback(`Số điện thoại đã tồn tại`);
      });
      callback();
    }
  } else {
    callback();
  }
};

