import { KeyDriverField } from "model/report";

export const keyDriverOfflineTemplateData: readonly any[] = [
  {
    key: "total_sales",
    name: "Doanh thu",
    method:
      "Doanh thu = Doanh thu bán lẻ + Doanh thu bán hàng Facebook + Doanh thu bán hàng Zalo + Doanh thu đơn đồng phục",
    children: [
      {
        key: "offline_total_sales",
        name: "Doanh thu bán lẻ",
        method: "Doanh thu bán lẻ",
        children: [
          {
            key: "average_customer_spent",
            name: "GTTB / Khách mua",
          },
          {
            key: "average_order_value",
            name: "GTTB / Hoá đơn",
          },
          {
            key: "visitors",
            name: "Khách vào",
          },
          {
            key: "convertion_rate",
            name: "Tỷ lệ chuyển đổi",
            suffix: "%",
          },
          {
            key: "customers_count",
            name: "Tổng khách mua",
            children: [
              {
                key: "vip_total_sales",
                name: "VIP",
                method: "(Khách hàng VIP S,G,R,D tích lũy > 10 triệu)",
                children: [
                  {
                    key: "vip_calls",
                    name: "Số cuộc gọi đi",
                    method: "",
                  },
                  {
                    key: KeyDriverField.VipCallRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: "near_vip_total_sales",
                name: "Cận VIP",
                method: "(Khách hàng từ 3 - <10 triệu)",
                children: [
                  {
                    key: "near_vip_calls",
                    name: "Số cuộc gọi đi",
                    method: "",
                  },
                  {
                    key: KeyDriverField.NearVipCallRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: "birthday_total_sales",
                name: "Sinh nhật",
                method: "(Là khách hàng có sinh nhật trong tháng ko bao gồm VIP và Cận VIP)",
                children: [
                  {
                    key: KeyDriverField.BirthdayCallConversions,
                    name: "Số khách mua từ cuộc gọi",
                    method: "Số khách mua từ cuộc gọi",
                    children: [
                      {
                        key: "birthday_calls",
                        name: "Số cuộc gọi đi",
                        method: "",
                      },
                      {
                        key: KeyDriverField.BirthdayCallRate,
                        name: "Tỷ lệ chuyển đổi",
                        method: "",
                        suffix: "%",
                      },
                    ],
                  },
                  {
                    key: KeyDriverField.BirthdaySmsConversions,
                    name: "Số khách mua từ SMS",
                    method: "Số khách mua từ SMS",
                    children: [
                      {
                        key: "birthday_smss",
                        name: "Số tin nhắn SMS đi",
                        method: "",
                      },
                      {
                        key: KeyDriverField.BirthdaySmsRate,
                        name: "Tỷ lệ chuyển đổi",
                        method: "",
                        suffix: "%",
                      },
                    ],
                  },
                ],
              },
              {
                key: "customer_gt90_days_total_sales",
                name: "Customer",
                method: "(KH mua 2 lần trở lên, > 90 ngày chưa mua, 3TR > tích lũy >= 200k)",
                children: [
                  {
                    key: "customer_smss",
                    name: "Số tin nhắn SMS đi",
                    method: "",
                  },
                  {
                    key: KeyDriverField.CustomerSmsRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: "shopper_gt90_days_total_sales",
                name: "Shoper",
                method: "(KH mua 1 lần, > 90 ngày chưa mua, 3TR > tích lũy >= 200k)",
                children: [
                  {
                    key: "shoper_smss",
                    name: "Số tin nhắn SMS đi",
                    method: "",
                  },
                  {
                    key: KeyDriverField.ShoperSmsRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: KeyDriverField.NewTotalSales,
                name: "Mới",
                method: "(Là data mới toanh)",
                children: [
                  {
                    key: KeyDriverField.PotentialCustomerCount,
                    name: "Data KH tiềm năng",
                    method: "",
                  },
                  {
                    key: KeyDriverField.NewCustomersConversionRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: KeyDriverField.OthersTotalSales,
                name: "KH còn lại",
                method: "(là KH còn lại ko nằm trong các tệp trên)",
              },
            ],
          },
        ],
      },
      {
        key: "facebook_total_sales",
        name: "Doanh thu online Facebook",
      },
      {
        key: "zalo_total_sales",
        name: "Doanh thu online Zalo",
      },
      {
        key: "uniform_total_sales",
        name: "Doanh thu đơn đồng phục",
      },
      {
        key: KeyDriverField.FacebookFollows,
        name: "Lượt follow fanpage",
      },
      {
        key: KeyDriverField.UniformOnlineTotalSales,
        name: "Doanh thu đóng hàng online",
      },
      // {
      //   name: "Doanh thu giao hàng 4h",
      //   method: "Tính năng đang phát triển",
      // },
    ],
  },
  {
    key: KeyDriverField.ProductTotalSales,
    name: "Doanh thu theo sản phẩm",
    method: "Doanh thu theo sản phẩm",
    children: [],
  },
  {
    key: KeyDriverField.Profit,
    name: "Lợi nhuận",
    method: "Lợi nhuận",
    children: [
      {
        key: KeyDriverField.RevenueSuccess,
        name: "Doanh thu thành công",
        method: "Doanh thu thành công",
      },
      {
        key: KeyDriverField.Cost,
        name: "Giá vốn",
        method: "Giá vốn",
      },
      {
        key: KeyDriverField.Shipping,
        name: "Phí thu báo khách của các đơn thành công",
        method: "Phí thu báo khách của các đơn thành công",
      },
    ],
  },
];

export const ASM_LIST = ["ASM Dương Sơn Tùng", "ASM Nguyễn Văn Ánh", "ASM Đỗ Quang Hiếu"];

export const loadingMessage =
  "Dữ liệu đang được đưa lên báo cáo, có thể mất vài phút để hiển thị. Quý khách vui lòng chờ hệ thống xử lý.";
