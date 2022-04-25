import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {Button, Modal} from "antd";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import CustomTable, {ICustomTableColumType,} from "component/table/CustomTable";
import {StyledActivityLog, StyledActivityLogDetailModal} from "screens/customer/customer-detail/customerDetailStyled";
import {
  getCustomerActivityLogAction,
  getCustomerActivityLogDetailAction
} from "domain/actions/customer/customer.action";
import clockHistoryIcon from "assets/icon/clock-history.svg"

type CustomerActivityLogProps = {
  customer: any;
};

const ACTIVITY_LOG_ACTION = {
  CREATE: "Tạo mới",
  UPDATE: "Chỉnh sửa",
}

function CustomerActivityLog(props: CustomerActivityLogProps) {
  const { customer } = props;
  const dispatch = useDispatch();

  // handle get purchase history
  const [isVisibleLogDetail, setIsVisibleLogDetail] = useState<boolean>(false);
  const [activityLogDetail, setActivityLogDetail] = useState<any>();
  const [oldDataLogDetail, setOldDataLogDetail] = useState<string>("");
  const [newDataLogDetail, setNewDataLogDetail] = useState<string>("");
  const [activityLogDetailType, setActivityLogDetailType] = useState<string>("");
  const [activityLogQueryParams, setActivityLogQueryParams] = useState<any>({
    limit: 10,
    page: 1,
    customer_id: null,
  });

  const [activityLogData, setActivityLogData] = useState<PageResponse<any>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  // get activity Log List
  const updateActivityLogList = useCallback(
    (data: PageResponse<OrderModel> | false) => {
      if (data) {
        setActivityLogData(data);
      }
    },
    []
  );

  useEffect(() => {
    if (customer?.id) {
      activityLogQueryParams.customer_id = customer?.id;
      dispatch(getCustomerActivityLogAction(activityLogQueryParams, updateActivityLogList));
    }
  }, [activityLogQueryParams, customer?.id, dispatch, updateActivityLogList]);
  // end get activity Log List

  const onChangePage = useCallback(
    (page, limit) => {
      setActivityLogQueryParams({ ...activityLogQueryParams, page, limit });
    },
    [activityLogQueryParams, setActivityLogQueryParams]
  );

  const handleViewLogDetail = (response: any) => {
    if (response) {
      setIsVisibleLogDetail(true);
      setActivityLogDetailType(response.action?.toUpperCase());
      setActivityLogDetail(response.data);
      setOldDataLogDetail(response.old_data?.replaceAll('null', ''));
      setNewDataLogDetail(response.new_data?.replaceAll('null', ''));
    }
  }

  const getActivityLogDetail = useCallback((logId: number) => {
    if (logId) {
      dispatch(getCustomerActivityLogDetailAction(logId, handleViewLogDetail));
    }
  }, [dispatch]);

  const getActivityLogAction = (action: string) => {
    switch (action?.toUpperCase()) {
      case "CREATE":
        return ACTIVITY_LOG_ACTION.CREATE;
      case "UPDATE":
        return ACTIVITY_LOG_ACTION.UPDATE;
      default:
        return "--";
    }
  };

  const activityLogColumns: Array<ICustomTableColumType<any>> =
    React.useMemo(
      () => [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          align: "center",
          width: "15%",
          render: (value: string, item: any) => {
            return (
              <div className="link" onClick={() => getActivityLogDetail(item.id)}>{value}</div>
            );
          },
        },
        {
          title: "Người thao tác",
          dataIndex: "created_name",
          key: "created_name",
          align: "center",
        },
        {
          title: "Thời gian",
          dataIndex: "created_date",
          key: "created_date",
          align: "center",
          width: "20%",
          render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYY_HHmm)}</div>,
        },
        {
          title: "Hành động",
          dataIndex: "action",
          key: "action",
          align: "center",
          width: "20%",
          render: (value: string) => <div>{getActivityLogAction(value)}</div>,
        },
        {
          title: "Nội dung",
          dataIndex: "id",
          key: "content",
          align: "center",
          width: 150,
          render: (value: number) => (
            <div>
              <img
                src={clockHistoryIcon}
                style={{ cursor: "pointer" }}
                alt=""
                onClick={() => getActivityLogDetail(value)}
              />
            </div>
          )
        },
      ],
      [getActivityLogDetail]
    );

  const onCloseLogDetailModal = () => {
    setActivityLogDetail(null);
    setIsVisibleLogDetail(false);
  }

  return (
    <StyledActivityLog>
      <CustomTable
        bordered
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: activityLogData.metadata?.limit,
          total: activityLogData.metadata?.total,
          current: activityLogData.metadata?.page,
          showSizeChanger: true,
          onChange: onChangePage,
          onShowSizeChange: onChangePage,
        }}
        dataSource={activityLogData.items}
        columns={activityLogColumns}
        rowKey={(item: OrderModel) => item.id}
      />

      {isVisibleLogDetail &&
        <Modal
          onOk={onCloseLogDetailModal}
          visible={isVisibleLogDetail}
          closable={false}
          centered
          title={activityLogDetailType === "CREATE" ? "Chi tiết tạo mới" : "Chi tiết chỉnh sửa"}
          width={800}
          footer={[
            <Button key="close" type="primary" onClick={onCloseLogDetailModal}>
              Đóng
            </Button>
          ]}
        >
          <StyledActivityLogDetailModal>
            <div className="log-detail-modal-body">
              {activityLogDetailType === "CREATE" ?
                <div>
                  <div><strong>Dữ liệu tạo mới:</strong></div>
                  <div className="content">
                    <pre>{JSON.stringify(JSON.parse(activityLogDetail || "{}"), null, 2)}</pre>
                  </div>
                </div>
                :
                <div>
                  <div className="log-detail-update">
                    <div className="old-data">
                      <div className="label"><strong>Dữ liệu cũ:</strong></div>
                      <div className="content">{oldDataLogDetail}</div>
                    </div>

                    <div className="new-data">
                      <div className="label"><strong>Dữ liệu mới:</strong></div>
                      <div className="content">{newDataLogDetail}</div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </StyledActivityLogDetailModal>
        </Modal>
      }
    </StyledActivityLog>
  );
}

export default CustomerActivityLog;
