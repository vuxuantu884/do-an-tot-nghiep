import { Button, Card, Checkbox, Col, List, Row, Switch } from "antd";
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

  const [data, setData] = useState<ProductResponse | null>(null);
  const idNumber = parseInt(id);
  const onEdit = useCallback(() => {
    history.push(`${UrlConfig.PRODUCT}/23/edit`);
  }, [history]);
  const onResult = useCallback((result: ProductResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);
  const currentVaraint = useMemo(() => {
    if (data && data.variants.length > 0) {
      return data.variants[active];
    }
    return null;
  }, [active, data]);
  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);
  console.log(data);
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
                        <div className="data-content">{data.content}</div>
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
                        renderItem={(item, index) => (
                          <List.Item
                            onClick={() => setActive(index)}
                            className={classNames(index === active && "active")}
                          >
                            <div className="line-item">
                              <Checkbox />
                              <div className="line-item-container">
                                <div></div>
                                <div>
                                  <div>{item.sku}</div>
                                  <div>{item.name}</div>
                                </div>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Col>
                    <Col className="right" span={24} md={18}>
                      {currentVaraint !== null && (
                        <React.Fragment>
                          <div className="header-view">
                            <div className="header-view-left">
                              <b>THÔNG TIN SẢN PHẨM</b>
                            </div>
                            <div className="header-view-right">
                              <Switch checked={currentVaraint.saleable} />
                              <label>{currentVaraint.saleable ? "Cho phép bán" : "Không cho phép bán"}</label>
                            </div>
                          </div>
                          <div className="container-view">
                            <Row>
                              <Col  span={24} md={14}>
                                <RowDetail title="Mã vạch" value={currentVaraint.barcode} />
                                <RowDetail title="Mã sản phẩm" value={currentVaraint.sku} />
                                <RowDetail title="Tên sản phẩm" value={currentVaraint.name} />
                                <RowDetail title="Màu sắc" value={currentVaraint.color} />
                                <RowDetail title="Size" value={currentVaraint.size} />
                                <RowDetail title="Kích thước  " value={currentVaraint.size} />
                                <RowDetail title="Khối lượng" value={`${currentVaraint.weight} ${currentVaraint.weight_unit} `} />
                                <RowDetail title="Nhà cung cấp" value={currentVaraint.supplier} />
                              </Col>
                              <Col span={24} md={10}>
                                
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
