import {Button, Col, Input, Modal, Radio, Row, Select, Space} from "antd";
import arrowDownIcon from "../../assets/img/drow-down.svg";
import React, {useCallback} from "react";
import plusBlueIcon from "../../assets/img/plus-blue.svg";

type EditCustomerModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: () => void;
}


const EditCustomerModal: React.FC<EditCustomerModalProps> = (props: EditCustomerModalProps) => {
  const { visible, onCancel, onOk } = props
  const onOkPress = useCallback(() => {
    onOk();
  }, [onOk]);
  return (
    <Modal title="Chỉnh sửa thông tin khách hàng" visible={visible} centered
           okText="Lưu" cancelText="Hủy" className="update-customer-modal"
           onOk={onOkPress} onCancel={onCancel}>
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="required-label">Tên khách hàng</label>
            <Input placeholder="Tên khách hàng"
                   suffix={<img src={arrowDownIcon} alt="down" />}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search mb-0">
            <label htmlFor="" className="required-label">Số điện thoại</label>
            <Input placeholder="Số điện thoại" />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Mã thẻ</label>
            <Input placeholder="Nhập mã thẻ"/>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search mb-0">
            <label htmlFor="" className="required-label">Ngày sinh</label>
            <Input placeholder="Ngày sinh" />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="required-label">Khu vực</label>
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
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Địa chỉ</label>
            <Input placeholder="Địa chỉ" />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Email</label>
            <Input placeholder="Nhập email" />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Nguồn</label>
            <div>
              <Input.Search
                placeholder="Chọn nguồn"
                enterButton={<Button type="text"><img src={plusBlueIcon} alt="" /></Button>}
                suffix={<img src={arrowDownIcon} alt="down" />}
                onSearch={() => console.log(1)}
              />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Nhóm</label>
            <div>
              <Select defaultValue="1" className="select-with-search" >
                <Select.Option value="1">Nhóm 1</Select.Option>
                <Select.Option value="2">Nhóm 2</Select.Option>
              </Select>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search mb-0">
            <label htmlFor="" className="">Giới tính</label>
            <div>
              <Radio.Group value={1}>
                <Space>
                  <Radio value={1}>Nam</Radio>
                  <Radio value={2}>Nữ</Radio>
                  <Radio value={3}>Không xác định</Radio>
                </Space>
              </Radio.Group>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="form-group form-group-with-search mb-0">
            <label htmlFor="" className="">Ghi chú</label>
            <Input placeholder="Điền ghi chú" />
          </div>
        </Col>
      </Row>
    </Modal>
  )
}

export default EditCustomerModal;
