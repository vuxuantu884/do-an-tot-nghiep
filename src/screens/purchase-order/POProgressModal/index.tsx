import { Button, Col, Modal, Progress, Row, Typography } from "antd";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { POProgressWrapper } from "./style";

export type DataProcess = {
  success: number;
  total: number;
  processed: number;
  errors: number;
  message_errors: Array<string>;
};

type YDProgressModalProps = {
  dataProcess?: DataProcess;
  onOk: () => void;
  onCancel: () => void;
  loading?: boolean;
  isShowCancelBtn?: boolean;
};

export type YDProgressModalHandle = {
  openModal: () => void;
  closeModal: () => void;
};

const YDProgressModal: React.ForwardRefRenderFunction<
  YDProgressModalHandle,
  YDProgressModalProps
> = (props: YDProgressModalProps, ref) => {
  const { dataProcess, onOk, onCancel, loading, isShowCancelBtn } = props;
  const [isVisible, setIsVisible] = useState(false);
  const { Text } = Typography;

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsVisible(true);
    },
    closeModal() {
      setIsVisible(false);
    },
  }));

  return (
    <Modal
      title="Nhập file"
      centered
      onCancel={() => {
        !loading && onCancel();
      }}
      visible={isVisible}
      footer={[
        isShowCancelBtn && (
          <Button key="back" onClick={onCancel}>
            Huỷ
          </Button>
        ),
        <Button loading={loading} disabled={loading} onClick={onOk}>
          Xác nhận
        </Button>,
      ]}
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
                  <Text type="success">{loading ? "Chờ xử lý..." : "Thành công"}</Text>
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

export default forwardRef(YDProgressModal);
