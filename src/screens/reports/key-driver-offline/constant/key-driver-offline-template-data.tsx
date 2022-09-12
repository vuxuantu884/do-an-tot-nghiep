import { KeyDriverField } from "model/report";

export const keyDriverOfflineTemplateData: readonly any[] = [
  {
    key: "total_sales",
    name: "Doanh thu",
    method:
      "Doanh thu = Doanh thu bán lẻ + Doanh thu bán hàng facebook + Doanh thu bán hàng Zalo + Doanh thu đơn đồng phục",
    children: [
      {
        key: "offline_total_sales",
        name: "Doanh thu bán lẻ",
        method: "Doanh thu bán lẻ",
        children: [
          {
            key: "average_customer_spent",
            name: "GTTB/KHÁCH MUA",
          },
          {
            key: "average_order_value",
            name: "GTTB/HOÁ ĐƠN",
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
                name: "Vip",
                method: "(Khách hàng VIP S,G,R,D tích lũy > 10 triệu)",
                children: [
                  {
                    key: "vip_calls",
                    name: "SỐ CUỘC GỌI RA TỪ TỔNG ĐÀI",
                    method: "",
                  },
                  {
                    key: KeyDriverField.VipCallRate,
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: "near_vip_total_sales",
                name: "Cận Vip",
                method: "(Khách hàng từ 3 - <10 triệu)",
                children: [
                  {
                    key: "near_vip_calls",
                    name: "SỐ CUỘC GỌI RA TỪ TỔNG ĐÀI",
                    method: "",
                  },
                  {
                    key: KeyDriverField.NearVipCallRate,
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: "birthday_total_sales",
                name: "SINH NHẬT",
                method: "(Là khách hàng có sinh nhật trong tháng ko bao gồm VIP và CẬN VIP)",
                children: [
                  {
                    key: KeyDriverField.BirthdayCallConversions,
                    name: "SỐ LƯỢNG KHÁCH HÀNG MUA TỪ TỔNG ĐÀI",
                    method: "SỐ LƯỢNG KHÁCH HÀNG MUA TỪ TỔNG ĐÀI",
                    children: [
                      {
                        key: "birthday_calls",
                        name: "SỐ CUỘC GỌI RA TỪ TỔNG ĐÀI",
                        method: "",
                      },
                      {
                        key: KeyDriverField.BirthdayCallRate,
                        name: "TỶ LỆ CHUYỂN ĐỔI",
                        method: "",
                        suffix: "%",
                      },
                    ],
                  },
                  {
                    key: KeyDriverField.BirthdaySmsConversions,
                    name: "SỐ LƯỢNG KHÁCH HÀNG MUA TỪ TỔNG ĐÀI",
                    method: "SỐ LƯỢNG KHÁCH HÀNG MUA TỪ TỔNG ĐÀI",
                    children: [
                      {
                        key: "birthday_smss",
                        name: "SỐ CUỘC GỌI RA TỪ TỔNG ĐÀI",
                        method: "",
                      },
                      {
                        key: KeyDriverField.BirthdaySmsRate,
                        name: "TỶ LỆ CHUYỂN ĐỔI",
                        method: "",
                        suffix: "%",
                      },
                    ],
                  },
                ],
              },
              {
                key: "customer_gt90_days_total_sales",
                name: "CUSTOMER",
                method: "(KH mua 2 lần trở lên, > 90 ngày chưa mua, 3TR > tích lũy >= 200k)",
                children: [
                  {
                    key: "customer_smss",
                    name: "SỐ LƯỢNG SMS ĐI TIN",
                    method: "",
                  },
                  {
                    key: KeyDriverField.CustomerSmsRate,
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: "shopper_gt90_days_total_sales",
                name: "SHOPER",
                method: "(KH mua 1 lần, > 90 ngày chưa mua, 3TR > tích lũy >= 200k)",
                children: [
                  {
                    key: "shoper_smss",
                    name: "SỐ LƯỢNG SMS ĐI TIN",
                    method: "",
                  },
                  {
                    key: KeyDriverField.ShoperSmsRate,
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: KeyDriverField.NewTotalSales,
                name: "MỚI",
                method: "(Là data mới toanh)",
                children: [
                  {
                    key: KeyDriverField.PotentialCustomerCount,
                    name: "DATA K/H TIỀM NĂNG",
                    method: "",
                  },
                  {
                    key: KeyDriverField.NewCustomersConversionRate,
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: KeyDriverField.OthersTotalSales,
                name: "KH CÒN LẠI",
                method: "(là KH còn lại ko nằm trong các tệp trên)",
              },
            ],
          },
        ],
      },
      {
        key: "facebook_total_sales",
        name: "Doanh thu bán hàng online facebook",
      },
      {
        key: "zalo_total_sales",
        name: "Doanh thu bán hàng online Zalo",
      },
      {
        key: "uniform_total_sales",
        name: "Doanh thu đơn đồng phục",
      },
      {
        key: KeyDriverField.FacebookFollows,
        name: "LƯỢT FOLLOW FANPAGE",
      },
      {
        key: KeyDriverField.UniformOnlineTotalSales,
        name: "Doanh thu Đóng hàng Online",
      },
      {
        name: "Doanh thu Giao hàng 4h",
        method: "Tính năng đang phát triển",
      },
    ],
  },
  {
    key: KeyDriverField.ProductTotalSales,
    name: "Doanh thu theo sản phẩm",
    children: [],
  },
];

export const ASM_LIST = ["ASM Dương Sơn Tùng", "ASM Nguyễn Văn Ánh", "ASM Đỗ Quang Hiếu"];

export const loadingMessage =
  "Dữ liệu đang được đưa lên báo cáo, có thể mất vài phút để hiển thị. Quý khách vui lòng chờ hệ thống xử lý.";
