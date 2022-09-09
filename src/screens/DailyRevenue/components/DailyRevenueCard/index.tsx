import { Button, Card, Col, Row } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  title: string;
  children: React.ReactNode;
  iconUrl?: string;
  cardBottomLeft?: React.ReactNode;
  cardBottomRightText?: React.ReactNode;
  handleCardBottomRightButtonClick?: () => void;
  cardBottomRightButtonText?: React.ReactNode;
};

function DailyRevenueCard(props: PropTypes) {
  const {
    title,
    children,
    iconUrl,
    cardBottomLeft,
    cardBottomRightText,
    handleCardBottomRightButtonClick,
    cardBottomRightButtonText,
  } = props;
  return (
    <StyledComponent>
      <Card title={title}>
        {children}
        <div className="cardBottom">
          <Row gutter={30}>
            <Col span={8} className="cardBottom-left">
              {iconUrl && <img src={iconUrl} alt="" className="cardBottom-left__icon" />}
              {cardBottomLeft}
            </Col>
            <Col span={16} className="cardBottom-right">
              {cardBottomRightText && (
                <span className="cardBottom-right__text">{cardBottomRightText}</span>
              )}
              {cardBottomRightButtonText && (
                <Button
                  type="primary"
                  onClick={() =>
                    handleCardBottomRightButtonClick && handleCardBottomRightButtonClick()
                  }
                  className="cardBottom-right__button"
                >
                  {cardBottomRightButtonText}
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default DailyRevenueCard;
