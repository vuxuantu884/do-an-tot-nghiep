import { CloseOutlined } from "@ant-design/icons";
import {
  Card,
  Checkbox,
  Col,
  DatePicker, Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Table,
  TimePicker
} from "antd";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import CustomInput from "component/custom/custom-input";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import moment from "moment";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { CustomerContitionFormlStyle } from "screens/promotion/shared/condition.style";
import ProductItem from "screens/purchase-order/component/product-item";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { showError } from "utils/ToastUtils";
import { DATE_FORMAT } from "../../../../utils/DateUtils";
import CustomerFilter from "../../shared/cusomer-condition.form";
import { IssuingContext } from "../issuing-provider";
import "../promo-code.scss";
import ChooseDiscount from "./choose-discount.create";

const TimeRangePicker = TimePicker.RangePicker;
const Option = Select.Option;

const GeneralCreate = (props: any) => {
  const {
    form,
    listStore,
    listSource,
    listChannel,
  } = props;

  const dispatch = useDispatch();

  const [showTimeAdvance] = useState(false);
  const [allStore, setAllStore] = useState(true);
  const [allChannel, setAllChannel] = useState(true);
  const [allSource, setAllSource] = useState(true);
  const [type, setType] = useState("SALE_CODE");
  const [product, setProduct] = useState<string>("PRODUCT");
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Array<any>>([]);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [prerequisiteSubtotal, setPrerequisiteSubtotal] = useState<any>();
  const { isAllProduct, setIsAllProduct } = useContext(IssuingContext);

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

  const getDays = () => {
    let days = [];
    for (let i = 1; i <= 31; i++) {
      days.push({ key: `${i}`, value: `Ngày ${i}` });
    }
    return days;
  };

  const onResultSearch = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!result) {
        setData([]);
      } else {
        setData(result.items);
      }
    },
    [],
  );

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
            onResultSearch,
          ),
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch],
  );

  const onSelectProduct = useCallback(
    (value) => {
      const selectedItem = data.find(e => e.id === Number(value));
      const checkExist = selectedProduct.some((e) => e.id === value);
      if (checkExist) {
        showError("Sản phẩm đã được chọn!");
        return;
      }
      if (selectedItem) {
        setSelectedProduct([selectedItem].concat(selectedProduct));
      }
      // setData([]);
    },
    [data, selectedProduct],
  );

  const onDeleteItem = useCallback(
    (index: number) => {
      selectedProduct.splice(index, 1);
      setSelectedProduct([...selectedProduct]);
    },
    [selectedProduct],
  );



  useEffect(() => {
    let entitlements: any[] = [];
    selectedProduct && selectedProduct.forEach((item) => {
      entitlements.push({
        entitled_variant_ids: [item.id],
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [{
          greater_than_or_equal_to: null,
          less_than_or_equal_to: null,
          allocation_limit: null,
          value_type: "",
          value: 0,
        }],
        prerequisite_subtotal_ranges: null,
      });
    });
    form.setFieldsValue({ entitlements: entitlements });
  }, [form, selectedProduct]);

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
    }
  }, [form, isAllProduct]);

  return (
    <Row gutter={24} className="general-info">
      {/* right side */}
      <Col span={18}>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN CHUNG</span>
            </div>
          }
        >
          <Row gutter={30} style={{ padding: "0px 16px" }}>

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

            <Col span={12}>
              <Form.Item
                name="discount_code"
                label="Mã đợt phát hành:"
                normalize={(value) => nonAccentVietnamese(value)}
              >
                <Input maxLength={20} disabled={true} />
              </Form.Item>
            </Col>

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
          <Row gutter={30} style={{ padding: "0px 16px" }}>
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

                </Select>
              </Form.Item>
            </Col>
            {type === "SALE_CODE" && <ChooseDiscount form={form} />}
          </Row>
        </Card>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">ĐIỀU KIỆN MUA HÀNG</span>
            </div>
          }
        >
          <Row gutter={30} style={{ padding: "0px 16px" }}>
            <Col span={12}>
              <Form.Item
                label="Đơn hàng có giá trị từ:"
                name={"prerequisite_subtotal_range_min"}
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
                  value={prerequisiteSubtotal}
                  onChange={(value: any) => setPrerequisiteSubtotal(value)}
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
                      style={{ width: "100%" }}
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
                      onChange={(value) => {
                        setIsAllProduct(value.target.checked);
                        setSelectedProduct([]);
                      }}
                      checked={isAllProduct}
                    >
                      Tất cả sản phẩm
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="entitlements">
                    {!isAllProduct && <Table
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
                          width: "10%",
                          render: (value: string, item, index: number) => {
                            return (
                              <div>
                                <Form.Item
                                  name={index + `min_value`}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Cần nhập số lượng tối thiếu",
                                    },
                                  ]}
                                >
                                  <NumberInput
                                    onChange={(value) => {
                                      if (selectedProduct) {
                                        let entitlementFields =
                                          form.getFieldValue("entitlements");
                                        let entitlement = entitlementFields.find(
                                          (ele: any) =>
                                            ele.entitled_variant_ids.includes(item.id)
                                        );
                                        entitlement.prerequisite_quantity_ranges[0].greater_than_or_equal_to =
                                          value;
                                        form.setFieldsValue({
                                          entitlements: entitlementFields,
                                        });
                                      }
                                    }}
                                  />
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
                                style={{ fontSize: "22px" }}
                              />
                            </Row>
                          ),
                        },
                      ]}
                      dataSource={selectedProduct}
                      tableLayout="fixed"
                      pagination={false}
                    />}
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        </Card>
      </Col>
      {/* left side */}
      <Col span={6}>
        <CustomerContitionFormlStyle>
          {/* Thời gian áp dụng: */}
          <Card title={
            <span>
              Thời gian áp dụng <span className="required-field">*</span>
            </span>
          }>
            <Row gutter={6}>
              <Col span={12}>
                <Form.Item
                  name="starts_date"
                  rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Từ ngày"
                    showTime={{ format: "HH:mm" }}
                    format={DATE_FORMAT.DDMMYY_HHmm}
                    disabledDate={(currentDate) =>
                      currentDate.isBefore(moment()) ||
                      (form.getFieldValue("ends_date")
                        ? currentDate.valueOf() > form.getFieldValue("ends_date")
                        : false)
                    }
                    showNow={true}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ends_date">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Đến ngày"
                    showTime={{ format: "HH:mm" }}
                    format={DATE_FORMAT.DDMMYY_HHmm}
                    disabledDate={(currentDate) =>
                      currentDate.isBefore(moment()) ||
                      (form.getFieldValue("starts_date") &&
                        currentDate.isBefore(moment(form.getFieldValue("starts_date"))))
                    }
                    showNow={false}
                  />
                </Form.Item>
              </Col>


            </Row>
            {showTimeAdvance ? (
              <Row gutter={12} style={{ padding: "0px 16px" }}>
                <Col span={24}>
                  <Form.Item
                    label={<b>Chỉ áp dụng trong các khung giờ:</b>}
                    name="prerequisite_time"
                  >
                    <TimeRangePicker placeholder={["Từ", "Đến"]} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={<b>Chỉ áp dụng các ngày trong tuần:</b>}
                    name="prerequisite_weekdays"
                  >
                    <Select placeholder="Chọn ngày" mode="multiple">
                      <Option key="SUN" value={"SUN"}>
                        Chủ nhật
                      </Option>
                      <Option key="MON" value={"MON"}>
                        Thứ 2
                      </Option>
                      <Option key="TUE" value={"TUE"}>
                        Thứ 3
                      </Option>
                      <Option key="WED" value={"WED"}>
                        Thứ 4
                      </Option>
                      <Option key="THU" value={"THU"}>
                        Thứ 5
                      </Option>
                      <Option key="FRI" value={"FRI"}>
                        Thứ 6
                      </Option>
                      <Option key="SAT" value={"SAT"}>
                        Thứ 7
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={<b>Chỉ áp dụng các ngày trong tháng:</b>}
                    name="prerequisite_days"
                    style={{ marginBottom: "5px" }}
                  >
                    <Select placeholder="Chọn ngày" mode="multiple">
                      {getDays().map((day) => (
                        <Option key={day.key} value={day.key}>
                          {day.value}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </Card>
          {/* Cửa hàng áp dụng: */}
          <Card title="Cửa hàng áp dụng">
            <Row gutter={12} >
              <Col span={24}>
                <Form.Item name="prerequisite_store_ids" rules={[{ required: !allStore, message: "Vui lòng chọn cửa hàng áp dụng" }]}>
                  <TreeStore
                    form={form}
                    name="prerequisite_store_ids"
                    placeholder="Chọn cửa hàng"
                    listStore={listStore}
                    style={{ width: "100%" }}
                    disabled={allStore}
                  />
                </Form.Item>
                <Space direction="horizontal">
                  <Switch
                    defaultChecked={true}
                    onChange={(value) => {
                      form.setFieldsValue({
                        prerequisite_store_ids: undefined,
                      });
                      form.validateFields(["prerequisite_store_ids"]);
                      setAllStore(value);
                    }}
                  />
                  {"Áp dụng toàn bộ"}
                </Space>
              </Col>
            </Row>
          </Card>
          {/* Kênh bán hàng áp dụng: */}
          <Card title="Kênh bán hàng áp dụng">
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  name="prerequisite_sales_channel_names"
                  rules={[
                    { required: !allChannel, message: "Vui lòng chọn kênh bán hàng áp dụng" },
                  ]}
                >
                  <Select
                    disabled={allChannel}
                    placeholder="Chọn kênh bán hàng"
                    mode="multiple"
                    className="ant-select-selector-min-height"
                  >
                    {listChannel?.map((store: any, index: number) => (
                      <Option key={index} value={store.name}>
                        {store.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Space direction="horizontal">
                  <Switch
                    defaultChecked={true}
                    onChange={(value) => {
                      setAllChannel(value);
                      form.validateFields(["prerequisite_sales_channel_names"]);
                    }}
                  />
                  {"Áp dụng toàn bộ"}
                </Space>
              </Col>
            </Row>
          </Card>
          {/* Nguồn đơn hàng áp dụng: */}
          <Card title="Nguồn đơn hàng áp dụng">
            <Row gutter={12} >
              <Col span={24}>
                <Form.Item
                  name="prerequisite_order_source_ids"
                  rules={[
                    { required: !allSource, message: "Vui lòng chọn nguồn bán hàng áp dụng" },
                  ]}
                >
                  <Select
                    disabled={allSource}
                    placeholder="Chọn nguồn đơn hàng"
                    mode="multiple"
                    className="ant-select-selector-min-height"
                  >
                    {listSource?.map((source: any, index: number) => (
                      <Option key={index} value={source.id}>
                        {source.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Space direction="horizontal">
                  <Switch
                    defaultChecked={true}
                    onChange={(value) => {
                      form.validateFields(["prerequisite_order_source_ids"]);
                      form.setFieldsValue({
                        prerequisite_order_source_ids: undefined,
                      });
                      setAllSource(value);
                    }}
                  />
                  {"Áp dụng toàn bộ"}
                </Space>
              </Col>
            </Row>
          </Card>
          {/* Đối tượng khách hàng áp dụng */}
          <CustomerFilter form={form} />
        </CustomerContitionFormlStyle>
      </Col>
    </Row>
  );
}

export default GeneralCreate;
