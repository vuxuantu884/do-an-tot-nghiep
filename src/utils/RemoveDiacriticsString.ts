export const strForSearch = (str: String) => {
  return str
    ? str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
    : str;
};
