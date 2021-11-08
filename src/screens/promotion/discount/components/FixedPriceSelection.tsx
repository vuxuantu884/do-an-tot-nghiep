import {Button, Checkbox, Col, Form, Modal, Row, Space} from "antd";
import React, {useEffect, useState} from "react";
import "../discount.scss";
import {RiUpload2Line} from "react-icons/ri";
import Dragger from "antd/es/upload/Dragger";
import {PlusOutlined} from "@ant-design/icons";
import FixedPriceGroup from "./FixedPriceGroup";
import importIcon from "../../../../assets/icon/import.svg";
import { Link } from "react-router-dom";

const FixedPriceSelection = (props: any) => {
  const {form, discountMethod} = props;
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [allProduct, setAllProduct] = useState<boolean>(false);

  useEffect(() => {

  }, [allProduct])
  return (
    <Col span={24}>
      <Form.List
        name="entitlements"
      >
        {(fields, {add, remove}, {errors}) => {
          // if (Array.isArray(fields) && fields.length >= 2) {
          //   const last = fields[fields.length - 1]
          //   fields.pop();
          //   fields.unshift(last);
          // }

          return (
            <>
              <Row>
                <Col span={4}>
                  <Checkbox onChange={(value) => {
                    setAllProduct(value.target.checked)
                  }}>Tất cả sản phẩm</Checkbox>
                </Col>
                <Col span={20}>
                  <Row justify="end">
                    <Space size={16}>
                      <Form.Item>
                        <Button
                          onClick={() => setShowImportModal(true)}
                          icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
                        >
                          Nhập file
                        </Button>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          disabled={allProduct}
                          onClick={() => add()}
                          icon={<PlusOutlined/>}
                        >
                          Thêm chiết khấu
                        </Button>
                      </Form.Item>
                    </Space>
                  </Row>
                </Col>
              </Row>

              {
                fields.reverse().map(({key, name, fieldKey, ...restField}) => {
                  return(
                    <FixedPriceGroup
                      key={key}
                      name={name}
                      remove={remove}
                      fieldKey={fieldKey}
                      form={form}
                      restField={restField}
                      isFirst={key === 0}
                      allProducts={allProduct}
                      discountMethod={discountMethod}
                    />
                  )
                })}

            </>
          )
        }}
      </Form.List>
      <Modal
        onCancel={() => setShowImportModal(false)}
        width={650}
        visible={showImportModal}
        title="Nhập file khuyến mại"
        footer={[
          <Button key="back" onClick={() => setShowImportModal(false)}>
            Huỷ
          </Button>,

          <Button
            key="link"
            type="primary"
          >
            Nhập file
          </Button>,
        ]}
      >
        <Row gutter={12}>
          <Col span={3}>
            Chú ý:
          </Col>
          <Col span={19}>
            <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
            <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
            <p>- Tải file mẫu <Link to="#">tại đây</Link></p>
            <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
            <p>- Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5 phút. Trong lúc hệ thống xử lý
              không F5 hoặc tắt cửa sổ trình duyệt.</p>
          </Col>
        </Row>
        <Row gutter={24}>
          <div className="dragger-wrapper">
            <Dragger accept=".xlsx">
              <p className="ant-upload-drag-icon">
                <RiUpload2Line size={48}/>
              </p>
              <p className="ant-upload-hint">
                Kéo file vào đây hoặc tải lên từ thiết bị
              </p>
            </Dragger>
          </div>
        </Row>
      </Modal>

    </Col>
  );
}

export default FixedPriceSelection;
