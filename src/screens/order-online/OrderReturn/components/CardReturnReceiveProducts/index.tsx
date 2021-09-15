import { Card, Checkbox, Tag } from "antd";
import { StyledComponent } from "./styles";

type PropType = {
  isDetailPage?: boolean;
};
function CardReturnReceiveProducts(props: PropType) {
  const { isDetailPage } = props;

  const renderCardExtra = () => {
    return <Checkbox>Đã nhận hàng trả lại</Checkbox>;
  };

  const mainRender = () => {
    if (isDetailPage) {
      return (
        <Card
          className="margin-top-20"
          title={
            <div className="title-card">
              Nhận hàng
              <Tag className="orders-tag" color="success">
                Đã nhận hàng
              </Tag>
            </div>
          }
        />
      );
    }
    return (
      <Card
        className="margin-top-20"
        title="Đã nhận hàng trả lại"
        extra={renderCardExtra()}
      />
    );
  };

  return <StyledComponent>{mainRender()}</StyledComponent>;
}

export default CardReturnReceiveProducts;
