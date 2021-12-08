import {PlusOutlined} from "@ant-design/icons";
import {Button, Card} from "antd";
import ContentContainer from "component/container/content.container";
import FormOrderProcessingStatus from "component/forms/FormOrderProcessingStatus";
import CustomModal from "component/modal/CustomModal";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  actionAddOrderProcessingStatus,
  actionDeleteOrderProcessingStatus,
  actionEditOrderProcessingStatus,
  actionFetchListOrderProcessingStatus,
} from "domain/actions/settings/order-processing-status.action";
import {modalActionType} from "model/modal/modal.model";
import {VariantResponse} from "model/product/product.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";
import {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router-dom";
import {generateQuery} from "utils/AppUtils";
import {StyledComponent} from "./styles";

const SettingOrderProcessingStatus: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const dispatch = useDispatch();
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleServiceSubStatus, setModalSingleServiceSubStatus] =
    useState<OrderProcessingStatusModel | null>(null);

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "Code",
      dataIndex: "code",
      visible: true,
      className: "columnTitle",
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return (
            <span
              title={value}
              style={{wordWrap: "break-word", wordBreak: "break-word"}}
              className="title text"
            >
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Trạng thái xử lý",
      dataIndex: "sub_status",
      visible: true,
      className: "columnTitle",
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return (
            <span
              title={value}
              style={{wordWrap: "break-word", wordBreak: "break-word"}}
              className="title text"
            >
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        const result = LIST_STATUS?.find((singleStatus) => {
          return singleStatus.value === value;
        });
        if (result) {
          return result.name;
        }
        return "";
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <span className="text" title={value} style={{color: "#666666"}}>
            {value}
          </span>
        );
      },
    },
    {
      title: "Áp dụng cho đơn hàng ",
      dataIndex: "active",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return <span style={{color: "#27AE60"}}>Đang áp dụng</span>;
        }
        return <span style={{color: "#E24343"}}>Ngưng áp dụng</span>;
      },
    },
  ];

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const history = useHistory();

  const [queryParams, setQueryParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      queryParams.page = page;
      queryParams.limit = size;
      let queryParam = generateQuery(queryParams);
      setQueryParams({...queryParams});
      history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const createOrderServiceSubStatusHtml = () => {
    return (
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        onClick={() => {
          setModalAction("create");
          setIsShowModal(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm trạng thái xử lý
      </Button>
    );
  };

  const gotoFirstPage = () => {
    const newParams = {
      ...queryParams,
      page: 1,
    };
    setQueryParams({...newParams});
    let queryParam = generateQuery(newParams);
    history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
    window.scrollTo(0, 0);
  };

  const handleForm = {
    create: (formValue: OrderProcessingStatusModel) => {
      dispatch(
        actionAddOrderProcessingStatus(formValue, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValue: OrderProcessingStatusModel) => {
      if (modalSingleServiceSubStatus) {
        dispatch(
          actionEditOrderProcessingStatus(
            modalSingleServiceSubStatus.id,
            formValue,
            () => {
              dispatch(
                actionFetchListOrderProcessingStatus(
                  queryParams,
                  (data: OrderProcessingStatusResponseModel) => {
                    setListOrderProcessingStatus(data.items);
                  }
                )
              );
              setIsShowModal(false);
            }
          )
        );
      }
    },
    delete: () => {
      if (modalSingleServiceSubStatus) {
        dispatch(
          actionDeleteOrderProcessingStatus(modalSingleServiceSubStatus.id, () => {
            setIsShowModal(false);
            gotoFirstPage();
          })
        );
      }
    },
  };

  useEffect(() => {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    setTableLoading(true);
    dispatch(
      actionFetchListOrderProcessingStatus(
        queryParams,
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
          setTotal(data.metadata.total);
          setTableLoading(false);
        }
      )
    );
  }, [dispatch, queryParams]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Xử lý đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Xử lý đơn hàng",
          },
        ]}
        extra={createOrderServiceSubStatusHtml()}
      >
        {listOrderProcessingStatus && (
          <Card>
            <CustomTable
              isLoading={tableLoading}
              showColumnSetting={false}
              // scroll={{ x: 1080 }}
              pagination={{
                pageSize: queryParams.limit,
                total: total,
                current: queryParams.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              dataSource={listOrderProcessingStatus}
              columns={columnFinal()}
              rowKey={(item: VariantResponse) => item.id}
              onRow={(record: OrderProcessingStatusModel) => {
                return {
                  onClick: (event) => {
                    setModalSingleServiceSubStatus(record);
                    setModalAction("edit");
                    setIsShowModal(true);
                  }, // click row
                };
              }}
            />
          </Card>
        )}
        <CustomModal
          visible={isShowModal}
          onCreate={(formValue: OrderProcessingStatusModel) =>
            handleForm.create(formValue)
          }
          onEdit={(formValue: OrderProcessingStatusModel) => handleForm.edit(formValue)}
          onDelete={() => handleForm.delete()}
          onCancel={() => setIsShowModal(false)}
          modalAction={modalAction}
          modalTypeText="Trạng thái xử lý đơn hàng"
          componentForm={FormOrderProcessingStatus}
          formItem={modalSingleServiceSubStatus}
          deletedItemTitle={modalSingleServiceSubStatus?.sub_status}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingOrderProcessingStatus;
