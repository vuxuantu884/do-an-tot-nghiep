import { formatCurrency } from "utils/AppUtils";

export const sellingPowerReportColumns: any[] = [
  {
    title: "STT",
    children: [
      {
        title: "---",
        dataIndex: "no",
        key: "no",
        fixed: "left",
        width: 60,
      },
    ],
  },
  {
    title: "Mã vật tư",
    children: [
      {
        title: "SKU",
        dataIndex: "sku_code",
        key: "sku_code",
        fixed: "left",
      },
    ],
  },
  {
    title: "Tên vật tư",
    children: [
      {
        title: "SKU description",
        dataIndex: "sku_name",
        key: "sku_name",
        fixed: "left",
        width: 150,
      },
    ],
  },
  {
    title: "Kho",
    children: [
      {
        title: "Store",
        dataIndex: "store",
        key: "store",
        fixed: "left",
      },
    ],
  },
  {
    title: "Nhóm sản phẩm",
    children: [
      {
        title: "Product group level 1",
        dataIndex: "product_group_leve1",
        key: "product_group_leve1",
        width: 150,
      },
      {
        title: "Product group level 2",
        dataIndex: "product_group_leve2",
        key: "product_group_leve2",
        width: 150,
      },
    ],
  },
  {
    title: "Màu",
    children: [
      {
        title: "Color",
        dataIndex: "name_color",
        key: "name_color",
      },
    ],
  },
  {
    title: "",
    children: [
      {
        title: "Size",
        dataIndex: "name_size",
        key: "name_size",
        width: 40,
      },
    ],
  },
  {
    title: "",
    children: [
      {
        title: "Barcode",
        dataIndex: "name_barcode",
        key: "name_barcode",
      },
    ],
  },
  {
    title: "DVT",
    children: [
      {
        title: "Currency",
        dataIndex: "name_currency",
        key: "name_currency",
        width: 70,
      },
    ],
  },
  {
    title: "Giá vốn",
    children: [
      {
        title: "Cost price",
        dataIndex: "cost_price",
        key: "cost_price",
        align: "right",
      },
    ],
  },
  {
    title: "Giá bán",
    children: [
      {
        title: "Retail price",
        dataIndex: "retail_price",
        key: "retail_price",
        align: "right",
      },
    ],
  },
  {
    title: "Số dư đầu kì (Opening balance)",
    children: [
      {
        title: "Số lượng (Quantity)",
        dataIndex: "t13",
        key: "t13",
        align: "right",
        width: 150,
      },
      {
        title: "Giá trị (Amount)",
        dataIndex: "t14",
        key: "t14",
        align: "right",
      },
    ],
  },
  {
    title: "Nhập kho (Stock in)",
    children: [
      {
        title: "Nhập mua từ NCC",
        dataIndex: "n01",
        key: "n01",
        align: "right",
        width: 135,
      },
      {
        title: "Giá trị mua từ NCC",
        dataIndex: "n07",
        key: "n07",
        align: "right",
        width: 135,
      },
      {
        title: "Nhận hàng chuyển kho",
        dataIndex: "n02",
        key: "n02",
        align: "right",
        width: 160,
      },
      {
        title: "Giá trị nhận chuyển kho",
        dataIndex: "n08",
        key: "n08",
        align: "right",
        width: 160,
      },
      {
        title: "Khách hàng trả lại",
        dataIndex: "n03",
        key: "n03",
        align: "right",
        width: 135,
      },
      {
        title: "Giá trị khách trả lại",
        dataIndex: "n09",
        key: "n09",
        align: "right",
        width: 135,
      },
      {
        title: "Nhập khác",
        dataIndex: "n04",
        key: "n04",
        align: "right",
      },
      {
        title: "Giá trị nhập khác",
        dataIndex: "n10",
        key: "n10",
        align: "right",
      },
      {
        title: "Kiểm kê tăng",
        dataIndex: "n05",
        key: "n05",
        align: "right",
      },
      {
        title: "Giá trị kiểm kê tăng",
        dataIndex: "n11",
        key: "n11",
        align: "right",
        width: 145,
      },
    ],
  },
  {
    title: "",
    children: [
      {
        title: "Tổng số lượng nhập kho",
        dataIndex: "n06",
        key: "n06",
        align: "right",
        width: 170,
      },
      {
        title: "Tổng giá trị nhập kho",
        dataIndex: "n12",
        key: "n12",
        align: "right",
        width: 150,
      },
    ],
  },
  {
    title: "Xuất kho (Stock out)",
    children: [
      {
        title: "Trả lại NCC",
        dataIndex: "x01",
        key: "x01",
        align: "right",
      },
      {
        title: "Giá trị trả lại NCC",
        dataIndex: "x02",
        key: "x02",
        align: "right",
      },
      {
        title: "Xuất chuyển kho",
        dataIndex: "x03",
        key: "x03",
        align: "right",
      },
      {
        title: "Giá trị xuất chuyển kho",
        dataIndex: "x04",
        key: "x04",
        align: "right",
        width: 160,
      },
      {
        title: "Xuất bán",
        dataIndex: "x05",
        key: "x05",
        align: "right",
      },
      {
        title: "Giá trị xuất bán",
        dataIndex: "x06",
        key: "x06",
        align: "right",
      },
      {
        title: "Xuất khác",
        dataIndex: "x07",
        key: "x07",
        align: "right",
      },
      {
        title: "Giá trị xuất khác",
        dataIndex: "x08",
        key: "x08",
        align: "right",
      },
      {
        title: "Kiểm kê giảm",
        dataIndex: "x09",
        key: "x09",
        align: "right",
      },
      {
        title: "Giá trị kiểm kê giảm",
        dataIndex: "x10",
        key: "x10",
        align: "right",
        width: 150,
      },
    ],
  },
  {
    title: "",
    children: [
      {
        title: "Tổng số lượng xuất kho",
        dataIndex: "x11",
        key: "x11",
        align: "right",
        width: 160,
      },
      {
        title: "Tổng giá trị xuất kho",
        dataIndex: "x12",
        key: "x12",
        align: "right",
        width: 160,
      },
    ],
  },
  {
    title: "Dư cuối kì (Closing Balance)",
    children: [
      {
        title: "Số lượng (Quantity)",
        dataIndex: "t39",
        key: "t39",
        align: "right",
        width: 135,
      },
      {
        title: "Giá trị (Amount)",
        dataIndex: "t40",
        key: "t40",
        align: "right",
        width: 135,
      },
    ],
  },
  {
    title: "Tồn kho tại thời điểm",
    children: [
      {
        title: "Spot data",
        dataIndex: "t41",
        key: "t41",
        align: "right",
        width: 150,
      },
    ],
  },
].map((item: any) => {
  item.children = item.children.map((child: any) => {
    return {
      ...child,
      width: child.width ? child.width : 120,
      className: "text-center",
      render: (text: string | number | null, row: any) => {
        return text && typeof text === "number" ? (
          <span className={row.className}>{formatCurrency(text) ?? "-"}</span>
        ) : (
          <span className={row.className}>{text ?? "-"}</span>
        );
      },
    };
  });
  return { ...item, width: item.width ? item.width : 120, className: "text-center" };
});
