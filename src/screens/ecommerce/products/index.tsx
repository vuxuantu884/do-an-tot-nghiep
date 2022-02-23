import React, {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useDispatch} from "react-redux";
import {Button, Tabs} from "antd";
import {DownloadOutlined} from "@ant-design/icons"

import UrlConfig from "config/url.config";
import {showError, showSuccess} from "utils/ToastUtils";
import ContentContainer from "component/container/content.container";
import TotalItemsEcommerce from "screens/ecommerce/products/tab/total-items-ecommerce";
import ConnectedItems from "screens/ecommerce/products/tab/connected-items";
import NotConnectedItems from "screens/ecommerce/products/tab/not-connected-items";
import UpdateProductDataModal from "screens/ecommerce/products/component/UpdateProductDataModal";

import {HttpStatus} from "config/http-status.config";
import BaseResponse from "base/base.response";
import {exitProgressDownloadEcommerceAction, postProductEcommerceList} from "domain/actions/ecommerce/ecommerce.actions";
import {getProgressDownloadEcommerceApi} from "service/ecommerce/ecommerce.service";
import ConflictDownloadModal from "screens/ecommerce/common/ConflictDownloadModal";
import ProgressDownloadProductsModal from "screens/ecommerce/products/component/ProgressDownloadProductsModal";
import ExitDownloadProductsModal from "screens/ecommerce/products/component/ExitDownloadProductsModal";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import {EcommerceProductPermission} from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";

