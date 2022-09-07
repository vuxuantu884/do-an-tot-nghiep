import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tooltip,
} from "antd";
import ParentProductItem from "component/item-select/parent-product-item";
import ModalConfirm from "component/modal/ModalConfirm";
import CustomTable from "component/table/CustomTable";
import _ from "lodash";
import {
  EntilementFormModel,
  PriceRuleMethod,
  ProductEntitlements,
} from "model/promotion/price-rules.model";
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineClose } from "react-icons/ai";
import { RiInformationLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  handleDenyParentProduct,
  onSelectVariantOfDiscount,
  parseSelectProductToTableData,
} from "utils/PromotionUtils";
import DuplicatePlus from "../../../../assets/icon/DuplicatePlus.svg";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import UrlConfig from "../../../../config/url.config";
import { searchVariantsRequestAction } from "../../../../domain/actions/product/products.action";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import { ProductResponse, VariantResponse } from "../../../../model/product/product.model";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import ProductItem from "../../../purchase-order/component/product-item";
import { DiscountUnitType, MAX_FIXED_DISCOUNT_VALUE } from "../../constants";
import { DiscountContext } from "./discount-provider";
import NumberInput from "component/custom/number-input.custom";
import { showError } from "utils/ToastUtils";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

const Option = Select.Option;

