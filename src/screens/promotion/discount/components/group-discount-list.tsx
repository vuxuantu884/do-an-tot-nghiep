import { CheckCircleOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Form, FormInstance, message, Modal, Row, Space } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { FormListFieldData, FormListOperation } from "antd/lib/form/FormList";
import _ from "lodash";
import { PriceRuleMethod, EntilementFormModel, VariantEntitlementsFileImport, ProductEntitlements } from "model/promotion/price-rules.model";
import React, { useContext, useRef, useState } from "react";
import { VscError } from "react-icons/all";
import { RiUpload2Line } from "react-icons/ri";
import { parseSelectVariantToTableData, shareDiscountImportedProduct } from "utils/PromotionUtils";
import importIcon from "../../../../assets/icon/import.svg";
import { AppConfig } from "../../../../config/app.config";
import { getToken } from "../../../../utils/LocalStorageUtils";
import { DiscountUnitType, newEntitlements } from "../../constants";
import { DiscountContext } from "./discount-provider";
import FixedAndQuantityGroup from "./fixed-quantity-group";
import PickManyProductModal from "../../../purchase-order/modal/pick-many-product.modal";
import { VariantResponse } from "model/product/product.model";
import { HttpStatus } from "config/http-status.config";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { ImportFileDiscountStyled} from "../discount-style";

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

}

