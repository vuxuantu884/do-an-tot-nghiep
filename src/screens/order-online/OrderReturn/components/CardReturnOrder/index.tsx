import { Card, Switch } from "antd";

type PropType = {};
function CardReturnOrder(props: PropType) {
  const renderCardExtra = () => {
    return (
      <>
        <Switch className="ant-switch-primary" style={{ marginLeft: 20 }} />
        Đơn hàng có đổi trả hàng
      </>
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
