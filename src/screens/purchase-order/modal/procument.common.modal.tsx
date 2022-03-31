import { Col, Form, Input, Modal, Row, Select, Checkbox, Button, Tabs, ButtonProps, Upload, Typography } from "antd";
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
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";

import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
  Fragment,
} from "react";
import { ProcumentStatus, TypeModalPo } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";
import moment, { Moment } from "moment";
import { showError, showWarning } from "utils/ToastUtils";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { PurchaseOrderTabUrl } from "config/url.config";
import RenderTabBar from 'component/table/StickyTabBar';
import PurchaseOrderHistory from "../tab/PurchaseOrderHistory";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchaseOrderDraft } from "screens/purchase-order/purchase-order-list.style";
import * as XLSX from 'xlsx';
import { PurchaseProcumentExportField } from "model/purchase-order/purchase-mapping";

export type ProcumentModalProps = {
  type: "draft" | "confirm" | "inventory";
  isEdit: boolean;
  isDetail?: boolean;
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
  key?: string,
  children(
    onQuantityChange: (quantity: any, index: any, bulkQuantity?: any) => void,
    onRemove: (index: number) => void,
    line_items: Array<PurchaseProcumentLineItem>,
    typeBulk: string,
    setTypeBulk: (bulkType: string) => void,
    bulkQuantity: number,
    setBulkQuantity: (bulkQuantity: number) => void,
    setQuantityToZero: (quantity: number) => void,
  ): ReactNode;
  okButtonProps?: ButtonProps
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
    isDetail,
    isConfirmModal,
    okButtonProps
  } = props;
  const [form] = Form.useForm();
  const [data, setData] = useState<Array<PurchaseProcumentLineItem>>([]);
  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
  const [titleTabModal, setTitleTabModal] = useState<ReactNode>(title);
  const [typeBulk, setTypeBulk] = useState<string>('percentage')
  const [bulkQuantity, setBulkQuantity] = useState(0)
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

  const setAllFieldQuantity = useCallback((quantity) => {
    let procurement_items: Array<PurchaseProcumentLineItem> =
      form.getFieldValue(POProcumentField.procurement_items);
    if (type === "inventory")
      procurement_items.map(item => item.real_quantity = quantity)
    else procurement_items.map(item => item.quantity = quantity)
    form.setFieldsValue({ procurement_items: [...procurement_items] });
  }, [form, type])

  useEffect(() => {
    setAllFieldQuantity(0)
  }, [setAllFieldQuantity, typeBulk])


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
      onOk && onOk(value);
    },
    [onOk, type]
  );
  const onQuantityChange = useCallback(
    (quantity, index: any, bulkQuantity: number) => {
      let procurement_items: Array<PurchaseProcumentLineItem> =
        form.getFieldValue(POProcumentField.procurement_items);
      if (quantity !== undefined && index !== undefined) {
        if (type === "inventory")
          procurement_items[index].real_quantity = quantity;
        else procurement_items[index].quantity = quantity;
      } else if (bulkQuantity) {
        if (typeBulk === 'quantity') {
          setAllFieldQuantity(bulkQuantity)
        } else {
          if (type === "inventory")
            procurement_items.map(item => item.real_quantity = Math.round((bulkQuantity * item.ordered_quantity) / 100));
          else procurement_items.map(item => item.quantity = Math.round((bulkQuantity * item.ordered_quantity) / 100))
        }
      }
      form.setFieldsValue({ procurement_items: [...procurement_items] });
    },
    [form, setAllFieldQuantity, type, typeBulk]
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
        item.procurement_items?.forEach((item1) => {
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
  }, [item, allProcurementItems,form,type]);

  const confirmDeletePhrase: string = useMemo(() => {
    if (!item) return "";
    let prefix = "phiếu nháp";
    if (type === "confirm") prefix = "phiếu duyệt";
    else if (type === "inventory") prefix = "phiếu nhập kho";
    return `Bạn chắc chắn huỷ ${prefix} ${item?.code}?`;
  }, [type, item]);

  const submit = () => {
    if (type === "confirm" && !isEdit) {
      //duyet
      form.setFieldsValue({ status: ProcumentStatus.NOT_RECEIVED });
    } else if (type === "inventory" && !isEdit) {
      //nhap kho
      form.setFieldsValue({ status: ProcumentStatus.RECEIVED });
    }
    form.submit();
  }; 

  const exportExcel= useCallback(()=>{
      let procurement_items = form.getFieldValue(POProcumentField.procurement_items)
      ? form.getFieldValue(POProcumentField.procurement_items)
      : [];
      if (!procurement_items) {
        showWarning("Không có dữ liệu");
        return
      }
      let dataExport:any = [];
      for (let i = 0; i < procurement_items.length; i++) {
        const e = procurement_items[i];
        let item = {};
        if (type === TypeModalPo.CONFIRM || type===ProcumentStatus.DRAFT) {
          item = {
            [PurchaseProcumentExportField.sku]: e.sku,
            [PurchaseProcumentExportField.variant]: e.variant,
            [PurchaseProcumentExportField.sld]: e.ordered_quantity,
            [PurchaseProcumentExportField.sl]: null,
          };
        }
        if (type === TypeModalPo.INVENTORY) {
          item = {
            [PurchaseProcumentExportField.sku]: e.sku,
            [PurchaseProcumentExportField.variant]: e.variant,
            [PurchaseProcumentExportField.sld]: e.ordered_quantity,
            [PurchaseProcumentExportField.sldduyet]: e.quantity,
            [PurchaseProcumentExportField.sl]: null,
          };
        }

        dataExport.push(item);
      } 
      const worksheet = XLSX.utils.json_to_sheet(dataExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const fileName = poData?.code ?  `nhap_so_luong_phieu_nhap_kho_${poData?.code}.xlsx`:"nhap_so_luong_phieu_nhap_kho.xlsx";
      XLSX.writeFile(workbook, fileName);
  },[form, poData,type]);

  const uploadProps  = {
    beforeUpload: (file: any) => {
      const typeExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!typeExcel) {
        showError("Chỉ chọn file excel");
      }
      return typeExcel || Upload.LIST_IGNORE;
    },
    onChange: useCallback(async (e:any)=>{ 
      const file = e.file; 
      const data = await file.originFileObj.arrayBuffer();
      const workbook = XLSX.read(data);

      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any = XLSX.utils.sheet_to_json(workSheet);
      let procurement_items = form.getFieldValue(POProcumentField.procurement_items)
      ? form.getFieldValue(POProcumentField.procurement_items)
      : []; 
      
      procurement_items.forEach((e:PurchaseProcumentLineItem) => {
        const findItem = jsonData.find((item:any)=>(item.sku !== undefined && item.sku.toString() === e.sku.toString()));
        if (findItem && typeof(findItem.sl) === "number") {
          if (type === TypeModalPo.CONFIRM || type===ProcumentStatus.DRAFT) {
            e.quantity = findItem.sl;
          }
          if (type === TypeModalPo.INVENTORY) {
            e.real_quantity = findItem.sl;
          }
        }
      });

      form.setFieldsValue({procurement_items: [...procurement_items]});
    },[form,type])
  }

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
        footer={!isDetail ? [
          <Button loading={loading} onClick={onCancle}>
            {cancelText}
          </Button>,
          <Button type="primary" loading={loading} onClick={submit}>
            {okText}
          </Button>,
        ] : null}
        onCancel={onCancle}
        width={920}
        visible={visible}
        confirmLoading={loading}
        title={titleTabModal}
        okButtonProps={okButtonProps}
      >
        <PurchaseOrderDraft> 
          { 
            title !== 'Tạo phiếu nháp' ?
              (<Tabs
                style={{ overflow: "initial", marginTop: "-24px" }}
                activeKey={activeTab}
                onChange={(active) => onChangeActive(active)}
                renderTabBar={RenderTabBar}
                tabBarExtraContent={ 
                ([ProcumentStatus.DRAFT,ProcumentStatus.NOT_RECEIVED].indexOf(item?.status ?? "draft") !== -1) && <>
                  <Button icon={<DownloadOutlined />} onClick={exportExcel}>Export Excel</Button>
                  <Upload {...uploadProps} maxCount={1}>
                    <Button icon={<UploadOutlined />}>Import Excel</Button>
                  </Upload>
                </>}
              >
                <TabPane tab="Tồn kho" key={PurchaseOrderTabUrl.INVENTORY}>
                  {item && !isDetail && (
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
                        Hủy phiếu
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
                    {!isConfirmModal && (
                      <Fragment>
                        <Row gutter={50} style={{marginTop: 5, marginBottom: 10}}>
                          <Col span={24} md={12}>
                            Đơn đặt hàng: <Typography.Text strong>{poData?.code}</Typography.Text>
                          </Col>
                          <Col span={24} md={12}>
                            Nhà cung cấp:  <Typography.Text strong>{poData?.supplier}</Typography.Text>
                          </Col>
                        </Row>

                      </Fragment>
                    )}

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
                                allowClear
                                showSearch
                                showArrow
                                optionFilterProp="children"
                                placeholder="Chọn kho nhận"
                              >
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
                              <>
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
                              </>
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
                          let procurement_items = getFieldValue(POProcumentField.procurement_items)
                            ? getFieldValue(POProcumentField.procurement_items)
                            : [];
                          if (props.children) {
                            return props.children(onQuantityChange, onRemove, procurement_items, typeBulk, setTypeBulk, bulkQuantity, setBulkQuantity, setAllFieldQuantity);
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
                                allowClear
                                placeholder="Chọn kho nhận"
                                optionFilterProp="children"
                              >
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
                          let procurement_items = getFieldValue(POProcumentField.procurement_items)
                            ? getFieldValue(POProcumentField.procurement_items)
                            : [];

                          if (props.children) {
                            return props.children(onQuantityChange, onRemove, procurement_items, typeBulk, setTypeBulk, bulkQuantity, setBulkQuantity, setAllFieldQuantity);
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
