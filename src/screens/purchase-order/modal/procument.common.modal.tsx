import { Col, Form, Input, Modal, Row, Select, Checkbox, Button, Tabs } from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  POProcumentField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";

import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
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
import { showError } from "utils/ToastUtils";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { PurchaseOrderTabUrl } from "config/url.config";
import RenderTabBar from 'component/table/StickyTabBar';
import PurchaseOrderHistory from "../tab/PurchaseOrderHistory";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchaseOrderDraft } from "screens/purchase-order/purchase-order-list.style";

export type ProcumentModalProps = {
  type: "draft" | "confirm" | "inventory";
  isEdit: boolean;
  visible: boolean;
  now: Moment;
  stores: Array<StoreResponse>;
  onCancel: () => void;
  items: Array<PurchaseOrderLineItem>;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  onDelete: (value: PurchaseProcument) => void;
  loading: boolean;
  poData?: PurchaseOrder | undefined;
  title: ReactNode;
  procumentCode: string;
  okText: string;
  cancelText: string;
  item?: PurchaseProcument | null;
  isConfirmModal?: boolean;
  children(
    onQuantityChange: (quantity: any, index: number) => void,
    onRemove: (index: number) => void,
    line_items: Array<PurchaseProcumentLineItem>
  ): ReactNode;
};

const { TabPane } = Tabs;

