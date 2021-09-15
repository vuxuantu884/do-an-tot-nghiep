import { Card, Checkbox } from "antd";
// import { useState } from "react";

type PropType = {};
function CardReturnReceiveProducts(props: PropType) {
  // const [isReturn, setisReturn] = useState(false);

  const renderCardExtra = () => {
    return (
      <>
        <Checkbox />
        Đã nhận hàng trả lại
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
