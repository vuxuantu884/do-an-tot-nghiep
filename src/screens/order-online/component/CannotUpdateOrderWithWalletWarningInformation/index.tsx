import { Alert } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropTypes = {};

function CannotUpdateOrderWithWalletWarningInformation(props: PropTypes): JSX.Element {
  return (
    <StyledComponent>
      <Alert
        message={
          <StyledComponent>
            <div className="wrapper">
              <p>Lưu ý : Không thể điều phối đơn hàng khi chờ khách thanh toán qua ví điện tử</p>
              <ul>
                <li>Thời hạn thanh toán là 24h kể từ thời điểm tạo đơn</li>
                <li>
                  Trong vòng 30 phút mà khách chưa thanh toán sale cần gọi hay nhắn tin cho khách để
                  xác nhận thanh toán. Nếu khách hủy thanh toán qua ví bạn có thể bấm nút "Hủy giao
                  dịch" để có thể điều phối đơn
                </li>
              </ul>
            </div>
          </StyledComponent>
        }
        type="warning"
        closable
      />
    </StyledComponent>
  );
}

export default CannotUpdateOrderWithWalletWarningInformation;
