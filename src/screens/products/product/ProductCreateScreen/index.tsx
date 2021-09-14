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
  Table,
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import HashTag from "component/custom/hashtag";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { listColorAction } from "domain/actions/product/color.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import { productCreateAction } from "domain/actions/product/products.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { ColorResponse } from "model/product/color.model";
import { MaterialResponse } from "model/product/material.model";
import {
  ProductRequestView,
  ProductResponse,
  VariantImage,
  VariantRequestView,
} from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  convertCategory,
  formatCurrency,
  Products,
  replaceFormatString,
} from "utils/AppUtils";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import ImageProduct from "../component/image-product.component";
import UploadImageModal, { VariantImageModel } from "../component/upload-image.modal";
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
      wholesale_price: "",
      cost_price: "",
      tax_percent: 0,
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
  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status
  );
  const initialForm: ProductRequestView = {
    ...initialRequest,
    goods: goods && goods.length > 0 ? goods[0].value : null,
    weight_unit:
      weightUnitList && weightUnitList.length > 0
        ? weightUnitList[0].value
        : null,
    unit:
      productUnitList && productUnitList.length > 0
        ? productUnitList[0].value
        : null,
    length_unit:
      lengthUnitList && lengthUnitList.length > 0
        ? lengthUnitList[0].value
        : null,
    product_type: "normal",
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
  const [variants, setVariants] = useState<Array<VariantRequestView>>([]);
  const [colorSelected, setColorSelected] = useState<Array<ColorResponse>>([]);
  const [sizeSelected, setSizeSelected] = useState<Array<SizeResponse>>([]);
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [status, setStatus] = useState<string>(initialRequest.status);
  const [isVisibleUpload, setVisibleUpload] = useState<boolean>(false);
  const [variant, setVariant] = useState<VariantImageModel | null>(null);
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

  const listVariantsFilter = useCallback(
    (colors: Array<ColorResponse>, sizes: Array<SizeResponse>) => {
      let name = form.getFieldValue("name");
      let code = form.getFieldValue("code");
      if (name && code) {
        let newVariants: Array<VariantRequestView> = [];
        if (colors.length > 0 && sizes.length > 0) {
          colors.forEach((i1) => {
            sizes.forEach((i2) => {
              let sku = `${code}-${i1.code}-${i2.code}`;
              newVariants.push({
                name: `${name} - ${i1.name} - ${i2.code}`,
                color_id: i1.id,
                color: i1.name,
                size_id: i2.id,
                size: i2.code,
                sku: sku,
                variant_images: [],
                quantity: 0,
              });
            });
          });
        } else if (colors.length === 0 && sizes.length > 0) {
          sizes.forEach((i2) => {
            newVariants.push({
              name: `${name} - ${i2.code}`,
              color_id: null,
              color: null,
              size_id: i2.id,
              size: i2.code,
              sku: `${code}-${i2.code}`,
              variant_images: [],
              quantity: 0,
            });
          });
        } else if (colors.length >= 0 && sizes.length === 0) {
          colors.forEach((i1) => {
            newVariants.push({
              name: `${name} - ${i1.name}`,
              color_id: i1.id,
              color: i1.name,
              size_id: null,
              size: null,
              sku: `${code}-${i1.code}`,
              variant_images: [],
              quantity: 0,
            });
          });
        }
        if (newVariants.length === 0) {
          newVariants.push({
            name: name,
            color_id: null,
            color: null,
            size_id: null,
            size: null,
            sku: code,
            quantity: 0,
            variant_images: [],
          });
        }
        setVariants([...newVariants]);
      }
    },
    [form]
  );

  const onNameChange = useCallback(
    (event) => {
      listVariantsFilter(colorSelected, sizeSelected);
    },
    [colorSelected, listVariantsFilter, sizeSelected]
  );

  const onSizeChange = useCallback(
    (values: Array<number>) => {
      let filter = listSize.filter((item) => values.includes(item.id));
      setSizeSelected([...filter]);
      listVariantsFilter(colorSelected, filter);
    },
    [colorSelected, listSize, listVariantsFilter]
  );

  const onColorChange = useCallback(
    (values: Array<number>) => {
      console.log(values);
      let filter = listColor.filter((item) => values.includes(item.id));
      setColorSelected([...filter]);
      listVariantsFilter(filter, sizeSelected);
    },
    [listColor, listVariantsFilter, sizeSelected]
  );

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

  const createCallback = useCallback(
    (result: ProductResponse) => {
      setLoadingSaveButton(false);
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.PRODUCT}/${result.id}`);
      }
    },
    [history]
  );

  const onClickUpload = useCallback(
    (item: VariantRequestView, index: number) => {
      setVariant({
        name: item.name,
        sku: item.sku,
        variant_images: item.variant_images,
      });
      setVisibleUpload(true);
    },
    []
  );

  const onFinish = useCallback(
    (values: ProductRequestView) => {
      setLoadingSaveButton(true);
      let request = Products.convertProductViewToRequest(
        values,
        variants,
        status
      );
      dispatch(productCreateAction(request, createCallback));
    },
    [createCallback, dispatch, status, variants]
  );

  const onCancel = useCallback(() => {
    setModalConfirm({
      visible: false,
    });
  }, []);

  const onClickAdd = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        if (sizeSelected.length > 0 && colorSelected.length > 0) {
          form.submit();
        } else {
          let notSelected = "";
          if (sizeSelected.length === 0 && colorSelected.length > 0) {
            notSelected = "kích thước";
          } else if (colorSelected.length === 0 && sizeSelected.length > 0) {
            notSelected = "màu sắc";
          } else {
            notSelected = "kích thước và màu sắc";
          }
          let subTitle = `Bạn chưa chọn ${notSelected}. Bạn có muốn tạo sản phẩm?`;
          setModalConfirm({
            visible: true,
            onCancel: onCancel,
            onOk: () => {
              setModalConfirm({ visible: false });
              form.submit();
            },
            subTitle: subTitle,
            title: "Thêm mới sản phẩm",
          });
        }
      })
      .catch((error) => {
        const element: any = document.getElementById(
          error.errorFields[0].name.join("")
        );
        element?.focus();
        const y =
          element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
  }, [colorSelected.length, form, onCancel, sizeSelected.length]);

  const onClickReset = useCallback(() => {
    setModalConfirm({
      visible: true,
      onCancel: onCancel,
      onOk: () => {
        form.resetFields();
        setModalConfirm({ visible: false });
        window.scrollTo(0, 0);
        showSuccess("Đặt lại dữ liệu thành công");
      },
      title: "Bạn có muốn đặt lại thông tin đã nhập",
      subTitle:
        "Sau khi đặt lại trang sẽ được đặt về mặt định. Bạn có muốn đặt lại?",
    });
  }, [form, onCancel]);

  const deleteVariant = useCallback(
    (sku: string) => {
      let index = variants.findIndex((item) => item.sku === sku);
      variants.splice(index, 1);
      setVariants([...variants]);
    },
    [variants]
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
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={initialForm}
      layout="vertical"
    >
      <Item noStyle name="product_type" hidden>
        <Input />
      </Item>
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
                    <div className="extra-cards status">
                      <Item noStyle>
                        <b>Trạng thái:</b>
                        <Switch
                          onChange={(checked) =>
                            setStatus(checked ? "active" : "inactive")
                          }
                          className="ant-switch-success"
                          defaultChecked
                        />
                      </Item>
                      <label
                        className={
                          status === "active" ? "text-success" : "text-error"
                        }
                      >
                        {statusValue}
                      </label>
                    </div>
                    <div className="extra-cards">
                      <b>Cho phép bán:</b>
                      <Item valuePropName="checked" name="saleable" noStyle>
                        <Switch className="ant-switch-success" />
                      </Item>
                    </div>
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
                          onChange={onNameChange}
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
                          onChange={onNameChange}
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
                            <CustomSelect.Option key={item.id} value={item.id}>
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
              <Card className="card" title="Ảnh">
                <div className="padding-20">
                  <div className="a-container">
                    <div className="bpa">
                      <PlusOutlined />
                      Chọn ảnh đại diện
                    </div>
                  </div>
                </div>
              </Card>
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
                              <Col md={3}>
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
                              <Col md={3}>
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
                              <Col md={3}>
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
                              <Col md={3}>
                                <Item
                                  name={[name, "wholesale_price"]}
                                  fieldKey={[fieldKey, "wholesale_price"]}
                                  label="Giá vốn"
                                  tooltip={{
                                    title: () => (
                                      <div>
                                        <b>Giá vốn</b> là tổng của những loại
                                        chi phí để đưa hàng có mặt tại kho.
                                        Chúng bao gồm giá mua của nhà cung cấp,
                                        thuế giá trị gia tăng, chi phí vận
                                        chuyển, bảo hiểm,...
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
                              <Col md={3}>
                                <Item
                                  label="Thuế"
                                  name={[name, "tax_percent"]}
                                  fieldKey={[fieldKey, "tax_percent"]}
                                >
                                  <NumberInput
                                    placeholder="VD: 10"
                                    suffix={<span>%</span>}
                                  />
                                </Item>
                              </Col>
                              <Col md={3}>
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
                              {fields.length > 1 && (
                                <Col
                                  md={3}
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
                          onChange={onColorChange}
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
                          onChange={onSizeChange}
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
                  <Table
                    locale={{
                      emptyText: "Không cỏ sản phẩm",
                    }}
                    dataSource={variants}
                    columns={[
                      {
                        title: "Ảnh",
                        dataIndex: "variant_images",
                        render: (
                          images: Array<VariantImage>,
                          item: VariantRequestView,
                          index: number
                        ) => {
                          let image = Products.findAvatar(images);
                          return (
                            <ImageProduct
                              path={image !== null ? image.url : null}
                              onClick={() => {
                                onClickUpload(item, index);
                              }}
                            />
                          );
                        },
                      },
                      {
                        title: "Mã chi tiết",
                        key: "sku",
                        dataIndex: "sku",
                      },
                      {
                        title: "Tên sản phẩm",
                        key: "name",
                        dataIndex: "name",
                      },
                      {
                        title: "Mã màu",
                        key: "color",
                        dataIndex: "color",
                      },
                      {
                        title: "Kích cỡ",
                        key: "size",
                        dataIndex: "size",
                      },
                      {
                        title: "Thao tác",
                        key: "action",
                        dataIndex: "sku",
                        width: 100,
                        render: (sku: string) => (
                          <Button
                            onClick={() => {
                              deleteVariant(sku);
                            }}
                            type="link"
                            icon={<DeleteOutlined />}
                          />
                        ),
                      },
                    ]}
                    rowKey={(item) => item.sku}
                    pagination={false}
                  />
                </div>
              </Card>
            </Col>
          </Row>
          <BottomBarContainer
            back="Quay lại sản phẩm"
            rightComponent={
              <Space>
                <Button onClick={onClickReset}>Đặt lại</Button>
                <Button
                  onClick={onClickAdd}
                  loading={loadingSaveButton}
                  type="primary"
                >
                  Thêm sản phẩm
                </Button>
              </Space>
            }
          />
          <ModalConfirm {...modalConfirm} />
          <UploadImageModal
            onCancel={() => {
              setVisibleUpload(false);
            }}
            visible={isVisibleUpload}
            variant={variant}
            onSave={(variant_images) => {
              let index = variants.findIndex(
                (item) => item.sku === variant?.sku
              );
              if (index !== -1) {
                variants[index].variant_images = variant_images;
              }
              setVariants([...variants]);
              setVisibleUpload(false);
            }}
          />
        </ContentContainer>
      </StyledComponent>
    </Form>
  );
};

export default ProductCreateScreen;
