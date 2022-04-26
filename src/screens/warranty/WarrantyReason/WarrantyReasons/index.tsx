import { PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Menu, Switch } from "antd";
import { ReactComponent as DeleteIcon } from "assets/icon/deleteIcon.svg";
import MoreAction from "assets/icon/more-action.svg";
import ContentContainer from "component/container/content.container";
import ModalConfirm from "component/modal/ModalConfirm";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useFetchWarrantyReasons from "hook/warranty/useFetchWarrantyReasons";
import {
  GetWarrantyReasonsParamModel,
  UpdateWarrantyReasonParamsModel,
  WarrantyReasonModel,
  WarrantyReasonStatusModel,
  WarrantyReasonsValueUpdateGetModel,
} from "model/warranty/warranty.model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import WarrantyReasonFilter from "screens/warranty/components/filter/WarrantyReasonFilter";
import {
  deleteWarrantyReasonService,
  deleteWarrantyReasonsService,
  updateWarrantyReasonsActiveService,
  updateWarrantyReasonService,
} from "service/warranty/warranty.service";
import {
  changeMetaDataAfterDelete,
  formatCurrency,
  generateQuery,
  goToTopPage,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import ModalWarrantyReasonsCustomerFee from "../components/modal/ModalWarrantyReasonsCustomerFee";
import ModalWarrantyReasonsPrice from "../components/modal/ModalWarrantyReasonsPrice";
import { StyledComponent } from "./styles";

type PropTypes = {
  location: any;
};

type DeleteType = "single" | "multi";

let typeOfDelete: DeleteType = "single";
let typeOfActive: WarrantyReasonStatusModel | null = null;

function WarrantyReasons(props: PropTypes) {
  const { location } = props;

  const history = useHistory();
  const dispatch = useDispatch();
  const rowSelected = useRef<{ record: WarrantyReasonModel; index: number }>();
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isCustomerFeeModalVisible, setIsCustomerFeeModalVisible] = useState(false);
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);

  const [confirmDeleteSubTitle, setConfirmDeleteSubTitle] = useState<React.ReactNode>("");
  const [confirmSubTitle, setConfirmSubTitle] = useState<React.ReactNode>("");
  const [countForceFetchData, setCountForceFetchData] = useState(0);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);

  const [selectedData, setSelectedData] = useState<WarrantyReasonsValueUpdateGetModel>({
    price: undefined,
    customer_fee: undefined,
  });

  const [columns, setColumns] = useState<Array<ICustomTableColumType<WarrantyReasonModel>>>([]);

  const rowClicked = (record: WarrantyReasonModel, index: number) => {
    rowSelected.current = { record, index };
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const initQuery: GetWarrantyReasonsParamModel = {
    page: 1,
    limit: 30,
    ids: [],
    from_created_date: undefined,
    to_created_date: undefined,
    name: undefined,
    status: undefined,
  };
  const [query, setQuery] = useState<GetWarrantyReasonsParamModel>(initQuery);

  const getWarrantyReasons = useFetchWarrantyReasons(
    initQuery,
    location,
    countForceFetchData,
    setQuery
  );
  let { warrantyReasons, metadata } = getWarrantyReasons;

  const [metaDataShow, setMetaDataShow] = useState({
    limit: 0,
    page: 0,
    total: 0,
  });

  const [data, setData] = useState<WarrantyReasonModel[]>([]);

  const ACTION_ID = {
    delete: 1,
    active: 2,
    inactive: 3,
  };

  const actions: Array<MenuAction> = useMemo(
    () => [
      {
        id: ACTION_ID.delete,
        name: "Xóa",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
      {
        id: ACTION_ID.active,
        name: "Kích hoạt",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
      {
        id: ACTION_ID.inactive,
        name: "Ngừng kích hoạt",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
    ],
    [ACTION_ID.active, ACTION_ID.delete, ACTION_ID.inactive, selectedRowKeys.length]
  );

  const onSelectedChange = (selectedRow: WarrantyReasonModel[]) => {
    console.log("selectedRowKeys changed: ", selectedRow);
    const selectedRowIds = selectedRow.filter((row) => row).map((row) => row?.id);
    setSelectedRowKeys(selectedRowIds);
  };

  const handleUpdateCustomerFee = useCallback(
    (warrantyReasonId: number, body: UpdateWarrantyReasonParamsModel, values: any) => {
      setIsCustomerFeeModalVisible(false);
      dispatch(showLoading());
      updateWarrantyReasonService(warrantyReasonId, body)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật phí báo khách thành công!");
            const index = data.findIndex((single) => single.id === warrantyReasonId);
            if (index > -1) {
              let dataResult = [...data];
              dataResult[index].customer_fee = values.customer_fee || null;
              setData(dataResult);
            }
            console.log("response", response);
          } else {
            handleFetchApiError(response, "Cập nhật phí báo khách", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [data, dispatch]
  );

  const handleUpdatePrice = useCallback(
    (warrantyReasonId: number, body: UpdateWarrantyReasonParamsModel, values: any) => {
      setIsPriceModalVisible(false);
      dispatch(showLoading());
      updateWarrantyReasonService(warrantyReasonId, body)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật phí thực tế thành công!");
            const index = data.findIndex((single) => single.id === warrantyReasonId);
            if (index > -1) {
              let dataResult = [...data];
              dataResult[index].price = values.price || null;
              setData(dataResult);
            }
            console.log("response", response);
          } else {
            handleFetchApiError(response, "Cập nhật phí thực tế", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch, data]
  );

  const handleUpdateWarrantyReason = useCallback(
    (warrantyReasonId: number, body: UpdateWarrantyReasonParamsModel) => {
      dispatch(showLoading());
      updateWarrantyReasonService(warrantyReasonId, body)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật lý do bảo hành thành công");
          } else {
            handleFetchApiError(response, "Cập nhật lý do bảo hành", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch]
  );

  const handleOkConfirmModal = () => {
    if (!typeOfActive) {
      return;
    }
    setIsConfirmModalVisible(false);
    dispatch(showLoading());
    updateWarrantyReasonsActiveService(selectedRowKeys, typeOfActive)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật lý do bảo hành thành công!");
          let dataResult = [...data].map((single) => {
            if (!typeOfActive) {
              return single;
            }
            if (selectedRowKeys.includes(single.id)) {
              single.status = typeOfActive;
            }
            return single;
          });
          setData(dataResult);
          changeMetaDataAfterDelete(metadata, setMetaDataShow, selectedRowKeys.length);
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật lý do bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteSingle = () => {
    if (!rowSelected.current?.record.id) {
      return;
    }
    setIsDeleteConfirmModalVisible(false);
    dispatch(showLoading());
    deleteWarrantyReasonService(rowSelected.current?.record.id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa lý do bảo hành thành công!");
          let dataResult = data.filter((single) => single.id !== rowSelected.current?.record.id);
          setData(dataResult);
          changeMetaDataAfterDelete(metadata, setMetaDataShow, 1);
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Xóa lý do bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteMulti = () => {
    deleteWarrantyReasonsService(selectedRowKeys)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa lý do bảo hành thành công!");
          let dataResult = [...data].filter((single) => !selectedRowKeys.includes(single.id));
          setData(dataResult);
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Xóa lý do bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkDeleteModal = () => {
    setIsDeleteConfirmModalVisible(false);
    dispatch(showLoading());
    switch (typeOfDelete) {
      case "single":
        handleDeleteSingle();
        break;
      case "multi":
        handleDeleteMulti();
        break;
      default:
        break;
    }
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTION_ID.delete:
          typeOfDelete = "multi";
          setConfirmDeleteSubTitle(
            <React.Fragment>
              Bạn có chắc chắn muốn xóa các <strong>lý do bảo hành</strong> đã chọn ?
            </React.Fragment>
          );
          setIsDeleteConfirmModalVisible(true);
          break;
        case ACTION_ID.active:
          typeOfActive = WarrantyReasonStatusModel.ACTIVE;
          setConfirmSubTitle(
            <React.Fragment>
              Bạn có chắc chắn muốn kích hoạt các <strong>lý do bảo hành</strong> đã chọn ?
            </React.Fragment>
          );
          setIsConfirmModalVisible(true);
          break;
        case ACTION_ID.inactive:
          typeOfActive = WarrantyReasonStatusModel.INACTIVE;
          setConfirmSubTitle(
            <React.Fragment>
              Bạn có chắc chắn muốn ngừng kích hoạt các <strong>lý do bảo hành</strong> đã chọn ?
            </React.Fragment>
          );
          setIsConfirmModalVisible(true);
          break;
        default:
          break;
      }
    },
    [ACTION_ID.active, ACTION_ID.delete, ACTION_ID.inactive]
  );

  const onPageChange = useCallback(
    (page, size) => {
      query.page = page;
      query.limit = size;
      let queryParam = generateQuery(query);
      setQuery(query);
      history.push(`${location.pathname}?${queryParam}`);
      goToTopPage();
    },
    [history, location.pathname, query]
  );

  const forceFetchData = useCallback(() => {
    setCountForceFetchData(countForceFetchData + 1);
  }, [countForceFetchData]);

  const onFilter = useCallback(
    (values) => {
      values.from_created_date = values.created_date;
      values.to_created_date = values.created_date;
      values.from_appointment_date = values.appointment_date;
      values.to_appointment_date = values.appointment_date;
      let newParams = {
        ...query,
        ...values,
        page: 1,
        created_date: undefined,
        appointment_date: undefined,
      };
      setQuery(newParams);
      let currentParam = generateQuery(query);
      let queryParam = generateQuery(newParams);
      if (currentParam === queryParam) {
        forceFetchData();
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
      // setSelectedRow([]);
      // setSelectedRowKeys([]);
      // setSelectedRowCodes([]);
    },
    [forceFetchData, history, location.pathname, query]
  );

  useEffect(() => {
    setData(warrantyReasons);
  }, [warrantyReasons]);

  const initColumns: ICustomTableColumType<WarrantyReasonModel>[] = useMemo(() => {
    // if (data.items.length === 0) {
    //   return [];
    // }
    return [
      {
        title: "Lý do",
        align: "left",
        dataIndex: "customer",
        key: "customer",
        width: "13%",
        render: (value, record: WarrantyReasonModel) => {
          return (
            <div>
              <Link to={`${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}/${record.id}`}>
                <b>{record?.name}</b>
              </Link>
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Phí thực tế",
        align: "right",
        dataIndex: "price",
        key: "price",
        width: "13%",
        render: (value, record: WarrantyReasonModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsPriceModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  price: record.price || undefined,
                });
              }}
            >
              {value ? (
                <b>{formatCurrency(value)}</b>
              ) : (
                <Button
                  icon={<AiOutlinePlus color={primaryColor} />}
                  className="fee-icon addIcon"
                />
              )}
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Phí báo khách",
        align: "right",
        dataIndex: "customer_fee",
        key: "customer_fee",
        width: "13%",
        render: (value, record: WarrantyReasonModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsCustomerFeeModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  customer_fee: record.customer_fee || undefined,
                });
              }}
            >
              {value ? (
                <b>{formatCurrency(value)}</b>
              ) : (
                <Button
                  icon={<AiOutlinePlus color={primaryColor} />}
                  className="fee-icon addIcon"
                />
              )}
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Trạng thái hoạt động",
        dataIndex: "status",
        key: "status",
        width: "15%",
        align: "center",
        render: (value, record: WarrantyReasonModel) => {
          return (
            <Switch
              defaultChecked={value === WarrantyReasonStatusModel.ACTIVE}
              onChange={(value) => {
                console.log("value", value);
                const request: UpdateWarrantyReasonParamsModel = {
                  ...record,
                  price: record.price || undefined,
                  customer_fee: record.customer_fee || undefined,
                  status: value
                    ? WarrantyReasonStatusModel.ACTIVE
                    : WarrantyReasonStatusModel.INACTIVE,
                };
                handleUpdateWarrantyReason(record.id, request);
              }}
            />
          );
        },
        visible: true,
      },
      {
        title: "Người tạo",
        dataIndex: "created_name",
        key: "created_name",
        width: "12%",
        render: (value, record: WarrantyReasonModel) => {
          return <div>{`${record.created_by} - ${record.created_name}`}</div>;
        },
        visible: true,
      },
      {
        title: "",
        width: "3.5%",
        align: "center",
        render: (text, record: WarrantyReasonModel, index) => {
          return (
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              overlay={
                <Menu>
                  <Menu.Item
                    icon={<DeleteIcon height={30} />}
                    key={"delete"}
                    onClick={() => {
                      rowClicked(record, index);
                      setConfirmDeleteSubTitle(
                        <React.Fragment>
                          Bạn có chắc chắn muốn xóa: <strong>Lý do bảo hành</strong> có tên{" "}
                          <strong>{`"${record.name}"`}</strong> ?
                        </React.Fragment>
                      );
                      setIsDeleteConfirmModalVisible(true);
                    }}
                  >
                    Xoá
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" icon={<img src={MoreAction} alt=""></img>}></Button>
            </Dropdown>
          );
        },
        visible: true,
      },
    ];
  }, [handleUpdateWarrantyReason, selectedData]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);

  useEffect(() => {
    setMetaDataShow(metadata);
  }, [metadata]);

  return (
    <ContentContainer
      title="Lý do bảo hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Lý do bảo hành",
          path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`,
        },
      ]}
      extra={
        <Button
          type="primary"
          onClick={() => history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}/create`)}
        >
          Thêm mới lý do bảo hành
        </Button>
      }
    >
      <StyledComponent>
        <Card className="card-tab">
          <WarrantyReasonFilter
            actions={actions}
            location={location}
            isLoading={false}
            onFilter={onFilter}
            onMenuClick={onMenuClick}
            onShowColumnSetting={() => setIsShowSettingColumn(true)}
          />
          <CustomTable
            isRowSelection
            rowSelectionWidth={"3.5%"}
            dataSource={data}
            selectedRowKey={selectedRowKeys}
            onSelectedChange={onSelectedChange}
            rowKey={(item: WarrantyReasonModel) => item.id}
            bordered
            columns={columnFinal}
            pagination={{
              pageSize: metaDataShow?.limit,
              total: metaDataShow?.total,
              current: metaDataShow?.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            key={Math.random()}
          />
        </Card>
      </StyledComponent>
      <ModalDeleteConfirm
        visible={isDeleteConfirmModalVisible}
        onOk={handleOkDeleteModal}
        onCancel={() => setIsDeleteConfirmModalVisible(false)}
        title="Xác nhận xóa"
        subTitle={confirmDeleteSubTitle}
      />
      <ModalSettingColumn
        visible={isShowSettingColumn}
        onCancel={() => setIsShowSettingColumn(false)}
        onOk={(data) => {
          console.log("data", data);
          setIsShowSettingColumn(false);
          setColumns(data);
        }}
        data={columns}
      />
      <ModalWarrantyReasonsCustomerFee
        visible={isCustomerFeeModalVisible}
        onCancel={() => setIsCustomerFeeModalVisible(false)}
        onOk={(values: any) => {
          if (!rowSelected.current?.record.id) {
            return;
          }
          const request: UpdateWarrantyReasonParamsModel = {
            name: rowSelected.current?.record.name,
            price: rowSelected.current?.record.price || undefined,
            status: rowSelected.current?.record.status,
            customer_fee: values.customer_fee || undefined,
          };
          handleUpdateCustomerFee(rowSelected.current?.record.id, request, values);
        }}
        initialFormValues={{
          customer_fee: selectedData.customer_fee,
        }}
        record={rowSelected.current?.record}
      />
      <ModalWarrantyReasonsPrice
        visible={isPriceModalVisible}
        onCancel={() => setIsPriceModalVisible(false)}
        onOk={(values: any) => {
          if (!rowSelected.current?.record.id) {
            return;
          }
          const request: UpdateWarrantyReasonParamsModel = {
            name: rowSelected.current?.record.name,
            customer_fee: rowSelected.current?.record.customer_fee || undefined,
            status: rowSelected.current?.record.status,
            price: values.price || undefined,
          };
          handleUpdatePrice(rowSelected.current?.record.id, request, values);
        }}
        initialFormValues={{
          price: selectedData.price || 0,
        }}
        record={rowSelected.current?.record}
      />
      <ModalConfirm
        visible={isConfirmModalVisible}
        onOk={handleOkConfirmModal}
        onCancel={() => setIsConfirmModalVisible(false)}
        title="Xác nhận"
        subTitle={confirmSubTitle}
      />
    </ContentContainer>
  );
}

export default withRouter(WarrantyReasons);
