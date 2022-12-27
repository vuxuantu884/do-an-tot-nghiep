import { AnySchema, InferType, object, string } from "yup";

export const PasswordSchema = object({
  password: string()
    .required("Vui lòng nhập mật khẩu")
    .min(12, "Mật khẩu có tối thiểu 12 ký tự")
    .max(100, "Mật khẩu có tối đa 100 ký tự")
    .matches(/(?=.*[a-z])/, "Mật khẩu phải có ít nhất 1 ký tự thường")
    .matches(/(?=.*[A-Z])/, "Mật khẩu phải có ít nhất 1 ký tự hoa")
    .matches(/(?=.*[0-9])/, "Mật khẩu phải có ít nhất 1 số")
    .matches(/(?=.*[^A-Za-z0-9 ])/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"),
  confirm_password: string().test(
    "passwords-match",
    "Mật khẩu không khớp",
    function (value, context) {
      return context.parent.password === value;
    },
  ),
});

export interface Password extends InferType<typeof PasswordSchema> {}

export const addChecklist = (schema: AnySchema, value: any, description: string) => {
  if (schema.isValidSync(value)) {
    return {
      description,
      passed: true,
    };
  } else {
    return {
      description,
      passed: false,
    };
  }
};
export const getPasswordChecklist = (password: string) => {
  const checklist = [];
  checklist.push(addChecklist(string().min(12).max(100), password, "Mật khẩu có 12-100 ký tự"));
  checklist.push(
    addChecklist(string().matches(/(?=.*[A-Z])/), password, "Mật khẩu có ít nhất 1 ký tự in hoa"),
  );
  checklist.push(
    addChecklist(string().matches(/(?=.*[a-z])/), password, "Mật khẩu có ít nhất 1 ký tự thường"),
  );
  checklist.push(
    addChecklist(string().matches(/(?=.*[0-9])/), password, "Mật khẩu có ít nhất 1 số"),
  );
  checklist.push(
    addChecklist(
      string().test(
        "passwords-special-characters",
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
        function (value) {
          if (!value) return false;
          const normalizeValue = value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
          return /(?=.*[^A-Za-z0-9 ])/.test(normalizeValue);
        },
      ),
      password,
      "Mật khẩu có ít nhất 1 ký tự đặc biệt",
    ),
  );
  return checklist;
};
