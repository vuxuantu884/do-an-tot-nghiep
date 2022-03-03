import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Card, Form, Input, Select} from "antd";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import FormOrderSource from "component/forms/FormOrderSource";
import CustomModal from "component/modal/CustomModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {MenuAction} from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import {HttpStatus} from "config/http-status.config";
import UrlConfig from "config/url.config";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {
  actionAddOrderSource,
  actionDeleteOrderSource,
  actionEditOrderSource,
  actionFetchListOrderSources,
} from "domain/actions/settings/order-sources.action";
import {DepartmentResponse} from "model/account/department.model";
import {modalActionType} from "model/modal/modal.model";
import {
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import queryString from "query-string";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {useDispatch} from "react-redux";
import {withRouter} from "react-router";
import {useHistory} from "react-router-dom";
import {getDepartmentAllApi} from "service/accounts/account.service";
import {deleteMultiOrderSourceService} from "service/order/order.service";
import {convertDepartment, generateQuery, handleFetchApiError, isFetchApiSuccessful} from "utils/AppUtils";
import {showError, showSuccess} from "utils/ToastUtils";
import iconChecked from "./images/iconChecked.svg";
import {StyledComponent} from "./styles";
import { primaryColor } from "utils/global-styles/variables";
import { SourcePermissions } from "config/permissions/setting.permisssion";
import useAuthorization from "hook/useAuthorization";
import NoPermission from "screens/no-permission.screen";
import "assets/css/custom-filter.scss";
import { strForSearch } from "utils/RemoveDiacriticsString";
import { callApiNative } from "utils/ApiUtils";  
import {
  getSourcesWithParamsService
} from "service/order/order.service";

type formValuesType = {
  name: string | undefined;
  department_ids: number | undefined;
};

type PropTypes = {
  location: any;
};

const ACTIONS_INDEX = {
  DELETE: 2,
};

const actionsDefault: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.DELETE,
    name: "Xóa",
    icon: <DeleteOutlined />,
  },
];

