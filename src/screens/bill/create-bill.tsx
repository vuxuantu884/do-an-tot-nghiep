import {Button, Card, Input, Row, Col, Tooltip, } from "antd";
import React from "react";
import documentIcon from "../../assets/img/document.svg";
import arrowDownIcon from 'assets/img/drow-down.svg';
import warningCircleIcon from 'assets/img/warning-circle.svg';
import ProductCard from "../../component/OrderOnline/productCard";
// @ts-ignore
import CustomerCard from "../../component/OrderOnline/customerCard";
// @ts-ignore
import PaymentCard from "../../component/OrderOnline/paymentCard";
// @ts-ignore
import ShipmentCard from "../../component/OrderOnline/shipmentCard";

const CreateBill = () => {

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={17}>
          {/*--- customer ---*/}
          <CustomerCard />
          {/*--- end customer ---*/}

          {/*--- product ---*/}
          <ProductCard />
          {/*--- end product ---*/}

          {/*--- shipment ---*/}
          <ShipmentCard />
          {/*--- end shipment ---*/}

          {/*--- payment ---*/}
          <PaymentCard />
          {/*--- end payment ---*/}
        </Col>

        <Col xs={24} lg={7}>
          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={documentIcon} alt="" /> Thông tin đơn hàng</div>}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="required-label">Nhân viên bán hàng</label>
              <Input placeholder="Tìm tên/ mã nhân viên"
                suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
            <div className="form-group form-group-with-search">
              <div>
                <label htmlFor="" className="">Tham chiếu</label>
                <Tooltip title="Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input placeholder="Điền tham chiếu" suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
            <div className="form-group form-group-with-search mb-0">
              <div>
                <label htmlFor="" className="">Đường dẫn</label>
                <Tooltip title="Thêm đường dẫn đơn hàng gốc trên kênh bán hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input placeholder="Điền đường dẫn"
                suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </div>
          </Card>

          <Card className="card-block card-block-normal"
                title={<div className="d-flex"><img src={documentIcon} alt="" /> Thông tin bổ sung</div>}>
            <div className="form-group form-group-with-search">
              <div>
                <label htmlFor="" className="">Ghi chú</label>
                <Tooltip title="Thêm thông tin ghi chú chăm sóc khách hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input.TextArea placeholder="Điền ghi chú" />
            </div>
            <div className="form-group form-group-with-search mb-0">
              <div>
                <label htmlFor="" className="">Tag</label>
                <Tooltip title="Thêm từ khóa để tiện lọc đơn hàng" className="tooltip-icon">
                  <span><img src={warningCircleIcon} alt="" /></span>
                </Tooltip>
              </div>
              <Input placeholder="Thêm tag" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="footer-row-btn" justify="end">
        <Button type="default" className="btn-style btn-cancel">Hủy</Button>
        <Button type="default" className="btn-style btn-save">Lưu</Button>
      </Row>

    </div>
  )
}

export default CreateBill;