import {StyledComponent} from "screens/ecommerce/products/styles";
import {isNullOrUndefined} from "utils/AppUtils";
import {ECOMMERCE_JOB_TYPE} from "../../../utils/Constants";

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
  const [isReloadPage, setIsReloadPage] = useState(false);
  const [isShowGetProductModal, setIsShowGetProductModal] = useState(false);

  useEffect(() => {
    switch (history.location.hash) {
      case "#total-item":
        setActiveTab(PRODUCT_TAB.total.key);
        break;
      case "#connected-item":
        setActiveTab(PRODUCT_TAB.connected.key);
        break;
      case "#not-connected-item":
        setActiveTab(PRODUCT_TAB.notConnected.key);
        break;
      default: break;
    }

  }, [history.location.hash]);

  // handle progress download orders
  const [isVisibleConflictModal, setIsVisibleConflictModal] = useState<boolean>(false);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [isVisibleExitDownloadProductsModal, setIsVisibleExitDownloadProductsModal] = useState<boolean>(false);
  const [processId, setProcessId] = useState(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [processType, setProcessType] = useState("");
  const resetProgress = () => {
    setProcessId(null);
    setProgressPercent(0);
    setProgressData(null);
  }

  const closeConflictDownloadModal = () => {
    setIsVisibleConflictModal(false);
  }

  window.onbeforeunload = (e) => {
    if (processId){
      const message = "Quá trình sẽ vẫn tiếp tục nếu bạn rời khỏi trang?"
      e = e || window.event;
      if (e){
        e.returnValue = message;
      }
      return message
    }
  }

  // handle progress download modal
  const onCancelProgressDownloadOrder = () => {
    setIsVisibleExitDownloadProductsModal(true);
  }

  const onOKProgressDownloadOrder = () => {
    resetProgress();
    // redirectToNotConnectedItems();
    setIsVisibleProgressModal(false);
  }
  // end

  // handle exit download modal
  const onCancelExitDownloadProductsModal = () => {
    setIsVisibleExitDownloadProductsModal(false);
  }

  const onOkExitDownloadProductsModal = () => {
    resetProgress();
    dispatch(
      exitProgressDownloadEcommerceAction(processId, (responseData) => {
        if (responseData) {
          showSuccess("Đã hủy quá trình xử lý");
          setIsVisibleExitDownloadProductsModal(false);
          resetProgress();
          setIsVisibleProgressModal(false);
          redirectToTotalProducts();
        }
      })
    );
  }
  // end
  const getProgress = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = getProgressDownloadEcommerceApi(processId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        const processData = response.data;
        if (response.code === HttpStatus.SUCCESS && response.data && !isNullOrUndefined(processData.total)) {
          setProgressData(response.data);
          const progressCount = processData.total_created + processData.total_updated + processData.total_error;
          if (processData.finish) {
            setProgressPercent(100);
            setProcessId(null);
            setIsDownloading(false);
            if (!processData.api_error){
              processType === "variant" ? showSuccess("Tải sản phẩm thành công!")
                  : showSuccess("Đồng bộ tồn thành công!");
            }else {
              resetProgress();
              setIsVisibleProgressModal(false);
              showError(processData.api_error);
            }
          } else {
            const percent = Math.floor(progressCount / response.data.total * 100);
            setProgressPercent(percent);
          }
        }
      });
    });
  }, [processId, processType]);

  useEffect(() => {
    if (progressPercent === 100 || !processId) {
      return;
    }

    getProgress();
    
    const getFileInterval = setInterval(getProgress, 3000);
    return () => clearInterval(getFileInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgress,  ]);
  // end progress download orders


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
      if (typeof data === "string") {
        setIsVisibleConflictModal(true);
      } else {
        setProcessId(data.process_id);
        setIsVisibleProgressModal(true);
        setIsDownloading(true);
      }
    }
  }, []);

  const handleSyncStockJob =(id: any) => {
    if(id){
      setProcessType(ECOMMERCE_JOB_TYPE.STOCK);
      setProcessId(id);
      setIsVisibleProgressModal(true);
      setIsDownloading(true);
    }
  }

  const handleMappingVariantJob = (id: any) => {
    setProcessType(ECOMMERCE_JOB_TYPE.SYNC_VARIANT);
    setProcessId(id);
    setIsVisibleProgressModal(true);
    setIsDownloading(true);
  }

  const getProductsFromEcommerce = (params: any) => {
    setProcessType("variant");
    setIsLoading(true);
    setIsReloadPage(false);
    dispatch(postProductEcommerceList(params, updateEcommerceList));
  };
  // end handle get product from ecommerce

  // const redirectToNotConnectedItems = () => {
  //   setIsReloadPage(true);
  //   handleOnchangeTab("not-connected-item");
  //   setActiveTab("not-connected-item");
  // };

  const redirectToTotalProducts = () => {
    setIsReloadPage(true);
    handleOnchangeTab("total-item");
    setActiveTab("total-item");
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
                <TotalItemsEcommerce isReloadPage={isReloadPage} />
              }
              
              {activeTab === PRODUCT_TAB.connected.key &&
                <ConnectedItems handleSyncStockJob={handleSyncStockJob}/>
              }
              
              {activeTab === PRODUCT_TAB.notConnected.key &&
                <NotConnectedItems isReloadPage={isReloadPage} handleMappingVariantJob={handleMappingVariantJob}/>
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

      {isVisibleProgressModal &&
        <ProgressDownloadProductsModal
          visible={isVisibleProgressModal}
          onCancel={onCancelProgressDownloadOrder}
          onOk={onOKProgressDownloadOrder}
          progressData={progressData}
          progressPercent={progressPercent}
          isDownloading={isDownloading}
          processType={processType}
        />
      }

      {isVisibleConflictModal &&
        <ConflictDownloadModal
          visible={isVisibleConflictModal}
          onCancel={closeConflictDownloadModal}
          onOk={closeConflictDownloadModal}
        />
      }

      {isVisibleExitDownloadProductsModal &&
        <ExitDownloadProductsModal
          visible={isVisibleExitDownloadProductsModal}
          onCancel={onCancelExitDownloadProductsModal}
          onOk={onOkExitDownloadProductsModal}
        />
      }

    </StyledComponent>
  );
};

export default Products;
