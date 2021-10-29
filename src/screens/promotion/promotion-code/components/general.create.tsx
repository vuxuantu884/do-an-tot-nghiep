import {
  Card, Col, Row,
  Form, Switch, Space, Select,
  DatePicker, Divider, Checkbox,
  TimePicker, Input, Tag, Table, Button
} from "antd";
import "../promotion-code.scss"
import React, {useMemo, useState} from "react";
import ChooseDiscount from "./choose-discount.create";
import CustomInput from "component/custom/custom-input";
import { SearchOutlined } from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { ColumnsType } from "antd/es/table/interface";
import { AiOutlineClose } from "react-icons/ai";
import NumberInput from "component/custom/number-input.custom";

const DateRangePicker = DatePicker.RangePicker;
const TimeRangePicker = TimePicker.RangePicker;
const Option = Select.Option


const GeneralCreate = (props: any) => {
  const { form } = props;

  const [showTimeAdvance, setShowTimeAdvance] = useState(false)
  const [allStore, setAllStore] = useState(false)
  const [allChannel, setAllChannel] = useState(false)
  const [allSource, setAllSource] = useState(false)
  const [allCustomer, setAllCustomer] = useState(false)
  const [disabledEndDate, setDisabledEndDate] = useState(false)
  const [type, setType] = useState("")
  const [product, setProduct] = useState<string>("")
  const [dataTableProduct, setDataTableProduct] = useState<Array<any> | any>([] as Array<any>);
  const [dataTableProductCate, setDataTableProductCate] = useState<Array<any> | any>([] as Array<any>);

  useMemo(() => {
    form.setFieldsValue({
      customer_selection: allCustomer
    })
  }, [allCustomer])

  const getDays = () => {
    let days = [];
    for (let i = 1; i <= 31; i++) {
      days.push({key: `${i}`, value: `Ngày ${i}`})
    }
    return days;
  }

  function tagRender(props: any) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="primary-bg"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        {label}
      </Tag>
    );
  }
  const listCategory: Array<BaseBootstrapResponse> = [
    {
      value: "Áo phông nam",
      name: "Áo phông nam",
    },
    {
      value: "Chân váy nữ",
      name: "Chân váy nữ",
    }
  ]

  const columnsProduct: ColumnsType<any> = [
    {
      title: "Sản phẩm",
      dataIndex: "on_hand",
      align: "center",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Số lượng tối thiểu",
      dataIndex: "available",
      align: "center",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "",
      fixed: dataTableProduct.length !== 0 && "right",
      width: 50,
      render: (_: string, row) => (
        <Button
          onClick={() => onDeleteItemProduct(row.id)}
          className="product-item-delete"
          icon={<AiOutlineClose />}
        />
      ),
    },
  ];
  function onDeleteItemProduct(id: number) {
    // delete row
    const temps = [...dataTableProduct];
    temps.forEach((row, index, array) => {
      if (row.id === id) {
        array.splice(index, 1);
      }
    });
    setDataTableProduct(temps);
  }

  const columnsProductCategory: ColumnsType<any> = [
    {
      title: "Danh mục",
      dataIndex: "on_hand",
      align: "center",
      width: 100,
      render: (value) => {
        return value || "";
      },
    },
    {
      title: "Số lượng tối thiểu",
      dataIndex: "available",
      align: "center",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "",
      fixed: dataTableProduct.length !== 0 && "right",
      width: 50,
      render: (_: string, row) => (
        <Button
          onClick={() => onDeleteItemProductCate(row.id)}
          className="product-item-delete"
          icon={<AiOutlineClose />}
        />
      ),
    },
  ];
  function onDeleteItemProductCate(id: number) {
    // delete row
    const temps = [...dataTableProductCate];
    temps.forEach((row, index, array) => {
      if (row.id === id) {
        array.splice(index, 1);
      }
    });
    setDataTableProductCate(temps);
  }

  return (
    <Row gutter={24} className="general-info">
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
          <Row gutter={30}>
            <Col span={12}>
              <CustomInput
                name="title"
                label={<b>Tên đợt phát hàng: </b>}
                form={form}
                message="Cần nhập tên khuyên mại"
                placeholder="Nhập tên đợt phát hàng"
                isRequired={true}
                maxLength={255}
              />
            </Col>
            <Col span={12}>
              <CustomInput
                name="discount_code"
                label={<b>Mã đợt phát hàng: </b>}
                form={form}
                message="Vui lòng nhập mã đợt phát hàng"
                placeholder="Nhập mã đợt phát hàng"
                maxLength={20}
              />
            </Col>
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
          <Row gutter={30}>
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
                  <Option value={"SALE_CODE"}>Mã giảm giá</Option>
                  <Option value={"GIFT_CODE"}>Mã quà tặng</Option>
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
          <Row gutter={30}>
            <Col span={12}>
              <Form.Item name="mobile" label="Đơn hàng có giá trị từ:">
                <NumberInput
                  style={{
                    textAlign: "right",
                    width: "100%",
                    color: "#222222",
                  }}
                  minLength={0}
                  // value={}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="product"
                label={<b>Áp dụng cho:</b>}
              >
                <Select defaultValue="" onChange={(value) => setProduct(value)}>
                <Option value={"CHOOSE_OPTION"}>Chọn điều kiện</Option>
                  <Option value={"PRODUCT"}>Sản phẩm</Option>
                  <Option value={"CATEGORY_PRODUCT"}>Danh mục sản phẩm</Option>
                </Select>
              </Form.Item>
            </Col>
            {product === "PRODUCT" && 
              <>
                <Col span={18}>
                  <Form.Item name="request">
                    <Input
                      style={{ width: "100%" }}
                      prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                      placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item>
                    <Checkbox> Tất cả sản phẩm </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Table
                    className="inventory-table"
                    rowClassName="product-table-row"
                    tableLayout="fixed"
                    scroll={{ y: 300 }}
                    pagination={false}
                    columns={columnsProduct}
                    loading={false}
                    dataSource={[]}
                  />
                </Col>
              </>
            }
            {product === "CATEGORY_PRODUCT" && 
              <>
                <Col span={24}>
                  <Form.Item>
                  <CustomSelect
                    showSearch
                    optionFilterProp="children"
                    showArrow
                    placeholder="Chọn danh mục"
                    allowClear
                    tagRender={tagRender}
                    style={{
                      width: "100%",
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                  >
                    {listCategory?.map((item) => (
                      <CustomSelect.Option key={item.value} value={item.value}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Table
                    className="inventory-table"
                    rowClassName="product-table-row"
                    tableLayout="fixed"
                    scroll={{ y: 300 }}
                    pagination={false}
                    columns={columnsProductCategory}
                    loading={false}
                    dataSource={[]}
                  />
                </Col>
              </>
            }
          </Row>
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_duration"
                label={<b>Thời gian áp dụng:</b>}
                rules={[{required: true, message: "Vui lòng chọn thời gian áp dụng"}]}
              >
                <DateRangePicker
                  disabled={[false, disabledEndDate]}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  style={{width: "100%"}}
                />

              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  setDisabledEndDate(value);
                  if (value) {
                    form.setFieldsValue({
                      prerequisite_duration: [form.getFieldsValue()['prerequisite_duration']?.[0], null]
                    })
                  }
                }}/>
                {"Không cần ngày kết thúc"}
              </Space>
              <Divider/>
              <Space direction="horizontal">
                <Checkbox
                  defaultChecked={false}
                  onChange={(value) => setShowTimeAdvance(value.target.checked)}
                  style={{paddingBottom: "20px"}}
                >
                  Hiển thị nâng cao
                </Checkbox>
              </Space>
            </Col>
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
                  <Option value={"SUN"}>Chủ nhật</Option>
                  <Option value={"MON"}>Thứ 2</Option>
                  <Option value={"TUE"}>Thứ 3</Option>
                  <Option value={"WED"}>Thứ 4</Option>
                  <Option value={"THU"}>Thứ 5</Option>
                  <Option value={"FRI"}>Thứ 6</Option>
                  <Option value={"SAT"}>Thứ 7</Option>
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
                  {getDays().map(day => <Option value={day.key}>{day.value}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row> : null}
        </Card>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_store_ids"
                label={<b>Cửa hàng áp dụng:</b>}
                rules={[{required: !allStore, message: "Vui lòng chọn cửa hàng áp dụng"}]}
              >
                <Select disabled={allStore} placeholder="Chọn chi nhánh" mode="multiple">
                  <Option value="CH1">Cửa hàng 1</Option>
                  <Option value="CH2">Cửa hàng 2</Option>
                  <Option value="CH3">Cửa hàng 3</Option>
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  setAllStore(value)
                  form.validateFields(['prerequisite_store_ids'])
                }}/>
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_sales_channel_names"
                label={<b>Kênh bán hàng áp dụng:</b>}
                rules={[{required: !allChannel, message: "Vui lòng chọn kênh bán hàng áp dụng"}]}
              >
                <Select disabled={allChannel} placeholder="Chọn kênh bán hàng" mode="multiple">
                  <Option value="ADMIN">ADMIN</Option>
                  <Option value="POS">POS</Option>
                  <Option value="WEB">WEB</Option>
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
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_order_sources_ids"
                label={<b>Nguồn đơn hàng áp dụng:</b>}
                rules={[{required: !allSource, message: "Vui lòng chọn nguồn bán hàng áp dụng"}]}
              >
                <Select disabled={allSource} placeholder="Chọn nguồn đơn hàng" mode="multiple">
                  <Option value="LAZADA">LAZADA</Option>
                  <Option value="SHOPEE">SHOPEE</Option>
                  <Option value="SENDO">SENDO</Option>
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  form.validateFields(['prerequisite_order_sources_ids'])
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
