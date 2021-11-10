import {Button, Checkbox, Col, Form, Modal, Row, Space, message, Divider} from "antd";
import React, {useEffect, useState} from "react";
import "../discount.scss";
import {RiUpload2Line} from "react-icons/ri";
import Dragger from "antd/es/upload/Dragger";
import {CheckCircleOutlined, LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import FixedPriceGroup from "./FixedPriceGroup";
import importIcon from "../../../../assets/icon/import.svg";
import { AppConfig } from "../../../../config/app.config";

const csvColumnMapping: any = {
  sku: "Mã SKU",
  min_amount: "SL Tối thiểu",
  usage_limit: "Giới hạn",
  discount_percentage: "Chiết khấu (%)",
  fixed_amount: "Chiết khấu (VND)",
  invalid: "không đúng định dạng",
  notfound: "không tìm thấy",
  required: "Không được trống"
}

const FixedPriceSelection = (props: any) => {
  const {form, discountMethod} = props;
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [allProduct, setAllProduct] = useState<boolean>(false);
  const [entitlementsResponse, setEntitlementsResponse] = useState([])
  const [entitlementErrorsResponse, setEntitlementErrorsResponse] = useState([])
  const [uploadStatus, setUploadStatus] = useState<'error' | 'success' | 'done' | 'uploading' | 'removed' | undefined>(undefined)

  // const importData = useCallback(() => {

  // }, [entitlementsResponse])

  useEffect(() => {
    console.log('useEffect: ', uploadStatus);
  }, [allProduct, uploadStatus])
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
        onCancel={() => {

          setShowImportModal(false)

        }}
        width={650}
        visible={showImportModal}
        title="Nhập file khuyến mại"
        footer={[
          <Button key="back" onClick={() => {
            setUploadStatus(undefined);
            setShowImportModal(false)
          }}>
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
        <div style={{display: uploadStatus === undefined || uploadStatus === "removed" ? "" : "none"}}>
          <Row gutter={12}>
            <Col span={3}>
              Chú ý:
            </Col>
            <Col span={19}>
              <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
              <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
              <p>- Tải file mẫu <a href={AppConfig.ENTITLEMENTS_TEMPLATE_URL}>tại đây</a></p>
              <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
              <p>- Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5 phút. Trong lúc hệ thống xử lý
                không F5 hoặc tắt cửa sổ trình duyệt.</p>
            </Col>
          </Row>
          <Row gutter={24}>
            <div className="dragger-wrapper">
              <Dragger
                accept=".xlsx"
                multiple={false}
                action={'http://localhost:4000/unicorn/promotion-service/price-rules/entitlements/read-file'}
                onChange={(info) => {
                    const { status } = info.file;
                    if (status !== 'uploading') {
                      console.log("Upload: ", info.file, info.fileList);
                    }
                    if (status === 'done') {
                      message.success(`${info.file.name} file uploaded successfully.`);
                      // console.log('upload done: ', info);
                      console.log("upload response: ", info.file.response);
                      const response = info.file.response;
                      if (response.code === 20000000) {
                        if (response.data.data.length > 0) setEntitlementsResponse(response.data.data);
                        if (response.data.errors.length > 0) setEntitlementErrorsResponse(response.data.errors);
                      }
                      setUploadStatus(status);
                    } else if (status === 'error') {
                      console.log('upload error: ', info);
                      message.error(`${info.file.name} file upload failed.`);
                      setUploadStatus(status);

                    } else {
                      console.log("status: ", status);
                      setUploadStatus(status);
                    }
                  }}
                onDrop={(e) => {
                  console.log('Dropped files', e);
                }}
                >
                <p className="ant-upload-drag-icon">
                  <RiUpload2Line size={48}/>
                </p>
                <p className="ant-upload-hint">
                  Kéo file vào đây hoặc tải lên từ thiết bị
                </p>
              </Dragger>
            </div>
          </Row>
        </div>
        <div style={{display: uploadStatus === "done" || uploadStatus === "uploading" || uploadStatus === "success" ? "" : "none"}}>
          <Row justify={"center"}>
            {uploadStatus === "uploading" ?
              <Col span={24}>
                <Row justify={"center"}>
                  <LoadingOutlined style={{fontSize: "78px"}}/>
                </Row>
                <Row justify={"center"}>
                  <h2 style={{padding: "10px 30px"}}>
                    Đang upload file...
                  </h2>
                </Row>
              </Col>

              : ''}
            {uploadStatus === "done" ?
              <Col span={24}>
                <Row justify={"center"}>
                  <CheckCircleOutlined style={{fontSize: "78px", color: "#27AE60"}}/>
                </Row>
                <Row justify={"center"}>
                  <h2 style={{padding: "10px 30px"}}>Xử lý file nhập toàn tất: <strong style={{color: "#2A2A86"}}>{entitlementsResponse?.length} / {entitlementsResponse?.length + entitlementErrorsResponse?.length}</strong> sản phẩm thành công</h2>
                </Row>
                <Divider/>
                <Row justify={"start"}>
                  <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                </Row>
                <Row justify={"start"}>
                  <li style={{padding: "10px 30px"}}>
                    {entitlementErrorsResponse?.map((error:any) =>
                      <ul>
                        <span>- Dòng {error.index}: {csvColumnMapping[error.column]} {csvColumnMapping[error.type]}</span>
                      </ul>)}
                  </li>
                </Row>
              </Col>
              : ''}
          </Row>
        </div>
      </Modal>

    </Col>
  );
}

export default FixedPriceSelection;
