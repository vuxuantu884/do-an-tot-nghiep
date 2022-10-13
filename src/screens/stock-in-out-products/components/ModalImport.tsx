import { Button, Col, Modal, Progress, Row, Typography } from "antd";
import { ImportStatusWrapper } from "../../inventory/ImportInventory/styles";
import React from "react";
import { ImportResponse } from "model/other/files/export-model";
const { Text } = Typography;

export interface ModalImportProps {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
  loading?: boolean;
  dataProcess: ImportResponse | undefined;
  dataUploadError: any;
  data: any;
}

const ModalImport: React.FC<ModalImportProps> = (props: ModalImportProps) => {
  const { visible, onOk, onCancel, dataUploadError, dataProcess, data, loading } = props;
  return (
    <Modal
      title="Nhập file"
      onCancel={onCancel}
      visible={visible}
      footer={[
        <Button
          key="back"
          onClick={onCancel}
        >
          Huỷ
        </Button>,
        <Button
          loading={loading}
          disabled={loading || (data && data?.data && JSON.parse(data?.data).length === 0)}
          type="primary"
          onClick={onOk}
        >
          Xác nhận
        </Button>
      ]}
    >
      <ImportStatusWrapper>
        <Row className="status">
          <Col span={6}>
            <div>
              <Text>Tổng cộng</Text>
            </div>
            <div>
              <b>{dataProcess?.total_process}</b>
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
                <b>{dataProcess?.error}</b>
              </Text>
            </div>
          </Col>

          <Row className="status">
            <Progress percent={dataProcess?.percent} />
          </Row>
        </Row>
        <Row className="import-info">
          <div className="title">
            <b>Chi tiết: </b>
          </div>
          <div className="content">
            <ul>
              {dataUploadError ? (
                dataUploadError.map((item: any) => {
                  return (
                    <li>
                      <span className="danger">&#8226;</span>
                      <Text type="danger">{item}</Text>
                    </li>
                  );
                })
              ) : (
                <li>
                  <span className="success">&#8226;</span>
                  <Text type="success">
                    {data?.status === "FINISH" ? "Thành công" : "Đang xử lý..."}
                  </Text>
                </li>
              )}
            </ul>
          </div>
        </Row>
      </ImportStatusWrapper>
    </Modal>
  );
};

export default ModalImport;
