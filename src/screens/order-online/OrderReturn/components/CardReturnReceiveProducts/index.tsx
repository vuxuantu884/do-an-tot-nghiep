import { Card, Checkbox, Switch } from "antd";
import { useState } from "react";

type PropType = {};
function CardReturnReceiveProducts(props: PropType) {
  const [isReturn, setisReturn] = useState(false);

  const renderCardExtra = () => {
    return (
      <>
        <Checkbox />
        Đơn hàng có đổi trả hàng
      </>
    );
  };

  return (
    <Card
      className="margin-top-20"
      title="Đã nhận hàng trả lại"
      extra={renderCardExtra()}
    />
  );
}

export default CardReturnReceiveProducts;
