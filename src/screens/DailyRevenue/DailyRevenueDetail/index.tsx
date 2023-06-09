import { Button, Card, Col, Form, FormInstance, Row } from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import ContentContainer from "component/container/content.container";
import { DAILY_REVENUE_PERMISSIONS } from "config/permissions/daily-revenue.permission";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useAuthorization from "hook/useAuthorization";
import {
  DaiLyRevenuePermissionModel,
  DailyRevenueDetailModel,
  DailyRevenueOtherPaymentParamsModel,
  DailyRevenueVisibleCardElementModel,
  ShopRevenueModel,
} from "model/order/daily-revenue.model";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import ShopCostCard from "screens/DailyRevenue/components/ShopCostCard";
import ShopRevenueCard from "screens/DailyRevenue/components/ShopRevenueCard";
import RevenueShopDetail from "screens/DailyRevenue/components/sidebar/RevenueShopDetail";
import useFetchStoreDetail from "screens/order-online/hooks/useFetchStoreDetail";
import useGetDailyRevenueOtherPaymentTypes from "screens/order-online/hooks/useGetDailyRevenueOtherPaymentTypes";
import { dailyRevenueService } from "service/order/daily-revenue.service";
import { executeAnalyticsQueryService } from "service/report/analytics.service";
import {
  handleFetchApiError,
  isFetchApiSuccessful,
  scrollAndFocusToDomElement,
} from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { getArrayFromObject } from "utils/OrderUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import DailyRevenueProgressBar from "../components/DailyRevenueProgressBar";
import DailyRevenueTotal from "../components/DailyRevenueTotal";
import ShopSurchargeCard from "../components/ShopSurchargeCard";
import RevenueNote from "../components/sidebar/RevenueNote";
import RevenueStatus from "../components/sidebar/RevenueStatus";
import {
  DailyRevenuePaymentMethods,
  dailyRevenueStatus,
  getDataReport,
  getParamReport,
} from "../helper";
import { StyledComponent } from "./styles";

type DailyRevenueParamModel = {
  id: string;
};

