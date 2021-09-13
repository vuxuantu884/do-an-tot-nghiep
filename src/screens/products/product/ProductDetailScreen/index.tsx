import {
  Button,
  Card,
  Checkbox,
  Col,
  List,
  Row,
  Switch,
  Image,
  Tabs,
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { productGetDetail } from "domain/actions/product/products.action";
import { ProductResponse } from "model/product/product.model";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import RowDetail from "../component/RowDetail";
import classNames from "classnames";
import { StyledComponent } from "./styles";
import { Products } from "utils/AppUtils";
import variantdefault from "assets/icon/variantdefault.jpg";
import Slider from "react-slick";

export interface ProductParams {
  id: string;
}

const ProductDetailScreen: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams<ProductParams>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<number>(0);
  const [nav1, setNav1] = useState<Slider | null>();
  const [nav2, setNav2] = useState<Slider | null>();
  const [data, setData] = useState<ProductResponse | null>(null);
  const idNumber = parseInt(id);
  const onEdit = useCallback(() => {
    history.push(`${UrlConfig.PRODUCT}/${idNumber}/edit`);
  }, [history, idNumber]);
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

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  useEffect(() => {
    // dispatch(inventoryGetDetailAction({}, onResult));
  }, [])

  return (
    <StyledComponent>
      <ContentContainer
        isError={error}
        isLoading={loading}
        title="Chi tiết sản phẩm"
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
          <React.Fragment>
            <Row gutter={24}>
              <Col span={24} md={18}>
                <Card title="Thông tin sản phẩm" className="card">
                  <div className="padding-20">
                    <Row gutter={50}>
                      <Col span={24} md={12}>
                        <RowDetail title="Danh mục" value={data.category} />
                        <RowDetail title="Mã sản phẩm" value={data.code} />
                        <RowDetail title="Thương hiệu" value={data.brand} />
                        <RowDetail title="Chất liệu" value={data.material} />
                      </Col>
                      <Col span={24} md={12}>
                        <RowDetail title="Ngành hàng" value={data.goods} />
                        <RowDetail title="Tên sản phẩm" value={data.name} />
                        <RowDetail title="Xuất xứ" value={data.made_in} />
                        <RowDetail title="Đơn vị" value={data.unit} />
                      </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} md={12}>
                        <RowDetail title="Từ khóa" value={data.tags} />
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
                        <div
                          dangerouslySetInnerHTML={{ __html: data.description }}
                          className="data-content"
                        />
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
              <Col span={24} md={6}>
                <Card title="Ảnh" className="card">
                  <div className="padding-20"></div>
                </Card>
                <Card title="Phòng win" className="card">
                  <div className="padding-20">
                    <RowDetail title="Merchandiser" value={data.merchandiser} />
                    <RowDetail title="Thiết kế" value={data.designer} />
                  </div>
                </Card>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Card className="card">
                  <Row className="card-container">
                    <Col className="left" span={24} md={6}>
                      <List
                        dataSource={data.variants}
                        className="list__variants"
                        header={
                          <div className="header-tab">
                            <div className="header-tab-left">
                              <Checkbox>Chọn tất cả</Checkbox>
                            </div>
                            <div className="header-tab-right"></div>
                          </div>
                        }
                        renderItem={(item, index) => {
                          let avatar = Products.findAvatar(item.variant_images);
                          return (
                            <List.Item
                              onClick={() => setActive(index)}
                              className={classNames(
                                index === active && "active"
                              )}
                            >
                              <div className="line-item">
                                <Checkbox />
                                <div className="line-item-container">
                                  <div className="avatar">
                                    <img
                                      alt=""
                                      src={
                                        avatar !== null
                                          ? avatar.url
                                          : variantdefault
                                      }
                                    />
                                  </div>
                                  <div>
                                    <div>{item.sku}</div>
                                    <div>{item.name}</div>
                                  </div>
                                </div>
                              </div>
                            </List.Item>
                          );
                        }}
                      />
                    </Col>
                    <Col className="right" span={24} md={18}>
                      {currentVariant !== null && (
                        <React.Fragment>
                          <div className="header-view">
                            <div className="header-view-left">
                              <b>THÔNG TIN PHIÊN BẢN</b>
                            </div>
                            <div className="header-view-right">
                              <Switch
                                className="ant-switch-success"
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
                                <RowDetail
                                  title="Màu sắc"
                                  value={currentVariant.color}
                                />
                                <RowDetail
                                  title="Size"
                                  value={currentVariant.size}
                                />
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
                                  {currentVariant.variant_images.length ===
                                  0 ? (
                                    <img
                                      className="item-default"
                                      src={variantdefault}
                                      alt=""
                                    />
                                  ) : (
                                    <React.Fragment>
                                      {currentVariant.variant_images.length ===
                                      1 ? (
                                        <Image
                                          src={
                                            currentVariant.variant_images[0].url
                                          }
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
                                            className="image-slider"
                                          >
                                            {currentVariant.variant_images.map(
                                              (item) => (
                                                <Image src={item.url} alt="" />
                                              )
                                            )}
                                          </Slider>
                                          <Slider
                                            asNavFor={nav1 ? nav1 : undefined}
                                            ref={(slider2) => setNav2(slider2)}
                                            infinite={true}
                                            slidesToShow={3}
                                            slidesToScroll={1}
                                            arrows={true}
                                            focusOnSelect={true}
                                            className="image-thumbnail"
                                          >
                                            {currentVariant.variant_images.map(
                                              (item) => (
                                                <img src={item.url} alt="" />
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
                          </div>
                        </React.Fragment>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Card className="card">
                  <Tabs style={{ overflow: "initial" }}>
                    <Tabs.TabPane tab="Danh sách tồn kho" key="1">
                      {/* <TabProduct /> */}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Lich sử tồn kho" key="2">
                      {/* <TabProduct /> */}
                    </Tabs.TabPane>
                  </Tabs>
                </Card>
              </Col>
            </Row>
          </React.Fragment>
        )}
        <BottomBarContainer
          back="Quay lại sản phẩm"
          rightComponent={<Button onClick={onEdit}>Chỉnh sửa thông tin</Button>}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default ProductDetailScreen;
