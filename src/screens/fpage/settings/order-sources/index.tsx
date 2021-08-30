import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import FormOrderSource from "component/forms/FormOrderSource";
import CustomModal from "component/modal/CustomModal";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import {
  actionAddOrderSource,
  actionDeleteOrderSource,
  actionEditOrderSource,
  actionFetchListOrderSources,
} from "domain/actions/settings/order-sources.action";
import { modalActionType } from "model/modal/modal.model";
import { VariantResponse } from "model/product/product.model";
import {
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import iconChecked from "./images/iconChecked.svg";
import { StyledComponent } from "./styles";

const OrderSources: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const dispatch = useDispatch();
  const [listOrderSources, setListOrderSources] = useState<OrderSourceModel[]>(
    []
  );
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleOrderSource, setModalSingleOrderSource] =
    useState<OrderSourceModel | null>(null);

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "Nguồn đơn hàng",
      dataIndex: "name",
      visible: true,
      className: "columnTitle",
      width: "40%",
      render: (value, row, index) => {
        if (value) {
          return (
            <span
              title={value}
              style={{ wordWrap: "break-word", wordBreak: "break-word" }}
              className="title text"
            >
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Áp dụng cho đơn hàng",
      dataIndex: "active",
      visible: true,
      width: "40%",
      render: (value, row, index) => {
        if (value) {
          return <span style={{ color: "#27AE60" }}>Đang áp dụng</span>;
        }
        return <span style={{ color: "#E24343" }}>Ngưng áp dụng</span>;
      },
    },
    {
      title: "Mặc định",
      dataIndex: "default",
      visible: true,
      width: "20%",
      render: (value) => {
        if (value) {
          return <img src={iconChecked} alt="Mặc định" />;
        }
      },
    },
  ];
  const columnFinal = () => columns.filter((item) => item.visible === true);

  const history = useHistory();

  let [queryParams, setQueryParams] = useState({
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
      setQueryParams({ ...queryParams });
      history.replace(`${UrlConfig.ORDER_SOURCES}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const createOrderSourceHtml = () => {
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
        Thêm nguồn đơn hàng
      </Button>
    );
  };

  const gotoFirstPage = () => {
    const newParams = {
      ...queryParams,
      page: 1,
    };
    setQueryParams({ ...newParams });
    let queryParam = generateQuery(newParams);
    history.replace(`${UrlConfig.ORDER_SOURCES}?${queryParam}`);
    window.scrollTo(0, 0);
  };

  const handleForm = {
    create: (formValue: OrderSourceModel) => {
      dispatch(
        actionAddOrderSource(formValue, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValue: OrderSourceModel) => {
      if (modalSingleOrderSource) {
        dispatch(
          actionEditOrderSource(modalSingleOrderSource.id, formValue, () => {
            dispatch(
              actionFetchListOrderSources(
                queryParams,
                (data: OrderSourceResponseModel) => {
                  setListOrderSources(data.items);
                }
              )
            );
            setIsShowModal(false);
          })
        );
      }
    },
    delete: () => {
      if (modalSingleOrderSource) {
        dispatch(
          actionDeleteOrderSource(modalSingleOrderSource.id, () => {
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
      actionFetchListOrderSources(
        queryParams,
        (data: OrderSourceResponseModel) => {
          setListOrderSources(data.items);
          setTotal(data.metadata.total);
          setTableLoading(false);
        }
      )
    );
  }, [dispatch, queryParams]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Nguồn đơn hàng"
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
            name: "Nguồn đơn hàng",
          },
        ]}
        extra={createOrderSourceHtml()}
      >
        {listOrderSources && (
          <Card style={{ padding: "35px 15px" }}>
            <CustomTable
              isLoading={tableLoading}
              showColumnSetting={false}
              scroll={{ x: 1080 }}
              pagination={{
                pageSize: queryParams.limit,
                total: total,
                current: queryParams.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              dataSource={listOrderSources}
              columns={columnFinal()}
              rowKey={(item: VariantResponse) => item.id}
              onRow={(record: OrderSourceModel) => {
                return {
                  onClick: () => {
                    setModalAction("edit");
                    setModalSingleOrderSource(record);
                    setIsShowModal(true);
                  }, // click row
                };
              }}
            />
          </Card>
        )}
        <CustomModal
          visible={isShowModal}
          onCreate={(formValue: OrderSourceModel) =>
            handleForm.create(formValue)
          }
          onEdit={(formValue: OrderSourceModel) => handleForm.edit(formValue)}
          onDelete={() => handleForm.delete()}
          onCancel={() => setIsShowModal(false)}
          modalAction={modalAction}
          componentForm={FormOrderSource}
          formItem={modalSingleOrderSource}
          deletedItemTitle={modalSingleOrderSource?.name}
          modalTypeText="Nguồn đơn hàng"
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default OrderSources;
