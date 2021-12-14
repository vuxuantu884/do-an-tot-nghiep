import { CheckCircleOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Divider, Form, FormInstance, message, Modal, Row, Space } from "antd";
import Dragger from "antd/es/upload/Dragger";
import _ from "lodash";
import {
  DiscountFormModel,
  DiscountMethod,
  VariantEntitlementsResponse,
} from "model/promotion/discount.create.model";
import React, { useLayoutEffect, useState } from "react";
import { VscError } from "react-icons/all";
import { RiUpload2Line } from "react-icons/ri";
import { shareDiscount } from "utils/PromotionUtils";
import importIcon from "../../../../assets/icon/import.svg";
import { AppConfig } from "../../../../config/app.config";
import { getToken } from "../../../../utils/LocalStorageUtils";
import "../discount.scss";
import FixedPriceGroup from "./fixed-price-group";

const csvColumnMapping: any = {
  sku: "Mã SKU",
  min_quantity: "SL Tối thiểu",
  usage_limit: "Giới hạn",
  discount_percentage: "Chiết khấu (%)",
  fixed_amount: "Chiết khấu (VND)",
  invalid: "Không đúng định dạng",
  notfound: "không tìm thấy",
  required: "Không được trống",
  sku_duplicate: "Bị trùng",
};

type UploadStatus = "error" | "success" | "done" | "uploading" | "removed" | undefined;
enum EnumUploadStatus {
  error = "error",
  success = "success",
  done = "done",
  uploading = "uploading",
  removed = "removed",
}
interface Props {
  form: FormInstance;
  discountMethod: DiscountMethod;
  isAllProduct?: boolean;
}

