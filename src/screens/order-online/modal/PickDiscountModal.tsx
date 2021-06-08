import { Modal, Form, Select, Button, FormInstance, Input, InputNumber } from 'antd';
import React, { createRef, useState} from 'react';
// import { useDispatch } from 'react-redux';
import { formatCurrency, replaceFormat } from 'utils/AppUtils';

type PickDiscountModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (type:string,value:number,rate:number, counpon:string) => void;
  type: string;
  value: number;
  rate: number;
  counpon: string;
  amount: number
}

const PickDiscountModal: React.FC<PickDiscountModalProps> = (props: PickDiscountModalProps) => {
  const { visible, onCancel, onOk, type, value, rate, counpon } = props;
  const [_type,setType] = useState<string>(type)
  const [_value,setValue] = useState<number>(value)
  const [_rate,setRate] = useState<number>(rate)
  const [_counpon,setCounpon] = useState<string>(counpon)

  const formRef = createRef<FormInstance>();
  const onSubmit = () => {
    onOk(_type,_value,_rate, _counpon)
  };

  const handleChangeSelect = (type:string) =>{
    setType(type)
  }

  const onchangeDiscount = (value:number) =>{
    if(_type === "money"){
      setValue(Math.round(value*100)/100)
      setRate(Math.round(value/props.amount*100*100)/100)
      
    }else{
      setRate(Math.round(value*100)/100)
      setValue(Math.round(value*props.amount/100*100)/100)
    }
  }

  const onchangeCounpon = (e:any) =>{
    setCounpon(e.target.value)
  }

  return (
    <Modal title="" onCancel={onCancel} centered visible={visible} className="modal-hide-header modal-pick-discount"
           style={{ maxWidth: 398 }}
      footer={[
        <Button key="submit" type="primary" onClick={onSubmit}>Áp dụng</Button>
      ]}
    >
      <Form ref={formRef} layout="vertical">
        <div className="site-input-group-wrapper">
          <Form.Item label="Chiết khấu dơn hàng">
            <Input.Group size="large" compact>

                <Select style={{ width: '16%' }} defaultValue={_type}  onChange={handleChangeSelect}>
                  <Select.Option value="percent">%</Select.Option>
                  <Select.Option value="money">₫</Select.Option>
                </Select>

                <InputNumber
                  style={{ width: '84%' }}
                  className="hide-number-handle"
                  onFocus={(e) => e.target.select()}
                  value={_type==="money"?_value:_rate}
                  max={_type==="money"?props.amount:100}
                  formatter={value => formatCurrency(value ? value : '0')}
                  parser={value => replaceFormat(value ? value : 0)}
                  onChange = {onchangeDiscount}
                />

            </Input.Group>
          </Form.Item>
        </div>
        <div className="site-input-group-wrapper">
          <Form.Item label="Mã giảm giá">
            <Input
              placeholder="Mã giảm giá"
              onFocus={(e) => e.target.select()}
              style={{ width: '99%' }}
              value={_counpon}
              onChange={onchangeCounpon}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

export default PickDiscountModal;

