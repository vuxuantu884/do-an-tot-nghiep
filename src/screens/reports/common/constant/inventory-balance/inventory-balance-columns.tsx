import { formatCurrency } from "utils/AppUtils";

export const inventoryBalanceColumns: any[] = [
  {
    title: "Mã vật tư sản phẩm",
    dataIndex: "sku_code",
    key: "sku_code",
    fixed: "left",
  },
  {
    title: "Tên vật tư sản phẩm",
    dataIndex: "sku_name",
    key: "sku_name",
    fixed: "left",
  },
  {
    title: "Kho/cửa hàng",
    dataIndex: "store",
    key: "store",
    fixed: "left",
  },
  {
    title: "Nhóm sản phẩm cấp 1",
    dataIndex: "product_group_leve1",
    key: "product_group_leve1",
  },
  {
    title: "Nhóm sản phẩm cấp 2",
    dataIndex: "product_group_leve2",
    key: "product_group_leve2",
  },
  {
    title: "Tên màu",
    dataIndex: "name_color",
    key: "name_color",
  },
  {
    title: "Tên size",
    dataIndex: "name_size",
    key: "name_size",
  },
  {
    title: "Tên_barcode",
    dataIndex: "name_barcode",
    key: "name_barcode",
  },
  {
    title: "Tên currency",
    dataIndex: "name_currency",
    key: "name_currency",
  },
  {
    title: "Giá vốn cố định theo vật tư",
    dataIndex: "cost_price",
    key: "cost_price",
  },
  {
    title: "Giá bán",
    dataIndex: "retail_price",
    key: "retail_price",
  },
  {
    title: "Nhập kho",
    children: [
      {
        title: "",
        dataIndex: "n01",
        key: "n01",
      },
      {
        title: "",
        dataIndex: "n02",
        key: "n02",
      },
      {
        title: "",
        dataIndex: "n03",
        key: "n03",
      },
      {
        title: "",
        dataIndex: "n04",
        key: "n04",
      },
      {
        title: "",
        dataIndex: "n05",
        key: "n05",
      },
      {
        title: "Tổng SL nhập kho",
        dataIndex: "n06",
        key: "n06",
      },
      {
        title: "Giá trị nhập mua từ NCC",
        dataIndex: "n07",
        key: "n07",
      },
      {
        title: "Giá trị nhận hàng mua chuyển kho",
        dataIndex: "n08",
        key: "n08",
      },
      {
        title: "Giá trị KH trả lại",
        dataIndex: "n09",
        key: "n09",
      },
      {
        title: "Giá trị nhập khác",
        dataIndex: "n10",
        key: "n10",
      },
      {
        title: "Giá trị kiểm kê tăng",
        dataIndex: "n11",
        key: "n11",
      },
      {
        title: "Tổng giá trị nhập kho",
        dataIndex: "n12",
        key: "n12",
      },
    ],
  },
  {
    title: "Xuất kho",
    children: [
      {
        title: "Trả lại NCC",
        dataIndex: "x01",
        key: "x01",
      },
      {
        title: "Giá trị trả lại NCC",
        dataIndex: "x02",
        key: "x02",
      },
      {
        title: "Xuất chuyển kho",
        dataIndex: "x03",
        key: "x03",
      },
      {
        title: "Giá trị xuất chuyển kho",
        dataIndex: "x04",
        key: "x04",
      },
      {
        title: "Xuất bán",
        dataIndex: "x05",
        key: "x05",
      },
      {
        title: "Giá trị xuất bán",
        dataIndex: "x06",
        key: "x06",
      },
      {
        title: "Xuất khác",
        dataIndex: "x07",
        key: "x07",
      },
      {
        title: "Giá trị xuất khác",
        dataIndex: "x08",
        key: "x08",
      },
      {
        title: "Kiểm kê giảm",
        dataIndex: "x09",
        key: "x09",
      },
      {
        title: "Giá trị kiểm kê giảm",
        dataIndex: "x10",
        key: "x10",
      },
      {
        title: "Tổng số lượng xuất kho",
        dataIndex: "x11",
        key: "x11",
      },
      {
        title: "Tổng giá trị xuất kho",
        dataIndex: "x12",
        key: "x12",
      },
    ],
  },
  {
    title: "Tồn kho",
    children: [
      {
        title: "SL vật tư dư đầu kì",
        dataIndex: "t13",
        key: "t13",
      },
      {
        title: "Giá trị vật tư dư đầu kì",
        dataIndex: "t14",
        key: "t14",
      },
      {
        title: "Tổng SL vật tư cuối kì",
        dataIndex: "t39",
        key: "t39",
      },
      {
        title: "Tổng giá trị vật tư dư đầu kì",
        dataIndex: "t40",
        key: "t40",
      },
      {
        title: "Tổng SL vật tư tồn kho tại thời điểm đến ngày",
        dataIndex: "t41",
        key: "t41",
      },
    ],
  },
].map((item) => {
  if (!item.children) {
    return {
      ...item,
      width: 120,
      render: (text: string | number | null) =>
        text && typeof text === "number" ? (
          <span>{formatCurrency(text)}</span>
        ) : (
          <span>{text}</span>
        ),
    };
  }
  item.children = item.children.map((child) => {
    return {
      ...child,
      width: 100,
      render: (text: string | number | null) =>
        text && typeof text === "number" ? (
          <span>{formatCurrency(text)}</span>
        ) : (
          <span>{text}</span>
        ),
    };
  });
  return item;
});
