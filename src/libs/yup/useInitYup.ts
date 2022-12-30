import { normalizeText } from "utils/StringUtils";
import { addMethod, number, string, NumberSchema, StringSchema } from "yup";

//number
addMethod<NumberSchema>(number, "maxLength", function (max: number, message?: string) {
  return this.test({
    name: "maxLength",
    message: message || `Must be ${max} characters or less`,
    test: (value) => `${value}`.length <= max,
  });
});

addMethod<NumberSchema>(number, "maxLengthInteger", function (max: number, message?: string) {
  return this.test({
    name: "maxLengthInteger",
    message: message || `Must be ${max} characters or less`,
    test: (value) => {
      const valueNumber = Number(value);
      if (isNaN(valueNumber)) return false;
      const integerValue = Math.floor(valueNumber);
      return `${integerValue}`.length <= max;
    },
  });
});

//string
addMethod<StringSchema>(string, "requiredRichText", function (message?: string) {
  return this.test({
    name: "requiredRichText",
    message: message || "Rich text must not empty",
    test: (value) => {
      if (!value) return false;
      const text = value.replace(/<[^>]*>?/gm, "");
      return text.trim().length > 0;
    },
  });
});

const useInitYup = () => {};

export default useInitYup;
