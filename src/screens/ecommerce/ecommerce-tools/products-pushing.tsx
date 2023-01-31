import { Card } from "antd";
import Countdown from "antd/lib/statistic/Countdown";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { shopeeShopsDetailsProductPushingApi } from "service/ecommerce/ecommerce.service";
import CustomTable from "../table/CustomTable";

import { StyledProductsPushing } from "./styled";

type Props = {};

function ProductPushing(props: Props) {
  const [loadingData, setLoadingData] = useState(true);
  const [shopsData, setShopsData] = useState([]);
  const getShopDetails = useCallback(async () => {
    try {
      const shopData = await shopeeShopsDetailsProductPushingApi();
      setShopsData(shopData.data);
      setLoadingData(false);
    } catch {}
  }, []);

  useEffect(() => {
    getShopDetails();
  }, [getShopDetails]);

  const columns = useMemo(() => {
    return [
      {
        title: "Tên gian hàng",
        key: "name",
        width: "25%",
        className: "shopName",
        render: (record: any) => {
          return (
            <div>
              <Link target="_blank" to={`products-pushing/${record.shop_id}`} className="primary">
                {record.name}
              </Link>
            </div>
          );
        },
      },
      {
        title: (
          <div className="productPushingHeader">
            <span className="productNameWidth">
              <span>Sản phẩm đang đẩy</span>
            </span>
            <span className="time timeWidth">
              <span>Thời gian đẩy tiếp theo</span>
            </span>
          </div>
        ),
        dataIndex: "boosting_item",
        key: "products",
        className: "productsPushing",
        render: (items: any[]) => {
          return (
            <div className="items">
              {items.length > 0 &&
                items.map((item, i) => {
                  return (
                    <div className="item custom-td">
                      <span className="product productNameWidth">{item.ecommerce_product}</span>
                      <span className="time timeWidth">
                        <span>
                          {item.next_boost && (
                            <Countdown
                              value={item.next_boost}
                              format="HH:mm"
                              valueStyle={{ fontSize: 14 }}
                              onFinish={() => {}}
                            />
                          )}
                        </span>
                      </span>
                    </div>
                  );
                })}
              {items.length === 0 && (
                <div className="item custom-td">
                  <span className="product productNameWidth"></span>
                  <span className="time timeWidth">
                    <span></span>
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <StyledProductsPushing>
      <ContentContainer
        title="Đẩy sản phẩm Shopee"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: `${UrlConfig.HOME}`,
          },
          {
            name: "Sàn TMĐT",
          },
          {
            name: " Công cụ",
          },
          {
            name: "Đẩy sản phẩm Shopee",
          },
        ]}
      >
        <Card>
          <CustomTable
            isLoading={loadingData}
            showColumnSetting={true}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={false}
            dataSource={shopsData}
            columns={columns}
            rowKey={(item: any) => item.id}
            bordered
            className="table"
          />
        </Card>
      </ContentContainer>
    </StyledProductsPushing>
  );
}

export default ProductPushing;
