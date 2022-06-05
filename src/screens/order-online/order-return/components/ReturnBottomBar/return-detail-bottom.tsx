import { Button } from 'antd';
import React from 'react';
import { StyledComponent } from './styles';

type ReturnDetailBottomType={
    onOk?:()=>void;
    onCancel?:()=>void;
    hiddenButtonRemove?:boolean;
    hiddenButtonUpdate?:boolean;
}
const ReturnDetailBottom:React.FC<ReturnDetailBottomType> = (props: ReturnDetailBottomType) => {
    const { hiddenButtonRemove, onOk}= props;

    return (
        <StyledComponent>
            <div className="bottomBar bottomBar-detail">
                <Button hidden={hiddenButtonRemove} danger className='btn-detail' onClick={onOk}>Xóa</Button>
                {/* <Button hidden={hiddenButtonUpdate} type="primary" ghost className='btn-detail' id='btn-order-return'>Sửa đơn trả (F9)</Button> */}
            </div>
        </StyledComponent>
    );
}
export default ReturnDetailBottom;
