import UrlConfig from "config/url.config";
import { AnalyticCube, AnnotationData } from "model/report/analytics.model";


export const AnnotationDataList: AnnotationData[] = [
    {
        alias: UrlConfig.ANALYTIC_SALES_OFFLINE,
        cubes: [AnalyticCube.OfflineSales],
        data: [
            {
                annotation: "SL đơn hàng",
                desc: "Số lượng đơn hàng được bán tại quầy cửa hàng trong khoảng thời gian chọn"
            },
            {
                annotation: "SL hàng bán ra",
                desc: "Số lượng sản phẩm bán ra tại quầy cửa hàng"
            },
            {
                annotation: "SL đơn trả",
                desc: "Số lượng đơn trả bởi khách tại quầy cửa hàng"
            },
            {
                annotation: "SL hàng trả lại",
                desc: "Số lượng sản phẩm trả lại trên đơn trả và khách trả lại tại quầy"
            },
            {
                annotation: "SL hàng thực bán",
                desc: "SL hàng bán ra - SL hàng trả lại"
            },
            {
                annotation: "Tổng bán",
                desc: "SL hàng bán ra x Đơn giá bán trên mỗi đơn hàng"
            },
            {
                annotation: "Tổng chiết khấu",
                desc: "Tổng chiết khấu của từng sản phẩm và chiết khấu của cả đơn hàng. (Nếu báo cáo theo từng sản phẩm thì bằng Tổng chiết khấu của sản phẩm và chiết khẩu phân bổ từ tổng đơn hàng)"
            },
            {
                annotation: "Tiêu điểm",
                desc: "Số tiền ứng với điểm khách hàng sử dụng trên đơn"
            },
            {
                annotation: "Hoàn điểm",
                desc: "Số tiền ứng với điểm hoàn lại cho khách khi trả hàng"
            },
            {
                annotation: "Tiêu điểm - hoàn điểm",
                desc: "Số tiền ứng với tiêu điểm sau khi khách trả hàng"
            },
            {
                annotation: "Tổng trả",
                desc: "Tổng tiền trả khách (Tổng đơn giá đơn trả sau chiết khấu - Hoàn điểm)"
            },
            {
                annotation: "Doanh thu sau chiết khấu",
                desc: "Tổng bán - Tổng chiết khấu (chiết khấu trên từng sản phẩm + chiết khấu phân bổ từ tổng đơn)"
            },
            {
                annotation: "Doanh thu sau chiết khấu - trả hàng",
                desc: "Tổng bán - Tổng chiết khấu - Tổng trả"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm"
            },
            {
                annotation: "Doanh thu",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm - Tổng trả - Hoàn điểm"
            },
            {
                annotation: "TB giá trị đơn hàng",
                desc: "Doanh thu/(SL đơn hàng - SL đơn trả)"
            },
            {
                annotation: "SL khách hàng",
                desc: "<p> Số lượng khách hàng duy nhất trong khoảng thời gian chọn.</p><p> <em data-renderer-mark=\"true\"><strong data-renderer-mark=\"true\">Ví dụ:</strong></em></p><ul class=\"ak-ul\" data-indent-level=\"1\"> <li>     <p>         Khách hàng A mua 2 đơn: Đơn 1 ngày         28/04/2022, đơn 2 ngày 30/04/2022     </p> </li> <li>     <p>         Khách hàng B mua 3 đơn: Đơn 1 ngày         28/04/2022, đơn 2 ngày 30/04/2022, đơn 3         ngày 27/05/2022     </p> </li> <li>     <p>         Khách hàng C mua 2 đơn: Đơn 1 ngày         01/04/2020, đơn 2 ngày 30/04/2022     </p> </li></ul><p> <em data-renderer-mark=\"true\"><strong data-renderer-mark=\"true\">-&gt; Tổng số lượng khách hàng </strong>khoảng thời gian từ 28/04/2022 đến 28/05/2022 =     3 (Khách A, B, C)</em></p>"
            },
            {
                annotation: "TB chi tiêu của khách hàng",
                desc: "Doanh thu / SL khách hàng"
            },
            {
                annotation: "Tiền thực thu",
                desc: "Số tiền thực sự thu về (nếu số này khác với doanh thu thì có khả năng là đơn trả chưa xác nhận hoàn tiền)"
            },
            {
                annotation: "Tiền mặt",
                desc: "Số tiền mặt thu được và trả lại khách"
            },
            {
                annotation: "Chuyển khoản",
                desc: "Số tiền thu được từ phương thức chuyển khoản hoặc chuyển lại cho khách"
            },
            {
                annotation: "Quẹt thẻ",
                desc: "Số tiền thu được từ hình thức quẹt thẻ"
            },
            {
                annotation: "Thanh toán QR Pay",
                desc: "Số tiền thu được từ hình thức QR Pay"
            },
            {
                annotation: "Thanh toán khác",
                desc: "Số tiền thu được bằng hình thức thanh toán khác"
            },
            {
                annotation: "Tiền đã thanh toán",
                desc: "Tiền mặt + chuyển khoản + quẹt thẻ + thanh toán QR pay + thanh toán khác"
            }
        ],
        documentLink: 'https://hdsd-yody.gitbook.io/unicorn-free/bao-cao/huong-dan-su-dung-bao-cao-tinh-nang-co-ban'
    },
    {
        alias: UrlConfig.ANALYTIC_SALES_ONLINE,
        cubes: [AnalyticCube.Sales],
        data: [
            {
                annotation: "SL đơn hàng",
                desc: "Số lượng đơn hàng thành công trong khoảng thời gian chọn"
            },
            {
                annotation: "SL hàng bán ra",
                desc: "Số lượng sản phẩm bán ra thành công "
            },
            {
                annotation: "SL đơn trả",
                desc: "Số lượng đơn hàng trả lại thành công"
            },
            {
                annotation: "SL hàng trả lại",
                desc: "Số lượng sản phẩm trả lại trên đơn trả thành công"
            },
            {
                annotation: "SL hàng thực bán",
                desc: "SL hàng bán ra thành công - SL hàng trả lại thành công"
            },
            {
                annotation: "Tổng bán",
                desc: "SL hàng bán ra x Đơn giá bán trên mỗi đơn hàng của các đơn thành công"
            },
            {
                annotation: "Tổng chiết khấu",
                desc: "Tổng chiết khấu của từng sản phẩm và chiết khấu của cả đơn hàng của những đơn thành công. (Nếu báo cáo theo từng sản phẩm thì bằng Tổng chiết khấu của sản phẩm và chiết khẩu phân bổ từ tổng đơn hàng)"
            },
            {
                annotation: "Tiêu điểm",
                desc: "Số tiền ứng với điểm khách hàng sử dụng trên đơn "
            },
            {
                annotation: "Hoàn điểm",
                desc: "Số tiền ứng với điểm hoàn lại cho khách khi trả hàng"
            },
            {
                annotation: "Tiêu điểm - hoàn điểm",
                desc: "Số tiền ứng với tiêu điểm sau khi khách trả hàng"
            },
            {
                annotation: "Tổng trả",
                desc: "Tổng tiền trả khách (Tổng đơn giá đơn trả sau chiết khấu - Hoàn điểm)"
            },
            {
                annotation: "Doanh thu sau chiết khấu",
                desc: "Tổng bán - Tổng chiết khấu (chiết khấu trên từng sản phẩm + chiết khấu phân bổ từ tổng đơn)"
            },
            {
                annotation: "Doanh thu sau chiết khấu - trả hàng",
                desc: "Tổng bán  - Tổng chiết khấu - Tổng trả thành công"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm - trả hàng",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm - Tổng trả"
            },
            {
                annotation: "Phí ship báo khách",
                desc: "Phí ship báo cho khách của những đơn thành công"
            },
            {
                annotation: "Doanh thu",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm - Tổng trả - Phí ship báo khách"
            },
            {
                annotation: "TB giá trị đơn hàng",
                desc: "Doanh thu/(SL đơn hàng - SL đơn trả)"
            },
            {
                annotation: "SL khách hàng",
                desc: "<p> Số lượng khách hàng duy nhất trong khoảng thời gian chọn.</p><p> <em data-renderer-mark=\"true\"><strong data-renderer-mark=\"true\">Ví dụ:</strong></em></p><ul class=\"ak-ul\" data-indent-level=\"1\"> <li>     <p>         Khách hàng A mua 2 đơn: Đơn 1 ngày         28/04/2022, đơn 2 ngày 30/04/2022     </p> </li> <li>     <p>         Khách hàng B mua 3 đơn: Đơn 1 ngày         28/04/2022, đơn 2 ngày 30/04/2022, đơn 3         ngày 27/05/2022     </p> </li> <li>     <p>         Khách hàng C mua 2 đơn: Đơn 1 ngày         01/04/2020, đơn 2 ngày 30/04/2022     </p> </li></ul><p> <em data-renderer-mark=\"true\"><strong data-renderer-mark=\"true\">-&gt; Tổng số lượng khách hàng </strong>khoảng thời gian từ 28/04/2022 đến 28/05/2022 =     3 (Khách A, B, C)</em></p>"
            },
            {
                annotation: "TB chi tiêu của khách hàng",
                desc: "Doanh thu / SL khách hàng"
            },
            {
                annotation: "Tiền thực thu",
                desc: "Số tiền thực sự thu về (nếu số này khác với doanh thu thì có khả năng là đơn trả chưa xác nhận hoàn tiền)"
            },
            {
                annotation: "Tiền mặt",
                desc: "Số tiền mặt thu được (Số tiền mặt khách trả - số tiền mặt trả lại khách)"
            },
            {
                annotation: "Chuyển khoản",
                desc: "Số tiền thu được từ phương thức chuyển khoản (Số tiền mặt khách chuyển cho mình - số tiền mình chuyển lại cho khách)"
            },
            {
                annotation: "Quẹt thẻ",
                desc: "Số tiền thu được từ hình thức quẹt thẻ"
            },
            {
                annotation: "Thanh toán QR Pay",
                desc: "Số tiền thu được từ hình thức QR Pay"
            },
            {
                annotation: "COD",
                desc: "Số tiền sử dụng dịch vụ phát hàng thu tiền hộ"
            },
            {
                annotation: "Thanh toán khác",
                desc: "Số tiền thu được bằng hình thức thanh toán khác"
            },
            {
                annotation: "Tiền đã thanh toán",
                desc: "Tiền mặt + chuyển khoản + quẹt thẻ + thanh toán QR pay + COD + thanh toán khác"
            },
            {
                annotation: "SL đơn hàng (đơn tạo)",
                desc: "Số lượng đơn hàng được tạo ra trong khoảng thời gian chọn"
            },
            {
                annotation: "Tỷ lệ thành công (%)",
                desc: "Doanh thu/Doanh thu (đơn tạo)"
            },
            {
                annotation: "SL hàng bán ra (đơn tạo)",
                desc: "Số lượng sản phẩm trên đơn hàng được tạo ra"
            },
            {
                annotation: "SL hàng thực bán (đơn tạo)",
                desc: "SL hàng bán ra (đơn tạo) - SL hàng trả lại"
            },
            {
                annotation: "Tổng bán (đơn tạo)",
                desc: "SL hàng bán ra (đơn tạo) x Đơn giá bán trên mỗi đơn hàng trên các đơn được tạo ra"
            },
            {
                annotation: "Tổng chiết khấu (đơn tạo)",
                desc: "Tổng chiết khấu của từng sản phẩm và chiết khẩu của cả đơn hàng của những đơn được tạo ra"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm - trả hàng (đơn tạo)",
                desc: "Tổng bán (đơn tạo) - Tổng chiết khấu (đơn tạo) - Tiêu điểm - Tổng trả "
            },
            {
                annotation: "Phí ship báo khách (đơn tạo)",
                desc: "Phí ship báo cho khách của những đơn được tạo ra"
            },
            {
                annotation: "Doanh thu (đơn tạo)",
                desc: "Tổng bán (đơn tạo) - Tổng chiết khấu (đơn tạo) - Tiêu điểm - Tổng trả  - Phí ship báo khách (đơn tạo)"
            }
        ],
        documentLink: 'https://hdsd-yody.gitbook.io/unicorn-free/bao-cao/huong-dan-su-dung-bao-cao-tinh-nang-co-ban'
    },
    {
        alias: UrlConfig.ANALYTIC_SALES_OFFLINE,
        cubes: [AnalyticCube.Payments],
        data: [
            {
                annotation: 'Tiền đã thanh toán',
                desc: 'Tổng số tiền đã thanh toán (Tiền mặt + Chuyển khoản + COD + Điểm + Quẹt thẻ + QR Pay + Thanh toán khác)',
            },
            {
                annotation: 'Tiền mặt',
                desc: 'Số lượng tiền được trả qua phương thức tiền mặt',
            },
            {
                annotation: 'Chuyển khoản',
                desc: 'Số lượng tiền chuyển khoản khách hàng đã chuyển',
            },
            {
                annotation: 'COD',
                desc: 'Số lượng tiền được trả bằng COD',
            },
            {
                annotation: 'Thanh toán bằng điểm',
                desc: 'Số lượng điểm được dùng sau khi quy ra tiền để thanh toán',
            },
            {
                annotation: 'Quẹt thẻ',
                desc: 'Số lượng tiền được trả qua phương thức quẹt thẻ',
            },
            {
                annotation: 'Thanh toán QR Pay',
                desc: 'Số lượng tiền được trả qua phương thức QR Pay',
            },
            {
                annotation: 'Thanh toán khác',
                desc: 'Số lượng tiền được trả theo phương thức khác',
            },
        ],
        documentLink: 'https://hdsd-yody.gitbook.io/unicorn-free/bao-cao/huong-dan-su-dung-bao-cao-tinh-nang-co-ban'
    },
    {
        alias: UrlConfig.ANALYTIC_FINACE,
        cubes: [AnalyticCube.Costs],
        data: [
            {
                annotation: "SL đơn hàng",
                desc: "Số lượng đơn hàng thành công trong khoảng thời gian chọn"
            },
            {
                annotation: "SL hàng bán ra",
                desc: "Số lượng sản phẩm bán ra thành công "
            },
            {
                annotation: "SL đơn trả",
                desc: "Số lượng đơn hàng trả lại thành công"
            },
            {
                annotation: "SL hàng trả lại",
                desc: "Số lượng sản phẩm trả lại trên đơn trả thành công"
            },
            {
                annotation: "SL hàng thực bán",
                desc: "SL hàng bán ra thành công - SL hàng trả lại thành công"
            },
            {
                annotation: "Tổng bán",
                desc: "SL hàng bán ra x Đơn giá bán trên mỗi đơn hàng của các đơn thành công"
            },
            {
                annotation: "Tổng chiết khấu",
                desc: "Tổng chiết khấu của từng sản phẩm và chiết khấu của cả đơn hàng của những đơn thành công. (Nếu báo cáo theo từng sản phẩm thì bằng Tổng chiết khấu của sản phẩm và chiết khẩu phân bổ từ tổng đơn hàng)"
            },
            {
                annotation: "Tiêu điểm",
                desc: "Số tiền ứng với điểm khách hàng sử dụng trên đơn "
            },
            {
                annotation: "Hoàn điểm",
                desc: "Số tiền ứng với điểm hoàn lại cho khách khi trả hàng"
            },
            {
                annotation: "Tiêu điểm - hoàn điểm",
                desc: "Số tiền ứng với tiêu điểm sau khi khách trả hàng"
            },
            {
                annotation: "Tổng trả",
                desc: "Tổng tiền trả khách (Tổng đơn giá đơn trả sau chiết khấu - Hoàn điểm)"
            },
            {
                annotation: "Doanh thu sau chiết khấu",
                desc: "Tổng bán - Tổng chiết khấu (chiết khấu trên từng sản phẩm + chiết khấu phân bổ từ tổng đơn)"
            },
            {
                annotation: "Doanh thu sau chiết khấu - trả hàng",
                desc: "Tổng bán  - Tổng chiết khấu - Tổng trả thành công"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm - trả hàng",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm - Tổng trả"
            },
            {
                annotation: "Phí ship báo khách",
                desc: "Phí ship báo cho khách của những đơn thành công"
            },
            {
                annotation: "Doanh thu",
                desc: "Tổng bán - Tổng chiết khấu - Tiêu điểm - Tổng trả - Phí ship báo khách"
            },
            {
                annotation: "TB giá trị đơn hàng",
                desc: "Doanh thu/(SL đơn hàng - SL đơn trả)"
            },
            {
                annotation: "Tiền vốn",
                desc: "Giá vốn * SL hàng thực bán"
            },
            {
                annotation: "Lợi nhuận gộp",
                desc: "Doanh thu - Tiền vốn + Phí giao hàng"
            },
            {
                annotation: "Tỷ suất lợi nhuận gộp",
                desc: "(Lợi nhuận gộp / Doanh thu) x 100%"
            },
            {
                annotation: "SL khách hàng",
                desc: "<p> Số lượng khách hàng duy nhất trong khoảng thời gian chọn.</p><p> <em data-renderer-mark=\"true\"><strong data-renderer-mark=\"true\">Ví dụ:</strong></em></p><ul class=\"ak-ul\" data-indent-level=\"1\"> <li>     <p>         Khách hàng A mua 2 đơn: Đơn 1 ngày         28/04/2022, đơn 2 ngày 30/04/2022     </p> </li> <li>     <p>         Khách hàng B mua 3 đơn: Đơn 1 ngày         28/04/2022, đơn 2 ngày 30/04/2022, đơn 3         ngày 27/05/2022     </p> </li> <li>     <p>         Khách hàng C mua 2 đơn: Đơn 1 ngày         01/04/2020, đơn 2 ngày 30/04/2022     </p> </li></ul><p> <em data-renderer-mark=\"true\"><strong data-renderer-mark=\"true\">-&gt; Tổng số lượng khách hàng </strong>khoảng thời gian từ 28/04/2022 đến 28/05/2022 =     3 (Khách A, B, C)</em></p>"
            },
            {
                annotation: "TB chi tiêu của khách hàng",
                desc: "Doanh thu / SL khách hàng"
            },
            {
                annotation: "Tiền thực thu",
                desc: "Số tiền thực sự thu về (nếu số này khác với doanh thu thì có khả năng là đơn trả chưa xác nhận hoàn tiền)"
            },
            {
                annotation: "Tiền mặt",
                desc: "Số tiền mặt thu được (Số tiền mặt khách trả - số tiền mặt trả lại khách)"
            },
            {
                annotation: "Chuyển khoản",
                desc: "Số tiền thu được từ phương thức chuyển khoản (Số tiền mặt khách chuyển cho mình - số tiền mình chuyển lại cho khách)"
            },
            {
                annotation: "Quẹt thẻ",
                desc: "Số tiền thu được từ hình thức quẹt thẻ"
            },
            {
                annotation: "Thanh toán QR Pay",
                desc: "Số tiền thu được từ hình thức QR Pay"
            },
            {
                annotation: "COD",
                desc: "Số tiền sử dụng dịch vụ phát hàng thu tiền hộ"
            },
            {
                annotation: "Thanh toán khác",
                desc: "Số tiền thu được bằng hình thức thanh toán khác"
            },
            {
                annotation: "Tiền đã thanh toán",
                desc: "Tiền mặt + chuyển khoản + quẹt thẻ + thanh toán QR pay + COD + thanh toán khác"
            },
            {
                annotation: "SL đơn hàng (đơn tạo)",
                desc: "Số lượng đơn hàng được tạo ra trong khoảng thời gian chọn"
            },
            {
                annotation: "Tỷ lệ thành công (%)",
                desc: "Doanh thu/Doanh thu (đơn tạo)"
            },
            {
                annotation: "SL hàng bán ra (đơn tạo)",
                desc: "Số lượng sản phẩm trên đơn hàng được tạo ra"
            },
            {
                annotation: "SL hàng thực bán (đơn tạo)",
                desc: "SL hàng bán ra (đơn tạo) - SL hàng trả lại"
            },
            {
                annotation: "Tổng bán (đơn tạo)",
                desc: "SL hàng bán ra (đơn tạo) x Đơn giá bán trên mỗi đơn hàng trên các đơn được tạo ra"
            },
            {
                annotation: "Tổng chiết khấu (đơn tạo)",
                desc: "Tổng chiết khấu của từng sản phẩm và chiết khẩu của cả đơn hàng của những đơn được tạo ra"
            },
            {
                annotation: "Doanh thu sau chiết khấu - tiêu điểm - trả hàng (đơn tạo)",
                desc: "Tổng bán (đơn tạo) - Tổng chiết khấu (đơn tạo) - Tiêu điểm - Tổng trả "
            },
            {
                annotation: "Phí ship báo khách (đơn tạo)",
                desc: "Phí ship báo cho khách của những đơn được tạo ra"
            },
            {
                annotation: "Doanh thu (đơn tạo)",
                desc: "Tổng bán (đơn tạo) - Tổng chiết khấu (đơn tạo) - Tiêu điểm - Tổng trả  - Phí ship báo khách (đơn tạo)"
            }
        ],
        documentLink: 'https://hdsd-yody.gitbook.io/unicorn-free/bao-cao/huong-dan-su-dung-bao-cao-tinh-nang-co-ban'
    }
]