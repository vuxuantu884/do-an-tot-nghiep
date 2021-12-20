import React from "react";
import { Modal, Radio, Row, Space,Alert } from 'antd';
import '../order-duplicate.scss'
import { WarningOutlined } from "@ant-design/icons";
import { OrderModel } from "model/order/order.model";

type MergeOrderType = {
    visibleModel: boolean;
    selectedOrder: OrderModel[];
    hanldOk: (value:number) => void;
    hanldCancel: () => void;
}
var defaultOrderId:any = null;

const MergeOrderModel: React.FC<MergeOrderType> = (props: MergeOrderType) => {
    return (
        <React.Fragment>
            <Modal
                title="Gộp đơn trùng"
                visible={props.visibleModel}
                onOk={()=>{
                    props.hanldOk(defaultOrderId);
                }}
                onCancel={props.hanldCancel}
                className="modal-merge-order"
                cancelText="Hủy"
                okText="Gộp đơn"
            >
                <p>Bạn chọn lấy thông tin của đơn hàng nào làm thông tin chính sau khi gộp? </p>
                <Row>
                    <Radio.Group>
                        <Space direction="vertical">
                            {props.selectedOrder.map((value: OrderModel, index: number)=>(
                                <Radio value={value.id} onChange={(e:any)=>{
                                    defaultOrderId=e.target.value;
                                }}>{value.code}</Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </Row>
                <Alert icon={<WarningOutlined />} message="Cảnh báo: Đơn hàng đã chọn lấy thông tin giao hàng chưa được chọn hãng vận chuyển" type="warning" showIcon />
            </Modal>
        </React.Fragment>
    )
};
export default MergeOrderModel;