function DailyRevenueDetail() {
  const { id } = useParams<DailyRevenueParamModel>();

  const [paymentForm] = Form.useForm();

  const dateFormat = DATE_FORMAT.YYYY_MM_DD;

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();

  const [dailyRevenueDetail, setDailyRevenueDetail] = useState<DailyRevenueDetailModel>();
  const [shopRevenueModel, setShopRevenueModel] = useState<ShopRevenueModel>();

  const [visibleCardElement, setVisibleCardElement] = useState<DailyRevenueVisibleCardElementModel>(
    {
      revenueCard: {
        show: false,
        updateButton: false,
      },
      shopCostAndSurchargeCard: {
        show: false,
      },
      shopCostCard: {
        show: false,
        addButton: false,
        actionButton: false,
      },
      shopSurchargeCard: {
        show: false,
        addButton: false,
        actionButton: false,
      },
      totalRevenueCard: {
        show: false,
        payMoneyButton: false,
        confirmMoneyButton: false,
        uploadPayment: false,
        result: false,
      },
    },
  );

  const storeDetail = useFetchStoreDetail(dailyRevenueDetail?.store_id);

  const dailyRevenueStates = getArrayFromObject(dailyRevenueStatus);

  const dailyRevenueOtherPaymentTypes = useGetDailyRevenueOtherPaymentTypes();

  const [allowDailyPaymentsUpdate] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_update],
  });

  const [allowDailyPaymentsUpdateCost] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_update_cost],
  });

  const [allowDailyPaymentsUpdatePayment] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_update_payment],
  });

  const [allowDailyPaymentsSubmit] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_submit],
  });

  const [allowDailyPaymentsConfirm] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_confirm],
  });

  const permissions: DaiLyRevenuePermissionModel = {
    allowDailyPaymentsUpdate,
    allowDailyPaymentsUpdateCost,
    allowDailyPaymentsUpdatePayment,
    allowDailyPaymentsSubmit,
    allowDailyPaymentsConfirm,
  };

  const fetchDailyRevenueDetail = useCallback(() => {
    if (!id) {
      return;
    }

    dailyRevenueService
      .getDetail(+id)
      .then((response) => {
        if (response) {
          setDailyRevenueDetail(response);
        } else {
          showError("Chi tiết tổng kết ca: có lỗi khi lấy dữ liệu");
        }
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Chi tiết tổng kết ca: ${error?.response?.data?.message}`);
        setIsError(true);
      })
      .finally(() => {
        dispatch(hideLoading());
        setIsLoading(false);
      });
  }, [dispatch, id]);

  const fetchDailyRevenueReport = useCallback(() => {
    if (!storeDetail?.id) {
      return;
    }
    const currentDate = moment(dailyRevenueDetail?.created_at).format(dateFormat);

    const fullParams = getParamReport(currentDate, storeDetail?.id);
    return new Promise<void>((resolve, reject) => {
      executeAnalyticsQueryService(fullParams)
        .then((response: any) => {
          console.log("executeAnalyticsQueryService", response.result);
          const result = getDataReport(response.result);
          setShopRevenueModel(result);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }, [dailyRevenueDetail?.created_at, dateFormat, storeDetail?.id]);

  const handleUpdateDailyRevenueDetail = () => {
    if (!id) {
      return;
    }
    dispatch(showLoading());
    dailyRevenueService
      .refresh(+id)
      .then((response) => {
        setDailyRevenueDetail(response);
        fetchDailyRevenueReport()?.finally(() => {
          dispatch(hideLoading());
        });
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Cập nhật chi tiết phiếu tổng kết ca: ${error.response.data.message}`);
        dispatch(hideLoading());
      });
  };

  const handleAddOtherPaymentItem = (
    values: DailyRevenueOtherPaymentParamsModel,
    form: FormInstance<any>,
  ) => {
    const { description, name, type, method } = values;
    const params: DailyRevenueOtherPaymentParamsModel = {
      cost: values.cost || 0,
      description,
      name,
      payment: values.payment || 0,
      type,
      method,
    };
    dispatch(showLoading());
    dailyRevenueService
      .addOtherPayment(+id, params)
      .then(() => {
        fetchDailyRevenueDetail();
        form.resetFields();
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Thêm chi phí, phụ thu: ${error.response.data.message}`);
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleEditOtherPaymentItem = (
    otherPaymentId: number,
    values: DailyRevenueOtherPaymentParamsModel,
    form: FormInstance<any>,
  ) => {
    const { description, name, type, method } = values;
    const params: DailyRevenueOtherPaymentParamsModel = {
      cost: values.cost || 0,
      description,
      name,
      payment: values.payment || 0,
      type,
      method,
    };
    dispatch(showLoading());
    dailyRevenueService
      .editOtherPayment(+id, otherPaymentId, params)
      .then((response) => {
        fetchDailyRevenueDetail();
        form.resetFields();
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Cập nhật chi phí, phụ thu: ${error.response.data.message}`);
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteOtherPaymentItem = (otherPaymentId: number, form: FormInstance<any>) => {
    dispatch(showLoading());
    dailyRevenueService
      .deleteOtherPayment(+id, otherPaymentId)
      .then(() => {
        fetchDailyRevenueDetail();
        form.resetFields();
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Xóa chi phí, phụ thu: ${error?.response?.data?.message}`);
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleUploadFile = (files: Array<File>) => {
    return dailyRevenueService.uploadPaymentImages(files);
  };

  const handleClickPayMoney = (fileList: UploadFile<any>[] | undefined) => {
    const uploadFiles = fileList?.map((single) => single.originFileObj) as File[] | undefined;
    if (!uploadFiles) {
      return;
    }
    // return;
    paymentForm
      .validateFields()
      .then(() => {
        if (fileList) {
          dispatch(showLoading());
          handleUploadFile(uploadFiles)
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                let paths = response.data.map((single) => single.path);
                if (paths) {
                  const initFileList = dailyRevenueDetail?.image_url
                    ? dailyRevenueDetail?.image_url.split(";")
                    : [];
                  let allPaths = [...initFileList, ...paths];
                  let path = allPaths.join(";");
                  dailyRevenueService
                    .submitPayMoney(+id, path)
                    .then(() => {
                      fetchDailyRevenueDetail();
                      showSuccess("Nộp tiền tổng kết ca thành công!");
                    })
                    .catch((error) => {
                      console.log("error", error);
                      dispatch(hideLoading());
                      showError(`Nộp tiền chi tiết tổng kết ca: ${error?.response?.data?.message}`);
                    });
                }
              } else {
                handleFetchApiError(response, "Upload hóa đơn chứng từ", dispatch);
                dispatch(hideLoading());
              }
            })
            .catch((error) => {
              console.log("error", error);
              dispatch(hideLoading());
            });
        }
      })
      .catch((error) => {
        if (error?.errorFields) {
          const errorFields = error?.errorFields;
          const element: any = document.getElementById(errorFields[0].name.join(""));
          scrollAndFocusToDomElement(element, 0);
        }
        console.log("error", error);
      });
  };

  const handleClickConfirmPayMoney = () => {
    dispatch(showLoading());
    dailyRevenueService
      .confirmPayMoney(+id)
      .then(() => {
        fetchDailyRevenueDetail();
      })
      .catch((error) => {
        console.log("error", error);
        showError(`Xác nhận nộp tiền chi tiết tổng kết ca: ${error.response.data.message}`);
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const editStoreNote = (dailyRevenueID: number | undefined, store_note: string) => {
    if (dailyRevenueID) {
      dispatch(showLoading());
      dailyRevenueService
        .editStoreNote(dailyRevenueID, store_note)
        .then((response) => {
          fetchDailyRevenueDetail();
        })
        .catch((error) => {
          console.log("error", error);
          showError(`Cập nhật ghi chú cửa hàng: ${error.response.data.message}`);
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    }
  };

  const editAccountantNote = (dailyRevenueID: number | undefined, accountant_note: string) => {
    if (dailyRevenueID) {
      dispatch(showLoading());
      dailyRevenueService
        .editAccountantNote(dailyRevenueID, accountant_note)
        .then((response) => {
          fetchDailyRevenueDetail();
        })
        .catch((error) => {
          console.log("error", error);
          showError(`Cập nhật ghi chú kế toán: ${error.response.data.message}`);
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    }
  };

  useEffect(() => {
    dispatch(showLoading());
    fetchDailyRevenueDetail();
  }, [dispatch, fetchDailyRevenueDetail, id]);

  useEffect(() => {
    fetchDailyRevenueReport();
  }, [dispatch, fetchDailyRevenueReport]);

  useEffect(() => {
    const getView = () => {
      if (!dailyRevenueDetail) {
        return;
      }
      const main = {
        [dailyRevenueStatus.draft.value]: () => {
          setVisibleCardElement((prev) => {
            return {
              ...prev,
              revenueCard: {
                ...prev.revenueCard,
                show: true,
                updateButton: true,
              },
              shopCostAndSurchargeCard: {
                show: dailyRevenueDetail.other_payments.length === 0,
              },
              shopCostCard: {
                ...prev.shopCostCard,
                show: dailyRevenueDetail.other_payments.length > 0,
                actionButton: true,
                addButton: true,
              },
              shopSurchargeCard: {
                ...prev.shopSurchargeCard,
                show: dailyRevenueDetail.other_payments.length > 0,
                actionButton: true,
                addButton: true,
              },
              totalRevenueCard: {
                ...prev.totalRevenueCard,
                uploadPayment: false,
                result: false,
                confirmButton: true,
              },
            };
          });
        },
        [dailyRevenueStatus.paying.value]: () => {
          setVisibleCardElement((prev) => {
            return {
              ...prev,
              revenueCard: {
                ...prev.revenueCard,
                show: true,
              },
              shopCostCard: {
                ...prev.shopCostCard,
                show: true,
                actionButton: true,
                addButton: true,
              },
              shopSurchargeCard: {
                ...prev.shopSurchargeCard,
                show: true,
                actionButton: true,
                addButton: true,
              },
              totalRevenueCard: {
                ...prev.totalRevenueCard,
                result: false,
                uploadPayment: true,
                payMoneyButton: true,
                confirmMoneyButton: false,
              },
            };
          });
        },
        [dailyRevenueStatus.paid.value]: () => {
          setVisibleCardElement((prev) => {
            return {
              ...prev,
              revenueCard: {
                ...prev.revenueCard,
                show: true,
              },
              shopCostCard: {
                ...prev.shopCostCard,
                show: true,
                actionButton: true,
                addButton: true,
              },
              shopSurchargeCard: {
                ...prev.shopSurchargeCard,
                show: true,
                actionButton: true,
                addButton: true,
              },
              totalRevenueCard: {
                ...prev.totalRevenueCard,
                result: true,
                uploadPayment: false,
                payMoneyButton: true,
                confirmMoneyButton: true,
              },
            };
          });
        },
        [dailyRevenueStatus.finished.value]: () => {
          setVisibleCardElement((prev) => {
            return {
              ...prev,
              revenueCard: {
                ...prev.revenueCard,
                show: true,
              },
              shopCostCard: {
                ...prev.shopCostCard,
                show: true,
                actionButton: false,
                addButton: false,
              },
              shopSurchargeCard: {
                ...prev.shopSurchargeCard,
                show: true,
                actionButton: false,
                addButton: false,
              },
              totalRevenueCard: {
                ...prev.totalRevenueCard,
                result: true,
                payMoneyButton: false,
                confirmMoneyButton: false,
              },
            };
          });
        },
      };
      const action = main[dailyRevenueDetail?.state] || null;
      action && action();
    };
    getView();
  }, [dailyRevenueDetail]);

  return (
    <StyledComponent>
      <ContentContainer
        isLoading={isLoading}
        isError={isError}
        title={`Phiếu tổng kết ca ${id}`}
        breadcrumb={[
          {
            name: "Danh sách phiếu tổng kết ca",
            path: UrlConfig.DAILY_REVENUE,
          },
          {
            name: `Phiếu tổng kết ca ${id}`,
          },
        ]}
        extra={<DailyRevenueProgressBar dailyRevenueDetail={dailyRevenueDetail} />}
      >
        <Row gutter={30}>
          <Col span={18}>
            <ShopRevenueCard
              dailyRevenueDetail={dailyRevenueDetail}
              handleUpdateDailyRevenueDetail={handleUpdateDailyRevenueDetail}
              visibleCardElement={visibleCardElement}
              permissions={permissions}
              shopRevenueModel={shopRevenueModel}
            />
            {visibleCardElement.shopCostAndSurchargeCard.show && (
              <Card title="Thu Chi" className="revenueCard">
                <div className="revenueCard__inner">
                  <div className="revenueCard__content">Chưa có chi phí, phụ thu</div>
                  <div className="revenueCard__footer">
                    <Button
                      type="primary"
                      onClick={() => {
                        setVisibleCardElement((prev) => {
                          return {
                            ...prev,
                            shopCostAndSurchargeCard: {
                              ...prev.shopCostAndSurchargeCard,
                              show: false,
                            },
                            shopCostCard: {
                              ...prev.shopCostCard,
                              show: true,
                              actionButton: true,
                              addButton: true,
                            },
                            shopSurchargeCard: {
                              ...prev.shopSurchargeCard,
                              show: true,
                              actionButton: true,
                              addButton: true,
                            },
                          };
                        });
                      }}
                    >
                      Thêm thu chi
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            {visibleCardElement.shopCostCard.show && (
              <ShopCostCard
                dailyRevenueDetail={dailyRevenueDetail}
                handleAddOtherPaymentItem={(values, form) => {
                  // chi phí mặc định method là cash_payment
                  values.method = DailyRevenuePaymentMethods.cash_payment.value;
                  handleAddOtherPaymentItem(values, form);
                }}
                handleEditOtherPaymentItem={(otherPaymentId, values, form) => {
                  // chi phí mặc định method là cash_payment
                  values.method = DailyRevenuePaymentMethods.cash_payment.value;
                  handleEditOtherPaymentItem(otherPaymentId, values, form);
                }}
                handleDeleteOtherPaymentItem={handleDeleteOtherPaymentItem}
                visibleCardElement={visibleCardElement}
                setVisibleCardElement={setVisibleCardElement}
                dailyRevenueOtherPaymentTypes={dailyRevenueOtherPaymentTypes}
                isShowActionButton={visibleCardElement.shopCostCard.actionButton}
                permissions={permissions}
              />
            )}

            {visibleCardElement.shopSurchargeCard.show && (
              <ShopSurchargeCard
                dailyRevenueDetail={dailyRevenueDetail}
                handleAddOtherPaymentItem={handleAddOtherPaymentItem}
                handleEditOtherPaymentItem={handleEditOtherPaymentItem}
                handleDeleteOtherPaymentItem={handleDeleteOtherPaymentItem}
                visibleCardElement={visibleCardElement}
                setVisibleCardElement={setVisibleCardElement}
                dailyRevenueOtherPaymentTypes={dailyRevenueOtherPaymentTypes}
                isShowActionButton={visibleCardElement.shopSurchargeCard.actionButton}
                permissions={permissions}
              />
            )}

            {/* <ShopCostAndSurchargeCard items={shopCostItems} totalShopCostAmount={60000} /> */}
            <Form form={paymentForm} layout="vertical">
              <DailyRevenueTotal
                title="Tổng nộp"
                dailyRevenueDetail={dailyRevenueDetail}
                visibleCardElement={visibleCardElement}
                handleClickPayMoney={handleClickPayMoney}
                handleClickConfirmPayMoney={handleClickConfirmPayMoney}
                permissions={permissions}
                shopRevenueModel={shopRevenueModel}
              />
            </Form>
          </Col>
          <Col span={6}>
            <RevenueShopDetail storeDetail={storeDetail} />
            <RevenueStatus status={dailyRevenueDetail?.state} statuses={dailyRevenueStates} />
            <RevenueNote
              dailyRevenueDetail={dailyRevenueDetail}
              editStoreNote={editStoreNote}
              editAccountantNote={editAccountantNote}
            />
          </Col>
        </Row>
      </ContentContainer>
    </StyledComponent>
  );
}

export default DailyRevenueDetail;
