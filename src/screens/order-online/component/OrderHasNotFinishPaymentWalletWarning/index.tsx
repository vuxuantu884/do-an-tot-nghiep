import { StyledComponent } from "./styles";

type PropTypes = {};

function OrderHasNotFinishPaymentWalletWarning(props: PropTypes) {
  return (
    <StyledComponent>
      <div className="orderPaidByWalletWarning">
        <p>Lưu ý : Không thể điều phối đơn hàng khi chờ khách thanh toán qua ví điện tử</p>
        <ul>
          <li>Thời hạn thanh toán là 24h kể từ thời điểm tạo đơn</li>
          <li>
            Trong vòng 30 phút mà khách chưa thanh toán sale cần gọi hay nhắn tin cho khách để xác
            nhận thanh toán. Nếu khách hủy thanh toán qua ví bạn có thể bấm nút "Hủy giao dịch" để
            có thể điều phối đơn
          </li>
        </ul>
      </div>
    </StyledComponent>
  );
}

export default OrderHasNotFinishPaymentWalletWarning;
