import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import ModalOrderProcessingStatus from "component/modal/ModalOrderProcessingStatus";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomTableStyle2 from "component/table/CustomTableStyle2";
import UrlConfig from "config/UrlConfig";
import {
  actionAddOrderProcessingStatus,
  actionDeleteOrderProcessingStatus,
  actionEditOrderProcessingStatus,
  actionFetchListOrderProcessingStatus,
} from "domain/actions/settings/order-processing-status.action";
import { modalActionType } from "model/modal/modal.model";
import { VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { StyledComponent } from "./styles";

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

  const columns: Array<ICustomTableColumType<VariantResponse>> = [
    {
      title: "Trạng thái xử lý",
      dataIndex: "sub_status",
      visible: true,
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      visible: true,
      render: (value, row, index) => {
        const result = LIST_STATUS?.filter((singleStatus) => {
          return singleStatus.value === value;
        });
        if (result) {
          return result[0].name;
        }
        return;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
    },
    {
      title: "Áp dụng cho đơn hàng ",
      dataIndex: "is_active",
      visible: true,
      render: (value, row, index) => {
        if (value) {
          return <span style={{ color: "#27AE60" }}>Đang áp dụng</span>;
        }
        return <span style={{ color: "#E24343" }}>Ngưng áp dụng</span>;
      },
    },
  ];

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const history = useHistory();

  let [params, setParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
    },
    [history, params]
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
      ...params,
      page: 1,
    };
    setParams({ ...newParams });
    let queryParam = generateQuery(newParams);
    history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
  };

  const handleForm = {
    create: (value: OrderProcessingStatusModel) => {
      dispatch(
        actionAddOrderProcessingStatus(value, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (id: number, value: OrderProcessingStatusModel) => {
      dispatch(
        actionEditOrderProcessingStatus(id, value, () => {
          setIsShowModal(false);
          dispatch(
            actionFetchListOrderProcessingStatus(
              params,
              (data: OrderProcessingStatusResponseModel) => {
                setListOrderProcessingStatus(data.items);
                setTotal(data.metadata.total);
              }
            )
          );
        })
      );
    },
    delete: (value: OrderProcessingStatusModel) => {
      console.log("value", value);
      dispatch(
        actionDeleteOrderProcessingStatus(value.id, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
  };

  useEffect(() => {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    dispatch(
      actionFetchListOrderProcessingStatus(
        params,
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
          setTotal(data.metadata.total);
        }
      )
    );
  }, [dispatch, params]);

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
          <Card style={{ padding: 24 }}>
            <CustomTableStyle2
              isLoading={tableLoading}
              showColumnSetting={true}
              scroll={{ x: 1080 }}
              pagination={{
                pageSize: params.limit,
                total: total,
                current: params.page,
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
                    console.log("record", record);
                    setModalSingleServiceSubStatus(record);
                    setModalAction("edit");
                    setIsShowModal(true);
                  }, // click row
                };
              }}
            />
          </Card>
        )}
        {isShowModal && (
          <ModalOrderProcessingStatus
            visible={isShowModal}
            modalAction={modalAction}
            onCreate={(value) => handleForm.create(value)}
            onEdit={(id, value) => handleForm.edit(id, value)}
            onDelete={(value) => handleForm.delete(value)}
            onCancel={() => setIsShowModal(false)}
            modalSingleServiceSubStatus={modalSingleServiceSubStatus}
          />
        )}
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingOrderProcessingStatus;
