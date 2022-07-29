const SearchVariantField = {
  created_date: "created_date",
  status: "status",
  applied_shop: "applied_shop",
  applied_source: "applied_source",
  customer_category: "customer_category",
  discount_method: "discount_method",
};

const SearchVariantMapping = {
  [SearchVariantField.created_date]: "Ngày tạo chương trình",
  [SearchVariantField.status]: "Trạng thái chương trình",
  [SearchVariantField.applied_shop]: "Cửa hàng áp dụng",
  [SearchVariantField.applied_source]: "Kênh bán hàng áp dụng",
  [SearchVariantField.customer_category]: "Đối tượng khách hàng áp dụng",
  [SearchVariantField.discount_method]: "Phương thức chiết khấu",
};

export { SearchVariantMapping, SearchVariantField };