const FixedPriceSelection = (props: Props) => {
  const token = getToken() || "";
  const { form, discountMethod, isAllProduct: isAllProductProps } = props;
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [allProduct, setAllProduct] = useState<boolean>(false);
  const [entitlementsResponse, setEntitlementsResponse] = useState<
    Array<VariantEntitlementsResponse>
  >([]);
  const [entitlementErrorsResponse, setEntitlementErrorsResponse] = useState<Array<any>>(
    []
  );
  const [uploadError, setUploadError] = useState<any>("");
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);

  // import file
  const handleImportEntitlements = () => {
    const newVariantList = Object.assign(
      [],
      _.uniqBy(entitlementsResponse, "variant_id")
    );
    let formEntitlements: Array<DiscountFormModel> = form.getFieldValue("entitlements");
    // remove init item in  entitlements
    if (
      formEntitlements.length === 1 &&
      (formEntitlements[0].entitled_variant_ids.length === 0 ||
        !formEntitlements[0].entitled_variant_ids)
    ) {
      formEntitlements = [];
    }

    // phân bổ các variant trong file import vào các discount có sẵn hoặc thêm mới discount
    const importedResult = shareDiscount(formEntitlements, newVariantList, form);

    form.setFieldsValue({ entitlements: importedResult });
    setUploadStatus(undefined);
    setShowImportModal(false);
  };

  useLayoutEffect(() => {
    setAllProduct(isAllProductProps || false);
  }, [isAllProductProps])
  
  return (
    <Col span={24}>
      <Form.List name="entitlements">
        {(fields, { add, remove }, { errors }) => {
          return (
            <>
              <Row>
                <Col span={8}>
                  <Checkbox
                    checked={allProduct}
                    onChange={(value) => {
                      setAllProduct(value.target.checked);
                    }}
                  >
                    Tất cả sản phẩm
                  </Checkbox>
                </Col>
                <Col span={16}>
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
                          icon={<PlusOutlined />}
                        >
                          Thêm chiết khấu
                        </Button>
                      </Form.Item>
                    </Space>
                  </Row>
                </Col>
              </Row>

              {fields.reverse().map(({ key, name, fieldKey, ...restField }) => {
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
          setSuccessCount(0);
          setSuccessCount(0);
          setUploadStatus(undefined);
          setShowImportModal(false);
        }}
        width={650}
        visible={showImportModal}
        title="Nhập file khuyến mại"
        footer={[
          <Button
            key="back"
            onClick={() => {
              setSuccessCount(0);
              setSuccessCount(0);
              setUploadStatus(undefined);
              setShowImportModal(false);
            }}
          >
            Huỷ
          </Button>,
          <Button key="link" type="primary" onClick={() => handleImportEntitlements()} disabled={uploadStatus === "error"}>
            Nhập file
          </Button>,
        ]}
      >
        <div
          style={{
            display:
              uploadStatus === undefined || uploadStatus === EnumUploadStatus.removed
                ? ""
                : "none",
          }}
        >
          <Row gutter={12}>
            <Col span={3}>Chú ý:</Col>
            <Col span={19}>
              <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
              <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
              <p>
                - Tải file mẫu <a href={AppConfig.ENTITLEMENTS_TEMPLATE_URL}>tại đây</a>
              </p>
              <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
              <p>
                - Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5
                phút. Trong lúc hệ thống xử lý không F5 hoặc tắt cửa sổ trình duyệt.
              </p>
            </Col>
          </Row>
          <Row gutter={24}>
            <div className="dragger-wrapper">
              <Dragger
                accept=".xlsx"
                beforeUpload={(file) => {
                  if (
                    file.type !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  ) {
                    setUploadStatus("error");
                    setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                    setEntitlementsResponse([]);
                    return false;
                  }
                  setUploadStatus("uploading");
                  setUploadError([]);
                  return true;
                }}
                multiple={false}
                showUploadList={false}
                action={`${AppConfig.baseUrl
                  }promotion-service/price-rules/entitlements/read-file?type=${form.getFieldValue(
                    "entitled_method"
                  )}`}
                headers={{ Authorization: `Bearer ${token}` }}
                onChange={(info) => {
                  const { status } = info.file;
                  if (status === EnumUploadStatus.done) {
                    const response = info.file.response;
                    if (response.code === 20000000) {
                      if (response.data.data.length > 0) {
                        setEntitlementsResponse(response.data.data);
                      }
                      if (response.data.errors.length > 0) {
                        const errors: Array<any> = _.uniqBy(
                          response.data.errors,
                          "index"
                        ).sort((a: any, b: any) => a.index - b.index);
                        setEntitlementErrorsResponse([...errors]);
                      } else {
                        setEntitlementErrorsResponse([]);
                      }
                      setImportTotal(response.data.total);
                      setSuccessCount(response.data.success_count);
                      setUploadStatus(status);
                    } else {
                      setUploadStatus("error");
                      setUploadError(response.errors);
                      setEntitlementsResponse([]);
                    }
                  } else if (status === EnumUploadStatus.error) {
                    message.error(`${info.file.name} file upload failed.`);
                    setUploadStatus(status);
                    setEntitlementsResponse([]);
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
          style={{
            display:
              uploadStatus === EnumUploadStatus.done ||
                uploadStatus === EnumUploadStatus.uploading ||
                uploadStatus === EnumUploadStatus.success ||
                uploadStatus === EnumUploadStatus.error
                ? ""
                : "none",
          }}
        >
          <Row justify={"center"}>
            {uploadStatus === EnumUploadStatus.uploading ? (
              <Col span={24}>
                <Row justify={"center"}>
                  <LoadingOutlined style={{ fontSize: "78px", color: "#E24343" }} />
                </Row>
                <Row justify={"center"}>
                  <h2 style={{ padding: "10px 30px" }}>Đang upload file...</h2>
                </Row>
              </Col>
            ) : (
              ""
            )}
            {uploadStatus === EnumUploadStatus.error ? (
              <Col span={24}>
                <Row justify={"center"}>
                  <VscError style={{ fontSize: "78px", color: "#E24343" }} />
                </Row>
                <Row justify={"center"}>
                  <h2 style={{ padding: "10px 30px" }}>
                    <li>{uploadError || "Máy chủ đang bận"}</li>
                  </h2>
                </Row>
              </Col>
            ) : (
              ""
            )}
            {uploadStatus === EnumUploadStatus.done ||
              uploadStatus === EnumUploadStatus.success ? (
              <Col span={24}>
                <Row justify={"center"}>
                  <CheckCircleOutlined style={{ fontSize: "78px", color: "#27AE60" }} />
                </Row>
                <Row justify={"center"}>
                  <h2 style={{ padding: "10px 30px" }}>
                    Xử lý file nhập toàn tất:{" "}
                    <strong style={{ color: "#2A2A86" }}>
                      {successCount} / {importTotal}
                    </strong>{" "}
                    sản phẩm thành công
                  </h2>
                </Row>
                <Divider />
                {entitlementErrorsResponse.length > 0 ? (
                  <div>
                    <Row justify={"start"}>
                      <h3 style={{ color: "#E24343" }}>Danh sách lỗi: </h3>
                    </Row>
                    <Row justify={"start"}>
                      <li style={{ padding: "10px 30px" }}>
                        {entitlementErrorsResponse?.map((error: any, index) => (
                          <ul key={index}>
                            <span>
                              - Dòng {error.index + 2}: {csvColumnMapping[error.column]}{" "}
                              {csvColumnMapping[error.type.toLowerCase()]}
                            </span>
                          </ul>
                        ))}
                      </li>
                    </Row>
                  </div>
                ) : (
                  ""
                )}
              </Col>
            ) : (
              ""
            )}
          </Row>
        </div>
      </Modal>
    </Col>
  );
};

export default FixedPriceSelection;
