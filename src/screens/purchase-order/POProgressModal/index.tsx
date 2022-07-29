import { Button, Col, Modal, Progress, Row, Typography } from "antd";
import React from "react";
import { POProgressWrapper } from "./style";

type DataProcess = {
  success: number;
  total: number;
  processed: number;
  errors: number;
  message_errors: Array<string>;
};

interface POProgressModalProps {
  dataProcess?: DataProcess;
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const POProgressModal: React.FC<POProgressModalProps> = (props: POProgressModalProps) => {
  const { dataProcess, visible, onOk, onCancel } = props;
  const { Text } = Typography;
  return (
    <Modal
      title="Nhập file"
      centered
      onCancel={onCancel}
      visible={visible}
      footer={[<Button onClick={onOk}>Xác nhận</Button>]}
    >
      <POProgressWrapper>
        <Row className="status">
          <Col span={6}>
            <div>
              <Text>Tổng cộng</Text>
            </div>
            <div>
              <b>{dataProcess?.total}</b>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text>Đã xử lí</Text>
            </div>
            <div>
              <b>{dataProcess?.processed}</b>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text>Thành công</Text>
            </div>
            <div>
              <Text type="success">
                <b>{dataProcess?.success}</b>
              </Text>
            </div>
          </Col>
          <Col span={6}>
            <div>Lỗi</div>
            <div>
              <Text type="danger">
                <b>{dataProcess?.errors}</b>
              </Text>
            </div>
          </Col>

          <Row className="status">
            <Progress
              percent={
                dataProcess &&
                parseFloat(((dataProcess?.success / dataProcess?.total) * 100).toFixed(2))
              }
            />
          </Row>
        </Row>
        <Row className="import-info">
          <div className="title">
            <b>Chi tiết: </b>
          </div>
          <div className="content">
            <ul>
              {dataProcess?.errors === 0 ? (
                <li>
                  <span className="success">&#8226;</span>
                  <Text type="success">Thành công</Text>
                </li>
              ) : (
                dataProcess?.message_errors.map((item: string) => (
                  <li>
                    <span className="danger">&#8226;</span>
                    <Text type="danger">{item}</Text>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Row>
      </POProgressWrapper>
    </Modal>
  );
};

export default POProgressModal;
