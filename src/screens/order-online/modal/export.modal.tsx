import { ArrowLeftOutlined } from "@ant-design/icons";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button, Checkbox, Col, Modal, Progress, Radio, Row, Space } from "antd";
import { useMemo, useState } from "react";
// import { fields_order, fields_shipment, fields_return} from "../common/fields.export";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (optionExport: number, typeExport: number, fieldsExport?: Array<string>) => void;
  type?: string;
  total: number;
  exportProgress: number;
  statusExport: number;
  selected?: boolean;
};

const ExportModal: React.FC<ExportModalProps> = (
  props: ExportModalProps
) => {
  const { visible, onCancel, onOk, type, total, exportProgress, statusExport, selected = false } = props;
  // statusExport: 1 not export, 2 exporting, 3 export success, 4 export error
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
  // const fields = useMemo(
  //   () => {
  //     switch (type) { 
  //       case "orders":
  //         return fields_order
  //       case "shipments":
  //         return fields_shipment
  //       case "returns":
  //         return fields_return
  //       default:
  //         return []
  //     }
  //   },
  //   [type]
  // );
  const [optionExport, setOptionExport] = useState<number>(selected ? 3 : (type === "orders" ? 2 : 1));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [typeExport, setTypeExport] = useState<number>(1);
  // const [fieldsExport, setFieldsExport] = useState<Array<any>>(fields.map(i => {
  //   return i.value
  // }));
  const [editFields, setEditFields] = useState(false);
  
  return (
    <Modal
      onCancel={onCancel}
      // onOk={onOk}
      visible={visible}
      centered
      // okText="Xuất file"
      // cancelText="Thoát"
      title={[
        <span style={{fontWeight: 600, fontSize: 16}}>
          {editFields && <span style={{ color: '#2a2a86', marginRight: '10px'}}><ArrowLeftOutlined onClick={() => setEditFields(false)}/></span>}
          Xuất file danh sách {text}
        </span>
      ]}
      footer={[
        <Button
          key="cancel"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onCancel}
          >
          Thoát
        </Button>,
        <Button key="ok"
          type="primary"
          onClick={() => onOk(optionExport, typeExport)}
          disabled={statusExport !== 1}
          loading={statusExport === 2}
        >
          Xuất file
        </Button>,
        
      ]}
      width={600}
    >
      {!editFields && statusExport === 1 && (
      <div>
        <p style={{ fontWeight: 500}}>Giới hạn kết quả xuất</p>
        <Radio.Group name="radiogroup" defaultValue={selected ? 3 : (type === "orders" ? 2 : 1)} onChange={(e) => setOptionExport(e.target.value)}>
          <Space direction="vertical">
            <Radio value={1} disabled={type === "orders"}>Tất cả {text}</Radio>
            <Radio value={2}>{text1} trên trang này</Radio>
            <Radio value={3} disabled={!selected}>Các {text} được chọn</Radio>
            <Radio value={4}>{total} {text} phù hợp với điều kiện tìm kiếm hiện tại</Radio>
          </Space>
        </Radio.Group>
        {/* <p style={{ fontWeight: 500}}>Loại file xuất</p>
        <Radio.Group name="radiogroup1" defaultValue={1} onChange={(e) => setTypeExport(e.target.value)}>
          <Space direction="vertical">
            <Radio value={1}>File tổng quan theo {text}</Radio>
            <Radio value={2}>File chi tiết</Radio>
          </Space>
        </Radio.Group>
        <div>
        <Button type="link" style={{ padding: 0 }} onClick={() => setEditFields(true)}>Tuỳ chọn trường hiển thị</Button>
        </div> */}
      </div>
      )}
      {/* {editFields && statusExport === 1 && (
        <Checkbox.Group
          name="radiogroup"
          defaultValue={fieldsExport}
          onChange={e => setFieldsExport(e)}
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
      )} */}
      {statusExport !== 1 && (
      <Row style={{ justifyContent: 'center'}}>
        {statusExport === 2 && <p>Đang tạo file, vui lòng đợi trong giây lát</p>}
        {statusExport === 3 && <p>Đã tạo file thành công</p>}
        {statusExport === 4 && <p style={{ color: "#e24343"}}>Đã có lỗi xảy ra!!!</p>}
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

