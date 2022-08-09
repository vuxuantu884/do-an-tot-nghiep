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
import { detailMaterialAction, materialSearchAll } from "domain/actions/product/material.action";
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
import { colorDetailApi } from "service/product/color.service";
import { callApiNative } from "utils/ApiUtils";
import {
  convertCategory,
  formatCurrency,
  formatCurrencyForProduct,
  Products,
  replaceFormatString,
  capitalEachWords,
} from "utils/AppUtils";
import { ArrDefects, DEFAULT_COMPANY, VietNamId } from "utils/Constants";
import { handleChangeMaterial } from "utils/ProductUtils";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { careInformation } from "../component/CareInformation/care-value";
import CareModal from "../component/CareInformation/CareModal";
import ImageProduct from "../component/image-product.component";
import ModalPickAvatar from "../component/ModalPickAvatar";
import UploadImageModal, { VariantImageModel } from "../component/upload-image.modal";
import { StyledComponent } from "./styles";
import BaseSelectPaging from "component/base/BaseSelect/BaseSelectPaging";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { useFetchMerchans } from "hook/useFetchMerchans";
import BaseSelect from "component/base/BaseSelect/BaseSelect";
const { TreeNode } = TreeSelect;
const { Item, List } = Form;
const { Option } = Select;

