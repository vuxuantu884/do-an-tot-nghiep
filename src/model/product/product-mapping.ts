const SearchVariantField = {
  made_ins: 'made_ins',
  designers: 'designers',
  merchandisers: 'merchandisers',
  created_date: 'created_date',
  from_created_date: 'from_created_date',
  to_created_date: 'to_created_date',
  sizes: 'sizes',
  colors: 'colors',
  main_colors: 'main_colors',
  suppliers: 'suppliers',
  saleable: 'saleable',
  brands: 'brands'
};

const keysDateFilter = ['created_date'];
const keysDateWrapperFilter = ['create_date'];

const SearchVariantMapping = {
  [SearchVariantField.created_date]: "Ngày tạo",
  [SearchVariantField.saleable]: "Cho phép bán",
  [SearchVariantField.made_ins]: "Xuất xứ",
  [SearchVariantField.designers]: "Nhà thiết kế",
  [SearchVariantField.merchandisers]: "Merchandiser",
  [SearchVariantField.sizes]: "Kích thước",
  [SearchVariantField.colors]: "Màu sắc",
  [SearchVariantField.main_colors]: "Màu chủ đạo",
  [SearchVariantField.suppliers]: "Nhà cung cấp",
  [SearchVariantField.brands]: "Thương hiệu",
};

const SearchVariantWrapperField = {
  create_date: "create_date",
  from_create_date: 'from_create_date',
  to_create_date: 'to_create_date',
  designers: "designers",
  merchandisers: "merchandisers",
  status: "status",
  category_ids: "category_ids",
  goods: "goods",
  material_ids: "material_ids",
};

const SearchVariantWrapperMapping = {
  [SearchVariantWrapperField.create_date]: "Ngày khởi tạo",
  [SearchVariantWrapperField.designers]: "Nhà thiết kế",
  [SearchVariantWrapperField.merchandisers]: "Merchandiser",
  [SearchVariantWrapperField.status]: "Trạng thái",
  [SearchVariantWrapperField.category_ids]: "Danh mục",
  [SearchVariantWrapperField.goods]: "Ngành hàng",
  [SearchVariantWrapperField.material_ids]: "Chất liệu",
};

const VariantExportField = {
  sku: "sku",
  name: 'name',
  barcode: 'barcode',
  available: "available",
  saleable: "saleable",
};

const VariantExportMapping = {
  [VariantExportField.sku]: "Mã",
  [VariantExportField.name]: "Tên",
  [VariantExportField.barcode]: "Mã vạch",
  [VariantExportField.saleable]: "Trạng thái",
  [VariantExportField.available]: "Có thể bán",
};

export {
  SearchVariantMapping,
  SearchVariantField,
  SearchVariantWrapperMapping,
  SearchVariantWrapperField,
  keysDateFilter,
  keysDateWrapperFilter,
  VariantExportField,
  VariantExportMapping
};
