import {
  DeleteOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import HashTag from "component/custom/hashtag";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { listColorAction } from "domain/actions/product/color.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { ColorResponse } from "model/product/color.model";
import { MaterialResponse } from "model/product/material.model";
import { ProductRequestView } from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  convertCategory,
  formatCurrency,
  replaceFormatString,
} from "utils/AppUtils";
import { RegUtil } from "utils/RegUtils";
import { StyledComponent } from "./styles";

const { Item, List } = Form;

const initialRequest: ProductRequestView = {
  goods: null,
  category_id: null,
  collections: [],
  code: "",
  name: "",
  width: null,
  height: null,
  length: null,
  length_unit: null,
  weight: null,
  weight_unit: null,
  tags: "",
  unit: null,
  brand: null,
  content: null,
  description: "",
  designer_code: "",
  made_in_id: null,
  merchandiser_code: "",
  preservation: "",
  specifications: "",
  status: "active",
  saleable: true,
  variant_prices: [
    {
      retail_price: "",
      currency: AppConfig.currency,
      import_price: "",
      whole_sale_price: "",
      tax_percent: "0",
    },
  ],
  material_id: null,
  supplier_id: null,
};

const ProductCreateScreen: React.FC = () => {
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  //end hook
  //init
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const brandList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.brand
  );
  const productUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const currencyList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.currency
  );
  const lengthUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.length_unit
  );
  const weightUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.weight_unit
  );
  const initialForm: ProductRequestView = {
    ...initialRequest,
    goods: goods && goods.length > 0 ? goods[0].value : null,
    unit:
      productUnitList && productUnitList.length > 0
        ? productUnitList[0].value
        : null,
    length_unit:
      lengthUnitList && lengthUnitList.length > 0
        ? lengthUnitList[0].value
        : null,
  };
  //end init

  //state
  const isLoadMaterData = useRef(false);
  const [selectedGood, setSelectedGood] = useState<string | null>(
    initialForm.goods
  );
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const categoryFilter = useMemo(() => {
    if (selectedGood === null) {
      return listCategory;
    }
    return listCategory.filter((item) => item.goods === selectedGood);
  }, [listCategory, selectedGood]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [listSize, setListSize] = useState<Array<SizeResponse>>([]);
  const [listColor, setListColor] = useState<Array<ColorResponse>>([]);
  const [listSizeByCategory, setListSizeByCategory] = useState<
    Array<SizeResponse>
  >([]);
  //end category
  //end state

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);

  const onGoodsChange = useCallback((value: string) => {
    setSelectedGood(value);
  }, []);

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return false;
      }
      setAccounts(data.items);
    },
    []
  );

  const onCategoryChange = useCallback(
    (value: number) => {
      let categoryIndex = listCategory.findIndex((item) => item.id === value);
      if (categoryIndex !== -1) {
        form.setFieldsValue({
          code: listCategory[categoryIndex].code,
        });
      }
      
      form.setFieldsValue({
        size: [],
      });
      let listSizeFilter = listSize.filter(
        (item) => item.categories.findIndex((c) => c.category_id === value) > -1
      );
      setListSizeByCategory(listSizeFilter);
    },
    [form, listCategory, listSize]
  );

  useEffect(() => {
    if (!isLoadMaterData.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(SupplierGetAllAction(setListSupplier));
      dispatch(materialSearchAll(setListMaterial));
      dispatch(CountryGetAllAction(setListCountry));
      dispatch(sizeGetAll(setListSize));
      dispatch(listColorAction({ is_main_color: 0 }, setListColor));
      dispatch(
        AccountSearchAction(
          { department_ids: [AppConfig.WIN_DEPARTMENT] },
          setDataAccounts
        )
      );
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [dispatch, setDataAccounts, setDataCategory]);
  return (
    <Form form={form} initialValues={initialForm} layout="vertical">
      <StyledComponent>
        <ContentContainer
          title="Thêm mới sản phẩm"
          breadcrumb={[
            {
              name: "Tổng quản",
              path: UrlConfig.HOME,
            },
            {
              name: "Sản phẩm",
              path: `${UrlConfig.PRODUCT}`,
            },
            {
              name: "Thêm mới",
            },
          ]}
        >
          <Row gutter={24}>
            <Col span={24} md={18}>
              <Card
                className="card"
                title="Thông tin cơ bản"
                extra={
                  <Space size={15}>
                    <Switch className="ant-switch-success" defaultChecked />
                  </Space>
                }
              >
                <div className="padding-20">
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn loại sản phẩm",
                          },
                        ]}
                        tooltip={{
                          title: "Ngành hàng",
                          icon: <InfoCircleOutlined />,
                        }}
                        name="goods"
                        label="Ngành hàng"
                      >
                        <CustomSelect
                          onChange={onGoodsChange}
                          placeholder="Chọn ngành hàng "
                        >
                          {goods?.map((item) => (
                            <CustomSelect.Option
                              key={item.value}
                              value={item.value}
                            >
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn danh mục",
                          },
                        ]}
                        name="category_id"
                        label="Danh mục"
                      >
                        <CustomSelect
                          optionFilterProp="children"
                          showSearch
                          onChange={onCategoryChange}
                          placeholder="Chọn danh mục"
                          suffix={
                            <Button
                              style={{ width: 37, height: 37 }}
                              icon={<PlusOutlined />}
                            />
                          }
                        >
                          {categoryFilter.map((item) => (
                            <CustomSelect.Option key={item.id} value={item.id}>
                              {`${item.code} - ${item.name}`}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mã sản phẩm",
                          },
                          {
                            len: 7,
                            message: "Mã sản phẩm bao gồm 7 kí tự",
                          },
                          {
                            pattern: RegUtil.NO_SPECICAL_CHARACTER,
                            message: "Mã sản phẩm chỉ gồm chữ và số",
                          },
                        ]}
                        tooltip={{
                          title:
                            "Mã sản phẩm bao gồm 3 kí tự đầu mã danh mục và 4 kí tự tiếp theo do người dùng nhập",
                          icon: <InfoCircleOutlined />,
                        }}
                        name="code"
                        label="Mã sản phẩm"
                      >
                        <Input
                          maxLength={7}
                          placeholder="Nhập mã sản phẩm"
                          // onChange={onNameChange}
                        />
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên sản phẩm",
                          },
                          {
                            pattern: RegUtil.STRINGUTF8,
                            message:
                              "Tên sản phẩm không báo gồm kí tự đặc biệt",
                          },
                        ]}
                        tooltip={{
                          title:
                            "Tên sản phẩm không bao gồm các giá trị thuộc tính như màu sắc, chất liệu, kích cỡ...",
                          icon: <InfoCircleOutlined />,
                        }}
                        name="name"
                        label="Tên sản phẩm"
                      >
                        <Input
                          // onChange={onNameChange}
                          maxLength={120}
                          placeholder="Nhập tên sản phẩm"
                        />
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item name="brand" label="Thương hiệu">
                        <CustomSelect placeholder="Chọn thương hiệu">
                          {brandList?.map((item) => (
                            <CustomSelect.Option
                              key={item.value}
                              value={item.value}
                            >
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item name="made_in_id" label="Xuất xứ">
                        <CustomSelect
                          showSearch
                          optionFilterProp="children"
                          placeholder="Chọn xuất xứ"
                        >
                          {listCountry?.map((item) => (
                            <CustomSelect.Option key={item.id} value={item.id}>
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item name="material_id" label="Chất liệu">
                        <CustomSelect
                          showSearch
                          optionFilterProp="children"
                          placeholder="Chọn chất liệu"
                        >
                          {listMaterial?.map((item) => (
                            <CustomSelect.Option
                              key={item.id}
                              value={item.name}
                            >
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item name="unit" label="Đơn vị">
                        <CustomSelect placeholder="Chọn đơn vị">
                          {productUnitList?.map((item) => (
                            <CustomSelect.Option
                              key={item.value}
                              value={item.value}
                            >
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item name="supplier_id" label="Nhà cung cấp">
                        <CustomSelect
                          showSearch
                          optionFilterProp="children"
                          placeholder="Chọn nhà cung cấp"
                        >
                          {listSupplier?.map((item) => (
                            <CustomSelect.Option key={item.id} value={item.id}>
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        tooltip={{
                          title: "Thẻ ngày giúp tìm kiếm các sản phẩm",
                          icon: <InfoCircleOutlined />,
                        }}
                        name="tags"
                        label="Từ khóa"
                      >
                        <HashTag />
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        label="Kích thước (dài, rộng, cao)"
                        tooltip={{
                          title: "Thông tin kích thước khi đóng gói sản phẩm",
                          icon: <InfoCircleOutlined />,
                        }}
                      >
                        <Input.Group compact>
                          <Item name="length" noStyle>
                            <NumberInput
                              isFloat
                              style={{ width: "calc((100% - 100px) / 3)" }}
                              placeholder="Dài"
                            />
                          </Item>
                          <Item name="width" noStyle>
                            <NumberInput
                              isFloat
                              style={{ width: "calc((100% - 100px) / 3)" }}
                              placeholder="Rộng"
                            />
                          </Item>
                          <Item name="height" noStyle>
                            <NumberInput
                              isFloat
                              placeholder="Cao"
                              style={{ width: "calc((100% - 100px) / 3)" }}
                            />
                          </Item>
                          <Item name="length_unit" noStyle>
                            <Select
                              placeholder="Đơn vị"
                              style={{ width: "100px" }}
                            >
                              {lengthUnitList?.map((item) => (
                                <Select.Option
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Item>
                        </Input.Group>
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item
                        required
                        label="Khối lượng"
                        tooltip={{
                          title: "Nhập khối lượng của sản phẩm",
                          icon: <InfoCircleOutlined />,
                        }}
                      >
                        <Input.Group compact>
                          <Item
                            rules={[
                              {
                                required: true,
                                message: "Khối lượng không được để trống",
                              },
                            ]}
                            name="weight"
                            noStyle
                          >
                            <NumberInput
                              isFloat
                              placeholder="Khối lượng"
                              style={{ width: "calc(100% - 100px)" }}
                            />
                          </Item>
                          <Item name="weight_unit" noStyle>
                            <Select
                              placeholder="Đơn vị"
                              style={{ width: "100px" }}
                              value="gram"
                            >
                              {weightUnitList?.map((item) => (
                                <Select.Option
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Item>
                        </Input.Group>
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Collapse
                        ghost
                        expandIcon={({ isActive }) =>
                          isActive ? <MinusOutlined /> : <PlusOutlined />
                        }
                        className="padding-0"
                      >
                        <Collapse.Panel
                          header="Mô tả sản phẩm"
                          key="prDes"
                          className="custom-header"
                        >
                          <Item name="description">
                            <CustomEditor />
                          </Item>
                        </Collapse.Panel>
                      </Collapse>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
            <Col span={24} md={6}>
              <Card className="card" title="Ảnh"></Card>
              <Card className="card" title="Phòng Win">
                <div className="padding-20">
                  <Item
                    name="merchandiser_code"
                    label="Merchandiser"
                    tooltip={{
                      title: "Chọn nhân viên mua hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <CustomSelect
                      optionFilterProp="children"
                      showSearch
                      showArrow
                    >
                      <CustomSelect.Option value="">
                        Chọn Merchandiser
                      </CustomSelect.Option>
                      {accounts.map((item) => (
                        <CustomSelect.Option key={item.code} value={item.code}>
                          {`${item.code} - ${item.full_name}`}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                  <Item
                    name="designer_code"
                    label="Thiết kế"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <CustomSelect
                      optionFilterProp="children"
                      showSearch
                      placeholder="Chọn thiết kế"
                    >
                      <CustomSelect.Option value="">
                        Chọn thiết kế
                      </CustomSelect.Option>
                      {accounts.map((item) => (
                        <CustomSelect.Option key={item.code} value={item.code}>
                          {`${item.code} - ${item.full_name}`}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Card className="card" title="Thông tin giá">
                <div className="padding-20">
                  <List name="variant_prices">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(
                          ({ key, name, fieldKey, ...restField }, index) => (
                            <Row key={key} gutter={16}>
                              <Col md={4}>
                                <Item
                                  label="Giá bán"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Giá bán không được để trống",
                                    },
                                  ]}
                                  name={[name, "retail_price"]}
                                  fieldKey={[fieldKey, "retail_price"]}
                                  tooltip={{
                                    title: (
                                      <div>
                                        <b>Giá bán lẻ</b> là giá mà bạn sẽ bán
                                        sản phẩm này cho những khách hàng đơn
                                        lẻ..
                                      </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                  }}
                                >
                                  <NumberInput
                                    format={(a: string) => formatCurrency(a)}
                                    replace={(a: string) =>
                                      replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                  />
                                </Item>
                              </Col>
                              <Col md={4}>
                                <Item
                                  name={[name, "whole_sale_price"]}
                                  fieldKey={[fieldKey, "whole_sale_price"]}
                                  label="Giá buôn"
                                  tooltip={{
                                    title: () => (
                                      <div>
                                        <b>Giá buôn</b> là giá mà bạn sẽ bán sản
                                        phẩm này cho những khách hàng mua hàng
                                        với số lượng lớn.
                                      </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                  }}
                                >
                                  <NumberInput
                                    format={(a: string) => formatCurrency(a)}
                                    replace={(a: string) =>
                                      replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                  />
                                </Item>
                              </Col>
                              <Col md={4}>
                                <Item
                                  name={[name, "import_price"]}
                                  fieldKey={[fieldKey, "import_price"]}
                                  label="Giá nhập"
                                  tooltip={{
                                    title: () => (
                                      <div>
                                        <b>Giá nhập</b> là giá mà nhập sản phẩm
                                        từ đơn mua hàng của nhà cung cấp.
                                      </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                  }}
                                >
                                  <NumberInput
                                    format={(a: string) => formatCurrency(a)}
                                    replace={(a: string) =>
                                      replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                  />
                                </Item>
                              </Col>
                              <Col md={4}>
                                <Item
                                  label="Đơn vị tiền tệ"
                                  tooltip={{
                                    title: "Tooltip",
                                    icon: <InfoCircleOutlined />,
                                  }}
                                  rules={[
                                    {
                                      required: true,
                                      message:
                                        "Đơn vị tiền tệ không được để trống",
                                    },
                                  ]}
                                  name={[name, "currency"]}
                                  fieldKey={[fieldKey, "currency"]}
                                >
                                  <CustomSelect placeholder="Đơn vị tiền tệ">
                                    {currencyList?.map((item) => (
                                      <CustomSelect.Option
                                        key={item.value}
                                        value={item.value}
                                      >
                                        {item.name}
                                      </CustomSelect.Option>
                                    ))}
                                  </CustomSelect>
                                </Item>
                              </Col>
                              <Col md={4}>
                                <Item
                                  label="Thuế"
                                  name={[name, "tax_percent"]}
                                  fieldKey={[fieldKey, "tax_percent"]}
                                  tooltip={{
                                    title: "Tooltip",
                                    icon: <InfoCircleOutlined />,
                                  }}
                                >
                                  <NumberInput
                                    placeholder="VD: 10"
                                    suffix={<span>%</span>}
                                  />
                                </Item>
                              </Col>
                              {fields.length > 1 && (
                                <Col
                                  md={4}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Button
                                    onClick={() => remove(name)}
                                    icon={<DeleteOutlined />}
                                  />
                                </Col>
                              )}
                            </Row>
                          )
                        )}
                        <Button
                          type="link"
                          className="padding-0"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                        >
                          Thêm mới
                        </Button>
                      </>
                    )}
                  </List>
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Card className="card" title="Tạo phiên bản sản phẩm">
                <div className="padding-20">
                  <Row gutter={50}>
                    <Col span={24} md={12} sm={24}>
                      <Item label="Màu sắc" name="color_id">
                        <CustomSelect
                          notFoundContent={"Không có dữ liệu"}
                          showSearch
                          mode="multiple"
                          optionFilterProp="children"
                          maxTagCount="responsive"
                          showArrow
                          // onChange={onColorChange}
                          placeholder="Chọn màu sắc"
                          suffix={
                            <Button
                              style={{ width: 37, height: 37 }}
                              icon={<PlusOutlined />}
                            />
                          }
                        >
                          {listColor?.map((item) => (
                            <CustomSelect.Option key={item.id} value={item.id}>
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                    <Col span={24} md={12} sm={24}>
                      <Item name="size" label="Kích cỡ">
                        <CustomSelect
                          // onChange={onSizeChange}  
                          notFoundContent={"Không có dữ liệu"}
                          placeholder="Chọn kích cỡ"
                          maxTagCount="responsive"
                          mode="multiple"
                          optionFilterProp="children"
                          showSearch
                          suffix={
                            <Button
                              style={{ width: 37, height: 37 }}
                              icon={<PlusOutlined />}
                            />
                          }
                        >
                          {listSizeByCategory?.map((item) => (
                            <CustomSelect.Option
                              key={item.code}
                              value={item.id}
                            >
                              {item.code}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        </ContentContainer>
      </StyledComponent>
    </Form>
  );
};

export default ProductCreateScreen;
