import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Modal, Progress, Radio, Row, Space } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fields_order_online,
  fields_order_offline,
  fields_return,
  fields_shipment,
} from "../common/fields.export";
import { ORDER_EXPORT_TYPE } from "utils/Order.constants";
import useAuthorization from "hook/useAuthorization";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (optionExport: number, fieldsExport?: string) => void;
  type?: string;
  total: number;
  exportProgress: number;
  statusExport: number;
  exportError?: string;
  selected?: boolean;
  isLoopInfoIfOrderHasMoreThanTwoProducts?: boolean;
  setIsLoopInfoIfOrderHasMoreThanTwoProducts?: (value: boolean) => void;
};

const ExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const {
    visible,
    onCancel,
    onOk,
    type,
    total,
    exportProgress,
    statusExport,
    selected = false,
    exportError = "Đã có lỗi xảy ra!!!",
    isLoopInfoIfOrderHasMoreThanTwoProducts,
    setIsLoopInfoIfOrderHasMoreThanTwoProducts,
  } = props;
  // statusExport: 1 not export, 2 exporting, 3 export success, 4 export error
  const [allowExportVat] = useAuthorization({
    acceptPermissions: [ORDER_PERMISSIONS.orders_export_vat],
  });

  const checkExportPermission = useCallback(
    (fields: { value: string; name: string }[], vatField: string[]) => {
      let result = fields.filter((single) => {
        if (allowExportVat) {
          return true;
        }
        return !vatField.includes(single.value);
      });
      return result;
    },
    [allowExportVat],
  );

  const text = useMemo(() => {
    switch (type) {
      case ORDER_EXPORT_TYPE.ECOMMERCE:
      case "orders_online":
        return "đơn hàng";
      case "orders_offline":
        return "đơn hàng";
      case "shipments":
        return "đơn giao hàng";
      case "returns":
        return "đơn trả hàng";
      case "warranty":
        return "phiếu bảo hành";
      default:
        break;
    }
  }, [type]);
  const text1 = useMemo(() => {
    switch (type) {
      case ORDER_EXPORT_TYPE.ECOMMERCE:
      case "orders_online":
        return "Đơn hàng";
      case "orders_offline":
        return "Đơn hàng";
      case "shipments":
        return "Đơn giao hàng";
      case "returns":
        return "Đơn trả hàng";
      case "warranty":
        return "Phiếu bảo hành";
      default:
        break;
    }
  }, [type]);
  const fields = useMemo(() => {
    switch (type) {
      case ORDER_EXPORT_TYPE.ECOMMERCE:
      case "orders_online": {
        const vatFields = ["totalTaxLine", "totalTax"];
        return checkExportPermission(fields_order_online, vatFields);
      }
      case "orders_offline": {
        const vatFields = ["totalTaxLine", "totalTax"];
        return checkExportPermission(fields_order_offline, vatFields);
      }
      // case "shipments":
      //   return fields_shipment
      case "returns": {
        const vatFields = ["totalTax"];
        return checkExportPermission(fields_return, vatFields);
      }
      default:
        return [];
    }
  }, [checkExportPermission, type]);
  const [optionExport, setOptionExport] = useState<number>(
    selected
      ? 3
      : type === "orders_online" ||
        type === "orders_offline" ||
        type === ORDER_EXPORT_TYPE.ECOMMERCE
      ? 2
      : 1,
  );
  // const [typeExport, setTypeExport] = useState<number>(1);
  const [fieldsExport, setFieldsExport] = useState<Array<any>>(
    fields.map((i) => {
      return i.value;
    }),
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState(true);

  useEffect(() => {
    switch (type) {
      case ORDER_EXPORT_TYPE.ECOMMERCE:
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
      default:
        break;
    }
  }, [type]);
  const [editFields, setEditFields] = useState(false);

  const submit = useCallback(() => {
    let hidden_fields = [...fields];
    fieldsExport.forEach((field: string) => {
      let findIndex = hidden_fields.findIndex((i) => i.value === field);
      hidden_fields.splice(findIndex, 1);
    });
    // console.log('hidden_fields', hidden_fields);
    let hidden_fields_text = "";
    hidden_fields.forEach((i) => {
      hidden_fields_text = hidden_fields_text + i.value + ",";
    });
    switch (type) {
      case ORDER_EXPORT_TYPE.ECOMMERCE:
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
      default:
        break;
    }
    // console.log('hidden_fields_text', hidden_fields_text.slice(0, hidden_fields_text.length - 1))
    onOk(optionExport, hidden_fields_text.slice(0, hidden_fields_text.length - 1));
  }, [fields, fieldsExport, onOk, optionExport, type]);

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
          Xuất file danh sách {text}
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
      {!editFields && statusExport === 1 && (
        <div>
          <p style={{ fontWeight: 500 }}>Giới hạn kết quả xuất</p>
          <Radio.Group
            name="radiogroup"
            defaultValue={
              selected
                ? 3
                : type === "orders_online" ||
                  type === "orders_offline" ||
                  type === ORDER_EXPORT_TYPE.ECOMMERCE
                ? 2
                : 1
            }
            onChange={(e) => setOptionExport(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value={1} disabled={type === "orders_online" || type === "orders_offline"}>
                Tất cả {text}
              </Radio>
              <Radio value={2}>{text1} trên trang này</Radio>
              <Radio value={3} disabled={!selected}>
                Các {text} được chọn
              </Radio>
              <Radio value={4}>
                {total} {text} phù hợp với điều kiện tìm kiếm hiện tại
              </Radio>
            </Space>
          </Radio.Group>
          {/* <p style={{ fontWeight: 500}}>Loại file xuất</p>
        <Radio.Group name="radiogroup1" defaultValue={1} onChange={(e) => setTypeExport(e.target.value)}>
          <Space direction="vertical">
            <Radio value={1}>File tổng quan theo {text}</Radio>
            <Radio value={2}>File chi tiết</Radio>
          </Space>
        </Radio.Group> */}
          {(type === ORDER_EXPORT_TYPE.orders_online ||
            type === ORDER_EXPORT_TYPE.orders_offline ||
            type === ORDER_EXPORT_TYPE.ECOMMERCE ||
            setIsLoopInfoIfOrderHasMoreThanTwoProducts) && (
            <div>
              <Button
                type="link"
                style={{ padding: 0, color: "#2a2a86" }}
                onClick={() => setEditFields(true)}
              >
                Tuỳ chọn cột hiển thị
              </Button>
            </div>
          )}
          {setIsLoopInfoIfOrderHasMoreThanTwoProducts && (
            <Checkbox
              value={isLoopInfoIfOrderHasMoreThanTwoProducts}
              onChange={(e) => {
                setIsLoopInfoIfOrderHasMoreThanTwoProducts(e.target.checked);
              }}
            >
              Lặp lại thông tin đơn hàng ở từng dòng sản phẩm nếu đơn có từ 2 sản phẩm trở lên
            </Checkbox>
          )}
        </div>
      )}
      {editFields && statusExport === 1 && (
        <>
          <Checkbox
            checked={selectAll}
            indeterminate={indeterminate}
            onChange={(e) => {
              const newFieldsExport = e.target.checked
                ? fields.map((i) => {
                    return i.value;
                  })
                : [];
              // console.log('newFieldsExport', newFieldsExport);
              setFieldsExport(newFieldsExport);
              setIndeterminate(false);
              setSelectAll(e.target.checked);
            }}
          >
            Chọn tất cả
          </Checkbox>
          <Checkbox.Group
            name="radiogroup"
            value={fieldsExport}
            onChange={(e) => {
              setFieldsExport(e);
              setIndeterminate(!!e.length && e.length < fields.length);
            }}
          >
            <Row>
              {fields?.map((field) => (
                <Col span={8}>
                  <Checkbox value={field.value}>{field.name}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </>
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
