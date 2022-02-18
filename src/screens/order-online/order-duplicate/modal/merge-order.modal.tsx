import React, { useState } from "react";
import { Modal, Radio, Row, Space, Alert } from 'antd';
import '../order-duplicate.scss'
import { WarningOutlined } from "@ant-design/icons";
import { OrderModel } from "model/order/order.model";
import { DeliveryServiceResponse } from "model/response/order/order.response";

type MergeOrderType = {
    visibleModel: boolean;
    selectedOrder: OrderModel[];
    hanldOk: (value: number) => void;
    hanldCancel: () => void;
    deliveryServices: DeliveryServiceResponse[];
}
var defaultOrderId: any = null;

const MergeOrderModel: React.FC<MergeOrderType> = (props: MergeOrderType) => {

    const [logisticsWarning, setLogisticsWarning] = useState(false);
    //const selectOrder:number=0;

    const checkOrderShipment = (order_id: number) => {
        let logistics=false
        let order = props.selectedOrder.find(x => x.id === order_id);
        order?.fulfillments?.forEach(function (item) {
            // let shipment_delivery_service_provider_id = item.shipment?.delivery_service_provider_id;
            // let index = props.deliveryServices.findIndex(x => x.id === shipment_delivery_service_provider_id);
            if (item.shipment===null) logistics=true;
        });

        setLogisticsWarning(logistics);
    }

    return (
        <React.Fragment>
            <Modal
                title="Gộp đơn trùng"
                visible={props.visibleModel}
                onOk={() => {
                    props.hanldOk(defaultOrderId);
                }}
                onCancel={props.hanldCancel}
                className="modal-merge-order"
                cancelText="Hủy"
                okText="Gộp đơn"
            >
                <p>Bạn chọn lấy thông tin của đơn hàng nào làm thông tin chính sau khi gộp? </p>
                <Row>
                    <Radio.Group onChange={(e: any) => {
                        checkOrderShipment(e.target.value);
                    }}>
                        <Space direction="vertical">
                            {props.selectedOrder.map((value: OrderModel, index: number) => (
                                <Radio value={value.id} onChange={(e: any) => {
                                    defaultOrderId = e.target.value;
                                }}>{value.code}</Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </Row>
                <Alert style={logisticsWarning===false?{ display: "none" }:{display:""}} icon={<WarningOutlined />} message="Cảnh báo: Đơn hàng đã chọn lấy thông tin chưa có thông tin hình thức vận chuyển" type="warning" showIcon />
            </Modal>
        </React.Fragment>
    )
};
export default MergeOrderModel;