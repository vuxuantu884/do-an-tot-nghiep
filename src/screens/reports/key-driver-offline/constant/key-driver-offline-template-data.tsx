export const keyDriverOfflineTemplateData = [
  {
    key: "total_sales",
    name: "Doanh thu",
    method:
      "Doanh thu = Doanh thu bán lẻ + Doanh thu bán hàng facebook + Doanh thu bán hàng Zalo + Doanh thu đơn đồng phục",
    COMPANY_month: "",
    COMPANY_accumulatedMonth: "",
    COMPANY_rateMonth: "",
    COMPANY_targetMonth: "",
    COMPANY_day: "",
    COMPANY_actualDay: "",
    COMPANY_rateDay: "",
    children: [
      {
        key: "offline_total_sales",
        name: "Doanh thu bán lẻ",
        method: "Doanh thu bán lẻ",
        COMPANY_month: "",
        COMPANY_accumulatedMonth: "",
        COMPANY_rateMonth: "",
        COMPANY_targetMonth: "",
        COMPANY_day: "",
        COMPANY_actualDay: "",
        COMPANY_rateDay: "",
        children: [
          {
            key: "average_customer_spent",
            name: "GTTB/KHÁCH MUA",
            COMPANY_month: "",
            COMPANY_accumulatedMonth: "",
            COMPANY_rateMonth: "",
            COMPANY_targetMonth: "",
            COMPANY_day: "",
            COMPANY_actualDay: "",
            COMPANY_rateDay: "",
          },
          {
            key: "average_order_value",
            name: "GTTB/HOÁ ĐƠN",
            COMPANY_month: "",
            COMPANY_accumulatedMonth: "",
            COMPANY_rateMonth: "",
            COMPANY_targetMonth: "",
            COMPANY_day: "",
            COMPANY_actualDay: "",
            COMPANY_rateDay: "",
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
            COMPANY_month: "",
            COMPANY_accumulatedMonth: "",
            COMPANY_rateMonth: "",
            COMPANY_targetMonth: "",
            COMPANY_day: "",
            COMPANY_actualDay: "",
            COMPANY_rateDay: "",
            children: [
              {
                key: "vip_total_sales",
                name: "Vip",
                method: "(Khách hàng VIP S,G,R,D tích lũy > 10 triệu)"
              },
              {
                key: "near_vip_total_sales",
                name: "Cận Vip",
                method: "(Khách hàng từ 3 - <10 triệu)"
              },
              {
                key: "birthday_total_sales",
                name: "SINH NHẬT",
                method: "(Là khách hàng có sinh nhật trong tháng ko bao gồm VIP và CẬN VIP)"
              },
              {
                key: "customer_gt90_days_total_sales",
                name: "CUSTOMER",
                method: "(KH mua 2 lần trở lên, > 90 ngày chưa mua, tích lũy > 500k)"
              },
              {
                key: "shopper_gt90_days_total_sales",
                name: "SHOPER",
                method: "(KH mua 1 lần, > 90 ngày, tích lũy > 200k)"
              },
              {
                key: "new_customer_total_sales",
                name: "MỚI",
                method: "(Là data mới toanh)"
              },
              {
                key: "others_total_sales",
                name: "KH CÒN LẠI",
                method: "(là KH còn lại ko nằm trong các tệp trên)"
              },
            ],
          },
        ],
      },
      {
        key: "facebook_total_sales",
        name: "Doanh thu bán hàng online facebook",
        COMPANY_month: "",
        COMPANY_accumulatedMonth: "",
        COMPANY_rateMonth: "",
        COMPANY_targetMonth: "",
        COMPANY_day: "",
        COMPANY_actualDay: "",
        COMPANY_rateDay: "",
      },
      {
        key: "zalo_total_sales",
        name: "Doanh thu bán hàng online Zalo",
        COMPANY_month: "",
        COMPANY_accumulatedMonth: "",
        COMPANY_rateMonth: "",
        COMPANY_targetMonth: "",
        COMPANY_day: "",
        COMPANY_actualDay: "",
        COMPANY_rateDay: "",
      },
      {
        key: "uniform_total_sales",
        name: "Doanh thu đơn đồng phục",
        COMPANY_month: "",
        COMPANY_accumulatedMonth: "",
        COMPANY_rateMonth: "",
        COMPANY_targetMonth: "",
        COMPANY_day: "",
        COMPANY_actualDay: "",
        COMPANY_rateDay: "",
      },
      {
        key: 'uniform_online_total_sales',
        name: "Doanh thu Đóng hàng Online",
        COMPANY_month: "",
        COMPANY_accumulatedMonth: "",
        COMPANY_rateMonth: "",
        COMPANY_targetMonth: "",
        COMPANY_day: "",
        COMPANY_actualDay: "",
        COMPANY_rateDay: "",
      },
      {
        name: "Doanh thu Giao hàng 4h",
        COMPANY_month: "",
        COMPANY_accumulatedMonth: "",
        COMPANY_rateMonth: "",
        COMPANY_targetMonth: "",
        COMPANY_day: "",
        COMPANY_actualDay: "",
        COMPANY_rateDay: "",
      },
    ],
  },
];

export const ASM_LIST = [
  'ASM Dương Sơn Tùng',
  'ASM Nguyễn Văn Ánh',
  'ASM Đỗ Quang Hiếu'
]
