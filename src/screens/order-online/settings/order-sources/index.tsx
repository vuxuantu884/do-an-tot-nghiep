import {PlusOutlined} from "@ant-design/icons";
import {Button, Card, Form, Input, Select} from "antd";
import search from "assets/img/search.svg";
import ContentContainer from "component/container/content.container";
import FormOrderSource from "component/forms/FormOrderSource";
import CustomModal from "component/modal/CustomModal";
import {MenuAction} from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  actionAddOrderSource,
  actionDeleteOrderSource,
  actionEditOrderSource,
  actionFetchListOrderSources,
} from "domain/actions/settings/order-sources.action";
import {modalActionType} from "model/modal/modal.model";
import {
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory, useLocation} from "react-router-dom";
import {generateQuery} from "utils/AppUtils";
import iconChecked from "./images/iconChecked.svg";
import {StyledComponent} from "./styles";

type formValueType = {
  tenKenhNguon: string | undefined;
  tenPhongBan: number | undefined;
};

function OrderSources() {
  const ACTIONS_INDEX = {
    EXPORT: 1,
    DELETE: 2,
  };
  const DEFAULT_PAGINATION = {
    page: 1,
    limit: 5,
  };
  const initFilterParams: formValueType = {
    tenKenhNguon: "",
    tenPhongBan: undefined,
  };
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
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
  const [listCompany, setListCompany] = useState<any[]>([]);

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "Mã kênh",
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
      title: "Áp dụng cho đơn hàng",
      dataIndex: "active",
      visible: true,
      width: "25%",
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
      width: "20%",
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
    sort_column: "id",
    tenKenhNguon: query.get("tenKenhNguon"),
    tenPhongBan: query.get("tenPhongBan"),
  });

  const onPageChange = useCallback(
    (page, size) => {
      queryParams.page = page;
      queryParams.limit = size;
      let queryParam = generateQuery(queryParams);
      setQueryParams({...queryParams});
      history.replace(`${UrlConfig.ORDER_SOURCES}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.DELETE:
          console.log("delete");
          console.log("rowKey", rowKey);
          break;
      }
    },
    [ACTIONS_INDEX.DELETE, rowKey]
  );

  const actions: Array<MenuAction> = [
    {
      id: ACTIONS_INDEX.EXPORT,
      name: "Export 2",
    },
    {
      id: ACTIONS_INDEX.DELETE,
      name: "Xóa 2",
    },
  ];

  const handleNavigateByQueryParams = (queryParams: any) => {
    setQueryParams({...queryParams});
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

  const gotoFirstPage = () => {
    const resultParams = {
      ...queryParams,
      page: 1,
    };
    handleNavigateByQueryParams(resultParams);
  };

  const handleForm = {
    create: (formValue: OrderSourceModel) => {
      dispatch(
        actionAddOrderSource(formValue, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValue: OrderSourceModel) => {
      if (modalSingleOrderSource) {
        dispatch(
          actionEditOrderSource(modalSingleOrderSource.id, formValue, () => {
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
        setTableLoading(false);
      })
    );
  }, [dispatch, queryParams]);

  useEffect(() => {
    if (queryParams) {
      const valuesFromParams: formValueType = {
        tenKenhNguon: queryParams.tenKenhNguon || undefined,
        tenPhongBan: queryParams.tenPhongBan ? +queryParams.tenPhongBan : undefined,
      };
      form.setFieldsValue(valuesFromParams);
    }
  }, [form, queryParams]);

  useEffect(() => {
    const listCompanyFake = [
      {
        id: 1,
        name: "phòng IT",
      },
      {
        id: 2,
        name: "phòng Nhân sự",
      },
    ];
    setListCompany(listCompanyFake);
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
              <Form.Item name="tenKenhNguon" style={{width: 522, maxWidth: "100%"}}>
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tên kênh/nguồn"
                />
              </Form.Item>
              <Form.Item name="tenPhongBan" style={{width: 170, maxWidth: "100%"}}>
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
                  {listCompany &&
                    listCompany.map((single) => {
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
        />
      </ContentContainer>
    </StyledComponent>
  );
}

export default OrderSources;
