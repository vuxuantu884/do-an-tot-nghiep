import {
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Form,
  Switch,
  Card,
  Button,
  Input,
  Collapse,
  Select,
  Divider,
  Space,
  Image,
  Upload,
} from "antd";
import ContentContainer from "component/container/content.container";
import CustomEditor from "component/custom/custom-editor";
import HashTag from "component/custom/hashtag";
import CustomSelect from "component/custom/select.custom";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { listColorAction } from "domain/actions/product/color.action";
import { detailMaterialAction, materialSearchAll } from "domain/actions/product/material.action";
import {
  productGetDetail,
  productUpdateAction,
  productUploadAction,
} from "domain/actions/product/products.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { ColorResponse } from "model/product/color.model";
import { MaterialResponse } from "model/product/material.model";
import {
  ProductRequest,
  ProductResponse,
  VariantImage,
  VariantResponse,
} from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { Fragment, useMemo } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
  convertCategory,
  formatCurrency,
  Products,
  replaceFormatString,
} from "utils/AppUtils";
import { RegUtil } from "utils/RegUtils";
import { ProductParams } from "../ProductDetailScreen";
import { StyledComponent } from "./styles";
import NumberInput from "component/custom/number-input.custom";
import BottomBarContainer from "component/container/bottom-bar.container";
import VariantList from "../component/VariantList";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import ModalPickAvatar from "../component/ModalPickAvatar";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import { ProductUploadModel } from "model/product/product-upload.model";
import ModalConfirmPrice from "../component/ModalConfirmPrice";
import ModalUpdatePrice from "../component/ModalUpdatePrice";
import { handleChangeMaterial } from "utils/ProductUtils";

