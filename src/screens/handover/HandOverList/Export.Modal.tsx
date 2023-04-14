import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Modal, Progress, Radio, Row, Space } from "antd";
import { useCallback, useState } from "react";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (optionExport: number) => void;
  total: number;
  exportProgress: number;
  statusExport: number;
  exportError?: string;
  selected?: boolean;
};

const ExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const {
    visible,
    onCancel,
    onOk,
    total,
    exportProgress,
    statusExport,
    selected = false,
    exportError = "Đã có lỗi xảy ra!!!",
  } = props;

  const [editFields, setEditFields] = useState(false);
  const [optionExport, setOptionExport] = useState<number>(selected ? 3 : 2);

  const submit = useCallback(() => {
    onOk(optionExport);
  }, [onOk, optionExport]);

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
          Xuất file danh sách biên bản bàn giao
        </span>,
      ]}
      footer={[
        <Button
          key="cancel"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onCancel}
        >
          Thoát
        </Button>,
        <Button
          key="ok"
          type="primary"
          onClick={() => submit()}
          disabled={statusExport !== 1}
          loading={statusExport === 2}
        >
          Xuất file
        </Button>,
      ]}
      width={600}
    >
      {statusExport === 1 && (
        <div>
          <p style={{ fontWeight: 500 }}>Giới hạn kết quả xuất</p>
          <Radio.Group
            name="radiogroup"
            defaultValue={selected ? 3 : 2}
            onChange={(e) => setOptionExport(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value={1}>Tất cả biên bản bàn giao</Radio>
              <Radio value={2}>Biên bản bàn giao trên trang này</Radio>
              <Radio value={3} disabled={!selected}>
                Các biên bản bàn giao được chọn
              </Radio>
              <Radio value={4}>
                {total} biên bản bàn giao phù hợp với điều kiện tìm kiếm hiện tại
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      )}

      {statusExport !== 1 && (
        <Row style={{ justifyContent: "center" }}>
          {statusExport === 2 && <p>Đang tạo file, vui lòng đợi trong giây lát</p>}
          {statusExport === 3 && <p>Đã tạo file thành công</p>}
          {statusExport === 4 && <p style={{ color: "#e24343" }}>{exportError}</p>}
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

export default ExportModal;
