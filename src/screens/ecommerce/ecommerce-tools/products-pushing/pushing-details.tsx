import { EditOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import Countdown from "antd/lib/statistic/Countdown";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  shopeeShopDetailsProductPushingApi,
  updateProductsPushingApi,
} from "service/ecommerce/ecommerce.service";
import CustomTable, { ICustomTableColumType } from "../../table/CustomTable";
import PushingEditModal from "./pushing-edit-modal";

import { StyledProductsPushing } from "./styled";
import { ECOMMERCE_ICON } from "screens/ecommerce/common/commonAction";
import defaultAvatarIcon from "assets/icon/default-avatar.svg";
import { showError } from "utils/ToastUtils";

type Props = {};
type ShopIDParam = {
  id: string;
};

function PushingDetails(props: Props) {
  const { id } = useParams<ShopIDParam>();

  const [loadingData, setLoadingData] = useState(true);
  const [shopName, setShopName] = useState("");
  const [shopLogo, setShopLogo] = useState("");
  const [shopData, setShopData] = useState<any[]>([]);
  const [productEditPushing, setProductEditPushing] = useState<any>({});
  const [visible, setVisible] = useState(false);
  const getShopDetails = useCallback(async () => {
    try {
      const shopData = await shopeeShopDetailsProductPushingApi(id);
      if (!shopData.errors) {
        setShopData(
          shopData.data.boosts.map((i: any, index: number) => {
            return {
              index: index + 1,
              ...i,
            };
          }),
        );
        setShopName(shopData.data.shop_name);
        setShopLogo(shopData.data.logo || defaultAvatarIcon);
      } else {
        shopData.errors.forEach((error: string) => {
          showError(error);
        });
      }
      setLoadingData(false);
    } catch {}
  }, [id]);

  const saveEditProducts = useCallback(
    async (products) => {
      let newProducts = [...products];
      if (
        productEditPushing.queue_boosts &&
        products.length < productEditPushing.queue_boosts.length
      ) {
        for (let i = 1; i <= productEditPushing.queue_boosts.length - products.length; i++) {
          newProducts.push({});
        }
      }
      newProducts = newProducts.map((i: any, index: number) => {
        return {
          ...i,
          position: index + 1,
        };
      });
      try {
        await updateProductsPushingApi(id, {
          queue: productEditPushing.boosting.queue,
          items: newProducts,
          product_pushing: productEditPushing.boosting,
        });
        setLoadingData(true);
        getShopDetails();
      } catch {}
      setVisible(false);
    },
    [getShopDetails, id, productEditPushing],
  );

  useEffect(() => {
    getShopDetails();
  }, [getShopDetails]);

  const columns = useMemo(() => {
    return [
      {
        title: "STT",
        dataIndex: "index",
        key: "index",
        width: 100,
        align: "center",
        render: (index: any) => {
          return <div>{index}</div>;
        },
      },
      {
        title: "Sản phẩm đang đẩy",
        dataIndex: "boosting",
        key: "boosting",
        render: (item: any) => {
          return (
            <div>
              <span style={{ color: "#22226b" }}>{item.ecommerce_product}</span>
            </div>
          );
        },
      },
      {
        title: "Danh sách sản phẩm đang chờ đẩy",
        key: "queue_boosts",
        className: "productsPushing",
        render: (record: any) => {
          return (
            <div>
              {record &&
                record.queue_boosts &&
                record.queue_boosts.map((item: any) => {
                  return (
                    <div className="item custom-td">
                      <div
                        className={
                          record.boosting.ecommerce_product_id === item.ecommerce_product_id
                            ? "pd-12 pushing"
                            : "pd-12"
                        }
                      >
                        {item.ecommerce_product}
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        },
      },
      {
        title: "Thời gian còn lại",
        dataIndex: "boosting",
        key: "time",
        align: "center",
        width: 200,
        render: (item: any) => {
          return (
            item.next_boost && (
              <Countdown
                value={item.next_boost}
                format="HH:mm"
                valueStyle={{ fontSize: 14 }}
                onFinish={() => {}}
              />
            )
          );
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 120,
        align: "center",
        render: (record: any) => {
          return (
            <div>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setProductEditPushing(record);
                  setVisible(true);
                }}
              />
            </div>
          );
        },
      },
    ] as Array<ICustomTableColumType<any>>;
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
            name: "Công cụ",
          },
          {
            name: "Đẩy sản phẩm Shopee",
            path: `${UrlConfig.ECOMMERCE}-tools/products-pushing`,
          },
          {
            name: `${shopName}`,
          },
        ]}
      >
        <Card className="card-shop-info">
          <div className="shop-info">
            <div className="shop-image">
              <div className="ecommerce-logo">
                <img src={ECOMMERCE_ICON.shopee} alt="ecommerce-logo" />
              </div>
              <img className="image" src={shopLogo} alt="shop-logo" />
            </div>
            <span className="shop-name">{shopName}</span>
          </div>
        </Card>
        <Card>
          <CustomTable
            isLoading={loadingData}
            showColumnSetting={true}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={false}
            dataSource={shopData}
            columns={columns}
            rowKey={(item: any) => item.id}
            bordered
            className="table"
          />
        </Card>
        <PushingEditModal
          shopID={id}
          shopData={shopData}
          visible={visible}
          productEditPushing={productEditPushing}
          onOk={(products) => saveEditProducts(products)}
          onCancel={() => setVisible(false)}
        />
      </ContentContainer>
    </StyledProductsPushing>
  );
}

export default PushingDetails;