const ProcumentModal: React.FC<ProcumentModalProps> = (props) => {
  const {
    title,
    okText,
    cancelText,
    visible,
    now,
    stores,
    poData,
    onCancel: onCancle,
    items,
    defaultStore,
    onOk,
    onDelete,
    procumentCode,
    loading,
    item,
    type,
    isEdit,
    isConfirmModal,
  } = props;
  const [form] = Form.useForm();
  const [data, setData] = useState<Array<PurchaseProcumentLineItem>>([]);
  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
  const [titleTabModal, setTitleTabModal] = useState<ReactNode>(title);
  const allProcurementItems = useMemo(() => {
    let newLineItem: Array<PurchaseOrderLineItem> = [];
    items.forEach((item) => {
      let index = newLineItem.findIndex((item1) => item1.sku === item.sku);
      if (index === -1) {
        newLineItem.push({ ...item });
      } else {
        newLineItem[index].quantity += item.quantity;
        newLineItem[index].receipt_quantity += item.receipt_quantity;
        newLineItem[index].planned_quantity += item.planned_quantity;
      }
    })
    let result = POUtils.getPOProcumentItem(newLineItem);
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

  const [activeTab, setActiveTab] = useState<string>(PurchaseOrderTabUrl.INVENTORY);

  const onSearch = useCallback(
    (value: string) => {
      value = value.toUpperCase();
      let result = allProcurementItems.filter((variant) => {
        return (
          variant.sku.toUpperCase().includes(value) ||
          variant.variant.toUpperCase().includes(value)
        );
      });
      setData(result);
    },
    [allProcurementItems, setData]
  );

  const onSelectProduct = useCallback(
    (sku: string) => {
      let procurement_items = form.getFieldValue(
        POProcumentField.procurement_items
      );
      let newProcumentItem = procurement_items.find(
        (item: PurchaseProcumentLineItem) => item.sku === sku
      );
      if (!newProcumentItem) {
        newProcumentItem = allProcurementItems.find(
          (item: PurchaseProcumentLineItem) => item.sku === sku
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
        value: item.sku,
      });
    });
    return options;
  }, [data]);
  const onFinish = useCallback(
    (value: PurchaseProcument) => {
      let quantity = 0;
      let real_quantity = 0;
      value.procurement_items.forEach((item) => {
        if (item.quantity) {
          quantity = quantity + item.quantity;
        }
        if (item.real_quantity) {
          real_quantity = real_quantity + item.real_quantity;
        }
      })

      if (type === "draft" || type === "confirm") {
        if (quantity === 0) {
          showError("Cần ít nhất một item nhập kho");
          return;
        }
      } else if (type === "inventory" && real_quantity === 0) {
        showError("Cần ít nhất một item nhập kho");
        return;
      }
      onOk(value);
    },
    [onOk, type]
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
      let allLineId: Array<number | any> = [],
        lineIdMapping: any = {};
      allProcurementItems.forEach((item) => {
        allLineId.push(item.sku);
        lineIdMapping = {
          ...lineIdMapping,
          [item.sku]: item,
        };
      });
      currentProcument.forEach((item: PurchaseProcumentLineItem) => {
        const index = allLineId.indexOf(item.sku);
        if (index > -1) allLineId.splice(index, 1);
      });

      allLineId.forEach((sku) => {
        onSelectProduct(sku.toString());
      });
    }
  };

  const onChangeActive = (active: string) => {
    setActiveTab(active);
    switch (active) {
      case PurchaseOrderTabUrl.HISTORY:
        setTitleTabModal(
          () => {
            return (
              <div>
                {"Chi tiết log phiếu nhập kho "}
                <span style={{ color: "#2A2A86" }}>{item?.code}</span>
              </div>
            )
          }
        )
        return;
      default:
        setTitleTabModal(title);
        return;
    }
  }

  useEffect(() => {
    if (item) {
      if (type === "inventory") {
        item.procurement_items.forEach((item1) => {
          if (!item1.real_quantity) {
            item1.real_quantity = item1.quantity;
          }
        });
      }
      form.setFieldsValue(JSON.parse(JSON.stringify(item)));
    } else {
      form.setFieldsValue({
        procurement_items: JSON.parse(JSON.stringify(allProcurementItems)),
      });
    }
  }, [form, item, allProcurementItems, type]);

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
        width={920}
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
        title={titleTabModal}
        okText={okText}
      >
        <PurchaseOrderDraft>
          {
            title !== 'Tạo phiếu nháp' ?
              (<Tabs
                style={{ overflow: "initial", marginTop: "-24px" }}
                activeKey={activeTab}
                onChange={(active) => onChangeActive(active)}
                renderTabBar={RenderTabBar}
              >
                <TabPane tab="Tồn kho" key={PurchaseOrderTabUrl.INVENTORY}>
                  {item && (
                    <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_delete]}>
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
                    </AuthWrapper>
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
                      const element: any = document.getElementById(errorFields[0].name.join(""));
                      element?.focus();
                      const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
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
                          <Form.Item hidden noStyle name={POProcumentField.store_id}>
                            <Input />
                          </Form.Item>
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
                                    <strong>{ConvertUtcToLocalDate(expect_receipt_date)}</strong>
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
                              <Select
                                showSearch
                                showArrow
                                optionFilterProp="children"
                                placeholder="Chọn kho"
                              >
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
                                format={DATE_FORMAT.DDMMYYY}
                              />
                            </Form.Item>
                          </Col>
                        </Fragment>
                      )}
                    </Row>
                    {!isConfirmModal && (
                      <Row className="search-product-input">
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
                            let procurement_items: Array<PurchaseProcumentLineItem> = getFieldValue(
                              POProcumentField.procurement_items
                            );
                            checked = procurement_items.length === allProcurementItems.length;
                            return (
                              <div className="select-all-checkbox">
                                <Checkbox
                                  checked={checked}
                                  onChange={(e) => {
                                    fillAll(e.target.checked);
                                  }}
                                >
                                  Chọn tất cả sản phẩm
                                </Checkbox>
                              </div>
                            );
                          }}
                        </Form.Item>
                      </Row>
                    )}
                    <div>
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
                          let line_items = getFieldValue(POProcumentField.procurement_items)
                            ? getFieldValue(POProcumentField.procurement_items)
                            : [];
                          if (props.children) {
                            return props.children(onQuantityChange, onRemove, line_items);
                          }
                        }}
                      </Form.Item>
                    </div>
                  </Form>
                </TabPane>
                <TabPane tab="Lịch sử thao tác" key={PurchaseOrderTabUrl.HISTORY}>
                  <PurchaseOrderHistory poData={poData} procumentCode={procumentCode} />
                </TabPane>
              </Tabs>) : (
                <div>
                  {item && (
                    <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_delete]}>
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
                    </AuthWrapper>
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
                      const element: any = document.getElementById(errorFields[0].name.join(""));
                      element?.focus();
                      const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
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
                          <Form.Item hidden noStyle name={POProcumentField.store_id}>
                            <Input />
                          </Form.Item>
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
                                    <strong>{ConvertUtcToLocalDate(expect_receipt_date)}</strong>
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
                              <Select
                                showSearch
                                showArrow
                                optionFilterProp="children"
                                placeholder="Chọn kho"
                              >
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
                                format={DATE_FORMAT.DDMMYYY}
                              />
                            </Form.Item>
                          </Col>
                        </Fragment>
                      )}
                    </Row>
                    {!isConfirmModal && (
                      <Row className="search-product-input">
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
                            let procurement_items: Array<PurchaseProcumentLineItem> = getFieldValue(
                              POProcumentField.procurement_items
                            );
                            checked = procurement_items.length === allProcurementItems.length;
                            return (
                              <div className="select-all-checkbox">
                                <Checkbox
                                  checked={checked}
                                  onChange={(e) => {
                                    fillAll(e.target.checked);
                                  }}
                                >
                                  Chọn tất cả sản phẩm
                                </Checkbox>
                              </div>
                            );
                          }}
                        </Form.Item>
                      </Row>
                    )}
                    <div>
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
                          let line_items = getFieldValue(POProcumentField.procurement_items)
                            ? getFieldValue(POProcumentField.procurement_items)
                            : [];
                          if (props.children) {
                            return props.children(onQuantityChange, onRemove, line_items);
                          }
                        }}
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              )
          }
        </PurchaseOrderDraft>
      </Modal>
    </Fragment>
  );
};

export default ProcumentModal;
