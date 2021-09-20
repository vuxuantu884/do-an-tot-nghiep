import { Card, Checkbox, Tag } from "antd";
import { StyledComponent } from "./styles";

type PropType = {
  isDetailPage?: boolean;
  isReceiveReturnProducts: boolean;
  handleReceiveReturnProducts: (value: boolean) => void;
};
function CardReturnReceiveProducts(props: PropType) {
  const { isDetailPage, handleReceiveReturnProducts } = props;

  const renderCardExtra = () => {
    return (
      <Checkbox onChange={(e) => handleReceiveReturnProducts(e.target.checked)}>
        Đã nhận hàng trả lại
      </Checkbox>
    );
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
