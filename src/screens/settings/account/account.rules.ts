import { Rule } from "rc-field-form/lib/interface";

export const PASSWORD_RULES: Rule[] = [
  {
    pattern: /^([a-zA-Z0-9]{6,})*$/,
    message: "Vui lòng không nhập ký tự có dấu và dấu cách",
  },
  { min: 6, message: "Độ dài mật khẩu tối thiểu 6 ký tự" },
  { max: 20, message: "Độ dài mật khẩu tối đa 20 ký tự" },
];
