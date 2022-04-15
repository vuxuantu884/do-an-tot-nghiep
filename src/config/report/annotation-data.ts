import UrlConfig from "config/url.config";
import { AnalyticCube, AnnotationData } from "model/report/analytics.model";


export const AnnotationDataList: AnnotationData[] = [
    {
        alias: UrlConfig.ANALYTIC_SALES_OFFLINE,
        cube: AnalyticCube.Sales,
        data: [
            {
                annotation: 'SL hàng bán ra',
                desc: 'Số lượng hàng bán ra trên đơn hàng được giao thành công',
            },
            {
                annotation: 'SL hàng trả lại',
                desc: 'Số lượng hàng trả lại trên đơn hàng được giao thành công',
            },
            {
                annotation: 'SL hàng thực bán',
                desc: 'SL hàng bán ra - SL hàng trả lại',
            },
            {
                annotation: 'SL đơn hàng',
                desc: 'Số lượng đơn hàng được giao thành công trong khoảng thời gian đã chọn',
            },
            {
                annotation: 'SL khách hàng',
                desc: 'Số lượng khách hàng tương ứng trên các đơn hàng được giao thành công',
            },
            {
                annotation: 'Tổng bán',
                desc: 'SL hàng bán ra x Đơn giá bán trên mỗi đơn hàng',
            },
            {
                annotation: 'Tổng trả',
                desc: 'Tổng giá trị hàng bán bị trả lại trên đơn trả hàng',
            },
            {
                annotation: 'Tổng chiết khấu',
                desc: 'Tổng chiết khấu của từng sản phẩm và chiết khẩu của cả đơn hàng. (Nếu báo cáo theo từng sản phẩm thì bằng Tổng chiết khấu của sản phẩm và chiết khẩu phân bổ từ tổng đơn hàng)',
            },
            {
                annotation: 'Phí giao hàng',
                desc: 'Là khoản phí giao hàng thu của khách trên đơn hàng',
            },
            {
                annotation: 'Doanh thu sau chiết khấu',
                desc: 'Tổng bán - Tổng chiết khấu',
            },
            {
                annotation: 'Doanh thu sau chiết khấu - trả hàng',
                desc: 'Tổng bán - Tổng chiết khấu - Tổng trả',
            },
            {
                annotation: 'Doanh thu sau chiết khấu - tiêu điểm - trả hàng',
                desc: 'Tổng bán - Tổng chiết khấu - Tổng trả - Tiêu điểm',
            },
            {
                annotation: 'Doanh thu',
                desc: 'Tổng bán - Tổng chiết khấu - Tổng trả - Tiêu điểm + Phí giao hàng (phí báo khách)',
            },
            {
                annotation: 'Thực thu',
                desc: 'Tiền mặt + chuyển khoản + quẹt thẻ + thanh toán QR pay',
            },
            {
                annotation: 'Tiền đã thanh toán',
                desc: 'Tiền mặt + chuyển khoản + quẹt thẻ + thanh toán QR pay + COD + thanh toán khác',
            },
            {
                annotation: 'Trung bình giá trị đơn hàng',
                desc: 'Giá trị Doanh thu Trung bình của các đơn hàng được giao thành công',
            },
        ],
        documentLink: 'https://hdsd-yody.gitbook.io/unicorn-free/bao-cao/huong-dan-su-dung-bao-cao-tinh-nang-co-ban'
    },
    {
        alias: UrlConfig.ANALYTIC_SALES_OFFLINE,
        cube: AnalyticCube.Payments,
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
        cube: AnalyticCube.Costs,
        data: [
            {
                annotation: 'SL hàng bán ra',
                desc: 'Số lượng hàng bán ra trên đơn hàng được giao thành công',
            },
            {
                annotation: 'SL hàng trả lại',
                desc: 'Số lượng hàng trả lại trên đơn hàng được giao thành công',
            },
            {
                annotation: 'SL hàng thực bán',
                desc: 'SL hàng bán ra - SL hàng trả lại',
            },
            {
                annotation: 'SL đơn hàng',
                desc: 'Số lượng đơn hàng được giao thành công trong khoảng thời gian đã chọn',
            },
            {
                annotation: 'SL khách hàng',
                desc: 'Số lượng khách hàng tương ứng trên các đơn hàng được giao thành công',
            },
            {
                annotation: 'Tiền hàng',
                desc: 'SL hàng bán ra x Đơn giá bán trên mỗi đơn hàng',
            },
            {
                annotation: 'Tiền hàng trả lại',
                desc: 'Giá trị hàng bán bị trả lại trên đơn trả hàng',
            },
            {
                annotation: 'Tổng chiết khấu',
                desc: 'Tổng chiết khấu của từng sản phẩm và chiết khẩu của cả đơn hàng. (Nếu báo cáo theo từng sản phẩm thì bằng Tổng chiết khấu của sản phẩm và chiết khẩu phân bổ từ tổng đơn hàng)',
            },
            {
                annotation: 'Thuế',
                desc: 'Thuế thu của khách hàng trên mỗi đơn hàng',
            },
            {
                annotation: 'Phí giao hàng',
                desc: 'Là khoản phí giao hàng thu của khách trên đơn hàng',
            },
            {
                annotation: 'Doanh thu',
                desc: 'Là số tiền cửa hàng thu được từ khách hàng trên mỗi đơn hàng',
            },
            {
                annotation: 'Doanh thu thuần',
                desc: 'Doanh thu - Thuế (nếu có) - Phí giao hàng (nếu có)',
            },
            {
                annotation: 'Tiền vốn',
                desc: 'Giá vốn x SL thực bán',
            },
            {
                annotation: 'Lợi nhuận gộp',
                desc: 'Doanh thu thuần - Tiền vốn + Phí giao hàng',
            },
            {
                annotation: 'Tỷ suất lợi nhuận gộp',
                desc: '(Lợi nhuận gộp / Doanh thu thuần) x 100%',
            },
            {
                annotation: 'Trung bình giá trị đơn hàng',
                desc: 'Giá trị Doanh thu Trung bình của các đơn hàng được giao thành công',
            },
        ],
        documentLink: 'https://hdsd-yody.gitbook.io/unicorn-free/bao-cao/huong-dan-su-dung-bao-cao-tinh-nang-co-ban'
    }
]