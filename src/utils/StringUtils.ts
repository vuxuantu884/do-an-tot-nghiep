export const strForSearch = (str: String) => {
  return str
    ? str
        .normalize("NFD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
    : str;
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
