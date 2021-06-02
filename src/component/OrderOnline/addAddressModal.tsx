import {Col, Input, Modal, Row, Select} from "antd";
import arrowDownIcon from "../../assets/img/drow-down.svg";
import React, {useCallback} from "react";

type AddAddressModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: () => void;
}


const AddAddressModal: React.FC<AddAddressModalProps> = (props: AddAddressModalProps) => {
  const { visible, onCancel, onOk } = props
  const onOkPress = useCallback(() => {
    onOk();
  }, [onOk]);
  return (
    <Modal title="Thêm địa chỉ" visible={visible} centered
           okText="Lưu" cancelText="Hủy" className="update-shipping"
           onOk={onOkPress} onCancel={onCancel}>
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="required-label">Tên người nhận</label>
            <Input placeholder="Tên người nhận"
                   suffix={<img src={arrowDownIcon} alt="down" />}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Khu vực</label>
            <Select className="select-with-search" showSearch
                    style={{ width: '100%' }}
                    placeholder=""
            >
              <Select.Option value="1">Thanh Xuân</Select.Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="required-label">Địa chỉ</label>
            <Input placeholder="Địa chỉ" />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Phường xã</label>
            <Select className="select-with-search" showSearch
                    style={{ width: '100%' }}
                    placeholder=""
            >
              <Select.Option value="1">Thanh Xuân</Select.Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search mb-0">
            <label htmlFor="" className="required-label">Số điện thoại</label>
            <Input placeholder="Số điện thoại" />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search mb-0">
            <label htmlFor="" className="required-label">Số điện thoại khác có thể gọi</label>
            <Input placeholder="Nhập số điện thoại" />
          </div>
        </Col>
      </Row>
    </Modal>
  )
}

export default AddAddressModal;
