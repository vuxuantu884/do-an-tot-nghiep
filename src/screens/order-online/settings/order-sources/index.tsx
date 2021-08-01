import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import ModalOrderSource from "component/modal/ModalOrderSource";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomTableStyle2 from "component/table/CustomTableStyle2";
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
  console.log("query", query.get("page"));
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleOrderSource, setModalSingleOrderSource] =
    useState<OrderSourceModel | null>(null);

  const columns: Array<ICustomTableColumType<VariantResponse>> = [
    {
      title: "Nguồn đơn hàng",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Áp dụng cho đơn hàng",
      dataIndex: "is_active",
      visible: true,
      render: (value, row, index) => {
        if (value) {
          return <span style={{ color: "#27AE60" }}>Đang áp dụng</span>;
        }
        return <span style={{ color: "#E24343" }}>Ngưng áp dụng</span>;
      },
    },
    {
      title: "Mặc định",
      dataIndex: "is_default",
      visible: true,
      render: (value) => {
        if (value) {
          return <img src={iconChecked} alt="Mặc định" />;
        }
      },
    },
  ];
  const columnFinal = () => columns.filter((item) => item.visible === true);

  const history = useHistory();

  let [params, setParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.ORDER_SOURCES}?${queryParam}`);
    },
    [history, params]
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
        Thêm mới
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
    history.replace(`${UrlConfig.ORDER_SOURCES}?${queryParam}`);
  };

  const handleForm = {
    create: (value: OrderSourceModel) => {
      dispatch(
        actionAddOrderSource(value, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (id: number, value: OrderSourceModel) => {
      dispatch(
        actionEditOrderSource(id, value, () => {
          setIsShowModal(false);
          dispatch(
            actionFetchListOrderSources(
              params,
              (data: OrderSourceResponseModel) => {
                setListOrderSources(data.items);
                setTotal(data.metadata.total);
              }
            )
          );
        })
      );
    },
    delete: (value: OrderSourceModel) => {
      console.log("value", value);
      dispatch(
        actionDeleteOrderSource(value.id, () => {
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
      actionFetchListOrderSources(params, (data: OrderSourceResponseModel) => {
        console.log("data", data);
        setListOrderSources(data.items);
        setTotal(data.metadata.total);
      })
    );
  }, [dispatch, params]);

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
              dataSource={listOrderSources}
              columns={columnFinal()}
              rowKey={(item: VariantResponse) => item.id}
              onRow={(record: OrderSourceModel) => {
                return {
                  onClick: (event) => {
                    console.log("record", record);
                    setModalAction("edit");
                    setModalSingleOrderSource(record);
                    setIsShowModal(true);
                  }, // click row
                };
              }}
            />
          </Card>
        )}
        <ModalOrderSource
          visible={isShowModal}
          modalAction={modalAction}
          onCreate={(value) => handleForm.create(value)}
          onEdit={(id, value) => handleForm.edit(id, value)}
          onDelete={(value) => handleForm.delete(value)}
          onCancel={() => setIsShowModal(false)}
          modalSingleOrderSource={modalSingleOrderSource}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default OrderSources;
