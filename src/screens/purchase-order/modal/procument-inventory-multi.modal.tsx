import { Col, Form, Modal, Row, Table } from "antd";
import {
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { POUtils } from "utils/POUtils";
import { Moment } from "moment";

import { Fragment, useCallback } from "react";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { formatCurrency, replaceFormatString } from "utils/AppUtils"; 
import RowDetail from "component/custom/RowDetail";
import { PhoneOutlined } from "@ant-design/icons";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

type ProducmentInventoryModalProps = { 
  visible: boolean;
  now: Moment;
  poData?: PurchaseOrder | undefined;
  onCancel: () => void;
  listProcurement: Array<PurchaseProcument> | undefined;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  loading: boolean;
  procumentCode: string;
  line_items: Array<PurchaseProcumentLineItem>;
  title: string
};

const ProducmentInventoryMultiModal: React.FC<ProducmentInventoryModalProps> = (
  props: ProducmentInventoryModalProps
) => {
  const {
    visible, 
    line_items,
    title,
    onCancel,
    onOk,
    listProcurement
  } = props;   
  
  const [form] = Form.useForm();

  const onQuantityChange = useCallback(
    (quantity, index: number) => {
      
    },
    []
  );

  if (visible) {  
    return ( 
      <Modal
        visible={visible}
        width={920}
        centered
        title={title}
        onCancel={onCancel}
        onOk={()=>{
          onOk(form.getFieldsValue())
        }}
        okText="Xác nhận nhập"
      >
        <Form form={form}>
          <Row gutter={50}>
              <Col span={12}>
                <RowDetail title="Ngày nhận dự kiến" value={listProcurement ? ConvertUtcToLocalDate(listProcurement[0].expect_receipt_date ?? "", DATE_FORMAT.DDMMYYY): ""} ></RowDetail>
              </Col>
              <Col span={12}>
                <RowDetail title="Kho nhận hàng" value={listProcurement ? listProcurement[0].store ?? "" : ""} ></RowDetail>
              </Col> 
          </Row>
          <Row gutter={50}>
              <Col span={12}>
                <RowDetail title="Nhà cung cấp" value={listProcurement ? listProcurement[0].purchase_order.supplier : ""} ></RowDetail>
              </Col>
              <Col span={12}>
                <div className="row-detail">
                  <div className="title"><PhoneOutlined/></div>
                  <div className="dot data">:</div>
                  <div className="row-detail-right data">{listProcurement ? listProcurement[0].purchase_order.phone : ""}</div>
                </div>
              </Col> 
          </Row>
        </Form>
         <Table
          className="product-table"
         rowKey={(record: PurchaseProcumentLineItem) =>
           record.line_item_id
         }
         rowClassName="product-table-row"
         dataSource={line_items}
         tableLayout="fixed"
         scroll={{ y: 250, x: 845 }}
         pagination={false}
         columns={[
           {
             title: "STT",
             align: "center",
             width: 60,
             render: (value, record, index) => index + 1,
           },
           {
             title: "Ảnh",
             width: 60,
             dataIndex: POProcumentLineItemField.variant_image,
             render: (value) => (
               <div className="product-item-image">
                 <img
                   src={value === null ? imgDefIcon : value}
                   alt=""
                   className=""
                 />
               </div>
             ),
           },
           {
             title: "Sản phẩm",
             width: "99%",
             className: "ant-col-info",
             dataIndex: POProcumentLineItemField.variant,
             render: (
               value: string,
               item: PurchaseProcumentLineItem,
               index: number
             ) => (
               <div>
                 <div>
                   <div className="product-item-sku">{item.sku}</div>
                   <div className="product-item-name">
                     <span className="product-item-name-detail">
                       {value}
                     </span>
                   </div>
                 </div>
               </div>
             ),
           },
           {
             title: (
               <div
                 style={{
                   width: "100%",
                   textAlign: "right",
                   flexDirection: "column",
                   display: "flex",
                 }}
               >
                 SL Đặt hàng
                 <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                   ({formatCurrency(POUtils.totalOrderQuantityProcument(line_items),".")})
                 </div>
               </div>
             ),
             width: 130,
             dataIndex: POProcumentLineItemField.ordered_quantity,
             render: (value, item, index) => (
               <div style={{ textAlign: "right" }}>{formatCurrency(value,".")}</div>
             ),
           },
           {
             title: (
               <div
                 style={{
                   width: "100%",
                   textAlign: "right",
                   flexDirection: "column",
                   display: "flex",
                 }}
               >
                 SL nhận được duyệt
               </div>
             ),
             width: 130,
             dataIndex: POProcumentLineItemField.quantity,
             render: (value, item, index) => (
               <div style={{ textAlign: "right" }}>{value}</div>
             ),
           },
           {
             title: (
               <div
                 style={{
                   width: "100%",
                   textAlign: "right",
                   flexDirection: "column",
                   display: "flex",
                 }}
               >
                 SL thực nhận
               </div>
             ),
             width: 150,
             dataIndex: POProcumentLineItemField.real_quantity,
             render: (value, item, index) => {
               return (
               <NumberInput
                 placeholder="SL thực nhận"
                 isFloat={false}
                 value={value}
                 min={0}
                 // max={item.quantity}
                 default={0}
                 maxLength={8}
                 onChange={(quantity: number | null) => {
                   onQuantityChange(quantity, index);
                 }}
                 format={(a: string) => formatCurrency(a)}
                 replace={(a: string) =>
                  replaceFormatString(a)
                }
               />
             )},
           },
         ]}
         summary={(data) => {
           let ordered_quantity = 0;
           let quantity = 0;
           let real_quantity = 0;
           data.forEach((item) => {
             ordered_quantity = ordered_quantity + item.ordered_quantity;
             quantity = quantity + item.quantity;
             real_quantity = real_quantity + item.real_quantity;
           });
           return (
             <Table.Summary>
               <Table.Summary.Row>
                 <Table.Summary.Cell align="left" colSpan={3} index={0}>
                   <div style={{ fontWeight: 700 }}>Tổng</div>
                 </Table.Summary.Cell>
                 <Table.Summary.Cell align="right" index={1}>
                   <div style={{ fontWeight: 700 }}>
                     {formatCurrency(ordered_quantity,".")}
                   </div>
                 </Table.Summary.Cell>
                 <Table.Summary.Cell align="right" index={2}>
                   <div style={{ fontWeight: 700 }}>{formatCurrency(quantity,".")}</div>
                 </Table.Summary.Cell>
                 <Table.Summary.Cell align="right" index={3}>
                   <div style={{ fontWeight: 700, marginRight: 15 }}>
                     {formatCurrency(real_quantity,".")}
                   </div>
                 </Table.Summary.Cell>
               </Table.Summary.Row>
             </Table.Summary>
           );
         }}
        /> 
     </Modal> 
    );
  } else return <Fragment />;
};

export default ProducmentInventoryMultiModal;
