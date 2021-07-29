import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import ModalAddOrderSource from "component/modal/ModalAddOrderSource";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomTableStyle2 from "component/table/CustomTableStyle2";
import UrlConfig from "config/UrlConfig";
import { actionFetchListOrderSources } from "domain/actions/settings/order-sources.action";
import { modalActionType } from "model/modal/modal.model";
import { VariantResponse } from "model/product/product.model";
import {
  OrderSourceModel,
  OrderSourceModelResponse
} from "model/response/order/order-source.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import iconChecked from "./images/iconChecked.svg";
import { StyledComponent } from "./styles";

const OrderSources: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModalCreate, setIsShowModalCreate] = useState(false);
  const dispatch = useDispatch();
  const [listOrderSources, setListOrderSources] = useState<OrderSourceModel[]>(
    []
  );
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  console.log('query', query.get('page'))
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
          return "Đang áp dụng";
        }
        return "Ngưng áp dụng";
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
    page: +(query.get('page') || 1),
    limit: +(query.get('limit') || 30),
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
          setIsShowModalCreate(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm mới
      </Button>
    );
  };

  const handleCreateOrderSource = (value: OrderSourceModel) => {
    console.log('value', value)
    // createOrderSourceService(value)
    //   .then((response) => {
    //     console.log("response", response);
    //     switch (response.code) {
    //       case HttpStatus.SUCCESS:
    //         params.page = 1;
    //         setParams({ ...params });
    //         break;
    //       case HttpStatus.UNAUTHORIZED:
    //         dispatch(unauthorizedAction());
    //         break;
    //       default:
    //         response.errors.forEach((e) => showError(e));
    //         break;
    //     }
    //   })
    //   .catch((error) => {
    //     console.log("error", error);
    //   })
    //   .finally(() => {
    //     setIsShowModalCreate(false);
    //   });
  };

  useEffect(() => {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    dispatch(
      actionFetchListOrderSources(params, (data: OrderSourceModelResponse) => {
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
          <Card>
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
                    setModalSingleOrderSource(record);
                    setModalAction("edit");
                    setIsShowModalCreate(true);
                  }, // click row
                };
              }}
            />
          </Card>
        )}
        {isShowModalCreate && (
          <ModalAddOrderSource
            visible={isShowModalCreate}
            modalAction={modalAction}
            onUpdate={(value) => handleCreateOrderSource(value)}
            onCreate={(value) => handleCreateOrderSource(value)}
            onCancel={() => setIsShowModalCreate(false)}
            modalSingleOrderSource={modalSingleOrderSource}
          />
        )}
      </ContentContainer>
    </StyledComponent>
  );
};

export default OrderSources;
