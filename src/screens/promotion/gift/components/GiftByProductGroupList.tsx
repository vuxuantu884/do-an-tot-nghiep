import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircleOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import { FormListFieldData, FormListOperation } from "antd/lib/form/FormList";
import { PROMOTION_CDN } from "config/cdn/promotion.cdn";
import { HttpStatus } from "config/http-status.config";
import _ from "lodash";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { GiftEntitlementForm, GiftProductEntitlements } from "model/promotion/gift.model";
import { useDispatch } from "react-redux";
import { RiUpload2Line } from "react-icons/ri";
import { VscError } from "react-icons/vsc";
import {
  parseSelectVariantToTableData,
} from "utils/PromotionUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { AppConfig } from "config/app.config";
import { getToken } from "utils/LocalStorageUtils";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import { newGiftEntitlements } from "screens/promotion/constants";
import { GiftProductGroupListStyled, ImportFileDiscountStyled } from "screens/promotion/gift/gift.style";
import GiftByProductGroup from "screens/promotion/gift/components/GiftByProductGroup";
import { getPromotionGiftProductApplyAction } from "domain/actions/promotion/gift/gift.action";
import { PageResponse } from "model/base/base-metadata.response";
import { RefSelectProps } from "antd/lib/select";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import search from "assets/img/search.svg";
import importIcon from "assets/icon/import.svg";
import { VariantEntitlementsFileImport } from "model/promotion/price-rules.model";
import { handleImportProductApplyGift } from "screens/promotion/gift/gift.helper";

type UploadStatus = "error" | "success" | "done" | "uploading" | "removed" | undefined;
enum EnumUploadStatus {
  error = "error",
  done = "done",
  uploading = "uploading",
}
const initQueryVariant: VariantSearchQuery = {
  // limit: 10,
  page: 1,
  saleable: true,
};

interface Props {
  form: FormInstance;
  idNumber?: number;
  originalEntitlements?: any;
  setGetIndexRemoveDiscount?: (item: any) => void;
}

