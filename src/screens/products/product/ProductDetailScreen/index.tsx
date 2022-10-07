import {
  Loading3QuartersOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
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
} from "antd";
import variantdefault from "assets/icon/variantdefault.jpg";
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
import { AdvertisingHistoryResponse, HistoryInventoryResponse, InventoryResponse } from "model/inventory";
import { CollectionCreateRequest } from "model/product/collection.model";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { Products } from "utils/AppUtils";
import { getFirstProductAvatarByVariantResponse } from "utils/ProductUtils";
import { showSuccess } from "utils/ToastUtils";
import { careInformation } from "../component/CareInformation/care-value";
import RowDetail from "../component/RowDetail";
import VariantList from "../component/VariantList";
import TabProductHistory from "../tab/TabProductHistory";
import TabProductInventory from "../tab/TabProductInventory";
import { StyledComponent } from "./styles";
import useAuthorization from "hook/useAuthorization";
import "./index.scss";
import { callApiNative } from "utils/ApiUtils";
import { productUpdateApi } from "service/product/product.service";
import _ from "lodash";
import ProductSteps from "../component/ProductSteps";
import { fullTextSearch } from "utils/StringUtils";
import { SupplierResponse } from "model/core/supplier.model";
import TabAdvertisingHistory from "../tab/TabAdvertisingHistory";
export interface ProductParams {
  id: string;
  variantId: string;
}

