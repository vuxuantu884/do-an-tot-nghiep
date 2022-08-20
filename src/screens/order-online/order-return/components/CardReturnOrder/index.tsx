import { Card, Switch } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  isDetailPage: boolean;
  isExchange: boolean;
  isStepExchange: boolean;
  handleIsExchange?: (isExchange: boolean) => void;
};
function CardReturnOrder(props: PropTypes) {
  const { isDetailPage, isExchange, handleIsExchange, isStepExchange } = props;
  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Switch
          className="ant-switch-primary"
          style={{ marginRight: 20 }}
          disabled={isDetailPage || isStepExchange}
          defaultChecked={isDetailPage ? isExchange : false}
          onChange={(checked) => {
            if (handleIsExchange) {
              handleIsExchange(checked);
            }
          }}
        />
        Đơn hàng có đổi trả hàng
      </React.Fragment>
    );
  };

  return (
    <StyledComponent>
      <Card className="cardNoBody" title="Đổi hàng" extra={renderCardExtra()} />
    </StyledComponent>
  );
}

export default CardReturnOrder;
