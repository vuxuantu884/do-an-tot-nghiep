import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Image,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Switch,
  Table,
  TreeSelect,
  Typography,
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
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import { getColorAction } from "domain/actions/product/color.action";
import { detailMaterialAction, getMaterialAction } from "domain/actions/product/material.action";
import {
  productCheckDuplicateCodeAction,
  productCreateAction,
} from "domain/actions/product/products.action";
import { sizeSearchAction } from "domain/actions/product/size.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { CollectionResponse } from "model/product/collection.model";
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { formatCurrency, replaceFormatString, capitalEachWords } from "utils/AppUtils";
import {
  convertCategory,
  convertLabelSelected,
  convertProductViewToRequest,
  findAvatar,
  formatCurrencyForProduct,
  ProductField,
} from "screens/products/helper";
import { DEFAULT_COMPANY, VietNamId } from "utils/Constants";
import { ProductHelper } from "utils";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { ImageProduct, ModalPickAvatar, UploadImageModal } from "../component";
import { VariantImageModel } from "../component/UploadImageModal";
import { StyledComponent } from "./styles";
import BaseSelectPaging from "component/base/BaseSelect/BaseSelectPaging";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { useFetchMerchans } from "hook/useFetchMerchans";
import BaseSelect from "component/base/BaseSelect/BaseSelect";
import CareModal from "screens/products/component/CareInformation";
import { uniqBy } from "lodash";
import { TaxConfigCountry } from "model/core/tax.model";
import { VN_CODE } from "screens/settings/tax/helper";
import useAuthorization from "hook/useAuthorization";
import { ProductPermission } from "config/permissions/product.permission";
import useFetchTaxConfig from "hook/useFetchTaxConfig";
const { TreeNode } = TreeSelect;
const { Item, List } = Form;
const { Option } = Select;

const initialRequest: ProductRequestView = {
  goods: null,
  category_id: null,
  collections: [],
  product_collections: [],
  code: "",
  name: "",
  width: null,
  height: null,
  length: null,
  length_unit: null,
  weight: null,
  weight_unit: null,
  tags: "",
  brand: null,
  unit: null,
  content: null,
  description: "",
  designer_code: null,
  made_in_id: null,
  merchandiser_code: null,
  care_labels: "",
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
      tax_percent: "",
    },
  ],
  material_id: null,
  suppliers: [],
  material: null,
  component: null,
  advantages: null,
  defect: null,
  taxable: true,
};

