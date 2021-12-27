import { CloseOutlined } from "@ant-design/icons";
import { Card, Checkbox, Col, Form, Input, InputNumber, Row, Select, Table } from "antd";
import { FormInstance } from "antd/es/form/Form";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import CustomInput from "component/custom/custom-input";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import React, {
  createRef,
  ReactElement,
  useCallback,
  useContext,
  useEffect, useMemo,
  useState
} from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ProductItem from "screens/purchase-order/component/product-item";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { showError } from "utils/ToastUtils";
import { IssuingContext } from "../issuing-provider";
import "../promo-code.scss";
import ChooseDiscount from "./choose-discount.create";
const {Option} = Select;

interface Props {
  form: FormInstance;
  isUnlimitUsagePerUser?: boolean;
  isUnlimitUsage?: boolean;
  selectedProduct: Array<any>;
  typeUnit?: string;
}

function PromoCodeUpdateForm({
  form,
  isUnlimitUsagePerUser,
  isUnlimitUsage,
  selectedProduct: selectedProductFromProps,
  typeUnit
}: Props): ReactElement {
  const dispatch = useDispatch();
  const productSearchRef = createRef<CustomAutoComplete>();

  const [product, setProduct] = useState<string>("PRODUCT");
  const [type, setType] = useState("SALE_CODE");
  // const [isProduct, setIsProduct] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Array<any>>([]);
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const { isAllProduct, setIsAllProduct } = useContext(IssuingContext);


  const onDeleteItem = (index: number) => {
    //delete item in form data
    const entitlements = form.getFieldValue("entitlements");
    entitlements.splice(index, 1);
    form.setFieldsValue({
      entitlements,
    });
    // delete item in state => render
    setSelectedProduct((prev) => {
      prev.splice(index, 1);
      return [...prev];
    });
  };

  const onResultSearch = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!result) {
      setData([]);
    } else {
      setData(result.items);
    }
  }, []);

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
  const onSelectProduct = (value: string) => {
    const selectedItem = data.find((e) => e.id === Number(value));
    const checkExist = selectedProduct.some((e) => e.id === value);
    if (checkExist) {
      showError("Sản phẩm đã được chọn!");
      return;
    }
    if (selectedItem) {
      const entitlements = form.getFieldValue("entitlements");
      
      entitlements.unshift({
        entitled_variant_ids: [selectedItem.id],
        prerequisite_quantity_ranges: [
          {
            greater_than_or_equal_to: 0,
            less_than_or_equal_to: null,
            allocation_limit: null,
          },
        ],
        prerequisite_subtotal_ranges: null,
      });
      form.setFieldsValue({
        entitlements,
      });
      setSelectedProduct((prev) => [selectedItem, ...prev]);
    }
  };

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

  useEffect(() => {
    setSelectedProduct(selectedProductFromProps);
  }, [selectedProductFromProps]);

  useEffect(() => {
    if (isAllProduct) {
      let entitlements = [{
        entitled_variant_ids: null,
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [{
          greater_than_or_equal_to: null,
          less_than_or_equal_to: null,
          allocation_limit: null,
          value_type: "",
          value: 0,
        }],
        prerequisite_subtotal_ranges: null,
      }];
      form.setFieldsValue({ entitlements: entitlements });
    }else{
      form.setFieldsValue({ entitlements: [] });
    }
  }, [form, isAllProduct]);
  return (
    <div>
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN CHUNG</span>
          </div>
        }
      >
        <Row gutter={30} style={{padding: "0px 16px"}}>
          {/* Tên đợt phát hàng */}
          <Col span={12}>
            <CustomInput
              name="title"
              label={<b>Tên đợt phát hành: </b>}
              form={form}
              message="Cần nhập tên khuyến mại"
              placeholder="Nhập tên đợt phát hàng"
              isRequired={true}
              maxLength={255}
            />
          </Col>
          {/* Mã đợt phát hàng */}
          <Col span={12}>
            <Form.Item
              name="discount_code"
              label="Mã đợt phát hành:"
              // rules={[
              //   {required: true, message: 'Vui lòng nhập mã đợt phát hành'},
              // ]}
              normalize={(value) => nonAccentVietnamese(value)}
            >
              <Input maxLength={20} disabled={true} />
            </Form.Item>
          </Col>
          {/* Mô tả */}
          <Col span={24}>
            <CustomInput
              type="textarea"
              name="description"
              label={<b>Mô tả: </b>}
              form={form}
              placeholder="Nhập mô tả cho đợt phát hàng"
              maxLength={500}
              autoFocus
            />
          </Col>
        </Row>
      </Card>
      <Card>
        <Row gutter={30} style={{padding: "0px 16px"}}>
          {/* Loại khuyến mãi */}
          <Col span={24}>
            <Form.Item name="sale_type" label={<b>Loại khuyến mãi</b>}>
              <Select
                showArrow
                placeholder="Chọn loại mã khuyến mãi"
                onChange={(value: string) => setType(value)}
              >
                <Option key="SALE_CODE" value={"SALE_CODE"}>
                  Mã giảm giá
                </Option>
                {/* <Option value={"GIFT_CODE"}>Mã quà tặng</Option> */}
              </Select>
            </Form.Item>
          </Col>
          {type === "SALE_CODE" && (
            <ChooseDiscount
              form={form}
              isUnlimitUsage={isUnlimitUsage}
              isUnlimitUsagePerUser={isUnlimitUsagePerUser}
              typeUnit={typeUnit}
            />
          )}
        </Row>
      </Card>
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">ĐIỀU KIỆN MUA HÀNG</span>
          </div>
        }
      >
        <Row gutter={30} style={{padding: "0px 16px"}}>
          <Col span={12}>
            <Form.Item
              label="Đơn hàng có giá trị từ:"
              name={["prerequisite_subtotal_range", "greater_than_or_equal_to"]}
            >
              <InputNumber
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={11}
                minLength={0}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="product_type" label={<b>Áp dụng cho:</b>}>
              <Select onChange={(value: string) => setProduct(value)}>
                {/* <Option value={"CHOOSE_OPTION"}>Chọn điều kiện</Option> */}
                <Option key="PRODUCT" value={"PRODUCT"}>
                  Sản phẩm
                </Option>
                {/* <Option value={"CATEGORY_PRODUCT"}>Danh mục sản phẩm</Option> */}
              </Select>
            </Form.Item>
          </Col>
          {product === "PRODUCT" && (
            <>
              <Col span={18}>
                <Input.Group className="display-flex">
                  <CustomAutoComplete
                    key={`product_search`}
                    id="#product_search"
                    dropdownClassName="product"
                    placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch, ..."
                    onSearch={onSearch}
                    dropdownMatchSelectWidth={456}
                    style={{width: "100%"}}
                    onSelect={onSelectProduct}
                    options={renderResult}
                    ref={productSearchRef}
                    disabled={isAllProduct}
                    textEmpty={"Không có kết quả"}
                  />
                </Input.Group>
              </Col>
              <Col span={6}>
                <Form.Item>
                  <Checkbox
                    checked={isAllProduct}
                    onChange={(value) => {
                      setIsAllProduct(value.target.checked);
                      setSelectedProduct([]);
                    }}
                  >
                    Tất cả sản phẩm 
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="entitlements">
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
                        width: "40%",
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
                                  <span className="product-item-name-detail">
                                    {item.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        title: "Số lượng tối thiểu",
                        className: "ant-col-info",
                        align: "center",
                        dataIndex: "greater_than_or_equal_to",
                        width: "10%",
                        render: (value: number, item: any, index: number) => {
                          return (
                            <div>
                              <Form.Item
                                name={[
                                  "entitlements",
                                  index,
                                  "prerequisite_quantity_ranges",
                                  0,
                                  "greater_than_or_equal_to",
                                ]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Cần nhập số lượng tối thiếu",
                                  },
                                ]}
                              >
                                <NumberInput />
                              </Form.Item>
                            </div>
                          );
                        },
                      },
                      {
                        className: "ant-col-info",
                        align: "right",
                        width: "10%",
                        render: (value: string, item, index: number) => (
                          <Row justify={"center"}>
                            <CloseOutlined
                              onClick={() => onDeleteItem(index)}
                              className="product-item-delete"
                              style={{fontSize: "22px"}}
                            />
                          </Row>
                        ),
                      },
                    ]}
                    dataSource={selectedProduct}
                    tableLayout="fixed"
                    pagination={false}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Card>
    </div>
  );
}

export default PromoCodeUpdateForm;
