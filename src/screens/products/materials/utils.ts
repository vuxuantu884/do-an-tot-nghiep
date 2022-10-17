import { RegUtil } from "utils/RegUtils";

interface validateReturnType {
  errors?: string[];
  value?: string;
}
/**
 *
 * @param value validate
 */
export function validateNumberValue(value: string): validateReturnType {
  if (!RegUtil.FLOATREG.test(value)) {
    return { errors: ["Bạn vui lòng nhập vào một số"], value: "" };
  }

  const dotIndex = value.indexOf(".");
  if (dotIndex === -1 || value.length - dotIndex < 4) {
    // natural number || floating pointer number but has less than 3 decimal places
    return { value };
  }

  return { value: parseFloat(value).toFixed(3) };
}