interface Props {
  form: FormInstance;
  remove: (index: number) => void;
  name: number;
  key: number;
  fieldKey: number;
  handleVisibleManyProduct: (indexOfEntilement: number) => void;
}
const FixedAndQuantityGroup = (props: Props) => {
  const { key, name, form, remove, handleVisibleManyProduct } = props;
  const dispatch = useDispatch();

  const [dataSearchVariant, setDataSearchVariant] = useState<Array<VariantResponse>>([]);

  const productSearchRef = createRef<CustomAutoComplete>();

  const discountUpdateContext = useContext(DiscountContext);
  const { discountMethod } = discountUpdateContext;

  const selectedProductParentRef = useRef<ProductResponse | null>(null);
  const variantsOfSelectedProductRef = useRef<Array<VariantResponse>>([]);
  const [isVisibleConfirmReplaceProductModal, setIsVisibleConfirmReplaceProductModal] =
    useState<boolean>(false);
  const [discountUnitOptions, setDiscountUnitOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [dataProductForPagging, setDataProductForPagging] = useState<
    PageResponse<ProductEntitlements>
  >({
    items: [],
    metadata: {
      total: 0,
      limit: 10,
      page: 1,
    },
  });

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const dataSourceForm: Array<ProductEntitlements> =
    form.getFieldValue("entitlements")[name]?.selectedProducts;

  const handlePageChange = (page: number, pageSize?: number) => {
    if (!pageSize) {
      pageSize = dataProductForPagging.metadata.limit;
    }
    const product = dataSourceForm.slice((page - 1) * pageSize, page * pageSize);
    setDataProductForPagging({
      items: product,
      metadata: {
        total: dataSourceForm.length,
        limit: pageSize,
        page: page,
      },
    });
  };

  const handleSizeChange = (current: number, size: number) => {
    setDataProductForPagging({
      items: dataSourceForm.slice((current - 1) * size, current * size),
      metadata: {
        total: dataSourceForm.length,
        limit: size,
        page: current,
      },
    });
  };
  const onResultSearchVariant = useCallback((result: any) => {
    if (result.items.length <= 0) {
      showError("Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng bán");
    }

    if (!result) {
      setDataSearchVariant([]);
    } else {
      setDataSearchVariant(result.items);
    }
  }, []);

  const onSearchVariant = useCallback(
    (value: string) => {
      dispatch(
        searchVariantsRequestAction(
          {
            status: "active",
            limit: 200,
            page: 1,
            info: value.trim(),
            saleable: true,
          },
          onResultSearchVariant,
        ),
      );
    },
    [dispatch, onResultSearchVariant],
  );

  const renderResult = useMemo(() => {
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

    return [...productOptions, ...variantOptions];
  }, [dataSearchVariant]);

  /**
   *
   * @param index number index of product in page
   * @param item : ProductEntitlements
   */
  const onDeleteItem = (index: number, item: ProductEntitlements) => {
    const { limit, page } = dataProductForPagging.metadata;
    console.log("onDeleteItem", index, limit, page);
    // get index in table
    index = (page - 1) * limit + index;
    const entilementFormValue: Array<EntilementFormModel> = form.getFieldValue("entitlements");
    // delete variant from display
    entilementFormValue[name]?.selectedProducts?.splice(index, 1);

    // delete product from entitled_product_ids
    entilementFormValue[name].entitled_product_ids = entilementFormValue[
      name
    ].entitled_product_ids.filter((e: number) => e !== item.product_id);

    // delete product from entitled_variant_ids
    if (item.product_id && item.variant_id) {
      // delete variant id
      entilementFormValue[name].entitled_variant_ids = entilementFormValue[
        name
      ].entitled_variant_ids.filter((id: number) => id !== item.variant_id);
    }

    // change reference for re-render form
    form.setFieldsValue({ entitlements: _.cloneDeep(entilementFormValue) });
  };

  /**
   * Xoá sản phẩm con thuộc sản phẩm cha mới và thêm sản phẩm cha mới.
   */
  const handleAcceptParentProduct = () => {
    if (selectedProductParentRef.current) {
      const entitlementForm: Array<EntilementFormModel> = form.getFieldValue("entitlements");

      // delete variant from table
      const filteredVariant = entitlementForm[name].selectedProducts?.filter((product) => {
        return variantsOfSelectedProductRef.current?.every((variant) => {
          return variant.sku !== product.sku;
        });
      });

      // delete variant id
      const filteredVariantId = entitlementForm[name].entitled_variant_ids?.filter((variantId) => {
        return variantsOfSelectedProductRef.current?.every((variant) => {
          return variant.id !== variantId;
        });
      });

      // set form value to display
      filteredVariant?.unshift(parseSelectProductToTableData(selectedProductParentRef.current));
      entitlementForm[name].selectedProducts = filteredVariant;
      entitlementForm[name].entitled_variant_ids = filteredVariantId;
      entitlementForm[name].entitled_product_ids.unshift(selectedProductParentRef.current?.id);

      form.setFieldsValue({ entitlements: _.cloneDeep(entitlementForm) });
    }
    selectedProductParentRef.current = null;
    setIsVisibleConfirmReplaceProductModal(false);
  };

  /**
   * @description: nếu phương thức chiết khấu đồng giá (FIXED_PRICE) thì chỉ có 1 option là FIXED_PRICE
   * nếu phương thức chiết khấu theo từng sản phẩm (FIXED_AMOUNT)  thì có 2 option là PERCENTAGE (default) và FIXED_AMOUNT
   */
  useEffect(() => {
    let option: Array<{ value: string; label: string }> = [];
    if (discountMethod === PriceRuleMethod.FIXED_PRICE) {
      // setDiscountType(DiscountUnitType.FIXED_PRICE.value);

      option = [
        {
          value: DiscountUnitType.FIXED_PRICE.value,
          label: DiscountUnitType.FIXED_PRICE.label,
        },
      ];
    }

    if (discountMethod === PriceRuleMethod.QUANTITY) {
      // setDiscountType(DiscountUnitType.PERCENTAGE.value);
      option = [
        {
          value: DiscountUnitType.PERCENTAGE.value,
          label: DiscountUnitType.PERCENTAGE.label,
        },
        {
          value: DiscountUnitType.FIXED_AMOUNT.value,
          label: DiscountUnitType.FIXED_AMOUNT.label,
        },
      ];
    }

    setDiscountUnitOptions(option);
  }, [discountMethod]);

  /**
   * cập nhật phân trang sản phẩm
   */
  useEffect(() => {
    if (Array.isArray(dataSourceForm)) {
      setDataProductForPagging((prev: any) => {
        const { limit, page } = prev.metadata;
        return {
          items: dataSourceForm.slice((page - 1) * limit, page * limit),
          metadata: {
            ...prev.metadata,
            total: dataSourceForm.length,
          },
        };
      });
    }
  }, [dataSourceForm]);

  const checkIsPercentUnit = () => {
    return (
      form.getFieldValue([
        "entitlements",
        name,
        "prerequisite_quantity_ranges",
        0,
        "value_type",
      ]) === DiscountUnitType.PERCENTAGE.value
    );
  };

  const checkIsExistDiscountGroup = () => {
    const entitlementsForm: Array<EntilementFormModel> = form.getFieldValue("entitlements");
    const entitlementCurrentChange = entitlementsForm[name]?.prerequisite_quantity_ranges[0];
    const prerequisiteQuantityRangesList = entitlementsForm
      .filter((item, index) => index !== name)
      .map((entitlement) => {
        return entitlement?.prerequisite_quantity_ranges[0];
      });

    return prerequisiteQuantityRangesList?.some((item) => {
      return (
        item.value_type === entitlementCurrentChange?.value_type &&
        item.value === entitlementCurrentChange.value
      );
    });
  };

  return (
    <Card key={name} style={{ boxShadow: "none" }}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={[name, "prerequisite_quantity_ranges", 0, "greater_than_or_equal_to"]}
            label={
              <Space>
                <span>SL tối thiểu</span>
                <Tooltip title={"Số lượng tối thiểu cho sản phẩm để được áp dụng khuyến mại"}>
                  <RiInformationLine />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: "Cần nhập số lượng tối thiểu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (typeof value === "number" && value <= 0) {
                    return Promise.reject(new Error("Số lượng tối thiểu phải lớn hơn 0"));
                  }
                  const quantity_limit = getFieldValue("quantity_limit");
                  if (!quantity_limit) {
                    return Promise.resolve();
                  }
                  const entitlements = getFieldValue("entitlements");
                  const allocateLimit =
                    entitlements[name]?.prerequisite_quantity_ranges.allocation_limit;
                  if (value && quantity_limit && value > quantity_limit) {
                    return Promise.reject(new Error("SL Tối thiểu phải nhỏ hơn số lượng áp dụng"));
                  } else if (value && allocateLimit && value > allocateLimit) {
                    return Promise.reject(new Error("SL Tối thiểu phải nhỏ hơn Giới hạn"));
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <InputNumber min={1} max={MAX_FIXED_DISCOUNT_VALUE} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={9}>
          <Form.Item
            required
            label={
              discountMethod === DiscountUnitType.FIXED_PRICE.value ? "Giá cố định " : "Chiết khấu"
            }
          >
            <Input.Group compact>
              <Form.Item
                name={[name, "prerequisite_quantity_ranges", 0, "value"]}
                rules={[
                  { required: true, message: "Cần nhập chiết khấu" },
                  () => ({
                    validator(_, value) {
                      if (checkIsPercentUnit()) {
                        if (typeof value === "number") {
                          if (value <= 0) {
                            return Promise.reject("Giá trị phải lớn hơn 0");
                          } else if (value > 100) {
                            return Promise.reject("Giá trị phải nhỏ hơn hoặc bằng 100%");
                          } else if (checkIsExistDiscountGroup()) {
                            return Promise.reject("Trùng điều kiện với nhóm chiết khấu đã có");
                          }
                        }
                      } else {
                        let msg =
                          discountMethod === DiscountUnitType.FIXED_PRICE.value
                            ? "Giá cố định "
                            : "Chiết khấu";

                        if (typeof value === "number") {
                          if (value <= 0) {
                            return Promise.reject(new Error(msg + " phải lớn hơn 0"));
                          } else if (value > 999999999) {
                            return Promise.reject("Giá trị phải nhỏ hơn hoặc bằng 999.999.999");
                          } else if (checkIsExistDiscountGroup()) {
                            return Promise.reject("Trùng điều kiện với nhóm chiết khấu đã có");
                          }
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                noStyle
              >
                <NumberInput
                  style={{ width: "calc(100% - 70px)", textAlign: "left" }}
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  onChange={() => form.validateFields()}
                  placeholder="Nhập giá trị"
                  maxLength={checkIsPercentUnit() ? 3 : 11}
                  minLength={0}
                />
              </Form.Item>
              <Form.Item name={[name, "prerequisite_quantity_ranges", 0, "value_type"]} noStyle>
                <Select
                  style={{ borderRadius: "0px", width: "70px" }}
                  onSelect={(e) => {
                    // setDiscountType(e?.toString() || "");
                    const value = form.getFieldValue("entitlements");
                    value[name].prerequisite_quantity_ranges[0].value = undefined;
                    form.setFieldsValue({
                      entitlements: value,
                    });
                    form.validateFields();
                  }}
                >
                  {discountUnitOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
      </Row>

      <div>
        <Form.Item>
          <Input.Group className="display-flex">
            <CustomAutoComplete
              key={`${key}-product_search`}
              id="#product_search"
              dropdownClassName="product"
              placeholder="Thêm sản phẩm theo tên, mã SKU, mã vạch, ..."
              onSearch={_.debounce(onSearchVariant, 300)}
              dropdownMatchSelectWidth={456}
              style={{ width: "100%" }}
              onSelect={(value) =>
                onSelectVariantOfDiscount(
                  value,
                  selectedProductParentRef,
                  variantsOfSelectedProductRef,
                  setIsVisibleConfirmReplaceProductModal,
                  form,
                  name,
                  dispatch,
                )
              }
              options={renderResult}
              ref={productSearchRef}
              textEmpty={"Không tìm thấy sản phẩm"}
            />
            <Button
              icon={<img src={DuplicatePlus} style={{ marginRight: 8 }} alt="" />}
              onClick={() => handleVisibleManyProduct(name)}
              style={{ width: 132, marginLeft: 10 }}
            >
              Chọn nhiều
            </Button>
          </Input.Group>
        </Form.Item>
        <CustomTable
          className="product-table"
          bordered
          rowKey={(record) => record?.sku}
          rowClassName="product-table-row"
          columns={[
            {
              title: "Sản phẩm",
              className: "ant-col-info",
              dataIndex: "title",
              align: "left",
              render: (title: string, item, index: number) => {
                return (
                  <div>
                    <div>
                      <div className="product-item-sku">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.PRODUCT}/${item?.product_id}/variants/${item?.variant_id}`}
                        >
                          {item?.sku}
                        </Link>
                      </div>
                      <div className="product-item-name">
                        <span className="product-item-name-detail">{title}</span>
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              title: "Tồn đầu kỳ",
              className: "ant-col-info",
              align: "center",
              width: "15%",
              dataIndex: "open_quantity",
              render: (value) => value,
            },
            {
              title: "Giá vốn",
              className: "ant-col-info",
              align: "center",
              width: "15%",
              dataIndex: "cost",
              render: (value) => {
                if (typeof value === "number") {
                  // price at create time
                  return formatCurrency(value);
                } else {
                  return "-";
                }
              },
            },
            {
              title: "Giá bán",
              className: "ant-col-info",
              align: "center",
              width: "15%",
              dataIndex: "retail_price",
              render: (value) => {
                if (typeof value === "number") {
                  // price at create time
                  return formatCurrency(value);
                } else {
                  return "-";
                }
              },
            },
            {
              className: "ant-col-info",
              align: "right",
              width: "8%",
              render: (value: string, item, index: number) => (
                <Button
                  style={{ margin: "0 auto" }}
                  onClick={() => onDeleteItem(index, item)}
                  className="product-item-delete"
                  icon={<AiOutlineClose />}
                />
              ),
            },
          ]}
          dataSource={dataProductForPagging.items}
          tableLayout="fixed"
          pagination={{
            pageSize: dataProductForPagging.metadata.limit,
            total: dataProductForPagging.metadata.total,
            current: dataProductForPagging.metadata.page,
            onChange: handlePageChange,
            onShowSizeChange: handleSizeChange,
            showSizeChanger: true,
          }}
          scroll={{ y: 300 }}
        />
        {form.getFieldValue("entitlements")?.length > 1 && (
          <Row gutter={16} style={{ paddingTop: "16px" }}>
            <Col span={24}>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  setIsShowConfirmDelete(true);
                }}
              >
                Xoá nhóm chiết khấu
              </Button>
            </Col>
          </Row>
        )}

        <ModalConfirm
          visible={isVisibleConfirmReplaceProductModal}
          title="Xoá sản phẩm con trong danh sách"
          subTitle="Đã có sản phẩm con trong danh sách, thêm sản phẩm cha sẽ tự động xoá sản phẩm con"
          onOk={() => {
            handleAcceptParentProduct();
          }}
          onCancel={() => {
            handleDenyParentProduct(
              setIsVisibleConfirmReplaceProductModal,
              selectedProductParentRef,
            );
          }}
        />

        <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          okText={"Xóa"}
          onOk={() => remove(name)}
          cancelText={"Thoát"}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Bạn có chắc chắn muốn xóa nhóm chiết khấu không?"
        />
      </div>
    </Card>
  );
};

export default FixedAndQuantityGroup;
