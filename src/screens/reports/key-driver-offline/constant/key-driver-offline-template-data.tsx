import { KeyDriverField } from "model/report";

export const keyDriverOfflineTemplateData = [
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
                    key: "vip_call_conversion_rate",
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
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
                    key: "near_vip_call_conversion_rate",
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                  },
                ],
              },
              {
                key: "birthday_total_sales",
                name: "SINH NHẬT",
                method: "(Là khách hàng có sinh nhật trong tháng ko bao gồm VIP và CẬN VIP)",
                children: [
                  {
                    key: "birthday_call_customers",
                    name: "SỐ LƯỢNG KHÁCH HÀNG MUA TỪ TỔNG ĐÀI",
                    method: "",
                    children: [
                      {
                        key: "birthday_calls",
                        name: "SỐ CUỘC GỌI RA TỪ TỔNG ĐÀI",
                        method: "",
                      },
                      {
                        key: "birthday_call_conversion_rate",
                        name: "TỶ LỆ CHUYỂN ĐỔI",
                        method: "",
                      },
                    ],
                  },
                  {
                    key: "birthday_sms_customers",
                    name: "SỐ LƯỢNG KHÁCH HÀNG MUA TỪ TỔNG ĐÀI",
                    method: "",
                    children: [
                      {
                        key: "birthday_sms",
                        name: "SỐ CUỘC GỌI RA TỪ TỔNG ĐÀI",
                        method: "",
                      },
                      {
                        key: "birthday_sms_conversion_rate",
                        name: "TỶ LỆ CHUYỂN ĐỔI",
                        method: "",
                      },
                    ],
                  },
                ],
              },
              {
                key: "customer_gt90_days_total_sales",
                name: "CUSTOMER",
                method: "(KH mua 2 lần trở lên, > 90 ngày chưa mua, tích lũy > 500k)",
                children: [
                  {
                    key: "customer_sms",
                    name: "SỐ LƯỢNG SMS ĐI TIN",
                    method: "",
                  },
                  {
                    key: "customer_sms_conversion_rate",
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                  },
                ],
              },
              {
                key: "shopper_gt90_days_total_sales",
                name: "SHOPER",
                method: "(KH mua 1 lần, > 90 ngày, tích lũy > 200k)",
                children: [
                  {
                    key: "shoper_sms",
                    name: "SỐ LƯỢNG SMS ĐI TIN",
                    method: "",
                  },
                  {
                    key: "shoper_sms_conversion_rate",
                    name: "TỶ LỆ CHUYỂN ĐỔI",
                    method: "",
                  },
                ],
              },
              {
                key: "new_customer_total_sales",
                name: "MỚI",
                method: "(Là data mới toanh)",
              },
              {
                key: "others_total_sales",
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