const { Item } = Form;
var tempActive: number = 0;

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
  const { id } = useParams<ProductParams>();
  const idNumber = parseInt(id);

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

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductResponse | null>(null);
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [listSize, setListSize] = useState<Array<SizeResponse>>([]);
  const [listColor, setListColor] = useState<Array<ColorResponse>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
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
  const categoryFilter = useMemo(() => {
    if (data === null) {
      return listCategory;
    }
    return listCategory.filter((item) => item.goods === data.goods);
  }, [data, listCategory]);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const [fieldList, setFieldList] = useState<Array<UploadFile>>([]);

  const setCurrentVariant = useCallback(
    (newActive: number) => {
      setActive(newActive);
      setChange(false);
      let variants: Array<VariantResponse> = form.getFieldValue("variants");
      let fieldList = Products.convertAvatarToFileList(
        variants[newActive].variant_images
      );
      setFieldList(fieldList);
    },
    [form]
  );

 

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
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

  const onPickAvatar = useCallback(() => {
    let variants: Array<VariantResponse> = form.getFieldValue("variants");
    let variantImages: Array<VariantImage> = [];
    variants.forEach((item) => {
      variantImages = [...variantImages, ...item.variant_images];
    });
    setVisiblePickAvatar(true);
    setVariantImage(variantImages);
  }, [form]);

  const onSaveImage = useCallback(
    (imageId: number) => {
      let variants: Array<VariantResponse> = form.getFieldValue("variants");
      variants.forEach((item) => {
        item.variant_images.forEach((item1) => {
          if (item1.image_id === imageId) {
            item1.product_avatar = true;
          } else {
            item1.product_avatar = false;
          }
        });
      });
      form.setFieldsValue({ variants: [...variants] });
      setVisiblePickAvatar(false);
    },
    [form]
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

  const onActive = useCallback(
    (active1: number) => {
      let variants = form.getFieldValue("variants");
      if (active1 !== active) {
        if (isChange && !isChangePrice) {
          tempActive = active1;
          setModalConfirm({
            onOk: () => {
              setModalConfirm({ visible: false });
              form.submit();
            },
            onCancel: () => {
              let variants: Array<VariantResponse> =
                form.getFieldValue("variants");
              if (variants[active].id) {
                setModalConfirm({ visible: false });
                setCurrentVariant(active1);
              } else {
                setModalConfirm({ visible: false });
                let idActive = variants[active1].id;
                variants.splice(active, 1);
                let index = variants.findIndex((item) => item.id === idActive);
                form.setFieldsValue({ variants: variants });
                setActive(index);
                let fieldList = Products.convertAvatarToFileList(
                  variants[index].variant_images
                );
                setFieldList(fieldList);
              }
            },
            visible: true,
            title: "Xác nhận",
            subTitle: "Bạn có muốn lưu lại phiên bản này?",
          });
        } else if (isChangePrice && variants.length > 1) {
          tempActive = active1;
          setVisiblePrice(true);
        } else {
          setCurrentVariant(active1);
        }
      }
    },
    [active, form, isChange, isChangePrice, setCurrentVariant]
  );

  const onChange = useCallback(() => {
    setChange(true);
  }, []);

  const onChangePrice = useCallback(() => {
    setChangePrice(true);
  }, []);

  const onResultUpdate = useCallback(
    (data) => {
      setLoadingVariant(false);
      setLoadingButton(false);
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
    [active, form, setCurrentVariant]
  );

  const update = useCallback(
    (product: ProductResponse) => {
      setLoadingVariant(true);
      dispatch(productUpdateAction(idNumber, product, onResultUpdate));
    },
    [dispatch, idNumber, onResultUpdate]
  );

  const onUpdatePrice = useCallback((listSelected: Array<number>) => {
    setVisibleUpdatePrice(false);
    let values: ProductResponse = form.getFieldsValue(true);
    if(values) {
      values.variants.forEach((item) => {
        if (listSelected.includes(item.id)) {
          item.variant_prices = values.variants[active].variant_prices;
        }
      });
      update(values);
      history.push(`/unicorn/admin/products/${idNumber}`);
    }
     
  }, [active, form, update, history, idNumber])

  const updateStatus = useCallback(
    (listSelected: Array<number>, status) => {
      let values: ProductResponse = form.getFieldsValue(true);
      values?.variants.forEach((item) => {
        if (listSelected.includes(item.id)) {
          item.saleable = status;
        }
      });
      update(values);
    },
    [form, update]
  );
  const onMaterialChange = (id: number) => {
    dispatch(detailMaterialAction(id, (material)=>handleChangeMaterial(material,form)));
  };
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
        },
      });
    },
    [updateStatus]
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
        },
      });
    },
    [updateStatus]
  );

  const onResultFinish = useCallback(
    (data) => {
      setLoadingVariant(false);
      setLoadingButton(false);
      if (!data) {
      } else {
        history.push(`${UrlConfig.PRODUCT}/${idNumber}`);
      }
    },
    [history, idNumber]
  );

  const onFinish = useCallback(
    (values: ProductRequest) => {
      setLoadingButton(true);
      dispatch(productUpdateAction(idNumber, values, onResultFinish));
    },
    [dispatch, idNumber, onResultFinish]
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
      let index = variants[active].variant_images.findIndex(
        (variantImg) => variantImg.image_id.toString() === file.uid
      );
      if (index !== -1) {
        variants[active].variant_images.splice(index, 1);
        variants[active].variant_images = [...variants[active].variant_images];
        let newVariants = [...variants];
        form.setFieldsValue({ variants: newVariants });
      }
    },
    [form]
  );

  const onAddFile = useCallback((info) => {
    setFieldList(info.fileList);
  }, []);

  const customRequest = useCallback(
    (options, active) => {
      console.log(options);
      let files: Array<File> = [];
      if (options.file instanceof File) {
        let uuid = options.file.uid;
        files.push(options.file);
        dispatch(
          productUploadAction(
            files,
            "variant",
            (data: false | Array<ProductUploadModel>) => {
              let index = fieldList.findIndex((item) => item.uid === uuid);
              if (!!data) {
                if (index !== -1) {
                  let variants: Array<VariantResponse> =
                    form.getFieldValue("variants");
                  variants[active].variant_images.push({
                    image_id: data[0].id,
                    product_avatar: false,
                    variant_avatar: true,
                    variant_id: variants[active].id,
                    url: data[0].path,
                    position: null,
                  });
                  variants[active].variant_images = [
                    ...variants[active].variant_images,
                  ];
                  let newVariants = [...variants];
                  form.setFieldsValue({ variants: newVariants });
                  fieldList[index].status = "done";
                  fieldList[index].url = data[0].path;
                  fieldList[index].name = data[0].id.toString();
                }
              } else {
                fieldList.splice(index, 1);
                showError("Upload ảnh không thành công");
              }
              setFieldList([...fieldList]);
            }
          )
        );
      }
    },
    [dispatch, fieldList, form]
  );

  const onSave = useCallback(() => {
    if (isChangePrice) {
      setVisiblePrice(true);
    } else {
      form.submit();
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
    [form]
  );

  const onResult = useCallback(
    (result: ProductResponse | false) => {
      setLoading(false);
      if (!result) {
        setError(true);
      } else {
        setData(result);
        setStatus(result.status);
        form.setFieldsValue(result);
      }
    },
    [form]
  );

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  useEffect(() => {
    if (data) {
      let fieldList = Products.convertAvatarToFileList(
        data.variants[active].variant_images
      );
      setFieldList(fieldList);
    }
  }, [data, active]);

  useEffect(() => {
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
    return () => {};
  }, [dispatch, setDataAccounts, setDataCategory]);

  return (
    <StyledComponent>
      <ContentContainer
        isError={error}
        isLoading={loading}
        title="Sửa thông tin sản phẩm"
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
            name: data !== null ? data.name : "",
          },
        ]}
      >
        {data !== null && (
          <Form
            onFinish={onFinish}
            form={form}
            initialValues={data}
            layout="vertical"
          >
            <Item hidden noStyle name="id">
              <Input />
            </Item>
            <Item noStyle name="product_type" hidden>
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
                              let variants: Array<VariantResponse> =
                                form.getFieldValue("variants");
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
                        <label
                          className={
                            status === "active" ? "text-success" : "text-error"
                          }
                        >
                          {statusValue}
                        </label>
                      </div>
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
                              // onChange={onGoodsChange}
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
                              // onChange={onCategoryChange}
                              placeholder="Chọn danh mục"
                              suffix={
                                <Button
                                  style={{ width: 37, height: 37 }}
                                  icon={<PlusOutlined />}
                                />
                              }
                            >
                              {categoryFilter.map((item) => (
                                <CustomSelect.Option
                                  key={item.id}
                                  value={item.id}
                                >
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
                                <CustomSelect.Option
                                  key={item.id}
                                  value={item.id}
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
                          <Item name="material_id" label="Chất liệu">
                            <CustomSelect
                              showSearch
                              optionFilterProp="children"
                              placeholder="Chọn chất liệu"
                              onChange={onMaterialChange}
                            >
                              {listMaterial?.map((item) => (
                                <CustomSelect.Option
                                  key={item.id}
                                  value={item.id}
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
                        <Item
                          noStyle
                          shouldUpdate={(prev, current) =>
                            prev.variants !== current.variants
                          }
                        >
                          {({ getFieldValue }) => {
                            const variants: Array<VariantResponse> =
                              getFieldValue("variants");
                            let url = null;
                            variants.forEach((item) => {
                              item.variant_images.forEach((item1) => {
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
                                Chọn ảnh đại diện
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
                        <CustomSelect
                          optionFilterProp="children"
                          showSearch
                          showArrow
                        >
                          <CustomSelect.Option value="">
                            Chọn Merchandiser
                          </CustomSelect.Option>
                          {accounts.map((item) => (
                            <CustomSelect.Option
                              key={item.code}
                              value={item.code}
                            >
                              {`${item.code} - ${item.full_name}`}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Item>
                      <Item
                        name="designer_code"
                        label="Thiết kế"
                        tooltip={{
                          title: "Tooltip",
                          icon: <InfoCircleOutlined />,
                        }}
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
                            <CustomSelect.Option
                              key={item.code}
                              value={item.code}
                            >
                              {`${item.code} - ${item.full_name}`}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
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
                      />
                    </Item>
                    <Divider />
                    <Form.List name="variants">
                      {(fields, { add, remove }) =>{
                       
                        const currentVariantList = form.getFieldValue("variants");                       
                        //check already have new item
                        let hasNewItem= currentVariantList?.some((element:VariantResponse) => !element.id  );
                        
                        const newItem = {
                          id: null,
                          variant_images: [],
                          name: data.name,
                          status: "active",
                          barcode: "",
                          color_id: null,
                          composite: false,
                          composites: [],
                          product_id: idNumber,
                          saleable: true,
                          size: null,
                          sku: data.code,
                          variant_prices: [
                            {
                              retail_price: "",
                              currency_code: AppConfig.currency,
                              import_price: "",
                              wholesale_price: "",
                              cost_price: "",
                              tax_percent: 0,
                            },
                          ],
                          length_unit:
                            lengthUnitList && lengthUnitList.length > 0
                              ? lengthUnitList[0].value
                              : "",
                          weight_unit:
                            weightUnitList && weightUnitList.length > 0
                              ? weightUnitList[0].value
                              : "",
                        }
                        return (
                        <Button
                        disabled={hasNewItem}
                          onClick={() => {                           
                            add(newItem, 0);                          
                            setChange(true);
                            setActive(0);
                            setFieldList([]);
                          }}
                          type="link"
                          icon={<PlusOutlined />}
                        >
                          Thêm phiên bản
                        </Button>
                      )} }
                    </Form.List>
                  </Col>
                  <Col className="right" span={24} md={17}>
                    <Form.List name="variants">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(
                            ({ key, name, fieldKey, ...restField }, index) =>
                              active === index ? (
                                <React.Fragment key={key}>
                                  <div className="header-view">
                                    <div className="header-view-left">
                                      <b>THÔNG TIN PHIÊN BẢN</b>
                                    </div>
                                    <div className="header-view-right">
                                      <b>Cho phép bán:</b>
                                      <Item
                                        valuePropName="checked"
                                        name={[name, "saleable"]}
                                        fieldKey={[fieldKey, "saleable"]}
                                        noStyle
                                      >
                                        <Switch
                                          disabled={status === "inactive"}
                                          style={{ marginLeft: 10 }}
                                          className="ant-switch-success"
                                        />
                                      </Item>
                                    </div>
                                  </div>
                                  <div className="container-view padding-20">
                                    <Item name={[name, "id"]} hidden noStyle>
                                      <Input />
                                    </Item>
                                    <Item
                                      name={[name, "status"]}
                                      hidden
                                      noStyle
                                    >
                                      <Input />
                                    </Item>
                                    <Item name={[name, "code"]} hidden noStyle>
                                      <Input />
                                    </Item>
                                    <Form.Item
                                      noStyle
                                      shouldUpdate={(
                                        prevValues,
                                        currentValues
                                      ) =>
                                        prevValues.variants[active].id !==
                                        currentValues.variants[active].id
                                      }
                                    >
                                      {({ getFieldValue }) => {
                                        let variants =
                                          getFieldValue("variants");
                                        let id = variants[active].id;
                                        return (
                                          <Row gutter={50}>
                                            <Col span={24} md={12}>
                                              <Item
                                                name={[name, "sku"]}
                                                rules={[{ required: true },{
                                                  min: 10,
                                                  message: "Mã sản phẩm tối thiểu 10 kí tự",
                                                }]}
                                                label="Mã sản phẩm"
                                              >
                                                <Input
                                                  onChange={onChange}
                                                  disabled={
                                                    id !== undefined &&
                                                    id !== null
                                                  }
                                                  placeholder="Nhập mã sản phẩm"
                                                />
                                              </Item>
                                            </Col>
                                            <Col span={24} md={12}>
                                              <Item
                                                name={[name, "barcode"]}
                                                label="Mã vạch"
                                              >
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
                                        >
                                          <Input
                                            onChange={onChange}
                                            placeholder="Nhập tên sản phẩm"
                                          />
                                        </Item>
                                      </Col>
                                      <Col span={24} md={12}>
                                        <Item
                                          name={[name, "supplier_id"]}
                                          label="Nhà cung cấp"
                                        >
                                          <CustomSelect
                                            onChange={onChange}
                                            showSearch
                                            optionFilterProp="children"
                                            placeholder="Chọn nhà cung cấp"
                                          >
                                            {listSupplier?.map((item) => (
                                              <CustomSelect.Option
                                                key={item.id}
                                                value={item.id}
                                              >
                                                {item.name}
                                              </CustomSelect.Option>
                                            ))}
                                          </CustomSelect>
                                        </Item>
                                      </Col>
                                    </Row>
                                    <Form.List name={[name, "variant_prices"]}>
                                      {(fields, { add, remove }) => (
                                        <>
                                          {fields.map(
                                            (
                                              {
                                                key,
                                                name,
                                                fieldKey,
                                                ...restField
                                              },
                                              index
                                            ) => (
                                              <Row key={key} gutter={24}>
                                                <Item
                                                  name={[name, "id"]}
                                                  hidden
                                                  noStyle
                                                >
                                                  <Input />
                                                </Item>
                                                <Col md={4}>
                                                  <Item
                                                    label="Giá bán"
                                                    rules={[
                                                      {
                                                        required: true,
                                                        message:
                                                          "Giá bán không được để trống",
                                                      },
                                                    ]}
                                                    name={[
                                                      name,
                                                      "retail_price",
                                                    ]}
                                                    fieldKey={[
                                                      fieldKey,
                                                      "retail_price",
                                                    ]}
                                                    tooltip={{
                                                      title: (
                                                        <div>
                                                          <b>Giá bán lẻ</b> là
                                                          giá mà bạn sẽ bán sản
                                                          phẩm này cho những
                                                          khách hàng đơn lẻ..
                                                        </div>
                                                      ),
                                                      icon: (
                                                        <InfoCircleOutlined />
                                                      ),
                                                    }}
                                                  >
                                                    <NumberInput
                                                      onChange={onChangePrice}
                                                      format={(a: string) =>
                                                        formatCurrency(a)
                                                      }
                                                      replace={(a: string) =>
                                                        replaceFormatString(a)
                                                      }
                                                      placeholder="VD: 100,000"
                                                    />
                                                  </Item>
                                                </Col>
                                                <Col md={4}>
                                                  <Item
                                                    name={[
                                                      name,
                                                      "wholesale_price",
                                                    ]}
                                                    fieldKey={[
                                                      fieldKey,
                                                      "wholesale_price",
                                                    ]}
                                                    label="Giá buôn"
                                                    tooltip={{
                                                      title: () => (
                                                        <div>
                                                          <b>Giá buôn</b> là giá
                                                          mà bạn sẽ bán sản phẩm
                                                          này cho những khách
                                                          hàng mua hàng với số
                                                          lượng lớn.
                                                        </div>
                                                      ),
                                                      icon: (
                                                        <InfoCircleOutlined />
                                                      ),
                                                    }}
                                                  >
                                                    <NumberInput
                                                      onChange={onChangePrice}
                                                      format={(a: string) =>
                                                        formatCurrency(a)
                                                      }
                                                      replace={(a: string) =>
                                                        replaceFormatString(a)
                                                      }
                                                      placeholder="VD: 100,000"
                                                    />
                                                  </Item>
                                                </Col>
                                                <Col md={4}>
                                                  <Item
                                                    name={[
                                                      name,
                                                      "import_price",
                                                    ]}
                                                    fieldKey={[
                                                      fieldKey,
                                                      "import_price",
                                                    ]}
                                                    label="Giá nhập"
                                                    tooltip={{
                                                      title: () => (
                                                        <div>
                                                          <b>Giá nhập</b> là giá
                                                          mà nhập sản phẩm từ
                                                          đơn mua hàng của nhà
                                                          cung cấp.
                                                        </div>
                                                      ),
                                                      icon: (
                                                        <InfoCircleOutlined />
                                                      ),
                                                    }}
                                                  >
                                                    <NumberInput
                                                      onChange={onChangePrice}
                                                      format={(a: string) =>
                                                        formatCurrency(a)
                                                      }
                                                      replace={(a: string) =>
                                                        replaceFormatString(a)
                                                      }
                                                      placeholder="VD: 100,000"
                                                    />
                                                  </Item>
                                                </Col>
                                                <Col md={4}>
                                                  <Item
                                                    name={[name, "cost_price"]}
                                                    fieldKey={[
                                                      fieldKey,
                                                      "cost_price",
                                                    ]}
                                                    label="Giá vốn"
                                                    tooltip={{
                                                      title: () => (
                                                        <div>
                                                          <b>Giá vốn</b> là tổng
                                                          của những loại chi phí
                                                          để đưa hàng có mặt tại
                                                          kho. Chúng bao gồm giá
                                                          mua của nhà cung cấp,
                                                          thuế giá trị gia tăng,
                                                          chi phí vận chuyển,
                                                          bảo hiểm,...
                                                        </div>
                                                      ),
                                                      icon: (
                                                        <InfoCircleOutlined />
                                                      ),
                                                    }}
                                                  >
                                                    <NumberInput
                                                      onChange={onChangePrice}
                                                      format={(a: string) =>
                                                        formatCurrency(a)
                                                      }
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
                                                    fieldKey={[
                                                      fieldKey,
                                                      "tax_percent",
                                                    ]}
                                                  >
                                                    <NumberInput
                                                      onChange={onChangePrice}
                                                      placeholder="VD: 10"
                                                      suffix={<span>%</span>}
                                                    />
                                                  </Item>
                                                </Col>
                                                <Col md={4}>
                                                  <Item
                                                    label="Đơn vị tiền tệ"
                                                    tooltip={{
                                                      title: "Tooltip",
                                                      icon: (
                                                        <InfoCircleOutlined />
                                                      ),
                                                    }}
                                                    rules={[
                                                      {
                                                        required: true,
                                                        message:
                                                          "Đơn vị tiền tệ không được để trống",
                                                      },
                                                    ]}
                                                    name={[
                                                      name,
                                                      "currency_code",
                                                    ]}
                                                  >
                                                    <CustomSelect
                                                      onChange={onChangePrice}
                                                      placeholder="Đơn vị tiền tệ"
                                                    >
                                                      {currencyList?.map(
                                                        (item) => (
                                                          <CustomSelect.Option
                                                            key={item.value}
                                                            value={item.value}
                                                          >
                                                            {item.name}
                                                          </CustomSelect.Option>
                                                        )
                                                      )}
                                                    </CustomSelect>
                                                  </Item>
                                                </Col>
                                              </Row>
                                            )
                                          )}
                                        </>
                                      )}
                                    </Form.List>
                                    <Row gutter={50}>
                                      <Col span={24} sm={12}>
                                        <Item
                                          label="Màu sắc"
                                          name={[name, "color_id"]}
                                        >
                                          <CustomSelect
                                            onChange={onChange}
                                            notFoundContent={"Không có dữ liệu"}
                                            showSearch
                                            optionFilterProp="children"
                                            maxTagCount="responsive"
                                            showArrow
                                            placeholder="Chọn màu sắc"
                                            suffix={
                                              <Button
                                                style={{
                                                  width: 37,
                                                  height: 37,
                                                }}
                                                icon={<PlusOutlined />}
                                              />
                                            }
                                          >
                                            {listColor?.map((item) => (
                                              <CustomSelect.Option
                                                key={item.id}
                                                value={item.id}
                                              >
                                                {item.name}
                                              </CustomSelect.Option>
                                            ))}
                                          </CustomSelect>
                                        </Item>
                                        <Item
                                          name={[name, "size_id"]}
                                          label="Kích cỡ"
                                        >
                                          <CustomSelect
                                            onChange={onChange}
                                            notFoundContent={"Không có dữ liệu"}
                                            placeholder="Chọn kích cỡ"
                                            maxTagCount="responsive"
                                            optionFilterProp="children"
                                            showSearch
                                            suffix={
                                              <Button
                                                style={{
                                                  width: 37,
                                                  height: 37,
                                                }}
                                                icon={<PlusOutlined />}
                                              />
                                            }
                                          >
                                            {listSize?.map((item) => (
                                              <CustomSelect.Option
                                                key={item.code}
                                                value={item.id}
                                              >
                                                {item.code}
                                              </CustomSelect.Option>
                                            ))}
                                          </CustomSelect>
                                        </Item>
                                        <Item
                                          label="Kích thước (dài, rộng, cao)"
                                          tooltip={{
                                            title:
                                              "Thông tin kích thước khi đóng gói sản phẩm",
                                            icon: <InfoCircleOutlined />,
                                          }}
                                        >
                                          <Input.Group compact>
                                            <Item
                                              name={[name, "length"]}
                                              noStyle
                                            >
                                              <NumberInput
                                                onChange={onChange}
                                                isFloat
                                                maxLength={6}
                                                format={(a) =>
                                                  formatCurrency(a)
                                                }
                                                replace={(a) =>
                                                  replaceFormatString(a)
                                                }
                                                style={{
                                                  width:
                                                    "calc((100% - 100px) / 3)",
                                                }}
                                                placeholder="Dài"
                                              />
                                            </Item>
                                            <Item
                                              name={[name, "width"]}
                                              noStyle
                                            >
                                              <NumberInput
                                                onChange={onChange}
                                                isFloat
                                                maxLength={6}
                                                format={(a) =>
                                                  formatCurrency(a)
                                                }
                                                replace={(a) =>
                                                  replaceFormatString(a)
                                                }
                                                style={{
                                                  width:
                                                    "calc((100% - 100px) / 3)",
                                                }}
                                                placeholder="Rộng"
                                              />
                                            </Item>
                                            <Item
                                              name={[name, "height"]}
                                              noStyle
                                            >
                                              <NumberInput
                                                onChange={onChange}
                                                isFloat
                                                maxLength={6}
                                                format={(a) =>
                                                  formatCurrency(a)
                                                }
                                                replace={(a) =>
                                                  replaceFormatString(a)
                                                }
                                                placeholder="Cao"
                                                style={{
                                                  width:
                                                    "calc((100% - 100px) / 3)",
                                                }}
                                              />
                                            </Item>
                                            <Item
                                              name={[name, "length_unit"]}
                                              noStyle
                                            >
                                              <Select
                                                onChange={onChange}
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
                                        <Item
                                          required
                                          label="Khối lượng"
                                          tooltip={{
                                            title:
                                              "Nhập khối lượng của sản phẩm",
                                            icon: <InfoCircleOutlined />,
                                          }}
                                        >
                                          <Input.Group compact>
                                            <Item
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    "Khối lượng không được để trống",
                                                },
                                              ]}
                                              name={[name, "weight"]}
                                              noStyle
                                            >
                                              <NumberInput
                                                onChange={onChange}
                                                isFloat
                                                maxLength={6}
                                                format={(a) =>
                                                  formatCurrency(a)
                                                }
                                                replace={(a) =>
                                                  replaceFormatString(a)
                                                }
                                                placeholder="Khối lượng"
                                                style={{
                                                  width: "calc(100% - 100px)",
                                                }}
                                              />
                                            </Item>
                                            <Item
                                              name={[name, "weight_unit"]}
                                              noStyle
                                            >
                                              <Select
                                                onChange={onChange}
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
                                      <Col span={24} sm={12}>
                                        <Item
                                          name={[name, "variant_images"]}
                                          hidden
                                          noStyle
                                        >
                                          <Input />
                                        </Item>

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
                                          {fieldList.length >= 6
                                            ? null
                                            : uploadButton}
                                        </Upload>
                                      </Col>
                                    </Row>
                                  </div>
                                </React.Fragment>
                              ) : null
                          )}
                        </>
                      )}
                    </Form.List>
                  </Col>
                </Row>
              </Card>
              <Form.List name="variants">
                {(fields, { add, remove })=>{

                  return  <ModalConfirmPrice
                  onCancel={() => {
                    setVisiblePrice(false);
                    remove(active);
                  }}
                  visible={visiblePrice}
                  onOk={onOkPrice}
                />
                }}
              </Form.List>
            </React.Fragment>
          </Form>
        )}
        <BottomBarContainer
          back="Quay lại"
          rightComponent={
            <Space>
              <Button>Đặt lại</Button>
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
          visible={visiblePickAvatar}
        />
        <ModalConfirm {...modalConfirm} />
       
       
        <ModalUpdatePrice onCancel={() => setVisibleUpdatePrice(false)} onOk={onUpdatePrice} currentVariant={active} variants={currentVariants} visible={visibleUpdatePrice} />
      </ContentContainer>
    </StyledComponent>
  );
};

export default ProductDetailScreen;
