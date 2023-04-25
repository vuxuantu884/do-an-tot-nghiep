import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Button, Card, Checkbox, Col, Row, Space, Switch } from "antd";
import ContentContainer from "component/container/content.container";
import { PROMOTION_CAMPAIGN_PERMISSIONS } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { Link, useHistory } from "react-router-dom";
import BottomBarContainer from "component/container/bottom-bar.container";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { CAMPAIGN_STATUS } from "screens/promotion/constants";
import {
  accountantConfirmRegisterAction,
  activePromotionCampaignAction,
  approvePromotionCampaignAction,
  getPromotionCampaignDetailAction,
  registerPromotionCampaignAction,
  setupPromotionCampaignAction,
} from "domain/actions/promotion/campaign/campaign.action";
import { PromotionCampaignResponse } from "model/promotion/campaign.model";
import PromotionSelectedList from "screens/promotion/campaign/components/PromotionSelectedList";
import PromotionCampaignProvider, {
  PromotionCampaignContext,
} from "screens/promotion/campaign/components/PromotionCampaignProvider";
import PromotionCampaignStep from "../components/PromotionCampaignStep";
import {
  CAMPAIGN_STEPS_LIST,
  CAMPAIGN_STATUS_ENUM,
} from "screens/promotion/campaign/campaign.helper";
import { PromotionCampaignDetailsStyled } from "screens/promotion/campaign/campaign.style";
import PromotionCampaignConditionDetail from "screens/promotion/campaign/detail/PromotionCampaignConditionDetail";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import PromotionCampaignLogsDetail from "screens/promotion/campaign/detail/PromotionCampaignLogsDetail";
import { RootReducerType } from "model/reducers/RootReducerType";

