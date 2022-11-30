interface AnnotationDataItem {
  key: number;
  name: string;
  description: string;
  formula: string;
}

interface AnnotationDataItems {
  key: number;
  name: string;
  data: AnnotationDataItem[];
}

export interface AnnotationData {
  data: AnnotationDataItems[];
  documentLink: string;
}

export const initialAnnotationOnline = {
  data: [
    {
      key: 1,
      name: "A. Doanh thu đơn tạo",
      data: [
        {
          key: 11,
          name: "A. DT ĐT tổng",
          description: "Tổng doanh thu của các đơn tạo trên tất cả nền tảng",
          formula: "A = A1 + A2 + A3 + A4 + A5",
        },
        {
          key: 12,
          name: "Số đơn",
          description: "Số lượng đơn tạo trên tất cả nền tảng",
          formula: "= Tổng đơn tạo - Tổng đơn trả",
        },
        {
          key: 13,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo",
          formula: "= Doanh thu đơn tạo tổng / Số đơn tạo tổng",
        },
        {
          key: 14,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo",
          formula: "= Tiền vốn/ Doanh thu đơn tạo",
        },

        {
          key: 15,
          name: "A1. DT ĐT Facebook",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Facebook",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 16,
          name: "Số Mess",
          description:
            "Số lần khách hàng bắt đầu cuộc trò chuyện đến trang Facebook qua bài quảng cáo",
          formula: "= Số lần click vào nút nhắn tin trong bài đăng quảng cáo Facebook",
        },
        {
          key: 17,
          name: "Chi phí/Số Mess",
          description: "Chi phí quảng cáo trung bình trên mỗi lần khách hàng bắt đầu trò chuyện",
          formula: "= Chi phí quảng cáo Facebook/ số Mess",
        },
        {
          key: 18,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Facebook",
          formula: "= Tổng đơn tạo - Tổng đơn trả",
        },
        {
          key: 19,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Facebook",
          formula: "= Doanh thu Facebook / số đơn Facebook",
        },
        {
          key: 20,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo trên tổng số lần khách hàng bắt đầu trò chuyện",
          formula: "= Số đơn Facebook/ Số mess Facebook",
        },
        {
          key: 21,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Facebook",
          formula: "= Tiền vốn đơn Facebook / Doanh thu Facebook",
        },
        {
          key: 22,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn tạo Facebook",
          formula: "= Chi phí Facebook Ads / Doanh thu Facebook",
        },
        {
          key: 23,
          name: "A2. DT ĐT TMĐT",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho TMĐT",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 24,
          name: "Traffic nội sàn",
          description:
            "Số lượt xem sản phẩm trong shop TMĐT, truy cập từ nguồn organic search trong sàn",
          formula: "",
        },
        {
          key: 25,
          name: "Traffic ngoại sàn",
          description:
            "Số lượt xem sản phẩm trong shop TMĐT, truy cập từ UTM link (Facebook ads) ngoài sàn",
          formula: "",
        },
        {
          key: 26,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho TMĐT",
          formula: "= Tổng đơn tạo - Tổng đơn trả",
        },
        {
          key: 27,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo TMĐT",
          formula: "= Doanh thu TMĐT / số đơn TMĐT",
        },
        {
          key: 28,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo TMĐT trên tổng số lượt xem nội và ngoại sàn",
          formula: "= Số đơn TMĐT / (Traffic nội sàn + Traffic ngoại sàn)",
        },
        {
          key: 29,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo TMĐT",
          formula: "= Tiền vốn đơn TMĐT / Doanh thu TMĐT",
        },
        {
          key: 30,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn tạo TMĐT",
          formula: "= (Chi phí nội sàn + Chi phí Ngoại sàn) / Doanh thu TMĐT",
        },
        {
          key: 31,
          name: "A3. DT ĐT Zalo",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Zalo",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 32,
          name: "Số data chăm sóc",
          description:
            "Số lượng khách hàng được chăm sóc trên Zalo trong khoảng thời gian được chọn.",
          formula: "",
        },
        {
          key: 33,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Zalo.",
          formula: "= Tổng đơn tạo - Tổng đơn trả",
        },
        {
          key: 34,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Zalo",
          formula: "= Doanh thu Zalo / số đơn Zalo",
        },
        {
          key: 35,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo Zalo trên tổng số lượng khách hàng chăm sóc",
          formula: "= Số đơn Zalo / Số data chăm sóc",
        },
        {
          key: 36,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Zalo",
          formula: "= Tiền vốn đơn Zalo / Doanh thu Zalo",
        },
        {
          key: 37,
          name: "A4. DT ĐT Tiktok",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Tiktok.",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 38,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Tiktok",
          formula: "= Tổng đơn tạo - Tổng đơn trả",
        },
        {
          key: 39,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Tiktok",
          formula: "= Doanh thu Tiktok / số đơn Tiktok",
        },
        {
          key: 40,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Tiktok",
          formula: "= Tiền vốn đơn Tiktok / Doanh thu Tiktok",
        },
        {
          key: 41,
          name: "A5. DT ĐT Web",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Web.",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm ",
        },
        {
          key: 42,
          name: "Traffic tự nhiên",
          description: "Số lượt truy cập trang web yody.vn từ các kênh tự nhiên",
          formula:
            "Traffic Tự nhiên = Channel Organic Search + Direct + Social + Referral + Email + Kênh khác (Affiliate)",
        },
        {
          key: 43,
          name: "Traffic quảng cáo",
          description: "Số lượt truy cập trang web yody.vn từ các kênh quảng cáo",
          formula: "Traffic Quảng cáo = Channel Paid Search + Display + Other",
        },
        {
          key: 44,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Web",
          formula: "= Tổng đơn tạo - Tổng đơn trả",
        },
        {
          key: 45,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Web",
          formula: "= Doanh thu Web / số đơn Web",
        },
        {
          key: 46,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo Web trên tổng số lượt truy cập website",
          formula: "= Số đơn Web / (Traffic tự nhiên + Traffic quảng cáo)",
        },
        {
          key: 47,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Web",
          formula: "= Tiền vốn đơn Web / Doanh thu Web",
        },
        {
          key: 48,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn tạo Web",
          formula: "= (Chi phí Google Ads + chi phí Facebook Ads) / Doanh thu Web",
        },
      ],
    },
    {
      key: 2,
      name: "B. Doanh thu đơn thành công",
      data: [
        {
          key: 11,
          name: "B. DT TC tổng",
          description: "Tổng doanh thu của các đơn thành công trên tất cả nền tảng",
          formula: "B = B1 + B2 + B3 + B4 + B5",
        },
        {
          key: 12,
          name: "Số đơn",
          description: "Số lượng đơn thành công trên tất cả nền tảng",
          formula: "= Tổng đơn thành công - Tổng đơn trả",
        },
        {
          key: 13,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công",
          formula: "= Doanh thu đơn thành công tổng / Số đơn thành công tổng",
        },
        {
          key: 14,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công",
          formula: "= Tiền vốn / Doanh thu đơn thành công",
        },
        {
          key: 15,
          name: "B1. DT TC Facebook",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Facebook",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm ",
        },
        {
          key: 16,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Facebook.",
          formula: "= Tổng đơn thành công - Tổng đơn trả",
        },
        {
          key: 17,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Facebook",
          formula: "= Doanh thu Facebook / Số đơn Facebook",
        },
        {
          key: 18,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Facebook",
          formula: "= Tiền vốn đơn Facebook / Doanh thu Facebook",
        },
        {
          key: 19,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn thành công Facebook.",
          formula: "= Chi phí Facebook Ads / Doanh thu Facebook",
        },
        {
          key: 20,
          name: "DT TC TMĐT",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho TMĐT",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 21,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho TMĐT.",
          formula: "= Tổng đơn thành công - Tổng đơn trả",
        },
        {
          key: 22,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công TMĐT",
          formula: "= Doanh thu TMĐT / Số đơn TMĐT",
        },
        {
          key: 23,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công TMĐT",
          formula: "= Tiền vốn đơn TMĐT / Doanh thu TMĐT",
        },
        {
          key: 24,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn thành công TMĐT",
          formula: "= (Chi phí nội sàn + Chi phí Ngoại sàn) / Doanh thu TMĐT",
        },
        {
          key: 25,
          name: "B3. DT TC Zalo",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Zalo",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 26,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Zalo.",
          formula: "= Tổng đơn thành công - Tổng đơn trả",
        },
        {
          key: 27,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Zalo.",
          formula: "= Doanh thu Zalo / Số đơn Zalo",
        },
        {
          key: 28,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Zalo.",
          formula: "= Tiền vốn đơn Zalo / Doanh thu Zalo",
        },
        {
          key: 29,
          name: "B4. DT TC Tiktok",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Tiktok",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 30,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Tiktok.",
          formula: "= Tổng đơn thành công - Tổng đơn trả",
        },
        {
          key: 31,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Tiktok.",
          formula: "= Doanh thu Tiktok / Số đơn Tiktok",
        },
        {
          key: 32,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Tiktok.",
          formula: "= Tiền vốn đơn Tiktok / Doanh thu Tiktok",
        },
        {
          key: 33,
          name: "B4. DT TC Web",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Web",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 34,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Web.",
          formula: "= Tổng đơn thành công - Tổng đơn trả",
        },
        {
          key: 35,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Web.",
          formula: "= Doanh thu Web / Số đơn Web",
        },
        {
          key: 36,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Web.",
          formula: "= Tiền vốn đơn Web / Doanh thu Web",
        },
        {
          key: 37,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn thành công Web.",
          formula: "= (Chi phí Google Ads + chi phí Facebook Ads) / Doanh thu Web",
        },
      ],
    },
    {
      key: 3,
      name: "D. NPS",
      data: [],
    },
    {
      key: 4,
      name: "G. Doanh thu theo khách hàng",
      data: [],
    },
  ],
  documentLink:
    "https://yody.atlassian.net/wiki/spaces/YODY/pages/387153921/Keydriver+Online+M+t+ch+s",
};

export const initialAnnotationOffline = {
  data: [
    {
      key: 1,
      name: "A. Doanh thu đơn tạo",
      data: [],
    },
    {
      key: 2,
      name: "B. Doanh thu đơn thành công",
      data: [],
    },
    {
      key: 3,
      name: "D. NPS",
      data: [],
    },
    {
      key: 4,
      name: "G. Doanh thu theo khách hàng",
      data: [],
    },
  ],
  documentLink:
    "https://yody.atlassian.net/wiki/spaces/YODY/pages/387153921/Keydriver+Online+M+t+ch+s",
};
