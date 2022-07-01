import { OrderResponse } from "model/response/order/order.response";
import { dangerColor, textBodyColor } from "utils/global-styles/variables";
import IconDocument from "./images/IconDocument";
import { StyledComponent } from "./styles";

type PropTypes = {
  handleClickOrderBillRequestButton: () => void;
  orderDetail: OrderResponse | null | undefined;
};

function OrderBillRequestButton(props: PropTypes) {
  const { handleClickOrderBillRequestButton, orderDetail } = props;

  return (
    <StyledComponent>
      <div className={`exportRequest ${orderDetail ? null : "isCreate"}`}>
        <span
          className="buttonExportRequest"
          onClick={() => handleClickOrderBillRequestButton()}
        >
          <span className="icon">
            <IconDocument color={orderDetail ? dangerColor : textBodyColor }/>
          </span>
          {orderDetail ? "Thông tin xuất hóa đơn" : "Yêu cầu xuất hóa đơn" }
        </span>
      </div>
    </StyledComponent>
  );
}

export default OrderBillRequestButton;