enum TabName {
  HISTORY = "history",
  INVENTORY = "inventory",
  ADVERTISING_HISTORY = "advertising history",
}
const ProductDetailScreen = (props: {setTitle : (value: string) => void}) => {
  const {setTitle} = props;
  const { TabPane } = Tabs;
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const { hash } = location;

  const [isReSearch, setIsReSearch] = useState<boolean>(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>(TabName.INVENTORY);
  const { id, variantId } = useParams<ProductParams>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingVariantUpdate, setLoadingVariantUpdate] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const [keySearch, setKeySearch] = useState<string>();

  const [loadingVariant, setLoadingVariant] = useState(false);
  const [active, setActive] = useState<number>(0);
  const [nav1, setNav1] = useState<Slider | null>();
  const [nav2, setNav2] = useState<Slider | null>();
  const [data, setData] = useState<ProductResponse | null>(null);
  const [visibleDes, setVisibleDes] = useState<boolean>(false);
  const [loadingHis, setLoadingHis] = useState<boolean>(false);
  const [loadingAdvertisingHistory, setLoadingAdvertisingHistory] = useState<boolean>(false);
  const [loadingInventories, setLoadingInventories] = useState<boolean>(false);
  const [dataInventory, setDataInventory] = useState<PageResponse<InventoryResponse>>({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });
  const [dataHistory, setDataHistory] = useState<PageResponse<HistoryInventoryResponse>>({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });

  const [dataAdvertisingHistory, setDataAdvertisingHistory] = useState<PageResponse<AdvertisingHistoryResponse>>({
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

  const onEdit = () => {
    if (variantId) {
      // redirect to edit this variantId
      history.push(`${UrlConfig.PRODUCT}/${idNumber}/variants/${variantId}/update`);
    } else {
      // redirect to edit this product
      history.push(`${UrlConfig.PRODUCT}/${idNumber}/update`);
    }
  };

  const onResult = useCallback((result: ProductResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
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
    setLoadingVariant(false);
    if (!data) {
    } else {
      setData(data);
      showSuccess("Cập nhật thông tin thành công");
    }
  }, []);

  const update = useCallback(
    (product: ProductResponse) => {
      let productRequest: any = { ...product };
      setLoadingVariant(true);
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
    let avatar = Products.findAvatarProduct(data);
    if (avatar == null) {
      return variantdefault;
    }
    return avatar;
  }, [data]);

  const [careLabels, setCareLabels] = useState<any[]>([]);

  useEffect(() => {
    const newSelected = data?.care_labels ? data?.care_labels.split(";") : [];
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
  }, [data?.care_labels]);

  const onAllowSale = useCallback(
    (listSelected: Array<number>) => {
      if (data !== null) {
        let request = _.cloneDeep(data);
        request?.variants.forEach((item) => {
          if (listSelected.includes(item.id)) {
            item.saleable = true;
            item.status = "active";
          }
        });
        request.variants = getFirstProductAvatarByVariantResponse(request.variants);
        update(request);
      }
    },
    [data, update],
  );

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    let index = productStatusList?.findIndex((item) => item.value === data?.status);
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [data?.status, productStatusList]);

  const onStopSale = useCallback(
    (listSelected: Array<number>) => {
      if (data !== null) {
        data?.variants.forEach((item) => {
          if (listSelected.includes(item.id)) {
            item.saleable = false;
          }
        });
        data.variants = getFirstProductAvatarByVariantResponse(data.variants);
        update(data);
      }
    },
    [data, update],
  );

  const onChangeChecked = useCallback(
    async (e) => {
      if (data !== null) {
        let request: any = _.cloneDeep(data);
        setLoadingVariantUpdate(true);
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
        setLoadingVariantUpdate(false);

        if (!res) {
          setData(_.cloneDeep(data));
        } else {
          setData(res);
          showSuccess("Cập nhật thông tin thành công");
        }
      }
    },
    [active, data, dispatch, idNumber],
  );

  const onResultDetail = useCallback((result) => {
    setLoadingInventories(false);
    if (!result) {
    } else {
      setDataInventory(result);
      setDataInventoryOrg(result);
    }
  }, []);

  const onResultInventoryHistory = useCallback((result) => {
    setLoadingHis(false);
    if (!result) {
    } else {
      setDataHistory(result);
      setDataHistoryOrg(result);
    }
  }, []);

  const onResultAdvertisingHistory = useCallback((result) => {
    setLoadingAdvertisingHistory(false);
    if (!result) return;

    setDataAdvertisingHistory(result);
  }, []);

  const onChangeDataInventory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        let variantSelect = data.variants[active].id;
        setLoadingInventories(true);
        dispatch(
          inventoryGetDetailAction(
            { variant_id: variantSelect, page: page, limit: 500 },
            onResultDetail,
          ),
        );
      }
    },
    [active, data, dispatch, onResultDetail],
  );

  const onChangeDataHistory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        let variantSelect = data.variants[active].id;
        setLoadingHis(true);
        dispatch(
          inventoryGetHistoryAction(
            { variant_id: variantSelect, page: page, limit: 300 },
            onResultInventoryHistory,
          ),
        );
      }
    },
    [active, data, dispatch, onResultInventoryHistory],
  );

  const onChangeDataAdvertisingHistory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        let variantSelect = data.variants[active].id;
        setLoadingAdvertisingHistory(true);
        dispatch(
          inventoryGetAdvertisingHistoryAction(
            { variant_id: variantSelect, product_id: data.id, type: 'AUTOMATIC', page, limit: 300, state: 'ACTIVE' },
            onResultAdvertisingHistory,
          ),
        );
      }
    },
    [active, data, dispatch, onResultAdvertisingHistory],
  );

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  useEffect(() => {
    if (data && data?.variants.length > 0) {
      let variantSelect = data.variants[active].id;
      setLoadingHis(true);
      setLoadingInventories(true);
      setLoadingAdvertisingHistory(true);
      dispatch(inventoryGetDetailAction({ variant_id: variantSelect, limit: 500 }, onResultDetail));
      dispatch(
        inventoryGetHistoryAction(
          { variant_id: variantSelect, limit: 300 },
          onResultInventoryHistory,
        ),
      );
      dispatch(
        inventoryGetAdvertisingHistoryAction(
          { variant_id: variantSelect, product_id: data.id, type: 'AUTOMATIC', limit: 300, state: 'ACTIVE' },
          onResultAdvertisingHistory,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, data]);

  useEffect(() => {
    if (variantId && data) {
      let index = data.variants.findIndex((item) => item.id.toString() === variantId);
      if (index !== -1) {
        setActive(index);
      }
    }
  }, [data, variantId]);
  const tab = document.getElementById("tab");
  useLayoutEffect(() => {
    if (hash === TabName.INVENTORY) {
      setActiveTab(TabName.INVENTORY);
    }

    if (hash === TabName.HISTORY) {
      setActiveTab(TabName.HISTORY);
    }

    if (hash === TabName.ADVERTISING_HISTORY) {
      setActiveTab(TabName.ADVERTISING_HISTORY);
    }

    if (tabRef.current && hash) {
      tabRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tabRef, hash, tab]);

  const debounceSearch = useMemo(
    () =>
      _.debounce((code: string) => {
        if (activeTab === TabName.INVENTORY) {
          let variantsInv = _.cloneDeep(dataInventoryOrg);
          if (variantsInv.items && variantsInv.items.length === 0) return;
          if (!code || code === "") {
            onChangeDataInventory(1);
            return;
          }

          variantsInv.items = variantsInv.items.filter((e) => {
            return fullTextSearch(code, e.store.toLowerCase());
          });
          setDataInventory({ ...dataInventoryOrg, items: [...variantsInv.items] });
          return;
        }

        let variantsHis = _.cloneDeep(dataHistoryOrg);
        if (variantsHis.items && variantsHis.items.length === 0) return;
        if (!code || code === "") {
          onChangeDataHistory(1);
          return;
        }

        variantsHis.items = variantsHis.items.filter((e) => {
          return fullTextSearch(code, e.store.toLowerCase());
        });
        setDataHistory({ ...dataHistoryOrg, items: [...variantsHis.items] });
      }, 300),
    [activeTab, dataHistoryOrg, dataInventoryOrg, onChangeDataHistory, onChangeDataInventory],
  );

  const onChangeKeySearch = useCallback(
    (code: string) => {
      debounceSearch(code);
    },
    [debounceSearch],
  );

  useEffect(() => {
    if(data?.name) {
      setTitle(`${data?.name}`)
    }
  }, [data?.name, setTitle])
  
  return (
    <StyledComponent className="product-detail">
      <ContentContainer
        isError={error}
        isLoading={loading}
        title={`${data?.name}`}
        breadcrumb={[
          // {
          //   name: "Tổng quan",
          //   path: UrlConfig.HOME,
          // },
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

                          setLoadingSwitch(true);
                          dispatch(
                            productUpdateAction(idNumber, newData, (result) => {
                              setLoadingSwitch(false);
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
                      {loadingSwitch && (
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
                      <RowDetail title="Thương hiệu" value={data.brand} />
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
                              <span className={`care-label ydl-${item.value}`}/>
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
                                setVisibleDes(true);
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
                          disabledAction={data.status === "inactive"}
                          onAllowSale={onAllowSale}
                          onStopSale={onStopSale}
                          value={data.variants}
                          active={active}
                          setActive={(active) => {
                            history.replace(
                              `${UrlConfig.PRODUCT}/${idNumber}${UrlConfig.VARIANTS}/${data.variants[active].id}`,
                            );
                          }}
                          loading={loadingVariant}
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
                                    onChange={onChangeChecked}
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
                                </Col>
                                <Col className="view-right" span={24} md={10}>
                                  <div className="image-view">
                                    {currentVariant.variant_images?.length === 0 ? (
                                      <img className="item-default" src={variantdefault} alt="" />
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
                              {loadingVariantUpdate && (
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
                        <Input
                          name="key_search"
                          onChange={(e) => {
                            onChangeKeySearch(e.target.value);
                            setKeySearch(e.target.value);
                          }}
                          value={keySearch}
                          onKeyPress={(e) => e.key === "Enter" && setIsReSearch(!isReSearch)}
                          style={{ marginLeft: 8, minWidth: 300 }}
                          placeholder="Tìm kiếm theo tên cửa hàng"
                          addonAfter={
                            <SearchOutlined
                              onClick={() => {
                                setIsReSearch(!isReSearch);
                              }}
                              style={{ color: "#2A2A86" }}
                            />
                          }
                        />
                      }
                      style={{ overflow: "initial" }}
                      defaultActiveKey={activeTab}
                      onChange={(e) => {
                        setActiveTab(e);
                        setKeySearch("");
                        onChangeKeySearch("");
                      }}
                    >
                      <Tabs.TabPane tab="Danh sách tồn kho" key={TabName.INVENTORY}>
                        <TabProductInventory
                          loadingInventories={loadingInventories}
                          onChange={onChangeDataInventory}
                          data={dataInventory}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab="Lịch sử tồn kho" key={TabName.HISTORY}>
                        <TabProductHistory
                          loadingHis={loadingHis}
                          onChange={onChangeDataHistory}
                          data={dataHistory}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab="Chương trình khuyến mãi" key={TabName.ADVERTISING_HISTORY}>
                        <TabAdvertisingHistory
                          loadingAdvertisingHistory={loadingAdvertisingHistory}
                          onChange={onChangeDataAdvertisingHistory}
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
              visible={visibleDes}
              width="95%"
              onCancel={() => {
                setVisibleDes(false);
              }}
              footer={
                <>
                  <Button
                    type="primary"
                    onClick={() => {
                      setVisibleDes(false);
                    }}
                  >
                    Đóng
                  </Button>
                </>
              }
            >
              <div className="des-content">
                <Tabs defaultActiveKey="1">
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
              <Button onClick={onEdit}>Sửa sản phẩm</Button>
            </AuthWrapper>
          }
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default ProductDetailScreen;
