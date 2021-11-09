import {
  Card, Col, Row,
  Form, Switch, Space, Select,
  DatePicker, Divider, Checkbox,
  TimePicker, Input, Table, Button, InputNumber,
} from "antd";
import React, {createRef, useCallback, useEffect, useMemo, useState} from "react";
import ChooseDiscount from "./choose-discount.create";
import CustomInput from "component/custom/custom-input";
import NumberInput from "component/custom/number-input.custom";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import ProductItem from "screens/purchase-order/component/product-item";
import UrlConfig from "config/url.config";
import "../promo-code.scss"
import { useDispatch } from "react-redux";
import { AiOutlineClose } from "react-icons/ai";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { VariantResponse } from "model/product/product.model";
import { PageResponse } from "model/base/base-metadata.response";
import { Link } from "react-router-dom";
import {formatCurrency} from "../../../../utils/AppUtils";
import {CloseCircleOutlined, CloseOutlined} from "@ant-design/icons";
import moment from "moment";

const DateRangePicker = DatePicker.RangePicker;
const TimeRangePicker = TimePicker.RangePicker;
const Option = Select.Option

const GeneralCreate = (props: any) => {
  const {
    form,
    listStore,
    listSource,
    // customerAdvanceMsg
  } = props;

  const dispatch = useDispatch();

  const [showTimeAdvance] = useState(false);
  const [allStore, setAllStore] = useState(false);
  const [allChannel, setAllChannel] = useState(false);
  const [allSource, setAllSource] = useState(false);
  const [disabledEndDate, setDisabledEndDate] = useState(false);
  const [type, setType] = useState("SALE_CODE");
  const [product, setProduct] = useState<string>("PRODUCT");
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Array<any>>([]);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [isProduct, setIsProduct] = useState<boolean>(false);
  const [prerequisiteSubtotal, setPrerequisiteSubtotal] = useState<any>();

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()}/>,
        value: item.id,
      });
    });
    return options;
  }, [data]);

  const getDays = () => {
    let days = [];
    for (let i = 1; i <= 31; i++) {
      days.push({key: `${i}`, value: `Ngày ${i}`})
    }
    return days;
  }

  const onResultSearch = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!result) {
        setData([]);
      } else {
        setData(result.items);
      }
    },
    []
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
            onResultSearch
          )
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch]
  );

  const onSelectProduct = useCallback(
    (value) => {
      const selectedItem = data.find(e => e.id === Number(value));
      if (selectedItem) {
        setSelectedProduct([selectedItem].concat(selectedProduct))
      }
      setData([]);
    },
    [data, selectedProduct]
  )

  const onDeleteItem = useCallback(
    (index: number) => {
      selectedProduct.splice(index, 1)
      setSelectedProduct([...selectedProduct])
    },
    [selectedProduct]
  );

  function nonAccentVietnamese(str: string) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str.toUpperCase().replaceAll(/\s/g,'');
  }

  useEffect(() => {
    let entitlements:any[] = [];
    selectedProduct && selectedProduct.forEach((item) => {
      entitlements.push({
        entitled_variant_ids: [item.id],
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [{
          greater_than_or_equal_to: 0,
          less_than_or_equal_to: 0,
          allocation_limit: 0,
          value_type: "",
          value: 0
        }],
        prerequisite_subtotal_ranges: null
      })
    });
    form.setFieldsValue({entitlements: entitlements})
  }, [form, selectedProduct])

  useEffect(() => {
    if (isProduct) {
      let entitlements = [{
        entitled_variant_ids: null,
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [{
          greater_than_or_equal_to: 0,
          less_than_or_equal_to: 0,
          allocation_limit: 0,
          value_type: "",
          value: 0
        }],
        prerequisite_subtotal_ranges: null
      }];
      form.setFieldsValue({entitlements: entitlements})
    }
  }, [form, isProduct])

  return (
    <Row gutter={24} className="general-info">
      {/* right side */}
      <Col span={18}>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">
                THÔNG TIN CHUNG
              </span>
            </div>
          }
        >
          <Row gutter={30} style={{padding: "0px 16px"}}>
            {/* Tên đợt phát hàng */}
            <Col span={12}>
              <CustomInput
                name="title"
                label={<b>Tên đợt phát hàng: </b>}
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
                <Input maxLength={20} disabled={true}/>
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

              />
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={30} style={{padding: "0px 16px"}}>
            {/* Loại khuyến mãi */}
            <Col span={24}>
              <Form.Item
                name="sale_type"
                label={<b>Loại khuyến mãi</b>}
              >
                <Select
                  showArrow
                  placeholder="Chọn loại mã khuyến mãi"
                  onChange={(value: string) => setType(value)}
                >
                  <Option key="SALE_CODE" value={"SALE_CODE"}>Mã giảm giá</Option>
                  {/* <Option value={"GIFT_CODE"}>Mã quà tặng</Option> */}
                </Select>
              </Form.Item>
            </Col>
            {type === 'SALE_CODE' && <ChooseDiscount form={form}/>}
          </Row>
        </Card>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">
                ĐIỀU KIỆN MUA HÀNG
              </span>
            </div>
          }
        >
          <Row gutter={30} style={{padding: "0px 16px"}}>
            <Col span={12}>
              <Form.Item label="Đơn hàng có giá trị từ:" name={"prerequisite_subtotal_range_min"}>
                <InputNumber
                  style={{
                    textAlign: "right",
                    width: "100%",
                    color: "#222222",
                  }}
                  minLength={0}
                  maxLength={11}
                  value={prerequisiteSubtotal}
                  onChange={(value: any) => setPrerequisiteSubtotal(value)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="product_type"
                label={<b>Áp dụng cho:</b>}
              >
                <Select onChange={(value: string) => setProduct(value)}>
                {/* <Option value={"CHOOSE_OPTION"}>Chọn điều kiện</Option> */}
                  <Option key="PRODUCT" value={"PRODUCT"}>Sản phẩm</Option>
                  {/* <Option value={"CATEGORY_PRODUCT"}>Danh mục sản phẩm</Option> */}
                </Select>
              </Form.Item>
            </Col>
            {product === "PRODUCT" &&
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
                      disabled={isProduct}
                      textEmpty={"Không có kết quả"}
                    />
                  </Input.Group>
                </Col>
                <Col span={6}>
                  <Form.Item>
                    <Checkbox onChange={(value) => {
                      setIsProduct(value.target.checked);
                      setSelectedProduct([]);
                    }}> Tất cả sản phẩm </Checkbox>
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
                          align: 'left',
                          width: "40%",
                          render: (
                            value: string,
                            item,
                            index: number
                          ) => {
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
                          align: 'center',
                          width: "20%",
                          render: (
                            value: string,
                            item,
                            index: number
                          ) => {
                            return (
                              <div>
                                  <NumberInput onChange={(value) => {
                                    if(selectedProduct) {
                                      let entitlementFields = form.getFieldValue('entitlements');
                                      let entitlement = entitlementFields.find((ele: any) => ele.entitled_variant_ids.includes(item.id));
                                      entitlement.prerequisite_quantity_ranges[0].greater_than_or_equal_to = value;
                                      form.setFieldsValue({entitlements: entitlementFields})
                                    }
                                  }}/>
                              </div>
                            );
                          },
                        },
                        {
                          className: "ant-col-info",
                          align: 'right',
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
                        }
                      ]}
                      dataSource={selectedProduct}
                      tableLayout="fixed"
                      pagination={false}
                    />
                  </Form.Item>
                </Col>
              </>
            }
          </Row>
        </Card>
      </Col>
      {/* left side */}
      <Col span={6}>
        {/* Thời gian áp dụng: */}
        <Card>
          <Row gutter={6} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <div className="ant-col ant-form-item-label" style={{width: '100%'}}>
                <label htmlFor="discount_add_starts_date" className="ant-form-item-required">
                  <b>Thời gian áp dụng:</b>
                </label>
              </div>
            </Col>
            <Col span={12}>
              <Form.Item
                name="starts_date"
                rules={[{required: true, message: "Vui lòng chọn thời gian áp dụng"}]}
              >
                <DatePicker
                  style={{width: "100%"}}
                  placeholder="Từ ngày"
                  showNow
                  disabledDate={(currentDate) => currentDate <= moment().subtract(1, 'days')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ends_date">
                <DatePicker
                  disabled={disabledEndDate}
                  style={{width: "100%"}}
                  placeholder="Đến ngày"
                  disabledDate={(currentDate) => currentDate.valueOf() < form.getFieldValue("starts_date")}
                />
              </Form.Item>
            </Col>
            <Space direction="horizontal">
              <Switch onChange={value => {
                if (value) {
                  form.resetFields(['ends_date'])
                }
                setDisabledEndDate(value)
              }}/>
              {"Không cần ngày kết thúc"}
            </Space>
            <Divider/>
            <Space direction="horizontal">
              <Checkbox
                defaultChecked={false}
                // onChange={(value) => setShowTimeAdvance(value.target.checked)}
                style={{paddingBottom: "20px"}}
              >
                Hiển thị nâng cao
              </Checkbox>
            </Space>
          </Row>
          {showTimeAdvance ? <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                label={<b>Chỉ áp dụng trong các khung giờ:</b>}
                name="prerequisite_time"
              >
                <TimeRangePicker placeholder={["Từ", "Đến"]} style={{width: "100%"}}/>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={<b>Chỉ áp dụng các ngày trong tuần:</b>}
                name="prerequisite_weekdays"
              >
                <Select placeholder="Chọn ngày" mode="multiple">
                  <Option key="SUN" value={"SUN"}>Chủ nhật</Option>
                  <Option key="MON" value={"MON"}>Thứ 2</Option>
                  <Option key="TUE" value={"TUE"}>Thứ 3</Option>
                  <Option key="WED" value={"WED"}>Thứ 4</Option>
                  <Option key="THU" value={"THU"}>Thứ 5</Option>
                  <Option key="FRI" value={"FRI"}>Thứ 6</Option>
                  <Option key="SAT" value={"SAT"}>Thứ 7</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={<b>Chỉ áp dụng các ngày trong tháng:</b>}
                name="prerequisite_days"
                style={{marginBottom: "5px"}}
              >

                <Select placeholder="Chọn ngày" mode="multiple">
                  {getDays().map(day => <Option key={day.key} value={day.key}>{day.value}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row> : null}
        </Card>
        {/* Cửa hàng áp dụng: */}
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_store_ids"
                label={<b>Cửa hàng áp dụng:</b>}
                rules={[{required: !allStore, message: "Vui lòng chọn cửa hàng áp dụng"}]}
              >
                <Select
                  disabled={allStore}
                  placeholder="Chọn chi nhánh"
                  mode="multiple"
                  className="ant-select-selector-min-height"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {listStore?.map((store: any, index: number) => <Option key={index} value={store.id}>{store.name}</Option>)}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  form.setFieldsValue({
                    prerequisite_store_ids: undefined
                  });
                  form.validateFields(['prerequisite_store_ids'])
                  setAllStore(value)
                }}/>
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        {/* Kênh bán hàng áp dụng: */}
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_sales_channel_names"
                label={<b>Kênh bán hàng áp dụng:</b>}
                rules={[{required: !allChannel, message: "Vui lòng chọn kênh bán hàng áp dụng"}]}
              >
                <Select disabled={allChannel} placeholder="Chọn kênh bán hàng" mode="multiple" className="ant-select-selector-min-height">
                  <Option key="ADMIN" value="ADMIN">ADMIN</Option>
                  <Option key="POS" value="POS">POS</Option>
                  <Option key="WEB" value="WEB">WEB</Option>
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  setAllChannel(value)
                  form.validateFields(['prerequisite_sales_channel_names'])
                }}/>
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        {/* Nguồn đơn hàng áp dụng: */}
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_order_source_ids"
                label={<b>Nguồn đơn hàng áp dụng:</b>}
                rules={[{required: !allSource, message: "Vui lòng chọn nguồn bán hàng áp dụng"}]}
              >
                <Select disabled={allSource} placeholder="Chọn nguồn đơn hàng" mode="multiple" className="ant-select-selector-min-height">
                  {listSource?.map((source: any, index: number) => <Option key={index} value={source.id}>{source.name}</Option>)}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  form.validateFields(['prerequisite_order_source_ids'])
                  form.setFieldsValue({
                    prerequisite_order_source_ids: undefined
                  })
                  setAllSource(value)
                }}/>
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}

export default GeneralCreate;
