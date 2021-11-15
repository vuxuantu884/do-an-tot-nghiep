import { Button, Divider, Modal, Row, Table } from "antd";
import { useState } from "react";
// import { ShipmentModel } from "model/order/shipment.model";
import NumberFormat from "react-number-format";

type ShipmentDetailsModalProps = {
  visible: boolean;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  shipmentDetails: any;
};

const ShipmentDetailsModal: React.FC<ShipmentDetailsModalProps> = (
  props: ShipmentDetailsModalProps
) => {
  const { visible, onOk, shipmentDetails } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columnsItems, setColumnsItems]  = useState<Array<any>>([
    {
      title: "STT",
      dataIndex: "index",
      visible: true,
      width:"10%",
    },
    // {
    //   title: "Mã SKU",
    //   dataIndex: "sku",
    //   visible: true,
    //   width:"150px",
    // },
    {
      title: "Tên sản phẩm",
      render: (record: any) => (
        <div>
          <div style={{ color: '#2A2A86'}}>{record.sku}</div>
          <div>{record.variant}</div>
        </div>
      ),
      visible: true,
      width: "40%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      visible: true,
      align: 'center'
    },
    {
      title: <span><span>Đơn giá </span><span style={{color: '#737373', fontWeight: 400}}> đ</span></span>,
      dataIndex: "price",
      visible: true,
      align: 'right'
    },
    {
      title: <span><span>Thành tiền </span><span style={{color: '#737373', fontWeight: 400}}> đ</span></span>,
      render: (record: any) => (
        <NumberFormat
          value={record.price * record.quantity}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      visible: true,
      align: 'right'
    },
  ]);
  return (
    <Modal
      onOk={onOk}
      onCancel={onOk}
      visible={visible}
      centered
      title={[
        <span style={{fontWeight: 600, fontSize: 16}}>Chi tiết đơn giao hàng {shipmentDetails.code}</span>
      ]}
      width={700}
      footer={[
        <Button key="back" onClick={onOk}>
          OK
        </Button>,
      ]}
    >
      <Row style={{ width: '100%'}}>
        {shipmentDetails.shipping_address && (
        <div className="customer" style={{ display: 'flex', marginBottom: '20px', width: '100%'}}>
          <div style={{ width: '30%', borderRight: '1px solid #E5E5E5'}}>
            <p style={{ color: "#2A2A86", marginBottom: '5px' }}>{shipmentDetails.shipping_address.name}</p>
            <p style={{ marginBottom: 0 }}>{shipmentDetails.shipping_address.phone}</p>
          </div>
          <div style={{ width: '70%', paddingLeft: '3%' }}>
            <p style={{ marginBottom: '5px', fontWeight: 500}}>Địa chỉ giao hàng:</p>
            <p style={{ color: "#666666", marginBottom: 0 }}>{shipmentDetails.shipping_address.full_address}</p>
          </div>
        </div>)}
      </Row>
      <Table
          dataSource={shipmentDetails?.items?.map((item: any, index: number) => {
            return {
              ...item,
              index: index +1
            }
          })}
          columns={columnsItems}
          pagination={false}
          style={{ width: '100%'}}
        />
      <Row gutter={16} style={{ justifyContent: 'end', width: '100%' }}>
        <div style={{ width: '50%'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px', marginTop: '20px'}}>
            <div>Tổng tiền:</div>
            <div style={{ color: "#2A2A86"}}>
              <NumberFormat
                value={shipmentDetails.total}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px'}}>
            <div>Chiết khấu:</div>
            <div style={{ color: "#2A2A86" }}>
              <NumberFormat
                value={shipmentDetails.total_discount? shipmentDetails.total_discount : 0}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px'}}>
            <div>Phí giao hàng:</div>
            <div style={{ color: "#2A2A86" }}>
              <NumberFormat
                value={shipmentDetails?.shipment?.shipping_fee_informed_to_customer ? shipmentDetails.shipment.shipping_fee_informed_to_customer : 0}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            </div>
          </div>
          <Divider style={{ marginTop: 0}}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px'}}>
            <div>COD:</div>
            <div style={{ color: "#2A2A86"}}>
              <NumberFormat
                value={shipmentDetails?.shipment?.cod ? shipmentDetails.shipment.cod : 0}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            </div>
          </div>
          
        </div>
      </Row>
    </Modal>
  );
};

export default ShipmentDetailsModal;
