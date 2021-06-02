import { Modal, Form, Select, Button, FormInstance, Input, InputNumber } from 'antd';
import { addDiscountOrder } from 'domain/actions/order.action';
import React, { createRef, useCallback} from 'react';
import { useDispatch } from 'react-redux';
// import { useDispatch } from 'react-redux';
import { formatCurrency, replaceFormat } from 'utils/AppUtils';

type PickDiscountModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: () => void;
  type: string;
  value: number;
  counpon: string;
}

const PickDiscountModal: React.FC<PickDiscountModalProps> = (props: PickDiscountModalProps) => {
  const { visible, onCancel, onOk, type, value, counpon } = props;
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSubmit = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);


  const onFinish = useCallback((values) => {
    dispatch(addDiscountOrder(values.counpon, values.order_discount.type,values.order_discount.value, onOk))
  }, [dispatch, onOk]);

  return (
    <Modal title="" onCancel={onCancel} onOk={onSubmit} centered visible={visible} className="modal-hide-header modal-pick-discount"
           style={{ maxWidth: 398 }}
      footer={[
        <Button key="submit" type="primary" onClick={onSubmit}>Áp dụng</Button>
      ]}
    >
      <Form ref={formRef} layout="vertical" onFinish={onFinish} initialValues={{ coupon: counpon, order_discount: { type: type, value: value } }}>
        <div className="site-input-group-wrapper">
          <Form.Item label="Chiết khấu dơn hàng">
            <Input.Group size="large" compact>
              <Form.Item
                name={['order_discount', 'type']}
                noStyle
              >
                <Select style={{ width: '16%' }}>
                  <Select.Option value="percent">%</Select.Option>
                  <Select.Option value="money">₫</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['order_discount', 'value']}
                noStyle
              >
                <InputNumber
                  style={{ width: '84%' }}
                  className="hide-number-handle"
                  onFocus={(e) => e.target.select()}
                  formatter={value => formatCurrency(value ? value : '0')}
                  parser={value => replaceFormat(value ? value : 0)}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </div>
        <div className="site-input-group-wrapper">
          <Form.Item name="coupon" label="Mã giảm giá">
            <Input
              placeholder="Mã giảm giá"
              onFocus={(e) => e.target.select()}
              style={{ width: '99%' }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

export default PickDiscountModal;

