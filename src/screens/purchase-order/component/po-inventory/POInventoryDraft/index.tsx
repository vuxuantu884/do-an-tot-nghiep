import { Col, DatePicker, Form, Input, Row, Select, Table } from "antd";
import { StoreResponse } from "model/core/store.model";
import imgDefIcon from "assets/img/img-def.svg";
import { POField } from "model/purchase-order/po-field";
import moment, { Moment } from "moment";
import { ConvertDateToUtc, ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ActionsTableColumn, POInventoryDraftTable } from "./styles";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import NumberInput from "component/custom/number-input.custom";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcumentPOCreateLineItem, PurchaseProcurementPOCreate } from "model/purchase-order/purchase-procument";

type POInventoryDraftProps = {
  stores: Array<StoreResponse>;
  isEdit: boolean;
  formMain?: any;
};

const initDataProcurement = [
  {
    store_id: "",
    expect_receipt_date: "",
    procurement_items: [],
    status: "draft",
    status_po: "draftpo",
  }
];

const QUANTITY_INVENTORY_COLUMNS_DRAFT = 7;

const POInventoryDraft: React.FC<POInventoryDraftProps> = (
  props: POInventoryDraftProps
) => {
  const { stores, isEdit, formMain } = props;
  const [dataProcurement, setDataProcurement] = useState<Array<PurchaseProcurementPOCreate>>(initDataProcurement);

  const [columns, setColumns] = useState<any>([]);

  const columnsDefault = [
    {
      title: "STT",
      align: "center",
      fixed: "left",
      width: 60,
      render: (value: any, record: any, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      width: 60,
      fixed: "left",
      dataIndex: "variant_image",
      render: (value: any) => (
        <div className="product-item-image">
          <img src={value === null ? imgDefIcon : value} alt="" className="" />
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      width: 250,
      fixed: "left",
      className: "ant-col-info",

      dataIndex: "variant",
      render: (value: string, item: PurchaseOrderLineItem, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">{item.sku}</div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn vị",
      align: "center",
      width: 100,
      render: () => "Cái",
    },
    {
      title: "Số lượng trên PO",
      align: "center",
      width: 200,
      dataIndex: "quantity",
      render: (value: any) => value,
    }];

  const dataLineItems = formMain && formMain.getFieldValue(POField.line_items);

  const addColumnNumber = () => {
    const newDataProcurement = [...dataProcurement];
    newDataProcurement.push(dataProcurement[0]);
    setDataProcurement(newDataProcurement);
    
  };

  const removeColumnNumber = () => {
    const newDataProcurement = [...dataProcurement];
    newDataProcurement.pop();
    setDataProcurement(newDataProcurement);
  };

  const onChangeValueDate = (value: Moment, index: number) => {
    const newProcurement = JSON.parse(JSON.stringify(dataProcurement));
    newProcurement[index].expect_receipt_date = ConvertDateToUtc(value);
    setDataProcurement(newProcurement);
    formMain.setFieldsValue({
      procurements: newProcurement,
    })
  }

  const onChangeValueStore = (value: string, index: number) => {
    const newProcurement = JSON.parse(JSON.stringify(dataProcurement));
    newProcurement[index].store_id = value;
    setDataProcurement(newProcurement);
    formMain.setFieldsValue({
      procurements: newProcurement,
    })
  }

  const onChangeValueLineItem = (value: number | null, index: number, indexLineItem: number) => {
    const newProcurement = JSON.parse(JSON.stringify(dataProcurement));

    if (!value) {      
      newProcurement[index].procurement_items[indexLineItem].quantity = 0;
      setDataProcurement(newProcurement);
      formMain.setFieldsValue({
        procurements: newProcurement,
      })
    } else {
      newProcurement[index].procurement_items[indexLineItem].quantity = value;
      setDataProcurement(newProcurement);
      formMain.setFieldsValue({
        procurements: newProcurement,
      })
    }
  }
// init
  useEffect(() => {

  const procurementItemsDefault: Array<PurchaseProcumentPOCreateLineItem> = dataLineItems?.map((item: PurchaseOrderLineItem, index: number) => {
    const newDataProcurement = JSON.parse(JSON.stringify(dataProcurement));
    return newDataProcurement[0].procurement_items[index] = {
      accepted_quantity: 0,
      code: item.code,
      line_item_id: item.id,
      note: "",
      ordered_quantity: item.quantity,
      planned_quantity: 0,
      quantity: item.quantity,
      real_quantity: 0,
      sku: item.sku,
      variant: item.variant,
      variant_image: item.variant,
    }
  });

  const newDataProcurement: Array<PurchaseProcurementPOCreate> = [{...initDataProcurement[0],
    procurement_items: procurementItemsDefault,
  }]

  setDataProcurement(newDataProcurement);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLineItems]);


  useEffect(() => {
    
  const columnProcurementItemsDefault = dataProcurement?.map((item, index) => {
    return {
      title: (
        <>
          <Row>
            <Col span={24}>
              <Form.Item 
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn điều khoản thanh toán",
                  },
                ]} name={POField.expect_import_date} noStyle hidden>
                <Input />
              </Form.Item>
              <DatePicker
                placeholder="dd/mm/yyyy"
                onChange={(value) => {
                  value && onChangeValueDate(value, index);
                }}
                disabledDate={(date) => date <= moment().startOf("days")}
                format={DATE_FORMAT.DDMMYYY}
              />
            </Col>
            <Col span={24}>
              <Form.Item name={POField.expect_store_id} noStyle hidden>
                <Input />
              </Form.Item>
              <Select
                placeholder="Chọn kho"
                showSearch
                optionFilterProp="children"
                onChange={(value: string) => {
                  value && onChangeValueStore(value, index);
                }}
              >
                {stores.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </>
      ),
      width: 200,
      align: "center",
      render: (value: number, item: any, indexLineItems: number) => (
        <NumberInput
          isFloat={false}
          min={0}
          maxLength={6}
          onChange={(value: number | null) => {
            onChangeValueLineItem(value, index, indexLineItems);
          }}
        />
      ),
    }
  })

  const columnFixed = [
    {
      title: "",
      align: "center",
      width: 100,
      fixed: "right",
    }]
    
    setColumns([...columnsDefault,...columnProcurementItemsDefault,...columnFixed])
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataProcurement]);
  const isHaveManyColumn = columns.length > QUANTITY_INVENTORY_COLUMNS_DRAFT;

  

  if (!isEdit) {
    return (
      <>
        <POInventoryDraftTable>
          <ActionsTableColumn
            className={isHaveManyColumn ? "group_actions" : ""}
          >
            <PlusOutlined
              style={{ fontSize: 25, color: "#2a2a86" }}
              onClick={addColumnNumber}
            />
            {isHaveManyColumn && (
              <MinusOutlined
                style={{ fontSize: 25, color: "#ff4d4f" }}
                onClick={removeColumnNumber}
              />
            )}
          </ActionsTableColumn>
          <Table
            columns={columns}
            pagination={false}
            dataSource={dataLineItems}
            scroll={{ y: 300, x: 1000 }}
          />
        </POInventoryDraftTable>
      </>
    );
  }
  return (
    <Row gutter={50}>
      <Col span={24} md={10}>
        <Form.Item name={POField.expect_store_id} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.expect_store} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.expect_store] !== current[POField.expect_store]
          }
        >
          {({ getFieldValue }) => {
            let store = getFieldValue(POField.expect_store);
            return (
              <div>
                Kho nhận dự kiến: <strong>{store}</strong>
              </div>
            );
          }}
        </Form.Item>
      </Col>
      <Col span={24} md={10}>
        <Form.Item name={POField.expect_import_date} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.expect_import_date] !==
            current[POField.expect_import_date]
          }
        >
          {({ getFieldValue }) => {
            let expect_import_date = getFieldValue(POField.expect_import_date);
            return (
              <div>
                Ngày nhận dự kiến:{" "}
                <strong>
                  {ConvertUtcToLocalDate(
                    expect_import_date,
                    DATE_FORMAT.DDMMYYY
                  )}
                </strong>
              </div>
            );
          }}
        </Form.Item>
      </Col>
    </Row>
  );
};

export default POInventoryDraft;
