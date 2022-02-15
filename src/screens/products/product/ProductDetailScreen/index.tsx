import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Button, Card, Col, Image, Popover, Row, Spin, Switch, Tabs, Tag } from "antd";
import variantdefault from "assets/icon/variantdefault.jpg";
import classNames from "classnames";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import {
  inventoryGetDetailAction,
  inventoryGetHistoryAction
} from "domain/actions/inventory/inventory.action";
import {
  productGetDetail,
  productUpdateAction
} from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryResponse, InventoryResponse } from "model/inventory";
import { CollectionCreateRequest } from "model/product/collection.model";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
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

export interface ProductParams {
  id: string;
  variantId: string;
}

enum TabName {
  HISTORY = '#historyTab',
  INVENTORY = '#inventoryTab'
}
const ProductDetailScreen: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const {hash} = location;

  const tabRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab]= useState<string>("1")
  const { id, variantId } = useParams<ProductParams>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingVariantUpdate, setLoadingVariantUpdate] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  const [loadingVariant, setLoadingVariant] = useState(false);
  const [active, setActive] = useState<number>(0);
  const [nav1, setNav1] = useState<Slider | null>();
  const [nav2, setNav2] = useState<Slider | null>();
  const [data, setData] = useState<ProductResponse | null>(null);
  const [dataInventory, setDataInventory] = useState<
    PageResponse<InventoryResponse>
  >({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });
  const [dataHistory, setDataHistory] = useState<
    PageResponse<HistoryInventoryResponse>
  >({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });
  const idNumber = parseInt(id);

  const onEdit =() => {
    if(variantId){
      // redirect to edit this variantId
      history.push(`${UrlConfig.PRODUCT}/${idNumber}/variants/${variantId}/update`);
    }else{
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
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status
  );

  const renderSize = useMemo(() => {
    if (currentVariant) {
      if (
        currentVariant.length &&
        currentVariant.width &&
        currentVariant.height
      ) {
        return `${currentVariant.length} x ${currentVariant.width} x ${currentVariant.height} ${currentVariant.length_unit}`;
      }
    }
    return "";
  }, [currentVariant]);

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
      setLoadingVariant(true);
      dispatch(productUpdateAction(idNumber, product, onResultUpdate));
    },
    [dispatch, idNumber, onResultUpdate]
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
    console.log('newSelected', newSelected);
    let careLabels: any[] = []
    newSelected.forEach((value: string) => {
      careInformation.washing.forEach((item: any) => {
        if (value === item.value) {
          console.log(value);
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });

      careInformation.beleaching.forEach((item: any) => {
        if (value === item.value) {
          console.log(value);
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      careInformation.ironing.forEach((item: any) => {
        if (value === item.value) {
          console.log(value);
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      careInformation.drying.forEach((item: any) => {
        if (value === item.value) {
          console.log(value);
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      careInformation.professionalCare.forEach((item: any) => {
        if (value === item.value) {
          console.log(value);
          careLabels.push({
            ...item,
            active: true,
          })
        }
      });
      
    })
    setCareLabels(careLabels);
  }, [data?.care_labels]);

  const onAllowSale = useCallback(
    (listSelected: Array<number>) => {
      if (data !== null) {
        data?.variants.forEach((item) => {
          if (listSelected.includes(item.id)) {
            item.saleable = true;
          }
        });
        data.variants = getFirstProductAvatarByVariantResponse(data.variants);
        update(data);
      }
    },
    [data, update]
  );

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    let index = productStatusList?.findIndex(
      (item) => item.value === data?.status
    );
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
    [data, update]
  );

  const onUpdateSaleable = useCallback((data1) => {
    setLoadingVariantUpdate(false);
    if (!data1) {
    } else {
      setData(data1);
      showSuccess("Cập nhật thông tin thành công");
    }
  }, []);

  const onChangeChecked = useCallback(
    (e) => {
      if (data !== null) {
        let request: any = data;
        setLoadingVariantUpdate(true);
        request.variants[active].saleable = e;
        request.variants = getFirstProductAvatarByVariantResponse(data.variants);
        if (data.collections) {
          request.collections = data.collections.map((e: CollectionCreateRequest)=>e.code);
        }  
        dispatch(productUpdateAction(idNumber, request, onUpdateSaleable));
      }
    },
    [active, data, dispatch, idNumber, onUpdateSaleable]
  );

  const onResultDetail = useCallback((result) => {
    if (!result) {
    } else {
      setDataInventory(result);
    }
  }, []);

  const onResultInventoryHistory = useCallback((result) => {
    if (!result) {
    } else {
      setDataHistory(result);
    }
  }, []);

  const onChangeDataInventory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        let variantSelect = data.variants[active].id;
        dispatch(
          inventoryGetDetailAction(
            { variant_id: variantSelect, page: page },
            onResultDetail
          )
        );
      }
    },
    [active, data, dispatch, onResultDetail]
  );

  const onChangeDataHistory = useCallback(
    (page) => {
      if (data && data?.variants.length > 0) {
        let variantSelect = data.variants[active].id;
        dispatch(
          inventoryGetHistoryAction(
            { variant_id: variantSelect, page: page },
            onResultInventoryHistory
          )
        );       
      }
    },
    [active, data, dispatch, onResultInventoryHistory]
  );

  const onTabClick = (key: string) => {
    history.push(key);
  };

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  useEffect(() => {
    if (data && data?.variants.length > 0) {
      let variantSelect = data.variants[active].id;
      dispatch(
        inventoryGetDetailAction({ variant_id: variantSelect }, onResultDetail)
      );
      dispatch(
        inventoryGetHistoryAction(
          { variant_id: variantSelect },
          onResultInventoryHistory
        )
      );
    }
  }, [
    active,
    data,
    dispatch,
    onResult,
    onResultDetail,
    onResultInventoryHistory,
  ]);
  useEffect(() => {
    if (variantId && data) {
      let index = data.variants.findIndex(
        (item) => item.id.toString() === variantId
      );
      if (index !== -1) {
        setActive(index);
      }
    }
  }, [data, variantId]);
const tab= document.getElementById("tab");
  useLayoutEffect(() => { 

     if (hash === TabName.INVENTORY) {
       setActiveTab(TabName.INVENTORY);
     }

     if (hash === TabName.HISTORY) {
       setActiveTab(TabName.HISTORY);
     }

     if (tabRef.current && hash) {
       tabRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
     } 

  }, [tabRef, hash, tab]);

  return (
    <StyledComponent>
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
                          style={{marginLeft: 10}}
                          checked={data.status === "active"}
                          onChange={(checked) => {
                            let newData: any = {...data};
                            newData.status = checked ? "active" : "inactive";
                            newData.variants.forEach((item: VariantResponse) => {
                              item.status = checked ? "active" : "inactive";
                              if (!checked) {
                                item.saleable = checked;
                              }
                            });
                            newData.variants = getFirstProductAvatarByVariantResponse(
                              newData.variants
                            );
                            if (newData.collections) {
                              newData.collections = newData.collections.map((e: CollectionCreateRequest)=>e.code);
                            }  
                      
                            setLoadingSwitch(true);
                            dispatch(
                              productUpdateAction(idNumber, newData, (result) => {
                                setLoadingSwitch(false);
                                if (result) {
                                  setData(result);
                                  showSuccess("Cập nhật trạng thái thành công");
                                }
                              })
                            );
                          }}
                          className="ant-switch-success"
                          defaultChecked
                        />
                      
                      <label
                        style={{marginLeft: 10}}
                        className={
                          data.status === "active" ? "text-success" : "text-error"
                        }
                      >
                        {statusValue}
                      </label>
                      {loadingSwitch && (
                        <div className="loading-view">
                          <Spin
                            indicator={
                              <Loading3QuartersOutlined style={{fontSize: 28}} spin />
                            }
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
                          <div className="row-detail-right data">{data.tags?.split(",")?.map((keyword)=>{
                            return <Tag key={keyword}>{keyword}</Tag>
                          })}</div>
                        </div>
                      </Col>
                      <Col span={24} md={12}>
                        <div className="row-detail">
                          <div className="row-detail-left title">Nhóm hàng</div>
                          <div className="dot data">:</div>
                          <div className="row-detail-right data">{data.collections?.map((e)=>{
                            return e.name;
                          }).toString()}</div>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} md={12}>
                        <div className="row-detail">
                            <div className="row-detail-left title">Thông tin bảo quản</div>
                            <div className="dot data">:</div>
                            <div className="row-detail-right data">{careLabels.map((item: any) => (
                              <Popover key={item.value} content={item.name}>
                                <span className={`care-label ydl-${item.value}`}></span>
                              </Popover>
                            ))}</div>
                          </div>
                        </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} md={5}>
                        <div className="title" style={{color: "#666666"}}>
                          Mô tả
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} md={24}>
                        {data.description ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: data.description,
                            }}
                            className="data-content"
                          />
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
                    <RowDetail title="Merchandiser " value={data.merchandiser} />
                    <RowDetail title="Thiết kế" value={data.designer} />
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
                            `${UrlConfig.PRODUCT}/${idNumber}${UrlConfig.VARIANTS}/${data.variants[active].id}`
                          );
                        }}
                        loading={loadingVariant}
                        productData={data}
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
                            
                                <Switch
                                  onChange={onChangeChecked}
                                  className="ant-switch-success"
                                  disabled={data.status === "inactive"}
                                  checked={currentVariant.saleable}
                                />
                             
                              <label className="label-switch">
                                {currentVariant.saleable
                                  ? "Cho phép bán"
                                  : "Không cho phép bán"}
                              </label>
                            </div>
                          </div>
                          <div className="container-view">
                            <Row>
                              <Col span={24} md={14}>
                                <RowDetail
                                  title="Mã vạch"
                                  value={currentVariant.barcode}
                                />
                                <RowDetail
                                  title="Mã sản phẩm"
                                  value={currentVariant.sku}
                                />
                                <RowDetail
                                  title="Tên sản phẩm"
                                  value={currentVariant.name}
                                />
                                <RowDetail title="Màu sắc" value={currentVariant.color} />
                                <RowDetail title="Size" value={currentVariant.size} />
                                <RowDetail
                                  title="Kích thước (Dài, Rộng, Cao) "
                                  value={renderSize}
                                />
                                <RowDetail
                                  title="Khối lượng"
                                  value={`${currentVariant.weight} ${currentVariant.weight_unit} `}
                                />
                                <RowDetail
                                  title="Nhà cung cấp"
                                  value={currentVariant.supplier}
                                />
                              </Col>
                              <Col className="view-right" span={24} md={10}>
                                <div className="image-view">
                                  {currentVariant.variant_images?.length === 0 ? (
                                    <img
                                      className="item-default"
                                      src={variantdefault}
                                      alt=""
                                    />
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
                                            {currentVariant.variant_images?.map(
                                              (item, index) => (
                                                <Image
                                                  key={index}
                                                  src={item.url}
                                                  alt=""
                                                />
                                              )
                                            )}
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
                                              currentVariant.variant_images?.length ===
                                                2 && "image-2"
                                            )}
                                          >
                                            {currentVariant.variant_images?.map(
                                              (item, index) => (
                                                <img key={index} src={item.url} alt="" />
                                              )
                                            )}
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
                                    <Loading3QuartersOutlined
                                      style={{fontSize: 28}}
                                      spin
                                    />
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
                      style={{overflow: "initial"}}
                      defaultActiveKey={activeTab}
                      onTabClick={onTabClick}
                    >
                      <Tabs.TabPane tab="Danh sách tồn kho" key={TabName.INVENTORY}>
                        <TabProductInventory
                          onChange={onChangeDataInventory}
                          data={dataInventory}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab="Lịch sử tồn kho" key={TabName.HISTORY}>
                        <TabProductHistory
                          onChange={onChangeDataHistory}
                          data={dataHistory}
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  </Card>
                </div>
              </Col>
            </Row>
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
