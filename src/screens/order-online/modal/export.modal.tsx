import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Radio, Row, Space } from "antd";
import { useMemo, useState } from "react";
import { fields_order, fields_shipment, fields_return} from "../common/fields.export";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  type: string;
};

const ExportModal: React.FC<ExportModalProps> = (
  props: ExportModalProps
) => {
  const { visible, onCancel, onOk, type } = props;
  const [editFields, setEditFields] = useState(false); 
  const text = useMemo(
    () => {
      switch (type) { 
        case "orders":
          return "đơn hàng"
        case "shipments":
          return "đơn giao hàng"
        case "returns":
          return "đơn trả hàng"
        default: break
      }
    },
    [type]
  );
  const fields = useMemo(
    () => {
      switch (type) { 
        case "orders":
          return fields_order
        case "shipments":
          return fields_shipment
        case "returns":
          return fields_return
        default: break
      }
    },
    [type]
  );
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText="Xuất file"
      cancelText="Thoát"
      title={[
        <span style={{fontWeight: 600, fontSize: 16}}>
          {editFields && <span style={{ color: '#2a2a86', marginRight: '10px'}}><ArrowLeftOutlined onClick={() => setEditFields(false)}/></span>}
          Xuất file danh sách {text}
        </span>
      ]}
      width={800}
    >
      {!editFields && (
      <div>
        <p style={{ fontWeight: 500}}>Giới hạn kết quả xuất</p>
        <Radio.Group name="radiogroup" defaultValue={1}>
          <Space direction="vertical">
            <Radio value={1}>Tất cả {text}</Radio>
            <Radio value={2}>{text?.toUpperCase()} trên trang này</Radio>
            <Radio value={3}>Các {text} được chọn</Radio>
            <Radio value={4}>123 {text} phù hợp với điều kiện tìm kiếm hiện tại</Radio>
          </Space>
        </Radio.Group>
        <p style={{ fontWeight: 500}}>Loại file xuất</p>
        <Radio.Group name="radiogroup1" defaultValue={1}>
          <Space direction="vertical">
            <Radio value={1}>File tổng quan theo {text}</Radio>
            <Radio value={2}>{text?.toUpperCase()} trên trang này</Radio>
          </Space>
        </Radio.Group>
        <div>
        <Button type="link" style={{ padding: 0 }} onClick={() => setEditFields(true)}>Tuỳ chọn trường hiển thị</Button>
        </div>
      </div>
      )}
      {editFields && (
        <Radio.Group name="radiogroup" defaultValue={1}>
          <Row>
            {fields?.map((field) => (
              <Col span={8}><Radio value={field.value}>{field.name}</Radio></Col>
            ))}
          </Row>
        </Radio.Group>
      )}
    </Modal>
  );
};

export default ExportModal;

