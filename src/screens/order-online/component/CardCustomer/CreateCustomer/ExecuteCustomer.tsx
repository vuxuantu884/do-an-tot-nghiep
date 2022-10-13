import { Button, Col } from "antd";
import React from "react";

type Props = {
  customerChange: boolean;
  CustomerDeleteInfo: () => void;
  onOkPress: () => void;
};

const ExecuteCustomer: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Col md={12} className="execute-button">
        {props.customerChange === true && (
          <Button
            type="primary"
            onClick={() => {
              props.onOkPress();
            }}
          >
            Thêm mới
          </Button>
        )}

        <Button
          className="ant-btn-outline fixed-button cancle-button"
          onClick={() => {
            props.CustomerDeleteInfo();
          }}
        >
          Hủy
        </Button>
      </Col>
    </React.Fragment>
  );
};

export default ExecuteCustomer;
