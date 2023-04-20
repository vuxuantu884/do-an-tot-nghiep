import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Form, FormInstance, InputNumber, message, Modal, Row } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { Rule } from "antd/lib/form";
import { SelectValue } from "antd/lib/select";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import ProductItem from "screens/purchase-order/component/product-item";
import ParentProductItem from "component/item-select/parent-product-item";
import { AppConfig } from "config/app.config";
import { PROMOTION_CDN } from "config/cdn/promotion.cdn";
import { HttpStatus } from "config/http-status.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import _ from "lodash";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { DiscountConditionRule, ReleasePromotionListType } from "model/promotion/price-rules.model";
import { createRef, ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { RiUpload2Line } from "react-icons/ri";
import { VscError } from "react-icons/vsc";
import { useDispatch } from "react-redux";
import {
  DiscountUnitType,
  FIELD_SELECT_OPTIONS_PRODUCT_QUANTITY,
  PRICE_RULE_FIELDS,
} from "screens/promotion/constants";
import { ProductQuantityStyle } from "screens/promotion/discount/components/product-quantity.style";
import { ImportFileDiscountStyled } from "screens/promotion/discount/discount-style";
import { CreateReleasePromotionRuleType } from "screens/promotion/constants";
import { getToken } from "utils/LocalStorageUtils";
import { showError } from "utils/ToastUtils";
import GeneralProductQuantityConditions from "./general-product-quantity-conditions";
import GeneralProductQuantityHaveExclude from "./general-product-quantity-have-exclude";
import GeneralProductQuantitySearchImport from "./general-product-quantity-search-import";
import ModalConfirm from "component/modal/ModalConfirm";
import { formatCurrency, replaceFormat } from "utils/AppUtils";
import { IssueContext } from "screens/promotion/issue/components/issue-provider";

enum ColumnIndex {
  field = "field",
  operator = "operator",
  value = "value",
}

const blankRow = {
  [ColumnIndex.field]: "subtotal",
  [ColumnIndex.operator]: "GREATER_THAN",
  [ColumnIndex.value]: 0,
};

type UploadStatus = "error" | "success" | "done" | "uploading" | "removed" | undefined;
enum EnumUploadStatus {
  error = "error",
  success = "success",
  done = "done",
  uploading = "uploading",
  removed = "removed",
}

const rule = PRICE_RULE_FIELDS.rule;
const conditions = PRICE_RULE_FIELDS.conditions;

interface Props {
  form: FormInstance;
}

const defaultValueComponent = (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
  <Form.Item name={name} rules={rules}>
    <InputNumber
      className="price_min"
      formatter={(value) => {
        return formatCurrency(value || 0);
      }}
      parser={(value: string | undefined) => replaceFormat(value || "")}
      min={0}
      max={1000000000}
      placeholder="Nhập giá trị thuộc tính"
      style={{ width: "100%" }}
    />
  </Form.Item>
);

export default function GeneralProductQuantity(props: Props): ReactElement {
  const token = getToken() || "";
  const { form } = props;
  const {
    priceRuleData,
    typeSelectPromotion,
    releasePromotionListType,
    listProductSelectImportNotExclude,
    setListProductSelectImportNotExclude,
    listProductSelectImportHaveExclude,
    setListProductSelectImportHaveExclude,
  } = useContext(IssueContext);

  const dispatch = useDispatch();

  const [ValueComponentList, setValueComponentList] = useState<Array<any>>([defaultValueComponent]);

  const productSearchRef = createRef<CustomAutoComplete>();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importProductButton, setImportProductButton] = useState(true);
  const [successCount, setSuccessCount] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [productsImported, setProductsImported] = useState<any[]>([]);
  const [listProductErrorsResponse, setListProductErrorsResponse] = useState<Array<any>>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [uploadError, setUploadError] = useState<any>("");
  const [dataSearchVariant, setDataSearchVariant] = useState<VariantResponse[]>([]);

  const [loadingDiscountVariant, setLoadingDiscountVariant] = useState(false);

  const [listSearchVariant, setListSearchVariant] = useState<Array<any>>([]);
  const [productParentWithoutChildrenNotExclude, setProductParentWithoutChildrenNotExclude] =
    useState<any>();
  const [productParentWithoutChildrenHaveExclude, setProductParentWithoutChildrenHaveExclude] =
    useState<any>();
  const [isVisibleConfirmReplaceProductModal, setIsVisibleConfirmReplaceProductModal] =
    useState<boolean>(false);

  const [listProductNotExcludeForPagging, setListProductNotExcludeForpagging] = useState<any>({
    items: [],
    metadata: {
      total: 0,
      limit: 10,
      page: 1,
    },
  });

  const [listProductHaveExcludeForPagging, setListProductHaveExcludeForpagging] = useState<any>({
    items: [],
    metadata: {
      total: 0,
      limit: 10,
      page: 1,
    },
  });

  const onResultSearchVariant = useCallback((result: any) => {
    if (result.items.length <= 0) {
      showError("Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng bán");
    }

    if (!result) {
      setDataSearchVariant([]);
    } else {
      setLoadingDiscountVariant(false);
      setDataSearchVariant(result.items);
    }
  }, []);

  const onSearchVariant = useCallback(
    (value: string) => {
      setLoadingDiscountVariant(true);
      dispatch(
        searchVariantsRequestAction(
          {
            status: "active",
            info: value.trim(),
            saleable: true,
          },
          onResultSearchVariant,
        ),
      );
    },
    [dispatch, onResultSearchVariant],
  );

  useEffect(() => {
    let variantOptions: any[] = [];
    let productOptions: any[] = [];
    let productDataSearch: any[] = [];

    dataSearchVariant.forEach((item: VariantResponse) => {
      if (item.product) {
        productDataSearch.push(item.product);
      }
      variantOptions.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: JSON.stringify(item),
      });
    });

    _.unionBy(productDataSearch, "id").forEach((item: ProductResponse) => {
      productOptions.push({
        value: JSON.stringify(item),
        label: <ParentProductItem data={item} key={item.code} />,
      });
    });

    setListSearchVariant([...productOptions, ...variantOptions]);
  }, [dataSearchVariant]);

  const handleCheckAcceptParentProduct = useCallback(
    (productParent: any, listProduct: any[], setListProduct: (item: any) => void) => {
      const listChildrentOfParentSelect = listProduct.filter(
        (item: any) => item.product_id !== productParent.id,
      );

      setListProduct([productParent, ...listChildrentOfParentSelect]);
    },
    [],
  );

  const handleAcceptParentProduct = useCallback(() => {
    switch (releasePromotionListType) {
      case ReleasePromotionListType.EQUALS:
        handleCheckAcceptParentProduct(
          productParentWithoutChildrenNotExclude,
          listProductSelectImportNotExclude,
          setListProductSelectImportNotExclude,
        );
        break;
      case ReleasePromotionListType.NOT_EQUAL_TO:
        handleCheckAcceptParentProduct(
          productParentWithoutChildrenHaveExclude,
          listProductSelectImportHaveExclude,
          setListProductSelectImportHaveExclude,
        );
        break;
      default:
        break;
    }

    setIsVisibleConfirmReplaceProductModal(false);
  }, [
    handleCheckAcceptParentProduct,
    listProductSelectImportHaveExclude,
    listProductSelectImportNotExclude,
    productParentWithoutChildrenHaveExclude,
    productParentWithoutChildrenNotExclude,
    releasePromotionListType,
    setListProductSelectImportHaveExclude,
    setListProductSelectImportNotExclude,
  ]);

  const handleDenyParentProduct = useCallback(() => {
    setIsVisibleConfirmReplaceProductModal(false);
  }, []);

  const checkSelectVariant = (
    selectedProduct: any,
    setProductParentWithoutChildren: (item: any) => void,
    listProduct: any[],
    setListProduct: (item: any) => void,
  ) => {
    const isVariant = !!selectedProduct?.sku;

    if (!isVariant) {
      // sp cha không có sku => set sku = code
      selectedProduct.sku = selectedProduct.code;
    }

    /**
     *  Check sản phẩm đã tồn tại trong danh sách hay chưa
     */
    const checkExist = listProduct.some(
      (e) => e.sku === (selectedProduct.sku ?? selectedProduct.code),
    );
    if (checkExist) {
      showError("Sản phẩm đã được chọn!");
      return;
    }

    /**
     * Trường hợp trên ds đã có mã cha
     * → tìm kiếm sp variant thì thông báo lỗi đã đưa mã cha vào ds
     * → Nếu muốn thay đổi thì xóa mã cha
     */

    if (isVariant && listProduct.some((e) => selectedProduct?.sku?.includes(e?.sku))) {
      showError("Sản phẩm đã được chọn mã cha");
      return;
    }

    /**
     * Trường hợp trên ds đã có mã variant
     * → tìm kiếm sp  cha thì thông báo đã có mã variant vào ds
     * → popup thông báo sẽ áp dụng các variant còn lại của mã này
     */
    if (!isVariant && listProduct.some((e) => e?.sku?.startsWith(selectedProduct?.sku))) {
      setIsVisibleConfirmReplaceProductModal(true);
      setProductParentWithoutChildren(selectedProduct);
      return;
    }

    if (selectedProduct.product) {
      selectedProduct.retail_price = selectedProduct?.variant_prices[0]?.retail_price;
      selectedProduct.variant_id = selectedProduct.id;
    } else {
      selectedProduct.product_id = selectedProduct.id;
      selectedProduct.variant_id = null;
    }

    setListProduct((prev: any) => [...prev, selectedProduct]);
  };

  const onSelectVariant = (value: string) => {
    const selectedProduct = JSON.parse(value);

    switch (releasePromotionListType) {
      case ReleasePromotionListType.EQUALS:
        checkSelectVariant(
          selectedProduct,
          setProductParentWithoutChildrenNotExclude,
          listProductSelectImportNotExclude,
          setListProductSelectImportNotExclude,
        );

        break;
      case ReleasePromotionListType.NOT_EQUAL_TO:
        checkSelectVariant(
          selectedProduct,
          setProductParentWithoutChildrenHaveExclude,
          listProductSelectImportHaveExclude,
          setListProductSelectImportHaveExclude,
        );
        break;
      default:
        break;
    }
  };
  const handleImportListProduct = useCallback(() => {
    const mapListProductImport: any[] = [];

    if (productsImported.length) {
      setImportProductButton(true);
      productsImported.map((product: any) =>
        mapListProductImport.push({
          variant_id: product?.variant_id,
          product_id: product?.product_id,
          name: product?.title,
          sku: product?.sku ? product?.sku : product?.product_code,
          retail_price: product?.price ? product?.price : 0,
        }),
      );
    }

    switch (releasePromotionListType) {
      case ReleasePromotionListType.EQUALS:
        setListProductSelectImportNotExclude((prev: any) => [...prev, ...mapListProductImport]);
        break;
      case ReleasePromotionListType.NOT_EQUAL_TO:
        setListProductSelectImportHaveExclude((prev: any) => [...prev, ...mapListProductImport]);

        break;
      default:
        break;
    }

    setUploadStatus(undefined);
    setShowImportModal(false);
  }, [
    productsImported,
    releasePromotionListType,
    setListProductSelectImportHaveExclude,
    setListProductSelectImportNotExclude,
  ]);

  useEffect(() => {
    if (releasePromotionListType === ReleasePromotionListType.OTHER_CONDITION) {
      const ruleFormValue = form.getFieldValue(rule);
      if (
        ruleFormValue.conditions[0].field === CreateReleasePromotionRuleType.product_id ||
        ruleFormValue.conditions[0].field === CreateReleasePromotionRuleType.variant_id
      ) {
        form.setFieldsValue({
          [rule]: {
            [conditions]: [blankRow],
            group_operator: CreateReleasePromotionRuleType.AND,
            value_type: typeSelectPromotion,
          },
        });
      } else {
        form.setFieldsValue({
          [rule]: ruleFormValue,
        });
      }
    }
  }, [form, releasePromotionListType, typeSelectPromotion]);

  const handleRenderProductForPagging = useCallback(
    (listProduct: any[], setListProductForTable: (item: any) => void) => {
      setListProductForTable((prev: any) => {
        const { limit, page } = prev.metadata;

        return {
          items: listProduct.slice((page - 1) * limit, page * limit),
          metadata: {
            ...prev.metadata,
            total: listProduct.length,
          },
        };
      });
    },
    [],
  );

  useEffect(() => {
    switch (releasePromotionListType) {
      case ReleasePromotionListType.EQUALS:
        handleRenderProductForPagging(
          listProductSelectImportNotExclude,
          setListProductNotExcludeForpagging,
        );

        break;
      case ReleasePromotionListType.NOT_EQUAL_TO:
        handleRenderProductForPagging(
          listProductSelectImportHaveExclude,
          setListProductHaveExcludeForpagging,
        );

        break;
      default:
        break;
    }
  }, [
    listProductSelectImportHaveExclude,
    releasePromotionListType,
    listProductSelectImportNotExclude,
    handleRenderProductForPagging,
  ]);

  const checkDeleteItem = useCallback(
    (
      item: any,
      listProductSelectImport: any[],
      setListProductSelectImport: (item: any) => void,
    ) => {
      let indexProductSelect = listProductSelectImport.findIndex(
        (product: any) => product.sku === item.sku,
      );
      const newListProductSelect = _.cloneDeep(listProductSelectImport);
      newListProductSelect.splice(indexProductSelect, 1);
      setListProductSelectImport(newListProductSelect);
    },
    [],
  );

  const onDeleteItem = useCallback(
    (item: any) => {
      switch (releasePromotionListType) {
        case ReleasePromotionListType.EQUALS:
          checkDeleteItem(
            item,
            listProductSelectImportNotExclude,
            setListProductSelectImportNotExclude,
          );
          break;
        case ReleasePromotionListType.NOT_EQUAL_TO:
          checkDeleteItem(
            item,
            listProductSelectImportHaveExclude,
            setListProductSelectImportHaveExclude,
          );

          break;
        default:
          break;
      }
    },
    [
      checkDeleteItem,
      listProductSelectImportHaveExclude,
      listProductSelectImportNotExclude,
      releasePromotionListType,
      setListProductSelectImportHaveExclude,
      setListProductSelectImportNotExclude,
    ],
  );

  const hanldeCheckPageChange = useCallback(
    (
      listProduct: any[],
      setListProductForPagging: (item: any) => void,
      page: number,
      pageSize?: number,
    ) => {
      if (!pageSize) return;

      const listProductPageChange = listProduct.slice((page - 1) * pageSize, page * pageSize);
      setListProductForPagging({
        items: listProductPageChange,
        metadata: {
          total: listProduct.length,
          limit: pageSize,
          page: page,
        },
      });
    },
    [],
  );

  const handlePageChange = useCallback(
    (page: number, pageSize?: number) => {
      switch (releasePromotionListType) {
        case ReleasePromotionListType.EQUALS:
          hanldeCheckPageChange(
            listProductSelectImportNotExclude,
            setListProductNotExcludeForpagging,
            page,
            pageSize,
          );
          break;
        case ReleasePromotionListType.NOT_EQUAL_TO:
          hanldeCheckPageChange(
            listProductSelectImportHaveExclude,
            setListProductHaveExcludeForpagging,
            page,
            pageSize,
          );
          break;
        default:
          break;
      }
    },
    [
      hanldeCheckPageChange,
      listProductSelectImportHaveExclude,
      listProductSelectImportNotExclude,
      releasePromotionListType,
    ],
  );

  const handleCheckSizeChange = useCallback(
    (
      listProduct: any[],
      setListProductForPagging: (item: any) => void,
      current: number,
      size: number,
    ) => {
      setListProductForPagging({
        items: listProduct.slice((current - 1) * size, current * size),
        metadata: {
          total: listProduct.length,
          limit: size,
          page: current,
        },
      });
    },
    [],
  );

  const handleSizeChange = useCallback(
    (current: number, size: number) => {
      switch (releasePromotionListType) {
        case ReleasePromotionListType.EQUALS:
          handleCheckSizeChange(
            listProductSelectImportNotExclude,
            setListProductNotExcludeForpagging,
            current,
            size,
          );
          break;
        case ReleasePromotionListType.NOT_EQUAL_TO:
          handleCheckSizeChange(
            listProductSelectImportHaveExclude,
            setListProductHaveExcludeForpagging,
            current,
            size,
          );
          break;
        default:
          break;
      }
    },
    [
      handleCheckSizeChange,
      listProductSelectImportHaveExclude,
      listProductSelectImportNotExclude,
      releasePromotionListType,
    ],
  );

  const handleDelete = (index: number) => {
    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    const temps = _.cloneDeep(discountList);
    if (Array.isArray(temps)) {
      temps.splice(index, 1);
      //set form value
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps,
        },
      });

      const tempValueComponentList = _.cloneDeep(ValueComponentList);
      tempValueComponentList.splice(index, 1);
      setValueComponentList(tempValueComponentList);
    }
  };

  const handleAdd = () => {
    setValueComponentList([...ValueComponentList, defaultValueComponent]);

    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    let temps: any = _.cloneDeep(discountList);
    if (Array.isArray(temps)) {
      temps.push(blankRow);
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps,
        },
      });
    } else {
      temps = [blankRow];
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps,
        },
      });
    }
  };

  function handleChangeFieldSelect(value: SelectValue, index: number): void {
    // Change input value component
    const currentValueComponent = _.find(FIELD_SELECT_OPTIONS_PRODUCT_QUANTITY, [
      "value",
      value,
    ])?.valueComponent;

    setValueComponentList((prev) => {
      const temps = _.cloneDeep(prev);
      temps[index] = currentValueComponent;
      return temps;
    });

    //reset value at index
    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    discountList[index].value = null;
    discountList[index].operator = "EQUALS";
  }

  const discountList: Array<any> = form.getFieldValue(rule)?.conditions;

  const getIsDisableOptions = useCallback(
    (operatorOptions: string[], index: number) => {
      const currentField = discountList[index]?.field;

      const acceptTypeOfCurrentField = _.find(FIELD_SELECT_OPTIONS_PRODUCT_QUANTITY, [
        "value",
        currentField,
      ])?.type;

      const allowUseOptions = operatorOptions.some((operator) => {
        return acceptTypeOfCurrentField?.includes(operator);
      });
      return !allowUseOptions;
    },
    [discountList],
  );

  // init data in create case
  useEffect(() => {
    const condition = form.getFieldValue(rule)?.conditions;
    if (!Array.isArray(condition) || condition.length === 0) {
      form.setFieldsValue({
        [rule]: {
          [conditions]: [blankRow],
          group_operator: CreateReleasePromotionRuleType.AND,
          value_type: DiscountUnitType.PERCENTAGE.value,
        },
      });
      setValueComponentList([defaultValueComponent]);
    }
  }, [form]);

  useEffect(() => {
    if (priceRuleData?.rule && priceRuleData.rule.conditions?.length > 0) {
      const temp: any[] = [];
      priceRuleData?.rule?.conditions.forEach((element: DiscountConditionRule) => {
        temp.push(
          _.find(FIELD_SELECT_OPTIONS_PRODUCT_QUANTITY, ["value", element.field])?.valueComponent,
        );
      });
      if (temp[0]) {
        setValueComponentList(temp);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRuleData?.rule?.conditions?.length]);

  return (
    <ProductQuantityStyle>
      {releasePromotionListType === ReleasePromotionListType.EQUALS ? (
        <GeneralProductQuantitySearchImport
          loadingDiscountVariant={loadingDiscountVariant}
          onSearchVariant={onSearchVariant}
          onSelectVariant={onSelectVariant}
          listSearchVariant={listSearchVariant}
          productSearchRef={productSearchRef}
          setShowImportModal={setShowImportModal}
          listProductNotExcludeForPagging={listProductNotExcludeForPagging}
          onDeleteItem={onDeleteItem}
          handlePageChange={handlePageChange}
          handleSizeChange={handleSizeChange}
        />
      ) : releasePromotionListType === ReleasePromotionListType.NOT_EQUAL_TO ? (
        <GeneralProductQuantityHaveExclude
          loadingDiscountVariant={loadingDiscountVariant}
          onSearchVariant={onSearchVariant}
          onSelectVariant={onSelectVariant}
          listSearchVariant={listSearchVariant}
          productSearchRef={productSearchRef}
          setShowImportModal={setShowImportModal}
          listProductHaveExcludeForPagging={listProductHaveExcludeForPagging}
          onDeleteItem={onDeleteItem}
          handlePageChange={handlePageChange}
          handleSizeChange={handleSizeChange}
        />
      ) : (
        <GeneralProductQuantityConditions
          rule={rule}
          conditions={conditions}
          form={form}
          handleChangeFieldSelect={handleChangeFieldSelect}
          getIsDisableOptions={getIsDisableOptions}
          ValueComponentList={ValueComponentList}
          handleDelete={handleDelete}
          handleAdd={handleAdd}
        />
      )}

      <Modal
        onCancel={() => {
          setSuccessCount(0);
          setUploadStatus(undefined);
          setShowImportModal(false);
        }}
        width={650}
        visible={showImportModal}
        title="Nhập file khuyến mại sản phẩm"
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
            disabled={importProductButton || uploadStatus === "error"}
            onClick={handleImportListProduct}
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
                <p>- Chuyển đổi file dưới dạng .XLSX trước khi tải dữ liệu</p>
                <p>
                  - Tải file mẫu{" "}
                  <a href={PROMOTION_CDN.PROMOTION_PRODUCT_QUANTITY_TEMPLATE_URL}>tại đây</a>
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
                      setUploadStatus("error");
                      setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                      setProductsImported([]);
                      return false;
                    }
                    setUploadStatus("uploading");
                    setUploadError([]);
                    return true;
                  }}
                  multiple={false}
                  showUploadList={false}
                  action={`${AppConfig.baseUrl}promotion-service/price-rules/discount-codes/variant/read-file`}
                  headers={{ Authorization: `Bearer ${token}` }}
                  onChange={(info) => {
                    const { status } = info.file;
                    if (status === EnumUploadStatus.done) {
                      const response = info.file.response;
                      if (response.code === HttpStatus.SUCCESS) {
                        if (response.data.data.length > 0) {
                          setProductsImported(response.data.data);
                          setImportProductButton(false);
                        }
                        if (response.data.errors.length > 0) {
                          const errors: Array<any> = _.uniqBy(response.data.errors, "index").sort(
                            (a: any, b: any) => a.index - b.index,
                          );
                          setListProductErrorsResponse([...errors]);
                        } else {
                          setListProductErrorsResponse([]);
                        }
                        setImportTotal(response.data.total);
                        setSuccessCount(response.data.success_count);

                        setUploadStatus(status);
                      } else {
                        setUploadStatus("error");
                        setUploadError(response.errors);
                        setProductsImported([]);
                      }
                    } else if (status === EnumUploadStatus.error) {
                      message.error(`${info.file.name} file upload failed.`);
                      setUploadStatus(status);
                      setProductsImported([]);
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
                    <h2 className="error-import-file__info">
                      Xử lý file nhập toàn tất:{" "}
                      <strong className="error-import-file__number-success">
                        {successCount} / {importTotal}
                      </strong>{" "}
                      sản phẩm thành công
                    </h2>
                  </Row>
                  <Divider />
                  {listProductErrorsResponse.length > 0 ? (
                    <div>
                      <Row justify={"start"}>
                        <h3 className="error-import-file__title">Danh sách lỗi: </h3>
                      </Row>
                      <Row justify={"start"}>
                        <div className="error-import-file__list">
                          {listProductErrorsResponse?.map((error: any, index) => (
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

      <ModalConfirm
        visible={isVisibleConfirmReplaceProductModal}
        title="Xoá sản phẩm con trong danh sách"
        subTitle="Đã có sản phẩm con trong danh sách, thêm sản phẩm cha sẽ tự động xoá sản phẩm con"
        onOk={handleAcceptParentProduct}
        onCancel={handleDenyParentProduct}
      />
    </ProductQuantityStyle>
  );
}
