import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Modal, Radio, Space } from "antd";
import { useMemo, useState } from "react";

type ImportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  type: string;
};

const ImportModal: React.FC<ImportModalProps> = (
  props: ImportModalProps
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
  // const fields = useMemo(
  //   () => {
  //     switch (type) { 
  //       case "orders":
  //         return ['1', '2']
  //       case "shipments":
  //         return ['1', '2', '3']
  //       case "returns":
  //         return ['1', '2', '3', '4']
  //       default: break
  //     }
  //   },
  //   [type]
  // );
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
      width={600}
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
      <div>
        <Radio.Group name="radiogroup" defaultValue={1}>
          <Radio value={1}>Fields 1 2 3</Radio>
        </Radio.Group>
      </div>
      )}
    </Modal>
  );
};

export default ImportModal;

