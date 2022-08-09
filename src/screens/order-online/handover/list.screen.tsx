import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Progress, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import PrintComponent from "component/print";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { DeliveryServicesGetList, getChannels } from "domain/actions/order/order.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { HandoverNoteRequest } from "model/handover/handover.request";
import { HandoverResponse } from "model/handover/handover.response";
import { HandoverSearchRequest } from "model/handover/handover.search";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import moment from "moment";
import queryString from "query-string";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  deleteHandoverService,
  printHandOverService,
  searchHandoverService,
  updateNoteHandoverService,
} from "service/handover/handover.service";
import {
  generateQuery,
  handleFetchApiError,
  haveAccess,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import EditNote from "../component/edit-note";
import "../pack/styles.scss";
import HandoverFilter from "./component/filter/filter.component";
import { HandoverTransfer, HandoverType } from "./handover.config";
import { StyledComponent } from "./list.styles";

interface MasterDataLoad<T> {
  isLoad: boolean;
  data: T;
}

interface DeleteMessage {
  success: boolean;
  id: string;
  message: string;
}

const typePrint = {
  simple: "simple",
  detail: "detail",
};

const HandoverScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  let initQuery: HandoverSearchRequest = {
    from_created_date: null,
    to_created_date: null,
  };

  let urlQuery: HandoverSearchRequest = queryString.parse(history.location.search, {
    arrayFormat: "separator",
  });
  let dataQuery: HandoverSearchRequest = {
    ...initQuery,
    ...urlQuery,
    store_ids:
      urlQuery &&
      urlQuery.store_ids &&
      (urlQuery.store_ids instanceof Array ? urlQuery.store_ids : [urlQuery.store_ids]),
    delivery_service_provider_ids:
      urlQuery &&
      urlQuery.delivery_service_provider_ids &&
      (urlQuery.delivery_service_provider_ids instanceof Array
        ? urlQuery.delivery_service_provider_ids
        : [urlQuery.delivery_service_provider_ids]),
    channel_ids:
      urlQuery &&
      urlQuery.channel_ids &&
      (urlQuery.channel_ids instanceof Array ? urlQuery.channel_ids : [urlQuery.channel_ids]),
    types:
      urlQuery &&
      urlQuery.types &&
      (urlQuery.types instanceof Array ? urlQuery.types : [urlQuery.types]),
  };

  let [params, setPrams] = useState<HandoverSearchRequest>(dataQuery);

  let [deletedMessage, setDeleteMessage] = useState<Array<DeleteMessage>>([]);

  const [selected, setSelected] = useState<Array<string>>([]);

  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);

  const [visibleDeleteConfirm, setVisibleDeleteConfirm] = useState<boolean>(false);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [data, setData] = useState<PageResponse<HandoverResponse>>({
    items: [],
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
  });
  const [storeData, setStoreData] = useState<MasterDataLoad<Array<StoreResponse>>>({
    isLoad: false,
    data: [],
  });

  const [loadingFilter, setLoadingFilter] = useState<boolean>(false);

  const [loadingMaster, setLoadingMaster] = useState<boolean>(true);

  const [deliveryServicesData, setDeleveryServiceData] = useState<
    MasterDataLoad<Array<DeliveryServiceResponse>>
  >({
    isLoad: false,
    data: [],
  });

  const [channelData, setChannelData] = useState<MasterDataLoad<Array<ChannelsResponse>>>({
    isLoad: false,
    data: [],
  });

  const [htmlContent, setHtmlContent] = useState<string | string[]>("");

  const onSelectedChange = useCallback(
    (selectedRow: Array<HandoverResponse>) => {
      let order = selectedRow.filter(function (el) {
        return el !== undefined;
      });
      setSelected(order.map((value) => value.id.toString()));
    },
    [setSelected],
  );

  const onUpdateNote = useCallback(
    (id: number, newNote: string) => {
      dispatch(showLoading());
      let request: HandoverNoteRequest = {
        note: newNote,
      };
      updateNoteHandoverService(id, request)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            let index = data.items.findIndex((value) => {
              return value.id.toString() === id.toString();
            });
            if (index !== -1) {
              data.items[index] = { ...data.items[index], note: newNote };
              data.items = [...data.items];
              setData({ ...data });
            }
          }
        })
        .finally(() => dispatch(hideLoading()));
    },
    [data, dispatch],
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Mã biên bản",
          key: "id",
          dataIndex: "id",
          align: "center",
          fixed: "left",
          width: "150px",
          render: (data: number, item: HandoverResponse, index: number) => {
            let service_name = item.delivery_service_provider;
            if (item.delivery_service_provider_id === -1) {
              service_name = "TVC";
            }
            return (
              <React.Fragment>
                <Link to={`${UrlConfig.HANDOVER}/${data}`}>{item.code}</Link>
                <div style={{ fontSize: "0.86em", lineHeight: "1.25" }}>
                  {moment(item.created_date).format("DD/MM/YYYY HH:ss")}
                </div>
                <div className="shipment-details">{service_name}</div>
              </React.Fragment>
            );
          },
        },
        {
          title: "Tên cửa hàng",
          dataIndex: "store",
          key: "store",
          width: "150px",
          visible: true,
          align: "center",
        },
        {
          title: "Loại",
          key: "type",
          dataIndex: "type",
          width: "120px",
          visible: true,
          align: "center",
          render: (data: string, item: HandoverResponse, index: number) => {
            return (
              <div>
                <p style={{ marginBottom: 0 }}>
                  {data === HandoverTransfer ? HandoverType[0].display : HandoverType[1].display}
                </p>
                {item.channel_id !== -1 && (
                  <p style={{ color: "#2A2A86", marginBottom: 0 }}>({item.channel})</p>
                )}
              </div>
            );
          },
        },
        {
          title: "SL SP",
          dataIndex: "quantity",
          key: "quantity",
          width: "100px",
          visible: true,
          align: "center",
        },
        {
          title: "Số đơn",
          dataIndex: "total",
          key: "total",
          width: "100px",
          visible: true,
          align: "center",
        },
        {
          title: "Đơn gửi HVC",
          dataIndex: "total",
          width: "100px",
          key: "total",
          align: "center",
        },
        {
          title: "Đơn đang chuyển",
          dataIndex: "shipping",
          width: "100px",
          key: "shipping",
          visible: true,
          align: "center",
        },
        {
          title: "Đơn chưa lấy",
          dataIndex: "not_received",
          key: "not_received",
          width: "100px",
          visible: true,
          align: "center",
        },
        {
          title: "Đang đang hoàn",
          dataIndex: "returning",
          key: "returning",
          width: "100px",
          visible: true,
          align: "center",
        },
        {
          title: "Đơn thành công",
          dataIndex: "shipped",
          width: "100px",
          key: "shipped",
          visible: true,
          align: "center",
        },
        {
          title: "Ghi chú",
          dataIndex: "note",
          key: "note",
          visible: true,
          width: "200px",
          align: "left",
          render: (value: string, record: HandoverResponse) => (
            <div className="orderNotes">
              <div className="inner">
                <div className="single">
                  <EditNote
                    note={value}
                    color={"#2a2a86"}
                    onOk={(newNote) => onUpdateNote(record.id, newNote)}
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Người tạo",
          dataIndex: "created_by",
          key: "created_by",
          visible: true,
          width: "150px",
          align: "center",
          render: (item: string, record: HandoverResponse, index) => (
            <Link to={`${UrlConfig.ACCOUNTS}/${item}`}>{record.created_name}</Link>
          ),
        },
      ] as Array<ICustomTableColumType<HandoverResponse>>,
    [onUpdateNote],
  );

  const [allowCreateGoodsReceipt] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.CREATE_GOODS_RECEIPT],
    not: false,
  });

  const onChangePage = useCallback(
    (page: number, size?: number) => {
      setPrams({
        ...params,
        page: page,
        limit: size,
      });
    },
    [params],
  );

  const onFilter = useCallback((request: HandoverSearchRequest) => {
    setPrams(request);
  }, []);

  const handlePrintPack = useCallback(
    (type: string) => {
      if (selected.length !== 0) {
        dispatch(showLoading());

        const ids: number[] = [...selected].map((p) => {
          return Number(p);
        });
        printHandOverService(ids, type).then((response) => {
          if (isFetchApiSuccessful(response)) {
            dispatch(hideLoading());
            if (response.data) {
              const result: string[] = response.data.map((p: any) => p.html_content);
              setHtmlContent(result);
            }
          } else {
            handleFetchApiError(response, "In biên bản bàn giao", dispatch);
          }
        });
      }
    },
    [dispatch, selected],
  );

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          handlePrintPack(typePrint.simple);
          break;
        case 2:
          showWarning("Đang bảo trì");
          //handlePrintPack(typePrint.detail);
          break;
        case 3:
          setVisibleDeleteConfirm(true);
          break;
      }
    },
    [handlePrintPack],
  );

  const isLoadedMasterData = useMemo(() => {
    return storeData.isLoad && deliveryServicesData.isLoad;
  }, [deliveryServicesData.isLoad, storeData.isLoad]);

  const getSubTitle = useMemo(() => {
    if (selected.length === 1) {
      return `Bạn có chắc chắn xóa biên bản ${selected[0]} ?`;
    }
    if (selected.length > 1) {
      return `Bạn có chắc chắn xóa ${selected.length} biên bản bàn giao?`;
    }
    return "";
  }, [selected]);

  useEffect(() => {
    if (!deliveryServicesData.isLoad) {
      dispatch(
        DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
          setDeleveryServiceData({
            isLoad: true,
            data: response,
          });
        }),
      );
    }
  }, [deliveryServicesData.isLoad, dispatch]);

  useEffect(() => {
    if (!isLoadedMasterData) {
      dispatch(showLoading());
    }
  }, [dispatch, isLoadedMasterData]);

  useEffect(() => {
    if (!storeData.isLoad) {
      dispatch(
        StoreGetListAction((dataStore) => {
          setStoreData({
            isLoad: true,
            data: dataStore,
          });
        }),
      );
    }
  }, [dispatch, storeData.isLoad]);

  useEffect(() => {
    if (!channelData.isLoad) {
      dispatch(
        getChannels(2, (data: ChannelsResponse[]) => {
          setChannelData({
            isLoad: false,
            data: data,
          });
        }),
      );
    }
  }, [channelData.isLoad, dispatch]);

  const storeAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (storeData.data && storeData.data.length) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = storeData.data.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
      } else {
        newData = storeData.data;
      }
    }
    return newData;
  }, [storeData.data, userReducer.account]);

  const deleteOne = () => {
    if (selected.length === 1) {
      dispatch(showLoading());
      deleteHandoverService(selected[0])
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess(`Xóa biên bản ${selected[0]} thành công`);
          } else {
            handleFetchApiError(response, "Api xóa biên bản", dispatch);
          }
        })
        .catch((e) => {
          showError("Có lỗi api xóa biên bản");
        })
        .finally(() => {
          dispatch(hideLoading());
          setSelected([]);
        });
    }
  };

  const deleteMany = () => {
    if (selected.length > 1) {
      setVisibleDelete(true);
      setDeleteMessage([]);
      selected.forEach((code) => {
        deleteHandoverService(code)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              deletedMessage.push({
                success: true,
                id: code,
                message: "Xóa thành công",
              });
              setDeleteMessage([...deletedMessage]);
            } else {
              deletedMessage.push({
                success: false,
                id: code,
                message: response.errors.length > 0 ? response.errors[0] : response.message,
              });
              setDeleteMessage([...deletedMessage]);
            }
          })
          .catch((e) => {
            deletedMessage.push({
              success: false,
              id: code,
              message: "Có lỗi api xóa đơn",
            });
            setDeleteMessage([...deletedMessage]);
          });
      });
    }
  };

  const onCloseModal = () => {
    setSelected([]);
    setDeleteMessage([]);
    setVisibleDelete(false);
    setPrams({ ...params });
  };

  useEffect(() => {
    if (isLoadedMasterData) {
      dispatch(hideLoading());
      setLoadingFilter(true);
      setLoadingMaster(false);
      searchHandoverService(params)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setData(response.data);
            setLoadingFilter(false);
            let query = generateQuery(params);
            history.replace(`${UrlConfig.HANDOVER}?${query}`);
          }
        })
        .catch()
        .finally(() => {});
    }
  }, [dispatch, history, isLoadedMasterData, params]);

  useEffect(() => {
    if (isLoadedMasterData) {
      setLoadingMaster(false);
    }
  }, [isLoadedMasterData]);

  console.log("selected", selected);

  return (
    <ContentContainer
      title="Biên bản bàn giao"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Đơn hàng",
          path: UrlConfig.ORDER,
        },
        {
          name: "Biên bản bàn giao",
        },
      ]}
      extra={
        <Row>
          <Space size={12} style={{ marginLeft: "10px" }}>
            <ButtonCreate
              size="small"
              path={`${UrlConfig.HANDOVER}/create`}
              disabled={!allowCreateGoodsReceipt}
            />
          </Space>
        </Row>
      }
    >
      <StyledComponent>
        <Card>
          <HandoverFilter
            channels={channelData.data}
            loadingMaster={loadingMaster}
            loadingFilter={loadingFilter}
            stores={storeAccess}
            deliveryServices={deliveryServicesData.data}
            actions={[
              {
                id: 1,
                name: "In biên bản",
                icon: <PrinterOutlined />,
                disabled: selected.length === 0,
              },
              // {
              //   id: 2,
              //   name: "In biên bản đầy đủ",
              //   icon: <PrinterOutlined />,
              //   disabled: selected.length === 0,
              // },
              {
                id: 3,
                name: "Xóa biên bản",
                icon: <DeleteOutlined />,
                color: "#E24343",
                disabled: selected.length === 0,
              },
            ]}
            onMenuClick={onMenuClick}
            params={params}
            onFilter={onFilter}
          />
          <CustomTable
            scroll={{
              x: 1500,
            }}
            sticky={{
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
            }}
            bordered
            isRowSelection
            dataSource={data.items}
            selectedRowKey={selected}
            onSelectedChange={onSelectedChange}
            columns={columns}
            rowKey={(item) => item.id.toString()}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onChangePage,
              onShowSizeChange: onChangePage,
            }}
          />
        </Card>
        <Modal
          width="620px"
          visible={visibleDelete}
          title="Xóa biên bản"
          okText="Xác nhận"
          className="progress"
          cancelText="Hủy"
          closable={false}
          maskClosable={false}
          footer={
            <div>
              <Button
                disabled={selected.length !== deletedMessage.length}
                onClick={onCloseModal}
                htmlType="submit"
                type="primary"
              >
                Xác nhận
              </Button>
            </div>
          }
        >
          <div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div>Tổng cộng</div>
                <div className="total-count">{selected.length}</div>
              </div>

              <div style={{ flex: 1, textAlign: "center" }}>
                <div>Đã xử lý</div>
                <div>{deletedMessage.length}</div>
              </div>

              <div style={{ flex: 1, textAlign: "center", color: "green" }}>
                <div>Thành công</div>
                <div>{deletedMessage.filter((msg) => msg.success).length}</div>
              </div>

              <div style={{ flex: 1, textAlign: "center", color: "red" }}>
                <div>Lỗi</div>
                <div>{deletedMessage.filter((msg) => !msg.success).length}</div>
              </div>
            </div>

            <Progress
              status={`${
                (deletedMessage.length / selected.length) * 100 === 100 ? "normal" : "active"
              }`}
              percent={(deletedMessage.length / selected.length) * 100}
              style={{ marginTop: 20 }}
              strokeColor="#2A2A86"
            />
            {deletedMessage.length > 0 && (
              <div style={{ background: "#d8d8d8", marginTop: 20, padding: 10, borderRadius: 10 }}>
                {deletedMessage.map((item, index) => (
                  <div style={{ display: "flex", marginBottom: 5 }} key={item.id}>
                    <div style={{ width: 60 }}>{item.id}</div>
                    <div style={{ color: item.success ? "green" : "red" }}>{item.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
        <ModalDeleteConfirm
          onCancel={() => setVisibleDeleteConfirm(false)}
          onOk={() => {
            if (selected.length === 0) {
              return;
            }
            setVisibleDeleteConfirm(false);
            if (selected.length === 1) {
              deleteOne();
            } else {
              deleteMany();
            }
          }}
          title="Xóa biên bản"
          subTitle={getSubTitle}
          visible={visibleDeleteConfirm}
        />
      </StyledComponent>
      <PrintComponent htmlContent={htmlContent} setHtmlContent={setHtmlContent} />
    </ContentContainer>
  );
};

export default HandoverScreen;
