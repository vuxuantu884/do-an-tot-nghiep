import { Table, Form, Modal, Row, Col, Input, DatePicker, Select, InputNumber } from "antd";
import { Fragment, useCallback, useEffect, useState } from "react";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItemDraft } from "model/purchase-order/purchase-item.model";
import {
  PurchaseProcurementViewDraft,
} from "model/purchase-order/purchase-procument";
import { ActionsTableColumn, POInventoryDraftTable } from "screens/purchase-order/component/po-inventory/POInventoryDraft/styles";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { POField } from "model/purchase-order/po-field";
import moment, { Moment } from "moment";
import { ConvertDateToUtc, DATE_FORMAT } from "utils/DateUtils";
import _ from "lodash";

type ProcurementModalProps = {
  visible?: boolean;
  onCancel?: () => void;
  onOk: (value: Array<PurchaseProcurementViewDraft>) => void;
  changeColumnPO: (value: Array<PurchaseProcurementViewDraft>) => void;
  formMain?: any;
  columnsDefault: any;
  stores: Array<StoreResponse>;
  procurementDataState: Array<PurchaseProcurementViewDraft>;
  dataSource?: Array<PurchaseOrderLineItemDraft>;
};

const QUANTITY_INVENTORY_COLUMNS_DRAFT = 7;

const initDataProcurement = [
  {
    store_id: "",
    expect_receipt_date: "",
    procurement_items: [],
    status: "draft",
    status_po: "draftpo",
  },
];


const POEditDraftProcurementModal: React.FC<ProcurementModalProps> = (
  props: ProcurementModalProps
) => {
  const {
    visible,
    onCancel,
    stores,
    procurementDataState,
    columnsDefault,
    dataSource,
    formMain,
    onOk,
    changeColumnPO,
  } = props;

  const [columns, setColumns] = useState<any>([]);
  const [data, setData] = useState<Array<PurchaseProcurementViewDraft>>([]);

  const newProcurement = _.cloneDeep(data);

  let dataPurchaseOrderLineItem: Array<PurchaseOrderLineItemDraft> = []
  if (dataSource) {
    dataPurchaseOrderLineItem = dataSource.map((item: PurchaseOrderLineItemDraft) => {
      return ({
          accepted_quantity: 0,
          code: item.code,
          line_item_id: item.id,
          note: "",
          ordered_quantity: item.quantity,
          planned_quantity: 0,
          quantity: 0,
          real_quantity: 0,
          sku: item.sku,
          variant: item.variant,
          variant_image: item.variant,
        });
      });
  }
  
  const addColumnNumber = () => {
    newProcurement.push(...initDataProcurement);
    newProcurement[newProcurement.length - 1].procurement_items = dataPurchaseOrderLineItem;
    
    setData(newProcurement);
    changeColumnPO(newProcurement);
  };

  const removeColumnNumber = () => {
    newProcurement.pop();    
    setData(newProcurement);
    changeColumnPO(newProcurement);
  };
  
  const onChangeValueDate = useCallback((value: Moment, index: number) => {
    if (!newProcurement) return;
    newProcurement[index].expect_receipt_date = ConvertDateToUtc(value);
    setData(newProcurement);
  }, [newProcurement])

  const onChangeValueStore = useCallback((value: string, index: number) => {
    if (!newProcurement) return;

    const storeData = stores.find(
      (item) => item.id === parseInt(value)
    );

    newProcurement[index].store_id = value;
    newProcurement[index].store = storeData?.name;
    setData(newProcurement);
  }, [newProcurement, stores]);

  const onChangeValueLineItem = useCallback((value: number, index: number, indexLineItem: number) => {
    if (!newProcurement) return;
  
    newProcurement[index].procurement_items[indexLineItem].quantity = value;
    setData(newProcurement);
  }, [newProcurement]);

  const handleOk = useCallback(() => {
    onOk(data);
    formMain.setFieldsValue({
      procurements: data,
    })    
  }, [data, onOk, formMain]);

  //procurementItemsDefault
  
  useEffect(() => {

    setData(procurementDataState);
    
    const columnProcurementItemsDefault = procurementDataState?.map((itemPCState, index) => {
      
      return {
        title: (
          <>
            <Row>
              <Col span={24}>
                <Form.Item name={POField.expect_import_date} noStyle hidden>
                  <Input />
                </Form.Item>
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  defaultValue={itemPCState.expect_receipt_date ? moment(itemPCState.expect_receipt_date, 'YYYY/MM/DD') : undefined}
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
                  defaultValue={itemPCState.store_id ? itemPCState.store_id : undefined}
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
          <InputNumber
            min={0}
            defaultValue={itemPCState.procurement_items[indexLineItems] ? itemPCState.procurement_items[indexLineItems].quantity : 0}
            maxLength={6}
            onChange={(value: number) => {
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
    }, [procurementDataState, stores]);

  const isHaveManyColumn = columns.length > QUANTITY_INVENTORY_COLUMNS_DRAFT;

  if (visible) {
    return (
      <Modal
        width={"60%"}
        centered
        onOk={handleOk}
        visible={visible}
        onCancel={onCancel}
        cancelText={`Hủy`}
        okText={`Lưu`}
      >
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
            dataSource={dataSource}
            scroll={{ y: 300, x: 1000 }}
          />
        </POInventoryDraftTable>
      </Modal>
    );
  } else return <Fragment />;
};

export default POEditDraftProcurementModal;
