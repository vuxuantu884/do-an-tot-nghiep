import { PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Menu } from "antd";
import { ReactComponent as DeleteIcon } from "assets/icon/deleteIcon.svg";
import MoreAction from "assets/icon/more-action.svg";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useGetCities from "hook/useGetCities";
import useGetDistricts from "hook/useGetDistricts";
import useFetchWarrantyCenters from "hook/warranty/useFetchWarrantyCenters";
import {
  GetWarrantyCentersParamModel,
  WarrantyCenterModel,
  WarrantyCenterValueUpdateGetModel,
} from "model/warranty/warranty.model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import WarrantyCenterFilter from "screens/warranty/components/filter/WarrantyCenterFilter";
import {
  deleteWarrantyCenterService,
  deleteWarrantyCentersService,
  updateWarrantyCenterService,
} from "service/warranty/warranty.service";
import {
  changeMetaDataAfterDelete,
  generateQuery,
  goToTopPage,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import ModalWarrantyCenterAddress from "../components/modal/ModalWarrantyCenterAddress";
import ModalWarrantyCenterCityDistrict from "../components/modal/ModalWarrantyCenterCityDistrict";
import ModalWarrantyCenterPhone from "../components/modal/ModalWarrantyCenterPhone";
import { StyledComponent } from "./styles";

type PropTypes = {
  location: any;
};

type DeleteType = "single" | "multi";

let typeOfDelete: DeleteType = "single";

function WarrantyCenters(props: PropTypes) {
  const { location } = props;

  const history = useHistory();
  const rowSelected = useRef<{ record: WarrantyCenterModel; index: number }>();
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isCityDistrictModalVisible, setIsCityDistrictModalVisible] = useState(false);
  const [confirmDeleteSubTitle, setConfirmDeleteSubTitle] = useState<React.ReactNode>("");
  const [countForceFetchData, setCountForceFetchData] = useState(0);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<WarrantyCenterModel>>>([]);
  console.log("columns", columns);
  const rowClicked = (record: WarrantyCenterModel, index: number) => {
    rowSelected.current = { record, index };
  };

  const [selectedData, setSelectedData] = useState<WarrantyCenterValueUpdateGetModel>({
    phone: undefined,
    address: undefined,
    city_id: undefined,
    district_id: undefined,
  });

  const dispatch = useDispatch();

  const [metaDataShow, setMetaDataShow] = useState({
    limit: 0,
    page: 0,
    total: 0,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const initQuery: GetWarrantyCentersParamModel = {
    page: 1,
    limit: 30,
    city_id: undefined,
    name: undefined,
    district_id: undefined,
    phone: undefined,
  };
  const [query, setQuery] = useState<GetWarrantyCentersParamModel>(initQuery);
  const getWarrantyCenters = useFetchWarrantyCenters(
    initQuery,
    location,
    countForceFetchData,
    setQuery
  );

  let { warrantyCenters, metadata } = getWarrantyCenters;
  const [data, setData] = useState<WarrantyCenterModel[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const cities = useGetCities();
  const districts = useGetDistricts(selectedCityId);

  const ACTION_ID = {
    delete: 1,
  };

  const actions: Array<MenuAction> = useMemo(
    () => [
      {
        id: ACTION_ID.delete,
        name: "Xóa trung tâm bảo hành",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
    ],
    [ACTION_ID.delete, selectedRowKeys.length]
  );

  const onSelectedChange = (selectedRow: WarrantyCenterModel[]) => {
    console.log("selectedRowKeys changed: ", selectedRow);
    const selectedRowIds = selectedRow.filter((row) => row).map((row) => row?.id);
    setSelectedRowKeys(selectedRowIds);
  };
  console.log("selectedData", selectedData);

  const handleOkPhoneModal = useCallback(
    (values) => {
      if(!rowSelected.current?.record.id) {
        return;
      }
      setIsPhoneModalVisible(false);
      const query = {
        ...rowSelected.current?.record,
        phone: values.phone || undefined,
      };
      dispatch(showLoading());
      updateWarrantyCenterService(rowSelected.current?.record.id, query)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật số điện thoại trung tâm bảo hành thành công!");
            const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
            if (index > -1) {
              let dataResult = [...data];
              dataResult[index].phone = values.phone || null;
              setData(dataResult);
            }
            console.log("response", response);
          } else {
            handleFetchApiError(response, "Cập nhật số điện thoại trung tâm bảo hành", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [data, dispatch]
  );

  const handleOkAddressModal = useCallback(
    (values: any) => {
      if(!rowSelected.current?.record.id) {
        return;
      }
      setIsAddressModalVisible(false);
      const query = {
        ...rowSelected.current?.record,
        address: values.address,
      };
      dispatch(showLoading());
      updateWarrantyCenterService(rowSelected.current?.record.id, query)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật địa chỉ trung tâm bảo hành thành công!");
            const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
            if (index > -1) {
              let dataResult = [...data];
              dataResult[index].address = values.address || "";
              setData(dataResult);
            }
            console.log("response", response);
          } else {
            handleFetchApiError(response, "Cập nhật địa chỉ trung tâm bảo hành", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [data, dispatch]
  );

  const handleOkCityDistrictModal = useCallback(
    (values: any) => {
      if(!rowSelected.current?.record.id) {
        return;
      }
      setIsCityDistrictModalVisible(false);
      const query = {
        ...rowSelected.current?.record,
        city_id: values.city_id,
        district_id: values.district_id,
      };
      dispatch(showLoading());
      updateWarrantyCenterService(rowSelected.current?.record.id, query)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật số tỉnh/tp, quận/huyện trung tâm bảo hành thành công!");
            const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
            if (index > -1) {
              let dataResult = [...data];
              dataResult[index].city_id = values.city_id || null;
              dataResult[index].city =
                cities.find((city) => city.id === values.city_id)?.name || null;
              dataResult[index].district_id = values.district_id || null;
              dataResult[index].district =
                districts.find((district) => district.id === values.district_id)?.name || null;
              setData(dataResult);
            }
            console.log("response", response);
          } else {
            handleFetchApiError(
              response,
              "Cập nhật số tỉnh/tp, quận/huyện trung tâm bảo hành",
              dispatch
            );
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [cities, data, dispatch, districts]
  );

  const handleDeleteSingle = () => {
    if (!rowSelected.current?.record.id) {
      return;
    }
    setIsDeleteConfirmModalVisible(false);
    dispatch(showLoading());
    deleteWarrantyCenterService(rowSelected.current?.record.id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa trung tâm bảo hành thành công!");
          let dataResult = data.filter((single) => single.id !== rowSelected.current?.record.id);
          changeMetaDataAfterDelete(metadata, setMetaDataShow, 1);
          setData(dataResult);
        } else {
          handleFetchApiError(response, "Xóa trung tâm bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteMulti = () => {
    deleteWarrantyCentersService(selectedRowKeys)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa trung tâm bảo hành thành công!");
          let dataResult = [...data].filter((single) => !selectedRowKeys.includes(single.id));
          setData(dataResult);
          console.log("response", response);
          changeMetaDataAfterDelete(metadata, setMetaDataShow, selectedRowKeys.length);
        } else {
          handleFetchApiError(response, "Xóa trung tâm bảo hành", dispatch);
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
              Bạn có chắc chắn muốn xóa các <strong>Trung tâm bảo hành</strong> đã chọn ?
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
      // setSelectedRow([]);
      // setSelectedRowKeys([]);
      // setSelectedRowCodes([]);
    },
    [forceFetchData, history, location.pathname, query]
  );

  const initColumns: ICustomTableColumType<WarrantyCenterModel>[] = useMemo(() => {
    // if (data.items.length === 0) {
    //   return [];
    // }
    return [
      {
        title: "Tên trung tâm bảo hành",
        align: "left",
        dataIndex: "name",
        key: "name",
        width: "13%",
        render: (value, record: WarrantyCenterModel) => {
          return (
            <div>
              <Link to={`${UrlConfig.WARRANTY}/${WARRANTY_URL.center}/${record.id}`}>
                <b>{record?.name}</b>
              </Link>
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Số điện thoại",
        align: "left",
        dataIndex: "phone",
        key: "phone",
        width: "13%",
        render: (value, record: WarrantyCenterModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsPhoneModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  phone: record.phone || undefined,
                });
              }}
            >
              {value ? (
                <span>{value}</span>
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
        title: "Địa chỉ",
        align: "left",
        dataIndex: "address",
        key: "address",
        width: "13%",
        render: (value, record: WarrantyCenterModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsAddressModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  address: record.address || undefined,
                });
              }}
            >
              {value ? (
                <span>{value}</span>
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
        title: "Thành phố",
        dataIndex: "city",
        key: "city",
        width: "9%",
        align: "center",
        render: (value, record: WarrantyCenterModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsCityDistrictModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  city_id: record.city_id || undefined,
                  district_id: record.district_id || undefined,
                });
                setSelectedCityId(record.city_id);
              }}
            >
              {value ? (
                <span>{value}</span>
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
        title: "Quận huyện",
        dataIndex: "district",
        key: "district",
        width: "9%",
        align: "center",
        render: (value, record: WarrantyCenterModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsCityDistrictModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  city_id: record.city_id || undefined,
                  district_id: record.district_id || undefined,
                });
                setSelectedCityId(record.city_id);
              }}
            >
              {value ? (
                <span>{value}</span>
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
        title: "Người tạo",
        dataIndex: "created_name",
        key: "created_name",
        width: "12%",
        render: (value, record: WarrantyCenterModel) => {
          return <div>{`${record.created_by} - ${record.created_name}`}</div>;
        },
        visible: true,
      },
      {
        title: "",
        width: "3.5%",
        align: "center",
        render: (text, record: WarrantyCenterModel, index) => {
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
                      typeOfDelete = "single";
                      rowClicked(record, index);
                      setConfirmDeleteSubTitle(
                        <React.Fragment>
                          Bạn có chắc chắn muốn xóa: <strong>Trung tâm bảo hành</strong> có tên{" "}
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
  }, [selectedData]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);

  useEffect(() => {
    setData(warrantyCenters);
  }, [warrantyCenters]);

  useEffect(() => {
    if (!selectedCityId) {
      setSelectedData({
        ...selectedData,
        district_id: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId]);

  useEffect(() => {
    setMetaDataShow(metadata);
  }, [metadata]);

  return (
    <ContentContainer
      title="Trung tâm bảo hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Trung tâm bảo hành",
          path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.center}`,
        },
      ]}
      extra={
        <Button
          type="primary"
          onClick={() => history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.center}/create`)}
        >
          Thêm mới trung tâm bảo hành
        </Button>
      }
    >
      <StyledComponent>
        <Card className="card-tab">
          <WarrantyCenterFilter
            actions={actions}
            params={query}
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
            rowKey={(item: WarrantyCenterModel) => item.id}
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
      <ModalWarrantyCenterPhone
        visible={isPhoneModalVisible}
        onOk={(values: any) => {
          handleOkPhoneModal(values);
        }}
        onCancel={() => setIsPhoneModalVisible(false)}
        initialFormValues={{
          phone: selectedData.phone,
        }}
        record={rowSelected.current?.record}
      />
      <ModalWarrantyCenterAddress
        visible={isAddressModalVisible}
        onOk={(values: any) => handleOkAddressModal(values)}
        onCancel={() => setIsAddressModalVisible(false)}
        initialFormValues={{
          address: selectedData.address,
        }}
        record={rowSelected.current?.record}
      />
      <ModalWarrantyCenterCityDistrict
        visible={isCityDistrictModalVisible}
        onOk={(values: any) => handleOkCityDistrictModal(values)}
        onCancel={() => setIsCityDistrictModalVisible(false)}
        cities={cities}
        districts={districts}
        setSelectedCityId={setSelectedCityId}
        selectedCityId={selectedCityId}
        initialFormValues={{
          city_id: selectedData.city_id,
          district_id: selectedData.district_id,
        }}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        record={rowSelected.current?.record}
      />
    </ContentContainer>
  );
}

export default withRouter(WarrantyCenters);
