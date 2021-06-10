// @ts-ignore
import {
  Button,
  Card,
  Divider,
  Input,
  Row,
  Col,
  Radio,
  InputNumber,
  Select
} from "antd";

// @ts-ignore
import arrowDownIcon from 'assets/img/drow-down.svg';

import walletIcon from "../../assets/img/wallet.svg";


type PaymentCardProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  paymentMethod: number
}


const PaymentCard: React.FC<PaymentCardProps> = (props: PaymentCardProps) => {

  const changePaymentMethod = (value: number) => {
    props.setSelectedPaymentMethod(value);
  };

  return (
    <Card className="card-block card-block-normal"
          title={<div className="d-flex"><img src={walletIcon} alt="" /> Thanh toán</div>}>
      <div className="payment-method-radio-list">
        <label htmlFor="" className="required-label"><i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i></label>
        <div style={{ marginTop: 15 }}>
          <Radio.Group name="radiogroup" value={props.paymentMethod} onChange={(e) => changePaymentMethod(e.target.value)}>
            <Radio value={1}>COD</Radio>
            <Radio value={2}>Thanh toán trước</Radio>
            <Radio value={3}>Thanh toán sau</Radio>
          </Radio.Group>
        </div>
      </div>

      <Divider/>

      <div className="payment-method-content">
        <Row gutter={24} className="payment-cod-box" hidden={props.paymentMethod !== 1}>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Tiền thu hộ</label>
              <div>
                <InputNumber min={0} placeholder="Nhập số tiền" className="text-right hide-handler-wrap w-100"/>
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={24} hidden={props.paymentMethod !== 2}>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Hình thức thanh toán</label>
              {/*<Input placeholder="Chuyển Khoản"*/}
              {/*       suffix={<img src={arrowDownIcon} alt="down" />}*/}
              {/*/>*/}

              <Select className="select-with-search" showSearch
                      style={{ width: '100%' }}
                      placeholder=""
              >
                <Select.Option value="1">Chuyển khoản</Select.Option>
                <Select.Option value="2">COD</Select.Option>
                <Select.Option value="3">Communicated</Select.Option>
                <Select.Option value="4">Identified</Select.Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Số tiền</label>
              <Input placeholder="Chuyển Khoản"/>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Ngày chuyển khoản</label>
              <Input placeholder="Ngày chuyển khoản"
                     suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">Tham chiếu</label>
              <Input placeholder="Nhập tham chiếu"/>
            </div>
          </Col>
          <Col span={24}>
            <Button type="link" className="p-0">Thêm hình thức thanh toán</Button>
          </Col>
        </Row>

        <Row className="payment-later-box" hidden={props.paymentMethod !== 3}>
          <div className="form-group m-0">
            <label htmlFor=""><i>Bạn có thể xử lý thanh toán sau khi tạo đơn hàng.</i></label>
          </div>
        </Row>
      </div>

    </Card>
  )
}

export default PaymentCard;
