interface AnnotationDataItem {
  key: number;
  name: string;
  normalize: string;
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

const annotationOnline = {
  data: [
    {
      key: 1,
      name: "A. Doanh thu đơn tạo",
      data: [
        {
          key: 1,
          name: "A. DT ĐT tổng",
          description:
            '<span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Tổng doanh thu của các đơn tạo trên tất cả nền\n                                tảng.</span>',
          formula:
            '\n                    <p data-renderer-start-pos="2123"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">A = A1 + A2 + A3 + A4 + A5</span></p>\n                    <p data-renderer-start-pos="2151"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Doanh thu = Tổng bán - tổng chiết khấu - tiêu điểm\n                                - tổng trả + hoàn điểm</span></p>\n                    <p data-renderer-start-pos="2226"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn\n                                hàng:</span></p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="2282"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Khách\n                                        huỷ</span></p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="2295"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Hệ thống\n                                        huỷ</span></p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="2311"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">HVC\n                                        huỷ</span></p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="2322"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Hết\n                                        hàng</span></p>\n                        </li>\n                    </ul>\n                    <p data-renderer-start-pos="2334"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Xét trên ngày đơn hàng được tạo</span></p>\n                ',
        },
        {
          key: 2,
          name: "Số đơn",
          description: "Số lượng đơn tạo trên tất cả nền tảng.",
          formula:
            '\n                    <p data-renderer-start-pos="2449">= Tổng đơn tạo - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="2480">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="2536">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="2549">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="2565">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="2576">Hết hàng</p>\n                        </li>\n                    </ul>\n                ',
        },
        {
          key: 3,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo.",
          formula:
            '\n                    <p data-renderer-start-pos="2676">= Doanh thu đơn tạo tổng / Số đơn tạo tổng</p>\n                ',
        },
        {
          key: 4,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo.",
          formula:
            '\n                    <p data-renderer-start-pos="2815">= Tiền vốn/ Doanh thu đơn tạo</p>\n                    <p data-renderer-start-pos="2846">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 5,
          name: "A1. DT ĐT Facebook",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="2994">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="3060">KHÔNG ghi nhận các đơn gồm trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="3117">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="3130">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="3146">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="3157">Hết hàng</p>\n                        </li>\n                    </ul>\n                    <p data-renderer-start-pos="3169">Xét trên ngày đơn hàng được tạo</p>\n                ',
        },
        {
          key: 6,
          name: "Số Mess",
          description:
            "Số lần khách hàng bắt đầu cuộc trò chuyện đến trang Facebook qua\n                        bài quảng cáo.",
          formula:
            '\n                    <p data-renderer-start-pos="3326">= Số lần click vào nút nhắn tin trong bài đăng quảng cáo Facebook.\n                    </p>\n                ',
        },
        {
          key: 7,
          name: "Chi phí/Mess",
          description:
            "Chi phí quảng cáo trung bình trên mỗi lần khách hàng bắt đầu trò\n                        chuyện.",
          formula:
            '\n                    <p data-renderer-start-pos="3511">= Chi phí quảng cáo Facebook/ số Mess</p>\n                ',
        },
        {
          key: 8,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="3638">= Tổng đơn tạo - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="3669">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="3725">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="3738">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="3754">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="3765">Hết hàng</p>\n                        </li>\n                    </ul>\n                ',
        },
        {
          key: 9,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="3874">= Doanh thu Facebook / số đơn Facebook</p>\n                ',
        },
        {
          key: 10,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo trên tổng số lần khách hàng bắt đầu trò chuyện.",
          formula:
            '\n                    <p data-renderer-start-pos="4021">= Số đơn Facebook/ Số mess Facebook</p>\n                ',
        },
        {
          key: 11,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="4162">= Tiền vốn đơn Facebook / Doanh thu Facebook</p>\n                    <p data-renderer-start-pos="4208">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 12,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn tạo Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="4352">= Chi phí Facebook Ads / Doanh thu Facebook</p>\n                ',
        },
        {
          key: 13,
          name: "A2. DT ĐT TMĐT",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="4498">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="4564">KHÔNG ghi nhận các đơn gồm trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="4621">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="4634">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="4650">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="4661">Hết hàng</p>\n                        </li>\n                    </ul>\n                    <p data-renderer-start-pos="4673">Xét trên ngày đơn hàng được tạo</p>\n                ',
        },
        {
          key: 14,
          name: "Traffic nội sàn",
          description:
            "Số lượt xem sản phẩm trong shop TMĐT, truy cập từ nguồn organic\n                        search trong sàn.",
          formula:
            '\n                    <p data-renderer-start-pos="4840">&nbsp;</p>\n                ',
        },
        {
          key: 15,
          name: "Traffic ngoại sàn",
          description:
            "Số lượt xem sản phẩm trong shop TMĐT, truy cập từ UTM link\n                        (Facebook ads) ngoài sàn.",
          formula:
            '\n                    <p data-renderer-start-pos="4981">&nbsp;</p>\n                ',
        },
        {
          key: 16,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="5067">= Tổng đơn tạo - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="5098">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="5154">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="5167">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="5183">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="5194">Hết hàng</p>\n                        </li>\n                    </ul>\n                ',
        },
        {
          key: 17,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="5299">= Doanh thu TMĐT / số đơn TMĐT</p>\n                ',
        },
        {
          key: 18,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo TMĐT trên tổng số lượt xem nội và ngoại sàn.",
          formula:
            '\n                    <p data-renderer-start-pos="5435">= Số đơn TMĐT / (Traffic nội sàn + Traffic ngoại sàn)</p>\n                ',
        },
        {
          key: 19,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="5590">= Tiền vốn đơn TMĐT / Doanh thu TMĐT</p>\n                    <p data-renderer-start-pos="5628">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 20,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn tạo TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="5768">= (Chi phí nội sàn + Chi phí Ngoại sàn) / Doanh thu TMĐT</p>\n                    <p data-renderer-start-pos="5826">Chi phí nội sàn = Chi phí quảng cáo tại 3 sàn TMĐT<br>Chi phí\n                        ngoại sàn = Chi phí quảng cáo tại Facebook</p>\n                ',
        },
        {
          key: 21,
          name: "A3. DT ĐT Zalo",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="6030">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="6096">KHÔNG ghi nhận các đơn gồm trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="6153">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="6166">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="6182">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="6193">Hết hàng</p>\n                        </li>\n                    </ul>\n                    <p data-renderer-start-pos="6205">Xét trên ngày đơn hàng được tạo</p>\n                ',
        },
        {
          key: 22,
          name: "Số data chăm sóc",
          description:
            "Số lượng khách hàng được chăm sóc trên Zalo trong khoảng thời gian\n                        được chọn.",
          formula:
            '\n                    <p data-renderer-start-pos="6369">&nbsp;</p>\n                ',
        },
        {
          key: 23,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="6455">= Tổng đơn tạo - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="6486">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="6542">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="6555">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="6571">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="6582">Hết hàng</p>\n                        </li>\n                    </ul>\n                ',
        },
        {
          key: 24,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="6687">= Doanh thu Zalo / số đơn Zalo</p>\n                ',
        },
        {
          key: 25,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo Zalo trên tổng số lượng khách hàng chăm sóc.",
          formula:
            '\n                    <p data-renderer-start-pos="6823">= Số đơn Zalo / Số data chăm sóc</p>\n                ',
        },
        {
          key: 26,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="6957">= Tiền vốn đơn Zalo / Doanh thu Zalo</p>\n                    <p data-renderer-start-pos="6995">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 27,
          name: "A5. DT ĐT Tiktok",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="7139">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="7205">KHÔNG ghi nhận các đơn gồm trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="7262">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="7275">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="7291">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="7302">Hết hàng</p>\n                        </li>\n                    </ul>\n                    <p data-renderer-start-pos="7314">Xét trên ngày đơn hàng được tạo</p>\n                ',
        },
        {
          key: 28,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="7433">= Tổng đơn tạo - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="7464">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="7520">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="7533">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="7549">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="7560">Hết hàng</p>\n                        </li>\n                    </ul>\n                ',
        },
        {
          key: 29,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="7667">= Doanh thu Tiktok / số đơn Tiktok</p>\n                ',
        },
        {
          key: 30,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="7805">= Tiền vốn đơn Tiktok / Doanh thu Tiktok</p>\n                    <p data-renderer-start-pos="7847">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 31,
          name: "A4. DT ĐT Web",
          description: "Tổng doanh thu của các đơn tạo được ghi nhận cho Web.",
          formula:
            '\n                    <p data-renderer-start-pos="7985">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="8051">KHÔNG ghi nhận các đơn gồm trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="8108">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="8121">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="8137">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="8148">Hết hàng</p>\n                        </li>\n                    </ul>\n                    <p data-renderer-start-pos="8160">Xét trên ngày đơn hàng được tạo</p>\n                ',
        },
        {
          key: 32,
          name: "Traffic tự nhiên",
          description: "Số lượt truy cập trang web yody.vn từ các kênh tự nhiên.",
          formula:
            '\n                    <p data-renderer-start-pos="8303">Traffic Tự nhiên = Channel Organic Search + Direct + Social +\n                        Referral + Email + Kênh khác (Affiliate)</p>\n                ',
        },
        {
          key: 33,
          name: "Traffic quảng cáo",
          description: "Số lượt truy cập trang web yody.vn từ các kênh quảng cáo.",
          formula:
            '\n                    <p data-renderer-start-pos="8519">Traffic Quảng cáo = Channel Paid Search + Display + Other</p>\n                ',
        },
        {
          key: 34,
          name: "Số đơn",
          description: "Số lượng đơn tạo được ghi nhận cho Web.",
          formula:
            '\n                    <p data-renderer-start-pos="8661">= Tổng đơn tạo - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="8692">KHÔNG ghi nhận các đơn có trạng thái xử lý đơn hàng:</p>\n                    <ul class="ak-ul" data-indent-level="1">\n                        <li>\n                            <p data-renderer-start-pos="8748">Khách huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="8761">Hệ thống huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="8777">HVC huỷ</p>\n                        </li>\n                        <li>\n                            <p data-renderer-start-pos="8788">Hết hàng</p>\n                        </li>\n                    </ul>\n                ',
        },
        {
          key: 35,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn tạo Web.",
          formula:
            '\n                    <p data-renderer-start-pos="8892">= Doanh thu Web / số đơn Web</p>\n                ',
        },
        {
          key: 36,
          name: "TLCĐ",
          description: "Tỉ lệ số đơn tạo Web trên tổng số lượt truy cập website.",
          formula:
            '\n                    <p data-renderer-start-pos="9021">= Số đơn Web / (Traffic tự nhiên + Traffic quảng cáo)</p>\n                ',
        },
        {
          key: 37,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn tạo Web.",
          formula:
            '\n                    <p data-renderer-start-pos="9175">= Tiền vốn đơn Web / Doanh thu Web</p>\n                    <p data-renderer-start-pos="9211">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 38,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn tạo Web",
          formula:
            '\n                    <p data-renderer-start-pos="9349">= (Chi phí Google Ads + chi phí Facebook Ads) / Doanh thu Web</p>\n                ',
        },
      ],
    },
    {
      key: 2,
      name: "B. Doanh thu đơn thành công",
      data: [
        {
          key: 39,
          name: '<span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">B. DT TC tổng</span>',
          description:
            '<span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Tổng doanh thu của các đơn thành công trên tất cả\n                                nền tảng.</span>',
          formula:
            '\n                    <p data-renderer-start-pos="9517"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">B = B1 + B2 + B3 + B4 + B5</span></p>\n                    <p data-renderer-start-pos="9545"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Doanh thu = Tổng bán - tổng chiết khấu - tiêu điểm\n                                - tổng trả + hoàn điểm </span></p>\n                    <p data-renderer-start-pos="9621"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Chỉ ghi nhận các đơn gồm trạng thái xử lý đơn hàng\n                                = Thành công</span></p>\n                    <p data-renderer-start-pos="9686"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">Xét trên ngày đơn hàng thành công</span>\n                    </p>\n                ',
        },
        {
          key: 40,
          name: "Số đơn",
          description: "Số lượng đơn thành công trên tất cả nền tảng.",
          formula:
            '\n                    <p data-renderer-start-pos="9805">= Tổng đơn thành công - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="9843">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                ',
        },
        {
          key: 41,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công.",
          formula:
            '\n                    <p data-renderer-start-pos="10003">= Doanh thu đơn thành công tổng / Số đơn thành công tổng</p>\n                ',
        },
        {
          key: 42,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công.",
          formula:
            '\n                    <p data-renderer-start-pos="10163">= Tiền vốn / Doanh thu đơn thành công</p>\n                    <p data-renderer-start-pos="10202">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 43,
          name: "B1. DT TC Facebook",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="10357">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="10423">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                    <p data-renderer-start-pos="10488">Xét trên ngày đơn hàng thành công</p>\n                ',
        },
        {
          key: 44,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="10618">= Tổng đơn thành công - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="10656">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                ',
        },
        {
          key: 45,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="10825">= Doanh thu Facebook / Số đơn Facebook</p>\n                ',
        },
        {
          key: 46,
          name: "GV/DT",
          description:
            "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công\n                        Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="10976">= Tiền vốn đơn Facebook / Doanh thu Facebook</p>\n                    <p data-renderer-start-pos="11022">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 47,
          name: "CP/DT",
          description:
            "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn thành công\n                        Facebook.",
          formula:
            '\n                    <p data-renderer-start-pos="11173">= Chi phí Facebook Ads / Doanh thu Facebook</p>\n                ',
        },
        {
          key: 48,
          name: "B2. DT TC TMĐT",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="11326">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="11392">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                    <p data-renderer-start-pos="11457">Xét trên ngày đơn hàng thành công</p>\n                ',
        },
        {
          key: 49,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="11583">= Tổng đơn thành công - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="11621">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                ',
        },
        {
          key: 50,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="11786">= Doanh thu TMĐT / Số đơn TMĐT</p>\n                ',
        },
        {
          key: 51,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="11925">= Tiền vốn đơn TMĐT / Doanh thu TMĐT</p>\n                    <p data-renderer-start-pos="11963">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 52,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn thành công TMĐT.",
          formula:
            '\n                    <p data-renderer-start-pos="12110">= (Chi phí nội sàn + Chi phí Ngoại sàn) / Doanh thu TMĐT</p>\n                    <p data-renderer-start-pos="12168">Chi phí nội sàn = Chi phí quảng cáo tại 3 sàn TMĐT<br>Chi phí\n                        ngoại sàn = Chi phí quảng cáo tại Facebook</p>\n                ',
        },
        {
          key: 53,
          name: "B3. DT TC Zalo",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="12379">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="12445">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                    <p data-renderer-start-pos="12510">Xét trên ngày đơn hàng thành công</p>\n                ',
        },
        {
          key: 54,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="12636">= Tổng đơn thành công - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="12674">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                ',
        },
        {
          key: 55,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="12839">= Doanh thu Zalo / Số đơn Zalo</p>\n                ',
        },
        {
          key: 56,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Zalo.",
          formula:
            '\n                    <p data-renderer-start-pos="12978">= Tiền vốn đơn Zalo / Doanh thu Zalo</p>\n                    <p data-renderer-start-pos="13016">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 57,
          name: "B5. DT TC Tiktok",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="13167">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="13233">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                    <p data-renderer-start-pos="13298">Xét trên ngày đơn hàng thành công</p>\n                ',
        },
        {
          key: 58,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="13426">= Tổng đơn thành công - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="13464">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                ',
        },
        {
          key: 59,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="13631">= Doanh thu Tiktok / Số đơn Tiktok</p>\n                ',
        },
        {
          key: 60,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Tiktok.",
          formula:
            '\n                    <p data-renderer-start-pos="13776">= Tiền vốn đơn Tiktok / Doanh thu Tiktok</p>\n                    <p data-renderer-start-pos="13818">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 61,
          name: "B4. DT TC Web",
          description: "Tổng doanh thu của các đơn thành công được ghi nhận cho Web.",
          formula:
            '\n                    <p data-renderer-start-pos="13963">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm\n                    </p>\n                    <p data-renderer-start-pos="14029">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                    <p data-renderer-start-pos="14094">Xét trên ngày đơn hàng thành công</p>\n                ',
        },
        {
          key: 62,
          name: "Số đơn",
          description: "Số lượng đơn thành công được ghi nhận cho Web.",
          formula:
            '\n                    <p data-renderer-start-pos="14219">= Tổng đơn thành công - Tổng đơn trả</p>\n                    <p data-renderer-start-pos="14257">CHỈ ghi nhận các đơn gồm trạng thái xử lý đơn hàng = Thành công\n                    </p>\n                ',
        },
        {
          key: 63,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn thành công Web.",
          formula:
            '\n                    <p data-renderer-start-pos="14421">= Doanh thu Web / Số đơn Web</p>\n                ',
        },
        {
          key: 64,
          name: "GV/DT",
          description: "Tỉ lệ giá vốn sản phẩm trên tổng doanh thu đơn thành công Web.",
          formula:
            '\n                    <p data-renderer-start-pos="14557">= Tiền vốn đơn Web / Doanh thu Web</p>\n                    <p data-renderer-start-pos="14593">Tiền vốn = Giá vốn * SL hàng thực bán</p>\n                ',
        },
        {
          key: 65,
          name: "CP/DT",
          description: "Tỉ lệ chi phí quảng cáo trên tổng doanh thu đơn thành công Web.",
          formula:
            '\n                    <p data-renderer-start-pos="14739">= (Chi phí Google Ads + chi phí Facebook Ads) / Doanh thu Web</p>\n                ',
        },
      ],
    },
    {
      key: 3,
      name: "C. Điểm NPS",
      data: [
        {
          key: 1,
          name: "Điểm NPS",
          description: "Chỉ số đánh giá mức độ hài lòng của khách hàng.",
          formula:
            '<ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="1429">NPS = (“Số người đánh giá 9-10” - “Số người đánh giá 0-6”) / “Tổng số người đánh giá” * 100%</p></li><li><p data-renderer-start-pos="1525">NPS có thể âm </p></li></ul>',
        },
        {
          key: 2,
          name: "Số người đánh giá 9-10",
          description: "Số khách hàng đánh giá dịch vụ từ 9 đến 10 điểm.",
          formula: "",
        },
        {
          key: 3,
          name: "Số người đánh giá 0-6",
          description: "Số khách hàng đánh giá dịch vụ từ 0 đến 6 điểm.",
          formula: "",
        },
        {
          key: 4,
          name: "Số người đánh giá 7-8",
          description: "Số khách hàng đánh giá dịch vụ từ 7 đến 8 điểm.",
          formula: "",
        },
      ],
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

export const initialAnnotationOnline: AnnotationData = {
  ...annotationOnline,
  data: annotationOnline.data.map((item) => {
    return {
      ...item,
      data: item.data.map((i) => {
        return {
          ...i,
          normalize: i.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase(),
        };
      }),
    };
  }),
};
