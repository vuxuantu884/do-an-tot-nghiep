import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tooltip
} from "antd";
import ParentProductItem from "component/item-select/parent-product-item";
import ModalConfirm from "component/modal/ModalConfirm";
import _ from "lodash";
import { DiscountMethod, EntilementFormModel, ProductEntitlements } from "model/promotion/discount.create.model";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { RiInformationLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { handleDenyParentProduct, onSelectVariantAndProduct, parseSelectProductToTableData, parseSelectVariantToTableData } from "utils/PromotionUtils";
import DuplicatePlus from "../../../../assets/icon/DuplicatePlus.svg";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import NumberInput from "../../../../component/custom/number-input.custom";
import UrlConfig from "../../../../config/url.config";
import { searchVariantsRequestAction } from "../../../../domain/actions/product/products.action";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import { ProductResponse, VariantResponse } from "../../../../model/product/product.model";
import { formatCurrency } from "../../../../utils/AppUtils";
import ProductItem from "../../../purchase-order/component/product-item";
import PickManyProductModal from "../../../purchase-order/modal/pick-many-product.modal";
import { DiscountMethodStyled } from "../components/style";
import { DiscountUnitType } from "../constants";
import { DiscountUpdateContext } from "./discount-update-provider";
const Option = Select.Option;

interface Props {
  form: FormInstance;
  remove: (index: number) => void;
  name: number;
  key: number;
  fieldKey: number;

}
const FixedPriceGroupUpdate = (props: Props) => {
  const { key, name, form, remove } = props;
  const dispatch = useDispatch();

  const [dataSearchVariant, setDataSearchVariant] = useState<Array<VariantResponse>>([]);

  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  const discountUpdateContext = useContext(DiscountUpdateContext);
  const { isAllProduct, selectedVariant: entitlementsVariantMap, discountMethod } = discountUpdateContext;
  const [discountType, setDiscountType] = useState("FIXED_PRICE");

  const selectedVariant = useMemo(() => entitlementsVariantMap[name] || [], [entitlementsVariantMap, name]);
  const selectedProductParentRef = useRef<ProductResponse | null>(null)
  const variantsOfSelectedProductRef = useRef<Array<VariantResponse>>([])
  const [isVisibleConfirmReplaceProductModal, setIsVisibleConfirmReplaceProductModal] = useState<boolean>(false);
  const [discountUnitOptions, setDiscountUnitOptions] = useState<Array<{ value: string, label: string }>>([])


  // chưa cần refactor
  const onResultSearchVariant = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!result) {
      setDataSearchVariant([]);
    } else {
      setDataSearchVariant(result.items);
    }
  }, []);

  // chưa cần refactor
  const onSearchVariant = useCallback(
    (value: string) => {

      dispatch(
        searchVariantsRequestAction(
          {
            status: "active",
            limit: 100,
            page: 1,
            info: value.trim(),
          },
          onResultSearchVariant
        )
      );

    },
    [dispatch, onResultSearchVariant]
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



  // todo : refactor
  const onPickManyProduct = (items: Array<VariantResponse>) => {
    console.log(items, selectedVariant);
    if (items.length) {
      let selectedVariantId: number[] = [];
      const newProducts = items.map(item => {
        selectedVariantId.push(item.id);
        return parseSelectVariantToTableData(item);
      })

      const entilementFormValue: Array<EntilementFormModel> = form.getFieldValue("entitlements");
      entilementFormValue[name].entitled_variant_ids = _.uniq([...entilementFormValue[name].entitled_variant_ids, ...selectedVariantId]);

      const currentProduct = entilementFormValue[name].selectedProducts;

      if (Array.isArray(currentProduct)) {
        entilementFormValue[name].selectedProducts = _.uniqBy([...newProducts, ...currentProduct], "sku");
      } else {
        entilementFormValue[name].selectedProducts = newProducts;
      }

      form.setFieldsValue({ entitlements: _.cloneDeep(entilementFormValue) });
    }

  }


  /**
   * 
   * @param index number index of product in table
   * @param item : ProductEntitlements
   */
  const onDeleteItem = (index: number, item: ProductEntitlements) => {
    const entilementFormValue: Array<EntilementFormModel> = form.getFieldValue("entitlements");
    // delete variant from display
    entilementFormValue[name]?.selectedProducts?.splice(index, 1);

    if (item.isParentProduct) {
      // delete product id
      entilementFormValue[name].entitled_product_ids.filter((e: number) => e !== item.product_id);

    } else {
      // delete variant id
      entilementFormValue[name].entitled_variant_ids.filter((e: number) => e !== item.variant_id);
    }

    // change reference for re-render form
    form.setFieldsValue({ entitlements: _.cloneDeep(entilementFormValue) });
  }


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
        })
      });

      // delete variant id
      const filteredVariantId = entitlementForm[name].entitled_variant_ids?.filter((variantId) => {
        return variantsOfSelectedProductRef.current?.every((variant) => {
          return variant.id !== variantId;
        })
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
  }

  /**
 * @description: nếu phương thức chiết khấu đồng giá (FIXED_PRICE) thì chỉ có 1 option là FIXED_PRICE
 * nếu phương thức chiết khấu theo từng sản phẩm (FIXED_AMOUNT)  thì có 2 option là PERCENTAGE (default) và FIXED_AMOUNT
 */
  useEffect(() => {

    let option: Array<{ value: string, label: string }> = [];
    if (discountMethod === DiscountMethod.FIXED_PRICE) {
      setDiscountType(DiscountUnitType.FIXED_PRICE.value);

      option = [
        {
          value: DiscountUnitType.FIXED_PRICE.value,
          label: DiscountUnitType.FIXED_PRICE.label
        },]
    }

    if (discountMethod === DiscountMethod.QUANTITY) {
      setDiscountType(DiscountUnitType.PERCENTAGE.value);
      option = [
        {
          value: DiscountUnitType.PERCENTAGE.value,
          label: DiscountUnitType.PERCENTAGE.label
        },
        {
          value: DiscountUnitType.FIXED_AMOUNT.value,
          label: DiscountUnitType.FIXED_AMOUNT.label
        },
      ]
    }

    setDiscountUnitOptions(option)
  }, [discountMethod])

  return (
    <div
      key={name}
      style={{
        border: "1px solid rgb(229, 229, 229)",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "5px",
      }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={[name, "prerequisite_quantity_ranges", 0, "greater_than_or_equal_to"]}
            label={
              <Space>
                <span>SL tối thiểu</span>
                <Tooltip
                  title={"Số lượng tối thiểu cho sản phẩm để được áp dụng khuyến mại"}
                >
                  <RiInformationLine />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: "Cần nhập số lượng tối thiểu", },
              ({ getFieldValue }) => ({
                validator(_, value) {

                  const quantity_limit = getFieldValue("quantity_limit");
                  if (!quantity_limit) {
                    return Promise.resolve();
                  }
                  const entitlements = getFieldValue("entitlements");
                  const allocateLimit =
                    entitlements[name]?.prerequisite_quantity_ranges.allocation_limit;
                  if (value && quantity_limit && value > quantity_limit) {
                    return Promise.reject(
                      new Error("SL Tối thiểu phải nhỏ hơn số lượng áp dụng")
                    );
                  } else if (value && allocateLimit && value > allocateLimit) {
                    return Promise.reject(
                      new Error("SL Tối thiểu phải nhỏ hơn Giới hạn")
                    );
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <NumberInput min={1} />
          </Form.Item>
        </Col>

        <Col span={9}>
          <Input.Group compact style={{ display: "flex", alignItems: "stretch" }}>
            <DiscountMethodStyled>
              <Form.Item
                name={[name, "prerequisite_quantity_ranges", 0, "value"]}
                label={discountMethod === "FIXED_PRICE" ? "Giá cố định: " : "Chiết khấu"}
                style={{ flex: "1 1 auto" }}
                rules={[{ required: true, message: "Cần nhập chiết khấu" }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={discountType === DiscountUnitType.PERCENTAGE.value ? 100 : 999999999}
                  step={discountType === DiscountUnitType.PERCENTAGE.value ? 0.01 : 1}
                // formatter={(value) => formatDiscountValue(value, discountType === DiscountUnitType.PERCENTAGE.value)}

                />
              </Form.Item>
            </DiscountMethodStyled>
            <Form.Item name={[name, "prerequisite_quantity_ranges", 0, "value_type"]} label=" "
            >
              <Select
                defaultValue={DiscountUnitType.FIXED_PRICE.value}
                style={{ borderRadius: "0px" }}
                onSelect={(e) => {
                  setDiscountType(e?.toString() || "");
                  const value = form.getFieldValue("entitlements");
                  value[name].prerequisite_quantity_ranges[0].value = undefined;
                  form.setFieldsValue({
                    entitlements: value,
                  });
                }}
              >
                {discountUnitOptions.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Input.Group>
        </Col>
      </Row>
      {!isAllProduct && (
        <div>
          <Form.Item>
            <Input.Group className="display-flex">

              <CustomAutoComplete
                key={`${key}-product_search`}
                id="#product_search"
                dropdownClassName="product"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch, ..."
                onSearch={_.debounce(onSearchVariant, 300)}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%" }}
                onSelect={(value) => onSelectVariantAndProduct(value, selectedProductParentRef, variantsOfSelectedProductRef, setIsVisibleConfirmReplaceProductModal, form, name, dispatch)}
                options={renderResult}
                ref={productSearchRef}
                textEmpty={"Không tìm thấy sản phẩm"}
              />
              <Button
                icon={<img src={DuplicatePlus} style={{ marginRight: 8 }} alt="" />}
                onClick={() => setVisibleManyProduct(true)}
                style={{ width: 132, marginLeft: 10 }}
              >
                Chọn nhiều
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.List name={[name, "selectedProducts"]}>
            {(fields, { add, remove }) => {

              const entilementFormValue: EntilementFormModel[] = form.getFieldValue("entitlements");
              if (entilementFormValue[name] && entilementFormValue[name].selectedProducts) {
                const dataSourceForm: Array<ProductEntitlements> = form.getFieldValue("entitlements")[name].selectedProducts

                return (
                  <Table
                    className="product-table"
                    rowKey={(record) => record.sku}
                    rowClassName="product-table-row"
                    columns={[
                      {
                        title: "Sản phẩm",
                        className: "ant-col-info",
                        dataIndex: "variant_title",
                        align: "left",
                        render: (title: string, item, index: number) => {
                          return (
                            <div>
                              <div>
                                <div className="product-item-sku">
                                  <Link
                                    target="_blank"
                                    to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                  >
                                    {item.sku}
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
                        render: (value) => value
                      },
                      {
                        title: "Giá vốn",
                        className: "ant-col-info",
                        align: "center",
                        width: "15%",
                        dataIndex: "cost",
                        render: (value, item) => {
                          if (typeof value === "number") {
                            // price at create time
                            return formatCurrency(value);
                          }
                          else {
                            return "-";
                          }
                        }
                      },
                      {
                        className: "ant-col-info",
                        align: "right",
                        width: "8%",
                        render: (value: string, item, index: number) => (
                          <Button
                            onClick={() => onDeleteItem(index, item)}
                            className="product-item-delete"
                            icon={<AiOutlineClose />}
                          />
                        ),
                      },
                    ]}
                    dataSource={dataSourceForm}
                    tableLayout="fixed"
                    pagination={false}
                  />)
              }
            }}
          </Form.List>
          {form.getFieldValue("entitlements")?.length > 1 && (
            <Row gutter={16} style={{ paddingTop: "16px" }}>
              <Col span={24}>
                <Button icon={<DeleteOutlined />} danger onClick={() => remove(name)}>
                  Xoá nhóm chiết khấu
                </Button>
              </Col>
            </Row>
          )}

          <PickManyProductModal
            onSave={onPickManyProduct}
            selected={dataSearchVariant}
            onCancel={() => setVisibleManyProduct(false)}
            visible={visibleManyProduct}
            emptyText={"Không tìm thấy sản phẩm"}
          />

          <ModalConfirm visible={isVisibleConfirmReplaceProductModal} title="Xoá sản phẩm con trong danh sách"
            subTitle="Đã có sản phẩm con trong danh sách, thêm sản phẩm cha sẽ tự động xoá sản phẩm con"
            onOk={() => { handleAcceptParentProduct() }}
            onCancel={() => { handleDenyParentProduct(setIsVisibleConfirmReplaceProductModal, selectedProductParentRef) }}
          />
        </div>
      )}
    </div>
  );
};

export default FixedPriceGroupUpdate;