const GroupDiscountList = (props: Props) => {
  const token = getToken() || "";
  const { form, } = props;
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [entitlementsImported, setEntitlementsImported] = useState<
    Array<VariantEntitlementsFileImport>
  >([]);
  const [entitlementErrorsResponse, setEntitlementErrorsResponse] = useState<Array<any>>(
    []
  );
  const [uploadError, setUploadError] = useState<any>("");
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [isImportingFile, setIsImportingFile] = useState<boolean>(false);
  const [selectedProductList, setSelectedProductList] = useState<Array<ProductEntitlements>>([]);
  const indexOfEntitlement = useRef<number>(0)

  const discountUpdateContext = useContext(DiscountContext);
  const { discountMethod } = discountUpdateContext;

  // import file
  const handleImportEntitlements = () => {
    setIsImportingFile(true)
    let formEntitlements: Array<EntilementFormModel> = form.getFieldValue("entitlements");
    // remove init item in  entitlements
    if (
      formEntitlements.length === 1 &&
      (formEntitlements[0]?.entitled_variant_ids.length === 0 ||
        formEntitlements[0]?.entitled_product_ids.length === 0
      )
    ) {
      formEntitlements = [];
    }

    // phân bổ các variant trong file import vào các discount có sẵn hoặc thêm mới discount
    shareDiscountImportedProduct(formEntitlements, entitlementsImported, form);

    setUploadStatus(undefined);
    setShowImportModal(false);
    setIsImportingFile(false)
  };

  const handleVisibleManyProduct = (name: number) => {
    setVisibleManyProduct((prev) => !prev)
    indexOfEntitlement.current = name;

    /**
     * set selected product list => set default checked product
     */
    const entilementFormValue: Array<EntilementFormModel> = form.getFieldValue("entitlements");
    setSelectedProductList(entilementFormValue[name]?.selectedProducts ?? []);

  }

  /**
   * 
   * @param items 
   * @param name Thứ tự của nhóm chiết khấu trong form
   */
  const onPickManyProduct = (items: Array<VariantResponse>, name: number) => {

    if (items.length) {
      /**
       * numberOfDuplicateProduct : số lượng sản phẩm trùng => thông báo
       */
      let numberOfDuplicateProduct = 0;
      let selectedVariantId: number[] = [];

      const entilementFormValue: Array<EntilementFormModel> = form.getFieldValue("entitlements");

      const currentProduct: ProductEntitlements[] = entilementFormValue[name].selectedProducts || [];

      const newProducts = items.reduce((previousValue: ProductEntitlements[], currentValue: VariantResponse) => {
        // check đã tồn tại sp cha thì bỏ qua => đếm sp bị bỏ qua => thông báo
        if (currentProduct?.some((product: ProductEntitlements) => currentValue.sku?.startsWith(product.sku))) {
          numberOfDuplicateProduct++;
        } else if (currentValue.id && currentValue.sku && currentValue.name) {
          selectedVariantId.push(currentValue.id);
          previousValue.push(parseSelectVariantToTableData(currentValue))
        } else {
          numberOfDuplicateProduct++;
        }
        return previousValue;
      }, [])

      
      if (Array.isArray(currentProduct)) {
        entilementFormValue[name].selectedProducts = [...newProducts, ...currentProduct];
      } else {
        entilementFormValue[name].selectedProducts = newProducts;
      }
      entilementFormValue[name].entitled_variant_ids = _.uniq([...entilementFormValue[name].entitled_variant_ids, ...selectedVariantId]);

      /**
       * Kiểm tra số lượng sp trùng và thông báo
       */
      if (numberOfDuplicateProduct > 0) {
        showWarning(`${numberOfDuplicateProduct} sản phẩm đã tồn tại hoặc đã có sản phẩm cha trong danh sách`);
      } else {
        showSuccess(`Thêm sản phẩm thành công`);
      }


      /**
       * set giá trị cho form và tắt modal
       */
      form.setFieldsValue({ entitlements: _.cloneDeep(entilementFormValue) });
      setVisibleManyProduct(false);
    }

  }

  return (
    <Col span={24}>
      <Form.List name="entitlements">
        {(fields: FormListFieldData[], { add, remove }: FormListOperation, { errors }: {
          errors: React.ReactNode[];
        }) => {
          let initValue = { ...newEntitlements };
          const addBlankEntitlement = () => {
            if (discountMethod === PriceRuleMethod.FIXED_PRICE) {
              initValue.prerequisite_quantity_ranges[0].value_type = DiscountUnitType.FIXED_PRICE.value
            }
            if (discountMethod === PriceRuleMethod.QUANTITY) {
              initValue.prerequisite_quantity_ranges[0].value_type = DiscountUnitType.PERCENTAGE.value
            }
            initValue.selectedProducts = [];
            initValue.entitled_variant_ids = [];
            initValue.entitled_product_ids = [];

            add(initValue, 0);
          };

          const removeEntitlementItem = (index: number) => {
            remove(index);
          };

          return (
            <>
              <Row>
                <Col span={8}>
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
                          onClick={addBlankEntitlement}
                          icon={<PlusOutlined />}
                        >
                          Thêm chiết khấu
                        </Button>
                      </Form.Item>
                    </Space>
                  </Row>
                </Col>
              </Row>

              {fields.map(({ key, name, fieldKey, ...restField }) => {
                return (
                  <FixedAndQuantityGroup
                    key={key}
                    name={name}
                    remove={removeEntitlementItem}
                    fieldKey={fieldKey}
                    form={form}
                    handleVisibleManyProduct={handleVisibleManyProduct}
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
        title="Nhập file khuyến mại chiết khấu/đồng giá"
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
          <Button key="link" type="primary"
            loading={isImportingFile}
            onClick={() => handleImportEntitlements()} disabled={uploadStatus === "error"}
          >
            Nhập file
          </Button>,
        ]}
      >
        <ImportFileDiscountStyled>
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
                - Tải file mẫu <a href={discountMethod === PriceRuleMethod.FIXED_PRICE.toString() ? AppConfig.PROMOTION_FIXED_PRICE_TEMPLATE_URL : AppConfig.PROMOTION_QUANTITY_TEMPLATE_URL}>tại đây</a>
              </p>
              <p>- File nhập có dụng lượng tối đa là 2MB và 1500 bản ghi</p>
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
                    setEntitlementsImported([]);
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
                    if (response.code === HttpStatus.SUCCESS) {
                      if (response.data.data.length > 0) {
                        setEntitlementsImported(response.data.data);
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
                      setEntitlementsImported([]);
                    }
                  } else if (status === EnumUploadStatus.error) {
                    message.error(`${info.file.name} file upload failed.`);
                    setUploadStatus(status);
                    setEntitlementsImported([]);
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
                  <CheckCircleOutlined className="error-import-file__circel-check" />
                </Row>
                <Row justify={"center"}>
                  <h2 className="error-import-file__info" >
                    Xử lý file nhập toàn tất:{" "}
                    <strong className="error-import-file__number-success" >
                      {successCount} / {importTotal}
                    </strong>{" "}
                    sản phẩm thành công
                  </h2>
                </Row>
                <Divider />
                {entitlementErrorsResponse.length > 0 ? (
                  <div>
                    <Row justify={"start"}>
                      <h3 className="error-import-file__title">Danh sách lỗi: </h3>
                    </Row>
                    <Row justify={"start"}>
                      <div className="error-import-file__list">
                        {entitlementErrorsResponse?.map((error: any, index) => (
                          <div key={index} className="error-import-file__item">
                            <span>
                              - Dòng {error?.index + 2}: {error?.message} 
                            </span>
                          </div>
                        ))}
                      </div>
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
        </ImportFileDiscountStyled>
      </Modal>

      <PickManyProductModal
        onSave={(result: Array<VariantResponse>) => onPickManyProduct(result, indexOfEntitlement.current)}
        selected={getSelectedProductList(selectedProductList)}
        onCancel={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
        emptyText={"Không tìm thấy sản phẩm"}
      />
    </Col>
  );
};

function getSelectedProductList(selectedProductList: ProductEntitlements[]) {
  return selectedProductList.reduce((previousValue: { id: number }[], currentValue: ProductEntitlements) => {
    if (currentValue.variant_id) {
      previousValue.push({ id: currentValue.variant_id });
    }
    return previousValue;
  }, [])
}
export default GroupDiscountList;
