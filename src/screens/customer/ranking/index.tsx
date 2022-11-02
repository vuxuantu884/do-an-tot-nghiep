import { Card, Menu, Button, Dropdown, Modal } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  DeleteLoyaltyRank,
  GetCodeUpdateRankingCustomerAction,
  LoyaltyRankSearch,
} from "domain/actions/loyalty/rank/loyalty-rank.action";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import {
  GetCodeUpdateRankingCustomerResponse,
  LoyaltyRankResponse,
} from "model/response/loyalty/ranking/loyalty-rank.response";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency, isNullOrUndefined } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import "./customer-ranking.scss";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import threeDot from "assets/icon/three-dot.svg";
import { Link } from "react-router-dom";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import ButtonCreate from "component/header/ButtonCreate";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { CUSTOMER_LEVEL_PERMISSIONS } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";
import ProgressRankingCustomerModal from "screens/customer/ranking/ProgressRankingCustomerModal";
import warningIcon from "assets/icon/warning-icon.svg";
import { StyledCustomerModalConfirmTime } from "screens/customer/customerStyled";
import { getProgressUpdateRankingCustomerApi } from "service/customer/customer.service";
import { HttpStatus } from "config/http-status.config";
import { EnumJobStatus } from "config/enum.config";
import ExitUpdateRankingCustomerModal from "./ExitUpdateRankingCustomerModal";
import { showSuccess, showError } from "utils/ToastUtils";

const viewCustomerLevelPermission = [CUSTOMER_LEVEL_PERMISSIONS.READ];
const createCustomerLevelPermission = [CUSTOMER_LEVEL_PERMISSIONS.CREATE];
const updateCustomerLevelPermission = [CUSTOMER_LEVEL_PERMISSIONS.UPDATE];
const deleteCustomerLevelPermission = [CUSTOMER_LEVEL_PERMISSIONS.DELETE];

