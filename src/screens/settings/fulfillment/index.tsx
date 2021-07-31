import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import ModalOrderServiceSubStatus from "component/modal/ModalOrderServiceSubStatus";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomTableStyle2 from "component/table/CustomTableStyle2";
import UrlConfig from "config/UrlConfig";
import {
  actionAddFulfillments,
  actionDeleteFulfillment,
  actionEditFulfillment,
  actionFetchListFulfillments,
} from "domain/actions/settings/fulfillment.action";
import { modalActionType } from "model/modal/modal.model";
import { VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  FulfillmentModel,
  FulfillmentResponseModel,
} from "model/response/fulfillment.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { StyledComponent } from "./styles";

const SettingFulfillment: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModalCreate, setIsShowModalCreate] = useState(false);
  const dispatch = useDispatch();
  const [listFulfillment, setListFulfillment] = useState<FulfillmentModel[]>(
    []
  );
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleServiceSubStatus, setModalSingleServiceSubStatus] =
    useState<FulfillmentModel | null>(null);

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
    limit: +(query.get("limit") || 3),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.FULFILLMENTS}?${queryParam}`);
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
          setIsShowModalCreate(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm trạng thái xử lý
      </Button>
    );
  };

  const gotoFirstPage = () => {
    if (params.page !== 1) {
      const newParams = {
        ...params,
        page: 1,
      };
      setParams({ ...newParams });
      let queryParam = generateQuery(newParams);
      history.replace(`${UrlConfig.FULFILLMENTS}?${queryParam}`);
    }
  };

  const handleForm = {
    create: (value: FulfillmentModel) => {
      dispatch(
        actionAddFulfillments(value, () => {
          setIsShowModalCreate(false);
          gotoFirstPage();
        })
      );
    },
    delete: (value: FulfillmentModel) => {
      dispatch(
        actionDeleteFulfillment(value, () => {
          setIsShowModalCreate(false);
          gotoFirstPage();
        })
      );
    },
    edit: (id: number, value: FulfillmentModel) => {
      dispatch(
        actionEditFulfillment(id, value, () => {
          setIsShowModalCreate(false);
          dispatch(
            actionFetchListFulfillments(
              params,
              (data: FulfillmentResponseModel) => {
                setListFulfillment(data.items);
                setTotal(data.metadata.total);
              }
            )
          );
        })
      );
    },
  };

  useEffect(() => {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    dispatch(
      actionFetchListFulfillments(params, (data: FulfillmentResponseModel) => {
        setListFulfillment(data.items);
        setTotal(data.metadata.total);
      })
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
        {listFulfillment && (
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
              dataSource={listFulfillment}
              columns={columnFinal()}
              rowKey={(item: VariantResponse) => item.id}
              onRow={(record: FulfillmentModel) => {
                return {
                  onClick: (event) => {
                    console.log("record", record);
                    setModalSingleServiceSubStatus(record);
                    setModalAction("edit");
                    setIsShowModalCreate(true);
                  }, // click row
                };
              }}
            />
          </Card>
        )}
        {isShowModalCreate && (
          <ModalOrderServiceSubStatus
            visible={isShowModalCreate}
            modalAction={modalAction}
            onCreate={(value) => handleForm.create(value)}
            onDelete={(value) => handleForm.delete(value)}
            onEdit={(id, value) => handleForm.edit(id, value)}
            onCancel={() => setIsShowModalCreate(false)}
            modalSingleServiceSubStatus={modalSingleServiceSubStatus}
          />
        )}
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingFulfillment;
