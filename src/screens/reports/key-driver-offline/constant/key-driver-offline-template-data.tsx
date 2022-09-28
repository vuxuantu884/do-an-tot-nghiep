import { KeyDriverField } from "model/report";

const {
  OfflineTotalSales,
  AverageCustomerSpent,
  AverageOrderValue,
  Visitors,
  ConvertionRate,
  CustomersCount,
  VipTotalSales,
  VipCalls,
  VipCallRate,
  NearVipTotalSales,
  NearVipCalls,
  NearVipCallRate,
  BirthdayTotalSales,
  BirthdayCallConversions,
  BirthdayCalls,
  BirthdayCallRate,
  BirthdaySmsConversions,
  BirthdaySmss,
  BirthdaySmsRate,
  CustomerGt90DaysTotalSales,
  CustomerSmss,
  CustomerSmsRate,
  ShopperGt90DaysTotalSales,
  ShoperSmss,
  ShoperSmsRate,
  NewTotalSales,
  PotentialCustomerCount,
  NewCustomersConversionRate,
  OthersTotalSales,
  FacebookTotalSales,
  ZaloSotalSales,
  UniformTotalSales,
  FollowFanpage,
  UniformOnlineTotalSales,
  ProductTotalSales,
  Profit,
  RevenueSuccess,
  Cost,
  Shipping,
} = KeyDriverField;

export const keyDriverOfflineTemplateData: readonly any[] = [
  {
    key: "total_sales",
    name: "Doanh thu",
    method:
      "Doanh thu = Doanh thu bán lẻ + Doanh thu bán hàng Facebook + Doanh thu bán hàng Zalo + Doanh thu đơn đồng phục",
    children: [
      {
        key: OfflineTotalSales,
        name: "Doanh thu bán lẻ",
        method: "Doanh thu bán lẻ",
        children: [
          {
            key: AverageCustomerSpent,
            name: "GTTB / Khách mua",
          },
          {
            key: AverageOrderValue,
            name: "GTTB / Hoá đơn",
          },
          {
            key: Visitors,
            name: "Khách vào",
          },
          {
            key: ConvertionRate,
            name: "Tỷ lệ chuyển đổi",
            suffix: "%",
          },
          {
            key: CustomersCount,
            name: "Tổng khách mua",
            children: [
              {
                key: VipTotalSales,
                name: "VIP",
                method: "(Khách hàng VIP S,G,R,D tích lũy > 10 triệu)",
                children: [
                  {
                    key: VipCalls,
                    name: "Số cuộc gọi đi",
                    method: "",
                  },
                  {
                    key: VipCallRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: NearVipTotalSales,
                name: "Cận VIP",
                method: "(Khách hàng từ 3 - <10 triệu)",
                children: [
                  {
                    key: NearVipCalls,
                    name: "Số cuộc gọi đi",
                    method: "",
                  },
                  {
                    key: NearVipCallRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: BirthdayTotalSales,
                name: "Sinh nhật",
                method: "(Là khách hàng có sinh nhật trong tháng ko bao gồm VIP và Cận VIP)",
                children: [
                  {
                    key: BirthdayCallConversions,
                    name: "Số khách mua từ cuộc gọi",
                    method: "Số khách mua từ cuộc gọi",
                    children: [
                      {
                        key: BirthdayCalls,
                        name: "Số cuộc gọi đi",
                        method: "",
                      },
                      {
                        key: BirthdayCallRate,
                        name: "Tỷ lệ chuyển đổi",
                        method: "",
                        suffix: "%",
                      },
                    ],
                  },
                  {
                    key: BirthdaySmsConversions,
                    name: "Số khách mua từ SMS",
                    method: "Số khách mua từ SMS",
                    children: [
                      {
                        key: BirthdaySmss,
                        name: "Số tin nhắn SMS đi",
                        method: "",
                      },
                      {
                        key: BirthdaySmsRate,
                        name: "Tỷ lệ chuyển đổi",
                        method: "",
                        suffix: "%",
                      },
                    ],
                  },
                ],
              },
              {
                key: CustomerGt90DaysTotalSales,
                name: "Customer",
                method: "(KH mua 2 lần trở lên, > 90 ngày chưa mua, 3TR > tích lũy >= 200k)",
                children: [
                  {
                    key: CustomerSmss,
                    name: "Số tin nhắn SMS đi",
                    method: "",
                  },
                  {
                    key: CustomerSmsRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: ShopperGt90DaysTotalSales,
                name: "Shoper",
                method: "(KH mua 1 lần, > 90 ngày chưa mua, 3TR > tích lũy >= 200k)",
                children: [
                  {
                    key: ShoperSmss,
                    name: "Số tin nhắn SMS đi",
                    method: "",
                  },
                  {
                    key: ShoperSmsRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: NewTotalSales,
                name: "Mới",
                method: "(Là data mới toanh)",
                children: [
                  {
                    key: PotentialCustomerCount,
                    name: "Data KH tiềm năng",
                    method: "",
                  },
                  {
                    key: NewCustomersConversionRate,
                    name: "Tỷ lệ chuyển đổi",
                    method: "",
                    suffix: "%",
                  },
                ],
              },
              {
                key: OthersTotalSales,
                name: "KH còn lại",
                method: "(là KH còn lại ko nằm trong các tệp trên)",
              },
            ],
          },
        ],
      },
      {
        key: FacebookTotalSales,
        name: "Doanh thu online Facebook",
      },
      {
        key: ZaloSotalSales,
        name: "Doanh thu online Zalo",
      },
      {
        key: UniformTotalSales,
        name: "Doanh thu đơn đồng phục",
      },
      {
        key: FollowFanpage,
        name: "Lượt follow fanpage",
      },
      {
        key: UniformOnlineTotalSales,
        name: "Doanh thu đóng hàng online",
      },
      // {
      //   name: "Doanh thu giao hàng 4h",
      //   method: "Tính năng đang phát triển",
      // },
    ],
  },
  {
    key: ProductTotalSales,
    name: "Doanh thu theo sản phẩm",
    method: "Doanh thu theo sản phẩm",
    children: [],
  },
  {
    key: Profit,
    name: "Lợi nhuận",
    method: "Lợi nhuận",
    children: [
      {
        key: RevenueSuccess,
        name: "Doanh thu thành công",
        method: "Doanh thu thành công",
      },
      {
        key: Cost,
        name: "Giá vốn",
        method: "Giá vốn",
      },
      {
        key: Shipping,
        name: "Phí thu báo khách của các đơn thành công",
        method: "Phí thu báo khách của các đơn thành công",
      },
    ],
  },
];

export const ASM_LIST = ["ASM Dương Sơn Tùng", "ASM Nguyễn Văn Ánh", "ASM Đỗ Quang Hiếu"];

export const loadingMessage =
  "Dữ liệu đang được đưa lên báo cáo, có thể mất vài phút để hiển thị. Quý khách vui lòng chờ hệ thống xử lý.";
