import {DeleteOutlined} from "@ant-design/icons";
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
  Tooltip,
} from "antd";
import _ from "lodash";
import {DiscountFormModel} from "model/promotion/discount.create.model";
import React, {createRef, useCallback, useEffect, useMemo, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {RiInformationLine} from "react-icons/ri";
import {useDispatch} from "react-redux";
import {Link} from "react-router-dom";
import {showError} from "utils/ToastUtils";
import DuplicatePlus from "../../../../assets/icon/DuplicatePlus.svg";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import NumberInput from "../../../../component/custom/number-input.custom";
import UrlConfig from "../../../../config/url.config";
import {searchVariantsRequestAction} from "../../../../domain/actions/product/products.action";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {VariantResponse} from "../../../../model/product/product.model";
import {formatCurrency} from "../../../../utils/AppUtils";
import ProductItem from "../../../purchase-order/component/product-item";
import PickManyProductModal from "../../../purchase-order/modal/pick-many-product.modal";
import {DiscountMethodStyled} from "./style";

const Option = Select.Option;

const FixedPriceGroup = (props: any) => {
  const {key, name, form, remove, allProducts, discountMethod} = props;
  const dispatch = useDispatch();

  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Array<any>>([]);
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState("FIXED_AMOUNT");
  const productSearchRef = createRef<CustomAutoComplete>();
  const entitlementForm: Array<DiscountFormModel> = form.getFieldValue("entitlements");
  const onResultSearch = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!result) {
      setData([]);
    } else {
      setData(result.items);
    }
  }, []);

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
    const formEntitlements = entitlementForm;
    const initVariants = formEntitlements[name]?.variants;
    if (formEntitlements[name]?.["prerequisite_quantity_ranges.value_type"])
      setDiscountType(
        formEntitlements[name]?.["prerequisite_quantity_ranges.value_type"]
      );
    if (initVariants && initVariants.length > 0) {
      let temps: Array<any> = [];
      _.unionBy(initVariants, "variant_id").forEach((variant: any) => {
        const product = transformVariant(variant);
        temps.push(product);
      });
      setSelectedProduct(temps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, name, JSON.stringify(entitlementForm)]);

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

  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 200,
              page: 1,
              info: value.trim(),
            },
            onResultSearch
          )
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch]
  );

  // add entitled_variant_ids to each entitlement
  useEffect(() => {
    let entitlementFields = entitlementForm;
    entitlementFields[name] = Object.assign({}, entitlementFields[name], {
      entitled_variant_ids: selectedProduct.map((p) => p.id),
    });
    form.setFieldsValue({entitlements: entitlementFields});
  }, [form, name, selectedProduct, entitlementForm]);

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id,
      });
    });
    return options;
  }, [data]);

  const onSelectProduct = useCallback(
    (value) => {
      const selectedItem = data.find((e) => e.id === Number(value));
      const checkExist = selectedProduct.some((e) => e.id === value);
      if (checkExist) {
        showError("Sản phẩm đã được chọn!");
        return;
      }
      if (selectedItem) {
        setSelectedProduct([selectedItem].concat(selectedProduct));
      }
    },
    [data, selectedProduct]
  );

  const onPickManyProduct = useCallback(
    (items: Array<VariantResponse>) => {
      if (items.length) {
        setSelectedProduct([...selectedProduct, ...items]);
      }
      setVisibleManyProduct(false);
    },
    [selectedProduct]
  );

  const onDeleteItem = useCallback(
    (index: number) => {
      selectedProduct.splice(index, 1);
      setSelectedProduct([...selectedProduct]);
      entitlementForm[name].variants.splice(index, 1);
    },
    [selectedProduct, entitlementForm, name]
  );

  const formatDiscountValue = useCallback(
    (value: number | undefined) => {
      if (discountType !== "FIXED_AMOUNT") {
        const floatIndex = value?.toString().indexOf(".") || -1;
        if (floatIndex > 0) {
          return `${value}`.slice(0, floatIndex + 3);
        }
        return `${value}`;
      } else {
        return formatCurrency(`${value}`.replaceAll(".", ""));
      }
    },
    [discountType]
  );

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
              {required: true, message: "Cần nhập số lượng tối thiểu"},
              ({getFieldValue}) => ({
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
        {/* Tạm thời bỏ giới hạn số lượng */}
        <Col span={7} style={{display: "none"}}>
          <Form.Item
            name={[name, "prerequisite_quantity_ranges.allocation_limit"]}
            label={
              <Space>
                <span>Giới hạn</span>
                <Tooltip
                  title={
                    "Tổng số lượng sản phẩm áp dụng khuyến mại. Mặc định không điền là không giới hạn." +
                    "VD: Chỉ áp dụng cho 100 sản phẩm, hết 100 sản phẩm này thì không có khuyến mại nữa."
                  }
                >
                  <RiInformationLine />
                </Tooltip>
              </Space>
            }
          >
            <NumberInput key={`${key}-usage`} min={0} />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Input.Group compact style={{display: "flex", alignItems: "stretch"}}>
            <DiscountMethodStyled>
              <Form.Item
                name={[name, "prerequisite_quantity_ranges.value"]}
                label={discountMethod === "FIXED_PRICE" ? "Giá cố định: " : "Chiết khấu"}
                style={{flex: "1 1 auto"}}
                rules={[{required: true, message: "Cần nhập chiết khấu"}]}
              >
                <InputNumber
                  style={{textAlign: "end", borderRadius: "0px"}}
                  min={1}
                  max={discountType === "FIXED_AMOUNT" ? 999999999 : 100}
                  step={discountType === "FIXED_AMOUNT" ? 1 : 0.01}
                  formatter={(value) => formatDiscountValue(value)}
                />
              </Form.Item>
            </DiscountMethodStyled>
            <Form.Item name={[name, "prerequisite_quantity_ranges.value_type"]} label=" ">
              <Select
                style={{borderRadius: "0px"}}
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
            <Input.Group className="display-flex">
              <CustomAutoComplete
                key={`${key}-product_search`}
                id="#product_search"
                dropdownClassName="product"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch, ..."
                onSearch={onSearch}
                dropdownMatchSelectWidth={456}
                style={{width: "100%"}}
                onSelect={onSelectProduct}
                options={renderResult}
                ref={productSearchRef}
                textEmpty={"Không tìm thấy sản phẩm"}
              />
              <Button
                icon={<img src={DuplicatePlus} style={{marginRight: 8}} alt="" />}
                onClick={() => setVisibleManyProduct(true)}
                style={{width: 132, marginLeft: 10}}
              >
                Chọn nhiều
              </Button>
            </Input.Group>
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
                  render: (value: string, item, index: number) => {
                    return (
                      <div>
                        <div>
                          <div className="product-item-sku">
                            <Link
                              target="_blank"
                              to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.id}`}
                            >
                              {item.sku}
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
                  render: (value, item, index) =>
                    formatCurrency(item.variant_prices[0]?.import_price),
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
            <Row gutter={16} style={{paddingTop: "16px"}}>
              <Col span={24}>
                <Button icon={<DeleteOutlined />} danger onClick={() => remove(name)}>
                  Xoá nhóm chiết khấu
                </Button>
              </Col>
            </Row>
          )}

          <PickManyProductModal
            onSave={onPickManyProduct}
            selected={data}
            onCancel={() => setVisibleManyProduct(false)}
            visible={visibleManyProduct}
            emptyText={"Không tìm thấy sản phẩm"}
          />
        </div>
      )}
    </div>
  );
};

export default FixedPriceGroup;
