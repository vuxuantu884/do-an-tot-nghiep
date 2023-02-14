import { SellingPowerFilterForm } from "../../enums/selling-power-report.enum";

export const defaultDisplayOptions = [
  {
    title: "Nhóm hàng",
    name: SellingPowerFilterForm.Collection,
    index: 0,
    visible: true,
  },
  {
    title: "Danh mục sản phẩm",
    name: SellingPowerFilterForm.Category,
    index: 1,
    visible: true,
  },
  {
    title: "Mã 3 ký tự",
    name: SellingPowerFilterForm.Sku3,
    index: 2,
    visible: true,
  },
  {
    title: "Mã 7 ký tự",
    name: SellingPowerFilterForm.Sku7,
    index: 3,
    visible: true,
  },
  {
    title: "Mã 13 ký tự",
    name: SellingPowerFilterForm.Sku13,
    index: 4,
    visible: true,
  },
];
