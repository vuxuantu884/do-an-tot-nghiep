import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Modal, Progress, Radio, Row, Space } from "antd";
import { useMemo, useState } from "react";
import { fields_order, fields_shipment, fields_return} from "../common/fields.export";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  type?: string;
  total: number;
  exportProgress: number;
  statusExport: number;
};

const ExportModal: React.FC<ExportModalProps> = (
  props: ExportModalProps
) => {
  const { visible, onCancel, onOk, type, total, exportProgress, statusExport } = props;
  // statusExport: 1 not export, 2 exporting, 3 export success, 4 export error

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
  const text1 = useMemo(
    () => {
      switch (type) { 
        case "orders":
          return "Đơn hàng"
        case "shipments":
          return "Đơn giao hàng"
        case "returns":
          return "Đơn trả hàng"
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
        default:
          return []
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
      footer={[
        <Button key="ok"
          onClick={onOk}
          disabled={statusExport !== 1}
          loading={statusExport === 2}
        >
          Xuất file
        </Button>,
        <Button
          key="cancel"
          type="primary"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onCancel}
        >
          Thoát
        </Button>,
        
      ]}
      width={800}
    >
      {!editFields && statusExport === 1&& (
      <div>
        <p style={{ fontWeight: 500}}>Giới hạn kết quả xuất</p>
        <Radio.Group name="radiogroup" defaultValue={4}>
          <Space direction="vertical">
            <Radio disabled value={1}>Tất cả {text}</Radio>
            <Radio disabled value={2}>{text1} trên trang này</Radio>
            <Radio disabled value={3}>Các {text} được chọn</Radio>
            <Radio value={4}>{total} {text} phù hợp với điều kiện tìm kiếm hiện tại</Radio>
          </Space>
        </Radio.Group>
        <p style={{ fontWeight: 500}}>Loại file xuất</p>
        <Radio.Group name="radiogroup1" defaultValue={1}>
          <Space direction="vertical">
            <Radio value={1}>File tổng quan theo {text}</Radio>
            <Radio disabled value={2}>{text1} trên trang này</Radio>
          </Space>
        </Radio.Group>
        <div>
        <Button type="link" style={{ padding: 0 }} onClick={() => setEditFields(true)}>Tuỳ chọn trường hiển thị</Button>
        </div>
      </div>
      )}
      {editFields && statusExport === 1 && (
        <Checkbox.Group
          name="radiogroup"
          defaultValue={fields.map(i => {
            return i.value
          })}
        >
          <Row>
            {fields?.map((field) => (
              <Col span={8}><Checkbox value={field.value}>{field.name}</Checkbox></Col>
            ))}
          </Row>
        </Checkbox.Group>
        // <Checkbox.Group
        //   options={fields.map(i => {
        //     return {
        //       label: i.name,
        //       value: i.value
        //     }
        //   })}
        //   // disabled
        //   defaultValue={['Apple']}
        //   // onChange={onChange}
        // />
      )}
      {statusExport !== 1 && (
      <Row style={{ justifyContent: 'center'}}>
        <p>Đang tạo file, vui lòng đợi trong giây lát</p>
        <Row style={{ justifyContent: 'center', width: '100%'}}><Progress
          type="circle"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          percent={exportProgress}
        /></Row>
      </Row>)}
    </Modal>
  );
};

export default ExportModal;