type Defect = {
  code: string;
  name: string;
};

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
  supplier_id: null,
  material: null,
  component: null,
  advantages: null,
  defect: null,
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
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [status, setStatus] = useState<string>(initialRequest.status);
  const [isVisibleUpload, setVisibleUpload] = useState<boolean>(false);
  const [visiblePickAvatar, setVisiblePickAvatar] = useState<boolean>(false);
  const [variant, setVariant] = useState<VariantImageModel | null>(null);
  const [showCareModal, setShowCareModal] = useState(false);
  const [changeDescription, setIsChangeDescription] = useState(true);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [sizeLoading, setSizeLoading] = useState(false);
  const [colorLoading, setColorLoading] = useState(false);
  const [defects, setDefects] = useState<Array<Defect>>([]);
  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [careLabelsString, setCareLabelsString] = useState("");
  const [collections, setCollections] = useState<PageResponse<CollectionResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();
  //end category
  //end state

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setLstCategoryAll(temp);
    setListCategory(arr);
  }, []);

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return false;
    }
  }, []);

  const onCategoryChange = useCallback(
    (value: number, b, c) => {
      const category = lstCategoryAll.find((item) => item.id === value);

      if (category && category.child_ids === null) {
        form.setFieldsValue({
          code: category.code ?? "",
          name: capitalEachWords(category.name),
        });
      } else {
        showWarning("Vui lòng chọn danh mục con");
        form.setFieldsValue({
          category_id: null,
        });
      }
    },
    [form, lstCategoryAll],
  );

  const listVariantsFilter = useCallback(
    (colors: Array<ColorResponse>, sizes: Array<SizeResponse>) => {
      let code = form.getFieldValue("code");
      let name = form.getFieldValue("name");
      name = capitalEachWords(name);
      form.setFieldsValue({
        name: name,
      });

      if (name && code) {
        let newVariants: Array<VariantRequestView> = [];
        if (colors.length > 0 && sizes.length > 0) {
          colors.forEach((i1) => {
            sizes.forEach((i2) => {
              let sku = `${code}-${i1.code}-${i2.code}`;
              newVariants.push({
                name: `${name} - ${i1.name} - ${i2.code}`,
                code: i1.code,
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
          sizes.forEach((i2: any) => {
            newVariants.push({
              name: `${name} - ${i2.code}`,
              code: null,
              color_id: null,
              color: null,
              size_id: i2.id,
              size: i2.code,
              sku: `${code}-${i2.color}`,
              variant_images: [],
              quantity: 0,
            });
          });
        } else if (colors.length >= 0 && sizes.length === 0) {
          colors.forEach((i1) => {
            newVariants.push({
              name: `${name} - ${i1.name}`,
              color_id: i1.id,
              code: i1.code,
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
            code: null,
            color: null,
            size_id: null,
            size: null,
            sku: `${code}-MAU`,
            quantity: 0,
            variant_images: [],
          });

          const arrDefectSpecial = ArrDefects.filter((e) => e.isSpecial === 1);

          for (let i = 0; i < arrDefectSpecial.length; i++) {
            const e = arrDefectSpecial[i];

            newVariants.push({
              name: `${name} - ${e.name}`,
              color_id: null,
              code: null,
              color: null,
              size_id: null,
              size: null,
              sku: `${code}-${e.code}`,
              quantity: 0,
              variant_images: [],
              saleable: false,
              defect_code: `${e.code}`,
              type: 1,
            });
          }

          setDefects([...arrDefectSpecial]);
        }

        for (let i = 0; i < defects.length; i++) {
          const e = defects[i];
          if (!newVariants.find((v) => v.defect_code === e.code)) {
            newVariants.push({
              name: `${name} - ${e.name}`,
              color_id: null,
              code: null,
              color: null,
              size_id: null,
              size: null,
              sku: `${code}-${e.code}`,
              quantity: 0,
              variant_images: [],
              saleable: false,
              defect_code: `${e.code}`,
              type: 1,
            });
          }
        }

        let uniqueObjArray = [...new Map(newVariants.map((item) => [item["sku"], item])).values()];
        setVariants([...uniqueObjArray]);
      }
    },
    [defects, form],
  );

  const onCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onNameChange();
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

  const onNameChange = useCallback(() => {
    listVariantsFilter(colorSelected, sizeSelected);
  }, [colorSelected, listVariantsFilter, sizeSelected]);

  const onMaterialChange = useCallback(
    (id: number) => {
      if (changeDescription && id) {
        dispatch(
          detailMaterialAction(id, (material) => {
            handleChangeMaterial(material, form);
            if (material && material.care_labels) {
              setCareLabelsString(material.care_labels);
            } else {
              setCareLabelsString("");
            }
          }),
        );
      }
    },
    [changeDescription, dispatch, form],
  );

  const onSizeSelected = useCallback(
    (value: number, objSize: any) => {
      let size: string = "";
      if (objSize && objSize?.children) {
        size = objSize?.children.split(" ")[0];
      }
      const newSize = { id: value, code: size } as SizeResponse;
      let filter = [
        ...variants.filter((e) => e.size !== null).map((e) => ({ id: e.size_id, code: e.size })),
        newSize,
      ] as Array<SizeResponse>;

      setSizeSelected([...filter]);
      listVariantsFilter(colorSelected, filter);
    },
    [colorSelected, listVariantsFilter, variants],
  );

  const onColorSelected = useCallback(
    async (value: number, objColor: any) => {
      let colorCode: string = "";
      let colorName: string = "";

      const res = await callApiNative({ isShowLoading: false }, dispatch, colorDetailApi, value);
      if (res) {
        colorCode = res.code;
        colorName = res.name;
      }

      const newColor = {
        id: value,
        name: colorName,
        code: colorCode,
      } as ColorResponse;
      let filter = [
        ...variants
          .filter((e) => e.color !== null)
          .map((e: any) => ({ id: e.color_id, name: e.color, code: e.code })),
        newColor,
      ] as Array<ColorResponse>;
      setColorSelected([...filter]);
      listVariantsFilter(filter, sizeSelected);
    },
    [listVariantsFilter, sizeSelected, variants, dispatch],
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

  const variantImages = useMemo(() => {
    let arr: Array<VariantImage> = [];
    variants.forEach((item) => {
      arr = [...arr, ...item.variant_images];
    });
    return arr;
  }, [variants]);

  useEffect(() => {
    const newSelected = careLabelsString ? careLabelsString.split(";") : [];
    let careLabels: any[] = [];
    newSelected.forEach((value: string) => {
      careInformation.washing.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });

      careInformation.beleaching.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
      careInformation.ironing.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
      careInformation.drying.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
      careInformation.professionalCare.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
    });
    setCareLabels(careLabels);
  }, [careLabelsString]);

  const createCallback = useCallback(
    (result: ProductResponse) => {
      setLoadingSaveButton(false);
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.PRODUCT}/${result.id}`);
      }
    },
    [history],
  );

  const onClickUpload = useCallback((item: VariantRequestView, index: number) => {
    setVariant({
      name: item.name,
      sku: item.sku,
      variant_images: item.variant_images,
    });
    setVisibleUpload(true);
  }, []);

  const onFinish = useCallback(
    (values: ProductRequestView) => {
      setLoadingSaveButton(true);
      let variantsHasProductAvatar: VariantRequestView[] = variants;
      if (values.saleable) {
        variantsHasProductAvatar = getFirstProductAvatarCreate(variants);
      }
      let request = Products.convertProductViewToRequest(
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

  const onCancel = useCallback(() => {
    setModalConfirm({
      visible: false,
    });
  }, []);

  const onClickAdd = useCallback(() => {
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
          let notSelected = "";
          if (sizeSelected.length === 0 && colorSelected.length > 0) {
            notSelected = "kích cỡ";
          } else if (colorSelected.length === 0 && sizeSelected.length > 0) {
            notSelected = "màu sắc";
          } else {
            notSelected = "kích cỡ và màu sắc";
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
        const element: any = document.getElementById(error.errorFields[0].name.join(""));
        element?.focus();
        const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
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
      subTitle: "Sau khi đặt lại trang sẽ được đặt về mặt định. Bạn có muốn đặt lại?",
    });
  }, [form, onCancel]);

  const deleteVariant = useCallback(
    (sku: string) => {
      let index = variants.findIndex((item) => item.sku === sku);
      if (variants[index].defect_code && variants[index].defect_code !== "") {
        let lstDefects = [...defects];
        lstDefects = lstDefects.filter((e) => e.code !== variants[index].defect_code);

        setDefects([...lstDefects]);
      }
      variants.splice(index, 1);
      setVariants([...variants]);
    },
    [defects, variants],
  );

  const onPickAvatar = useCallback(() => {
    setVisiblePickAvatar(true);
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
        item.variant_images.forEach((item, j) => {
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

  const onSaveImage = useCallback(
    (imageId: number) => {
      variants.forEach((item) => {
        item.variant_images.forEach((item1) => {
          if (item1.image_id === imageId) {
            item1.product_avatar = true;
          }
        });
      });
      setVariants([...variants]);
      setVisiblePickAvatar(false);
    },
    [variants],
  );

  const getColors = useCallback(
    (info: string, page: number) => {
      setColorLoading(true);
      dispatch(
        getColorAction({ info: info, is_main_color: 0, page: page }, (res) => {
          setColors(res);
          setColorLoading(false);
        }),
      );
    },
    [dispatch],
  );

  const getSizes = useCallback(
    (code: string, page: number) => {
      setSizeLoading(true);
      dispatch(
        sizeSearchAction({ code: code, page: page }, (res) => {
          setSizes(res);
          setSizeLoading(false);
        }),
      );
    },
    [dispatch],
  );

  const getSuppliers = useCallback(
    (key: string, page: number) => {
      setSupplierLoading(true);
      dispatch(
        SupplierSearchAction(
          { condition: key, page: page },
          (data: PageResponse<SupplierResponse>) => {
            setSupplier(data);
            setSupplierLoading(false);
          },
        ),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (!isLoadMaterData.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(materialSearchAll(setListMaterial));
      dispatch(CountryGetAllAction(setListCountry));
      getColors("", 1);
      getSizes("", 1);
      getSuppliers("", 1);
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [dispatch, getColors, getSizes, getSuppliers, setDataAccounts, setDataCategory]);

  useEffect(() => {
    form.setFieldsValue({ made_in_id: VietNamId });
    form.setFieldsValue({ length_unit: "cm" });
  }, [form]);

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

  const onChangeImportPrice = useCallback(
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

  return (
    <Form form={form} onFinish={onFinish} initialValues={initialForm} layout="vertical">
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
                          className="ant-switch-success"
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
                <Row gutter={50}></Row>
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
                        onChange={onCategoryChange}
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
                      <Input maxLength={7} placeholder="Nhập mã sản phẩm" onChange={onCodeChange} />
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
                        onChange={onNameChange}
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
                    <Item label="Nhóm hàng" name="product_collections">
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
                        loading={collectionLoading}
                        fetchData={(query) =>
                          getCollections(query.condition || "", query.page || 1)
                        }
                      />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24} md={12} sm={24}>
                    <Item name="material" hidden={true}></Item>
                    <Item name="material_id" className="po-form" label="Chất liệu">
                      <Select
                        showSearch
                        optionFilterProp="children"
                        placeholder="Chọn chất liệu"
                        onChange={onMaterialChange}
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
                    <Item name="supplier_id" label="Nhà cung cấp">
                      <BaseSelectPaging
                        loading={supplierLoading}
                        metadata={suppliers.metadata}
                        data={suppliers.items}
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
                          <span className={`care-label ydl-${item.value}`}></span>
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
                        onClick={() => setShowCareModal(true)}
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
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                setIsChangeDescription(e.target.checked ? true : false);
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
                    <div className="bpa" onClick={onPickAvatar}>
                      <PlusOutlined />
                      Chọn ảnh đại diện
                    </div>
                  ) : (
                    <div className="bpa" onClick={onPickAvatar}>
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
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Card className="card" title="Thông tin giá">
                <List name="variant_prices">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...restField }, index) => (
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
                          <Col md={3}>
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
                          <Col md={3}>
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
                                onChange={onChangeImportPrice}
                                disabled
                              />
                            </Item>
                          </Col>
                          <Col md={3}>
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
                          <Col md={3}>
                            <Item
                              label="Thuế"
                              name={[name, "tax_percent"]}
                              fieldKey={[fieldKey, "tax_percent"]}
                            >
                              <NumberInput
                                isFloat
                                placeholder="VD: 10"
                                suffix={<span>%</span>}
                                maxLength={15}
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
                                  message: "Đơn vị tiền tệ không được để trống",
                                },
                              ]}
                              name={[name, "currency"]}
                              fieldKey={[fieldKey, "currency"]}
                            >
                              <CustomSelect placeholder="Đơn vị tiền tệ">
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
                      <Switch disabled={status === "inactive"} className="ant-switch-success" />
                    </Item>
                  </div>
                }
              >
                <Row gutter={50}>
                  <Col span={24} md={12} sm={24}>
                    <Item label="Màu sắc" name="color_id">
                      <BaseSelectPaging
                        loading={colorLoading}
                        metadata={colors.metadata}
                        data={colors.items}
                        renderItem={(item) => (
                          <Option key={item.id} value={item.id}>
                            {`${item.code} - ${item.name}`}
                          </Option>
                        )}
                        onSelect={onColorSelected}
                        placeholder="Chọn màu sắc"
                        notFoundContent={"Không có dữ liệu"}
                        mode="multiple"
                        fetchData={(params) => getColors(params.condition || "", params.page || 1)}
                      />
                    </Item>
                  </Col>
                  <Col span={24} md={12} sm={24}>
                    <Item name="size" label="Kích cỡ">
                      <BaseSelectPaging
                        loading={sizeLoading}
                        metadata={sizes.metadata}
                        data={sizes.items}
                        renderItem={(item) => (
                          <Option key={item.code} value={item.id}>
                            {item.code}
                          </Option>
                        )}
                        onSelect={onSizeSelected}
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
                      render: (
                        images: Array<VariantImage>,
                        item: VariantRequestView,
                        index: number,
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
                <Button onClick={onClickReset}>Đặt lại</Button>
                <Button onClick={onClickAdd} loading={loadingSaveButton} type="primary">
                  Tạo sản phẩm
                </Button>
              </Space>
            }
          />
          <ModalConfirm {...modalConfirm} />
          <ModalPickAvatar
            onOk={onSaveImage}
            onCancel={() => setVisiblePickAvatar(false)}
            variantImages={variantImages}
            visible={visiblePickAvatar}
          />
          <UploadImageModal
            onCancel={() => {
              setVisibleUpload(false);
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
              setVisibleUpload(false);
            }}
          />
          <CareModal
            onCancel={() => setShowCareModal(false)}
            onOk={(data) => {
              setCareLabelsString(data);
              setShowCareModal(false);
            }}
            visible={showCareModal}
            careLabels={careLabelsString}
          />
        </ContentContainer>
      </StyledComponent>
    </Form>
  );
};

const TreeCategory = (item: CategoryResponse) => {
  return (
    <TreeNode value={item.id} title={item.code ? `${item.code} - ${item.name}` : item.name}>
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>{TreeCategory(item)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeNode>
  );
};

export default ProductCreateScreen;
