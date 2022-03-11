import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Tabs } from "antd";

import ContentContainer from "component/container/content.container";
import AllOrdersMapping from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMapping";
import GetOrderDataModal from "screens/ecommerce/orders/component/GetOrderDataModal";
import ProgressDownloadOrdersModal from "screens/ecommerce/orders/component/ProgressDownloadOrdersModal";
import { OrdersMappingStyled } from "screens/ecommerce/orders-mapping/styles";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import { DownloadOutlined } from "@ant-design/icons";
import { HttpStatus } from "config/http-status.config";
import {exitProgressDownloadEcommerceAction, syncStockEcommerceProduct} from "domain/actions/ecommerce/ecommerce.actions";
import BaseResponse from "base/base.response";
import { getProgressDownloadEcommerceApi } from "service/ecommerce/ecommerce.service";

import ConflictDownloadModal from "screens/ecommerce/common/ConflictDownloadModal";
import ExitDownloadOrdersModal from "screens/ecommerce/orders/component/ExitDownloadOrdersModal";
import {showError, showSuccess} from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import { isNullOrUndefined } from "utils/AppUtils";
import UrlConfig from "config/url.config";


const { TabPane } = Tabs;

const ORDER_TABS = {
  all_orders: {
    title: "Tất cả đơn hàng",
    key: "all-orders"
  },
}

const ordersDownloadPermission = [EcommerceOrderPermission.orders_download];


const OrdersMapping: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all-orders");
  const history = useHistory();
  const dispatch = useDispatch();

  const [allowOrdersDownload] = useAuthorization({
    acceptPermissions: ordersDownloadPermission,
    not: false,
  });

  const [isReloadPage, setIsReloadPage] = useState(false);
  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);

  useEffect(() => {
    switch (history.location.hash) {
      case "#all-orders":
        setActiveTab(ORDER_TABS.all_orders.key);
        break;
      default: break;
    }
  }, [history.location.hash]);

  const handleOnchangeTab = (active: any) => {
    history.replace(`${history.location.pathname}#${active}`);
  }

  // handle get order
  const openGetOrderModal = () => {
    setIsShowGetOrderModal(true);
    setIsReloadPage(false);
  };

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const callbackDownloadEcommerceOrders = (data: any) => {
    if (data) {
      if (typeof data === "string") {
        setIsShowGetOrderModal(false);
        setIsVisibleConflictModal(true);
      } else {
        setIsShowGetOrderModal(false);
        setProcessId(data.process_id);
        setIsVisibleProgressModal(true);
        setIsDownloading(true);
      }
    }
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
      exitProgressDownloadEcommerceAction(processId, (responseData) => {
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
              showSuccess("Tải đơn hàng thành công!");
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
    console.log(rowDataFilter)
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
          syncStockEcommerceProduct(rowDataFilterObj, (data) => {
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
    console.log(rowData)
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
        syncStockEcommerceProduct(requestSyncStockOrder, (data) => {
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
            name: "Sàn TMDT",
            path: `${UrlConfig.ECOMMERCE}`,
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
        <Tabs activeKey={activeTab} onChange={(active) => { handleOnchangeTab(active) }}>
          <TabPane tab={ORDER_TABS.all_orders.title} key={ORDER_TABS.all_orders.key} />
        </Tabs>

        {activeTab === ORDER_TABS.all_orders.key &&
          <AllOrdersMapping
              isReloadPage={isReloadPage}
              setRowDataFilter={setRowDataFilter}
              handleDownloadSelectedOrders={handleDownloadSelectedOrders}
              handleSingleDownloadOrder={handleSingleDownloadOrder}
          />
        }

        {isShowGetOrderModal && (
          <GetOrderDataModal
            visible={isShowGetOrderModal}
            onCancel={cancelGetOrderModal}
            onOk={callbackDownloadEcommerceOrders}
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
          />
        }

      </ContentContainer>
    </OrdersMappingStyled>
  );
};

export default OrdersMapping;
