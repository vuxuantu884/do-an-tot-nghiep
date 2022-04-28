import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Modal, Progress, Radio, Row, Space } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fields_order_online, fields_order_offline } from "../common/fields.export";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (optionExport: number, fieldsExport?: string) => void;
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
        case "orders_online":
          return "đơn hàng";
        case "orders_offline":
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
        case "orders_online":
          return "Đơn hàng"
        case "orders_offline":
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
        case "orders_online":
          return fields_order_online;
        case "orders_offline":
          return fields_order_offline;
        // case "shipments":
        //   return fields_shipment
        // case "returns":
        //   return fields_return
        default:
          return []
      }
    },
    [type]
  );
  const [optionExport, setOptionExport] = useState<number>(selected ? 3 : (type === "orders_online" || type === "orders_offline" ? 2 : 1));
  // const [typeExport, setTypeExport] = useState<number>(1);
  const [fieldsExport, setFieldsExport] = useState<Array<any>>(fields.map(i => {
    return i.value
  }));

  useEffect(() => {
    switch (type) {
      case "orders_online":
        const fieldsExportOrdersOnline = localStorage.getItem("orders_online_fields_export");
        fieldsExportOrdersOnline && setFieldsExport(JSON.parse(fieldsExportOrdersOnline));
        break;
      case "orders_offline":
        const fieldsExportOrdersOffline = localStorage.getItem("orders_offline_fields_export");
        fieldsExportOrdersOffline && setFieldsExport(JSON.parse(fieldsExportOrdersOffline));
        break;
      // case "shipments":
      //   return fields_shipment
      // case "returns":
      //   return fields_return
      default: break;
    }
  }, [type]);
  const [editFields, setEditFields] = useState(false);

  const submit = useCallback(
    ()=> {
      let hidden_fields = [...fields];
      fieldsExport.forEach((field: string) => {
        let findIndex = hidden_fields.findIndex(i => i.value === field);
        hidden_fields.splice(findIndex, 1);
      });
      // console.log('hidden_fields', hidden_fields);
      let hidden_fields_text = "";
      hidden_fields.forEach(i => {
        hidden_fields_text = hidden_fields_text + i.value + ","
      });
      switch (type) {
        case "orders_online":
          localStorage.setItem("orders_online_fields_export", JSON.stringify(fieldsExport));
          break;
        case "orders_offline":
          localStorage.setItem("orders_offline_fields_export", JSON.stringify(fieldsExport));
          break;
        // case "shipments":
        //   localStorage.setItem("shipments_fields_export", JSON.stringify(fieldsExport));
        // case "returns":
        //   localStorage.setItem("returns_fields_export", JSON.stringify(fieldsExport));
        default: break;
      }
      // console.log('hidden_fields_text', hidden_fields_text.slice(0, hidden_fields_text.length - 1))
      onOk(optionExport, hidden_fields_text.slice(0, hidden_fields_text.length - 1));
    },[fields, fieldsExport, onOk, optionExport, type]
  );
  
  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      centered
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
          onClick={() => submit()}
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
        <Radio.Group name="radiogroup" defaultValue={selected ? 3 : (type === "orders_online" || type === "orders_offline" ? 2 : 1)} onChange={(e) => setOptionExport(e.target.value)}>
          <Space direction="vertical">
            <Radio value={1} disabled={type === "orders_online" || type === "orders_offline"}>Tất cả {text}</Radio>
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
        </Radio.Group> */}
        {(type === "orders_online" || type === "orders_offline") && 
          <div>
            <Button type="link" style={{ padding: 0, color: "#2a2a86" }} onClick={() => setEditFields(true)}>Tuỳ chọn cột hiển thị</Button>
          </div>
        }
      </div>
      )}
      {editFields && statusExport === 1 && (
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
      )}
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

