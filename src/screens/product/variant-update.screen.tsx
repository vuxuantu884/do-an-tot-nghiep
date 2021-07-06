import { AppConfig } from "config/AppConfig";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import {
  variantDetailAction,
  variantUpdateAction,
} from "domain/actions/product/products.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { listColorAction } from "domain/actions/product/color.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { ColorResponse } from "model/product/color.model";
import { MaterialResponse } from "model/product/material.model";
import {
  VariantPriceRequest,
  VariantResponse,
  VariantUpdateRequest,
  VariantUpdateView,
} from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
  convertCategory,
  formatCurrency,
  Products,
  replaceFormatString,
} from "utils/AppUtils";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import CustomEditor from "component/custom-editor";
import NumberInput from "component/custom/number-input.custom";
import { useMemo } from "react";
import { createRef } from "react";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { showSuccess } from "utils/ToastUtils";

type VariantUpdateParam = {
  id: string;
};

const { Item, List } = Form;
const { Option } = Select;

const VariantUpdateScreen: React.FC = () => {
  const { id } = useParams<VariantUpdateParam>();
  const idNumber = parseInt(id);
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //Get master data
  const isLoadMaterData = useRef(false);
  const productTypes = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_type
  );
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const collectionList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.collection
  );
  const brandList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.brand
  );
  const productUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const lengthUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.length_unit
  );
  const weightUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.weight_unit
  );
  const currencyList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.currency
  );
  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status
  );
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [listSize, setListSize] = useState<Array<SizeResponse>>([]);
  const [listColor, setListColor] = useState<Array<ColorResponse>>([]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  //End get master data
  //state
  const formRef = createRef<FormInstance>();
  const [detail, setDetail] = useState<VariantUpdateView | null>(null);
  const [status, setStatus] = useState<string>("active");
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<boolean>(false);
  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    let index = productStatusList?.findIndex((item) => item.value === status);
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [productStatusList, status]);
  //end state
  //callback data
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);
  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);
  const setData = useCallback((data: VariantResponse) => {
    let temp: VariantUpdateView = Products.convertVariantRequestToView(data);
    setDetail(temp);
    setStatus(temp.status);
  }, []);
  //end callback data
  //functional
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const onGetDetail = useCallback(
    (detail: VariantResponse | null) => {
      if (detail == null) {
        setError(true);
      } else {
        setLoading(false);
        setData(detail);
      }
    },
    [setData]
  );
  const onSuccess = useCallback(
    (result: VariantResponse) => {
      if (result) {
        history.push(UrlConfig.PRODUCT);
        showSuccess("Cập nhật dữ liệu thành công");
      } else {
        setLoadingSaveButton(false);
      }
    },
    [history]
  );
  const onFinish = useCallback(
    (values: VariantUpdateView) => {
      debugger;
      setLoadingSaveButton(true);
      // let request = Products.convertProductViewToRequest(
      //   values,
      //   variants,
      //   status
      // );

      let vartiantPriceReqeust: Array<VariantPriceRequest> =
        Products.convertVariantPriceViewToRequest(values.variant_prices);
      let dataRequest: VariantUpdateRequest = {
        id: values.id,
        name: values.name,
        barcode: values.barcode,
        color_id: values.color_id,
        composite: false,
        height: values.height,
        length: values.length,
        length_unit: values.length_unit,
        product_id: values.product_id,
        saleable: values.saleable,
        size_id: values.size_id,
        sku: values.sku,
        taxable: values.taxable,
        status: status,
        deleted: false,
        supplier_id: values.supplier_id,
        width: values.width,
        weight: values.weight,
        weight_unit: values.weight_unit,
        variant_prices: vartiantPriceReqeust,
        variant_images: values.variant_image,
      };
      dispatch(variantUpdateAction(values.id, dataRequest, onSuccess));
    },
    [dispatch, onSuccess]
  );

  //end functional
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
      if (!isNaN(idNumber)) {
        dispatch(variantDetailAction(idNumber, onGetDetail));
      } else {
        setError(true);
      }
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [
    dispatch,
    idNumber,
    onGetDetail,
    setData,
    setDataAccounts,
    setDataCategory,
  ]);
  return (
    <ContentContainer
      title="Sửa biến thể"
      isError={isError}
      breadcrumb={[
        {
          name: "Tổng quản",
          path: "/",
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Sửa biến thể",
        },
      ]}
      isLoading={isLoading}
    >
      {detail !== null && (
        <Form
          ref={formRef}
          initialValues={detail}
          layout="vertical"
          onFinish={onFinish}
        >
          <Card
            title="Thông tin chi tiết"
            extra={[
              <Space key="status" size={15}>
                <label className="text-default">Trạng thái</label>
                <Switch
                  className="ant-switch-success"
                  checked={status === "active"}
                  onChange={(checked) => {
                    setStatus(checked ? "active" : "inactive");
                  }}
                />
                <label
                  className={
                    status === "active" ? "text-success" : "text-error"
                  }
                >
                  {statusValue}
                </label>
              </Space>,
            ]}
          >
            <div className="padding-20">
              <Item hidden name="id">
                <Input />
              </Item>
              <Item hidden name="product_id">
                <Input />
              </Item>
              <Item hidden name="variant_images">
                <Input />
              </Item>
              <Row gutter={50}>
                <Col md={8}>
                  <Item
                    label="Mã sản phẩm"
                    required
                    name="sku"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <Input placeholder="VD: APN0000" />
                  </Item>
                </Col>
                <Col md={8}>
                  <Item
                    label="Tên sản phẩm"
                    name="name"
                    required
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <Input
                      placeholder="Tên sản phẩm"
                      value="Áo polo mắt chim nữ"
                    />
                  </Item>
                </Col>

                <Col
                  md={8}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Space size={15}>
                    <label className="text-default">Lựa chọn</label>
                    <Switch className="ant-switch-primary" defaultChecked />
                    <label className="text-primary">Cho phép bán</label>
                  </Space>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col md={8}>
                  <Item
                    name="color_id"
                    label="Màuc sắc"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <Select showSearch placeholder="Chọn màu sắc">
                      {listColor?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
                <Col md={8}>
                  <Item
                    name="size_id"
                    label="Size"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <Select showSearch placeholder="Chọn size">
                      {listSize?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {item.code}
                        </CustomSelect.Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col md={8}>
                  <Item
                    label="Kích thước (dài, rộng, cao)"
                    required
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
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
                        <Select placeholder="Đơn vị" style={{ width: "100px" }}>
                          {lengthUnitList?.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      </Item>
                    </Input.Group>
                  </Item>
                </Col>
                <Col md={8}>
                  <Item
                    label="Khối lượng"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
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
                            <Option key={item.value} value={item.value}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      </Item>
                    </Input.Group>
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col md={8}>
                  <Item
                    label="Nhà cung cấp"
                    name="supplier_id"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <CustomSelect
                      placeholder="Chọn nhà cung cấp"
                      showSearch
                      suffix={
                        <Button
                          style={{ width: 36, height: 36 }}
                          icon={<PlusOutlined />}
                        />
                      }
                    >
                      {listSupplier?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
            </div>
          </Card>
          <Collapse
            defaultActiveKey="1"
            className="ant-collapse-card margin-top-20"
            expandIconPosition="right"
          >
            <Collapse.Panel key="1" header="Thông tin giá">
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
                                      <b>Giá bán lẻ</b> là giá mà bạn sẽ bán sản
                                      phẩm này cho những khách hàng đơn lẻ..
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
                                      phẩm này cho những khách hàng mua hàng với
                                      số lượng lớn.
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
                                      <b>Giá nhập</b> là giá mà nhập sản phẩm từ
                                      đơn mua hàng của nhà cung cấp.
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
                                name={[name, "currency"]}
                                fieldKey={[fieldKey, "currency"]}
                              >
                                <Select placeholder="Đơn vị tiền tệ">
                                  {currencyList?.map((item) => (
                                    <Option key={item.value} value={item.value}>
                                      {item.name}
                                    </Option>
                                  ))}
                                </Select>
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
                            {index !== 0 && (
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
            </Collapse.Panel>
          </Collapse>
          <Divider orientation="left" className="ant-divider-primary">
            Thông tin mã cha
          </Divider>
          <Collapse
            className="ant-collapse-card margin-top-20"
            expandIconPosition="right"
          >
            <Collapse.Panel key="1" header="Thông tin chung">
              <div className="padding-20">
                <Row gutter={50}>
                  <Col md={8}>
                    <Item
                      label="Loại sản phẩm"
                      name={["product", "product_type"]}
                      rules={[
                        {
                          required: true,
                          message: "Required",
                        },
                      ]}
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn loại sản phẩm"
                      >
                        {productTypes?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col md={8}>
                    <Item
                      label="Ngành hàng"
                      name={["product", "goods"]}
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn ngành hàng"
                      >
                        {goods?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col md={8}>
                    <Item
                      label="Danh mục"
                      required
                      name={["product", "category_id"]}
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        placeholder="Chọn danh mục"
                        disabled
                        showArrow={false}
                      >
                        {listCategory.map((item) => (
                          <CustomSelect.Option key={item.id} value={item.id}>
                            {`${item.code} - ${item.name}`}
                          </CustomSelect.Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col md={8}>
                    <Item
                      label="Bộ sưu tập"
                      required
                      name={["product", "collections"]}
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        placeholder="Chọn bộ sư tập"
                        disabled
                        showArrow={false}
                      >
                        {collectionList?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col md={8}>
                    <Item
                      name={["product", "brand"]}
                      label="Thương hiệu"
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn thương hiệu"
                      >
                        {brandList?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col md={8}>
                    <Item name={["product", "made_in_id"]} label="Xuất xứ">
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn xuất xứ"
                      >
                        {listCountry?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col md={8}>
                    <Item
                      label="Chất liệu"
                      name={["product", "material_id"]}
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn chất liệu"
                      >
                        {listMaterial?.map((item) => (
                          <Option key={item.id} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col md={8}>
                    <Item
                      label="Đơn vị"
                      name={["product", "product_unit"]}
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="VD: cái, bộ, chiếc..."
                      >
                        {productUnitList?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col md={8}>
                    <Item
                      name={["product", "tags"]}
                      label="Từ khoá"
                      tooltip={{
                        title: "Tooltip",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Input disabled placeholder="VD: Aoxanh" />
                    </Item>
                  </Col>
                </Row>
                <Button
                  type="link"
                  className="padding-0"
                  icon={<MinusOutlined />}
                >
                  Mô tả sản phẩm
                </Button>
                <Row className="margin-top-20">
                  <Col md={24}>
                    <Item name={["product", "description"]}>
                      <CustomEditor disabled />
                    </Item>
                  </Col>
                </Row>
              </div>
            </Collapse.Panel>
          </Collapse>
          <Row gutter={24} className="margin-top-20">
            <Col md={12}>
              <Collapse
                className="ant-collapse-card margin-top-20"
                expandIconPosition="right"
              >
                <Collapse.Panel key="1" header="Thông tin chi tiết sản phẩm">
                  <div className="padding-20">
                    <Item
                      label="Chi tiết thông số"
                      name={["product", "specifications"]}
                      tooltip={{
                        title: "Nhập chi thiết thông số sản phổng",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Input disabled placeholder="Điền chi tiết thông số" />
                    </Item>
                    <Button
                      type="link"
                      className="padding-0"
                      icon={<MinusOutlined />}
                    >
                      Thông tin bảo quản
                    </Button>
                    <Row className="margin-top-20">
                      <Col md={24}>
                        <Item name={["product", "preservation"]}>
                          <CustomEditor disabled />
                        </Item>
                      </Col>
                    </Row>
                  </div>
                </Collapse.Panel>
              </Collapse>
            </Col>
            <Col md={12}>
              <Collapse
                className="ant-collapse-card margin-top-20"
                expandIconPosition="right"
              >
                <Collapse.Panel key="1" header="WIN">
                  <div className="padding-20">
                    <Item
                      label="Merchandiser"
                      name={["product", "merchandiser_code"]}
                      tooltip={{
                        title: "Chọn nhân viên mua hàng",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn Merchandiser"
                      >
                        {accounts.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.full_name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                    <Item
                      label="Thiết kế"
                      name={["product", "designer_code"]}
                      tooltip={{
                        title: "Chọn nhân viên thiết kế",
                        icon: <InfoCircleOutlined />,
                      }}
                    >
                      <Select
                        disabled
                        showArrow={false}
                        placeholder="Chọn thiết kế"
                      >
                        {accounts.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.full_name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </div>
                </Collapse.Panel>
              </Collapse>
            </Col>
          </Row>
          <div className="margin-top-10" style={{ textAlign: "right" }}>
            <Space size={12}>
              <Button onClick={onCancel}>Huỷ</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingSaveButton}
              >
                Lưu
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </ContentContainer>
  );
};

export default VariantUpdateScreen;
