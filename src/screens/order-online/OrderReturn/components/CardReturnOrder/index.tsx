import { Card, Switch } from "antd";
import React from "react";

type PropType = {
  isDetailPage: boolean;
  isExchange: boolean;
  handleIsExchange?: (isExchange: boolean) => void;
};
function CardReturnOrder(props: PropType) {
  const { isDetailPage, isExchange, handleIsExchange } = props;
  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Switch
          className="ant-switch-primary"
          style={{ marginRight: 20 }}
          disabled={isDetailPage}
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
    <Card
      className="margin-top-20"
      title="Đổi hàng"
      extra={renderCardExtra()}
    />
  );
}

export default CardReturnOrder;
