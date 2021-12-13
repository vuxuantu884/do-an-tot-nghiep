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
import _ from "lodash";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { RiInformationLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { showError } from "utils/ToastUtils";
import DuplicatePlus from "../../../../assets/icon/DuplicatePlus.svg";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import NumberInput from "../../../../component/custom/number-input.custom";
import UrlConfig from "../../../../config/url.config";
import { searchVariantsRequestAction } from "../../../../domain/actions/product/products.action";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import { VariantResponse } from "../../../../model/product/product.model";
import { formatCurrency } from "../../../../utils/AppUtils";
import ProductItem from "../../../purchase-order/component/product-item";
import PickManyProductModal from "../../../purchase-order/modal/pick-many-product.modal";
import { DiscountMethodStyled } from "../components/style";
import { DiscountUpdateContext } from "./discount-update-provider";

const Option = Select.Option;
const DiscountUnitType = {
  PERCENTAGE: { value: "PERCENTAGE", name: "%" },
  FIXED_AMOUNT: { value: "FIXED_AMOUNT", name: "đ" }
};
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

  const [data, setData] = useState<Array<VariantResponse>>([]);

  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState("FIXED_AMOUNT");
  const productSearchRef = createRef<CustomAutoComplete>();

  const discountUpdateContext = useContext(DiscountUpdateContext);
  const { isAllProduct, selectedVariant: entitlementsVariantMap, setSelectedVariant, discountMethod } = discountUpdateContext;

  const selectedVariant = useMemo(() => entitlementsVariantMap.get(name) || [], [entitlementsVariantMap, name]);
  const discountUnit = () => {

    const listOption = [
      {
        value: DiscountUnitType.FIXED_AMOUNT.value,
        name: DiscountUnitType.FIXED_AMOUNT.name
      }]

    if (discountMethod !== "FIXED_PRICE") {
      listOption.unshift({
        value: DiscountUnitType.PERCENTAGE.value,
        name: DiscountUnitType.PERCENTAGE.name
      })
    }
    return listOption;

  }
  const onResultSearch = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!result) {
      setData([]);
    } else {
      setData(result.items);
    }
  }, []);



  // useEffect(() => {
  //   const formEntitlements = entitlementForm;
  //   const initVariants = formEntitlements[name]?.variants;
  //   if (formEntitlements[name]?.prerequisite_quantity_ranges.value_type)
  //     setDiscountType(
  //       formEntitlements[name]?.prerequisite_quantity_ranges.value_type
  //     );
  //   if (initVariants && initVariants.length > 0) {
  //     let temps: Array<any> = [];
  //     _.unionBy(initVariants, "variant_id").forEach((variant: any) => {
  //       const product = transformVariant(variant);
  //       temps.push(product);
  //     });
  //     setSelectedVariant(temps);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [form, name, JSON.stringify(entitlementForm)]);


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
    const entitlementForm: Array<any> = form.getFieldValue("entitlements");

    let entitlementFields = entitlementForm;
    entitlementFields[name] = Object.assign({}, entitlementFields[name], {
      entitled_variant_ids: selectedVariant.map((p) => p.id),
    });

    form.setFieldsValue({ entitlements: entitlementFields });

  }, [form, name, selectedVariant]);

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
      const checkExist = selectedVariant.some((e) => e.id === value);
      if (checkExist) {
        showError("Sản phẩm đã được chọn!");
        return;
      }
      if (selectedItem) {
        const currentVariant = _.cloneDeep(selectedVariant);
        currentVariant.push({
          ...selectedItem,
          variant_title: selectedItem.name,
          open_quantity: selectedItem.on_hand,
          cost: selectedItem.variant_prices[0].import_price,
          title: selectedItem.product.name,
          price_rule_id: 0,
          variant_id: selectedItem.id,
        });
        entitlementsVariantMap.set(name, selectedVariant);

        setSelectedVariant(_.cloneDeep(entitlementsVariantMap));
      }
    },
    [data, name, entitlementsVariantMap, selectedVariant, setSelectedVariant]
  );

  const onPickManyProduct = (items: Array<VariantResponse>) => {
    console.log(items, selectedVariant);
    if (items.length) {
      entitlementsVariantMap.set(name, _.uniqBy([...selectedVariant, ...items], "id"));
      setSelectedVariant(_.cloneDeep(entitlementsVariantMap));
    }
    setVisibleManyProduct(false);
  }

  const onDeleteItem = (index: number, variantId: number) => {
    const entitlementForm: Array<any> = form.getFieldValue("entitlements");
    console.log(entitlementForm)
    selectedVariant.splice(index, 1);

    entitlementsVariantMap.set(name, [...selectedVariant]);
    setSelectedVariant(_.cloneDeep(entitlementsVariantMap));

    entitlementForm[name].entitled_variant_ids.filter((e: number) => e !== variantId);
  }

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
            <NumberInput min={0} />
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
                  key={`${key}-discount`}
                  style={{ textAlign: "end", borderRadius: "0px", width: '100%' }}
                  min={1}
                  max={discountType === "FIXED_AMOUNT" ? 999999999 : 100}
                  step={discountType === "FIXED_AMOUNT" ? 1 : 0.01}
                  formatter={(value) => formatDiscountValue(value)}

                />
              </Form.Item>
            </DiscountMethodStyled>
            <Form.Item name={[name, "prerequisite_quantity_ranges", 0, "value_type"]} label=" ">
              <Select
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
                {discountUnit()?.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
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
                onSearch={onSearch}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%" }}
                onSelect={onSelectProduct}
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
                dataIndex: "cost",
                render: (value, item) => {
                  if (value) {
                    // price at create time
                    return formatCurrency(value);
                  }
                  if (item?.variant_prices?.length > 0) {
                    // price at update time
                    return formatCurrency(item?.variant_prices[0]?.import_price)
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
                    onClick={() => onDeleteItem(index, item.id)}
                    className="product-item-delete"
                    icon={<AiOutlineClose />}
                  />
                ),
              },
            ]}
            dataSource={selectedVariant}
            tableLayout="fixed"
            pagination={false}
          />

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

export default FixedPriceGroupUpdate;
