import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Modal, Progress, Row } from "antd";
import { useState } from "react";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: () => void;
  exportProgress: number;
  statusExport: number;
};

const InventoryTransferExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const { visible, onCancel, exportProgress, statusExport = false } = props;
  const [editFields, setEditFields] = useState(false);

  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      centered
      title={[
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          {editFields && (
            <span style={{ color: "#2a2a86", marginRight: "10px" }}>
              <ArrowLeftOutlined onClick={() => setEditFields(false)} />
            </span>
          )}
          Xuất file
        </span>,
      ]}
      footer={[
        <Button
          key="cancel"
          type="primary"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onCancel}
        >
          Thoát
        </Button>,
      ]}
      width={600}
    >
      {statusExport === 1 && (
        <Row style={{ justifyContent: "center" }}>
          <p>Đang gửi yêu cầu, vui lòng đợi trong giây lát ...</p>
        </Row>
      )}
      {statusExport !== 1 && (
        <Row style={{ justifyContent: "center" }}>
          {statusExport === 2 && <p>Đang tạo file, vui lòng đợi trong giây lát</p>}
          {statusExport === 3 && <p>Đã tạo file thành công</p>}
          {statusExport === 4 && <p>Đã có lỗi xảy ra!!!</p>}
          <Row style={{ justifyContent: "center", width: "100%" }}>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProgress}
            />
          </Row>
        </Row>
      )}
    </Modal>
  );
};

export default InventoryTransferExportModal;
