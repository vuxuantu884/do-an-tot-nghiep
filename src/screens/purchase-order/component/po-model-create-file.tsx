import { Button, Col, Modal, Progress, Row, Typography } from "antd";
import { ImportStatusWrapper } from "screens/inventory/ImportInventory/styles";

const { Text } = Typography;

interface IProps {
  onCancel: () => void;
  onEnter: () => void;
  visible: boolean;
}

export const POModelCreateFile = (props: IProps) => {
  const { onCancel, onEnter, visible } = props;

  return (
    <Modal
      title="Nhập file"
      centered
      visible={visible}
      footer={[
        <Button key="back" onClick={onCancel}>
          Huỷ
        </Button>,
        <Button type="primary" onClick={onEnter}>
          Xác nhận
        </Button>,
      ]}
    >
      <ImportStatusWrapper>
        <Row className="status">
          <Col span={6}>
            <div>
              <Text>Tổng cộng</Text>
            </div>
            <div>{/* <b>{dataProcess?.total_process}</b> */}</div>
          </Col>
          <Col span={6}>
            <div>
              <Text>Đã xử lí</Text>
            </div>
            <div>{/* <b>{dataProcess?.processed}</b> */}</div>
          </Col>
          <Col span={6}>
            <div>
              <Text>Thành công</Text>
            </div>
            <div>
              <Text type="success">{/* <b>{dataProcess?.success}</b> */}</Text>
            </div>
          </Col>
          <Col span={6}>
            <div>Lỗi</div>
            <div>
              <Text type="danger">{/* <b>{dataProcess?.error}</b> */}</Text>
            </div>
          </Col>

          <Row className="status">{/* <Progress percent={dataProcess?.percent} /> */}</Row>
        </Row>
        <Row className="import-info">
          <div className="title">
            <b>Chi tiết: </b>
          </div>
          <div className="content">
            {/* <ul>
                            {dataUploadError ? (
                                dataUploadError.map((item) => {
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
                        </ul> */}
          </div>
        </Row>
      </ImportStatusWrapper>
    </Modal>
  );
};
