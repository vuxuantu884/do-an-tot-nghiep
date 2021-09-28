const SearchVariantField = {
  inventory: 'inventory',
  made_in: 'made_in',
  designer: 'designer',
  merchandiser: 'merchandiser',
  created_date: 'created_date',
  size: 'size',
  color: 'color',
  main_color: 'main_color',
  supplier: 'supplier',
  saleable: 'saleable',
  brand: 'brand'
};

const SearchVariantMapping = {
  [SearchVariantField.created_date]: "Ngày tạo",
  [SearchVariantField.saleable]: "Cho phép bán",
  [SearchVariantField.inventory]: "Tồn kho",
  [SearchVariantField.made_in]: "Xuất xứ",
  [SearchVariantField.designer]: "Nhà thiết kế",
  [SearchVariantField.merchandiser]: "Merchandiser",
  [SearchVariantField.size]: "Kích thước",
  [SearchVariantField.color]: "Màu sắc",
  [SearchVariantField.main_color]: "Màu chủ đạo",
  [SearchVariantField.supplier]: "Nhà cung cấp",
  [SearchVariantField.brand]: "Thương hiệu",
};


export {SearchVariantMapping, SearchVariantField};