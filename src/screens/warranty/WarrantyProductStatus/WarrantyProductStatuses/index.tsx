import { PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Menu, Switch } from "antd";
import { ReactComponent as DeleteIcon } from "assets/icon/deleteIcon.svg";
import MoreAction from "assets/icon/more-action.svg";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useFetchWarrantyProductStatuses from "hook/warranty/useFetchWarrantyProductStatuses";
import {
  GetWarrantyProductStatusesParamModel,
  UpdateWarrantyProductStatusModel,
  WarrantyProductStatusModel,
  WarrantyProductStatusStatusModel,
  WarrantyProductStatusValueUpdateGetModel,
  WarrantyReasonModel,
  WarrantyReasonStatusModel,
} from "model/warranty/warranty.model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import WarrantyProductStatusFilter from "screens/warranty/components/filter/WarrantyProductStatusFilter";
import {
  deleteWarrantyProductStatusesService,
  deleteWarrantyProductStatusService,
  updateWarrantyProductStatusService,
} from "service/warranty/warranty.service";
import {
  generateQuery,
  goToTopPage,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import { WARRANTY_PRODUCT_STATUS_TYPE } from "utils/Warranty.constants";
import ModalProductStatusType from "../components/modal/ModalProductStatusType";
import { StyledComponent } from "./styles";

type PropTypes = {
  location: any;
};

type DeleteType = "single" | "multi";

let typeOfDelete: DeleteType = "single";

function WarrantyStatus(props: PropTypes) {
  const { location } = props;

  const history = useHistory();
  const rowSelected = useRef<{ record: WarrantyProductStatusModel; index: number }>();
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [confirmDeleteSubTitle, setConfirmDeleteSubTitle] = useState<React.ReactNode>("");
  const [countForceFetchData, setCountForceFetchData] = useState(0);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<WarrantyProductStatusModel>>>(
    []
  );

  const [selectedData, setSelectedData] = useState<WarrantyProductStatusValueUpdateGetModel>({
    type: undefined,
  });

  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);

  console.log("columns", columns);
  const rowClicked = (record: any, index: number) => {
    rowSelected.current = { record, index };
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const initQuery: GetWarrantyProductStatusesParamModel = {
    page: 1,
    limit: 30,
    ids: [],
    from_created_date: undefined,
    to_created_date: undefined,
    type: undefined,
    query: undefined,
  };
  const [query, setQuery] = useState<GetWarrantyProductStatusesParamModel>(initQuery);

  const getWarrantyProductStatuses = useFetchWarrantyProductStatuses(
    initQuery,
    location,
    countForceFetchData,
    setQuery
  );
  let { warrantyProductStatuses, metadata } = getWarrantyProductStatuses;
  const [data, setData] = useState<WarrantyReasonModel[]>([]);

  const dispatch = useDispatch();

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
    const selectedRowIds = selectedRow.filter((row) => row).map((row) => row?.id);
    setSelectedRowKeys(selectedRowIds);
  };

  const handleUpdateWarrantyProductStatusType = (values: any) => {
    setIsTypeModalVisible(false);
    if (!rowSelected.current?.record.id) {
      return;
    }
    dispatch(showLoading());
    const params: any = {
      ...rowSelected.current?.record,
      type: values.type,
    };
    updateWarrantyProductStatusService(rowSelected.current?.record.id, params)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật loại trạng thái thành công!");
          const index = data.findIndex(
            (single) => single.id === rowSelected.current?.record.id
          );
          if (index > -1 && values.type) {
            let dataResult = [...data];
            dataResult[index].type = values.type;
            setData(dataResult);
          }
          // changeToTabFinalizedIfCurrentIsNew();
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật loại trạng thái", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleUpdateWarrantyProductStatusStatus = useCallback(
    (warrantyProductStatusId: number, body: UpdateWarrantyProductStatusModel) => {
      dispatch(showLoading());
      updateWarrantyProductStatusService(warrantyProductStatusId, body)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật trạng thái sản phẩm thành công");
          } else {
            handleFetchApiError(response, "Cập nhật trạng thái sản phẩm", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch]
  );

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTION_ID.delete:
          typeOfDelete = "multi";
          setConfirmDeleteSubTitle(
            <React.Fragment>
              Bạn có chắc chắn muốn xóa các: <strong>Lý do bảo hành</strong> đã chọn ?
            </React.Fragment>
          );
          setIsDeleteConfirmModalVisible(true);
          break;

        default:
          break;
      }
    },
    [ACTION_ID.delete]
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
    },
    [forceFetchData, history, location.pathname, query]
  );

  const handleDeleteSingle = () => {
    if (!rowSelected.current?.record.id) {
      return;
    }
    dispatch(showLoading());
    deleteWarrantyProductStatusService(rowSelected.current?.record.id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa trạng thái bảo hành thành công!");
          const index = data.findIndex(
            (single) => single.id === rowSelected.current?.record.id
          );
          if (index > -1) {
            let dataResult = [...data];
            dataResult.splice(index, 1);
            setData(dataResult);
          }
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Xóa trạng thái bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteMulti = () => {
    deleteWarrantyProductStatusesService(selectedRowKeys)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa trạng thái bảo hành thành công!");
          let dataResult = [...data].filter(
            (single) => !selectedRowKeys.includes(single.id)
          );
          setData(dataResult);
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Xóa trạng thái bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkDeleteModal = () => {
    setIsDeleteConfirmModalVisible(false);
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

  useEffect(() => {
    setData(warrantyProductStatuses);
  }, [warrantyProductStatuses]);

  const initColumns: ICustomTableColumType<WarrantyProductStatusModel>[] = useMemo(() => {
    return [
      {
        title: "Tên trạng thái",
        align: "left",
        dataIndex: "name",
        key: "name",
        width: "13%",
        render: (value, record: WarrantyProductStatusModel) => {
          return record?.id ? (
            <div>
              <Link to={`${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}/${record.id}`}>
                {value}
              </Link>
              <br />
            </div>
          ) : null;
        },
        visible: true,
      },
      {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        width: "13%",
        render: (value, record: WarrantyProductStatusModel, index) => {
          const type = WARRANTY_PRODUCT_STATUS_TYPE.find((single) => single.code === value);
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setSelectedData({
                  ...selectedData,
                  type: record.type ? record.type : undefined,
                });
                setIsTypeModalVisible(true);
              }}
            >
              <b>{type ? type.name : "-"}</b>
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Trạng thái hoạt động",
        dataIndex: "status",
        key: "status",
        width: "9%",
        align: "center",
        render: (value, record: WarrantyProductStatusModel) => {
          return (
            <Switch
              defaultChecked={value === WarrantyReasonStatusModel.ACTIVE}
              onChange={(value) => {
                console.log("value", value);
                const request: UpdateWarrantyProductStatusModel = {
                  ...record,
                  status: value
                    ? WarrantyProductStatusStatusModel.ACTIVE
                    : WarrantyProductStatusStatusModel.INACTIVE,
                };
                handleUpdateWarrantyProductStatusStatus(record.id, request);
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
        render: (value, record: WarrantyProductStatusModel) => {
          return <div>{`${record.created_by} - ${record.created_name}`}</div>;
        },
        visible: true,
      },
      {
        title: "",
        width: "3.5%",
        align: "center",
        render: (text, record: WarrantyProductStatusModel, index) => {
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
                          Bạn có chắc chắn muốn xóa: <strong>Trạng thái bảo hành</strong> có tên{" "}
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
  }, [handleUpdateWarrantyProductStatusStatus, selectedData]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);

  return (
    <ContentContainer
      title="Trạng thái sản phẩm, phiếu bảo hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Trạng thái sản phẩm, phiếu bảo hành",
          path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}`,
        },
      ]}
      extra={
        <Button
          type="primary"
          onClick={() => history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}/create`)}
        >
          Thêm mới trạng thái
        </Button>
      }
    >
      <StyledComponent>
        <Card>
          <WarrantyProductStatusFilter
            actions={actions}
            isLoading={false}
            onFilter={onFilter}
            onMenuClick={onMenuClick}
            location={location}
            onShowColumnSetting={() => setIsShowSettingColumn(true)}
          />
          <CustomTable
            isRowSelection
            rowSelectionWidth={"3.5%"}
            dataSource={data}
            selectedRowKey={selectedRowKeys}
            onSelectedChange={onSelectedChange}
            rowKey={(item: WarrantyProductStatusModel) => item.id}
            bordered
            columns={columnFinal}
            pagination={{
              pageSize: metadata?.limit,
              total: metadata?.total,
              current: metadata?.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
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
      <ModalProductStatusType
        visible={isTypeModalVisible}
        onOk={handleUpdateWarrantyProductStatusType}
        onCancel={() => setIsTypeModalVisible(false)}
        initialFormValues={{
          type: selectedData.type,
        }}
        record={rowSelected.current?.record}
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
    </ContentContainer>
  );
}

export default withRouter(WarrantyStatus);
