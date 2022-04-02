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
  product_code: "product_code",
  product_name: "product_name",
  barcode: 'barcode',
  sku: "sku",
  name: 'name',
  unit: 'unit',
  images: 'images',
  weight: 'weight',
  import_price: 'import_price',
  cost_price: 'cost_price',
  retail_price: 'retail_price',
  wholesale_price: 'wholesale_price',
  saleable: "saleable",//trạng thái
  total_stock: 'total_stock',
  on_hand: 'on_hand',
  available: "available",
  committed: 'committed',
  on_hold: 'on_hold',//tạm giữ
  defect: 'defect',//hàng lỗi
  in_coming: 'in_coming',
  onway: 'onway',
  transferring: 'transferring',
  shipping: 'shipping',
  category: 'category',
  category_code: 'category_code',
  brand: 'brand',
  supplier: 'supplier',
  length: 'length',
  width: 'width',
  height: 'height',
  link: 'link',
};

const VariantExportMapping = {
  [VariantExportField.product_code]: "Mã sản phẩm cha",
  [VariantExportField.product_name]: "Tên sản phẩm cha",
  [VariantExportField.barcode]: "Mã vạch",
  [VariantExportField.sku]: "Mã sản phẩm",
  [VariantExportField.name]: "Tên sản phẩm",
  [VariantExportField.unit]: 'Đơn vị',
  [VariantExportField.images]: 'Link ảnh sản phẩm',
  [VariantExportField.weight]: 'Khối lượng',
  [VariantExportField.import_price]: 'Giá nhập',
  [VariantExportField.cost_price]: 'Giá vốn',
  [VariantExportField.retail_price]: 'Giá bán',
  [VariantExportField.wholesale_price]: 'Giá buôn',
  [VariantExportField.saleable]: "Trạng thái",
  [VariantExportField.total_stock]: 'Tổng tồn',
  [VariantExportField.on_hand]: 'Tồn trong kho',
  [VariantExportField.available]: 'Có thể bán',
  [VariantExportField.committed]: 'Đang giao dịch',
  [VariantExportField.on_hold]: 'Hàng tạm giữ',
  [VariantExportField.defect]: 'Hàng lỗi',
  [VariantExportField.in_coming]: 'Chờ nhập',
  [VariantExportField.onway]: 'Hàng đang chuyển đến',
  [VariantExportField.transferring]: 'Hàng đang chuyển đi',
  [VariantExportField.shipping]: 'Hàng đang giao',
  [VariantExportField.category_code]: 'Mã danh mục',
  [VariantExportField.category]: 'Danh mục',
  [VariantExportField.brand]: 'Thương hiệu',
  [VariantExportField.supplier]: 'Nhà cung cấp',
  [VariantExportField.length]: 'Chiều dài',
  [VariantExportField.weight]: 'Chiều rộng',
  [VariantExportField.height]: 'Chiều cao',
  [VariantExportField.link]: 'Link trên website',
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