const PromotionCampaignDetail: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    currentStep,
    setCurrentStep,
    setOriginalSelectedRowKeys,
    setPromotionSelectedList,
    setSelectedRowKeys,
    setTempSelectedRowKeys,
    setTempPromotionSelectedList,
  } = promotionCampaignContext;

  const userReducerAccount = useSelector((state: RootReducerType) => state.userReducer.account);

  const [error, setError] = useState(false);
  const [promotionCampaignDetail, setPromotionCampaignDetail] =
    useState<PromotionCampaignResponse>();
  const [promotionCampaignDescriptionList, setPromotionCampaignDescriptionList] = useState<
    Array<string>
  >([]);
  const [promotionCampaignNoteList, setPromotionCampaignNoteList] = useState<Array<string>>([]);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isAccountantConfirmed, setIsAccountantConfirmed] = useState<boolean>(false);

  /** phân quyền */
  const [allowUpdatePromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.UPDATE],
  });
  const [allowApprovePromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.APPROVE],
  });
  const [allowRegisterPromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.REGISTER],
  });
  const [allowSetupPromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.SETUP],
  });
  const [allowActivePromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.ACTIVE],
  });
  /** */

  /** handle get promotion campaign detail */
  const handleSetSteps = useCallback(
    (data: PromotionCampaignResponse) => {
      if (data.state?.toUpperCase() === CAMPAIGN_STATUS_ENUM.ACTIVED) {
        const finishedStep = {
          title: "Kích hoạt",
          key: CAMPAIGN_STATUS_ENUM.ACTIVED,
          value: 4,
        };
        setCurrentStep(finishedStep);
      } else {
        const step = CAMPAIGN_STEPS_LIST.find((item) => item.key === data.state?.toUpperCase());
        if (step) {
          setCurrentStep(step);
        }
      }
    },
    [setCurrentStep],
  );

  const handleSetContextData = useCallback(
    (data: PromotionCampaignResponse) => {
      setPromotionSelectedList(data.price_rules);
      setTempPromotionSelectedList(data.price_rules);
      if (data.price_rules?.length > 0) {
        const priceRulesId = data.price_rules.map((priceRule) => priceRule.id);
        setSelectedRowKeys(priceRulesId);
        setOriginalSelectedRowKeys(priceRulesId);
        setTempSelectedRowKeys(priceRulesId);
      }
    },
    [
      setOriginalSelectedRowKeys,
      setPromotionSelectedList,
      setSelectedRowKeys,
      setTempPromotionSelectedList,
      setTempSelectedRowKeys,
    ],
  );

  const getPromotionCampaignDetailCallback = useCallback(
    (response: PromotionCampaignResponse | false) => {
      dispatch(hideLoading());
      if (!response) {
        setError(true);
      } else {
        setPromotionCampaignDetail(response);
        setIsRegistered(response.is_registered);
        setIsAccountantConfirmed(response.is_accountant_confirmed);
        if (response.description) {
          const descriptionList = response.description.split("\n");
          setPromotionCampaignDescriptionList(descriptionList);
        }
        if (response.note) {
          const noteList = response.note.split("\n");
          setPromotionCampaignNoteList(noteList);
        }
        handleSetContextData(response);
        handleSetSteps(response);
      }
    },
    [dispatch, handleSetContextData, handleSetSteps],
  );

  const getPromotionCampaignDetail = useCallback(() => {
    window.scrollTo(0, 0);
    dispatch(showLoading());
    dispatch(getPromotionCampaignDetailAction(idNumber, getPromotionCampaignDetailCallback));
  }, [dispatch, getPromotionCampaignDetailCallback, idNumber]);

  useEffect(() => {
    getPromotionCampaignDetail();
  }, [getPromotionCampaignDetail]);
  /** end handle get promotion campaign detail */

  const isShowPromotionList = useMemo(() => {
    return (
      currentStep.key === CAMPAIGN_STATUS_ENUM.REGISTERED ||
      currentStep.key === CAMPAIGN_STATUS_ENUM.ACTIVED ||
      currentStep.key === CAMPAIGN_STATUS_ENUM.SET_UP
    );
  }, [currentStep.key]);

  const RenderStatus = (data: PromotionCampaignResponse) => {
    const status = CAMPAIGN_STATUS.find((status) => status.code === data.state);
    return <span style={{ marginLeft: "20px" }}>{status?.Component}</span>;
  };

  /** handle update promotion campaign state */
  const changePromotionCampaignStateCallback = useCallback(
    (data: PromotionCampaignResponse, successCallbackMessage: string) => {
      dispatch(hideLoading());
      if (data) {
        showSuccess(successCallbackMessage);
        getPromotionCampaignDetail();
      }
    },
    [dispatch, getPromotionCampaignDetail],
  );
  const handleChangePromotionCampaignState = useCallback(
    (currentState: string) => {
      try {
        let successCallbackMessage = "Thay đổi chương trình khuyến mại thành công!";
        let params: any = {
          updated_by: userReducerAccount?.user_name || "",
          updated_name: userReducerAccount?.full_name || "",
        };
        dispatch(showLoading());
        switch (currentState) {
          case CAMPAIGN_STATUS_ENUM.PENDING:
            successCallbackMessage = "Duyệt chương trình khuyến mại thành công";
            dispatch(
              approvePromotionCampaignAction(idNumber, params, (data) => {
                changePromotionCampaignStateCallback(data, successCallbackMessage);
              }),
            );
            break;
          case CAMPAIGN_STATUS_ENUM.APPROVED:
            successCallbackMessage = "Xác nhận đăng ký SCT thành công";
            params.is_registered = isRegistered;
            dispatch(
              registerPromotionCampaignAction(idNumber, params, (data) => {
                changePromotionCampaignStateCallback(data, successCallbackMessage);
              }),
            );
            break;
          case CAMPAIGN_STATUS_ENUM.REGISTERED:
            if (!promotionCampaignDetail?.is_accountant_confirmed) {
              dispatch(hideLoading());
              showError("Kế toán chưa xác nhận đăng ký hoàn tất. Vui lòng kiểm tra lại.");
              break;
            } else {
              successCallbackMessage = "Setup chương trình khuyến mại thành công";
              dispatch(
                setupPromotionCampaignAction(idNumber, params, (data) => {
                  changePromotionCampaignStateCallback(data, successCallbackMessage);
                }),
              );
              break;
            }
          case CAMPAIGN_STATUS_ENUM.SET_UP:
            successCallbackMessage = "Kích hoạt chương trình khuyến mại thành công";
            dispatch(
              activePromotionCampaignAction(idNumber, params, (data) => {
                changePromotionCampaignStateCallback(data, successCallbackMessage);
              }),
            );
            break;

          default:
            break;
        }
      } catch (error: any) {
        dispatch(hideLoading());
        showError(error.message);
      }
    },
    [
      changePromotionCampaignStateCallback,
      dispatch,
      idNumber,
      isRegistered,
      promotionCampaignDetail?.is_accountant_confirmed,
      userReducerAccount?.full_name,
      userReducerAccount?.user_name,
    ],
  );

  const handleAccountantConfirmRegister = (accountantConfirmed: boolean) => {
    dispatch(showLoading());
    dispatch(
      accountantConfirmRegisterAction(
        idNumber,
        { is_accountant_confirmed: accountantConfirmed },
        (data) => {
          dispatch(hideLoading());
          if (data) {
            if (data.is_accountant_confirmed) {
              showSuccess("Kế toán xác nhận đăng ký SCT hoàn tất");
            } else {
              showWarning("Kế toán chưa xác nhận đăng ký SCT hoàn tất");
            }
            setIsAccountantConfirmed(data.is_accountant_confirmed);
            getPromotionCampaignDetail();
          }
        },
      ),
    );
  };

  return (
    <ContentContainer
      isError={error}
      title={
        promotionCampaignDetail ? promotionCampaignDetail.name : "Chi tiết chương trình khuyến mại"
      }
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quản lý CTKM",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`,
        },
        {
          name: "Chi tiết chương trình",
        },
      ]}
    >
      {promotionCampaignDetail && (
        <PromotionCampaignDetailsStyled>
          <PromotionCampaignStep />

          <Row gutter={24}>
            <Col span={18}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>THÔNG TIN CHƯƠNG TRÌNH KHUYẾN MẠI</span>
                    {RenderStatus(promotionCampaignDetail)}
                  </div>
                }
              >
                <Row gutter={24}>
                  <Col span={4}>
                    <span className={"title"}>Tên CTKM/ Thông điệp</span>
                  </Col>
                  <Col span={20}>
                    <strong>: {promotionCampaignDetail.name}</strong>
                  </Col>
                  <Col span={4}>
                    <span className={"title"}>Mã CTKM</span>
                  </Col>
                  <Col span={20}>
                    <strong>: {promotionCampaignDetail.code}</strong>
                  </Col>

                  {/*Bước Đăng ký Sở Công Thương*/}
                  {currentStep.key === CAMPAIGN_STATUS_ENUM.APPROVED && (
                    <>
                      <Col span={4}>
                        <span className={"title"}>Đăng ký SCT</span>
                      </Col>
                      {allowRegisterPromotionCampaign ? (
                        <Col span={20}>
                          <Space direction="horizontal">
                            <Switch
                              checked={isRegistered}
                              onChange={(value) => {
                                setIsRegistered(value);
                              }}
                            />
                            Đã đăng ký Sở Công Thương
                          </Space>
                        </Col>
                      ) : (
                        <Col span={20}>
                          <strong>: ---</strong>
                        </Col>
                      )}
                    </>
                  )}

                  {/*Bước Setup chương trình*/}
                  {currentStep.key === CAMPAIGN_STATUS_ENUM.REGISTERED && (
                    <>
                      <Col span={4}>
                        <span className={"title"}>Đăng ký SCT</span>
                      </Col>
                      <Col span={8}>
                        {promotionCampaignDetail.is_registered ? ": Có đăng ký" : ": Không đăng ký"}
                      </Col>
                      <Col span={12}>
                        {promotionCampaignDetail.is_registered && (
                          <Checkbox
                            checked={isAccountantConfirmed}
                            onChange={(e) => {
                              handleAccountantConfirmRegister(e.target.checked);
                            }}
                            disabled={!allowRegisterPromotionCampaign}
                          >
                            Kế toán xác nhận đăng ký hoàn tất
                          </Checkbox>
                        )}
                      </Col>
                    </>
                  )}

                  {/*Bước Kích hoạt chương trình*/}
                  {(currentStep.key === CAMPAIGN_STATUS_ENUM.SET_UP ||
                    currentStep.key === CAMPAIGN_STATUS_ENUM.ACTIVED) && (
                    <>
                      <Col span={4}>
                        <span className={"title"}>Đăng ký SCT</span>
                      </Col>
                      <Col span={8}>
                        {promotionCampaignDetail.is_registered ? ": Có đăng ký" : ": Không đăng ký"}
                      </Col>
                      <Col span={12}>
                        {promotionCampaignDetail.is_registered && (
                          <Checkbox checked={isAccountantConfirmed} disabled>
                            Kế toán xác nhận đăng ký hoàn tất
                          </Checkbox>
                        )}
                      </Col>
                    </>
                  )}

                  <Col span={12}>
                    <div className={"title"} style={{ marginBottom: "12px" }}>
                      Nội dung chiến dịch khuyến mại:
                    </div>
                    <div className={"description-content"}>
                      {promotionCampaignDescriptionList?.length > 0 &&
                        promotionCampaignDescriptionList.map((description, index) => {
                          return (
                            <div style={{ marginLeft: "8px" }} key={index}>
                              {description}
                            </div>
                          );
                        })}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={"title"} style={{ marginBottom: "12px" }}>
                      Ghi chú:
                    </div>
                    <div className={"description-content"}>
                      {promotionCampaignNoteList?.length > 0 &&
                        promotionCampaignNoteList.map((note, index) => {
                          return (
                            <div style={{ marginLeft: "8px" }} key={index}>
                              {note}
                            </div>
                          );
                        })}
                    </div>
                  </Col>
                </Row>
              </Card>

              {isShowPromotionList && (
                <PromotionSelectedList
                  promotionCampaignDetail={promotionCampaignDetail}
                  getPromotionCampaignDetail={getPromotionCampaignDetail}
                />
              )}
            </Col>

            <Col span={6}>
              <PromotionCampaignConditionDetail data={promotionCampaignDetail} />
              <PromotionCampaignLogsDetail promotionCampaignDetail={promotionCampaignDetail} />
            </Col>
          </Row>

          <BottomBarContainer
            back="Quay lại danh sách chương trình KM"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`)}
            rightComponent={
              <>
                {allowUpdatePromotionCampaign && currentStep.key !== CAMPAIGN_STATUS_ENUM.ACTIVED && (
                  <Link to={`${idNumber}/update`}>
                    <Button style={{ marginRight: "20px" }}>Chỉnh sửa chương trình</Button>
                  </Link>
                )}

                {allowApprovePromotionCampaign && currentStep.key === CAMPAIGN_STATUS_ENUM.PENDING && (
                  <Button
                    type="primary"
                    onClick={() => handleChangePromotionCampaignState(CAMPAIGN_STATUS_ENUM.PENDING)}
                  >
                    Duyệt chương trình
                  </Button>
                )}

                {allowRegisterPromotionCampaign &&
                  currentStep.key === CAMPAIGN_STATUS_ENUM.APPROVED && (
                    <Button
                      type="primary"
                      onClick={() =>
                        handleChangePromotionCampaignState(CAMPAIGN_STATUS_ENUM.APPROVED)
                      }
                    >
                      Xác nhận đăng ký SCT
                    </Button>
                  )}

                {allowSetupPromotionCampaign &&
                  currentStep.key === CAMPAIGN_STATUS_ENUM.REGISTERED && (
                    <Button
                      type="primary"
                      onClick={() =>
                        handleChangePromotionCampaignState(CAMPAIGN_STATUS_ENUM.REGISTERED)
                      }
                    >
                      Xác nhận Setup
                    </Button>
                  )}

                {allowActivePromotionCampaign && currentStep.key === CAMPAIGN_STATUS_ENUM.SET_UP && (
                  <Button
                    type="primary"
                    onClick={() => handleChangePromotionCampaignState(CAMPAIGN_STATUS_ENUM.SET_UP)}
                  >
                    Kích hoạt
                  </Button>
                )}
              </>
            }
          />
        </PromotionCampaignDetailsStyled>
      )}
    </ContentContainer>
  );
};

const PromotionCampaignDetailWithProvider = () => (
  <PromotionCampaignProvider>
    <PromotionCampaignDetail />
  </PromotionCampaignProvider>
);
export default PromotionCampaignDetailWithProvider;
