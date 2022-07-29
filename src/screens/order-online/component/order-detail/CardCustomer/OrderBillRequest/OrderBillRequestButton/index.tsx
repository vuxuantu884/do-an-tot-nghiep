import { OrderResponse } from "model/response/order/order.response";
import { dangerColor } from "utils/global-styles/variables";
import IconDocument from "./images/IconDocument";
import { StyledComponent } from "./styles";

type PropTypes = {
  handleClickOrderBillRequestButton: () => void;
  orderDetail: OrderResponse | null | undefined;
  color: string;
};

function OrderBillRequestButton(props: PropTypes) {
  const { handleClickOrderBillRequestButton, orderDetail, color } = props;

  return (
    <StyledComponent>
      <div className={`exportRequest ${color === dangerColor ? null : "isCreate"}`}>
        <span className="buttonExportRequest" onClick={() => handleClickOrderBillRequestButton()}>
          <span className="icon">
            <IconDocument color={color} />
          </span>
          {orderDetail ? "Thông tin xuất hóa đơn" : "Yêu cầu xuất hóa đơn"}
        </span>
      </div>
    </StyledComponent>
  );
}

export default OrderBillRequestButton;
