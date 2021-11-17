import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Tabs, Button, Modal } from "antd";
import { DownloadOutlined } from "@ant-design/icons"

import { PageResponse } from "model/base/base-metadata.response";
import { ProductEcommerceQuery } from "model/query/ecommerce.query";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import TotalItemsEcommerce from "./tab/total-items-ecommerce";
import ConnectedItems from "./tab/connected-items";
import NotConnectedItems from "./tab/not-connected-items";
import UpdateProductDataModal from "./component/UpdateProductDataModal";

import {
  postProductEcommerceList,
  getProductEcommerceList
} from "domain/actions/ecommerce/ecommerce.actions";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";

import checkCircleIcon from "assets/icon/check-circle.svg";

import { StyledComponent } from "./styles";

const { TabPane } = Tabs;

const PRODUCT_TAB = {
  total: {
    title: "Tất cả sản phẩm",
    key: "total-item"
  },
  connected: {
    title: "Sản phẩm đã ghép",
    key: "connected-item"
  },
  notConnected: {
    title: "Sản phẩm chưa ghép",
    key: "not-connected-item"
  }
}

const productsReadPermission = [EcommerceProductPermission.products_read];
const productsDownloadPermission = [EcommerceProductPermission.products_download];


const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("total-item");
  const history = useHistory();
  const dispatch = useDispatch();

  const [allowProductsDownload] = useAuthorization({
    acceptPermissions: productsDownloadPermission,
    not: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isShowGetProductModal, setIsShowGetProductModal] = useState(false);
  const [isShowResultGetItemModal, setIsShowResultGetItemModal] = useState(false);
  const [totalGetItem, setTotalGetItem] = useState(0);
  const [itemsUpdated, setItemsUpdated] = useState(0);
  const [itemsNotConnected, setItemsNotConnected] = useState(0);

  const [tableLoading, setTableLoading] = useState(false);
  const [variantData, setVariantData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [query,] = useState<ProductEcommerceQuery>({
    page: 1,
    limit: 30,
    ecommerce_id: null,
    shop_ids: [],
    connect_status: null,
    update_stock_status: null,
    sku_or_name_core: "",
    sku_or_name_ecommerce: "",
    connected_date_from: null,
    connected_date_to: null,
  });

  const updateVariantData = useCallback((result: PageResponse<any> | false) => {
    setTableLoading(false);
    if (!!result) {
      setVariantData(result);
    }
  }, []);

  const getProductUpdated = useCallback((queryRequest: any) => {
    setTableLoading(true);
    dispatch(getProductEcommerceList(queryRequest, updateVariantData));
  }, [dispatch, updateVariantData]);

  useEffect(() => {
    const requestQuery = { ...query };
    switch (history.location.hash) {
      case "#total-item":
        requestQuery.connect_status = null;
        setActiveTab(PRODUCT_TAB.total.key);
        break;
      case "#connected-item":
        requestQuery.connect_status = "connected";
        setActiveTab(PRODUCT_TAB.connected.key);
        break;
      case "#not-connected-item":
        requestQuery.connect_status = "waiting";
        setActiveTab(PRODUCT_TAB.notConnected.key);
        break;
      default: break;
    }

    getProductUpdated(requestQuery);
  }, [getProductUpdated, history.location.hash, query]);

  // handle get product from ecommerce
  const handleGetProductsFromEcommerce = () => {
    setIsShowGetProductModal(true);
  }

  const cancelGetProductModal = () => {
    setIsShowGetProductModal(false);
  };

  const updateEcommerceList = useCallback((data) => {
    setIsLoading(false);
    if (data) {
      setIsShowGetProductModal(false);
      setIsShowResultGetItemModal(true);

      setTotalGetItem(data.total);
      setItemsUpdated(data.update_total);
      setItemsNotConnected(data.create_total);
    }
  }, []);

   const getProductsFromEcommerce = (params: any) => {
    setIsLoading(true);
    dispatch(postProductEcommerceList(params, updateEcommerceList));
  };
  // end handle get product from ecommerce

  const redirectToNotConnectedItems = () => {
    setIsShowResultGetItemModal(false);
    handleOnchangeTab("not-connected-item");
    setActiveTab("not-connected-item");
  };

  const handleOnchangeTab = (active: any) => {
    history.replace(`${history.location.pathname}#${active}`);
  }


  return (
    <StyledComponent>
      <ContentContainer
        title="DANH SÁCH SẢN PHẨM"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Sàn TMĐT",
            path: `${UrlConfig.ECOMMERCE}`,
          },
          {
            name: "Sản phẩm",
          },
        ]}
        extra={
          <>
            {allowProductsDownload &&
              <Button
                onClick={handleGetProductsFromEcommerce}
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<DownloadOutlined />}
              >
                Tải sản phẩm từ sàn về
              </Button>
            }
          </>
        }
      >
        <AuthWrapper acceptPermissions={productsReadPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <>
              <Tabs activeKey={activeTab} onChange={(active) => { handleOnchangeTab(active) }}>
                <TabPane tab={PRODUCT_TAB.total.title} key={PRODUCT_TAB.total.key} />
                <TabPane tab={PRODUCT_TAB.connected.title} key={PRODUCT_TAB.connected.key} />
                <TabPane tab={PRODUCT_TAB.notConnected.title} key={PRODUCT_TAB.notConnected.key} />
              </Tabs>
              
              {activeTab === PRODUCT_TAB.total.key &&
                <TotalItemsEcommerce
                  tableLoading={tableLoading}
                  variantData={variantData}
                  getProductUpdated={getProductUpdated}
                />
              }
              
              {activeTab === PRODUCT_TAB.connected.key &&
                <ConnectedItems
                  tableLoading={tableLoading}
                  variantData={variantData}
                  getProductUpdated={getProductUpdated}
                />
              }
              
              {activeTab === PRODUCT_TAB.notConnected.key &&
                <NotConnectedItems />
              }
            </>
          : <NoPermission />)}
        </AuthWrapper>
      </ContentContainer>

      {isShowGetProductModal &&
        <UpdateProductDataModal
          isVisible={isShowGetProductModal}
          isLoading={isLoading}
          cancelGetProductModal={cancelGetProductModal}
          getProductsFromEcommerce={getProductsFromEcommerce}
        />
      }

      <Modal
        width="600px"
        className=""
        visible={isShowResultGetItemModal}
        title={"Có " + totalGetItem + " sản phẩm được cập nhật thành công"}
        okText="Đóng"
        onOk={redirectToNotConnectedItems}
        onCancel={redirectToNotConnectedItems}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div>
          <div>
            <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
            <span>Có <p style={{ color: "orange", display: "inline-block" }}>{itemsNotConnected}</p> sản phẩm được tải mới về để ghép</span>
          </div>
          <div>
            <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
            <span>Có <p style={{ color: "green", display: "inline-block" }}>{itemsUpdated}</p> sản phẩm đã update thành công</span>
          </div>
        </div>
      </Modal>

    </StyledComponent>
  );
};

export default Products;
