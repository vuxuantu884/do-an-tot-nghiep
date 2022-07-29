export const SearchBarcodePrintHistoryField = {
  created_bys: "created_bys",
  create_date: "create_date",
  from_create_date: "from_create_date",
  to_create_date: "to_create_date",
  note: "note",
};

export const keysDateFilter = ["create_date"];

export const SearchBarcodePrintHistoriesMapping = {
  [SearchBarcodePrintHistoryField.create_date]: "Ngày in",
  [SearchBarcodePrintHistoryField.created_bys]: "Người thao tác",
  [SearchBarcodePrintHistoryField.note]: "Ghi chú",
};
