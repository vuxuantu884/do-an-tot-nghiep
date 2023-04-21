import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Progress, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import PrintComponent from "component/print";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
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
import EditNote from "screens/order-online/component/edit-note";
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
import HandoverFilter from "../component/filter/filter.component";
import { HandoverTransfer, HandoverType } from "../handover.config";
import { StyledComponent } from "./styled";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import exportIcon from "assets/icon/export.svg";
import { exportFile, getFile } from "service/other/export.service";
import ExportModal from "./Export.Modal";
import { HttpStatus } from "config/http-status.config";

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

  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const [columns, setColumns] = useState<Array<ICustomTableColumType<any>>>([]);

  useEffect(() => {
    setColumns([
      {
        title: "Mã biên bản",
        key: "id",
        dataIndex: "id",
        align: "center",
        visible: true,
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
                {moment(item.created_date).format("DD/MM/YYYY HH:mm")}
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
        dataIndex: "send",
        width: "100px",
        key: "send",
        align: "center",
        visible: true,
        render: (item: any) => {
          return item ? item : 0;
        },
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
        title: "Đơn huỷ đã gửi HVC",
        dataIndex: "cancelled_after_sent",
        width: "100px",
        key: "cancelled_after_sent",
        visible: false,
        align: "center",
        render: (item: any) => {
          return item ? item : 0;
        },
      },
      {
        title: "Đơn đang hoàn",
        dataIndex: "returning",
        width: "100px",
        key: "returning",
        visible: true,
        align: "center",
      },
      {
        title: "Đơn đã hoàn",
        dataIndex: "qreturned",
        key: "qreturned",
        width: "100px",
        visible: false,
        align: "center",
        render: (item: any) => {
          return item ? item : 0;
        },
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
    ]);
  }, [onUpdateNote]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const [allowCreateGoodsReceipt] = useAuthorization({
    acceptPermissions: [ORDER_PERMISSIONS.CREATE_GOODS_RECEIPT],
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
    setSelected([]);
  }, []);

  const handlePrintPack = useCallback(
    async (type: string) => {
      if (selected.length !== 0) {
        dispatch(showLoading());

        const ids: number[] = [...selected].map((p) => {
          return Number(p);
        });
        try {
          const response = await printHandOverService(ids, type);
          if (response.errors && response.errors.length) {
            response.errors.forEach((error) => {
              showError(error);
            });
          } else {
            const result: string[] = response.data.map((p: any) => p.html_content);
            setHtmlContent(result);
          }
        } catch {}
        dispatch(hideLoading());
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
      const query =
        !params?.store_ids || (params.store_ids && params.store_ids.length === 0)
          ? { ...params, store_ids: storeAccess.map((p) => p.id) }
          : { ...params };
      searchHandoverService(query)
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
  }, [dispatch, history, isLoadedMasterData, params, storeAccess]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);
  const [exportError, setExportError] = useState<string>("");

  const EXPORT_IDs = {
    allHandovers: 1,
    handoversOnThisPage: 2,
    selectedHandovers: 3,
    handoversFound: 4,
  };

  const onExport = useCallback(
    (optionExport) => {
      let newParams: any = { ...params };
      switch (optionExport) {
        case EXPORT_IDs.allHandovers:
          newParams = {};
          break;
        case EXPORT_IDs.handoversOnThisPage:
          newParams.page = data.metadata.page;
          newParams.limit = data.metadata.limit;
          break;
        case EXPORT_IDs.selectedHandovers:
          newParams = {
            ids: selected,
          };
          break;
        case EXPORT_IDs.handoversFound:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

      let queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "EXPORT_HANDOVER",
        hidden_fields: "",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(2);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch((error) => {
          setStatusExport(4);
          console.log("orders export file error", error);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    [
      params,
      EXPORT_IDs.allHandovers,
      EXPORT_IDs.handoversOnThisPage,
      EXPORT_IDs.selectedHandovers,
      EXPORT_IDs.handoversFound,
      data.metadata.page,
      data.metadata.limit,
      selected,
      listExportFile,
    ],
  );
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(
            Math.round((response.data.num_of_record / response.data.total) * 10000) / 100,
          );
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4);
            setExportError(response.data.message);
          }
        } else {
          setStatusExport(4);
        }
      });
    });
  }, [listExportFile]);
  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  useEffect(() => {
    if (isLoadedMasterData) {
      setLoadingMaster(false);
    }
  }, [isLoadedMasterData]);

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
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={() => {
                setShowExportModal(true);
              }}
            >
              Xuất file
            </Button>
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
            onShowColumnSetting={() => setShowSettingColumn(true)}
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
            columns={columnFinal}
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
          <ModalSettingColumn
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              console.log("data data", data);
              setShowSettingColumn(false);
              setColumns(data);
            }}
            data={columns}
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
        {showExportModal && (
          <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false);
              setExportProgress(0);
              setStatusExport(1);
            }}
            onOk={(optionExport) => onExport(optionExport)}
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            exportError={exportError}
            selected={selected.length ? true : false}
          />
        )}
      </StyledComponent>
      <PrintComponent htmlContent={htmlContent} setHtmlContent={setHtmlContent} />
    </ContentContainer>
  );
};

export default HandoverScreen;
