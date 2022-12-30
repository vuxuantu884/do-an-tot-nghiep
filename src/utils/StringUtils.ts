export const normalizeText = (text: string) => {
  return text
    ? text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
    : text;
};

export const strForSearch = (str: string | String) => {
  return normalizeText(str.toString()).toLowerCase();
};

export const fullTextSearch = (textSearch: string, value: string) => {
  if (typeof textSearch === "string" && typeof value === "string") {
    const text = strForSearch(textSearch.trim());
    const valueStr = strForSearch(value);
    return text.split(/\s+/).every((word) => valueStr.indexOf(word) > -1);
  } else {
    return false;
  }
};

export const searchNumberString = (textSearch: string, value: string | number) => {
  const text = strForSearch(textSearch.trim());
  const valueStr = strForSearch(value.toString());
  return text.split(/\s+/).every((word) => valueStr.indexOf(word) > -1);
};
