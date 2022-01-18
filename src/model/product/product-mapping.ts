const SearchVariantField = {
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
  [SearchVariantField.made_in]: "Xuất xứ",
  [SearchVariantField.designer]: "Nhà thiết kế",
  [SearchVariantField.merchandiser]: "Merchandiser",
  [SearchVariantField.size]: "Kích thước",
  [SearchVariantField.color]: "Màu sắc",
  [SearchVariantField.main_color]: "Màu chủ đạo",
  [SearchVariantField.supplier]: "Nhà cung cấp",
  [SearchVariantField.brand]: "Thương hiệu",
};

const SearchVariantWrapperField = {
  created_date: "created_date",
  designer_code: "designer_code",
  merchandiser_code: "merchandiser_code",
  status: "status",
  category_id: "category_id",
  goods: "goods",
  material_id: "material_id",
};
const SearchVariantWrapperMapping = {
  [SearchVariantWrapperField.created_date]: "Ngày khởi tạo",
  [SearchVariantWrapperField.designer_code]: "Nhà thiết kế",
  [SearchVariantWrapperField.merchandiser_code]: "Merchandiser",
  [SearchVariantWrapperField.status]: "Trạng thái",
  [SearchVariantWrapperField.category_id]: "Danh mục",
  [SearchVariantWrapperField.goods]: "Ngành hàng",
  [SearchVariantWrapperField.material_id]: "Chất liệu",
};

export {SearchVariantMapping, SearchVariantField, SearchVariantWrapperMapping, SearchVariantWrapperField};