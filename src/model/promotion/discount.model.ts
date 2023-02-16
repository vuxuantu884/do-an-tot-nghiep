const SearchVariantField = {
  priorities: "priorities",
  entitled_methods: "entitled_methods",
  creators: "creators",
  store_ids: "store_ids",
  channels: "channels",
  source_ids: "source_ids",
  starts_date: "starts_date",
  ends_date: "ends_date",
};

const SearchVariantMapping = {
  [SearchVariantField.priorities]: "Mức độ ưu tiên",
  [SearchVariantField.entitled_methods]: "Phương thức chiết khấu",
  [SearchVariantField.creators]: "Người tạo chiết khấu",
  [SearchVariantField.store_ids]: "Cửa hàng áp dụng",
  [SearchVariantField.channels]: "Kênh bán hàng áp dụng",
  [SearchVariantField.source_ids]: "Nguồn đơn hàng áp dụng",
  [SearchVariantField.starts_date]: "Ngày bắt đầu áp dụng",
  [SearchVariantField.ends_date]: "Ngày kết thúc áp dụng",
};

export { SearchVariantMapping, SearchVariantField };
