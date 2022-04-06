import React, { useCallback, useEffect, useState } from "react";
import { Button } from "antd";

import ContentContainer from "component/container/content.container";
import AllOrdersMapping from "screens/web-app/orders-sync/all-orders/AllOrdersMapping";
import GetOrderDataModal from "screens/web-app/orders/component/GetOrderDataModal";
import ProgressDownloadOrdersModal from "screens/web-app/orders/component/ProgressDownloadOrdersModal";
import { OrdersMappingStyled } from "screens/web-app/orders-sync/styles";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import { DownloadOutlined } from "@ant-design/icons";
import { HttpStatus } from "config/http-status.config";
import {
  downloadWebAppOrderAction,
  exitWebAppJobsAction,
  getWebAppShopList,
  syncWebAppOrderAction
} from "domain/actions/web-app/web-app.actions";
import BaseResponse from "base/base.response";
import { getProgressDownloadEcommerceApi } from "service/web-app/web-app.service";

import ConflictDownloadModal from "screens/web-app/common/ConflictDownloadModal";
import ExitDownloadOrdersModal from "screens/web-app/orders/component/ExitDownloadOrdersModal";
import {showError, showSuccess} from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import { isNullOrUndefined } from "utils/AppUtils";
import UrlConfig from "config/url.config";


const ordersDownloadPermission = [EcommerceOrderPermission.orders_download];

