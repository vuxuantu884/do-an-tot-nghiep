import { SellingPowerFilterForm } from "../../enums/selling-power-report.enum";

export const defaultDisplayOptions = [
  {
    title: "Mã 3 ký tự",
    name: SellingPowerFilterForm.Sku3,
    index: 0,
    visible: true,
  },
  {
    title: "Mã 7 ký tự",
    name: SellingPowerFilterForm.Sku7,
    index: 1,
    visible: false,
  },
  {
    title: "Mã 13 ký tự",
    name: SellingPowerFilterForm.Sku13,
    index: 2,
    visible: false,
  },
];
