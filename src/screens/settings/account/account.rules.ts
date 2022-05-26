import { Rule } from "rc-field-form/lib/interface";

export const PASSWORD_RULES: Rule[] = [
  { min: 6, message: "Độ dài mật khẩu tối thiểu 6 ký tự" },
  { max: 100, message: "Độ dài mật khẩu tối đa 100 ký tự" },
];
