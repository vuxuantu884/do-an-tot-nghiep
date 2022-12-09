import {
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  Loading3QuartersOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Image,
  Input,
  Modal,
  Popover,
  Row,
  Spin,
  Switch,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import variantDefault from "assets/icon/variantdefault.jpg";
import classNames from "classnames";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import {
  inventoryGetAdvertisingHistoryAction,
  inventoryGetDetailAction,
  inventoryGetHistoryAction,
} from "domain/actions/inventory/inventory.action";
import { productGetDetail, productUpdateAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  AdvertisingHistoryResponse,
  HistoryInventoryResponse,
  InventoryResponse,
} from "model/inventory";
import { CollectionCreateRequest } from "model/product/collection.model";
import { ProductParams, ProductResponse, VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { formatCurrencyValue, SupportedCurrencyType } from "utils/AppUtils";
import {
  convertLabelSelected,
  findAvatarProduct,
  getFirstProductAvatarByVariantResponse,
  ProductDetailTabName,
} from "screens/products/helper";
import { showSuccess } from "utils/ToastUtils";
import { RowDetail, ProductSteps, VariantList } from "../component";
import { TabProductHistory, TabProductInventory } from "../tab";
import { StyledComponent } from "./styles";
import useAuthorization from "hook/useAuthorization";
import { callApiNative } from "utils/ApiUtils";
import { productUpdateApi } from "service/product/product.service";
import { cloneDeep, debounce } from "lodash";
import { fullTextSearch } from "utils/StringUtils";
import { SupplierResponse } from "model/core/supplier.model";
import TreeStore from "component/TreeStore";
import { StoreResponse } from "model/core/store.model";
import { getAllPublicSimpleStoreApi } from "service/core/store.service";
import { enumStoreStatus } from "model/warranty/warranty.model";
import { TabAdvertisingHistory } from "../tab";

const LIMIT_PAGE = 10;
const LIMIT_PAGE_DETAIL = 500;

const initialDataInventory: PageResponse<
  InventoryResponse | HistoryInventoryResponse | HistoryInventoryResponse
> = {
  items: [],
  metadata: {
    limit: 30,
    page: 1,
    total: 0,
  },
};

const ProductDetailScreen = (props: { setTitle: (value: string) => void }) => {
  const { setTitle } = props;
  const { TabPane } = Tabs;
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const { hash } = location;

  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [valueStores, setValueStores] = useState<Array<number>>([]);
  const tabRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>(ProductDetailTabName.INVENTORY);
  const { id, variantId } = useParams<ProductParams>();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVariantUpdate, setIsLoadingVariantUpdate] = useState(false);
  const [isLoadingSwitch, setIsLoadingSwitch] = useState(false);
  const [keySearch, setKeySearch] = useState<string>();

  const [isLoadingVariant, setIsLoadingVariant] = useState(false);
  const [active, setActive] = useState<number>(0);
  const [nav1, setNav1] = useState<Slider | null>();
  const [nav2, setNav2] = useState<Slider | null>();
  const [data, setData] = useState<ProductResponse | null>(null);
  const [isVisibleDes, setIsVisibleDes] = useState<boolean>(false);
  const [isLoadingHis, setIsLoadingHis] = useState<boolean>(false);
  const [isLoadingAdvertisingHistory, setIsLoadingAdvertisingHistory] = useState<boolean>(false);
  const [isLoadingInventories, setIsLoadingInventories] = useState<boolean>(false);
  const [dataInventory, setDataInventory] = useState<PageResponse<InventoryResponse>>({
    ...(initialDataInventory as PageResponse<InventoryResponse>),
  });
  const [dataHistory, setDataHistory] = useState<PageResponse<HistoryInventoryResponse>>({
    ...(initialDataInventory as PageResponse<HistoryInventoryResponse>),
  });

  const [dataAdvertisingHistory, setDataAdvertisingHistory] = useState<
    PageResponse<AdvertisingHistoryResponse>
  >({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });

  const [dataInventoryOrg, setDataInventoryOrg] = useState<PageResponse<InventoryResponse>>({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });
  const [dataHistoryOrg, setDataHistoryOrg] = useState<PageResponse<HistoryInventoryResponse>>({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });
  const idNumber = parseInt(id);
  const [canUpdateSaleable] = useAuthorization({
    acceptPermissions: [ProductPermission.update_saleable],
  });

  // kiểm tra người dùng có thể xem giá vốn
  const [canReadCost] = useAuthorization({
    acceptPermissions: [ProductPermission.read_cost],
  });

  // kiểm tra người dùng có thể xem giá nhập
  const [canReadImportPrice] = useAuthorization({
    acceptPermissions: [ProductPermission.read_import],
  });

  const redirectToUpdatePage = () => {
    if (variantId) {
      // redirect to edit this variantId
      history.push(`${UrlConfig.PRODUCT}/${idNumber}/variants/${variantId}/update`);
    } else {
      // redirect to edit this product
      history.push(`${UrlConfig.PRODUCT}/${idNumber}/update`);
    }
  };

  const onResult = useCallback((result: ProductResponse | false) => {
    setIsLoading(false);
    if (!result) {
      setIsError(true);
    } else {
      setData(result);
    }
  }, []);

  const currentVariant = useMemo(() => {
    if (data && data.variants.length > 0) {
      return data.variants[active];
    }
    return null;
  }, [active, data]);

  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status,
  );

  const renderSize = () => {
    const dimensionList: Array<number | string> = [
      currentVariant?.length || 0,
      currentVariant?.width || 0,
      currentVariant?.height || 0,
    ];

    let dimension = "";
    if (currentVariant?.length || currentVariant?.width || currentVariant?.height) {
      dimension = dimensionList.join(" x ");
      if (currentVariant?.length_unit) {
        dimension += ` ${currentVariant.length_unit}`;
      }
    }

    return dimension;
  };

  const onResultUpdate = useCallback((data: ProductResponse | false) => {
    setIsLoadingVariant(false);
    if (!data) {
    } else {
      setData(data);
      showSuccess("Cập nhật thông tin thành công");
    }
  }, []);

  const updateInfo = useCallback(
    (product: ProductResponse) => {
      let productRequest: any = { ...product };
      setIsLoadingVariant(true);
      if (productRequest.collections) {
        productRequest.collections = productRequest.collections.map(
          (e: CollectionCreateRequest) => e.code,
        );
      }
      dispatch(productUpdateAction(idNumber, productRequest, onResultUpdate));
    },
    [dispatch, idNumber, onResultUpdate],
  );

  const productAvatar = useMemo(() => {
    const avatar = findAvatarProduct(data);
    if (avatar == null) {
      return variantDefault;
    }
    return avatar;
  }, [data]);

  const [careLabels, setCareLabels] = useState<any[]>([]);

  useEffect(() => {
    const newSelected = data?.care_labels ? data?.care_labels.split(";") : [];

    const careLabels = convertLabelSelected(newSelected);

    setCareLabels(careLabels);
  }, [data?.care_labels]);

  const allowSale = useCallback(
    (listSelected: Array<number>) => {
      if (data !== null) {
        const request = cloneDeep(data);
        request?.variants.forEach((item) => {
          if (listSelected.includes(item.id)) {
            item.saleable = true;
            item.status = "active";
          }
        });
        request.variants = getFirstProductAvatarByVariantResponse(request.variants);
        updateInfo(request);
      }
    },
    [data, updateInfo],
  );

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    const index = productStatusList?.findIndex((item) => item.value === data?.status);
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [data?.status, productStatusList]);

  const stopSale = useCallback(
    (listSelected: Array<number>) => {
      if (data !== null) {
        data?.variants.forEach((item) => {
          if (listSelected.includes(item.id)) {
            item.saleable = false;
          }
        });
        data.variants = getFirstProductAvatarByVariantResponse(data.variants);
        updateInfo(data);
      }
    },
    [data, updateInfo],
  );

  const changeChecked = useCallback(
    async (e) => {
      if (data !== null) {
        const request: any = cloneDeep(data);
        setIsLoadingVariantUpdate(true);
        request.variants[active].saleable = e;
        if (e) request.variants[active].status = "active"; //CO-3415
        request.variants = getFirstProductAvatarByVariantResponse(request.variants);
        if (data.collections) {
          request.collections = data.collections.map((e: CollectionCreateRequest) => e.code);
        }
        const res = await callApiNative(
          { isShowLoading: false },
          dispatch,
          productUpdateApi,
          idNumber,
          request,
        );
        setIsLoadingVariantUpdate(false);

        if (!res) {
          setData(cloneDeep(data));
        } else {
          setData(res);
          showSuccess("Cập nhật thông tin thành công");
        }
      }
    },
    [active, data, dispatch, idNumber],
  );

  const onResultDetail = useCallback((result) => {
    setIsLoadingInventories(false);
    if (!result) {
    } else {
      setDataInventory(result);
      setDataInventoryOrg(result);
    }
  }, []);

  const onResultInventoryHistory = useCallback((result) => {
    setIsLoadingHis(false);
    if (!result) {
      setDataHistory({ ...(initialDataInventory as PageResponse<HistoryInventoryResponse>) });
      setDataHistoryOrg({ ...(initialDataInventory as PageResponse<HistoryInventoryResponse>) });
    } else {
      setDataHistory(result);
      setDataHistoryOrg(result);
    }
  }, []);

  const onResultAdvertisingHistory = useCallback((result) => {
    setIsLoadingAdvertisingHistory(false);
    if (!result) return;

    setDataAdvertisingHistory(result);
  }, []);

  const changeDataInventory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        const variantSelect = data.variants[active].id;
        setIsLoadingInventories(true);
        dispatch(
          inventoryGetDetailAction(
            { variant_id: variantSelect, page: page, limit: LIMIT_PAGE_DETAIL },
            onResultDetail,
          ),
        );
      }
    },
    [active, data, dispatch, onResultDetail],
  );

  const changeDataHistory = useCallback(
    (page) => {
      console.log("change");
      if (data && data?.variants.length > 0) {
        const variantSelect = data.variants[active].id;
        setIsLoadingHis(true);
        dispatch(
          inventoryGetHistoryAction(
            {
              variant_id: variantSelect,
              page: page,
              limit: LIMIT_PAGE,
              store_ids: valueStores,
            },
            onResultInventoryHistory,
          ),
        );
      }
    },
    [active, data, dispatch, onResultInventoryHistory],
  );

  const changeDataAdvertisingHistory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        const variantSelect = data.variants[active].id;
        setIsLoadingAdvertisingHistory(true);
        dispatch(
          inventoryGetAdvertisingHistoryAction(
            {
              variant_id: variantSelect,
              product_id: data.id,
              type: "AUTOMATIC",
              page,
              limit: LIMIT_PAGE,
              state: "ACTIVE",
            },
            onResultAdvertisingHistory,
          ),
        );
      }
    },
    [active, data, dispatch, onResultAdvertisingHistory],
  );
  const onChangeStore = (value: number[], labelList: React.ReactNode[]) => {
    if (data && data?.variants.length > 0) {
      const variantSelect = data.variants[active].id;
      setValueStores(value);
      dispatch(
        inventoryGetHistoryAction(
          { variant_id: variantSelect, limit: LIMIT_PAGE, store_ids: value },
          onResultInventoryHistory,
        ),
      );
    }
  };

  const getAllStores = async () => {
    callApiNative({ isShowLoading: false }, dispatch, getAllPublicSimpleStoreApi).then((res) => {
      setStores(res);
    });
  };
  useEffect(() => {
    setIsLoading(false);
    getAllStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  useEffect(() => {
    if (data && data?.variants.length > 0) {
      const variantSelect = data.variants[active].id;
      setIsLoadingHis(true);
      setIsLoadingInventories(true);
      setIsLoadingAdvertisingHistory(true);
      dispatch(
        inventoryGetDetailAction(
          { variant_id: variantSelect, limit: LIMIT_PAGE_DETAIL },
          onResultDetail,
        ),
      );
      dispatch(
        inventoryGetHistoryAction(
          { variant_id: variantSelect, limit: LIMIT_PAGE_DETAIL },
          onResultInventoryHistory,
        ),
      );
      dispatch(
        inventoryGetAdvertisingHistoryAction(
          {
            variant_id: variantSelect,
            product_id: data.id,
            type: "AUTOMATIC",
            limit: LIMIT_PAGE,
            state: "ACTIVE",
          },
          onResultAdvertisingHistory,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, data]);

  useEffect(() => {
    if (variantId && data) {
      const index = data.variants.findIndex((item) => item.id.toString() === variantId);
      if (index !== -1) {
        setActive(index);
      }
    }
  }, [data, variantId]);

  const tab = document.getElementById("tab");

  useLayoutEffect(() => {
    if (hash === ProductDetailTabName.INVENTORY) {
      setActiveTab(ProductDetailTabName.INVENTORY);
    }

    if (hash === ProductDetailTabName.HISTORY) {
      setActiveTab(ProductDetailTabName.HISTORY);
    }

    if (hash === ProductDetailTabName.ADVERTISING_HISTORY) {
      setActiveTab(ProductDetailTabName.ADVERTISING_HISTORY);
    }

    if (tabRef.current && hash) {
      tabRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tabRef, hash, tab]);

  const debounceSearch = useMemo(
    () =>
      debounce((code: string) => {
        if (activeTab === ProductDetailTabName.INVENTORY) {
          const variantsInv = cloneDeep(dataInventoryOrg);
          if (variantsInv.items && variantsInv.items.length === 0) return;
          if (!code || code === "") {
            changeDataInventory(1);
            return;
          }

          variantsInv.items = variantsInv.items.filter((e) => {
            return fullTextSearch(code, e.store.toLowerCase());
          });
          setDataInventory({ ...dataInventoryOrg, items: [...variantsInv.items] });
          return;
        }

        const variantsHis = cloneDeep(dataHistoryOrg);
        if (variantsHis.items && variantsHis.items.length === 0) return;
        if (!code || code === "") {
          changeDataHistory(1);
          return;
        }

        variantsHis.items = variantsHis.items.filter((e) => {
          return fullTextSearch(code, e.store.toLowerCase());
        });
        setDataHistory({ ...dataHistoryOrg, items: [...variantsHis.items] });
      }, 300),
    [activeTab, dataHistoryOrg, dataInventoryOrg, changeDataHistory, changeDataInventory],
  );

  const changeKeySearch = useCallback(
    (code: string) => {
      debounceSearch(code);
    },
    [debounceSearch],
  );

  useEffect(() => {
    if (data?.name) {
      setTitle(`${data?.name}`);
    }
  }, [data?.name, setTitle]);

  return (
    <StyledComponent className="product-detail">
      <ContentContainer
        isError={isError}
        isLoading={isLoading}
        title={`${data?.name}`}
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
        extra={<ProductSteps data={data} />}
      >
        {data !== null && (
          <React.Fragment>
            <Row gutter={24}>
              <Col span={24} md={18}>
                <Card
                  title="Thông tin sản phẩm"
                  className="card"
                  extra={
                    <div className="extra-cards status">
                      <b>Trạng thái:</b>

                      <Switch
                        style={{ marginLeft: 10 }}
                        checked={data.status === "active"}
                        onChange={(checked) => {
                          let newData: any = { ...data };
                          newData.status = checked ? "active" : "inactive";
                          newData.variants.forEach((item: VariantResponse) => {
                            item.status = checked ? item.status : "inactive";
                            if (!checked) {
                              item.saleable = checked;
                            }
                          });
                          newData.variants = getFirstProductAvatarByVariantResponse(
                            newData.variants,
                          );
                          if (newData.collections) {
                            newData.collections = newData.collections.map(
                              (e: CollectionCreateRequest) => e.code,
                            );
                          }

                          setIsLoadingSwitch(true);
                          dispatch(
                            productUpdateAction(idNumber, newData, (result) => {
                              setIsLoadingSwitch(false);
                              if (result) {
                                setData(result);
                                showSuccess("Cập nhật trạng thái thành công");
                              }
                            }),
                          );
                        }}
                        className="ant-switch-success"
                        defaultChecked
                      />

                      <label
                        style={{ marginLeft: 10 }}
                        className={data.status === "active" ? "text-success" : "text-error"}
                      >
                        {statusValue}
                      </label>
                      {isLoadingSwitch && (
                        <div className="loading-view">
                          <Spin
                            indicator={<Loading3QuartersOutlined style={{ fontSize: 28 }} spin />}
                          />
                        </div>
                      )}
                    </div>
                  }
                >
                  <Row gutter={50}>
                    <Col span={24} md={12}>
                      <RowDetail title="Danh mục" value={data.category} />
                      <RowDetail title="Mã sản phẩm" value={data.code} />
                      <RowDetail title="Thương hiệu" value={data.brand_name} />
                      <RowDetail title="Chất liệu" value={data.material} />
                    </Col>
                    <Col span={24} md={12}>
                      <RowDetail title="Ngành hàng" value={data.goods_name} />
                      <RowDetail title="Tên sản phẩm" value={data.name} />
                      <RowDetail title="Xuất xứ" value={data.made_in} />
                      <RowDetail title="Đơn vị" value={data.unit_name} />
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12}>
                      <div className="row-detail">
                        <div className="row-detail-left title">Từ khóa</div>
                        <div className="dot data">:</div>
                        <div className="row-detail-right data">
                          {data.tags?.split(",")?.map((keyword) => {
                            return <Tag key={keyword}>{keyword}</Tag>;
                          })}
                        </div>
                      </div>
                    </Col>
                    <Col span={24} md={12}>
                      <div className="row-detail">
                        <div className="row-detail-left title">Nhóm hàng</div>
                        <div className="dot data">:</div>
                        <div className="row-detail-right data">
                          {data.collections
                            ?.map((e) => {
                              return e.name;
                            })
                            .toString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={12}>
                      <div className="row-detail">
                        <div className="row-detail-left title">Thông tin bảo quản</div>
                        <div className="dot data">:</div>
                        <div className="row-detail-right data">
                          {careLabels.map((item: any) => (
                            <Popover key={item.value} content={item.name}>
                              <span className={`care-label ydl-${item.value}`} />
                            </Popover>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={5}>
                      <div className="title" style={{ color: "#666666" }}>
                        Mô tả
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} md={24}>
                      {data.description ? (
                        <div style={{ position: "relative" }}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: data.description,
                            }}
                            className="data-content"
                          />
                          <div
                            className="devvn_readmore_taxonomy_flatsome devvn_readmore_taxonomy_flatsome_show"
                            style={{ display: "block" }}
                          >
                            <Button
                              className="button-show-more"
                              onClick={() => {
                                setIsVisibleDes(true);
                              }}
                            >
                              Xem thêm
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="data-empty">Không có mô tả</div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24} md={6}>
                <Card title="Ảnh" className="card">
                  <div className="padding-20 card-image">
                    <Image src={productAvatar} />
                  </div>
                </Card>
                <Card title="Phòng win" className="card">
                  <RowDetail
                    title="Merchandiser "
                    value={
                      <>
                        <Link
                          target="_blank"
                          to={`${UrlConfig.ACCOUNTS}/${data.merchandiser_code}`}
                        >
                          {data.merchandiser}
                        </Link>
                      </>
                    }
                  />
                  <RowDetail
                    title="Thiết kế"
                    value={
                      <>
                        <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${data.designer_code}`}>
                          {data.designer}
                        </Link>
                      </>
                    }
                  />
                </Card>
              </Col>
            </Row>
            <AuthWrapper acceptPermissions={[ProductPermission.read_variant]}>
              <Row gutter={24}>
                <Col span={24}>
                  <Card className="card">
                    <Row className="card-container">
                      <Col className="left" span={24} md={7}>
                        <VariantList
                          isDisabledAction={data.status === "inactive"}
                          onAllowSale={allowSale}
                          onStopSale={stopSale}
                          value={data.variants}
                          active={active}
                          setActive={(active) => {
                            history.replace(
                              `${UrlConfig.PRODUCT}/${idNumber}${UrlConfig.VARIANTS}/${data.variants[active].id}`,
                            );
                          }}
                          isLoading={isLoadingVariant}
                          productData={data}
                          canUpdateSaleable={canUpdateSaleable}
                        />
                      </Col>

                      <Col className="right" span={24} md={17}>
                        {currentVariant !== null && (
                          <React.Fragment>
                            <div className="header-view">
                              <div className="header-view-left">
                                <b>THÔNG TIN PHIÊN BẢN</b>
                              </div>
                              <div className="header-view-right">
                                {canUpdateSaleable && (
                                  <Switch
                                    onChange={changeChecked}
                                    className="ant-switch-success"
                                    disabled={data.status === "inactive"}
                                    checked={currentVariant.saleable}
                                  />
                                )}

                                <label className="label-switch">
                                  {currentVariant.saleable ? "Cho phép bán" : "Không cho phép bán"}
                                </label>
                              </div>
                            </div>
                            <div className="container-view">
                              <Row>
                                <Col span={24} md={14}>
                                  <RowDetail title="Mã vạch" value={currentVariant.barcode} />
                                  <RowDetail title="Mã sản phẩm" value={currentVariant.sku} />
                                  <RowDetail title="Tên sản phẩm" value={currentVariant.name} />
                                  <RowDetail title="Màu sắc" value={currentVariant.color} />
                                  <RowDetail title="Size" value={currentVariant.size} />
                                  <RowDetail
                                    title="Kích thước (Dài, Rộng, Cao) "
                                    value={renderSize()}
                                  />
                                  <RowDetail
                                    title="Khối lượng"
                                    value={`${currentVariant.weight} ${currentVariant.weight_unit} `}
                                  />
                                  <RowDetail
                                    title="Nhà cung cấp"
                                    value={
                                      currentVariant.suppliers
                                        ? currentVariant.suppliers
                                            .map((e: SupplierResponse) => e.name)
                                            .toString()
                                        : ""
                                    }
                                  />
                                  <div className="variant-price-container">
                                    {[
                                      { title: "Giá buôn", index: "wholesale_price" },
                                      { title: "Giá nhập", index: "import_price" },
                                      { title: "Giá vốn", index: "cost_price" },
                                      { title: "Thuế", index: "tax_percent" },
                                    ].map((item, idx) => {
                                      const prices = currentVariant.variant_prices[0];
                                      let priceValue: React.ReactNode = "";

                                      if (prices[item.index] === null) {
                                        if (
                                          (idx === 1 && !canReadImportPrice) ||
                                          (idx === 2 && !canReadCost)
                                        ) {
                                          priceValue = (
                                            <Tooltip
                                              title={`Bạn không có quyền xem ${item.title}`}
                                              placement="top"
                                            >
                                              <EyeInvisibleOutlined
                                                style={{ color: "gray", cursor: "pointer" }}
                                              />
                                            </Tooltip>
                                          );
                                        }
                                      } else {
                                        if ([0, 1, 2].includes(idx)) {
                                          priceValue = formatCurrencyValue(
                                            prices[item.index],
                                            ".",
                                            ",",
                                            prices.currency_code.toUpperCase() as SupportedCurrencyType,
                                          );
                                        } else {
                                          priceValue = `${prices[item.index]} %`;
                                        }
                                      }
                                      return (
                                        <div key={idx} className="variant-prices">
                                          <div className="variant-price-title">{item.title}</div>
                                          <div className="variant-price-value">{priceValue}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </Col>
                                <Col className="view-right" span={24} md={10}>
                                  <div className="image-view">
                                    {currentVariant.variant_images?.length === 0 ? (
                                      <img className="item-default" src={variantDefault} alt="" />
                                    ) : (
                                      <React.Fragment>
                                        {currentVariant.variant_images?.length === 1 ? (
                                          <Image
                                            src={currentVariant.variant_images[0].url}
                                            alt=""
                                          />
                                        ) : (
                                          <React.Fragment>
                                            <Slider
                                              asNavFor={nav2 ? nav2 : undefined}
                                              ref={(slider1) => setNav1(slider1)}
                                              infinite={true}
                                              slidesToShow={1}
                                              slidesToScroll={1}
                                              arrows={false}
                                              className={classNames("image-slider")}
                                            >
                                              {currentVariant.variant_images?.map((item, index) => (
                                                <Image key={index} src={item.url} alt="" />
                                              ))}
                                            </Slider>
                                            <Slider
                                              asNavFor={nav1 ? nav1 : undefined}
                                              ref={(slider2) => setNav2(slider2)}
                                              infinite={true}
                                              slidesToShow={
                                                currentVariant.variant_images?.length < 3
                                                  ? currentVariant.variant_images.length
                                                  : 3
                                              }
                                              slidesToScroll={1}
                                              arrows={true}
                                              focusOnSelect={true}
                                              className={classNames(
                                                "image-thumbnail",
                                                currentVariant.variant_images?.length === 2 &&
                                                  "image-2",
                                              )}
                                            >
                                              {currentVariant.variant_images?.map((item, index) => (
                                                <img key={index} src={item.url} alt="" />
                                              ))}
                                            </Slider>
                                          </React.Fragment>
                                        )}
                                      </React.Fragment>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              {isLoadingVariantUpdate && (
                                <div className="loading-view">
                                  <Spin
                                    indicator={
                                      <Loading3QuartersOutlined style={{ fontSize: 28 }} spin />
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </React.Fragment>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </AuthWrapper>
            <Row gutter={24}>
              <Col span={24}>
                <div id="tab" ref={tabRef}>
                  <Card className="card">
                    <Tabs
                      tabBarExtraContent={
                        <>
                          <TreeStore
                            name="store_ids"
                            placeholder="Chọn cửa hàng"
                            listStore={((stores || []) as StoreResponse[]).filter(
                              (store) => store.status === enumStoreStatus.ACTIVE,
                            )}
                            style={{ minWidth: "220px" }}
                            value={valueStores}
                            onChange={onChangeStore}
                          />
                        </>
                      }
                      style={{ overflow: "initial" }}
                      defaultActiveKey={activeTab}
                      onChange={(e) => {
                        setActiveTab(e);
                        setKeySearch("");
                        changeKeySearch("");
                      }}
                    >
                      <Tabs.TabPane tab="Danh sách tồn kho" key={ProductDetailTabName.INVENTORY}>
                        <TabProductInventory
                          isLoadingInventories={isLoadingInventories}
                          onChange={changeDataInventory}
                          data={dataInventory}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab="Lịch sử tồn kho" key={ProductDetailTabName.HISTORY}>
                        <TabProductHistory
                          isLoadingHis={isLoadingHis}
                          onChange={changeDataHistory}
                          data={dataHistory}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab="Chương trình khuyến mãi"
                        key={ProductDetailTabName.ADVERTISING_HISTORY}
                      >
                        <TabAdvertisingHistory
                          isLoadingAdvertisingHistory={isLoadingAdvertisingHistory}
                          onChange={changeDataAdvertisingHistory}
                          data={dataAdvertisingHistory}
                          dataVariant={data.variants[active]}
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  </Card>
                </div>
              </Col>
            </Row>
            <Modal
              className="modal-des"
              title="Mô tả sản phẩm"
              visible={isVisibleDes}
              width="95%"
              onCancel={() => {
                setIsVisibleDes(false);
              }}
              footer={
                <>
                  <Button
                    type="primary"
                    onClick={() => {
                      setIsVisibleDes(false);
                    }}
                  >
                    Đóng
                  </Button>
                </>
              }
            >
              <div className="des-content">
                <Tabs defaultActiveKey="0">
                  <TabPane
                    key="0"
                    tab={
                      <span>
                        <InfoCircleOutlined />
                        Mô tả chung
                      </span>
                    }
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: data.description,
                      }}
                      className="data-content"
                    ></div>
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <UnorderedListOutlined />
                        Thành phần
                      </span>
                    }
                    key="1"
                  >
                    {data?.component}
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <PlusCircleOutlined />
                        Ưu điểm
                      </span>
                    }
                    key="2"
                  >
                    {data.advantages && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: data.advantages,
                        }}
                        className="data-content"
                      />
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <MinusCircleOutlined />
                        Khuyến cáo
                      </span>
                    }
                    key="3"
                  >
                    {data.defect && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: data.defect,
                        }}
                        className="data-content"
                      />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Modal>
          </React.Fragment>
        )}
        <BottomBarContainer
          back="Quay lại"
          rightComponent={
            <AuthWrapper acceptPermissions={[ProductPermission.update]}>
              <Button onClick={redirectToUpdatePage}>Sửa sản phẩm</Button>
            </AuthWrapper>
          }
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default ProductDetailScreen;
