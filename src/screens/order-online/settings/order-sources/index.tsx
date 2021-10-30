import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Select } from "antd";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import FormOrderSource from "component/forms/FormOrderSource";
import CustomModal from "component/modal/CustomModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  actionAddOrderSource,
  actionDeleteOrderSource,
  actionEditOrderSource,
  actionFetchListOrderSources
} from "domain/actions/settings/order-sources.action";
import { DepartmentResponse } from "model/account/department.model";
import { modalActionType } from "model/modal/modal.model";
import {
  OrderSourceModel,
  OrderSourceResponseModel
} from "model/response/order/order-source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { getDepartmentAllApi } from "service/accounts/account.service";
import { deleteMultiOrderSourceService, getChannelApi } from "service/order/order.service";
import { generateQuery } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import iconChecked from "./images/iconChecked.svg";
import { StyledComponent } from "./styles";

type formValueType = {
  name: string | undefined;
  department_id: number | undefined;
};

function OrderSources() {
  const ACTIONS_INDEX = {
    EXPORT: 1,
    DELETE: 2,
  };
  const DEFAULT_PAGINATION = {
    page: 1,
    limit: 30,
  };
  const initFilterParams: formValueType = {
    name: "",
    department_id: undefined,
  };
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const dispatch = useDispatch();
  const [listOrderSources, setListOrderSources] = useState<OrderSourceModel[]>([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleOrderSource, setModalSingleOrderSource] =
    useState<OrderSourceModel | null>(null);

  const [form] = Form.useForm();

  const [rowKey, setRowKey] = useState<Array<any>>([]);
  const [listDepartments, setListDepartments] = useState<DepartmentResponse[]>([]);
  const [listChannels, setListChannels] = useState<ChannelResponse[]>([]);

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "Mã kênh",
      dataIndex: "code",
      visible: true,
      className: "columnTitle",
      width: "15%",
      render: (value, row, index) => {
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
      dataIndex: "code",
      visible: true,
      className: "columnTitle",
      width: "20%",
      render: (value, row, index) => {
        if (value) {
          const selectedChannel = listChannels.find((single) => {
            return single.code === value
          })
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
      render: (value, row, index) => {
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
      render: (value, row, index) => {
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
      render: (value, row, index) => {
        if (value) {
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

  let [queryParams, setQueryParams] = useState({
    page: +(query.get("page") || DEFAULT_PAGINATION.page),
    limit: +(query.get("limit") || DEFAULT_PAGINATION.limit),
    sort_type: "desc",
    sort_column: "updated_date",
    name: query.get("name"),
    department_id: query.get("department_id"),
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

  const handleDelete = () => {
    showLoading();
    deleteMultiOrderSourceService(rowKey).then((response: BaseResponse<any>) => {
      console.log('response', response);
      switch (response.code) {
        case HttpStatus.SUCCESS:
          setTableLoading(true);
          dispatch(
            actionFetchListOrderSources(queryParams, (data: OrderSourceResponseModel) => {
              setListOrderSources(data.items);
              setTotal(data.metadata.total);
            })
          );
          setTableLoading(false);
          break;
        default:
          response.errors.forEach((e) => showError(e));
          break;
      }
    }).catch((error) => {
      showError("Xóa thất bại!");
    }).finally(() => {
      setIsShowConfirmDelete(false);
      hideLoading();
    })
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.DELETE:
          console.log("delete");
          console.log("rowKey", rowKey);
          setIsShowConfirmDelete(true);
      }
    },
    [ACTIONS_INDEX.DELETE, rowKey]
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
    setQueryParams({ ...queryParams });
    history.push(`${UrlConfig.ORDER_SOURCES}?${generateQuery(queryParams)}`);
    window.scrollTo(0, 0);
  };

  const onFilterFormFinish = (values: any) => {
    console.log("values", values);
    const resultParams = {
      ...queryParams,
      ...values,
    };
    handleNavigateByQueryParams(resultParams);
  };

  const renderCardExtraHtml = () => {
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

  const renderConfirmDeleteSubtitle = () => {
    return (
      <React.Fragment>
        Bạn có chắc chắn muốn xóa ?
      </React.Fragment>
    );
  };

  const gotoFirstPage = () => {
    const resultParams = {
      ...queryParams,
      page: 1,
    };
    handleNavigateByQueryParams(resultParams);
  };

  const handleForm = {
    create: (formValues: OrderSourceModel) => {
      console.log('formValues', formValues)
      // return;
      dispatch(
        actionAddOrderSource(formValues, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValues: OrderSourceModel) => {
      if (modalSingleOrderSource) {
        dispatch(
          actionEditOrderSource(modalSingleOrderSource.id, formValues, () => {
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
    setTableLoading(true);
    dispatch(
      actionFetchListOrderSources(queryParams, (data: OrderSourceResponseModel) => {
        setListOrderSources(data.items);
        setTotal(data.metadata.total);
      })
    );
    setTableLoading(false);
  }, [dispatch, queryParams]);

  useEffect(() => {
    if (queryParams) {
      const valuesFromParams: formValueType = {
        name: queryParams.name || undefined,
        department_id: queryParams.department_id ? +queryParams.department_id : undefined,
      };
      form.setFieldsValue(valuesFromParams);
    }
  }, [form, queryParams]);

  // useEffect(() => {
  //   const listDepartmentsFake = [
  //     {
  //       id: 1,
  //       name: "phòng IT",
  //     },
  //     {
  //       id: 2,
  //       name: "phòng Nhân sự",
  //     },
  //   ];
  //   setListDepartments(listDepartmentsFake);
  // }, []);

  useEffect(() => {
    getDepartmentAllApi().then((response: BaseResponse<DepartmentResponse[]>) => {
      console.log('response', response)
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
    }).catch((error) => {
      showError("Có lỗi khi lấy danh sách phòng ban!");
    })
  }, [])

  useEffect(() => {
    getChannelApi().then((response: BaseResponse<ChannelResponse[]>) => {
      console.log('response', response)
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
    }).catch((error) => {
      showError("Có lỗi khi lấy danh sách kênh bán hàng!");
    })
  }, [])

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
              <Form.Item name="name" style={{ width: 450, maxWidth: "100%" }}>
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tên kênh/nguồn"
                />
              </Form.Item>
              <Form.Item name="department_id" style={{ width: 225, maxWidth: "100%" }}>
                <Select
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
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
              <Form.Item style={{ marginRight: 0 }}>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Form.Item>
            </Form>
          </CustomFilter>
          <CustomTable
            isLoading={tableLoading}
            selectedRowKey={rowKey}
            onChangeRowKey={(rowKey) => setRowKey(rowKey)}
            isRowSelection
            showColumnSetting={false}
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
            rowKey={(item: OrderSourceModel) => item.id}
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
        <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          onOk={() => handleDelete()}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Xác nhận"
          subTitle={renderConfirmDeleteSubtitle()}
        />
        <CustomModal
          visible={isShowModal}
          onCreate={(formValue: OrderSourceModel) => handleForm.create(formValue)}
          onEdit={(formValue: OrderSourceModel) => handleForm.edit(formValue)}
          onDelete={() => handleForm.delete()}
          onCancel={() => setIsShowModal(false)}
          modalAction={modalAction}
          componentForm={FormOrderSource}
          formItem={modalSingleOrderSource}
          deletedItemTitle={modalSingleOrderSource?.name}
          modalTypeText="Nguồn đơn hàng"
          moreFormArguments={{ listChannels, listDepartments }}
        />
      </ContentContainer>
    </StyledComponent>
  );
}

export default OrderSources;
