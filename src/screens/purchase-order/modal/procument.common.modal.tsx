import { Col, Form, Input, Modal, Row, Select, Checkbox, Button } from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  POProcumentField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";

import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { DeleteOutlined } from "@ant-design/icons";

import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
  Fragment,
} from "react";
import { ProcumentStatus } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";
import moment, { Moment } from "moment";

type ProcumentModalProps = {
  type: "draft" | "confirm" | "inventory";
  isEdit: boolean;
  visible: boolean;
  now: Moment;
  stores: Array<StoreResponse>;
  onCancle: () => void;
  items: Array<PurchaseOrderLineItem>;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  onDelete: (value: PurchaseProcument) => void;
  loading: boolean;
  title: ReactNode;
  okText: string;
  cancelText: string;
  item?: PurchaseProcument | null;
  children(
    onQuantityChange: (quantity: any, index: number) => void,
    onRemove: (index: number) => void,
    line_items: Array<PurchaseProcumentLineItem>
  ): ReactNode;
};

const ProcumentModal: React.FC<ProcumentModalProps> = (props) => {
  const {
    title,
    okText,
    cancelText,
    visible,
    now,
    stores,
    onCancle,
    items,
    defaultStore,
    onOk,
    onDelete,
    loading,
    item,
    type,
    isEdit,
  } = props;
  const [form] = Form.useForm();
  const [data, setData] = useState<Array<PurchaseProcumentLineItem>>([]);
  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
  const allProcurementItems = useMemo(() => {
    let result = POUtils.getPOProcumentItem(items);
    result = result.map((item) => {
      if (visible) {
        if (type === "draft") {
          item.quantity = 0;
        } else if (type === "confirm") {
          item.quantity = 0;
        } else if (type === "inventory") {
          item.real_quantity = 0;
        }
      }
      return item;
    });
    return result;
  }, [items, visible, type]);

  const onSearch = useCallback(
    (value: string) => {
      value = value.toUpperCase();
      let result = allProcurementItems.filter((variant) => {
        return variant.sku.includes(value) || variant.variant.includes(value);
      });
      setData(result);
    },
    [allProcurementItems, setData]
  );
  const onSelectProduct = useCallback(
    (lineItemId: string) => {
      let procurement_items = form.getFieldValue(
        POProcumentField.procurement_items
      );
      let newProcumentItem = procurement_items.find(
        (item: PurchaseProcumentLineItem) =>
          item.line_item_id === parseInt(lineItemId)
      );
      if (!newProcumentItem) {
        newProcumentItem = allProcurementItems.find(
          (item: PurchaseProcumentLineItem) =>
            item.line_item_id === parseInt(lineItemId)
        );
        if (newProcumentItem) {
          procurement_items = [
            ...procurement_items,
            JSON.parse(JSON.stringify(newProcumentItem)),
          ];
        }
      }
      form.setFieldsValue({ procurement_items: [...procurement_items] });
    },
    [form, allProcurementItems]
  );

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: PurchaseProcumentLineItem, index: number) => {
      options.push({
        label: (
          <Row>
            <div className="product-item">
              <div className="product-item-image">
                {item.variant_image !== null && (
                  <img src={item.variant_image} alt="" />
                )}
              </div>
              <div className="product-item-info">
                <div className="product-item-info-left">
                  <span className="product-item-name">{item.sku}</span>
                  <span className="product-item-sku">{item.variant}</span>
                </div>
              </div>
            </div>
          </Row>
        ),
        value: item.line_item_id.toString(),
      });
    });
    return options;
  }, [data]);
  const onFinish = useCallback(
    (value: PurchaseProcument) => {
      onOk(value);
    },
    [onOk]
  );
  const onQuantityChange = useCallback(
    (quantity, index: number) => {
      let procurement_items: Array<PurchaseProcumentLineItem> =
        form.getFieldValue(POProcumentField.procurement_items);
      if (type === "inventory")
        procurement_items[index].real_quantity = quantity;
      else procurement_items[index].quantity = quantity;
      form.setFieldsValue({ procurement_items: [...procurement_items] });
    },
    [form, type]
  );

  const onRemove = useCallback(
    (index: number) => {
      let procurement_items: Array<PurchaseProcumentLineItem> =
        form.getFieldValue(POProcumentField.procurement_items);
      procurement_items.splice(index, 1);
      form.setFieldsValue({ procurement_items: [...procurement_items] });
    },
    [form]
  );

  const fillAll = (checked: boolean) => {
    if (checked) {
      let currentProcument = form.getFieldValue(
        POProcumentField.procurement_items
      );
      let allLineId: Array<number> = [],
        lineIdMapping: any = {};
      allProcurementItems.forEach((item) => {
        allLineId.push(item.line_item_id);
        lineIdMapping = {
          ...lineIdMapping,
          [item.line_item_id]: item,
        };
      });
      currentProcument.forEach((item: PurchaseProcumentLineItem) => {
        const index = allLineId.indexOf(item.line_item_id);
        if (index > -1) allLineId.splice(index, 1);
      });

      allLineId.forEach((line_item_id) => {
        onSelectProduct(line_item_id.toString());
      });
    }
  };
  useEffect(() => {
    if (item) {
      form.setFieldsValue(JSON.parse(JSON.stringify(item)));
    } else {
      form.setFieldsValue({
        procurement_items: JSON.parse(JSON.stringify(allProcurementItems)),
      });
    }
  }, [form, item, allProcurementItems]);

  const confirmDeletePhrase: string = useMemo(() => {
    if (!item) return "";
    let prefix = "phiếu nháp";
    if (type === "confirm") prefix = "phiếu duyệt";
    else if (type === "inventory") prefix = "phiếu nhập kho";
    return `Bạn chắc chắn xóa ${prefix} ${item?.code}?`;
  }, [type, item]);
  return (
    <Fragment>
      <Modal
        width={500}
        centered
        visible={visibleDelete}
        onCancel={() => setVisibleDelete(false)}
        onOk={() => {
          setVisibleDelete(false);
          if (item) onDelete(item);
        }}
        cancelText={`Hủy`}
        okText={`Đồng ý`}
      >
        <Row align="top">
          <DeleteOutlined
            style={{
              fontSize: 40,
              background: "#e24343",
              color: "white",
              borderRadius: "50%",
              padding: 10,
              marginRight: 10,
            }}
          />
          <strong className="margin-top-10">{confirmDeletePhrase}</strong>
        </Row>
      </Modal>
      <Modal
        onCancel={onCancle}
        width={900}
        visible={visible}
        cancelText={cancelText}
        onOk={() => {
          if (type === "confirm" && !isEdit) {
            //duyet
            form.setFieldsValue({ status: ProcumentStatus.NOT_RECEIVED });
          } else if (type === "inventory" && !isEdit) {
            //nhap kho
            form.setFieldsValue({ status: ProcumentStatus.RECEIVED });
          }
          form.submit();
        }}
        confirmLoading={loading}
        title={title}
        okText={okText}
      >
        {item && (
          <Button
            type="default"
            className="danger"
            style={{
              position: "absolute",
              bottom: 10,
              left: 30,
            }}
            onClick={() => {
              setVisibleDelete(true);
            }}
          >
            Xóa
          </Button>
        )}
        <Form
          initialValues={{
            procurement_items: [],
            store_id: defaultStore,
            status: ProcumentStatus.DRAFT,
            expect_receipt_date: ConvertDateToUtc(now),
          }}
          form={form}
          onFinishFailed={({ errorFields }: any) => {
            const element: any = document.getElementById(
              errorFields[0].name.join("")
            );
            element?.focus();
            const y =
              element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
            window.scrollTo({ top: y, behavior: "smooth" });
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={50}>
            <Form.Item hidden noStyle name={POProcumentField.id}>
              <Input />
            </Form.Item>
            <Form.Item hidden noStyle name={POProcumentField.code}>
              <Input />
            </Form.Item>
            <Form.Item name={POProcumentField.procurement_items} hidden noStyle>
              <Input />
            </Form.Item>
            <Form.Item name={POProcumentField.status} hidden noStyle>
              <Input />
            </Form.Item>
            <Form.Item hidden noStyle name={POProcumentField.store}>
              <Input />
            </Form.Item>
            {type === "inventory" && (
              <Fragment>
                <Col span={24} md={12}>
                  <Form.Item
                    shouldUpdate={(prev, current) =>
                      prev[POProcumentField.store_id] !==
                      current[POProcumentField.store_id]
                    }
                  >
                    {({ getFieldValue }) => {
                      let store = getFieldValue(POProcumentField.store);
                      return (
                        <div>
                          Về kho: <strong>{store}</strong>
                        </div>
                      );
                    }}
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    shouldUpdate={(prev, current) =>
                      prev[POProcumentField.expect_receipt_date] !==
                      current[POProcumentField.expect_receipt_date]
                    }
                  >
                    {({ getFieldValue }) => {
                      let expect_receipt_date = getFieldValue(
                        POProcumentField.expect_receipt_date
                      );
                      return (
                        <div>
                          Ngày dự kiến{" "}
                          <strong>
                            {ConvertUtcToLocalDate(expect_receipt_date)}
                          </strong>
                        </div>
                      );
                    }}
                  </Form.Item>
                </Col>
              </Fragment>
            )}
            {type !== "inventory" && (
              <Fragment>
                <Col span={24} md={12}>
                  <Form.Item
                    name={POProcumentField.store_id}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn kho nhận hàng",
                      },
                    ]}
                    label="Kho nhận hàng"
                  >
                    <Select showSearch showArrow optionFilterProp="children">
                      <Select.Option value="">Chọn kho nhận</Select.Option>
                      {stores.map((item) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    name={POProcumentField.expect_receipt_date}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày nhận dự kiến",
                      },
                    ]}
                    label="Ngày nhận dự kiến"
                  >
                    <CustomDatepicker
                      disableDate={(date) => date < moment().startOf("days")}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Fragment>
            )}
          </Row>
          <Row>
            <Input.Group style={{ flex: 1, marginRight: 20 }}>
              <CustomAutoComplete
                id="#product_procument_search"
                dropdownClassName="product"
                textEmpty="Sản phẩm tìm kiếm không có trong đơn mua hàng, xin vui lòng chọn sản phẩm khác"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F1)"
                onSearch={onSearch}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%" }}
                onSelect={onSelectProduct}
                options={renderResult}
              />
            </Input.Group>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) => {
                return (
                  prev[POProcumentField.procurement_items] !==
                  current[POProcumentField.procurement_items]
                );
              }}
            >
              {({ getFieldValue }) => {
                let checked = false;
                let procurement_items: Array<PurchaseProcumentLineItem> =
                  getFieldValue(POProcumentField.procurement_items);
                checked =
                  procurement_items.length === allProcurementItems.length;
                return (
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      fillAll(e.target.checked);
                    }}
                  >
                    Chọn tất cả sản phẩm
                  </Checkbox>
                );
              }}
            </Form.Item>
          </Row>
          <div className="margin-top-20">
            <Form.Item
              shouldUpdate={(prev, current) => {
                return (
                  prev[POProcumentField.procurement_items] !==
                  current[POProcumentField.procurement_items]
                );
              }}
              noStyle
            >
              {({ getFieldValue }) => {
                let line_items = getFieldValue(
                  POProcumentField.procurement_items
                )
                  ? getFieldValue(POProcumentField.procurement_items)
                  : [];
                if (props.children) {
                  return props.children(onQuantityChange, onRemove, line_items);
                }
              }}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default ProcumentModal;