const ProductCreateScreen: React.FC = () => {
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  //end hook
  //init
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods);
  const brandList = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.brand);
  const productUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit,
  );
  const currencyList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.currency,
  );
  const lengthUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.length_unit,
  );
  const weightUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.weight_unit,
  );
  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status,
  );
  const initialForm: ProductRequestView = {
    ...initialRequest,
    goods: goods && goods.length > 0 ? goods[0].value : null,
    weight_unit: weightUnitList && weightUnitList.length > 0 ? weightUnitList[0].value : null,
    unit: productUnitList && productUnitList.length > 0 ? productUnitList[0].value : null,
    length_unit: lengthUnitList && lengthUnitList.length > 0 ? lengthUnitList[0].value : null,
    product_type: "normal",
    brand: DEFAULT_COMPANY.company.toLocaleLowerCase(),
    merchandiser_code: userReducer && userReducer.account ? userReducer.account.code : null,
  };
  const [allowUpdateTax] = useAuthorization({
    acceptPermissions: [ProductPermission.update_cost],
  });
  //end init

  //state
  const isLoadMaterData = useRef(false);

  const [listCategory, setListCategory] = useState<Array<CategoryResponse>>([]);
  const [lstCategoryAll, setLstCategoryAll] = useState<Array<CategoryView>>([]);

  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);

  const [suppliers, setSupplier] = useState<PageResponse<SupplierResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [sizes, setSizes] = useState<PageResponse<SizeResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [colors, setColors] = useState<PageResponse<ColorResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [variants, setVariants] = useState<Array<VariantRequestView>>([]);
  const [colorSelected, setColorSelected] = useState<Array<ColorResponse>>([]);
  const [sizeSelected, setSizeSelected] = useState<Array<SizeResponse>>([]);
  const [isLoadingSaveButton, setIsLoadingSaveButton] = useState(false);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [status, setStatus] = useState<string>(initialRequest.status);
  const [isVisibleUpload, setIsVisibleUpload] = useState<boolean>(false);
  const [isVisiblePickAvatar, setIsVisiblePickAvatar] = useState<boolean>(false);
  const [variant, setVariant] = useState<VariantImageModel | null>(null);
  const [isShowCareModal, setIsShowCareModal] = useState(false);
  const [isChangeDescription, setIsChangeDescription] = useState(true);
  const [isSupplierLoading, setIsSupplierLoading] = useState(false);
  const [isCollectionLoading, setCollectionLoading] = useState(false);
  const [isSizeLoading, setIsSizeLoading] = useState(false);
  const [isColorLoading, setIsColorLoading] = useState(false);
  const [isProductCollectionRequired, setIsProductCollectionRequired] = useState(false);
  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [careLabelsString, setCareLabelsString] = useState("");
  const [collections, setCollections] = useState<PageResponse<CollectionResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [valueSearch, setValueSearch] = useState<string>("");
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();
  const { taxConfig } = useFetchTaxConfig();
  //end category
  //end state

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    const temp: Array<CategoryView> = convertCategory(arr);
    setLstCategoryAll(temp);
    setListCategory(arr);
  }, []);

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return false;
    }
  }, []);

  const changeCategory = useCallback(
    (value: number) => {
      const category = lstCategoryAll.find((item) => item.id === value);

      if (category && category.child_ids === null) {
        let path: any;
        listCategory.find(
          (categoryItem) => (path = ProductHelper.findPathTreeById(categoryItem, category.id)),
        );

        const parents = lstCategoryAll.filter((item) => {
          return (
            item.child_ids &&
            item.child_ids
              .split(",")
              .filter(
                (childItem) =>
                  path.filter((pathItem: any) => pathItem === Number(childItem)).length > 0,
              ).length > 0
          );
        });

        const rootParent = parents.filter((parent) => !parent.parent);
        setIsProductCollectionRequired(
          rootParent?.length > 0 && rootParent[0].name === "Thời trang",
        );

        if (rootParent.length > 0 && rootParent[0].name === "Thời trang") {
          form.resetFields(["product_collections"]);
        }

        form.setFieldsValue({
          code: category.code ?? "",
          name: capitalEachWords(category.name),
        });
      } else {
        showWarning("Vui lòng chọn danh mục con");
        form.setFieldsValue({
          category_id: null,
        });
        form.resetFields(["category_id", "product_collections"]);
        setIsProductCollectionRequired(false);
      }
    },
    [form, listCategory, lstCategoryAll],
  );

  /**
   * generate variants as product code change, selected colors, sizes change
   */
  const changeVariantName = useCallback(() => {
    const code = form.getFieldValue("code");
    let name = form.getFieldValue("name");
    name = capitalEachWords(name);
    form.setFieldsValue({
      name: name,
    });

    if (name && code) {
      let newVariants: Array<VariantRequestView> = [];
      if (colorSelected.length > 0 && sizeSelected.length > 0) {
        colorSelected.forEach((color) => {
          sizeSelected.forEach((size) => {
            const sku = `${code}-${color.code}-${size.code}`;
            newVariants.push({
              name: `${name} - ${color.name} - ${size.code}`,
              code: color.code,
              color_id: color.id,
              color: color.name,
              size_id: size.id,
              size: size.code,
              sku: sku,
              variant_images: [],
              quantity: 0,
            });
          });
        });
      } else if (colorSelected.length === 0 && sizeSelected.length > 0) {
        sizeSelected.forEach((size) => {
          newVariants.push({
            name: `${name} - ${size.code}`,
            code: null,
            color_id: null,
            color: null,
            size_id: size.id,
            size: size.code,
            sku: `${code}-${size.code}`,
            variant_images: [],
            quantity: 0,
          });
        });
      } else if (colorSelected.length >= 0 && sizeSelected.length === 0) {
        colorSelected.forEach((color) => {
          newVariants.push({
            name: `${name} - ${color.name}`,
            color_id: color.id,
            code: color.code,
            color: color.name,
            size_id: null,
            size: null,
            sku: `${code}-${color.code}`,
            variant_images: [],
            quantity: 0,
          });
        });
      }
      if (newVariants.length === 0) {
        newVariants.push({
          name: name,
          color_id: null,
          code: null,
          color: null,
          size_id: null,
          size: null,
          sku: `${code}-MAU`,
          quantity: 0,
          variant_images: [],
        });
        //add variant sku = product_code CO-4551
        newVariants.push({
          name: name,
          color_id: null,
          code: null,
          color: null,
          size_id: null,
          size: null,
          sku: `${code}`,
          quantity: 0,
          variant_images: [],
        });
      }

      setVariants(uniqBy(newVariants, "sku"));
    }
  }, [colorSelected, form, sizeSelected]);

  const changeProductCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    changeVariantName();
    if (value.length === 7)
      dispatch(
        productCheckDuplicateCodeAction(value, (message) => {
          if (message) {
            form.setFields([
              {
                name: "code",
                errors: [message],
              },
            ]);
          }
        }),
      );
  };

  const changeMaterial = useCallback(
    (id: number) => {
      if (isChangeDescription && id) {
        dispatch(
          detailMaterialAction(id, (material) => {
            ProductHelper.handleChangeMaterial(material, form);
            if (material && material.care_labels) {
              setCareLabelsString(material.care_labels);
            } else {
              setCareLabelsString("");
            }
          }),
        );
      }
    },
    [isChangeDescription, dispatch, form],
  );

  const changeSelectedSize = useCallback(
    (value: number, objSize: any) => {
      let size: string = "";
      if (objSize && objSize?.children) {
        size = objSize?.children.split(" ")[0];
      }
      const newSize = { id: value, code: size } as SizeResponse;
      const filter = [
        ...variants.filter((e) => e.size !== null).map((e) => ({ id: e.size_id, code: e.size })),
        newSize,
      ] as Array<SizeResponse>;

      setSizeSelected(filter);
    },
    [variants],
  );

  const onColorSelected = useCallback(
    (value: number) => {
      const foundColor = colors.items.find((color) => color.id === value);
      setColorSelected(
        colorSelected.concat({
          id: value,
          name: foundColor?.name || "",
          code: foundColor?.code || "",
        } as ColorResponse),
      );
    },
    [colorSelected, colors.items],
  );

  // auto update product variant list as colors selected, sizes selected change
  useEffect(() => {
    if (colorSelected.length || sizeSelected.length) {
      changeVariantName();
    }
  }, [colorSelected.length, changeVariantName, sizeSelected.length]);

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    const index = productStatusList?.findIndex((item) => item.value === status);
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [productStatusList, status]);

  const variantImages = useMemo(() => {
    let arr: Array<VariantImage> = [];
    variants.forEach((item) => {
      arr = [...arr, ...item.variant_images];
    });
    return arr;
  }, [variants]);

  useEffect(() => {
    const newSelected = careLabelsString ? careLabelsString.split(";") : [];

    const careLabels = convertLabelSelected(newSelected);

    setCareLabels(careLabels);
  }, [careLabelsString]);

  const createCallback = useCallback(
    (result: ProductResponse) => {
      setIsLoadingSaveButton(false);
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.PRODUCT}/${result.id}`);
      }
    },
    [history],
  );

  const uploadVariantImage = useCallback((item: VariantRequestView) => {
    setVariant({
      name: item.name,
      sku: item.sku,
      variant_images: item.variant_images,
    });
    setIsVisibleUpload(true);
  }, []);

  const createProduct = useCallback(
    (values: ProductRequestView) => {
      setIsLoadingSaveButton(true);
      let variantsHasProductAvatar: VariantRequestView[] = variants;
      if (values.saleable) {
        variantsHasProductAvatar = getFirstProductAvatarCreate(variants);
      }
      const request = convertProductViewToRequest(
        {
          ...values,
          description: form.getFieldValue("description"),
          care_labels: careLabelsString,
        },
        variantsHasProductAvatar,
        status,
      );
      dispatch(productCreateAction(request, createCallback));
    },
    [createCallback, dispatch, careLabelsString, status, variants, form],
  );

  const cancelModal = useCallback(() => {
    setModalConfirm({
      visible: false,
    });
  }, []);

  const validateCreateProduct = useCallback(() => {
    form
      .validateFields()
      .then((values: ProductRequestView) => {
        let currencyCheck: any = {};
        let failCurrency = false;
        values.variant_prices.forEach((item) => {
          if (currencyCheck[item.currency] === undefined) {
            currencyCheck[item.currency] = 1;
          } else {
            failCurrency = true;
          }
        });
        if (failCurrency) {
          showError("Trùng đơn vị tiền");
          return;
        }

        if (sizeSelected.length > 0 && colorSelected.length > 0) {
          form.submit();
        } else {
          let notSelected: string;
          if (sizeSelected.length === 0 && colorSelected.length > 0) {
            notSelected = "kích cỡ";
          } else if (colorSelected.length === 0 && sizeSelected.length > 0) {
            notSelected = "màu sắc";
          } else {
            notSelected = "kích cỡ và màu sắc";
          }
          const subTitle = `Bạn chưa chọn ${notSelected}. Bạn có muốn tạo sản phẩm?`;
          setModalConfirm({
            visible: true,
            onCancel: cancelModal,
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
        const element: any = document.getElementById(error.errorFields[0].name.join(""));
        element?.focus();
        const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
  }, [colorSelected.length, form, cancelModal, sizeSelected.length]);

  const resetData = useCallback(() => {
    setModalConfirm({
      visible: true,
      onCancel: cancelModal,
      onOk: () => {
        form.resetFields();
        setModalConfirm({ visible: false });
        window.scrollTo(0, 0);
        showSuccess("Đặt lại dữ liệu thành công");
      },
      title: "Bạn có muốn đặt lại thông tin đã nhập",
      subTitle: "Sau khi đặt lại trang sẽ được đặt về mặt định. Bạn có muốn đặt lại?",
    });
  }, [form, cancelModal]);

  const deleteVariant = useCallback(
    (sku: string) => {
      const index = variants.findIndex((item) => item.sku === sku);

      variants.splice(index, 1);
      setVariants([...variants]);
    },
    [variants],
  );

  const pickAvatar = useCallback(() => {
    setIsVisiblePickAvatar(true);
  }, []);

  const productAvatar = useMemo(() => {
    let avatar = null;
    variants.forEach((variant) => {
      variant.variant_images.forEach((variantImage) => {
        if (variantImage.product_avatar) {
          avatar = variantImage.url;
        }
      });
    });
    return avatar;
  }, [variants]);

  const getFirstProductAvatarCreate = (variants: Array<VariantRequestView>) => {
    let isFind = false;
    let variantAvatarIndex = 0;
    const FIRST_VARIANT_IMAGE_INDEX = 0;

    const revertVariants = variants.reverse();

    revertVariants.forEach((item, i) => {
      if (!isFind) {
        item.variant_images.forEach((item) => {
          if (item.product_avatar) {
            isFind = true;
          } else {
            variantAvatarIndex = i;
          }
        });
      }
    });

    if (!isFind && revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX]) {
      revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX].product_avatar =
        true;
    }

    return revertVariants.reverse();
  };

  const getCollections = useCallback(
    (code: string, page: number) => {
      setCollectionLoading(true);
      dispatch(
        getCollectionRequestAction({ condition: code, page: page }, (res) => {
          setCollections(res);
          setCollectionLoading(false);
        }),
      );
    },
    [dispatch, setCollections],
  );

  const saveImage = useCallback(
    (imageId: number) => {
      variants.forEach((item) => {
        item.variant_images.forEach((item1) => {
          if (item1.image_id === imageId) {
            item1.product_avatar = true;
          }
        });
      });
      setVariants([...variants]);
      setIsVisiblePickAvatar(false);
    },
    [variants],
  );

  const getColors = useCallback(
    (info: string, page: number) => {
      setIsColorLoading(true);
      dispatch(
        getColorAction({ info: info, is_main_color: 0, page: page }, (res) => {
          setColors(res);
          setIsColorLoading(false);
        }),
      );
    },
    [dispatch],
  );

  const getSizes = useCallback(
    (code: string, page: number) => {
      setIsSizeLoading(true);
      dispatch(
        sizeSearchAction({ code: code, page: page }, (res) => {
          setSizes(res);
          setIsSizeLoading(false);
        }),
      );
    },
    [dispatch],
  );

  const getSuppliers = useCallback(
    (key: string, page: number) => {
      setIsSupplierLoading(true);
      dispatch(
        SupplierSearchAction(
          { condition: key, page: page },
          (data: PageResponse<SupplierResponse>) => {
            setSupplier(data);
            setIsSupplierLoading(false);
          },
        ),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (!isLoadMaterData.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(
        getMaterialAction({ status: "active", limit: 1000 }, (res) => {
          if (res) {
            setListMaterial(res.items);
          }
        }),
      );
      dispatch(CountryGetAllAction(setListCountry));
      getColors("", 1);
      getSizes("", 1);

      getCollections("", 1);
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [
    dispatch,
    getCollections,
    getColors,
    getSizes,
    getSuppliers,
    setDataAccounts,
    setDataCategory,
  ]);

  useEffect(() => {
    form.setFieldsValue({ made_in_id: VietNamId });
    form.setFieldsValue({ length_unit: "cm" });
  }, [form]);

  const changeImportPrice = useCallback(
    (e: any) => {
      let variant_prices = form.getFieldValue("variant_prices");
      if (!variant_prices) return;
      variant_prices[0].cost_price = e * 1.08;

      form.setFieldsValue({
        variant_prices: variant_prices,
      });
    },
    [form],
  );

  useEffect(() => {
    getCollections("", 1);
  }, [getCollections]);

  const renderTaxConfig = () => {
    const VNTaxConfig = taxConfig?.data.find(
      (country: TaxConfigCountry) => country.country_code === VN_CODE,
    );
    return taxConfig ? (
      <>
        <p className="tax-description">
          Giá {taxConfig.tax_included ? "đã" : "chưa"} bao gồm thuế!
        </p>
        <div className="tax-rate">Thuế VAT: {VNTaxConfig?.tax_rate}%</div>
      </>
    ) : (
      <Typography.Text type="danger">Không có cấu hình thuế!</Typography.Text>
    );
  };

  return (
    <Form form={form} onFinish={createProduct} initialValues={initialForm} layout="vertical">
      <Item noStyle name="product_type" hidden>
        <Input />
        <Item noStyle name="component" hidden>
          <Input />
        </Item>
        <Item noStyle name="advantages" hidden>
          <Input />
        </Item>
        <Item noStyle name="defect" hidden>
          <Input />
        </Item>
      </Item>
      <StyledComponent>
        <ContentContainer
          title="Thêm mới sản phẩm"
          breadcrumb={[
            {
              name: "Sản phẩm",
              path: UrlConfig.HOME,
            },
            {
              name: "Quản lý sản phẩm",
              path: `${UrlConfig.VARIANTS}`,
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
                          onChange={(checked) => {
                            setStatus(checked ? "active" : "inactive");
                            form.setFieldsValue({ saleable: checked });
                          }}
                          defaultChecked
                        />
                      </Item>
                      <label className={status === "active" ? "text-success" : "text-error"}>
                        {statusValue}
                      </label>
                    </div>
                  </Space>
                }
              >
                <Row gutter={50} />
                <Row gutter={50}>
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
                      <TreeSelect
                        placeholder="Chọn danh mục"
                        treeDefaultExpandAll
                        treeNodeFilterProp="title"
                        showSearch
                        className="selector"
                        onChange={changeCategory}
                      >
                        {listCategory.map((item, index) => (
                          <React.Fragment key={index}>{TreeCategory(item)}</React.Fragment>
                        ))}
                      </TreeSelect>
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn ngành hàng",
                        },
                      ]}
                      name="goods"
                      label="Ngành hàng"
                    >
                      <CustomSelect placeholder="Chọn ngành hàng " disabled>
                        {goods?.map((item) => (
                          <CustomSelect.Option key={item.value} value={item.value}>
                            {item.name}
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
                          pattern: RegUtil.NUMBER_AND_CHARACTER,
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
                      normalize={(value: string) => (value || "").toUpperCase()}
                    >
                      <Input
                        maxLength={7}
                        placeholder="Nhập mã sản phẩm"
                        onChange={changeProductCode}
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
                          max: 255,
                          message: "Tên sản phẩm không vượt quá 255 ký tự",
                        },
                      ]}
                      tooltip={{
                        title: "Tên mã cha, không bao gồm màu sắc và kích cỡ",
                        icon: <InfoCircleOutlined />,
                      }}
                      name="name"
                      label="Tên sản phẩm"
                    >
                      <Input
                        className=""
                        onChange={changeVariantName}
                        maxLength={255}
                        placeholder="Nhập tên sản phẩm"
                      />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24} md={12} sm={24}>
                    <Item name="brand" label="Thương hiệu">
                      <BaseSelect
                        data={brandList}
                        renderItem={(item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        )}
                        placeholder="Chọn thương hiệu"
                      />
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item
                      label="Nhóm hàng"
                      name="product_collections"
                      rules={
                        isProductCollectionRequired
                          ? [
                              {
                                required: true,
                                message: "Vui lòng chọn nhóm hàng",
                              },
                            ]
                          : []
                      }
                    >
                      <BaseSelectPaging
                        metadata={collections.metadata}
                        data={collections.items}
                        renderItem={(item) => (
                          <Option key={item.code} value={item.code}>
                            {`${item.code} - ${item.name}`}
                          </Option>
                        )}
                        placeholder="Chọn nhóm hàng"
                        mode="multiple"
                        loading={isCollectionLoading}
                        fetchData={(query) =>
                          getCollections(query.condition || "", query.page || 1)
                        }
                      />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24} md={12} sm={24}>
                    <Item name="material" hidden={true} />
                    <Item name="material_id" className="po-form" label="Chất liệu">
                      <Select
                        autoClearSearchValue={false}
                        showSearch
                        optionFilterProp="children"
                        placeholder="Chọn chất liệu"
                        onChange={changeMaterial}
                        allowClear
                      >
                        {listMaterial?.map((item) => (
                          <CustomSelect.Option className="po-form" key={item.id} value={item.id}>
                            {item.name} <span className="icon-dot" /> {item.fabric_code}
                          </CustomSelect.Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item name="made_in_id" label="Xuất xứ">
                      <CustomSelect
                        autoClearSearchValue={false}
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
                    <Item name="unit" label="Đơn vị">
                      <CustomSelect placeholder="Chọn đơn vị">
                        {productUnitList?.map((item) => (
                          <CustomSelect.Option key={item.value} value={item.value}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item name="suppliers" label="Nhà cung cấp">
                      <BaseSelectPaging
                        loading={isSupplierLoading}
                        metadata={suppliers.metadata}
                        data={suppliers.items}
                        mode="multiple"
                        renderItem={(item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        )}
                        fetchData={(query) => getSuppliers(query?.condition || "", query.page || 1)}
                        placeholder={"Chọn nhà cung cấp"}
                      />
                    </Item>
                  </Col>
                  {/* tuwf k */}
                </Row>
                <Row gutter={50}>
                  <Col span={24} md={12} sm={24}>
                    <Item label="Kích thước đóng gói (dài, rộng, cao)">
                      <Input.Group compact>
                        <Item name="length" noStyle>
                          <NumberInput
                            maxLength={6}
                            isFloat
                            style={{ width: "calc((100% - 100px) / 3)" }}
                            placeholder="Dài"
                          />
                        </Item>
                        <Item name="width" noStyle>
                          <NumberInput
                            maxLength={6}
                            isFloat
                            style={{ width: "calc((100% - 100px) / 3)" }}
                            placeholder="Rộng"
                          />
                        </Item>
                        <Item name="height" noStyle>
                          <NumberInput
                            maxLength={6}
                            isFloat
                            placeholder="Cao"
                            style={{ width: "calc((100% - 100px) / 3)" }}
                          />
                        </Item>
                        <Item name="length_unit" noStyle>
                          <Select placeholder="Đơn vị" style={{ width: "100px" }}>
                            {lengthUnitList?.map((item) => (
                              <Select.Option key={item.value} value={item.value}>
                                {item.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Item>
                      </Input.Group>
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item required label="Khối lượng">
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
                            maxLength={6}
                            isFloat
                            placeholder="Khối lượng"
                            style={{ width: "calc(100% - 100px)" }}
                          />
                        </Item>
                        <Item name="weight_unit" noStyle>
                          <Select placeholder="Đơn vị" style={{ width: "100px" }} value="gram">
                            {weightUnitList?.map((item) => (
                              <Select.Option key={item.value} value={item.value}>
                                {item.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Item>
                      </Input.Group>
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
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
                  <Col span={24} md={12} sm={24}>
                    <Item label="Thông tin bảo quản">
                      {careLabels.map((item: any) => (
                        <Popover content={item.name}>
                          <span className={`care-label ydl-${item.value}`} />
                        </Popover>
                      ))}
                      <Button
                        className={`button-plus`}
                        icon={
                          careLabelsString && careLabelsString.length > 0 ? (
                            <EditOutlined />
                          ) : (
                            <PlusOutlined />
                          )
                        }
                        onClick={() => setIsShowCareModal(true)}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <Collapse
                      key="description"
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
                        extra={
                          <div>
                            <Checkbox
                              defaultChecked={true}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => {
                                setIsChangeDescription(event.target.checked);
                              }}
                            >
                              Lấy thông tin mô tả từ chất liệu
                            </Checkbox>
                          </div>
                        }
                      >
                        <Item name="description">
                          <CustomEditor />
                        </Item>
                      </Collapse.Panel>
                    </Collapse>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24} md={6}>
              <Card className="card" title="Ảnh" hidden>
                <div className="a-container">
                  {productAvatar === null ? (
                    <div className="bpa" onClick={pickAvatar}>
                      <PlusOutlined />
                      Chọn ảnh đại diện
                    </div>
                  ) : (
                    <div className="bpa" onClick={pickAvatar}>
                      <Image src={productAvatar} preview={false} />
                    </div>
                  )}
                </div>
              </Card>
              <Card className="card" title="Phòng Win">
                <Item
                  name="merchandiser_code"
                  label="Merchandiser"
                  tooltip={{
                    title: "Chọn nhân viên mua hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <BaseSelectMerchans {...{ isLoadingMerchans, fetchMerchans, merchans }} />
                </Item>
                <Item
                  name="designer_code"
                  label="Thiết kế"
                  tooltip={{
                    title: " Chọn nhân viên thiết kế",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <BaseSelectMerchans
                    {...{ isLoadingMerchans, fetchMerchans, merchans }}
                    placeholder="Chọn thiết kế"
                  />
                </Item>
              </Card>
              <Card
                title="Thuế"
                extra={
                  <Space>
                    <Item name={ProductField.taxable} noStyle>
                      <Switch
                        disabled={!allowUpdateTax}
                        onChange={(checked: boolean) =>
                          form.setFieldsValue({ [ProductField.taxable]: checked })
                        }
                        defaultChecked
                      />
                    </Item>
                  </Space>
                }
              >
                <Item shouldUpdate={(prev, cur) => prev.taxable !== cur.taxable} noStyle>
                  {({ getFieldValue }) => {
                    const isTaxed = getFieldValue(ProductField.taxable);
                    return isTaxed ? (
                      renderTaxConfig()
                    ) : (
                      <div className="tax-description">Không áp dụng!</div>
                    );
                  }}
                </Item>
              </Card>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Card className="card" title="Thông tin giá">
                <List name="variant_prices">
                  {(fields, { remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey }) => (
                        <Row key={key} gutter={16}>
                          <Col md={5}>
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
                                    <b>Giá bán lẻ</b> là giá mà bạn sẽ bán sản phẩm này cho những
                                    khách hàng đơn lẻ..
                                  </div>
                                ),
                                icon: <InfoCircleOutlined />,
                              }}
                            >
                              <NumberInput
                                format={(a: string) => formatCurrencyForProduct(a, ",")}
                                replace={(a: string) => replaceFormatString(a)}
                                maxLength={15}
                                placeholder="VD: 100,000"
                              />
                            </Item>
                          </Col>
                          <Col md={5}>
                            <Item
                              name={[name, "wholesale_price"]}
                              fieldKey={[fieldKey, "wholesale_price"]}
                              label="Giá buôn"
                              tooltip={{
                                title: () => (
                                  <div>
                                    <b>Giá buôn</b> là giá mà bạn sẽ bán sản phẩm này cho những
                                    khách hàng mua hàng với số lượng lớn.
                                  </div>
                                ),
                                icon: <InfoCircleOutlined />,
                              }}
                            >
                              <NumberInput
                                format={(a: string) => formatCurrencyForProduct(a, ",")}
                                replace={(a: string) => replaceFormatString(a)}
                                maxLength={15}
                                placeholder="VD: 100,000"
                              />
                            </Item>
                          </Col>
                          <Col md={5}>
                            <Item
                              name={[name, "import_price"]}
                              fieldKey={[fieldKey, "import_price"]}
                              label="Giá nhập"
                              tooltip={{
                                title: () => (
                                  <div>
                                    <b>Giá nhập</b> là giá mà nhập sản phẩm từ đơn mua hàng của nhà
                                    cung cấp.
                                  </div>
                                ),
                                icon: <InfoCircleOutlined />,
                              }}
                            >
                              <NumberInput
                                maxLength={15}
                                format={(a: string) => formatCurrencyForProduct(a, ",")}
                                replace={(a: string) => replaceFormatString(a)}
                                placeholder="VD: 100,000"
                                onChange={changeImportPrice}
                                disabled
                              />
                            </Item>
                          </Col>
                          <Col md={5}>
                            <Item
                              name={[name, "cost_price"]}
                              fieldKey={[fieldKey, "cost_price"]}
                              label="Giá vốn"
                              tooltip={{
                                title: () => (
                                  <div>
                                    <b>Giá vốn</b> là tổng của những loại chi phí để đưa hàng có mặt
                                    tại kho. Chúng bao gồm giá mua của nhà cung cấp, thuế giá trị
                                    gia tăng, chi phí vận chuyển, bảo hiểm,...
                                  </div>
                                ),
                                icon: <InfoCircleOutlined />,
                              }}
                            >
                              <NumberInput
                                disabled
                                maxLength={15}
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
                              <CustomSelect placeholder="Đơn vị tiền tệ" disabled>
                                {currencyList?.map((item) => (
                                  <CustomSelect.Option key={item.value} value={item.value}>
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
                              <Button onClick={() => remove(name)} icon={<DeleteOutlined />} />
                            </Col>
                          )}
                        </Row>
                      ))}
                    </>
                  )}
                </List>
              </Card>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Card
                className="card"
                title="Tạo phiên bản sản phẩm"
                extra={
                  <div className="extra-cards">
                    <b>Cho phép bán:</b>
                    <Item valuePropName="checked" name="saleable" noStyle>
                      <Switch disabled={status === "inactive"} />
                    </Item>
                  </div>
                }
              >
                <Row gutter={50}>
                  <Col span={24} md={12} sm={24}>
                    <Item label="Màu sắc" name="color_id">
                      <BaseSelectPaging
                        loading={isColorLoading}
                        metadata={colors.metadata}
                        data={colors.items}
                        renderItem={(item) => (
                          <Option key={item.id} value={item.id}>
                            {`${item.code} - ${item.name}`}
                          </Option>
                        )}
                        valueSearch={valueSearch}
                        onSearch={(value) => {
                          setValueSearch(value || "");
                        }}
                        onSelect={onColorSelected}
                        onDeselect={(colorID, _) => {
                          setColorSelected(colorSelected.filter((slt) => slt.id !== colorID));
                        }}
                        placeholder="Chọn màu sắc"
                        notFoundContent={"Không có dữ liệu"}
                        mode="multiple"
                        fetchData={(params) =>
                          getColors(params.condition || params?.info || "", params.page || 1)
                        }
                      />
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item name="size" label="Kích cỡ">
                      <BaseSelectPaging
                        loading={isSizeLoading}
                        metadata={sizes.metadata}
                        data={sizes.items}
                        renderItem={(item) => (
                          <Option key={item.code} value={item.id}>
                            {item.code}
                          </Option>
                        )}
                        onDeselect={(sizeID, _) => {
                          setSizeSelected(sizeSelected.filter((size) => size.id !== sizeID));
                        }}
                        onSelect={changeSelectedSize}
                        placeholder="Chọn kích cỡ"
                        notFoundContent={"Không có dữ liệu"}
                        mode="multiple"
                        fetchData={(params) => getSizes(params.condition || "", params.page || 1)}
                      />
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
                      render: (images: Array<VariantImage>, item: VariantRequestView) => {
                        let image = findAvatar(images);
                        return (
                          <ImageProduct
                            path={image !== null ? image.url : null}
                            onClick={() => {
                              uploadVariantImage(item);
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
                      title: "Màu",
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
              </Card>
            </Col>
          </Row>
          <BottomBarContainer
            back="Quay lại sản phẩm"
            rightComponent={
              <Space>
                <Button onClick={resetData}>Đặt lại</Button>
                <Button
                  onClick={validateCreateProduct}
                  loading={isLoadingSaveButton}
                  type="primary"
                >
                  Tạo sản phẩm
                </Button>
              </Space>
            }
          />
          <ModalConfirm {...modalConfirm} />
          <ModalPickAvatar
            onOk={saveImage}
            onCancel={() => setIsVisiblePickAvatar(false)}
            variantImages={variantImages}
            visible={isVisiblePickAvatar}
          />
          <UploadImageModal
            onCancel={() => {
              setIsVisibleUpload(false);
            }}
            visible={isVisibleUpload}
            variant={variant}
            onSave={(variant_images) => {
              let index = variants.findIndex((item) => item.sku === variant?.sku);
              if (index !== -1) {
                variants[index].variant_images = variant_images;
              }
              setVariants([...variants]);
              // getFirstProductAvatarCreate(variants)
              setIsVisibleUpload(false);
            }}
          />
          <CareModal
            onCancel={() => setIsShowCareModal(false)}
            onOk={(data) => {
              setCareLabelsString(data);
              setIsShowCareModal(false);
            }}
            isVisible={isShowCareModal}
            careLabels={careLabelsString}
          />
        </ContentContainer>
      </StyledComponent>
    </Form>
  );
};

const TreeCategory = (categoryResponse: CategoryResponse) => {
  return (
    <TreeNode
      value={categoryResponse.id}
      title={
        categoryResponse.code
          ? `${categoryResponse.code} - ${categoryResponse.name}`
          : categoryResponse.name
      }
    >
      {categoryResponse.children.length > 0 && (
        <React.Fragment>
          {categoryResponse.children.map((categoryResponse, index) => (
            <React.Fragment key={index}>{TreeCategory(categoryResponse)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeNode>
  );
};

export default ProductCreateScreen;
