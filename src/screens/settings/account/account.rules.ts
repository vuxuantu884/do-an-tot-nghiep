import { Rule } from "rc-field-form/lib/interface";
const ACCENTED_CHARACTERS = /^[^ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠỹ]+$/gi; // Chỉ cho phép tiếng việt không dấu, số, ký tự đặc biệt

export const PASSWORD_RULES: Rule[] = [
  {
    pattern: ACCENTED_CHARACTERS,
    message: "Vui lòng không nhập ký tự có dấu",
  },
  { min: 6, message: "Độ dài mật khẩu tối thiểu 6 ký tự" },
  { max: 20, message: "Độ dài mật khẩu tối đa 20 ký tự" },
];