const CustomerRanking = () => {
  const [allowCreateCustomerLevel] = useAuthorization({
    acceptPermissions: createCustomerLevelPermission,
    not: false,
  });
  const [allowUpdateCustomerLevel] = useAuthorization({
    acceptPermissions: updateCustomerLevelPermission,
    not: false,
  });
  const [allowDeleteCustomerLevel] = useAuthorization({
    acceptPermissions: deleteCustomerLevelPermission,
    not: false,
  });

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [data, setData] = useState<PageResponse<LoyaltyRankResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [dateUpdateRankingCustomer, setDateUpdateRankingCustomer] = useState<Array<any>>([]);

  const [isVisibleConfirmTimeModal, setIsVisibleConfirmTimeModal] = useState(false);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [isVisibleExitUpdateRankingCustomerModal, setIsVisibleExitUpdateRankingCustomerModal] =
    useState(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const [rankingCustomerProgressPercent, setRankingCustomerProgressPercent] = useState<number>(0);
  const [processCode, setProcessCode] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>();
  const RenderActionColumn = (value: any, row: any) => {
    const isShowAction = allowUpdateCustomerLevel || allowDeleteCustomerLevel;

    const menu = (
      <Menu>
        {allowUpdateCustomerLevel && (
          <Menu.Item key="1">
            <Link to={`${UrlConfig.CUSTOMER2}-rankings/${value.id}/update`}>
              <Button
                icon={<img alt="" style={{ marginRight: 12 }} src={editIcon} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
              >
                Chỉnh sửa
              </Button>
            </Link>
          </Menu.Item>
        )}

        {allowDeleteCustomerLevel && (
          <Menu.Item key="2">
            <Button
              icon={<img alt="" style={{ marginRight: 12 }} src={deleteIcon} />}
              type="text"
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
                color: "red",
              }}
              onClick={() => {
                setSelectedDeleteItem(value);
                setIsShowConfirmDelete(true);
              }}
            >
              Xóa
            </Button>
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <>
        {isShowAction && (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              className="p-0 ant-btn-custom"
              icon={<img src={threeDot} alt=""></img>}
            ></Button>
          </Dropdown>
        )}
      </>
    );
  };

  const pageColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      fixed: "left",
      align: "center",
      render: (value: any, item: any, index: number) => (
        <div>{(data.metadata.page - 1) * data.metadata.limit + index + 1}</div>
      ),
      width: "60px",
    },
    {
      title: "Tên hạng khách hàng",
      dataIndex: "name",
      visible: true,
      fixed: "left",
      align: "left",
      width: "200px",
      render: (value, row, index) => {
        return <Link to={`${UrlConfig.CUSTOMER2}-rankings/${row.id}/update`}>{value}</Link>;
      },
    },
    {
      title: "Tổng tích lũy cần duy trì trong năm",
      visible: true,
      align: "right",
      width: "250px",
      render: (value: any) => <div>{formatCurrency(value.money_maintain_in_year)}</div>,
    },
    {
      title: "Giá trị nhỏ nhất",
      visible: true,
      align: "right",
      width: "200px",
      render: (value: any) => <div>{formatCurrency(value.accumulated_from)}</div>,
    },
    {
      title: "Trạng thái",
      visible: true,
      align: "center",
      width: "160px",
      render: (value: any) => (
        <div className={`status status__${value.status}`}>
          {value.status === "ACTIVE" ? "Đang hoạt động" : "Dừng hoạt động"}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      visible: true,
      align: "center",
      width: "120px",
      render: (value: any) => <div>{moment(value.created_date).format(DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: true,
      align: "center",
    },
    {
      title: "",
      visible: true,
      width: "70px",
      render: (value: any, i: any) => RenderActionColumn(value, i),
    },
  ];
  const [query, setQuery] = React.useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: "accumulated_from",
    sort_type: "desc",
  });

  const handleGetDateFromRankingCustomer = (item: any) => {
    const convertDateToString = moment(item.updated_date).format("YYYY/MM/DD");
    const getDate = new Date(convertDateToString);
    setDateUpdateRankingCustomer((prev) => [...prev, getDate]);
  };

  useEffect(() => {
    data.items.map((item: any) => handleGetDateFromRankingCustomer(item));
  }, [data.items]);

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState<boolean>(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>();

  const dispatch = useDispatch();

  const fetchData = useCallback((data: PageResponse<LoyaltyRankResponse>) => {
    setData(data);
    setTableLoading(false);
  }, []);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query],
  );

  const afterDeleted = React.useCallback(() => {
    dispatch(LoyaltyRankSearch({ ...query }, fetchData));
    setIsShowConfirmDelete(false);
  }, [dispatch, query, fetchData]);

  const onConfirmDelete = React.useCallback(() => {
    if (selectedDeleteItem) {
      dispatch(DeleteLoyaltyRank(selectedDeleteItem.id, afterDeleted));
    }
  }, [selectedDeleteItem, dispatch, afterDeleted]);

  const onGetCodeCustomerRanking = useCallback((result: GetCodeUpdateRankingCustomerResponse) => {
    const progressRankingData = result.data;
    setProcessCode(progressRankingData.data.code);
    showError(result?.message);
  }, []);

  const handleUpdateRankingCustomer = () => {
    const startTimeFirst = 12 * 60 + 0;
    const endTimeFirst = 12 * 60 + 45;

    const startTimeSecond = 22 * 60 + 30;
    const endTimeSecond = 7 * 60 + 0;

    const date = new Date();
    const currentTime = date.getHours() * 60 + date.getMinutes();

    if (
      (startTimeFirst <= currentTime && currentTime <= endTimeFirst) ||
      (startTimeSecond <= currentTime && currentTime <= endTimeSecond)
    ) {
      setIsDownloading(true);
      setIsVisibleProgressModal(true);

      const requestGetJobRanking = {
        type: 1,
      };

      dispatch(GetCodeUpdateRankingCustomerAction(requestGetJobRanking, onGetCodeCustomerRanking));
    } else {
      setIsVisibleConfirmTimeModal(true);
    }
  };

  const onCancel = React.useCallback(() => {
    setIsShowConfirmDelete(false);
    setSelectedDeleteItem(undefined);
  }, []);

  useEffect(() => {
    dispatch(LoyaltyRankSearch({ ...query }, fetchData));
  }, [dispatch, fetchData, query]);

  const getProgressUpdateRankingCustomer = useCallback(() => {
    let getImportProgressPromise: Promise<any> = getProgressUpdateRankingCustomerApi(processCode);
    Promise.all([getImportProgressPromise]).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          !isNullOrUndefined(response.data.total)
        ) {
          const processData = response.data;
          setProgressData(processData);
          const progressCount = processData?.processed;
          if (progressCount >= processData?.total || processData.status === EnumJobStatus.finish) {
            setRankingCustomerProgressPercent(100);
            setProcessCode(null);
            setIsDownloading(false);
          } else {
            const percent = Math.floor((progressCount / processData.total) * 100);
            setRankingCustomerProgressPercent(percent);
          }
        }
      });
    });
  }, [processCode]);

  useEffect(() => {
    if (rankingCustomerProgressPercent === 100 || !processCode) {
      return;
    }
    getProgressUpdateRankingCustomer();
    const updateRankingCustomerInterval = setInterval(getProgressUpdateRankingCustomer, 3000);
    return () => clearInterval(updateRankingCustomerInterval);
  }, [getProgressUpdateRankingCustomer, processCode, rankingCustomerProgressPercent]);

  const onOkConfirmRemoveTimeRankingCustomer = () => {
    setIsVisibleConfirmTimeModal(false);
  };

  const resetProgress = () => {
    setProcessCode(null);
    setRankingCustomerProgressPercent(0);
  };

  const onOkProgressRankingCustomer = useCallback(() => {
    showSuccess("Cập nhập thành công");
    resetProgress();
    setIsVisibleProgressModal(false);
  }, []);

  const onCancelProgressRankingCustomer = () => {
    setIsVisibleExitUpdateRankingCustomerModal(true);
  };

  const onOkExitRemoveRankingCustomerModal = () => {
    resetProgress();
    setIsVisibleExitUpdateRankingCustomerModal(false);
    setIsVisibleProgressModal(false);
  };

  const onCancelExitRemoveRankingCustomerModal = () => {
    setIsVisibleExitUpdateRankingCustomerModal(false);
  };

  return (
    <ContentContainer
      title="Hạng khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Hạng khách hàng",
        },
      ]}
      extra={
        <>
          {allowCreateCustomerLevel && (
            <ButtonCreate child="Thêm mới" path={`${UrlConfig.CUSTOMER2}-rankings/create`} />
          )}
        </>
      }
    >
      <AuthWrapper acceptPermissions={viewCustomerLevelPermission} passThrough>
        {(allowed: boolean) =>
          allowed ? (
            <Card>
              <div className="customer-ranking">
                <CustomTable
                  bordered={true}
                  isLoading={tableLoading}
                  scroll={{ x: 1200 }}
                  sticky={{ offsetScroll: 5 }}
                  pagination={{
                    pageSize: data.metadata.limit,
                    total: data.metadata.total,
                    current: data.metadata.page,
                    showSizeChanger: true,
                    onChange: onPageChange,
                    onShowSizeChange: onPageChange,
                  }}
                  isShowPaginationAtHeader
                  dataSource={data.items}
                  columns={pageColumns}
                  rowKey={(item: any) => item.id}
                />
              </div>
            </Card>
          ) : (
            <NoPermission />
          )
        }
      </AuthWrapper>

      {allowUpdateCustomerLevel &&
        <Card title={<span className="card-title">CẬP NHẬP HẠNG KHÁCH HÀNG</span>}>
          <div className="update_ranking-customer">
            <p className="update_ranking-customer-last-date">{`Cập nhật lần cuối: ${moment(
              new Date(Math.max(...dateUpdateRankingCustomer)),
            ).format(DATE_FORMAT.DDMMYYY)}`}</p>
            <Button
              type="primary"
              className="update_ranking-customer-btn"
              onClick={handleUpdateRankingCustomer}
            >
              Cập nhập hạng khách hàng
            </Button>
          </div>
        </Card>
      }

      <ModalDeleteConfirm
        visible={isShowConfirmDelete}
        onOk={onConfirmDelete}
        onCancel={onCancel}
        title="Bạn có chắc chắn xóa hạng khách hàng này không?"
        subTitle="Bạn sẽ không khôi phục lại hạng khách hàng này nếu đã xóa."
        okText="Xóa"
        cancelText="Thoát"
      />

      {isVisibleConfirmTimeModal && (
        <Modal
          width={600}
          visible={isVisibleConfirmTimeModal}
          closable={false}
          footer={
            <Button type="primary" onClick={onOkConfirmRemoveTimeRankingCustomer}>
              Ok
            </Button>
          }
        >
          <StyledCustomerModalConfirmTime>
            <div className="modal_confirm_time">
              <div className="modal_confirm_time-icon">
                <img src={warningIcon} alt="" />
              </div>
              <div>
                <span className="modal_confirm_time-title">
                  Chỉ cập nhập trong khoảng thời gian từ 12h-12h45 hoặc sau 22h30
                </span>
                <span className="modal_confirm_time-desc">
                  Để đảm bảo tính năng được chạy thành công và ổn định hệ thống, bạn vui lòng quay
                  lại thực hiện trong khoảng thời gian trên
                </span>
              </div>
            </div>
          </StyledCustomerModalConfirmTime>
        </Modal>
      )}

      {isVisibleProgressModal && (
        <ProgressRankingCustomerModal
          visible={isVisibleProgressModal}
          onCancel={onCancelProgressRankingCustomer}
          onOk={onOkProgressRankingCustomer}
          progressData={progressData}
          progressPercent={rankingCustomerProgressPercent}
          isDownloading={isDownloading}
        />
      )}

      {isVisibleExitUpdateRankingCustomerModal && (
        <ExitUpdateRankingCustomerModal
          visible={isVisibleExitUpdateRankingCustomerModal}
          onOk={onOkExitRemoveRankingCustomerModal}
          onCancel={onCancelExitRemoveRankingCustomerModal}
        />
      )}
    </ContentContainer>
  );
};

export default CustomerRanking;
