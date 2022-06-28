import { Button, Modal } from "antd";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import React, { useContext, useMemo, useState } from "react";

type Props = {
    isVisible?: boolean;
    setIsVisible?:(value:boolean)=>void;
}

const PackConfirmModal = (props: Props) => {
    const { isVisible = false , setIsVisible} = props;

    // const orderPackContextData = useContext(OrderPackContext);
    // const singlePack = orderPackContextData?.singlePack;

    // const packedOrders = useMemo(() => (singlePack?.fulfillments||[]), [singlePack]);

    return (
        <React.Fragment>
            <Modal
                className="packed-modal-confirm"
                title="Danh sách đơn đẩy sang hãng vận chuyển thất bại"
                centered
                visible={isVisible}
                footer={
                    <React.Fragment>
                        <Button type="default" onClick={()=>setIsVisible&&setIsVisible(false)}>Đóng</Button>
                    </React.Fragment>
                }
            >
            </Modal>
        </React.Fragment>
    )
}

export default PackConfirmModal;