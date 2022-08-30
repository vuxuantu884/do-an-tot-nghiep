import { Button, Col, Modal, Progress, Row, Spin, Typography } from "antd";
import React from "react";
import { POProgressWrapper } from "./style";

export type DataProcess = {
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
  loading?: boolean;
}

const POProgressModal: React.FC<POProgressModalProps> = (props: POProgressModalProps) => {
  const { dataProcess, visible, onOk, onCancel, loading } = props;
  const { Text } = Typography;
  return (
    <Modal
      title="Nhập file"
      centered
      onCancel={() => {
        !loading && onCancel();
      }}
      visible={visible}
      footer={[
        <Button disabled={loading} onClick={onOk}>
          Xác nhận
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
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
            {!loading && (
              <Row className="status">
                <Progress
                  percent={
                    dataProcess &&
                    parseFloat(((dataProcess?.success / dataProcess?.total) * 100).toFixed(2))
                  }
                />
              </Row>
            )}
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
      </Spin>
    </Modal>
  );
};

export default POProgressModal;
