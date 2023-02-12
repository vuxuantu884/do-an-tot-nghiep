import { formatCurrency } from "utils/AppUtils";

export const inventoryBalanceColumns: any[] = [
  {
    title: "STT",
    dataIndex: "no",
    key: "no",
    fixed: "left",
    width: 60,
    render: (text: string | number | null, row: any) => {
      return <span className={row.className}>{text}</span>;
    },
  },
  {
    title: "Phiên bản",
    children: [
      {
        title: "Mã SKU",
        dataIndex: "sku_code",
        key: "sku_code",
        fixed: "left",
      },
      {
        title: "Tên SKU",
        dataIndex: "sku_name",
        key: "sku_name",
        fixed: "left",
        width: 150,
      },
    ],
  },
  {
    title: "Kho",
    dataIndex: "store",
    key: "store",
    fixed: "left",
  },
  {
    title: "Danh mục",
    dataIndex: "product_group_leve1",
    key: "product_group_leve1",
    width: 150,
  },
  {
    title: "Tên sản phẩm",
    dataIndex: "product_group_leve2",
    key: "product_group_leve2",
    width: 150,
  },
  {
    title: "Màu",
    dataIndex: "name_color",
    key: "name_color",
  },
  {
    title: "Size",
    dataIndex: "name_size",
    key: "name_size",
    width: 40,
  },
  {
    title: "Mã vạch",
    dataIndex: "name_barcode",
    key: "name_barcode",
  },
  {
    title: "ĐVT",
    dataIndex: "name_currency",
    key: "name_currency",
    width: 70,
  },
  {
    title: "Giá vốn",
    dataIndex: "cost_price",
    key: "cost_price",
    align: "right",
  },
  {
    title: "Giá bán",
    dataIndex: "retail_price",
    key: "retail_price",
    align: "right",
  },
  {
    title: "Số dư đầu kì",
    children: [
      {
        title: "Số lượng",
        dataIndex: "t13",
        key: "t13",
        align: "right",
        width: 150,
      },
      {
        title: "Giá trị",
        dataIndex: "t14",
        key: "t14",
        align: "right",
      },
    ],
  },
  {
    title: "Nhập kho",
    children: [
      {
        title: "Nhập mua từ nhà cung cấp",
        dataIndex: "n01",
        key: "n01",
        align: "right",
        width: 180,
      },
      {
        title: "Giá trị mua từ nhà cung cấp",
        dataIndex: "n07",
        key: "n07",
        align: "right",
        width: 190,
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
    title: "Xuất kho",
    children: [
      {
        title: "Trả lại nhà cung cấp",
        dataIndex: "x01",
        key: "x01",
        align: "right",
        width: 160,
      },
      {
        title: "Giá trị trả lại nhà cung cấp",
        dataIndex: "x02",
        key: "x02",
        align: "right",
        width: 180,
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
    title: "Dư cuối kì",
    children: [
      {
        title: "Số lượng",
        dataIndex: "t39",
        key: "t39",
        align: "right",
        width: 115,
      },
      {
        title: "Giá trị",
        dataIndex: "t40",
        key: "t40",
        align: "right",
        width: 115,
      },
    ],
  },
  {
    title: "Tồn kho tại thời điểm",
    dataIndex: "t41",
    key: "t41",
    align: "right",
    width: 150,
  },
].map((item: any) => {
  if (item.children) {
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
  }
  return {
    ...item,
    width: item.width ? item.width : 120,
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
