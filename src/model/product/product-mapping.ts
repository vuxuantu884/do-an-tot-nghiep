import { BaseMapping } from 'model/base/base-mapping';


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
  status: 'status'
};

const SearchVariantMapping: Array<BaseMapping> = [
  {
    field: SearchVariantField.created_date,
    displayField: 'Ngày tạo'
  },
  {
    field: SearchVariantField.status,
    displayField: 'Trạng thái'
  },
  {
    field: SearchVariantField.inventory,
    displayField: 'Tồn kho'
  },
  {
    field: SearchVariantField.made_in,
    displayField: 'Xuất xứ'
  },
  {
    field: SearchVariantField.designer,
    displayField: 'Nhà thiết kế'
  },
  {
    field: SearchVariantField.merchandiser,
    displayField: 'Merchandiser'
  },
  {
    field: SearchVariantField.size,
    displayField: 'Kích thước'
  },
  {
    field: SearchVariantField.color,
    displayField: 'Màu sắc'
  },
  {
    field: SearchVariantField.main_color,
    displayField: 'Màu chủ đạo'
  },
  {
    field: SearchVariantField.supplier,
    displayField: 'Nhà cung cấp'
  },
 
];

export {SearchVariantMapping, SearchVariantField};