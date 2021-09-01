import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Divider,
  Switch,
  Table,
  Space,
  Collapse,
} from "antd";
import CustomEditor from "component/custom/custom-editor";
import UrlConfig from "config/url.config";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { listColorAction } from "domain/actions/product/color.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { CategoryView } from "model/product/category.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CountryResponse } from "model/content/country.model";
import { CategoryResponse } from "model/product/category.model";
import { ColorResponse } from "model/product/color.model";
import { MaterialResponse } from "model/product/material.model";
import { SizeResponse } from "model/product/size.model";
import { SupplierResponse } from "model/core/supplier.model";
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  convertCategory,
  Products,
  formatCurrency,
  replaceFormatString,
} from "utils/AppUtils";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import {
  ProductRequest,
  ProductRequestView,
  VariantImage,
  VariantRequestView,
  VariantResponse,
} from "model/product/product.model";
import NumberInput from "component/custom/number-input.custom";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AppConfig } from "config/app.config";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountResponse } from "model/account/account.model";
import { productCreateAction } from "domain/actions/product/products.action";

import UploadImageModal, {
  VariantImageModel,
} from "./component/upload-image.modal";
import ImageProduct from "./component/image-product.component";
import ContentContainer from "component/container/content.container";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import ModalConfirm from "component/modal/ModalConfirm";

