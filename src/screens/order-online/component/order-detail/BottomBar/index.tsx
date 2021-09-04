import { Button, Col, FormInstance, Row } from "antd";
import CreateBillStep from "component/header/create-bill-step";
import React from "react";
import { OrderStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropType = {
  isVisibleGroupButtons?: boolean;
  stepsStatusValue?: string;
  formRef?: React.RefObject<FormInstance<any>>;
  handleTypeButton?: (type: string) => void;
  showSaveAndConfirmModal?: () => void;
};

const OrderDetailBottomBar: React.FC<PropType> = (props: PropType) => {
  const {
    isVisibleGroupButtons,
    stepsStatusValue,
    formRef,
    handleTypeButton,
    showSaveAndConfirmModal,
  } = props;

  return (
    <StyledComponent>
      <Row gutter={24}>
        <Col
          md={10}
          style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px" }}
        >
          <CreateBillStep status={stepsStatusValue} orderDetail={null} />
        </Col>
        {isVisibleGroupButtons &&
          formRef &&
          handleTypeButton &&
          showSaveAndConfirmModal && (
            <Col md={9} style={{ marginTop: "8px" }}>
              <Button
                style={{ padding: "0 25px", fontWeight: 400 }}
                className="ant-btn-outline fixed-button cancle-button"
                onClick={() => window.location.reload()}
              >
                Huỷ
              </Button>
              <Button
                style={{ padding: "0 25px", fontWeight: 400 }}
                className="create-button-custom ant-btn-outline fixed-button"
                type="primary"
                onClick={showSaveAndConfirmModal}
              >
                Lưu nháp
              </Button>
              <Button
                style={{ padding: "0 25px", fontWeight: 400 }}
                type="primary"
                className="create-button-custom"
                id="save-and-confirm"
                onClick={() => {
                  handleTypeButton(OrderStatus.FINALIZED);
                  console.log(
                    "formRef.current.value",
                    formRef?.current?.getFieldsValue()
                  );
                  formRef.current?.submit();
                }}
              >
                Lưu và Xác nhận
              </Button>
            </Col>
          )}
      </Row>
    </StyledComponent>
  );
};

export default OrderDetailBottomBar;
