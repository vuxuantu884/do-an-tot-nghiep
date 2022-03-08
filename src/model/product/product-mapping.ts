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
  designer_code: "designer_code",
  merchandiser_code: "merchandiser_code",
  status: "status",
  category_id: "category_id",
  goods: "goods",
  material_id: "material_id",
};

const SearchVariantWrapperMapping = {
  [SearchVariantWrapperField.create_date]: "Ngày khởi tạo",
  [SearchVariantWrapperField.designer_code]: "Nhà thiết kế",
  [SearchVariantWrapperField.merchandiser_code]: "Merchandiser",
  [SearchVariantWrapperField.status]: "Trạng thái",
  [SearchVariantWrapperField.category_id]: "Danh mục",
  [SearchVariantWrapperField.goods]: "Ngành hàng",
  [SearchVariantWrapperField.material_id]: "Chất liệu",
};

export {
  SearchVariantMapping,
  SearchVariantField,
  SearchVariantWrapperMapping,
  SearchVariantWrapperField,
  keysDateFilter,
  keysDateWrapperFilter
};
