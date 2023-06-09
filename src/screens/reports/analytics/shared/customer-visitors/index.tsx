import { Button, Card, Form, Input, Select, Table, Tooltip } from "antd";
import ContentContainer from "component/container/content.container";
import TreeStore from "component/CustomTreeSelect";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import _ from "lodash";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CustomerVisitorsFilter, LocalStorageKey } from "model/report/customer-visitors";
import moment from "moment";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomerVisitorsType } from "screens/reports/common/enums/customer-visitors-type.enum";
import { getCustomerVisitors, updateCustomerVisitors } from "service/report/analytics.service";
import { callApiNative } from "utils/ApiUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { strForSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { CustomerVisitorsStyle } from "./index.style";

export interface CustomerVisitorsProps {
  source: CustomerVisitorsType;
  title: string;
  name: string;
  employee: string;
  tableTitle: string;
}

function CustomerVisitors(props: CustomerVisitorsProps) {
  const { source, title, name, employee, tableTitle } = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [accountList, setAccountList] = useState<any[]>([]);
  const [dayList, setDayList] = useState<string[]>([]);
  const [yearList, setYearList] = useState<string[]>([]);
  const [customerVisitors, setCustomerVisitors] = useState<any[]>([]);
  const [customerVisitorsUpdate, setCustomerVisitorsUpdate] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([
    {
      title: "Tên cửa hàng",
      dataIndex: "storeName",
      key: "storeName",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "assignee_code",
      key: "assignee_code",
    },
  ]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFilter, setIsFilter] = useState<boolean>(true);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [spEmployeeList, setSpEmployeeList] = useState<any[]>([]);

  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const startYear = 2018;
  const initialFilterValues = {
    [CustomerVisitorsFilter.StoreIds]: [],
    [CustomerVisitorsFilter.Day]: null,
    [CustomerVisitorsFilter.Month]: currentMonth,
    [CustomerVisitorsFilter.Year]: currentYear,
    [CustomerVisitorsFilter.AssigneeCodes]: [],
  };
  const allStaffCode = "Tất cả NV";

  const setDayListByMonth = useCallback(() => {
    const { year, month } = form.getFieldsValue();
    const yearValue = year || currentYear;
    const monthValue = month || currentMonth;
    const daysInMonth = Array.from(
      { length: moment(`${yearValue}-${monthValue}`, "YYYY-M").daysInMonth() },
      (x, i) => {
        return `${moment(`${yearValue}-${monthValue}`, "YYYY-M")
          .startOf("month")
          .add(i, "days")
          .format("DD")}`;
      },
    );
    setDayList(daysInMonth);
  }, [currentMonth, currentYear, form]);

  const onSelectDay = () => {
    const { day } = form.getFieldsValue();
    setAccountList(
      _.uniqBy(
        [
          ...employeeList,
          ...spEmployeeList.filter((item) => !day || item[`day${day > 9 ? day : "0" + day}`]),
        ],
        "code",
      ),
    );
  };

  const onSelectMonth = () => {
    form.setFieldsValue({
      day: undefined,
    });
    setDayListByMonth();
  };

  const onSelectYear = () => {
    form.setFieldsValue({
      day: undefined,
    });
    setDayListByMonth();
  };

  const getStaff = useCallback(
    async (condition?: string) => {
      const { storeIds, day, month, year } = form.getFieldsValue();
      if (!stores.length || !storeIds?.length || storeIds?.length > 1) {
        return;
      }
      const customerVisitors: any[] = await callApiNative(
        { isShowError: true },
        dispatch,
        getCustomerVisitors,
        {
          month,
          year,
          storeIds,
          source,
        },
      );
      const inputAccounts = customerVisitors.map((item) => {
        return {
          code: item.assignee_code.toUpperCase(),
          full_name: item.assignee_name,
          ...item,
        };
      });
      setSpEmployeeList(inputAccounts);
      dispatch(
        searchAccountPublicAction(
          { store_ids: storeIds.join(","), status: "active", condition, limit: 200 },
          (data: PageResponse<AccountResponse> | false) => {
            const staffIds = localStorage.getItem(LocalStorageKey.SatffAssigneeCode);
            if (staffIds && JSON.parse(staffIds).length) {
              let validatedStaffIds = JSON.parse(staffIds);
              if (data && data.items?.length) {
                validatedStaffIds = validatedStaffIds.filter((item: string) => {
                  return (
                    data.items.findIndex(
                      (staffItem) =>
                        staffItem.code.toLocaleLowerCase() === item.toLocaleLowerCase(),
                    ) !== -1
                  );
                });
              } else {
                validatedStaffIds = [];
              }
              form.setFieldsValue({
                [CustomerVisitorsFilter.AssigneeCodes]: validatedStaffIds,
              });
            } else {
              form.setFieldsValue({
                [CustomerVisitorsFilter.AssigneeCodes]: [],
              });
            }
            if (data) {
              setEmployeeList(data.items);
              setAccountList(
                _.uniqBy(
                  [
                    ...data.items,
                    ...inputAccounts.filter(
                      (item) => !day || item[`day${day > 9 ? day : "0" + day}`],
                    ),
                  ],
                  "code",
                ),
              );
            } else {
              setAccountList(inputAccounts);
            }
          },
        ),
      );
    },
    [dispatch, form, source, stores.length],
  );

  const setTableColumns = useCallback(() => {
    const { day, month, year } = form.getFieldsValue();
    let columnsTmp: any[] = [];
    Array.from(
      { length: moment(`${year}-${month}`, "YYYY-M").daysInMonth() },
      (x, i) =>
        `${moment(`${year}-${month}`, "YYYY-M").startOf("month").add(i, "days").format("DD")}`,
    ).forEach((day: string) => {
      const diffDay = moment(`${day}-${month}-${year}`, "DD-M-YYYY").diff(moment(), "days", true);

      const column = {
        title: day,
        dataIndex: `day${day}`,
        key: `day${day}`,
        isToday: currentYear === year && currentMonth === month && +day === +moment().date(),
        disabled: diffDay < -3 || diffDay > 0,
      };
      columnsTmp.push(column);
    });
    if (day) {
      columnsTmp = columnsTmp.filter((item) => +item.title === day);
    }
    setColumns((prev) => [
      ...prev,
      ...columnsTmp,
      {
        title: "Thao tác",
        dataIndex: "actions",
        key: "actions",
      },
    ]);
  }, [currentMonth, currentYear, form]);

  useEffect(() => {
    getStaff();
  }, [getStaff]);

  const handleFilter = () => {
    const { storeIds, assigneeCodes } = form.getFieldsValue();
    localStorage.setItem(LocalStorageKey.CustomerVisitorsStore, JSON.stringify(storeIds));
    localStorage.setItem(LocalStorageKey.SatffAssigneeCode, JSON.stringify(assigneeCodes));
    if (!storeIds.length) {
      return;
    }
    setIsFilter(true);
  };

  useEffect(() => {
    const years = [];
    for (let i = currentYear; i >= startYear; --i) {
      years.push(i.toString());
    }
    setYearList(years);
  }, [currentYear]);

  useEffect(() => {
    setDayListByMonth();
  }, [setDayListByMonth]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((storesRes) => {
        let permissionStores = storesRes;
        if (myStores?.length) {
          permissionStores = permissionStores.filter((store) => {
            return myStores.findIndex((item: any) => item.store_id === store.id) !== -1;
          });
        }
        const storeIds = localStorage.getItem(LocalStorageKey.CustomerVisitorsStore);
        if (storeIds && JSON.parse(storeIds).length) {
          const validatedStoreIds = JSON.parse(storeIds).filter(
            (storeId: number) => permissionStores.findIndex((item) => item.id === +storeId) !== -1,
          );
          form.setFieldsValue({
            [CustomerVisitorsFilter.StoreIds]: validatedStoreIds,
          });
        } else {
          if (myStores?.length) {
            form.setFieldsValue({
              [CustomerVisitorsFilter.StoreIds]: myStores.map((item: any) => item.store_id),
            });
          }
        }
        setLoading(false);
        setStores(permissionStores);
      }),
    );
  }, [dispatch, form, myStores]);

  useEffect(() => {
    const { storeIds, month, year, assigneeCodes } = form.getFieldsValue();
    const fetchCustomerVisitors = async () => {
      let monthQuery = moment().month() + 1;
      let yearQuery = moment().year();
      monthQuery = month;
      yearQuery = year;
      setLoadingTable(true);
      setCustomerVisitors([]);
      setColumns([
        {
          title: "Tên cửa hàng",
          dataIndex: "storeName",
          key: "storeName",
        },
        {
          title: "Nhân viên",
          dataIndex: "assignee_code",
          key: "assignee_code",
        },
      ]);
      let customerVisitors: any[] = await callApiNative(
        { isShowError: true },
        dispatch,
        getCustomerVisitors,
        {
          month: monthQuery,
          year: yearQuery,
          storeIds,
          // assigneeCodes,
          source,
        },
      );
      if (!customerVisitors) {
        showError(`Lỗi khi lấy số lượng ${name}`);
        setLoadingTable(false);
        setIsFilter(false);
      }
      const dataMapper: any = [];
      const customerVisitorsOfStore: any[] = customerVisitors
        .filter(
          (item) => item.assignee_code.toLocaleLowerCase() !== allStaffCode.toLocaleLowerCase(),
        )
        .reduce((res, item) => {
          const existedStoreIdx = res.findIndex(
            (storeItem: any) => storeItem.store_id === item.store_id,
          );
          if (existedStoreIdx === -1) {
            res.push({ ...item, assignee_name: allStaffCode, assignee_code: allStaffCode });
          } else {
            Object.keys(item).forEach((key) => {
              if (key.includes("day")) {
                res[existedStoreIdx][key] += item[key];
              }
            });
          }
          return res;
        }, []);
      if (assigneeCodes.length && storeIds.length === 1) {
        const storeInfo = stores.find((store) => store.id === storeIds[0]);
        assigneeCodes.forEach((assigneeCode: any) => {
          const accountInfo = accountList.find(
            (accountItem) =>
              accountItem.code.toLocaleLowerCase() === assigneeCode.toLocaleLowerCase(),
          );
          const dayValues = Array.from(
            { length: moment(`${year}-${month}`, "YYYY-M").daysInMonth() },
            (x, i) => {
              return {
                [`day${moment(`${year}-${month}`, "YYYY-M")
                  .startOf("month")
                  .add(i, "days")
                  .format("DD")}`]: 0,
              };
            },
          ).reduce((result, item) => {
            return { ...result, ...item };
          }, {});
          let customerVisitorValue: any = {};
          if (customerVisitors.length) {
            customerVisitorValue = customerVisitors.find(
              (item) => item.assignee_code.toLocaleLowerCase() === assigneeCode.toLocaleLowerCase(),
            );
          }

          dataMapper.push({
            year,
            month,
            ...dayValues,
            storeName: storeInfo?.name,
            code: storeInfo?.code,
            department: storeInfo?.department,
            store_id: storeInfo?.id,
            assignee_name: accountInfo?.full_name,
            assignee_code: accountInfo?.code?.toLocaleLowerCase(),
            ...customerVisitorValue,
          });
        });
        setCustomerVisitors([
          ...customerVisitorsOfStore.map((item) => {
            return {
              ...item,
              storeName: storeInfo?.name,
              code: storeInfo?.code,
              department: storeInfo?.department,
            };
          }),
          ...dataMapper,
        ]);
        setTableColumns();
        setLoadingTable(false);
        setIsFilter(false);
        return;
      }

      storeIds.forEach((storeId: any) => {
        const storeInfo = stores.find((store) => store.id === storeId);
        const customerVisitor = customerVisitorsOfStore.find((item) => item.store_id === storeId);
        const dayValues = Array.from(
          { length: moment(`${year}-${month}`, "YYYY-M").daysInMonth() },
          (x, i) => {
            return {
              [`day${moment(`${year}-${month}`, "YYYY-M")
                .startOf("month")
                .add(i, "days")
                .format("DD")}`]: 0,
            };
          },
        ).reduce((result, item) => {
          return { ...result, ...item };
        }, {});
        if (!customerVisitor) {
          dataMapper.push({
            assignee_code: allStaffCode,
            assignee_name: allStaffCode,
            year,
            month,
            ...dayValues,
            storeName: storeInfo?.name,
            code: storeInfo?.code,
            department: storeInfo?.department,
          });
        } else {
          dataMapper.push({
            year,
            month,
            ...dayValues,
            storeName: storeInfo?.name,
            code: storeInfo?.code,
            department: storeInfo?.department,
            ...customerVisitor,
          });
        }
      });
      setCustomerVisitors(dataMapper);
      setTableColumns();

      setLoadingTable(false);
      setIsFilter(false);
    };
    if (
      yearList.length &&
      stores.length &&
      ((accountList.length && storeIds.length === 1) || storeIds.length > 1) &&
      isFilter
    ) {
      fetchCustomerVisitors();
    }
  }, [
    accountList,
    dispatch,
    form,
    isFilter,
    name,
    setTableColumns,
    source,
    stores,
    yearList.length,
  ]);

  const onChangeStore = () => {
    getStaff();
    form.setFieldsValue({
      [CustomerVisitorsFilter.AssigneeCodes]: [],
    });
    localStorage.removeItem(LocalStorageKey.SatffAssigneeCode);
  };

  const handleChangeVisitors = _.debounce((record: any, item: any, event: any) => {
    const { store_id, assignee_code } = record;
    const { key, disabled } = item;
    if (disabled) {
      return;
    }

    const exitedStore = customerVisitorsUpdate.find(
      (item) =>
        item.store_id === store_id &&
        item.assignee_code.toLowerCase() === assignee_code.toLowerCase(),
    );
    if (!exitedStore) {
      setCustomerVisitorsUpdate([
        ...customerVisitorsUpdate,
        { ...record, [key]: +event.target.value },
      ]);
    } else {
      setCustomerVisitorsUpdate(
        customerVisitorsUpdate.map((store) => {
          if (
            store.store_id === store_id &&
            store.assignee_code.toLowerCase() === assignee_code.toLowerCase()
          ) {
            store[key] = +event.target.value;
          }
          return store;
        }),
      );
    }
  }, 150);

  const handleUpdateCustomerVisitors = async (storeId: any, assigneeCode: string) => {
    setLoadingTable(true);
    const { storeIds, assigneeCodes } = form.getFieldsValue();
    if (storeIds.length && !assigneeCodes.length) {
      showError(`Vui lòng chọn nhân viên để cập nhật ${name} theo nhân từng viên`);
      setLoadingTable(false);
      return;
    }
    const params =
      customerVisitorsUpdate &&
      customerVisitorsUpdate.find(
        (item: any) =>
          item.store_id === storeId &&
          item.assignee_code.toLowerCase() === assigneeCode.toLowerCase(),
      );
    if (params && params.assignee_code.toLowerCase() === allStaffCode.toLowerCase()) {
      showError(`Vui lòng bấm lọc để tiếp tục cập nhật ${name} theo nhân viên đã chọn`);
      setLoadingTable(false);
      return;
    }
    if (params) {
      const response: any = await callApiNative(
        { isShowError: true },
        dispatch,
        updateCustomerVisitors,
        { ...params, source },
      );
      if (response) {
        showSuccess(`Cập nhật lượng ${name} thành công`);
      } else {
        showError(`Cập nhật lượng ${name} không thành công`);
      }
    }
    setLoadingTable(false);
    setIsFilter(true);
  };

  const onClickDay = (selectedDay: string) => {
    const { day } = form.getFieldsValue();
    if (+day !== +selectedDay) {
      form.setFieldsValue({ [CustomerVisitorsFilter.Day]: +selectedDay });
      handleFilter();
    }
  };

  const currentDayElm = document.querySelector(".current-day");
  useLayoutEffect(() => {
    if (currentDayElm) {
      currentDayElm.scrollIntoView({
        block: "center",
        behavior: "auto",
        inline: "center",
      });
    }
  }, [currentDayElm]);

  return (
    <CustomerVisitorsStyle>
      <ContentContainer
        isLoading={loading}
        title={title}
        breadcrumb={[
          {
            name: `Danh sách báo cáo bán lẻ`,
            path: UrlConfig.ANALYTIC_SALES_OFFLINE,
          },
          { name: title },
        ]}
      >
        <Form
          form={form}
          name="filter-block"
          initialValues={initialFilterValues}
          className="customer-visitors-wrapper"
        >
          <Card bodyStyle={{ paddingBottom: 0, paddingTop: 0 }} title="Bộ lọc">
            <div className="filter-container d-flex justify-content-start align-items-start pt-2 pb-1">
              <Form.Item
                name={CustomerVisitorsFilter.StoreIds}
                className="input-width filter-item"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng",
                  },
                ]}
              >
                <TreeStore
                  placeholder="Chọn cửa hàng"
                  storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                  onChange={() => onChangeStore()}
                />
              </Form.Item>
              <Form.Item
                name={CustomerVisitorsFilter.AssigneeCodes}
                className="input-width filter-item"
              >
                <Select
                  placeholder={`Chọn ${employee}`}
                  mode="multiple"
                  maxTagCount="responsive"
                  allowClear
                  filterOption={(input: String, option: any) => {
                    if (option.props.value) {
                      return strForSearch(option.props.children).includes(strForSearch(input));
                    }
                    return false;
                  }}
                  disabled={form.getFieldsValue().storeIds?.length > 1}
                >
                  {accountList.map((accountItem) => {
                    return (
                      <Select.Option
                        key={accountItem.code}
                        value={accountItem.code.toLocaleLowerCase()}
                      >
                        {accountItem.full_name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item name={CustomerVisitorsFilter.Day} className="filter-item" help={false}>
                <Select placeholder="Chọn ngày" allowClear onChange={() => onSelectDay()}>
                  {dayList.map((day) => {
                    return (
                      <Select.Option key={day} value={+day}>
                        Ngày {day}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item name={CustomerVisitorsFilter.Month} className="filter-item" help={false}>
                <Select placeholder="Chọn tháng" onChange={() => onSelectMonth()}>
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(
                    (month) => {
                      return (
                        <Select.Option key={month} value={+month}>
                          Tháng {month}
                        </Select.Option>
                      );
                    },
                  )}
                </Select>
              </Form.Item>
              <Form.Item name={CustomerVisitorsFilter.Year} className="filter-item" help={false}>
                <Select placeholder="Chọn năm" onChange={() => onSelectYear()}>
                  {yearList.map((year) => {
                    return (
                      <Select.Option key={year} value={+year}>
                        Năm {year}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item className="filter-item">
                <Button type="primary" onClick={() => handleFilter()}>
                  Lọc
                </Button>
              </Form.Item>
            </div>
            <div className="pb-2">
              <em className="text-primary">
                Lưu ý: Chỉ được chọn 1 cửa hàng khi muốn nhập {name} theo từng nhân viên
              </em>
            </div>
          </Card>
          <Card title={`Bảng số lượng ${tableTitle}`} headStyle={{ padding: "8px 20px" }}>
            {customerVisitors && (
              <Table
                dataSource={customerVisitors}
                loading={loadingTable}
                scroll={{ x: "max-content" }}
                sticky={{ offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
                pagination={{ defaultPageSize: 30, showSizeChanger: false }}
                bordered={true}
                className="customer-visitors-table"
              >
                {columns.map((item: any, index: number) => {
                  return (
                    <Table.Column<any>
                      align="center"
                      className="px-1 x-table-cell"
                      title={
                        <Tooltip
                          title={
                            item.key.includes("day")
                              ? item.isToday
                                ? "Hôm nay"
                                : `${item.title}/${form.getFieldValue(
                                    CustomerVisitorsFilter.Month,
                                  )}/${form.getFieldValue(CustomerVisitorsFilter.Year)}`
                              : item.title
                          }
                        >
                          <span
                            className={
                              item.isToday ? "text-primary cursor-pointer" : "cursor-pointer"
                            }
                            onClick={() => onClickDay(item.title)}
                          >
                            {item.title}
                          </span>
                        </Tooltip>
                      }
                      fixed={
                        index > 1 && index < columns.length - 1
                          ? undefined
                          : index <= 1
                          ? "left"
                          : "right"
                      }
                      key={index}
                      width={index > 1 ? (index === columns.length - 1 ? 100 : 80) : 160}
                      render={(record: any) => {
                        return index > 0 && item.key !== "assignee_code" ? (
                          index === columns.length - 1 ? (
                            <Button
                              type="primary"
                              className="px-1"
                              size="small"
                              onClick={() =>
                                handleUpdateCustomerVisitors(record.store_id, record.assignee_code)
                              }
                            >
                              Cập nhật
                            </Button>
                          ) : (
                            <div className={item.isToday ? "current-day" : ""}>
                              <Input
                                type="text"
                                key={record["storeName"] + item.key}
                                style={{ width: "100%" }}
                                defaultValue={!!record[item.key] ? record[item.key] : undefined}
                                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                onChange={(e) => handleChangeVisitors(record, item, e)}
                                disabled={item.disabled || record?.assignee_code === allStaffCode}
                              />
                            </div>
                          )
                        ) : item.key !== "assignee_code" ? (
                          record[item.key]
                        ) : record.assignee_code === allStaffCode ? (
                          record.assignee_name
                        ) : (
                          `${record.assignee_code} - ${record.assignee_name}`
                        );
                      }}
                    />
                  );
                })}
              </Table>
            )}
          </Card>
        </Form>
      </ContentContainer>
    </CustomerVisitorsStyle>
  );
}

export default CustomerVisitors;