const WebAppOrdersSync: React.FC = () => {
  const dispatch = useDispatch();

  const [allowOrdersDownload] = useAuthorization({
    acceptPermissions: ordersDownloadPermission,
    not: false,
  });

  const [isReloadPage, setIsReloadPage] = useState(false);
  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [webAppShopList, setWebAppShopList] = useState<Array<any>>([]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getWebAppShopList({}, (responseData) => {
      setIsLoading(false);
      setWebAppShopList(responseData);
    }));
  }, [dispatch]);

  // handle get order
  const openGetOrderModal = () => {
    setIsShowGetOrderModal(true);
    setIsReloadPage(false);
  };

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const callbackDownloadWebAppOrdersSync = (data: any) => {
    setIsLoading(false);
    if (data) {
      setIsShowGetOrderModal(false);
      if (typeof data === "string") {
        setIsVisibleConflictModal(true);
      } else {
        setProcessId(data.process_id);
        setIsVisibleProgressModal(true);
        setIsDownloading(true);
      }
    }
  };

  const handleDownloadOrdersSync = (params: any) => {
    setIsLoading(true);
    setIsReloadPage(false);
    dispatch(downloadWebAppOrderAction(params, callbackDownloadWebAppOrdersSync));
  };

  const reloadPage = () => {
    setIsReloadPage(true);
  };
  // end

  // handle progress download orders
  const [isVisibleConflictModal, setIsVisibleConflictModal] = useState<boolean>(false);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [isVisibleExitDownloadOrdersModal, setIsVisibleExitDownloadOrdersModal] = useState<boolean>(false);
  const [processId, setProcessId] = useState(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const resetProgress = () => {
    setProcessId(null);
    setProgressPercent(0);
    setProgressData(null);
  }

  const closeConflictDownloadModal = () => {
    setIsVisibleConflictModal(false);
  }

  // handle progress download orders modal
  const onCancelProgressDownloadOrder = () => {
    setIsVisibleExitDownloadOrdersModal(true);
  }

  const onOKProgressDownloadOrder = () => {
    resetProgress();
    reloadPage();
    setIsVisibleProgressModal(false);
  }
  // end

  // handle exit download orders modal
  const onCancelExitDownloadOrdersModal = () => {
    setIsVisibleExitDownloadOrdersModal(false);
  }

  const onOkExitDownloadOrdersModal = () => {
    resetProgress();
    dispatch(
      exitWebAppJobsAction(processId, (responseData) => {
        if (responseData) {
          showSuccess(responseData);
          setIsVisibleExitDownloadOrdersModal(false);
          onOKProgressDownloadOrder();
        }
      })
    );
  }
  // end

  const getProgress = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = getProgressDownloadEcommerceApi(processId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS && response.data &&  !isNullOrUndefined(response.data.total)) {
          const processData = response.data;
          setProgressData(processData);
          const progressCount = processData.total_created + processData.total_updated + processData.total_error;
          if (processData.finish) {
            setProgressPercent(100);
            setProcessId(null);
            setIsDownloading(false);
            if (!processData.api_error){
              showSuccess("Hoàn thành tải đơn hàng");
            }else {
              resetProgress();
              setIsVisibleProgressModal(false);
              showError(processData.api_error);
            }
          } else {
            const percent = Math.floor(progressCount / processData.total * 100);
            setProgressPercent(percent);
          }
        }
      });
    });
  }, [processId]);

  useEffect(() => {
    if (progressPercent === 100 || !processId) {
      return;
    }

    getProgress();
    
    const getFileInterval = setInterval(getProgress, 3000);
    return () => clearInterval(getFileInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgress,]);
  // end progress download orders

  const [rowDataFilter, setRowDataFilter] = useState([]);

  const handleDownloadSelectedOrders = useCallback(() => {
    const requestSyncStockOrder: any[] = [];
    rowDataFilter.forEach((item: any) => {
      requestSyncStockOrder.push({
        ecommerce_id: item.ecommerce_id,
        shop_id: item.shop_id,
        order_sn: item.ecommerce_order_code,
      });
    });

    const rowDataFilterObj = {
      order_list: requestSyncStockOrder,
    };

    if (rowDataFilter && rowDataFilter.length > 0) {
      dispatch(
        syncWebAppOrderAction(rowDataFilterObj, (data) => {
          if (data) {
            if (typeof data === "string") {
              setIsVisibleConflictModal(true);
            } else {
              setProcessId(data.process_id);
              setIsVisibleProgressModal(true);
              setIsDownloading(true);
            }
          }
        })
      );
    }
  }, [dispatch, rowDataFilter])

  const handleSingleDownloadOrder = (rowData: any) => {
    const requestSyncStockOrder = {
      order_list: [
        {
          ecommerce_id: rowData.ecommerce_id,
          shop_id: rowData.shop_id,
          order_sn: rowData.ecommerce_order_code,
        },
      ],
    };

    dispatch(
      syncWebAppOrderAction(requestSyncStockOrder, (data) => {
        if (data) {
          if (typeof data === "string") {
            setIsVisibleConflictModal(true);
          } else {
            setProcessId(data.process_id);
            setIsVisibleProgressModal(true);
            setIsDownloading(true);
          }
        }
      })
    );
  }
  
  return (
    <OrdersMappingStyled>
      <ContentContainer
        title="Đồng bộ đơn hàng"
        breadcrumb={[
          {
            name: "Web/App",
            path: `${UrlConfig.WEB_APP}`,
          },
          {
            name: "Đồng bộ đơn hàng",
          },
        ]}
        extra={
          <>
            {allowOrdersDownload &&
              <Button
                onClick={openGetOrderModal}
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<DownloadOutlined />}
              >
                Tải đơn hàng về
              </Button>
            }
          </>
        }
      >
        <AllOrdersMapping
          isReloadPage={isReloadPage}
          setRowDataFilter={setRowDataFilter}
          handleDownloadSelectedOrders={handleDownloadSelectedOrders}
          handleSingleDownloadOrder={handleSingleDownloadOrder}
        />

        {isShowGetOrderModal && (
          <GetOrderDataModal
            visible={isShowGetOrderModal}
            isLoading={isLoading}
            webAppShopList={webAppShopList}
            onCancel={cancelGetOrderModal}
            onOk={handleDownloadOrdersSync}
          />
        )}

        {isVisibleProgressModal &&
          <ProgressDownloadOrdersModal
            visible={isVisibleProgressModal}
            onCancel={onCancelProgressDownloadOrder}
            onOk={onOKProgressDownloadOrder}
            progressData={progressData}
            progressPercent={progressPercent}
            isDownloading={isDownloading}
          />
        }

        {isVisibleConflictModal &&
          <ConflictDownloadModal
            visible={isVisibleConflictModal}
            onCancel={closeConflictDownloadModal}
            onOk={closeConflictDownloadModal}
          />
        }

        {isVisibleExitDownloadOrdersModal &&
          <ExitDownloadOrdersModal
            visible={isVisibleExitDownloadOrdersModal}
            onCancel={onCancelExitDownloadOrdersModal}
            onOk={onOkExitDownloadOrdersModal}
            pageTitle={"Đồng bộ đơn hàng"}
          />
        }

      </ContentContainer>
    </OrdersMappingStyled>
  );
};

export default WebAppOrdersSync;