function OrderSources(props: PropTypes) {
  const {location} = props;
  const queryParamsParsed: any = queryString.parse(location.search);

  const DEFAULT_PAGINATION = {
    page: 1,
    limit: 30,
  };
  const initFilterParams: formValuesType = {
    name: "",
    department_ids: undefined,
  };
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModalOrderSource, setIsShowModalOrderSource] = useState(false);
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const dispatch = useDispatch();
  const [listOrderSources, setListOrderSources] = useState<OrderSourceModel[]>([]);
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleOrderSource, setModalSingleOrderSource] =
    useState<OrderSourceModel | null>(null);

  const [form] = Form.useForm();

  const [rowSelectedObject, setRowSelectedObject] = useState<Array<OrderSourceModel>>([]);
  const [listDepartments, setListDepartments] = useState<any[]>([]); 

  //permission

  const [allowCreateSource] = useAuthorization({
    acceptPermissions: [SourcePermissions.CREATE],
  });

  const [allowReadSource] = useAuthorization({
    acceptPermissions: [SourcePermissions.READ],
  });

  const [allowDeleteSource] = useAuthorization({
    acceptPermissions: [SourcePermissions.DELETE],
  });

  const [allowUpdateSource] = useAuthorization({
    acceptPermissions: [SourcePermissions.UPDATE],
  });

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "Mã nguồn",
      dataIndex: "code",
      visible: true,
      className: "columnTitle",
      width: "15%",
      render: (value, record, index) => {
        if (value) {
          return (
            <span title={value} className="title" style={{color: primaryColor, fontWeight: 500}}>
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "name",
      visible: true,
      className: "columnTitle",
      width: "20%",
      render: (value, record, index) => {
        if (value) {
          return (
            <span title={value} className="title">
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      visible: true,
      className: "columnTitle",
      width: "25%",
      render: (value, record, index) => {
        if (value) {
          return (
            <span title={value} className="title">
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Áp dụng",
      dataIndex: "active",
      visible: true,
      width: "20%",
      align: "center",
      render: (value, record: OrderSourceModel, index) => {
        if (value) {
          return <div className="status active">Đang áp dụng</div>;
        }
        return <div className="status inactive">Ngưng áp dụng</div>;
      },
    },
    {
      title: "Mặc định",
      dataIndex: "default",
      visible: true,
      width: "15%",
      align: "center",
      render: (value) => {
        if (value) {
          return <img src={iconChecked} alt="Mặc định" />;
        }
      },
    },
  ];
  const columnFinal = () => columns.filter((item) => item.visible === true);

  const history = useHistory();

  let [queryParams, setQueryParams] = useState<any>(null);

  const onPageChange = useCallback(
    (page, size) => {
      queryParams.page = page;
      queryParams.limit = size;
      let queryParam = generateQuery(queryParams);
      history.replace(`${UrlConfig.ORDER_SOURCES}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const handleDeleteMultiOrderSource = () => {
    showLoading();
    if (rowSelectedObject.length > 0) {
      let channel_ids: number[] = [];
      let source_ids: number[] = [];
      rowSelectedObject.forEach((single) => {
        if (single) {
          if (single.is_channel) {
            channel_ids.push(single.id);
          } else {
            source_ids.push(single.id);
          }
        }
      });
      deleteMultiOrderSourceService(source_ids, channel_ids)
        .then((response: BaseResponse<any>) => {
          switch (response.code) {
            case HttpStatus.SUCCESS:
              showSuccess("Xóa danh sách thành công!");
              setRowSelectedObject([]);
              setTableLoading(true);
              gotoFirstPage();
              setTableLoading(false);
              break;
            default:
              response.errors.forEach((e) => showError(e));
              break;
          }
        })
        .catch((error) => {
          showError("Xóa thất bại!");
        })
        .finally(() => {
          setIsShowConfirmDelete(false);
          hideLoading();
        });
    }
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.DELETE:
          setIsShowConfirmDelete(true);
      }
    },
    []
  );

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === ACTIONS_INDEX.DELETE) {
        return allowDeleteSource;
      }
      return false;
    });
  }, [
    allowDeleteSource,
  ]);

  const handleNavigateByQueryParams = (queryParams: any) => { 
    history.push(`${UrlConfig.ORDER_SOURCES}?${generateQuery(queryParams)}`); 
    window.scrollTo(0, 0);
  };

  const onFilterFormFinish = (values: any) => {
    let name = values.name ?? "";
    const resultParams = {
      ...queryParams,
      ...values,
			page: 1,
    };
    fetchData({...resultParams,name: name.trim()});
    handleNavigateByQueryParams(resultParams);
  };

  const renderCardExtraHtml = () => {
    return (
      <div className="cardExtra">
        {allowCreateSource && (
          <Button
            type="primary"
            className="ant-btn-primary"
            size="large"
            onClick={() => {
              setModalAction("create");
              setIsShowModalOrderSource(true);
            }}
            icon={<PlusOutlined />}
          >
            Thêm nguồn đơn hàng
          </Button>
        )}
      </div>
    );
  };

  const renderConfirmDeleteSubtitle = () => {
    return <React.Fragment>Bạn có chắc chắn muốn xóa danh sách đã chọn ?</React.Fragment>;
  };

  const fetchData = useCallback(async(params: any) => {
    const res: OrderSourceResponseModel = await callApiNative({isShowLoading: false},dispatch,getSourcesWithParamsService,params ?? queryParams);
    
    if (res) {
      setListOrderSources(res.items);
      setTotal(res.metadata.total);
    } 
    setTableLoading(false);
  }, [dispatch, queryParams]);

  const gotoFirstPage = () => {
    const resultParams = {
      ...queryParams,
      page: 1,
    };
    fetchData(resultParams);
    handleNavigateByQueryParams(resultParams);
  };

  const handleFormOrderSourceFormatFormValues = (
    formValues: OrderSourceModel
  ): OrderSourceModel => {
    return {
      ...formValues,
      code: formValues.code? formValues.code: undefined,
    };
  };

  const handleFormOrderSource = {
    create: (formValues: OrderSourceModel) => {
      dispatch(
        actionAddOrderSource(handleFormOrderSourceFormatFormValues(formValues), () => {
          setIsShowModalOrderSource(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValues: OrderSourceModel) => {
      if (modalSingleOrderSource) {
        dispatch(
          actionEditOrderSource(
            modalSingleOrderSource.id,
            handleFormOrderSourceFormatFormValues(formValues),
            () => {
              dispatch(
                actionFetchListOrderSources(
                  queryParams,
                  (data: OrderSourceResponseModel) => {
                    setListOrderSources(data.items);
                  }
                )
              );
            }
          )
        );
        setIsShowModalOrderSource(false);
      }
    },
    delete: () => {
      if (modalSingleOrderSource) {
        dispatch(
          actionDeleteOrderSource(modalSingleOrderSource.id, () => {
            setIsShowModalOrderSource(false);
            gotoFirstPage();
          })
        );
      }
    },
  };

  useLayoutEffect(() => {
      setTableLoading(true);
      gotoFirstPage();
  }, []);

  useEffect(() => {
    const valuesFromParams: formValuesType = {
      name: queryParamsParsed.name || undefined,
      department_ids: queryParamsParsed.department_ids
        ? +queryParamsParsed.department_ids
        : undefined,
    };
    form.setFieldsValue(valuesFromParams);
  }, [form, queryParamsParsed.department_ids, queryParamsParsed.name]);

  useEffect(() => {
    setQueryParams({
      page: +(queryParamsParsed.page || DEFAULT_PAGINATION.page),
      limit: +(queryParamsParsed.limit || DEFAULT_PAGINATION.limit),
      sort_type: "desc",
      sort_column: "updated_date",
      name: queryParamsParsed.name,
      department_ids: queryParamsParsed.department_ids,
    });
  }, [
    DEFAULT_PAGINATION.limit,
    DEFAULT_PAGINATION.page,
    queryParamsParsed.department_ids,
    queryParamsParsed.limit,
    queryParamsParsed.name,
    queryParamsParsed.page,
  ]);

  useEffect(() => {
    getDepartmentAllApi()
      .then((response: BaseResponse<DepartmentResponse[]>) => {
				if (isFetchApiSuccessful(response)) {
					if (response.data) {
						// setListDepartments(response.data);
						let array: any = convertDepartment(response.data);
						setListDepartments(array);
					}
				} else {
					handleFetchApiError(response, "Danh sách phòng ban", dispatch)
				}
      })
      .catch((error) => {
				console.log('error', error)
        showError("Có lỗi khi lấy danh sách phòng ban!");
      });
  }, [dispatch]);

  return (
    <StyledComponent>
      {allowReadSource ? (
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
          extra={renderCardExtraHtml()}
        >
          <Card>
            <div className="custom-filter">
            <CustomFilter onMenuClick={onMenuClick} menu={actions} >
              <Form
                onFinish={onFilterFormFinish}
                initialValues={initFilterParams}
                layout="inline"
                form={form}
              >
                <Form.Item name="name" className="input-search">
                  <Input
                    prefix={<img src={search} alt="" />}
                    placeholder="Nguồn đơn hàng"
                  />
                </Form.Item>
                <Form.Item name="department_ids" style={{width: 305}}>
                  <Select
                    showSearch
                    allowClear
                    placeholder="Phòng ban"
                    optionFilterProp="title"
                    notFoundContent="Không tìm thấy phòng ban"
                    filterOption={(input: String, option: any) => {
                      if (option.props.value) {
                        return strForSearch(option.props.children[2]).includes(strForSearch(input));
                      }

                      return false;
                    }}
                  >
                    {listDepartments &&
                      listDepartments.map((single) => {
                        return (
                          <Select.Option value={single.id} key={single.id} title={single.name}>
                            <span
                              className="hideInSelect"
                              style={{ paddingLeft: +18 * single.level }}
                            />
                            {single?.parent?.name && (
                              <span className="hideInDropdown">
                                {single?.parent?.name} -{" "}
                              </span>
                            )}
                            {single.name}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
                <Form.Item style={{marginRight: 0}}>
                  <Button type="primary" htmlType="submit">
                    Lọc
                  </Button>
                </Form.Item>
              </Form>
            </CustomFilter>
            </div>
            <CustomTable
              bordered
              size="small"
              className="small-padding"
              isLoading={tableLoading}
              isRowSelection
              onSelectedChange={(selectedRow) => {
                setRowSelectedObject(selectedRow);
              }}
              showColumnSetting={false}
              pagination={{
                pageSize: queryParams?.limit
                  ? queryParams.limit
                  : DEFAULT_PAGINATION.limit,
                total: total,
                current: queryParams?.page ? queryParams.page : DEFAULT_PAGINATION.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              dataSource={listOrderSources}
              columns={columnFinal()}
              rowKey={(item: OrderSourceModel) => item.id}
              onRow={
                allowUpdateSource
                  ? (record: OrderSourceModel) => {
                      return {
                        onClick: () => {
                          setModalAction("edit");
                          setModalSingleOrderSource(record);
                          setIsShowModalOrderSource(true);
                        },
                      };
                    }
                  : undefined
              }
            />
          </Card>
          <ModalDeleteConfirm
            visible={isShowConfirmDelete}
            onOk={() => handleDeleteMultiOrderSource()}
            onCancel={() => setIsShowConfirmDelete(false)}
            title="Xác nhận"
            subTitle={renderConfirmDeleteSubtitle()}
          />
          <CustomModal
            visible={isShowModalOrderSource}
            onCreate={(formValues: OrderSourceModel) =>
              handleFormOrderSource.create(formValues)
            }
            onEdit={(formValues: OrderSourceModel) =>
              handleFormOrderSource.edit(formValues)
            }
            onDelete={() => handleFormOrderSource.delete()}
            onCancel={() => setIsShowModalOrderSource(false)}
            modalAction={modalAction}
            componentForm={FormOrderSource}
            formItem={modalSingleOrderSource}
            deletedItemTitle={modalSingleOrderSource?.name}
            modalTypeText="Nguồn đơn hàng"
            moreFormArguments={{listDepartments}}
          />
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </StyledComponent>
  );
}

// const TreeDepartment = (item: DepartmentResponse) => {
//   return (
//     <TreeSelect.TreeNode value={item.id} title={item.name}>
//       {item.children.length > 0 && (
//         <React.Fragment>
//           {item.children.map((item, index) => (
//             <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
//           ))}
//         </React.Fragment>
//       )}
//     </TreeSelect.TreeNode>
//   );
// };

export default withRouter(OrderSources);
