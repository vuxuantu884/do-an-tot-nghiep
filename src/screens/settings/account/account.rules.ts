import { Rule } from "rc-field-form/lib/interface";

export const PASSWORD_RULES: Rule[] = [
  {
    pattern: /^([a-zA-Z0-9_-])*$/,
    message: "Vui lòng không nhập ký tự có dấu và dấu cách",
  },
  { min: 6, message: "Độ dài mật khẩu tối thiểu 6 ký tự" },
  { max: 100, message: "Độ dài mật khẩu tối đa 100 ký tự" },
];
