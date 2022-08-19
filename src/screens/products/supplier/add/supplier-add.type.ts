import { Rule } from "rc-field-form/lib/interface";
import { InputProps } from "antd";

export interface BaseObject<T> {
  [key: string]: T;
}

export type FormFieldType = BaseObject<FormFieldItem> & {};

export type FormFieldItem = {
  key: string;
  title: string;
  extra?: boolean;
  formGroups: Array<IFormControl>[];
};

export type IFormControl = InputProps & {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  componentType: Partial<ComponentType>;
  disabled?: boolean;
  rules?: Rule[];
  fullWidth?: boolean;
  hidden?: boolean;
};

// export type FormSupplierInfo = {
//   [FormFields.type]: string;
//   [FormFields.code]: string;
//   [FormFields.name]: string;
// }

export enum ComponentType {
  Radio = "Radio",
  Input = "Input",
  InputMobile = "InputMobile",
  InputArea = "InputArea",
  Select = "Select",
  SelectCategory = "SelectCategory",
  SelectPaging = "SelectPaging",
}

export enum FormFields {
  type = "type",
  code = "code",
  name = "name",
  supplier_category = "supplier_category",
  scorecard = "scorecard",
  pic_code = "pic_code",
  tax_code = "tax_code",
  phone = "phone",
  collection_ids = "collection_ids",
  country_id = "country_id",
  district_id = "district_id",
  city_id = "city_id",
  address = "address",
  moq = "moq",
  moq_unit = "moq_unit",
  debt_time = "debt_time",
  debt_time_unit = "debt_time_unit",
  note = "note",
  contact_name = "name",
  contact_position = "position",
  contact_phone = "phone",
  contact_fax = "fax",
  contact_email = "email",
  contact_website = "website",
  payment_name = "name",
  payment_brand = "brand",
  payment_number = "number",
  payment_beneficiary = "beneficiary",
}