const { Option } = Select;
const { Item, List } = Form;
const { Panel } = Collapse;

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
  tags: [],
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
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [listSize, setListSize] = useState<Array<SizeResponse>>([]);
  const [listSizeByCategory, setListSizeByCategory] = useState<
    Array<SizeResponse>
  >([]);
  const [listColor, setListColor] = useState<Array<ColorResponse>>([]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const [isConfirmSave, setConfirmSave] = useState<boolean>(false);
  const [titleConfirmSave, setTitleConfirmSave] = useState<string>("");
  //End get master data
  //State
  const initialForm: ProductRequestView = {
    ...initialRequest,
    product_type:
      productTypes && productTypes.length > 0 ? productTypes[0].value : null,
    goods: goods && goods.length > 0 ? goods[0].value : null,
    weight_unit:
      weightUnitList && weightUnitList.length > 0
        ? weightUnitList[0].value
        : null,
    length_unit:
      lengthUnitList && lengthUnitList.length > 0
        ? lengthUnitList[0].value
        : null,
    unit:
      productUnitList && productUnitList.length > 0
        ? productUnitList[0].value
        : null,
  };
  const [productRequest, setProductRequest] = useState<ProductRequest | null>(
    null
  );
  const [colorSelected, setColorSelected] = useState<Array<ColorResponse>>([]);
  const [sizeSelected, setSizeSelected] = useState<Array<SizeResponse>>([]);
  const [variants, setVariants] = useState<Array<VariantRequestView>>([]);
  const [status, setStatus] = useState<string>(initialRequest.status);
  const [saleableStatus, setSaleableStatus] = useState<string>("Cho phép bán");
  const [isCombo, setCombo] = useState<boolean>(false);
  const [isVisibleUpload, setVisibleUpload] = useState<boolean>(false);
  const [variant, setVariant] = useState<VariantImageModel | null>(null);
  const [selectedGood, setSelectedGood] = useState<string | null>(
    initialForm.goods
  );
  //End State
  const formRef = createRef<FormInstance>();
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
  const onChangesaleable = useCallback((checked: boolean) => {
    if (checked === true) {
      setSaleableStatus("Cho phép bán");
    } else {
      setSaleableStatus("Ngừng bán");
    }
  }, []);
  const categoryFilter = useMemo(() => {
    if (selectedGood === null) {
      return listCategory;
    }
    return listCategory.filter((item) => item.goods === selectedGood);
  }, [listCategory, selectedGood]);
  const createCallback = useCallback(
    (result: VariantResponse) => {
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(UrlConfig.PRODUCT);
      } else {
        setLoadingSaveButton(false);
      }
    },
    [history]
  );
  const onFinish = useCallback(
    (values: ProductRequestView) => {
      
      setLoadingSaveButton(true);

      let request = Products.convertProductViewToRequest(
        values,
        variants,
        status
      );
      let hasColor = request.variants.filter((val) => val.color_id != null);
      let hasSize = request.variants.filter((val) => val.size_id != null);
      let contentMes = "";
      if (hasColor.length === 0 && hasSize.length === 0) {
        contentMes = "màu, kích thước";
      }
      if (hasColor.length === 0 && hasSize.length !== 0) {
        contentMes = "màu";
      }
      if (hasColor.length !== 0 && hasSize.length === 0) {
        contentMes = "kích thước";
      }
      let titleConfirm = `Bạn chưa chọn ${contentMes}. Bạn có muốn tạo sản phẩm hay không?`;
      setTitleConfirmSave(titleConfirm);
      setConfirmSave(true);
      setProductRequest(request);
      // dispatch(productCreateAction(request, onSuccess));
    },
    [status, variants]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
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
  //callback data
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);
  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>|false) => {
    if(!data) {
      return false;
    }
    setAccounts(data.items);
  }, []);
  //end callback data
  const skuCol = {
    title: "Mã chi tiết",
    key: "sku",
    dataIndex: "sku",
  };
  const nameCol = {
    title: "Tên sản phẩm",
    key: "name",
    dataIndex: "name",
  };
  const colorCol = {
    title: "Mã màu",
    key: "color",
    dataIndex: "color",
  };
  const sizeCol = {
    title: "Kích cỡ",
    key: "size",
    dataIndex: "size",
  };
  const imageCol = {
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
  };
  const quanltityCol = {
    title: "Số lượng",
    key: "quantity",
    dataIndex: "quantity",
    width: 100,
    render: (quantity: number, item: VariantRequestView) => (
      <NumberInput
        style={{ textAlign: "center" }}
        value={quantity}
        // onChange={(s) => {
        //   let index = variants.findIndex((v) => v.sku === item.sku);
        //   if (index !== -1) {
        //     variants[index].quantity = s;
        //   }
        //   setVariants([...variants]);
        // }}
      />
    ),
  };
  const actionCol = {
    title: "Thao tác",
    key: "action",
    dataIndex: "id",
    width: 100,
    render: (id: number) => (
      <Button onClick={() => {}} type="link" icon={<DeleteOutlined />} />
    ),
  };
  let columns: Array<any> = [
    skuCol,
    nameCol,
    colorCol,
    sizeCol,
    imageCol,
    actionCol,
  ];
  if (isCombo) {
    columns = [
      skuCol,
      nameCol,
      colorCol,
      sizeCol,
      quanltityCol,
      imageCol,
      actionCol,
    ];
  }
  const listVariantsFilter = useCallback(
    (colors: Array<ColorResponse>, sizes: Array<SizeResponse>) => {
      let name = formRef.current?.getFieldValue("name");
      let code = formRef.current?.getFieldValue("code");
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
              sku: `${code}-${i1.name}`,
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
    [formRef]
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
      let filter = listColor.filter((item) => values.includes(item.id));
      setColorSelected([...filter]);
      listVariantsFilter(filter, sizeSelected);
    },
    [listColor, listVariantsFilter, sizeSelected]
  );
  const onCategoryChange = useCallback(
    (value: number) => {
      let categoryIndex = listCategory.findIndex((item) => item.id === value);
      if (categoryIndex !== -1) {
        formRef.current?.setFieldsValue({
          code: listCategory[categoryIndex].code,
        });
      }
      
      formRef.current?.setFieldsValue({
        size: [],
      });
      let listSizeFilter = listSize.filter(
        (item) => item.categories.findIndex((c) => c.category_id === value) > -1
      );
      setListSizeByCategory(listSizeFilter);
    },
    [formRef, listCategory, listSize]
  );
  const onGoodsChange = useCallback((value: string) => {
    setSelectedGood(value);
  }, []);
  const onNameChange = useCallback(
    (event) => {
      listVariantsFilter(colorSelected, sizeSelected);
    },
    [colorSelected, listVariantsFilter, sizeSelected]
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
      <Form
        initialValues={initialForm}
        ref={formRef}
        onFinish={onFinish}
        scrollToFirstError
        layout="vertical"
      >
        <Card
          title="Thông tin cơ bản"
          extra={
            <Space size={15}>
              <label className="text-default">Trạng thái</label>
              <Switch
                onChange={(checked) =>
                  setStatus(checked ? "active" : "inactive")
                }
                className="ant-switch-success"
                defaultChecked
              />
              <label
                className={status === "active" ? "text-success" : "text-error"}
              >
                {statusValue}
              </label>
            </Space>
          }
        >
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn loại sản phẩm",
                    },
                  ]}
                  name="product_type"
                  label="Loại sản phẩm"
                  tooltip={{
                    title: "Chọn loại sản phẩm (combo, sản phẩm)",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Select
                    onChange={(value) => setCombo(value === "combo")}
                    placeholder="Chọn loại sản phẩm "
                  >
                    {productTypes?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
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
                  <Select
                    onChange={onGoodsChange}
                    placeholder="Chọn ngành hàng "
                  >
                    {goods?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col
                lg={8}
                md={8}
                style={{ display: "flex", justifyContent: "end" }}
              >
                <Space size={15}>
                  <label className="text-default">Lựa chọn</label>
                  <Item valuePropName="checked" noStyle name="saleable">
                    <Switch
                      className="ant-switch-primary"
                      onChange={onChangesaleable}
                    />
                  </Item>
                  <label className="text-primary">{saleableStatus}</label>
                </Space>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
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
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="collections" label="Bộ sưu tập">
                  <Select mode="multiple" placeholder="Chọn bộ sưu tập">
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
              <Col span={24} lg={8} md={12} sm={24}>
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
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên sản phẩm",
                    },
                    {
                      pattern: RegUtil.STRINGUTF8,
                      message: "Tên sản phẩm không báo gồm kí tự đặc biệt",
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
              <Col span={24} lg={8} md={12} sm={24}>
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
              <Col span={24} lg={8} md={12} sm={24}>
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

            <Divider orientation="left">Thông tin khác</Divider>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  tooltip={{
                    title: "Thẻ ngày giúp tìm kiếm các sản phẩm",
                    icon: <InfoCircleOutlined />,
                  }}
                  name="tags"
                  label="Từ khóa"
                >
                  <Select
                    className="ant-select-hashtag"
                    dropdownClassName="ant-select-dropdown-hashtag"
                    mode="tags"
                    placeholder="Nhập từ khóa"
                  />
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="unit" label="Đơn vị">
                  <Select placeholder="Chọn đơn vị">
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
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="supplier_id" label="Nhà cung cấp">
                  <Select showSearch placeholder="Chọn nhà cung cấp">
                    {listSupplier?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="brand" label="Thương hiệu">
                  <Select placeholder="Chọn thương hiệu">
                    {brandList?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="made_in_id" label="Xuất xứ">
                  <Select
                    showSearch
                    optionFilterProp="children"
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
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="material_id" label="Chất liệu">
                  <Select
                    showSearch
                    optionFilterProp="children"
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
            </Row>
            {/* <Button type="link" className="padding-0" icon={<MinusOutlined />}>
              Mô tả sản phẩm
            </Button> */}
            <Row gutter={24}>
              <Col span={24}>
                <Collapse
                  ghost
                  expandIcon={({ isActive }) =>
                    isActive ? <MinusOutlined /> : <PlusOutlined />
                  }
                  className="padding-0"
                >
                  <Panel
                    header="Mô tả sản phẩm"
                    key="prDes"
                    className="custom-header"
                  >
                    <Item name="description">
                      <CustomEditor />
                    </Item>
                  </Panel>
                </Collapse>
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
                                replace={(a: string) => replaceFormatString(a)}
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
                                replace={(a: string) => replaceFormatString(a)}
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
                                replace={(a: string) => replaceFormatString(a)}
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
                                  message: "Đơn vị tiền tệ không được để trống",
                                },
                              ]}
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
                          {fields.length > 1 && (
                            <Col
                              md={4}
                              style={{ display: "flex", alignItems: "center" }}
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
        <Row gutter={24} className="margin-top-20">
          <Col span={24} lg={12} md={12} sm={24}>
            <Collapse className="ant-collapse-card" expandIconPosition="right">
              <Collapse.Panel key="1" header="Thông tin chi tiết sản phẩm">
                <div className="padding-20">
                  <Item
                    name="specifications"
                    label="Chi tiết thông số"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <Input placeholder="Điền chi tiết thông số" />
                  </Item>
                  {/* <Button
                    type="link"
                    className="padding-0"
                    icon={<MinusOutlined />}
                  >
                    Thông tin bảo quản
                  </Button> */}
                  <Row className="margin-top-20">
                    <Col md={24}>
                      <Collapse
                        ghost
                        expandIcon={({ isActive }) =>
                          isActive ? <MinusOutlined /> : <PlusOutlined />
                        }
                        className="padding-0"
                      >
                        <Panel
                          header="Thông tin bảo quản"
                          key="pnPreservation"
                          className="custom-header"
                        >
                          <Item name="preservation">
                            <CustomEditor />
                          </Item>
                        </Panel>
                      </Collapse>
                    </Col>
                  </Row>
                </div>
              </Collapse.Panel>
            </Collapse>
          </Col>
          <Col span={24} lg={12} md={12} sm={24}>
            <Collapse className="ant-collapse-card" expandIconPosition="right">
              <Collapse.Panel key="1" header="Win">
                <div className="padding-20">
                  <Item
                    name="merchandiser_code"
                    label="Merchandiser"
                    tooltip={{
                      title: "Chọn nhân viên mua hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Select optionFilterProp="children" showSearch showArrow>
                      <Option value="">Chọn Merchandiser</Option>
                      {accounts.map((item) => (
                        <Option key={item.code} value={item.code}>
                          {item.full_name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                  <Item
                    name="designer_code"
                    label="Thiết kế"
                    tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                  >
                    <Select placeholder="Chọn thiết kế">
                      <Option value="">Chọn thiết kế</Option>
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
        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="Quản lý thuộc tính">
            <div className="padding-20">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
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
                <Col span={24} lg={8} md={12} sm={24}>
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
                        <CustomSelect.Option key={item.code} value={item.id}>
                          {item.code}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
            </div>
          </Collapse.Panel>
        </Collapse>
        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="Danh sách mã">
            <div className="padding-20">
              <Table
                locale={{
                  emptyText: "Không cỏ sản phẩm",
                }}
                dataSource={variants}
                columns={columns}
                rowKey={(item) => item.sku}
                pagination={false}
              />
            </div>
          </Collapse.Panel>
        </Collapse>
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
      <UploadImageModal
        onCancle={() => {
          setVisibleUpload(false);
        }}
        visible={isVisibleUpload}
        variant={variant}
        onSave={(variant_images) => {
          let index = variants.findIndex((item) => item.sku === variant?.sku);
          if(index !== -1) {
            variants[index].variant_images = variant_images;
          }
          setVariants([...variants]);
          setVisibleUpload(false);
        }}
      />
      <ModalConfirm
        onCancel={() => {
          setConfirmSave(false);
          setLoadingSaveButton(false);
        }}
        onOk={() => {
          setConfirmSave(false);
          dispatch(productCreateAction(productRequest, createCallback));
          // dispatch(showLoading());
          // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
        }}
        title={titleConfirmSave}
        subTitle=""
        visible={isConfirmSave}
      />
    </ContentContainer>
  );
};

export default ProductCreateScreen;
