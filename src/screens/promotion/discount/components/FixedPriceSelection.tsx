import {Button, Checkbox, Col, Divider, Form, message, Modal, Row, Space} from "antd";
import React, {useState} from "react";
import "../discount.scss";
import _ from "lodash";
import {RiUpload2Line} from "react-icons/ri";
import Dragger from "antd/es/upload/Dragger";
import {CheckCircleOutlined, LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import FixedPriceGroup from "./FixedPriceGroup";
import importIcon from "../../../../assets/icon/import.svg";
import {AppConfig} from "../../../../config/app.config";
import {getToken} from "../../../../utils/LocalStorageUtils";
import {customGroupBy} from "../../../../utils/AppUtils";

const csvColumnMapping: any = {
  sku: "Mã SKU",
  min_amount: "SL Tối thiểu",
  usage_limit: "Giới hạn",
  discount_percentage: "Chiết khấu (%)",
  fixed_amount: "Chiết khấu (VND)",
  invalid: "không đúng định dạng",
  notfound: "không tìm thấy",
  required: "Không được trống",
};

const FixedPriceSelection = (props: any) => {
  const token = getToken() || "";
  const {form, discountMethod} = props;
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [allProduct, setAllProduct] = useState<boolean>(false);
  const [entitlementsResponse, setEntitlementsResponse] = useState([]);
  const [entitlementErrorsResponse, setEntitlementErrorsResponse] = useState<Array<any>>([]);
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"error" | "success" | "done" | "uploading" | "removed" | undefined>(undefined);

  const handleImportEntitlements = () => {
    const entitlements = Object.assign([], _.uniqBy(entitlementsResponse, "variant_id"));
    const importedResult = customGroupBy(entitlements, ["discount_value", "discount_type", "min_quantity", "limit"]);
    const formEntitlements = form.getFieldValue("entitlements");
    importedResult.forEach((i: any) => {
      // let existedIndex = -1;
      const formEntitlement = {
        variants: i.variants,
        "prerequisite_quantity_ranges.allocation_limit": i.limit,
        "prerequisite_quantity_ranges.greater_than_or_equal_to": i.min_quantity,
        "prerequisite_quantity_ranges.value_type": form.getFieldValue("entitled_method") === "FIXED_PRICE" ? "FIXED_AMOUNT" : i.discount_type,
        "prerequisite_quantity_ranges.value": i.discount_value,
      };
      // console.log('formEntitlement: ', formEntitlement);
      // const existedEntitlement = formEntitlements.find((e: any, index: number) => {
      //   console.log(`${index} :`, e);
      //   if (e["prerequisite_quantity_ranges.allocation_limit"] === formEntitlement["prerequisite_quantity_ranges.allocation_limit"] &&
      //     e["prerequisite_quantity_ranges.greater_than_or_equal_to"] === formEntitlement["prerequisite_quantity_ranges.greater_than_or_equal_to"] &&
      //     e["prerequisite_quantity_ranges.value_type"] === formEntitlement["prerequisite_quantity_ranges.value_type"] &&
      //     e["prerequisite_quantity_ranges.value"] === formEntitlement["prerequisite_quantity_ranges.value"]) {
      //     existedIndex = index;
      //     return true;
      //   }
      //   return false;
      // })

      // if (existedEntitlement && existedEntitlement.variants.length > 0) {
      //   console.log('existedEntitlement: ', existedEntitlement);
      //   existedEntitlement.variants.push(...formEntitlement.variants);
      //   formEntitlements[existedIndex] = existedEntitlement;
      // } else {
        formEntitlements.push(formEntitlement);
      // }
    });

    setUploadStatus(undefined);
    setShowImportModal(false);
  };

  return (
    <Col span={24}>
      <Form.List
        name="entitlements"
      >
        {(fields, {add, remove}, {errors}) => {
          return (
            <>
              <Row>
                <Col span={4}>
                  <Checkbox onChange={(value) => {
                    setAllProduct(value.target.checked);
                  }}>Tất cả sản phẩm</Checkbox>
                </Col>
                <Col span={20}>
                  <Row justify="end">
                    <Space size={16}>
                      <Form.Item>
                        <Button
                          onClick={() => setShowImportModal(true)}
                          icon={<img src={importIcon} style={{marginRight: 8}} alt="" />}
                        >
                          Nhập file
                        </Button>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          disabled={allProduct}
                          onClick={() => add()}
                          icon={<PlusOutlined />}
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
                  return (
                    <FixedPriceGroup
                      key={key}
                      name={name}
                      remove={remove}
                      fieldKey={fieldKey}
                      form={form}
                      restField={restField}
                      allProducts={allProduct}
                      discountMethod={discountMethod}
                    />
                  );
                })}

            </>
          );
        }}
      </Form.List>
      <Modal
        onCancel={() => {
          setSuccessCount(0)
          setSuccessCount(0)
          setUploadStatus(undefined);
          setShowImportModal(false);
        }}
        width={650}
        visible={showImportModal}
        title="Nhập file khuyến mại"
        footer={[
          <Button key="back" onClick={() => {
            setSuccessCount(0)
            setSuccessCount(0)
            setUploadStatus(undefined);
            setShowImportModal(false);
          }}>
            Huỷ
          </Button>,

          <Button
            key="link"
            type="primary"
            onClick={() => handleImportEntitlements()}
          >
            Nhập file
          </Button>,
        ]}
      >
        <div style={{display: uploadStatus === undefined || uploadStatus === "removed" || uploadStatus === "error" ? "" : "none"}}>
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
                action={`${AppConfig.baseUrl}promotion-service/price-rules/entitlements/read-file?type=${form.getFieldValue("entitled_method")}`}
                headers={{"Authorization": `Bearer ${token}`}}
                onChange={(info) => {
                  const {status} = info.file;
                  if (status === "done") {
                    const response = info.file.response;
                    if (response.code === 20000000) {
                      if (response.data.data.length > 0) {
                        setEntitlementsResponse(entitlementsResponse.concat(response.data.data));
                      }
                      if (response.data.errors.length > 0) {
                        const errors: Array<any> = _.uniqBy(response.data.errors, "index").sort((a:any, b:any) => a.index - b.index);
                        setEntitlementErrorsResponse([...errors]);
                      }
                      setImportTotal(response.data.total);
                      setSuccessCount(response.data.success_count);
                    }
                    setUploadStatus(status);
                  } else if (status === "error") {
                    message.error(`${info.file.name} file upload failed.`);
                    setUploadStatus(status);

                  } else {
                    setUploadStatus(status);
                  }
                }}
              >
                <p className="ant-upload-drag-icon">
                  <RiUpload2Line size={48} />
                </p>
                <p className="ant-upload-hint">
                  Kéo file vào đây hoặc tải lên từ thiết bị
                </p>
              </Dragger>
            </div>
          </Row>
        </div>
        <div
          style={{display: uploadStatus === "done" || uploadStatus === "uploading" || uploadStatus === "success" ? "" : "none"}}>
          <Row justify={"center"}>
            {uploadStatus === "uploading" ?
              <Col span={24}>
                <Row justify={"center"}>
                  <LoadingOutlined style={{fontSize: "78px"}} />
                </Row>
                <Row justify={"center"}>
                  <h2 style={{padding: "10px 30px"}}>
                    Đang upload file...
                  </h2>
                </Row>
              </Col>
              : ""}
            {uploadStatus === "done" || uploadStatus === "success" ?
              <Col span={24}>
                <Row justify={"center"}>
                  <CheckCircleOutlined style={{fontSize: "78px", color: "#27AE60"}} />
                </Row>
                <Row justify={"center"}>
                  <h2 style={{padding: "10px 30px"}}>Xử lý file nhập toàn tất: <strong
                    style={{color: "#2A2A86"}}>{successCount} / {importTotal}</strong> sản phẩm thành công</h2>
                </Row>
                <Divider />
                {entitlementErrorsResponse.length > 0 ? <div>
                  <Row justify={"start"}>
                    <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                  </Row>
                  <Row justify={"start"}>
                    <li style={{padding: "10px 30px"}}>
                      {entitlementErrorsResponse?.map((error: any, index) =>
                        <ul key={index}>
                          <span>- Dòng {error.index + 2}: {csvColumnMapping[error.column]} {csvColumnMapping[error.type.toLowerCase()]}</span>
                        </ul>)}
                    </li>
                  </Row>
                </div> : ""}
              </Col>
              : ""}
          </Row>
        </div>
      </Modal>

    </Col>
  );
};

export default FixedPriceSelection;
