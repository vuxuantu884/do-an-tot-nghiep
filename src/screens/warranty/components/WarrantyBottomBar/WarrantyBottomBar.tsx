import { Button, Col, Row } from "antd";
import React from "react";
import { StyledComponent } from "./WarrantyBottomBar.style";

type PropTypes = {
  onOK: () => void;
  onCancel: () => void;
};

function WarrantyBottomBar(props: PropTypes) {
  const { onOK, onCancel } = props;

  return (
    <StyledComponent>
      <div className="bottomBar">
        <Row gutter={24}>
          <Col md={12}></Col>
          <Col md={12} className="bottomBar__right">
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <Button
                style={{ padding: "0 25px", marginRight: 20, fontWeight: 400 }}
                onClick={onCancel}>
                Huỷ
              </Button>
              <Button type="primary" onClick={onOK}>
                Lưu
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </StyledComponent>
  );
}

export default WarrantyBottomBar;
