import { EditOutlined, InfoCircleOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Form,
  Image,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Switch,
  TreeSelect,
  Upload,
} from "antd";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import HashTag from "component/custom/hashtag";
import NumberInput from "component/custom/number-input.custom";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import ColorSearchSelect from "component/custom/select-search/color-select";
import SizeSearchSelect from "component/custom/select-search/size-search";
import CustomSelect from "component/custom/select.custom";
import SelectPaging from "component/custom/SelectPaging";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import { detailMaterialAction, getMaterialAction } from "domain/actions/product/material.action";
import { productGetDetail, productUploadAction } from "domain/actions/product/products.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { CategoryResponse } from "model/product/category.model";
import { CollectionCreateRequest, CollectionResponse } from "model/product/collection.model";
import { MaterialResponse } from "model/product/material.model";
import { ProductUploadModel } from "model/product/product-upload.model";
import {
  ProductRequest,
  ProductResponse,
  VariantImage,
  VariantRequest,
  VariantResponse,
} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
  formatCurrencyForProduct,
  Products,
  replaceFormatString,
  scrollAndFocusToDomElement,
  capitalEachWords,
  convertVariantPrices,
} from "utils/AppUtils";
import { handleChangeMaterial } from "utils/ProductUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { careInformation } from "../component/CareInformation/care-value";
import CareModal from "../component/CareInformation/CareModal";
import ModalConfirmPrice from "../component/ModalConfirmPrice";
import ModalPickAvatar from "../component/ModalPickAvatar";
import ModalUpdatePrice from "../component/ModalUpdatePrice";
import VariantList from "../component/VariantList";
import { ProductParams } from "../ProductDetailScreen";
import AddVariantsModal from "./add-variants-modal";
import { StyledComponent } from "./styles";
import _, { debounce } from "lodash";
import ModalUploadImages from "../component/ModalUploadImages";
import TreeCategory from "../component/TreeCategory";
import SupplierSearchSelect from "component/custom/select-search/supplier-select";
import { callApiNative } from "utils/ApiUtils";
import { productUpdateApi } from "service/product/product.service";
import { SupplierResponse } from "model/core/supplier.model";

const { Item } = Form;
let tempActive: number = 0;

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

const ProductDetailScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const { id, variantId } = useParams<ProductParams>();
  const idNumber = parseInt(id);

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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductResponse | null>(null);
  const [listCategory, setListCategory] = useState<Array<CategoryResponse>>([]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [status, setStatus] = useState<string>("inactive");
  const [active, setActive] = useState<number>(tempActive);
  const [isChange, setChange] = useState<boolean>(false);
  const [loadingButton, setLoadingButton] = useState<boolean>(false);
  const [isChangePrice, setChangePrice] = useState<boolean>(false);
  const [visiblePickAvatar, setVisiblePickAvatar] = useState<boolean>(false);
  const [variantImages, setVariantImage] = useState<Array<VariantImage>>([]);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [visiblePrice, setVisiblePrice] = useState(false);
  const [visibleUpdatePrice, setVisibleUpdatePrice] = useState(false);
  const [currentVariants, setCurrentVariants] = useState<Array<VariantResponse>>([]);
  const [dataOrigin, setDataOrigin] = useState<ProductRequest | null>(null);
  const [showCareModal, setShowCareModal] = useState(false);
  const [isChangeDescription, setIsChangeDescription] = useState(true);
  const [collections, setCollections] = useState<PageResponse<CollectionResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });

  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const [fieldList, setFieldList] = useState<Array<UploadFile>>([]);
  const [canUpdateCost] = useAuthorization({
    acceptPermissions: [ProductPermission.update_cost],
  });
  const [canUpdateImport] = useAuthorization({
    acceptPermissions: [ProductPermission.update_import],
  });
  const [canUpdateSaleable] = useAuthorization({
    acceptPermissions: [ProductPermission.update_saleable],
  });
  const setCurrentVariant = useCallback(
    (newActive: number) => {
      setActive(newActive);
      setChange(false);
      let variants: Array<VariantResponse> = form.getFieldValue("variants");
      let fieldList = Products.convertAvatarToFileList(variants[newActive]?.variant_images ?? []);
      setFieldList(fieldList);
    },
    [form],
  );

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    setListCategory(arr);
  }, []);

  const onPickAvatar = useCallback(() => {
    let variants: Array<VariantResponse> = form.getFieldValue("variants");
    let variantImages: Array<VariantImage> = [];
    variants.forEach((item) => {
      if (item.saleable) variantImages = [...variantImages, ...item.variant_images];
    });
    setVisiblePickAvatar(true);
    setVariantImage(variantImages);
  }, [form]);

  const getFirstAvatar = useCallback(() => {
    const variants: Array<VariantResponse> = form.getFieldValue("variants");
    let isFind = false;
    let variantAvatarIndex = 0;
    const FIRST_VARIANT_IMAGE_INDEX = 0;

    const revertVariants = variants.reverse();

    //check existed product avatar, if not => set first variant image for product avatar
    revertVariants.forEach((item, i) => {
      if (item.saleable && !isFind) {
        item.variant_images.forEach((item) => {
          if (!isFind) {
            if (item.product_avatar) {
              isFind = true;
            } else {
              variantAvatarIndex = i;
            }
          }
        });
      }
    });

    if (!isFind && revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX]) {
      //reset product avatar
      revertVariants.forEach((item) => {
        item.variant_images.forEach((item) => {
          item.product_avatar = false;
        });
      });

      //set product avatar
      revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX].product_avatar =
        true;
    }

    form.setFieldsValue({ variants: [...revertVariants.reverse()] });
  }, [form]);

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

  const [careLabels, setCareLabels] = useState<any[]>([]);
  const [careLabelsString, setCareLabelsString] = useState("");

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

  const onChange = useCallback(() => {
    setChange(true);
  }, []);

  const onChangeProductName = useCallback(
    (e) => {
      let newName = e.target.value;
      newName = capitalEachWords(newName);
      const newData: any = { ...data };

      if (!newData || !newData.variants || newData?.variants?.length === 0) return;

      for (let i = 0; i < newData.variants.length; i++) {
        if (
          newData.variants[i].name.slice(0, newData.variants[i].name.indexOf("-")).trim() ===
            newData.name.trim() ||
          newData.variants[i].sku.indexOf("-MAU") !== -1 ||
          newData.variants[i].sku === newData.code
        ) {
          if (newData.variants[i].name.indexOf("Lỗi") !== -1) {
            const errorName = newData.variants[i].name.split(" - ")
              ? newData.variants[i].name.split(" - ")[1]
              : "";
            newData.variants[i].name = newName.trim() + " - " + errorName;
          }
          if (
            newData.variants[i].sku.indexOf("-MAU") !== -1 ||
            newData.variants[i].sku === newData.code
          ) {
            newData.variants[i].name = newName.trim();
          } else {
            if (newData.variants[i].color === null && newData.variants[i].size != null) {
              newData.variants[i].name = newName.trim() + " - " + newData.variants[i].size;
            } else if (newData.variants[i].color !== null && newData.variants[i].size === null) {
              newData.variants[i].name = newName.trim() + " - " + newData.variants[i].color;
            } else if (newData.variants[i].color !== null && newData.variants[i].size !== null) {
              newData.variants[i].name =
                newName.trim() +
                " - " +
                newData.variants[i].color +
                " - " +
                newData.variants[i].size;
            }
          }
        }
      }

      setData({ ...newData, name: newName });
      form.setFieldsValue({ name: newName });
    },
    [data, form],
  );

  const onChangePrice = () => {
    setChangePrice(true);
  };

  const update = useCallback(
    (product: any) => {
      if (product.collections) {
        product.collections = product.collections.map((e: CollectionCreateRequest) => e.code);
      }
      product.variants?.forEach((e: VariantRequest) => {
        e.suppliers = null;
        if (e.supplier_ids && e.supplier_ids.length > 0) {
          e.suppliers = e.supplier_ids;
        }
      });

      setLoadingVariant(true);
      callApiNative({ isShowLoading: false }, dispatch, productUpdateApi, idNumber, product).then(
        (data) => {
          if (!data) {
          } else {
            form.setFieldsValue(data);
            setChange(false);
            setChangePrice(false);
            showSuccess("Cập nhật thông tin sản phẩm thành công");
            if (tempActive !== active) {
              setCurrentVariant(tempActive);
            }
          }
        },
      );
      setLoadingVariant(false);
      setLoadingButton(false);
    },
    [active, dispatch, form, idNumber, setCurrentVariant],
  );

  const onUpdatePrice = useCallback(
    async (listSelected: Array<number>) => {
      setVisibleUpdatePrice(false);
      let values: ProductResponse = form.getFieldsValue(true);
      if (values) {
        let variantRequest: Array<VariantResponse> = [
          ...convertVariantPrices(values.variants, values.variants[active]),
        ];
        values = { ...values, variants: variantRequest };
        await update(values);
        history.push(`/products/${idNumber}`);
      }
    },
    [active, form, update, history, idNumber],
  );

  const updateStatus = useCallback(
    (listSelected: Array<number>, status) => {
      let values: ProductResponse = form.getFieldsValue(true);
      values?.variants.forEach((item) => {
        if (listSelected.includes(item.id)) {
          item.saleable = status;
          if (status) item.status = "active"; //CO-3415
        }
      });
      //update(values);
    },
    [form],
  );

  const onMaterialChange = useCallback(
    (id: number) => {
      if (isChangeDescription && id) {
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
      } else {
        form.setFieldsValue({
          material: null,
        });
      }
    },
    [dispatch, form, isChangeDescription],
  );

  const onAllowSale = useCallback(
    (listSelected: Array<number>) => {
      setModalConfirm({
        visible: true,
        okText: "Lưu trạng thái",
        title: "Đổi trạng thái phiên bản",
        cancelText: "Hủy",
        subTitle: "Bạn có chắc chắn đổi trạng thái phiên bản?",
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          updateStatus(listSelected, true);
          getFirstAvatar();
        },
      });
    },
    [updateStatus, getFirstAvatar],
  );

  const onStopSale = useCallback(
    (listSelected: Array<number>) => {
      setModalConfirm({
        visible: true,
        okText: "Lưu trạng thái",
        title: "Đổi trạng thái phiên bản",
        cancelText: "Không lưu",
        subTitle: "Bạn có chắc chắn đổi trạng thái phiên bản?",
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          updateStatus(listSelected, false);
          getFirstAvatar();
        },
      });
    },
    [updateStatus, getFirstAvatar],
  );

  const onSaveImage = useCallback(
    (imageId: number | undefined, isReload: boolean = false) => {
      let variants: Array<VariantResponse> = form.getFieldValue("variants");
      variants.forEach((item) => {
        item.variant_images = item.variant_images === null ? [] : item.variant_images;
        item.variant_images.forEach((item1) => {
          if (item1.id === imageId) {
            item1.product_avatar = true;
          } else {
            item1.product_avatar = false;
          }
        });
      });
      form.setFieldsValue({ variants: [...variants] });
      setVisiblePickAvatar(false);
      if (isReload) history.push(`${UrlConfig.PRODUCT}/${idNumber}`);
    },
    [form, history, idNumber],
  );

  const beforeUpload = useCallback((file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      showWarning("Vui lòng chọn đúng định dạng file JPG, PNG");
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      showWarning("Cần chọn ảnh nhỏ hơn 5mb");
    }
    return isJpgOrPng && isLt2M ? true : Upload.LIST_IGNORE;
  }, []);

  const onRemoveFile = useCallback(
    (file, active) => {
      let variants: Array<VariantResponse> = form.getFieldValue("variants");
      let index = variants[active].variant_images?.findIndex(
        (variantImg) => variantImg.image_id.toString() === file.uid,
      );
      if (index !== -1) {
        variants[active].variant_images?.splice(index, 1);
        if (variants[active].variant_images.length > 0) {
          variants[active].variant_images[0].variant_avatar = true;
        }

        form.setFieldsValue({ variants: variants });
      }
      getFirstAvatar();
    },
    [form, getFirstAvatar],
  );

  const onAddFile = useCallback((info) => {
    setFieldList(info.fileList);
  }, []);

  const customRequest = useCallback(
    (options, active) => {
      let files: Array<File> = [];
      if (options.file instanceof File) {
        let uuid = options.file.uid;
        files.push(options.file);
        dispatch(
          productUploadAction(files, "variant", (data: false | Array<ProductUploadModel>) => {
            let index = fieldList.findIndex((item) => item.uid === uuid);
            if (!!data) {
              if (index !== -1) {
                let variants: Array<VariantResponse> = form.getFieldValue("variants");
                let hasVariantAvatar = false;
                variants[active].variant_images =
                  variants[active].variant_images === null ? [] : variants[active].variant_images;
                variants[active].variant_images?.forEach((item) => {
                  if (item.variant_avatar) {
                    hasVariantAvatar = true;
                  }
                });
                variants[active].variant_images?.push({
                  image_id: data[0].id,
                  product_avatar: false,
                  variant_avatar: !hasVariantAvatar,
                  variant_id: variants[active].id,
                  url: data[0].path,
                  position: null,
                });
                variants[active].variant_images = [...variants[active].variant_images];
                let newVariants = [...variants];
                form.setFieldsValue({ variants: newVariants });
                fieldList[index].status = "done";
                fieldList[index].url = data[0].path;
                fieldList[index].name = data[0].id.toString();
                getFirstAvatar();
              }
            } else {
              fieldList.splice(index, 1);
              showError("Upload ảnh không thành công");
            }
            setFieldList([...fieldList]);
          }),
        );
      }
    },
    [dispatch, fieldList, form, getFirstAvatar],
  );

  const onSave = useCallback(() => {
    if (isChangePrice) {
      setVisiblePrice(true);
    } else {
      form
        .validateFields()
        .then(() => {
          form.submit();
        })
        .catch((error) => {
          const element: any = document.getElementById(error.errorFields[0].name.join(""));
          scrollAndFocusToDomElement(element);
        });
    }
  }, [form, isChangePrice]);

  const onOkPrice = useCallback(
    (isOnly) => {
      setVisiblePrice(false);
      if (isOnly) {
        form.submit();
      } else {
        let variants = form.getFieldValue("variants");
        setCurrentVariants(variants);
        setVisibleUpdatePrice(true);
      }
    },
    [form],
  );
  const productDetailRef = useRef<ProductResponse>();

  const backAction = () => {
    if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(dataOrigin)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
      });
    } else {
      history.goBack();
    }
  };

  const resetProductDetail = useCallback(() => {
    setChangePrice(false);
    if (productDetailRef.current && typeof active === "number") {
      form.setFieldsValue(productDetailRef.current);
      let fieldList = Products.convertAvatarToFileList(
        productDetailRef.current.variants[active]?.variant_images,
      );
      setFieldList(fieldList);
    }
    showSuccess("Đặt lại dữ liệu thành công");
  }, [productDetailRef, active, form]);

  const resetOnClick = useCallback(() => {
    if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(dataOrigin)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          resetProductDetail();
        },
        title: "Bạn có muốn đặt lại thông tin đã cập nhật",
        subTitle: "Sau khi đặt lại thay đổi sẽ không được lưu. Bạn có muốn đặt lại?",
      });
    } else {
      resetProductDetail();
    }
  }, [form, dataOrigin, resetProductDetail]);

  const onActive = useCallback(
    (activeRow: number) => {
      let variants = form.getFieldValue("variants");
      if (activeRow !== active) {
        //change url when select variant
        if (variants[activeRow]?.id) {
          history.replace(
            `${UrlConfig.PRODUCT}/${id}${UrlConfig.VARIANTS}/${variants[activeRow].id}/update`,
          );
        }
        if (isChange && !isChangePrice) {
          tempActive = activeRow;
          setModalConfirm({
            onOk: () => {
              setModalConfirm({ visible: false });
              form.submit();
            },
            onCancel: () => {
              resetOnClick();
              let variants: Array<VariantResponse> = form.getFieldValue("variants");
              if (variants[active].id) {
                setModalConfirm({ visible: false });
                setCurrentVariant(activeRow);
              } else {
                setModalConfirm({ visible: false });
                let idActive = variants[activeRow].id;
                variants.splice(active, 1);
                let index = variants.findIndex((item) => item.id === idActive);
                form.setFieldsValue({ variants: variants });
                setActive(index);
                let fieldList = Products.convertAvatarToFileList(variants[index].variant_images);
                setChange(false);
                setFieldList(fieldList);
              }
            },
            visible: true,
            title: "Xác nhận",
            subTitle: "Bạn có muốn lưu lại phiên bản này?",
          });
        } else if (isChangePrice && variants.length > 1) {
          tempActive = activeRow;

          setVisiblePrice(true);
        } else {
          setCurrentVariant(activeRow);
        }
      }
    },
    [form, active, isChange, isChangePrice, history, id, resetOnClick, setCurrentVariant],
  );
  const onResult = useCallback(
    (result: ProductResponse | false) => {
      setLoading(false);
      if (!result) {
        setError(true);
      } else {
        result.product_collections = result.collections?.map((e) => {
          return e.code;
        });
        result.variants.forEach((e: VariantResponse) => {
          if (e.suppliers && e.suppliers.length > 0) {
            e.supplier_ids = e.suppliers.map((p) => p.id);
          } else {
            e.supplier_ids = [];
          }
        });
        setData(result);
        setCareLabelsString(result.care_labels);
        setStatus(result.status);
        productDetailRef.current = JSON.parse(JSON.stringify(result));
        setDataOrigin(form.getFieldsValue());
        form.setFieldsValue({ variants: result.variants });
        //set active variant
        if (variantId) {
          const index = result.variants.findIndex((item) => item.id === Number(variantId));
          setActive(index);
        }
      }
    },
    [form, variantId],
  );

  /**
   * Thêm sản phẩm
   */
  const handleSubmitAddVariant = (values: any) => {
    onFinish(values);
  };

  /**
   * Focus vào sản phẩm vừa thêm từ modal
   */
  const focusLastestVariant = () => {
    setChange(true);
    const variants = form.getFieldValue("variants");
    if (Array.isArray(variants) && variants.length > 0) {
      setActive(variants.length - 1);
    }
  };

  const getDetail = useCallback(() => {
    dispatch(productGetDetail(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  useEffect(() => {
    if (!isChange) {
      getDetail();
    }
  }, [isChange, getDetail]);

  useEffect(() => {
    if (data) {
      let fieldList = Products.convertAvatarToFileList(data.variants[active]?.variant_images ?? []);
      setFieldList(fieldList);
    }
  }, [data, active]);

  useEffect(() => {
    dispatch(getCategoryRequestAction({}, setDataCategory));
    dispatch(
      getMaterialAction({ status: "active", limit: 1000 }, (res) => {
        if (res) {
          setListMaterial(res.items);
        }
      }),
    );
    dispatch(CountryGetAllAction(setListCountry));
  }, [dispatch, setDataCategory]);

  const getCollections = useCallback(
    (code: string, page: number) => {
      dispatch(getCollectionRequestAction({ condition: code, page: page }, setCollections));
    },
    [dispatch, setCollections],
  );

  const onChangeImportPrice = useCallback(
    (e: any) => {
      setChangePrice(true);

      let variants = form.getFieldValue("variants");
      if (!variants) return;
      if (!dataOrigin || !dataOrigin.variants) return;
      const costPrice = dataOrigin.variants.find(
        (p: VariantRequest) => p.sku === variants[active].sku,
      )?.variant_prices[0].cost_price;

      if (costPrice && costPrice != null && costPrice !== 0) {
        return;
      }
      variants[active].variant_prices[0].cost_price = e * 1.08;

      form.setFieldsValue({
        variants: variants,
      });
    },
    [form, active, dataOrigin],
  );

  useEffect(() => {
    getCollections("", 1);
  }, [getCollections]);

  const onFinish = useCallback(
    async (values: ProductRequest) => {
      setLoadingButton(true);
      let request: any = _.cloneDeep(values);
      request.variants?.forEach((e: VariantRequest) => {
        if (e.saleable) e.status = "active"; //CO-3415
        e.suppliers = null;
        if (e.supplier_ids && e.supplier_ids.length > 0) {
          e.suppliers = e.supplier_ids;
        }
      });

      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        productUpdateApi,
        idNumber,
        request,
      );
      setLoadingVariant(false);
      setLoadingButton(false);

      if (res) {
        showSuccess("Cập nhật thành công");
        history.push(`${UrlConfig.PRODUCT}/${idNumber}`);
        return;
      }
      getDetail();
    },
    [dispatch, idNumber, getDetail, history],
  );

  return (
    <StyledComponent>
      <ContentContainer
        isError={error}
        isLoading={loading}
        title="Sửa thông tin sản phẩm"
        breadcrumb={[
          {
            name: "Sản phẩm",
          },
          {
            name: "Quản lý sản phẩm",
            path: `${UrlConfig.VARIANTS}`,
          },
          {
            name: data !== null ? data.code : "",
          },
        ]}
      >
        {data !== null && (
          <Form
            form={form}
            initialValues={data}
            layout="vertical"
            // onFinishFailed={handleSubmitFail}
            onFinishFailed={({ errorFields }: any) => {
              const element: any = document.getElementById(errorFields[0].name.join(""));
              scrollAndFocusToDomElement(element);
            }}
            onFinish={onFinish}
          >
            <Item hidden noStyle name="id">
              <Input />
            </Item>
            <Item noStyle name="product_type" hidden>
              <Input />
            </Item>
            <Item noStyle name="component" hidden>
              <Input />
            </Item>
            <Item noStyle name="advantages" hidden>
              <Input />
            </Item>
            <Item noStyle name="defect" hidden>
              <Input />
            </Item>
            <Item noStyle name="status" hidden>
              <Input />
            </Item>
            <Item noStyle name="version" hidden>
              <Input />
            </Item>
            <Item hidden noStyle name="code">
              <Input />
            </Item>
            <React.Fragment>
              <Row gutter={24}>
                <Col span={24} md={18}>
                  <Card
                    title="Thông tin chung"
                    className="card"
                    extra={
                      <div className="extra-cards status">
                        <Item noStyle>
                          <b>Trạng thái:</b>
                          <Switch
                            onChange={(checked) => {
                              setStatus(checked ? "active" : "inactive");
                              let variants: Array<VariantResponse> = form.getFieldValue("variants");
                              if (!checked) {
                                variants = [...variants];
                                variants.forEach((item) => {
                                  item.status = "inactive";
                                  item.saleable = false;
                                });
                              }
                              form.setFieldsValue({
                                status: checked ? "active" : "inactive",
                                variants: variants,
                              });
                            }}
                            className="ant-switch-success"
                            checked={status === "active"}
                          />
                        </Item>
                        <label className={status === "active" ? "text-success" : "text-error"}>
                          {statusValue}
                        </label>
                      </div>
                    }
                  >
                    <div>
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
                              // onChange={onCategoryChange}
                              disabled
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
                            tooltip={{
                              title: "Ngành hàng",
                              icon: <InfoCircleOutlined />,
                            }}
                            name="goods"
                            label="Ngành hàng"
                          >
                            <CustomSelect
                              // onChange={onGoodsChange}
                              placeholder="Chọn ngành hàng "
                              disabled
                            >
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
                              disabled
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
                              title:
                                "Tên sản phẩm không bao gồm các giá trị thuộc tính như màu sắc, chất liệu, kích cỡ...",
                              icon: <InfoCircleOutlined />,
                            }}
                            name="name"
                            label="Tên sản phẩm"
                          >
                            <Input
                              onChange={debounce(onChangeProductName, 500)}
                              maxLength={255}
                              placeholder="Nhập tên sản phẩm"
                            />
                          </Item>
                        </Col>
                      </Row>
                      <Row gutter={50}>
                        <Col span={24} md={12} sm={24}>
                          <Item name="brand" label="Thương hiệu">
                            <CustomSelect placeholder="Chọn thương hiệu" allowClear>
                              {brandList?.map((item) => (
                                <CustomSelect.Option key={item.value} value={item.value}>
                                  {item.name}
                                </CustomSelect.Option>
                              ))}
                            </CustomSelect>
                          </Item>
                        </Col>
                        <Col span={24} md={12} sm={24}>
                          <Item label="Nhóm hàng" name="product_collections">
                            <SelectPaging
                              metadata={collections.metadata}
                              showSearch={false}
                              mode="multiple"
                              maxTagCount="responsive"
                              showArrow
                              allowClear
                              searchPlaceholder="Tìm kiếm nhóm hàng"
                              placeholder="Chọn nhóm hàng"
                              onPageChange={(key, page) => getCollections(key, page)}
                              onSearch={(key) => getCollections(key, 1)}
                            >
                              {collections.items.map((item) => (
                                <SelectPaging.Option key={item.code} value={item.code}>
                                  {`${item.code} - ${item.name}`}
                                </SelectPaging.Option>
                              ))}
                            </SelectPaging>
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
                                <CustomSelect.Option
                                  className="po-form"
                                  key={item.id}
                                  value={item.id}
                                >
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
                              allowClear
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
                          <Item name="care_labels" label="Thông tin bảo quản">
                            {careLabels.map((item: any) => (
                              <Popover content={item.name}>
                                <span className={`care-label ydl-${item.value}`}></span>
                              </Popover>
                            ))}
                            <Button
                              className={`button-plus`}
                              size="small"
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
                                <CustomEditor value={form.getFieldValue("description")} />
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
                        <Item
                          noStyle
                          shouldUpdate={(prev, current) => prev.variants !== current.variants}
                        >
                          {({ getFieldValue }) => {
                            const variants: Array<VariantResponse> = getFieldValue("variants");
                            let url = null;
                            variants.forEach((item) => {
                              if (item.saleable)
                                item.variant_images?.forEach((item1) => {
                                  if (item1.product_avatar) {
                                    url = item1.url;
                                  }
                                });
                            });
                            if (url !== null) {
                              return (
                                <div onClick={onPickAvatar} className="bpa">
                                  <Image preview={false} src={url} className="product-img" />
                                </div>
                              );
                            }

                            return (
                              <div onClick={onPickAvatar} className="bpa">
                                <PlusOutlined />
                                Thêm ảnh sản phẩm
                              </div>
                            );
                          }}
                        </Item>
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
                        <AccountSearchPaging placeholder="Chọn Merchandiser" />
                      </Item>

                      <Item
                        name="designer_code"
                        label="Thiết kế"
                        tooltip={{
                          title: "Chọn nhân viên thiết kế",
                          icon: <InfoCircleOutlined />,
                        }}
                      >
                        <AccountSearchPaging placeholder="Chọn nhân viên thiết kế" />
                      </Item>
                    </div>
                  </Card>
                </Col>
              </Row>
              <Card className="card">
                <Row className="card-container">
                  <Col className="left" span={24} md={7}>
                    <Item name="variants" noStyle>
                      <VariantList
                        disabledAction={status === "inactive"}
                        loading={loadingVariant}
                        onAllowSale={onAllowSale}
                        onStopSale={onStopSale}
                        active={active}
                        setActive={onActive}
                        productData={data}
                        canUpdateSaleable={canUpdateSaleable}
                      />
                    </Item>
                    <Divider />
                    <AddVariantsModal
                      form={form}
                      onFinish={handleSubmitAddVariant}
                      onOk={focusLastestVariant}
                    />
                  </Col>
                  <Col className="right" span={24} md={17}>
                    <Form.List name="variants">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, fieldKey, ...restField }, index) =>
                            active === index ? (
                              <React.Fragment key={key}>
                                <div className="header-view">
                                  <div className="header-view-left">
                                    <b>THÔNG TIN PHIÊN BẢN</b>
                                  </div>
                                  <div className="header-view-right">
                                    {canUpdateSaleable && (
                                      <>
                                        <b>Cho phép bán:</b>
                                        <Form.Item
                                          valuePropName="checked"
                                          name={[name, "saleable"]}
                                          fieldKey={[fieldKey, "saleable"]}
                                          noStyle
                                        >
                                          <Switch
                                            disabled={status === "inactive"}
                                            style={{ marginLeft: 10 }}
                                            className="ant-switch-success"
                                            onChange={() => {
                                              getFirstAvatar();
                                            }}
                                          />
                                        </Form.Item>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="container-view padding-20">
                                  <Item name={[name, "id"]} hidden noStyle>
                                    <Input />
                                  </Item>
                                  <Item name={[name, "status"]} hidden noStyle>
                                    <Input />
                                  </Item>
                                  <Item name={[name, "code"]} hidden noStyle>
                                    <Input />
                                  </Item>
                                  <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) =>
                                      prevValues.variants[active]?.id !==
                                      currentValues.variants[active]?.id
                                    }
                                  >
                                    {({ getFieldValue }) => {
                                      // let variants = getFieldValue("variants");
                                      // let id = variants[active].id;
                                      return (
                                        <Row gutter={50}>
                                          <Col span={24} md={12}>
                                            <Item
                                              name={[name, "sku"]}
                                              rules={[{ required: true }]}
                                              label="Mã sản phẩm"
                                              normalize={(value: string) =>
                                                (value || "").toUpperCase()
                                              }
                                            >
                                              <Input
                                                onChange={onChange}
                                                //disabled={id !== undefined && id !== null}
                                                placeholder="Nhập mã sản phẩm"
                                                disabled
                                              />
                                            </Item>
                                          </Col>
                                          <Col span={24} md={12}>
                                            <Item name={[name, "barcode"]} label="Mã vạch">
                                              <Input
                                                onChange={onChange}
                                                disabled
                                                placeholder="Nhập mã vạch"
                                              />
                                            </Item>
                                          </Col>
                                        </Row>
                                      );
                                    }}
                                  </Form.Item>
                                  <Row gutter={50}>
                                    <Col span={24} md={12}>
                                      <Item
                                        name={[name, "name"]}
                                        rules={[{ required: true }]}
                                        label="Tên sản phẩm"
                                        normalize={(value: string) => capitalEachWords(value || "")}
                                      >
                                        <Input
                                          onChange={onChange}
                                          placeholder="Nhập tên sản phẩm"
                                        />
                                      </Item>
                                    </Col>
                                    <Col span={24} md={12}>
                                      <Item name={[name, "supplier_ids"]} label="Nhà cung cấp">
                                        <SupplierSearchSelect mode="multiple" />
                                      </Item>
                                    </Col>
                                  </Row>
                                  <Form.List name={[name, "variant_prices"]}>
                                    {(fields, { add, remove }) => (
                                      <>
                                        {fields.map(
                                          ({ key, name, fieldKey, ...restField }, index) => (
                                            <Row key={key} gutter={24}>
                                              <Item name={[name, "id"]} hidden noStyle>
                                                <Input />
                                              </Item>
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
                                                    onChange={onChangePrice}
                                                    format={(a: string) =>
                                                      formatCurrencyForProduct(a, ",")
                                                    }
                                                    replace={(a: string) => replaceFormatString(a)}
                                                    placeholder="VD: 100,000"
                                                    maxLength={15}
                                                  />
                                                </Item>
                                              </Col>
                                              <Col md={4}>
                                                <Item
                                                  name={[name, "wholesale_price"]}
                                                  fieldKey={[fieldKey, "wholesale_price"]}
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
                                                    format={(a: string) =>
                                                      formatCurrencyForProduct(a, ",")
                                                    }
                                                    replace={(a: string) => replaceFormatString(a)}
                                                    placeholder="VD: 100,000"
                                                    maxLength={15}
                                                  />
                                                </Item>
                                              </Col>
                                              <AuthWrapper
                                                acceptPermissions={[ProductPermission.read_import]}
                                              >
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
                                                      onChange={onChangeImportPrice}
                                                      format={(a: string) =>
                                                        formatCurrencyForProduct(a, ",")
                                                      }
                                                      replace={(a: string) =>
                                                        replaceFormatString(a)
                                                      }
                                                      disabled={!canUpdateImport}
                                                      placeholder="VD: 100,000"
                                                      maxLength={15}
                                                    />
                                                  </Item>
                                                </Col>
                                              </AuthWrapper>
                                              <AuthWrapper
                                                acceptPermissions={[ProductPermission.read_cost]}
                                              >
                                                <Col md={4}>
                                                  <Item
                                                    name={[name, "cost_price"]}
                                                    fieldKey={[fieldKey, "cost_price"]}
                                                    label="Giá vốn"
                                                    tooltip={{
                                                      title: () => (
                                                        <div>
                                                          <b>Giá vốn</b> là tổng của những loại chi
                                                          phí để đưa hàng có mặt tại kho. Chúng bao
                                                          gồm giá mua của nhà cung cấp, thuế giá trị
                                                          gia tăng, chi phí vận chuyển, bảo hiểm,...
                                                        </div>
                                                      ),
                                                      icon: <InfoCircleOutlined />,
                                                    }}
                                                  >
                                                    <NumberInput
                                                      format={(a: string) =>
                                                        formatCurrencyForProduct(a, ",")
                                                      }
                                                      replace={(a: string) =>
                                                        replaceFormatString(a)
                                                      }
                                                      placeholder="VD: 100,000"
                                                      disabled={!canUpdateCost}
                                                      maxLength={15}
                                                    />
                                                  </Item>
                                                </Col>
                                              </AuthWrapper>
                                              <Col md={4}>
                                                <Item
                                                  label="Thuế"
                                                  name={[name, "tax_percent"]}
                                                  fieldKey={[fieldKey, "tax_percent"]}
                                                >
                                                  <NumberInput
                                                    placeholder="VD: 10"
                                                    suffix={<span>%</span>}
                                                    maxLength={15}
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
                                                  name={[name, "currency_code"]}
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
                                            </Row>
                                          ),
                                        )}
                                      </>
                                    )}
                                  </Form.List>
                                  <Row gutter={50}>
                                    <Col span={24} sm={12}>
                                      <Item name={[name, "color_id"]} label="Màu sắc">
                                        <ColorSearchSelect />
                                      </Item>
                                      <Item name={[name, "size_id"]} label="Kích cỡ">
                                        <SizeSearchSelect />
                                      </Item>

                                      <Item
                                        label="Kích thước (dài, rộng, cao)"
                                        tooltip={{
                                          title: "Thông tin kích thước khi đóng gói sản phẩm",
                                          icon: <InfoCircleOutlined />,
                                        }}
                                      >
                                        <Input.Group compact>
                                          <Item name={[name, "length"]} noStyle>
                                            <NumberInput
                                              onChange={onChange}
                                              isFloat
                                              maxLength={6}
                                              style={{
                                                width: "calc((100% - 100px) / 3)",
                                              }}
                                              placeholder="Dài"
                                            />
                                          </Item>
                                          <Item name={[name, "width"]} noStyle>
                                            <NumberInput
                                              onChange={onChange}
                                              isFloat
                                              maxLength={6}
                                              style={{
                                                width: "calc((100% - 100px) / 3)",
                                              }}
                                              placeholder="Rộng"
                                            />
                                          </Item>
                                          <Item name={[name, "height"]} noStyle>
                                            <NumberInput
                                              onChange={onChange}
                                              isFloat
                                              maxLength={6}
                                              placeholder="Cao"
                                              style={{
                                                width: "calc((100% - 100px) / 3)",
                                              }}
                                            />
                                          </Item>
                                          <Item name={[name, "length_unit"]} noStyle>
                                            <Select
                                              onChange={onChange}
                                              placeholder="Đơn vị"
                                              style={{ width: "100px" }}
                                            >
                                              {lengthUnitList?.map((item) => (
                                                <Select.Option key={item.value} value={item.value}>
                                                  {item.name}
                                                </Select.Option>
                                              ))}
                                            </Select>
                                          </Item>
                                        </Input.Group>
                                      </Item>
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
                                            name={[name, "weight"]}
                                            noStyle
                                          >
                                            <NumberInput
                                              onChange={onChange}
                                              isFloat
                                              maxLength={6}
                                              placeholder="Khối lượng"
                                              style={{
                                                width: "calc(100% - 100px)",
                                              }}
                                            />
                                          </Item>
                                          <Item name={[name, "weight_unit"]} noStyle>
                                            <Select
                                              onChange={onChange}
                                              placeholder="Đơn vị"
                                              style={{ width: "100px" }}
                                              value="gram"
                                            >
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
                                    <Col span={24} sm={12}>
                                      <Item name={[name, "variant_images"]} hidden noStyle>
                                        <Input />
                                      </Item>
                                      <AuthWrapper
                                        acceptPermissions={[ProductPermission.upload_image]}
                                      >
                                        <Upload
                                          style={{ width: "100%" }}
                                          multiple
                                          maxCount={6}
                                          beforeUpload={beforeUpload}
                                          fileList={fieldList}
                                          onChange={(info) => {
                                            onAddFile(info);
                                          }}
                                          customRequest={(options) => {
                                            customRequest(options, active);
                                          }}
                                          listType="picture-card"
                                          onRemove={(file) => {
                                            onRemoveFile(file, active);
                                          }}
                                        >
                                          {fieldList.length >= 6 ? null : uploadButton}
                                        </Upload>
                                      </AuthWrapper>
                                    </Col>
                                  </Row>
                                </div>
                              </React.Fragment>
                            ) : null,
                          )}
                        </>
                      )}
                    </Form.List>
                  </Col>
                </Row>
              </Card>
            </React.Fragment>
          </Form>
        )}
        <BottomBarContainer
          back="Quay lại"
          backAction={backAction}
          rightComponent={
            <Space>
              <Button onClick={resetOnClick}>Đặt lại</Button>
              <Button loading={loadingButton} onClick={onSave} type="primary">
                Lưu lại
              </Button>
            </Space>
          }
        />
        <ModalPickAvatar
          onOk={onSaveImage}
          onCancel={() => setVisiblePickAvatar(false)}
          variantImages={variantImages}
          visible={false}
        />
        <ModalUploadImages
          onOk={onSaveImage}
          onCancel={() => setVisiblePickAvatar(false)}
          variantImages={variantImages}
          visible={visiblePickAvatar}
          productId={data?.id}
        />
        <ModalConfirm {...modalConfirm} />
        <ModalUpdatePrice
          onCancel={() => setVisibleUpdatePrice(false)}
          onOk={onUpdatePrice}
          currentIndex={active}
          variants={_.cloneDeep(currentVariants)}
          visible={visibleUpdatePrice}
        />
        <ModalConfirmPrice
          onClickOutside={() => setVisiblePrice(false)}
          onCancel={() => {
            // check has new item => remove new item
            setActive(tempActive);
            resetOnClick();
            const variants = form.getFieldValue("variants");
            variants.forEach((item: VariantResponse, index: number) => {
              if (!item.id) {
                variants.splice(index, 1);
              }
            });
          }}
          visible={visiblePrice}
          onOk={onOkPrice}
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
  );
};

export default ProductDetailScreen;