const GiftByProductGroupList = (props: Props) => {
  const { form, idNumber, originalEntitlements, setGetIndexRemoveDiscount } = props;

  const token = getToken() || "";
  const dispatch = useDispatch();
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [productImportedList, setProductImportedList] = useState<
    Array<VariantEntitlementsFileImport>
  >([]);
  const [entitlementErrorsResponse, setEntitlementErrorsResponse] = useState<Array<any>>([]);
  const [uploadError, setUploadError] = useState<any>("");
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [isImportingFile, setIsImportingFile] = useState<boolean>(false);
  const [selectedProductList, setSelectedProductList] = useState<Array<GiftProductEntitlements>>([]);
  const indexOfEntitlement = useRef<number>(0);

  // import file
  const handleImportEntitlements = () => {
    setIsImportingFile(true);
    let formEntitlements: Array<GiftEntitlementForm> = form.getFieldValue("entitlements");
    // remove init item in  entitlements
    if (formEntitlements.length === 1 &&
      formEntitlements[0]?.entitled_variant_ids.length === 0 &&
      formEntitlements[0]?.entitled_product_ids.length === 0
    ) {
      formEntitlements = [];
    }

    // phân bổ các variant trong file import vào chương trình quà tặng
    handleImportProductApplyGift(formEntitlements, productImportedList, form);

    setUploadStatus(undefined);
    setShowImportModal(false);
    setIsImportingFile(false);
  };

  const handleVisibleManyProduct = (name: number) => {
    setVisibleManyProduct((prev) => !prev);
    indexOfEntitlement.current = name;

    /**
     * set selected product list => set default checked product
     */
    const entilementFormValue: Array<GiftEntitlementForm> = form.getFieldValue("entitlements");
    setSelectedProductList(entilementFormValue[name]?.selectedProducts ?? []);
  };

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

      const entilementFormValue: Array<GiftEntitlementForm> = form.getFieldValue("entitlements");

      const currentProduct: GiftProductEntitlements[] =
        entilementFormValue[name].selectedProducts || [];

      const newProducts = items.reduce(
        (previousValue: GiftProductEntitlements[], currentValue: VariantResponse) => {
          // check đã tồn tại sp cha thì bỏ qua => đếm sp bị bỏ qua => thông báo
          if (
            currentProduct?.some((product: GiftProductEntitlements) =>
              currentValue.sku?.startsWith(product.sku),
            )
          ) {
            numberOfDuplicateProduct++;
          } else if (currentValue.id && currentValue.sku && currentValue.name) {
            selectedVariantId.push(currentValue.id);
            previousValue.push(parseSelectVariantToTableData(currentValue));
          } else {
            numberOfDuplicateProduct++;
          }
          return previousValue;
        },
        [],
      );

      if (Array.isArray(currentProduct)) {
        entilementFormValue[name].selectedProducts = [...newProducts, ...currentProduct];
      } else {
        entilementFormValue[name].selectedProducts = newProducts;
      }
      entilementFormValue[name].entitled_variant_ids = _.uniq([
        ...entilementFormValue[name].entitled_variant_ids,
        ...selectedVariantId,
      ]);

      /**
       * Kiểm tra số lượng sp trùng và thông báo
       */
      if (numberOfDuplicateProduct > 0) {
        showWarning(
          `${numberOfDuplicateProduct} sản phẩm đã tồn tại hoặc đã có sản phẩm cha trong danh sách`,
        );
      } else {
        showSuccess(`Thêm sản phẩm thành công`);
      }

      /**
       * set giá trị cho form và tắt modal
       */
      form.setFieldsValue({ entitlements: _.cloneDeep(entilementFormValue) });
      setVisibleManyProduct(false);
    }
  };

  const getPromotionGiftProductApplyCallback = useCallback(
    (response) => {
      if (response) {
        const _entitlementList = response.items?.map((item: any) => {
          return {
            ...item.entitlement,
            selectedProducts: [item],
          };
        });
        form.setFieldsValue({ entitlements: _entitlementList });
      }
    },
    [form],
  );

  const getPromotionGiftProductApply = useCallback(
    (value) => {
      if (value) {
        const params = {
          variant_sku: value,
          page: 1,
          limit: 30,
        };
        if (idNumber) {
          dispatch(
            getPromotionGiftProductApplyAction(idNumber, params, getPromotionGiftProductApplyCallback),
          );
        }
      } else {
        form.setFieldsValue({ entitlements: originalEntitlements });
      }
    },
    [form, dispatch, idNumber, getPromotionGiftProductApplyCallback, originalEntitlements],
  );

  /** handle search product */
  const [keySearchVariant, setKeySearchVariant] = useState("");
  const [resultSearchVariant, setResultSearchVariant] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const autoCompleteRef = createRef<RefSelectProps>();

  const handleSearchProduct = useCallback(
    (value: string) => {
      if (value.trim()) {
        (async () => {
          try {
            await dispatch(
              searchVariantsOrderRequestAction(
                initQueryVariant,
                (data) => {
                  setResultSearchVariant(data);
                  setIsSearchingProducts(false);
                  if (data.items.length === 0) {
                    showError("Không tìm thấy sản phẩm!");
                  }
                },
                () => {
                  setIsSearchingProducts(false);
                },
              ),
            );
          } catch {
            setIsSearchingProducts(false);
          }
        })();
      } else {
        setIsSearchingProducts(false);
      }
    },
    [dispatch],
  );

  const onChangeProductSearch = useCallback(
    async (value: string) => {
      initQueryVariant.info = value;
      if (value.length >= 3) {
        setIsSearchingProducts(true);
        setResultSearchVariant({
          ...resultSearchVariant,
          items: [],
        });
        handleSearchProduct(value);
      } else {
        setIsSearchingProducts(false);
      }
    },
    [handleSearchProduct, resultSearchVariant],
  );

  const handleOnSearchProduct = useCallback(
    (value: string) => {
      setKeySearchVariant(value);
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () =>
        onChangeProductSearch(value),
      );
    },
    [autoCompleteRef, onChangeProductSearch],
  );

  const renderVariantLabelOption = (item: any) => {
    return (
      <div style={{ padding: "5px 10px" }}>
        <div style={{ whiteSpace: "normal", lineHeight: "18px" }}>{item.name}</div>
        <div style={{ color: "#95a1ac" }}>{item.sku}</div>
      </div>
    );
  };

  const renderVariantOptions = useMemo(() => {
    let variantOptions: any[] = [];
    let productOptions: any[] = [];
    let productDataSearch: any[] = [];

    resultSearchVariant.items.forEach((item: VariantResponse) => {
      if (item.product) {
        productDataSearch.push(item.product);
      }
      variantOptions.push({
        label: renderVariantLabelOption(item),
        value: item.name ? item.name.toString() : "",
        sku: item.sku,
      });
    });

    _.unionBy(productDataSearch, "id").forEach((item: any) => {
      item.sku = item.code;
      item.name = item.name + " (Sản phẩm cha)";
      productOptions.push({
        label: renderVariantLabelOption(item),
        value: item.name ? item.name.toString() : "",
        sku: item.sku,
      });
    });

    return [...productOptions, ...variantOptions];
  }, [resultSearchVariant]);

  const onSearchVariantSelect = useCallback(
    (v, variant) => {
      setKeySearchVariant(variant.value);
      autoCompleteRef.current?.blur();
      getPromotionGiftProductApply(variant.sku);
    },
    [autoCompleteRef, getPromotionGiftProductApply],
  );

  const onClearVariantSelect = useCallback(() => {
    getPromotionGiftProductApply("");
  }, [getPromotionGiftProductApply]);
  /** end handle search product */

  /** handle scroll page */
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const setPageScroll = (overflowType: string) => {
    let rootSelector: any = document.getElementById("root");
    if (rootSelector) {
      rootSelector.style.overflow = overflowType;
    }
  };

  // nếu scroll trong dropdown thì ẩn scroll bên ngoài trang
  const handleOnSelectPopupScroll = () => {
    if (isDropdownVisible) {
      setPageScroll("hidden");
    }
  };

  const handleOnMouseLeaveSelect = () => {
    setPageScroll("scroll");
  };

  const handleOnDropdownVisibleChange = (open: boolean) => {
    setIsDropdownVisible(open);
  };

  const onInputSelectFocus = () => {
    setIsDropdownVisible(true);
  };

  const onInputSelectBlur = () => {
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    if (!isDropdownVisible) {
      setPageScroll("scroll");
    }
  }, [isDropdownVisible]);
  /** end handle scroll page */

  return (
    <>
      <Col span={12}  style={{ margin: "auto" }}>
        <Button
          icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
          onClick={() => setShowImportModal(true)}
          style={{ float: "right" }}
        >
          Nhập file
        </Button>
      </Col>

      <Col span={24}>
        <Form.List name="entitlements">
          {(
            fields: FormListFieldData[],
            { add, remove }: FormListOperation,
            {
              errors,
            }: {
              errors: React.ReactNode[];
            },
          ) => {
            let initValue = { ...newGiftEntitlements };
            const addBlankEntitlement = () => {
              initValue.prerequisite_quantity_ranges[0].greater_than_or_equal_to = 1;
              initValue.selectedProducts = [];
              initValue.entitled_variant_ids = [];
              initValue.entitled_product_ids = [];

              add(initValue, 0);
            };

            const removeEntitlementItem = (index: number) => {
              remove(index);
              setGetIndexRemoveDiscount?.(index);
            };

            return (
              <GiftProductGroupListStyled>
                {/*Tạm thời chưa dùng*/}
                <Row style={{ display: "none" }}>
                  <Col span={16}>
                    {idNumber && (
                      <div className={"input-search-product"}>
                      <span className={"label-search-product"}>
                        Tìm kiếm sản phẩm trong chương trình chiết khấu
                      </span>
                        <AutoComplete
                          notFoundContent={
                            isSearchingProducts ? <Spin size="small" /> : "Không tìm thấy sản phẩm"
                          }
                          id="search_variant"
                          ref={autoCompleteRef}
                          value={keySearchVariant}
                          onSelect={onSearchVariantSelect}
                          allowClear
                          onClear={onClearVariantSelect}
                          dropdownClassName="search-layout dropdown-search-header"
                          dropdownMatchSelectWidth={360}
                          style={{ width: "100%" }}
                          onSearch={handleOnSearchProduct}
                          options={renderVariantOptions}
                          maxLength={255}
                          getPopupContainer={(trigger: any) => trigger.parentElement}
                          onFocus={onInputSelectFocus}
                          onBlur={onInputSelectBlur}
                          onPopupScroll={handleOnSelectPopupScroll}
                          onMouseLeave={handleOnMouseLeaveSelect}
                          onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        >
                          <Input
                            placeholder="Tìm kiếm sản phẩm"
                            prefix={
                              isSearchingProducts ? (
                                <LoadingOutlined style={{ color: "#2a2a86" }} />
                              ) : (
                                <img alt="" src={search} style={{ cursor: "default" }} />
                              )
                            }
                          />
                        </AutoComplete>
                      </div>
                    )}
                  </Col>

                  <Col span={8}>
                    <Row justify="end">
                      <Space size={16}>
                        <Form.Item>
                          <Button onClick={addBlankEntitlement} icon={<PlusOutlined />}>
                            Thêm chiết khấu
                          </Button>
                        </Form.Item>
                      </Space>
                    </Row>
                  </Col>
                </Row>

                {fields.map(({ key, name, fieldKey, ...restField }) => {
                  return (
                    <>
                      <GiftByProductGroup
                        key={key}
                        name={name}
                        remove={removeEntitlementItem}
                        fieldKey={fieldKey}
                        form={form}
                        handleVisibleManyProduct={handleVisibleManyProduct}
                      />
                    </>
                  );
                })}
              </GiftProductGroupListStyled>
            );
          }}
        </Form.List>
      </Col>

      <Modal
        onCancel={() => {
          setSuccessCount(0);
          setUploadStatus(undefined);
          setShowImportModal(false);
        }}
        width={650}
        visible={showImportModal}
        title={"Nhập file quà tặng theo sản phẩm"}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setSuccessCount(0);
              setUploadStatus(undefined);
              setShowImportModal(false);
            }}
          >
            Huỷ
          </Button>,
          <Button
            key="link"
            type="primary"
            loading={isImportingFile}
            onClick={() => handleImportEntitlements()}
            disabled={uploadStatus !== EnumUploadStatus.done}
          >
            Nhập file
          </Button>,
        ]}
      >
        <ImportFileDiscountStyled>
          <div style={{ display: uploadStatus === undefined ? "" : "none" }}>
            <Row gutter={12}>
              <Col span={3}>Chú ý:</Col>
              <Col span={19}>
                <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
                <p>- Chuyển đổi file dưới dạng <b>.xlsx</b> trước khi tải dữ liệu</p>
                <p>
                  - Tải file mẫu{" "}
                  <a href={PROMOTION_CDN.GIFT_IMPORT_FILE_TEMPLATE_URL}>
                    tại đây
                  </a>
                </p>
                <p>- File nhập có dụng lượng tối đa là 2MB và 1500 bản ghi</p>
                <p>
                  - Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5 phút.
                  Trong lúc hệ thống xử lý không F5 hoặc tắt cửa sổ trình duyệt.
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
                      setUploadStatus(EnumUploadStatus.error);
                      setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                      setProductImportedList([]);
                      return false;
                    }
                    setUploadStatus(EnumUploadStatus.uploading);
                    setUploadError([]);
                    return true;
                  }}
                  multiple={false}
                  showUploadList={false}
                  action={`${AppConfig.baseUrl}promotion-service/price-rule-gifts/read-file`}
                  headers={{ Authorization: `Bearer ${token}` }}
                  onChange={(info) => {
                    const { status } = info.file;
                    if (status === EnumUploadStatus.done) {
                      const response = info.file.response;
                      if (response.code === HttpStatus.SUCCESS) {
                        if (response.data.data.length > 0) {
                          setProductImportedList(response.data.data);
                        }
                        if (response.data.errors.length > 0) {
                          const errors: Array<any> = _.uniqBy(response.data.errors, "index").sort(
                            (a: any, b: any) => a.index - b.index,
                          );
                          setEntitlementErrorsResponse([...errors]);
                        } else {
                          setEntitlementErrorsResponse([]);
                        }
                        setImportTotal(response.data.total);
                        setSuccessCount(response.data.success_count);
                        setUploadStatus(EnumUploadStatus.done);
                      } else {
                        setUploadStatus(EnumUploadStatus.error);
                        setUploadError(response.errors);
                        setProductImportedList([]);
                      }
                    } else if (status === EnumUploadStatus.error) {
                      message.error(`${info.file.name} file upload failed.`);
                      setUploadStatus(EnumUploadStatus.error);
                      setProductImportedList([]);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <RiUpload2Line size={48} />
                  </p>
                  <p className="ant-upload-hint">Kéo file vào đây hoặc tải lên từ thiết bị</p>
                </Dragger>
              </div>
            </Row>
          </div>

          <div
            style={{
              display:
                uploadStatus === EnumUploadStatus.done ||
                uploadStatus === EnumUploadStatus.uploading ||
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
              {uploadStatus === EnumUploadStatus.done ? (
                <Col span={24}>
                  <Row justify={"center"}>
                    <CheckCircleOutlined className="error-import-file__circel-check" />
                  </Row>
                  <Row justify={"center"}>
                    <h2 className="error-import-file__info">
                      Xử lý file nhập toàn tất:{" "}
                      <strong className="error-import-file__number-success">
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
                                - Dòng {error?.index}: {error?.message}
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
        onSave={(result: Array<VariantResponse>) =>
          onPickManyProduct(result, indexOfEntitlement.current)
        }
        selected={getSelectedProductList(selectedProductList)}
        onCancel={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
        emptyText={"Không tìm thấy sản phẩm"}
      />
    </>

  );
};

function getSelectedProductList(selectedProductList: GiftProductEntitlements[]) {
  return selectedProductList.reduce(
    (previousValue: { id: number }[], currentValue: GiftProductEntitlements) => {
      if (currentValue.variant_id) {
        previousValue.push({ id: currentValue.variant_id });
      }
      return previousValue;
    },
    [],
  );
}
export default GiftByProductGroupList;
