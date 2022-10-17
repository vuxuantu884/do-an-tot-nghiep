import { RegUtil } from "utils/RegUtils";

interface validateReturnType {
  errors?: string[];
  value?: string;
}

/**
 * Eg. "23.3456" => 7 - 2 = 5
 */
const distanceBetweenDotAndStringLength = 4;

/**
 *
 * @param value takes an input as floating point number.
 * If input contains letters other than ASCII digits and dot (.), returns error
 * If the input is natural number, returns that number
 * If the input is floating point number, rounds it up to 3 decimal digits then returns it.
 */
export function validateNumberValue(value: string): validateReturnType {
  if (!RegUtil.FLOATREG.test(value)) {
    return { errors: ["Bạn vui lòng nhập vào một số"], value: "" };
  }

  const dotIndex = value.indexOf(".");
  if (dotIndex === -1 || value.length - dotIndex < distanceBetweenDotAndStringLength) {
    // natural number || floating pointer number but has less than 3 decimal places
    return { value };
  }

  return { value: parseFloat(value).toFixed(3) };
}