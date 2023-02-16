import moment from "moment";
import { formatCurrency } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";

export const sellingPowerReportColumns = (selectedDate: string): any[] => {
  const { DDMM, YYYYMMDD } = DATE_FORMAT;
  const date = selectedDate || moment().subtract(1, "days").format(YYYYMMDD);
  return [
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
      title: "Nhóm hàng",
      dataIndex: "product_group_level1",
      key: "product_group_level1",
      fixed: "left",
    },
    {
      title: "Danh mục sản phẩm",
      dataIndex: "product_group_level2",
      key: "product_group_level2",
      fixed: "left",
      width: 150,
    },
    {
      title: "Mã 3",
      dataIndex: "sku3",
      key: "sku3",
    },
    {
      title: "Mã 7",
      dataIndex: "sku7",
      key: "sku7",
    },
    {
      title: "Mã 13",
      dataIndex: "sku13",
      key: "sku13",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Tồn hiện tại",
      dataIndex: "current_stock",
      key: "current_stock",
      width: 150,
    },
    {
      title: "Giá vốn",
      dataIndex: "cost_price",
      key: "cost_price",
      width: 150,
    },
    {
      title: "Giá bán",
      dataIndex: "retail_price",
      key: "retail_price",
      width: 150,
    },
    {
      title: "Giá trị tồn theo giá bán",
      dataIndex: "stock_value_vy_current_stock",
      key: "stock_value_vy_current_stock",
      width: 160,
    },
    {
      title: "Tỷ lệ tồn (%)",
      dataIndex: "stock_percent_by_value",
      key: "stock_percent_by_value",
      width: 150,
      unit: "%",
    },
    {
      title: "SLSP bán 7 ngày",
      dataIndex: "total_quantity7",
      key: "total_quantity7",
      width: 150,
    },
    {
      title: "Doanh thu 7 ngày",
      dataIndex: "total_after_discount",
      key: "total_after_discount",
      width: 150,
    },
    {
      title: "Số lượng bán TB/ ngày",
      dataIndex: "average_sale",
      key: "average_sale",
      width: 170,
    },
    {
      title: "Ngày bán còn lại",
      dataIndex: "expected_days",
      key: "expected_days",
      width: 150,
    },
    {
      title: "Tổng hàng còn về",
      dataIndex: "quantity_order",
      key: "quantity_order",
      width: 150,
    },
    {
      title: "Hàng về đến cuối tháng",
      dataIndex: "quantity_order_month",
      key: "quantity_order_month",
      width: 170,
    },
    {
      title: "Tồn HT",
      children: [
        {
          title: "Miền Bắc 1",
          dataIndex: "ton_ht_mb1",
          key: "ton_ht_mb1",
        },
        {
          title: "Miền Bắc 2",
          dataIndex: "ton_ht_mb2",
          key: "ton_ht_mb2",
        },
        {
          title: "Miền Trung",
          dataIndex: "ton_ht_mt",
          key: "ton_ht_mt",
        },
        {
          title: "Miền Nam",
          dataIndex: "ton_ht_mn",
          key: "ton_ht_mn",
        },
      ],
    },
    {
      title: "Bán 14 ngày",
      children: [
        {
          title: "Miền Bắc 1",
          dataIndex: "sale_quantity14_mb1",
          key: "sale_quantity14_mb1",
        },
        {
          title: "Miền Bắc 2",
          dataIndex: "sale_quantity14_mb2",
          key: "sale_quantity14_mb2",
        },
        {
          title: "Miền Trung",
          dataIndex: "sale_quantity14_mt",
          key: "sale_quantity14_mt",
        },
        {
          title: "Miền Nam",
          dataIndex: "sale_quantity14_mn",
          key: "sale_quantity14_mn",
        },
      ],
    },
    {
      title: "Số ngày bán còn lại",
      children: [
        {
          title: "Miền Bắc 1",
          dataIndex: "remaining_sales_days_mb1",
          key: "remaining_sales_days_mb1",
        },
        {
          title: "Miền Bắc 2",
          dataIndex: "remaining_sales_days_mb2",
          key: "remaining_sales_days_mb2",
        },
        {
          title: "Miền Trung",
          dataIndex: "remaining_sales_days_mt",
          key: "remaining_sales_days_mt",
        },
        {
          title: "Miền Nam",
          dataIndex: "remaining_sales_days_mn",
          key: "remaining_sales_days_mn",
        },
      ],
    },
    {
      title: "Số lượng hàng bán thành công 7 ngày",
      children: [
        {
          title: `${moment(date, YYYYMMDD).subtract(6, "days").format(DDMM)}`,
          dataIndex: "sale_quantity7",
          key: "sale_quantity7",
        },
        {
          title: `${moment(date, YYYYMMDD).subtract(5, "days").format(DDMM)}`,
          dataIndex: "sale_quantity6",
          key: "sale_quantity6",
        },
        {
          title: `${moment(date, YYYYMMDD).subtract(4, "days").format(DDMM)}`,
          dataIndex: "sale_quantity5",
          key: "sale_quantity5",
        },
        {
          title: `${moment(date, YYYYMMDD).subtract(3, "days").format(DDMM)}`,
          dataIndex: "sale_quantity4",
          key: "sale_quantity4",
        },
        {
          title: `${moment(date, YYYYMMDD).subtract(2, "days").format(DDMM)}`,
          dataIndex: "sale_quantity3",
          key: "sale_quantity3",
        },
        {
          title: `${moment(date, YYYYMMDD).subtract(1, "days").format(DDMM)}`,
          dataIndex: "sale_quantity2",
          key: "sale_quantity2",
        },
        {
          title: `${moment(date, YYYYMMDD).format(DDMM)}`,
          dataIndex: "sale_quantity1",
          key: "sale_quantity1",
        },
      ],
    },
  ].map((item: any) => {
    if (item.children) {
      item.children = item.children.map((child: any) => {
        return {
          ...child,
          width: child.width ? child.width : 120,
          className: "text-center",
          render: (text: string | number | null, row: any) => {
            return (text && typeof text === "number") || text === 0 ? (
              child.unit !== "%" ? (
                <span className={row.className}>{formatCurrency(text) ?? "--"}</span>
              ) : (
                <span className={row.className}>
                  {+text.toFixed(2)}
                  {child.unit}
                </span>
              )
            ) : (
              <span className={row.className}>{text ?? "--"}</span>
            );
          },
        };
      });
    } else {
      return {
        ...item,
        width: item.width ? item.width : 120,
        className: "text-center",
        render: (text: string | number | null, row: any) => {
          return (text && typeof text === "number") || text === 0 ? (
            item.unit !== "%" ? (
              <span className={row.className}>{formatCurrency(text) ?? "--"}</span>
            ) : (
              <span className={row.className}>
                {+text.toFixed(2)}
                {item.unit}
              </span>
            )
          ) : (
            <span className={row.className}>{text ?? "--"}</span>
          );
        },
      };
    }
    return item;
  });
};
