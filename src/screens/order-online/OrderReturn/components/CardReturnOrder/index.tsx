import { Card, Switch } from "antd";
import React from "react";

type PropType = {
  isDetailPage: boolean;
};
function CardReturnOrder(props: PropType) {
  const { isDetailPage } = props;
  let checkFromProps = true;
  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Switch
          className="ant-switch-primary"
          style={{ marginRight: 20 }}
          disabled={!isDetailPage}
          defaultChecked={isDetailPage ? checkFromProps : false}
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
