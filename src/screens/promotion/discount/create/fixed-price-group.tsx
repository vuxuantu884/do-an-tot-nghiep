import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tooltip
} from "antd";
import ModalConfirm from "component/modal/ModalConfirm";
import _ from "lodash";
import { DiscountFormModel, VariantEntitlementsFileImport } from "model/promotion/discount.create.model";
import React, { createRef, useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { RiInformationLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { formatDiscountValue, handleSearchProduct, onSelectProduct } from "utils/PromotionUtils";
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
const Option = Select.Option;

const FixedPriceGroup = (props: any) => {
  const { key, name, form, remove, allProducts, discountMethod, importProduct, setImportProduct } = props;
  const dispatch = useDispatch();

  const [dataSearchVariant, setDataSearchVariant] = useState<Array<VariantResponse>>([]);
  const [dataSearchProduct, setDataSearchProduct] = useState<Array<ProductResponse>>([]);

  const [selectedProduct, setSelectedProduct] = useState<Array<any>>([]);
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState("FIXED_AMOUNT");
  const productSearchRef = createRef<CustomAutoComplete>();
  const variantSearchRef = createRef<CustomAutoComplete>();
  const entitlementForm: Array<DiscountFormModel> = form.getFieldValue("entitlements");

  const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState<boolean>(false);
  const selectedProductParentRef = useRef<ProductResponse | null>(null)

  const onResultSearchVariant = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!result) {
      setDataSearchVariant([]);
    } else {
      setDataSearchVariant(result.items);
    }
  }, []);


  const transformVariant = (item: any) => ({
    name: item.variant_title,
    on_hand: item.quantity,
    sku: item.sku,
    product_id: "",
    variant_prices: [
      {
        import_price: item.price,
      },
    ],
    id: item.variant_id,
  });

  const onSearchVariant = (value: string) => {
    if (value.trim() !== "" && value.length >= 3) {
      dispatch(
        searchVariantsRequestAction(
          {
            status: "active",
            limit: 200,
            page: 1,
            info: value.trim(),
          },
          onResultSearchVariant
        )
      );
    } else {
      setDataSearchVariant([]);
    }
  };

  const renderResultVariant = () => {
    let options: any[] = [];
    dataSearchVariant.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id,
      });
    });
    return options;
  };

  const renderResultProduct = () => {
    let options: any[] = [];
    dataSearchProduct.forEach((item: ProductResponse, index: number) => {
      options.push({
        label: <span>{item.name}</span>,
        value: JSON.stringify(item),
      });
    });
    return options;
  };


  /**
   * Xoá sản phẩm con thuộc sản phẩm cha mới và thêm sản phẩm cha mới. 
   */
  const handleAcceptParentProduct = () => {
    if (selectedProductParentRef.current) {
      // add product parent id to form 
      const entitlementForm: Array<DiscountFormModel> = form.getFieldValue("entitlements");
      console.log(entitlementForm);


      const filteredVariant = selectedProduct.filter((product) => {
        if (!selectedProductParentRef.current?.variants) {
          return true;
        }
        return selectedProductParentRef.current?.variants?.every((variant) => {
          return variant.id !== product.id;
        })
      });

      setSelectedProduct([selectedProductParentRef.current].concat(filteredVariant));
    }
    selectedProductParentRef.current = null;
    setIsVisibleConfirmModal(false);
  }

  if (name === 3)
    console.log("selectedProduct", name, selectedProduct);

  /**
   * Đóng modal xác nhận thêm mã cha
   */
  const handleDenyParentProduct = () => {
    selectedProductParentRef.current = null;
    setIsVisibleConfirmModal(false);
  }

  const onPickManyProduct = useCallback(
    (items: Array<VariantResponse>) => {
      if (items.length) {
        setSelectedProduct([...selectedProduct, ...items]);
      }
      setVisibleManyProduct(false);
    },
    [selectedProduct]
  );

  const onDeleteItem = (index: number) => {
    selectedProduct.splice(index, 1);
    setSelectedProduct([...selectedProduct]);
    entitlementForm[name].variants?.splice(index, 1);

    //xoá trong danh sách file import product

    const importProductTemp: Array<VariantEntitlementsFileImport> = [...importProduct];
    importProductTemp.splice(index, 1);
    setImportProduct((prev: Array<Array<VariantEntitlementsFileImport>>) => {
      prev[name] = importProductTemp;
      return prev;
    })
  };

  useEffect(() => {
    if (discountMethod === "FIXED_PRICE") {
      setDiscountType("FIXED_AMOUNT");
    }
    if (discountMethod === "QUANTITY") {
      setDiscountType("PERCENTAGE");
    }
  }, [discountMethod]);

  useEffect(() => {
    const formEntitlement = form.getFieldValue("entitlements")[name];
    if (formEntitlement && !formEntitlement["prerequisite_quantity_ranges.value_type"]) {
      formEntitlement["prerequisite_quantity_ranges.value_type"] = discountType;
    }
  }, [discountType, form, name]);


  useEffect(() => {
    const formEntitlements: Array<DiscountFormModel> = form.getFieldValue("entitlements");

    if (formEntitlements[name]?.["prerequisite_quantity_ranges.value_type"])
      setDiscountType(
        formEntitlements[name]?.["prerequisite_quantity_ranges.value_type"]
      );
    if (importProduct?.length > 0) {
      let temps: Array<any> = [];
      importProduct?.forEach((variant: any) => {
        const product = transformVariant(variant);
        temps.push(product);
      });


      setSelectedProduct((prev) => {
        console.log([...prev, ...temps]);
        return _.unionBy([...prev, ...temps], "id");
      });

    }

  }, [form, name, importProduct]);

  /**
   * add entitled_variant_ids, entitled_product_ids to each entitlement
   */
  const variantIdReducer = (accumulator: number[], currentValue: any) => {
    if (currentValue.sku) {
      accumulator.push(currentValue.id);
    }
    return accumulator;
  }

  const productIdReducer = (accumulator: number[], currentValue: any) => {
    if (currentValue.code?.length === 7) {
      accumulator.push(currentValue.id);
    }
    return accumulator;
  }

  useEffect(() => {
    let entitlementFields: Array<DiscountFormModel> = form.getFieldValue("entitlements");

    entitlementFields[name] = Object.assign({}, entitlementFields[name], {
      /**
       * Có sku là variant | Product check code.length === 7
       */
      entitled_variant_ids: selectedProduct.reduce(variantIdReducer, []),
      entitled_product_ids: selectedProduct.reduce(productIdReducer, []),
    });
    form.setFieldsValue({ entitlements: entitlementFields });
  }, [form, name, selectedProduct, entitlementForm]);
  /**
    * end add entitled_variant_ids, entitled_product_ids to each entitlement
    */
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
            name={[name, "prerequisite_quantity_ranges.greater_than_or_equal_to"]}
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
              { required: true, message: "Cần nhập số lượng tối thiểu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const usageLimit = getFieldValue("usage_limit");
                  const entitlements = getFieldValue("entitlements");
                  const allocateLimit =
                    entitlements[name]?.["prerequisite_quantity_ranges.allocation_limit"];
                  if (value && usageLimit && value > usageLimit) {
                    return Promise.reject(
                      new Error("SL Tối thiểu phải nhỏ hơn Số lượng áp dụng")
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
            <NumberInput key={`${key}-min`} min={0} />
          </Form.Item>
        </Col>

        <Col span={9}>
          <Input.Group compact style={{ display: "flex", alignItems: "stretch" }}>
            <DiscountMethodStyled>
              <Form.Item
                name={[name, "prerequisite_quantity_ranges.value"]}
                label={discountMethod === "FIXED_PRICE" ? "Giá cố định: " : "Chiết khấu"}
                style={{ flex: "1 1 auto" }}
                rules={[{ required: true, message: "Cần nhập chiết khấu" }]}
              >
                <InputNumber
                  style={{ textAlign: "end", borderRadius: "0px" }}
                  min={1}
                  max={discountType === "FIXED_AMOUNT" ? 999999999 : 100}
                  step={discountType === "FIXED_AMOUNT" ? 1 : 0.01}
                  formatter={(value) => formatDiscountValue(value, discountType === "PERCENTAGE")}
                />
              </Form.Item>
            </DiscountMethodStyled>
            <Form.Item name={[name, "prerequisite_quantity_ranges.value_type"]} label=" ">
              <Select
                style={{ borderRadius: "0px" }}
                onSelect={(value: string) => {
                  const formEntitlements = form.getFieldValue("entitlements");

                  let entitlement = formEntitlements[name];
                  if (entitlement)
                    entitlement["prerequisite_quantity_ranges.value"] = null;
                  setDiscountType(value);
                }}
                defaultValue={
                  discountMethod === "FIXED_PRICE" ? "FIXED_AMOUNT" : "PERCENTAGE"
                }
              >
                {discountMethod !== "FIXED_PRICE" && (
                  <Option key={"PERCENTAGE"} value={"PERCENTAGE"}>
                    %
                  </Option>
                )}
                <Option key={"FIXED_AMOUNT"} value={"FIXED_AMOUNT"}>
                  đ
                </Option>
              </Select>
            </Form.Item>
          </Input.Group>
        </Col>
      </Row>
      {allProducts ? (
        ""
      ) : (
        <div>
          <Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <CustomAutoComplete
                  key={`${key}-product_parent`}
                  id="#product_parent"
                  dropdownClassName="product"
                  placeholder="Tìm kiếm sản phẩm cha"
                  onSearch={(value) => { handleSearchProduct(dispatch, value, setDataSearchProduct) }}
                  dropdownMatchSelectWidth={456}
                  style={{ width: "100%" }}
                  onSelect={(value) => onSelectProduct(value, false, dataSearchVariant, selectedProductParentRef, setIsVisibleConfirmModal, selectedProduct, setSelectedProduct)}
                  options={renderResultProduct()}
                  ref={productSearchRef}
                  textEmpty={"Không tìm thấy sản phẩm"}
                />
              </Col>
              <Col span={11}>
                <CustomAutoComplete
                  key={`${key}-product_search`}
                  id="#product_search"
                  dropdownClassName="product"
                  placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch, ..."
                  onSearch={onSearchVariant}
                  dropdownMatchSelectWidth={456}
                  style={{ width: "100%" }}
                  onSelect={(value) => onSelectProduct(value, true, dataSearchVariant, selectedProductParentRef, setIsVisibleConfirmModal, selectedProduct, setSelectedProduct)}
                  options={renderResultVariant()}
                  ref={variantSearchRef}
                  textEmpty={"Không tìm thấy sản phẩm"}
                />
              </Col>
              <Col span={5}>
                <Button
                  icon={<img src={DuplicatePlus} style={{ marginRight: 8 }} alt="" />}
                  onClick={() => setVisibleManyProduct(true)}
                  style={{ width: '100%', minWidth: '132px' }}
                >
                  Chọn nhiều
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item name={[name, "entitlements"]}>
            <Table
              className="product-table"
              rowKey={(record) => record.id}
              rowClassName="product-table-row"
              columns={[
                {
                  title: "Sản phẩm",
                  className: "ant-col-info",
                  dataIndex: "variant",
                  align: "left",
                  render: (value: string, item) => {
                    return (
                      <div>
                        <div>
                          <div className="product-item-sku">
                            <Link
                              target="_blank"
                              to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.id}`}
                            >
                              {item.code?.length === 7 ? item.code : item.sku}
                            </Link>
                          </div>
                          <div className="product-item-name">
                            <span className="product-item-name-detail">{item.name}</span>
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
                  render: (value, item, index) => item.on_hand,
                },
                {
                  title: "Giá vốn",
                  className: "ant-col-info",
                  align: "center",
                  width: "15%",
                  render: (value, item, index) => {
                    if (item.variant_prices) {
                      return formatCurrency(item.variant_prices[0]?.import_price);
                    } else {
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
                      onClick={() => onDeleteItem(index)}
                      className="product-item-delete"
                      icon={<AiOutlineClose />}
                    />
                  ),
                },
              ]}
              dataSource={selectedProduct}
              tableLayout="fixed"
              pagination={false}
            />
          </Form.Item>
          {form.getFieldValue("entitlements")?.length <= 1 ? (
            ""
          ) : (
            <Row gutter={16} style={{ paddingTop: "16px" }}>
              <Col span={24}>
                <Button icon={<DeleteOutlined />} danger onClick={() => {
                  remove(name);
                  setImportProduct((prev: Array<Array<VariantEntitlementsFileImport>>) => {
                    prev.splice(name, 1);
                    return prev;
                  })
                }}>
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
        </div>
      )
      }
      <ModalConfirm visible={isVisibleConfirmModal} title="Xoá sản phẩm con trong danh sách"
        subTitle="Đã có sản phẩm con trong danh sách, thêm sản phẩm cha sẽ tự động xoá sản phẩm con"
        onOk={() => { handleAcceptParentProduct() }}
        onCancel={() => { handleDenyParentProduct() }}
      />
    </div >
  );
};

export default FixedPriceGroup;
