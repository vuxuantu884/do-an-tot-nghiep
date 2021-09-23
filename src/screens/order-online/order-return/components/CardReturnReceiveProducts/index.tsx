import { Button, Card, Checkbox, Tag } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  isDetailPage?: boolean;
  isReceivedReturnProducts: boolean;
  handleReceivedReturnProducts: () => void;
};
function CardReturnReceiveProducts(props: PropType) {
  const {
    isDetailPage,
    isReceivedReturnProducts,
    handleReceivedReturnProducts,
  } = props;

  const renderCardTitle = () => {
    return (
      <React.Fragment>
        Nhận hàng
        {isReceivedReturnProducts && (
          <Tag className="orders-tag" color="success">
            Đã nhận hàng
          </Tag>
        )}
      </React.Fragment>
    );
  };
  const renderCardExtra = () => {
    if (isDetailPage) {
      if (!isReceivedReturnProducts) {
        return (
          <div className="actionReturn">
            <Button
              onClick={(e) => {
                handleReceivedReturnProducts();
              }}
            >
              Nhận hàng
            </Button>
          </div>
        );
      } else {
        return null;
      }
    }
    return (
      <div className="checkIfReturned">
        <Checkbox
          onChange={(e) => {
            if (e.target.checked === true) {
              handleReceivedReturnProducts();
            }
          }}
        >
          {!isDetailPage ? "Đã nhận hàng trả lại" : "Đã nhận hàng trả lại"}
        </Checkbox>
        {isDetailPage && <Button>Nhận hàng</Button>}
      </div>
    );
  };

  const mainRender = () => {
    if (isDetailPage) {
      return (
        <Card
          className="margin-top-20"
          title={<div className="title-card">{renderCardTitle()}</div>}
          extra={renderCardExtra()}
        />
      );
    }
    return (
      <Card
        className="margin-top-20"
        title={!isDetailPage ? "Nhận hàng" : "Đã nhận hàng trả lại"}
        extra={renderCardExtra()}
      />
    );
  };

  return <StyledComponent>{mainRender()}</StyledComponent>;
}

export default CardReturnReceiveProducts;
