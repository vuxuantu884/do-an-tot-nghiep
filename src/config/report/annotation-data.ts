import UrlConfig from "config/url.config";
import { AnalyticCube, AnnotationData } from "model/report/analytics.model";


export const AnnotationDataList: AnnotationData[] = [
    {
        alias: UrlConfig.ANALYTIC_SALES,
        cube: AnalyticCube.Sales,
        data: [
            {
                annotation: 'SL hàng bán ra',
                desc: 'Số lượng hàng bán ra trên đơn hàng được giao thành công',
                key: '1',
            },
            {
                annotation: 'SL hàng trả lại',
                desc: 'Số lượng hàng trả lại trên đơn hàng được giao thành công',
                key: '2',
            },
            {
                annotation: 'SL hàng thực bán',
                desc: 'SL hàng bán ra - SL hàng trả lại',
                key: '3',
            },
            {
                annotation: 'SL đơn hàng',
                desc: 'Số lượng đơn hàng được giao thành công trong khoảng thời gian đã chọn',
                key: '4',
            },
            {
                annotation: 'SL khách hàng',
                desc: 'Số lượng khách hàng tương ứng trên các đơn hàng được giao thành công',
                key: '5',
            },
            // {
            //     annotation: 'Tiền hàng',
            //     desc: 'SL hàng bán ra x Đơn giá bán trên mỗi đơn hàng',
            //     key: '6',
            // },
            {
                annotation: 'Tiền hàng trả lại',
                desc: 'Giá trị hàng bán bị trả lại trên đơn trả hàng',
                key: '7',
            },
            {
                annotation: 'Tổng chiết khấu',
                desc: 'Tổng chiết khấu của từng sản phẩm và chiết khẩu của cả đơn hàng. (Nếu báo cáo theo từng sản phẩm thì bằng Tổng chiết khấu của sản phẩm và chiết khẩu phân bổ từ tổng đơn hàng)',
                key: '8',
            },
            {
                annotation: 'Thuế',
                desc: 'Thuế thu của khách hàng trên mỗi đơn hàng',
                key: '9',
            },
            {
                annotation: 'Phí giao hàng',
                desc: 'Là khoản phí giao hàng thu của khách trên đơn hàng',
                key: '10',
            },
            {
                annotation: 'Doanh thu',
                desc: 'Là số tiền cửa hàng thu được từ khách hàng trên mỗi đơn hàng',
                key: '11',
            },
            {
                annotation: 'Doanh thu thuần',
                desc: 'Doanh thu - Thuế (nếu có) - Phí giao hàng (nếu có)',
                key: '12',
            },
            {
                annotation: 'Tiền vốn',
                desc: 'Giá vốn x SL thực bán',
                key: '13',
            },
            // {
            //     annotation: 'Lợi nhuận gộp',
            //     desc: 'Doanh thu thuần - Tiền vốn + Phí giao hàng',
            //     key: '14',
            // },
            // {
            //     annotation: 'Tỷ suất lợi nhuận gộp',
            //     desc: '(Lợi nhuận gộp / Doanh thu thuần) x 100%',
            //     key: '15',
            // },
            {
                annotation: 'Trung bình giá trị đơn hàng',
                desc: 'Giá trị Doanh thu Trung bình của các đơn hàng được giao thành công',
                key: '16',
            },
        ],
        documentLink: 'https://app.gitbook.com/s/79mx4pT4glDghA6m7pIw/bao-cao/bao-cao-ban-hang'
    },
    {
        alias: UrlConfig.ANALYTIC_SALES,
        cube: AnalyticCube.Payments,
        data: [
            {
                annotation: 'Tiền đã thanh toán',
                desc: 'Tổng số tiền đã thanh toán (Tiền mặt + Chuyển khoản + COD + Điểm + Quẹt thẻ + QR Pay + Thanh toán khác)',
                key: '1',
            },
            {
                annotation: 'Tiền mặt',
                desc: 'Số lượng tiền được trả qua phương thức tiền mặt',
                key: '2',
            },
            {
                annotation: 'Chuyển khoản',
                desc: 'Số lượng tiền chuyển khoản khách hàng đã chuyển',
                key: '3',
            },
            {
                annotation: 'COD',
                desc: 'Số lượng tiền được trả bằng COD',
                key: '4',
            },
            {
                annotation: 'Thanh toán bằng điểm',
                desc: 'Số lượng điểm được dùng sau khi quy ra tiền để thanh toán',
                key: '5',
            },
            {
                annotation: 'Quẹt thẻ',
                desc: 'Số lượng tiền được trả qua phương thức quẹt thẻ',
                key: '6',
            },
            {
                annotation: 'Thanh toán QR Pay',
                desc: 'Số lượng tiền được trả qua phương thức QR Pay',
                key: '7',
            },
            {
                annotation: 'Thanh toán khác',
                desc: 'Số lượng tiền được trả theo phương thức khác (Shopee…)',
                key: '8',
            },
        ],
        documentLink: 'https://app.gitbook.com/s/79mx4pT4glDghA6m7pIw/bao-cao/bao-cao-ban-hang'
    }
]