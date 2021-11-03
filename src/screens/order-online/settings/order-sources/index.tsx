import {PlusOutlined} from "@ant-design/icons";
import {Button, Card, Form, Input, Select} from "antd";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import FormOrderSource from "component/forms/FormOrderSource";
import FormOrderSourceChannel from "component/forms/FormOrderSourceChannel";
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
  ChannelModel,
  ChannelTypeModel,
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import {ChannelResponse} from "model/response/product/channel.response";
import queryString from "query-string";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {withRouter} from "react-router";
import {useHistory} from "react-router-dom";
import {getDepartmentAllApi} from "service/accounts/account.service";
import {
  createChannelService,
  deleteChannelService,
  deleteMultiOrderSourceService,
  editChannelService,
  getChannelApi,
  getChannelTypeApi,
} from "service/order/order.service";
import {generateQuery} from "utils/AppUtils";
import {showError, showSuccess} from "utils/ToastUtils";
import iconChecked from "./images/iconChecked.svg";
import {StyledComponent} from "./styles";

type formValuesType = {
  name: string | undefined;
  department_id: number | undefined;
  channel_id: number | undefined;
};

type PropsType = {
  location: any;
};

function OrderSources(props: PropsType) {
  const {location} = props;
  const queryParamsParsed: any = queryString.parse(location.search);
  const ACTIONS_INDEX = {
    EXPORT: 1,
    DELETE: 2,
  };
  const DEFAULT_PAGINATION = {
    page: 1,
    limit: 30,
  };
  const initFilterParams: formValuesType = {
    name: "",
    department_id: undefined,
    channel_id: undefined,
  };
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModalOrderSource, setIsShowModalOrderSource] = useState(false);
  const [isShowModalChannel, setIsShowModalChannel] = useState(false);
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const dispatch = useDispatch();
  const [listOrderSources, setListOrderSources] = useState<OrderSourceModel[]>([]);
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleOrderSource, setModalSingleOrderSource] =
    useState<OrderSourceModel | null>(null);
  const [modalSingleChannel, setModalSingleChannel] = useState<ChannelModel | null>(null);

  const [form] = Form.useForm();

  const [rowSelectedObject, setRowSelectedObject] = useState<Array<OrderSourceModel>>([]);
  const [listDepartments, setListDepartments] = useState<DepartmentResponse[]>([]);
  const [listChannels, setListChannels] = useState<ChannelResponse[]>([]);
  const [listChannelTypes, setListChannelTypes] = useState<ChannelTypeModel[]>([]);

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "Mã kênh/nguồn",
      dataIndex: "code",
      visible: true,
      className: "columnTitle",
      width: "15%",
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
      title: "Kênh",
      dataIndex: "channel_id",
      visible: true,
      className: "columnTitle",
      width: "20%",
      render: (value, record, index) => {
        if (value) {
          const selectedChannel = listChannels.find((single) => {
            return single.id === value;
          });
          if (selectedChannel) {
            return (
              <span title={value} className="title">
                {selectedChannel.name}
              </span>
            );
          }
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
      width: "15%",
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
      title: "Áp dụng cho đơn hàng",
      dataIndex: "active",
      visible: true,
      width: "15%",
      align: "center",
      render: (value, record: OrderSourceModel, index) => {
        if (value || record.is_channel) {
          return <span className="status active">Đang áp dụng</span>;
        }
        return <span className="status inactive">Ngưng áp dụng</span>;
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
        if (single.is_channel) {
          channel_ids.push(single.id);
        } else {
          source_ids.push(single.id);
        }
      });
      deleteMultiOrderSourceService(source_ids, channel_ids)
        .then((response: BaseResponse<any>) => {
          switch (response.code) {
            case HttpStatus.SUCCESS:
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
    [ACTIONS_INDEX.DELETE]
  );

  const actions: Array<MenuAction> = [
    {
      id: ACTIONS_INDEX.EXPORT,
      name: "Export",
    },
    {
      id: ACTIONS_INDEX.DELETE,
      name: "Xóa",
    },
  ];

  const handleNavigateByQueryParams = (queryParams: any) => {
    history.push(`${UrlConfig.ORDER_SOURCES}?${generateQuery(queryParams)}`);
    window.scrollTo(0, 0);
  };

  const onFilterFormFinish = (values: any) => {
    const resultParams = {
      ...queryParams,
      ...values,
    };
    handleNavigateByQueryParams(resultParams);
  };

  const renderCardExtraHtml = () => {
    return (
      <div className="cardExtra">
        <Button
          type="primary"
          ghost
          size="large"
          onClick={() => {
            setModalAction("create");
            setIsShowModalChannel(true);
          }}
          icon={<PlusOutlined />}
        >
          Thêm kênh bán hàng
        </Button>
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
      </div>
    );
  };

  const renderConfirmDeleteSubtitle = () => {
    return <React.Fragment>Bạn có chắc chắn muốn xóa danh sách đã chọn ?</React.Fragment>;
  };

  const fetchData = useCallback(() => {
    dispatch(
      actionFetchListOrderSources(queryParams, (data: OrderSourceResponseModel) => {
        setListOrderSources(data.items);
        setTotal(data.metadata.total);
        showSuccess("Cập nhật danh sách nguồn đơn hàng thành công!");
      })
    );
    setTableLoading(false);
  }, [dispatch, queryParams]);

  const gotoFirstPage = () => {
    const resultParams = {
      ...queryParams,
      page: 1,
    };
    fetchData();
    handleNavigateByQueryParams(resultParams);
  };

  const handleFormOrderSourceFormatFormValues = (
    formValues: OrderSourceModel
  ): OrderSourceModel => {
    return {
      ...formValues,
      code: formValues.code.toUpperCase(),
    };
  };

  const handleFormChannelFormatFormValues = (formValues: ChannelModel): ChannelModel => {
    return {
      ...formValues,
      code: formValues.code.toUpperCase(),
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

  const handleFormChannel = {
    create: (formValues: ChannelModel) => {
      showLoading();
      createChannelService(handleFormChannelFormatFormValues(formValues))
        .then((response) => {
          switch (response.code) {
            case HttpStatus.SUCCESS:
              showSuccess("Tạo mới kênh bán hàng thành công!");
              setTableLoading(true);
              gotoFirstPage();
              break;
            default:
              response.errors.forEach((e) => showError(e));
              break;
          }
        })
        .catch((error) => {
          console.log('error', error)
        })
        .finally(() => {
          hideLoading();
          setIsShowModalChannel(false);
        });
    },
    edit: (formValues: ChannelModel) => {
      if (modalSingleChannel) {
        showLoading();
        editChannelService(modalSingleChannel.id, formValues)
          .then((response) => {
            switch (response.code) {
              case HttpStatus.SUCCESS:
                showSuccess("Cập nhật kênh bán hàng thành công!");
                fetchData();
                break;
              default:
                response.errors.forEach((e) => showError(e));
                break;
            }
          })
          .catch((error) => {
            console.log('error', error)
          })
          .finally(() => {
            hideLoading();
            setIsShowModalChannel(false);
          });
      }
    },
    delete: () => {
      if (modalSingleChannel) {
        showLoading();
        deleteChannelService(modalSingleChannel.id)
          .then((response) => {
            switch (response.code) {
              case HttpStatus.SUCCESS:
                showSuccess("Xóa kênh bán hàng thành công!");
                gotoFirstPage();
                break;
              default:
                response.errors.forEach((e) => showError(e));
                break;
            }
          })
          .catch((error) => {
            console.log('error', error)
          })
          .finally(() => {
            hideLoading();
            setIsShowModalChannel(false);
          });
      }
    },
  };

  useEffect(() => {
    if (queryParams) {
      setTableLoading(true);
      fetchData();
    }
  }, [dispatch, fetchData, queryParams]);

  useEffect(() => {
    const valuesFromParams: formValuesType = {
      name: queryParamsParsed.name || undefined,
      department_id: queryParamsParsed.department_id
        ? +queryParamsParsed.department_id
        : undefined,
      channel_id: queryParamsParsed.channel_id
        ? +queryParamsParsed.channel_id
        : undefined,
    };
    form.setFieldsValue(valuesFromParams);
  }, [
    form,
    queryParamsParsed.channel_id,
    queryParamsParsed.department_id,
    queryParamsParsed.name,
  ]);

  useEffect(() => {
    setQueryParams({
      page: +(queryParamsParsed.page || DEFAULT_PAGINATION.page),
      limit: +(queryParamsParsed.limit || DEFAULT_PAGINATION.limit),
      sort_type: "desc",
      sort_column: "updated_date",
      name: queryParamsParsed.name,
      department_id: queryParamsParsed.department_id,
      channel_id: queryParamsParsed.channel_id,
    });
  }, [
    DEFAULT_PAGINATION.limit,
    DEFAULT_PAGINATION.page,
    queryParamsParsed.channel_id,
    queryParamsParsed.department_id,
    queryParamsParsed.limit,
    queryParamsParsed.name,
    queryParamsParsed.page,
  ]);

  useEffect(() => {
    getDepartmentAllApi()
      .then((response: BaseResponse<DepartmentResponse[]>) => {
        switch (response.code) {
          case HttpStatus.SUCCESS:
            if (response.data) {
              setListDepartments(response.data);
            }
            break;
          default:
            response.errors.forEach((e) => showError(e));
            break;
        }
      })
      .catch((error) => {
        showError("Có lỗi khi lấy danh sách phòng ban!");
      });
  }, []);

  useEffect(() => {
    getChannelApi()
      .then((response: BaseResponse<ChannelResponse[]>) => {
        switch (response.code) {
          case HttpStatus.SUCCESS:
            if (response.data) {
              setListChannels(response.data);
            }
            break;
          default:
            response.errors.forEach((e) => showError(e));
            break;
        }
      })
      .catch((error) => {
        showError("Có lỗi khi lấy danh sách kênh bán hàng!");
      });
  }, []);

  useEffect(() => {
    getChannelTypeApi()
      .then((response: BaseResponse<ChannelTypeModel[]>) => {
        switch (response.code) {
          case HttpStatus.SUCCESS:
            if (response.data) {
              setListChannelTypes(response.data);
            }
            break;
          default:
            response.errors.forEach((e) => showError(e));
            break;
        }
      })
      .catch((error) => {
        showError("Có lỗi khi lấy loại kênh bán hàng!");
      });
  }, []);

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
        extra={renderCardExtraHtml()}
      >
        <Card>
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Form
              onFinish={onFilterFormFinish}
              initialValues={initFilterParams}
              layout="inline"
              form={form}
            >
              <Form.Item name="name" style={{width: 430, maxWidth: "100%"}}>
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tên kênh/nguồn"
                />
              </Form.Item>
              <Form.Item name="channel_id" style={{width: 180, maxWidth: "100%"}}>
                <Select
                  showSearch
                  allowClear
                  style={{width: "100%"}}
                  placeholder="Kênh bán hàng"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent="Không tìm thấy Kênh bán hàng!"
                >
                  {listChannels &&
                    listChannels.map((single) => {
                      return (
                        <Select.Option value={single.id} key={single.id}>
                          {single.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item name="department_id" style={{width: 180, maxWidth: "100%"}}>
                <Select
                  showSearch
                  allowClear
                  style={{width: "100%"}}
                  placeholder="Phòng ban"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent="Không tìm thấy phòng ban"
                >
                  {listDepartments &&
                    listDepartments.map((single) => {
                      return (
                        <Select.Option value={single.id} key={single.id}>
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
          <CustomTable
            isLoading={tableLoading}
            isRowSelection
            onSelectedChange={(selectedRow) => {
              setRowSelectedObject(selectedRow);
            }}
            showColumnSetting={false}
            pagination={{
              pageSize: queryParams?.limit ? queryParams.limit : DEFAULT_PAGINATION.limit,
              total: total,
              current: queryParams?.page ? queryParams.page : DEFAULT_PAGINATION.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={listOrderSources}
            columns={columnFinal()}
            rowKey={(item: OrderSourceModel) => item.id}
            onRow={(record: OrderSourceModel) => {
              return {
                onClick: () => {
                  setModalAction("edit");
                  if (record.is_channel) {
                    setModalSingleChannel({
                      id: record.id,
                      channel_type_id: record.channel_type?.id || undefined,
                      code: record.code,
                      name: record.name,
                    });
                    setIsShowModalChannel(true);
                  } else {
                    setModalSingleOrderSource(record);
                    setIsShowModalOrderSource(true);
                  }
                },
              };
            }}
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
          moreFormArguments={{listChannels, listDepartments}}
        />
        <CustomModal
          visible={isShowModalChannel}
          onCreate={(formValues: ChannelModel) => handleFormChannel.create(formValues)}
          onEdit={(formValues: ChannelModel) => handleFormChannel.edit(formValues)}
          onDelete={() => handleFormChannel.delete()}
          onCancel={() => setIsShowModalChannel(false)}
          modalAction={modalAction}
          componentForm={FormOrderSourceChannel}
          formItem={modalSingleChannel}
          deletedItemTitle={modalSingleChannel?.name}
          modalTypeText="Kênh bán hàng"
          moreFormArguments={{listChannels, listDepartments, listChannelTypes}}
        />
      </ContentContainer>
    </StyledComponent>
  );
}

export default withRouter(OrderSources);
