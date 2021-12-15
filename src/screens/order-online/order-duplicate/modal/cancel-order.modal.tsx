import { Modal } from "antd";
import React from "react";

type CancelOrderModelType={
    visibleModel:boolean;
    hanldOk:()=>void;
    hanldCancel:()=>void;
}
const CancelOrderModel:React.FC<CancelOrderModelType>=(props:CancelOrderModelType)=>{
    return(
        <React.Fragment>
            <Modal 
                visible={props.visibleModel}
                onOk={props.hanldOk}
                onCancel={props.hanldCancel}
            >
                <p></p>
            </Modal>
        </React.Fragment>
    )
}

export default CancelOrderModel;