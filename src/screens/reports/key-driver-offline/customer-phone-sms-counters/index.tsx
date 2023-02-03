import { Button, Card, Form, Input, Select, Table, Tooltip } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import _ from "lodash";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  CustomerPhoneSMSCountersFilter,
  CustomerPhoneSMSCountersParams,
  DataSource,
  dataSources,
  EntityName,
  entityNames,
  LocalStorageKey,
  LoyaltyLevel,
} from "model/report";
import moment from "moment";
import { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffectOnce } from "react-use";
import TreeStore from "component/CustomTreeSelect";
import {
  getCustomerPhoneSMSCounters,
  updateCustomerPhoneSMSCounters,
} from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { CustomerPhoneSMSCountersStyle } from "./index.style";

function CustomerPhoneSMSCounters() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [yearList, setYearList] = useState<string[]>([]);
  const [loyaltyLevels, setLoyaltyLevels] = useState<string[]>([]);
  const [customerPhoneSMSCounters, setCustomerPhoneSMSCounters] = useState<any[]>([]);
  const [customerPhoneSMSCountersUpdate, setCustomerPhoneSMSCountersUpdate] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([
    {
      title: "Tên cửa hàng",
      dataIndex: "storeName",
      key: "storeName",
    },
  ]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFilter, setIsFilter] = useState<boolean>(true);

  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const startYear = 2018;
  const initialFilterValues = {
    [CustomerPhoneSMSCountersFilter.StoreIds]: [],
    [CustomerPhoneSMSCountersFilter.Month]: currentMonth,
    [CustomerPhoneSMSCountersFilter.Year]: currentYear,
    [CustomerPhoneSMSCountersFilter.EntityName]: EntityName.CALL,
    [CustomerPhoneSMSCountersFilter.DataSource]: DataSource.StoreData,
  };

  const myAccount = useSelector((state: RootReducerType) => state.userReducer.account);

  const handleFilter = () => {
    const { storeIds } = form.getFieldsValue();
    localStorage.setItem(LocalStorageKey.CustomerPhoneSMSCountersStore, JSON.stringify(storeIds));
    setIsFilter(true);
  };

  useEffectOnce(() => {
    const years = [];
    for (let i = currentYear; i >= startYear; --i) {
      years.push(i.toString());
    }
    setYearList(years);
    setLoyaltyLevels(() => {
      return Object.keys(LoyaltyLevel).map((key) => {
        return (LoyaltyLevel as any)[key];
      });
    });
  });

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        const storeIds = localStorage.getItem(LocalStorageKey.CustomerPhoneSMSCountersStore);
        if (storeIds && JSON.parse(storeIds).length) {
          const validatedStoreIds = JSON.parse(storeIds).filter(
            (storeId: number) => stores.findIndex((item) => item.id === +storeId) !== -1,
          );
          form.setFieldsValue({
            [CustomerPhoneSMSCountersFilter.StoreIds]: validatedStoreIds,
          });
        } else {
          if (myStores?.length) {
            form.setFieldsValue({
              [CustomerPhoneSMSCountersFilter.StoreIds]: myStores.map((item: any) => item.store_id),
            });
          }
        }
        setLoading(false);
        setStores(stores);
      }),
    );
  }, [dispatch, form, myStores]);

  useEffect(() => {
    const fetchCustomerCounters = async () => {
      let monthQuery = moment().month() + 1;
      let yearQuery = moment().year();
      const { storeIds, month, year, entityName, loyaltyLevel, dataSource } = form.getFieldsValue();
      monthQuery = month;
      yearQuery = year;
      setLoadingTable(true);
      setCustomerPhoneSMSCounters([]);
      setColumns([
        {
          title: "Tên cửa hàng",
          dataIndex: "storeName",
          key: "storeName",
        },
      ]);
      let params: CustomerPhoneSMSCountersParams = {
        month: monthQuery,
        year: yearQuery,
        storeIds,
        entityName,
        loyaltyLevel,
      };
      if (myAccount?.code && dataSource === DataSource.MyData) {
        params = { ...params, reportedBy: myAccount.code };
      }
      if (!loyaltyLevel) {
        params = { ...params, mergeLoyaltyLevel: true };
      }
      const customerCounters = await callApiNative(
        { isShowError: true },
        dispatch,
        getCustomerPhoneSMSCounters,
        params,
      );
      if (customerCounters) {
        const dataMapper = stores
          .filter((item) => !storeIds.length || storeIds.includes(item.id))
          .map((store: any) => {
            const { id, name, code, department } = store;
            const existedStore = customerCounters.find((item: any) => item.store_id === id);
            if (existedStore) {
              return { storeName: name, code, department, ...existedStore };
            }
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
            return {
              year,
              month,
              storeName: name,
              code,
              department,
              store_id: id,
              ...dayValues,
            };
          });
        const columnsTmp: any[] = [];
        Array.from(
          { length: moment(`${year}-${month}`, "YYYY-M").daysInMonth() },
          (x, i) =>
            `${moment(`${year}-${month}`, "YYYY-M").startOf("month").add(i, "days").format("DD")}`,
        ).forEach((day: string) => {
          const column = {
            title: day,
            dataIndex: `day${day}`,
            key: `day${day}`,
            isToday: currentYear === year && currentMonth === month && +day === +moment().date(),
          };
          columnsTmp.push(column);
        });

        setColumns((prev) => [
          ...prev,
          ...columnsTmp,
          {
            title: "Thao tác",
            dataIndex: "actions",
            key: "actions",
          },
        ]);
        setCustomerPhoneSMSCounters(dataMapper);
      }
      setLoadingTable(false);
      setIsFilter(false);
    };
    if (yearList.length && stores.length && isFilter) {
      fetchCustomerCounters();
    }
  }, [
    dispatch,
    form,
    stores,
    yearList.length,
    isFilter,
    currentYear,
    currentMonth,
    myAccount?.code,
  ]);

  const handleChangeCounters = _.debounce((record: any, key: string, event: any) => {
    const { store_id } = record;
    const exitedStore = customerPhoneSMSCountersUpdate.find((item) => item.store_id === store_id);
    if (!exitedStore) {
      setCustomerPhoneSMSCountersUpdate([
        ...customerPhoneSMSCountersUpdate,
        { ...record, [key]: +event.target.value },
      ]);
    } else {
      setCustomerPhoneSMSCountersUpdate(
        customerPhoneSMSCountersUpdate.map((store) => {
          if (store.store_id === store_id) {
            store[key] = +event.target.value;
          }
          return store;
        }),
      );
    }
  }, 150);

  const handleUpdateCustomerCounters = async (storeId: any) => {
    const { entityName, loyaltyLevel, dataSource } = form.getFieldsValue();
    if (dataSource === DataSource.StoreData) {
      showError(
        "Vui lòng chuyển nguồn dữ liệu sang Dữ liệu của tôi để thực hiện chức năng Cập nhật",
      );
      return;
    }
    if (!loyaltyLevel) {
      showError("Vui lòng chọn hạng khách hàng để thực hiện chức năng Cập nhật");
      return;
    }
    const params =
      customerPhoneSMSCountersUpdate &&
      customerPhoneSMSCountersUpdate.find((item: any) => item.store_id === storeId);
    if (params) {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        updateCustomerPhoneSMSCounters,
        {
          ...params,
          reported_by: myAccount?.code,
          reported_name: myAccount?.full_name,
          entity_name: entityName,
          loyalty_level: loyaltyLevel,
        },
      );
      if (response) {
        showSuccess(
          `Cập nhật lượng ${entityName === EntityName.SMS ? "SMS" : "cuộc gọi"} thành công`,
        );
      } else {
        showError(
          `Cập nhật lượng ${entityName === EntityName.SMS ? "SMS" : "cuộc gọi"} không thành công`,
        );
      }
    }
    setIsFilter(true);
  };
  const currentDay = document.querySelector(".current-day");
  useLayoutEffect(() => {
    if (currentDay) {
      currentDay.scrollIntoView({
        block: "center",
        behavior: "auto",
        inline: "center",
      });
    }
  }, [currentDay]);

  return (
    <CustomerPhoneSMSCountersStyle>
      <ContentContainer
        isLoading={loading}
        title={"Nhập số lượng cuộc gọi đi/SMS đi tin"}
        breadcrumb={[
          {
            name: `Báo cáo kết quả kinh doanh Offline`,
            path: UrlConfig.KEY_DRIVER_OFFLINE,
          },
          { name: "Nhập số lượng cuộc gọi đi/SMS đi tin" },
        ]}
      >
        <Form
          form={form}
          name="filter-block"
          initialValues={initialFilterValues}
          className="customer-counters-wrapper"
        >
          <Card bodyStyle={{ paddingBottom: 0, paddingTop: 0 }} title="Bộ lọc">
            <div className="filter-container d-flex justify-content-start align-items-end py-3">
              <Form.Item
                name={CustomerPhoneSMSCountersFilter.StoreIds}
                className="input-width filter-item"
                help={false}
              >
                <TreeStore
                  placeholder="Chọn cửa hàng"
                  storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                />
              </Form.Item>
              <Form.Item
                name={CustomerPhoneSMSCountersFilter.Month}
                className="input-width filter-item"
                help={false}
              >
                <Select placeholder="Chọn tháng">
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
              <Form.Item
                name={CustomerPhoneSMSCountersFilter.Year}
                className="input-width filter-item"
                help={false}
              >
                <Select placeholder="Chọn năm">
                  {yearList.map((year) => {
                    return (
                      <Select.Option key={year} value={+year}>
                        Năm {year}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name={CustomerPhoneSMSCountersFilter.EntityName}
                className="input-width filter-item"
                help={false}
              >
                <Select placeholder="Cuộc gọi/SMS">
                  {entityNames.map((entityName) => {
                    return (
                      <Select.Option key={entityName.value} value={entityName.value}>
                        {entityName.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name={CustomerPhoneSMSCountersFilter.LoyaltyLevel}
                className="input-width filter-item"
                help={false}
              >
                <Select allowClear placeholder="Hạng khách hàng">
                  {loyaltyLevels.map((loyaltyLevel) => {
                    return (
                      <Select.Option key={loyaltyLevel} value={loyaltyLevel}>
                        {loyaltyLevel}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name={CustomerPhoneSMSCountersFilter.DataSource}
                className="input-width filter-item"
                help={false}
              >
                <Select placeholder="Nguồn dữ liệu">
                  {dataSources.map((dataSource) => {
                    return (
                      <Select.Option key={dataSource.value} value={dataSource.value}>
                        {dataSource.name}
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
          </Card>
          <Card
            title="Bảng số lượng khách hàng đến các cửa hàng"
            headStyle={{ padding: "8px 20px" }}
          >
            {customerPhoneSMSCounters && (
              <Table
                dataSource={customerPhoneSMSCounters}
                loading={loadingTable}
                scroll={{ x: 1000 }}
                sticky={{ offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
                pagination={{ defaultPageSize: 30, showSizeChanger: false }}
                bordered={true}
                className="customer-counters-table"
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
                                    CustomerPhoneSMSCountersFilter.Month,
                                  )}/${form.getFieldValue(CustomerPhoneSMSCountersFilter.Year)}`
                              : item.title
                          }
                        >
                          <span className={item.isToday ? "text-primary" : ""}>{item.title}</span>
                        </Tooltip>
                      }
                      fixed={
                        index > 0 && index < columns.length - 1
                          ? undefined
                          : index === 0
                          ? "left"
                          : "right"
                      }
                      key={index}
                      width={index > 0 ? (index === columns.length - 1 ? 100 : 80) : 160}
                      render={(record: any) => {
                        return index > 0 ? (
                          index === columns.length - 1 ? (
                            <Button
                              type="primary"
                              className="px-1"
                              size="small"
                              onClick={() => handleUpdateCustomerCounters(record.store_id)}
                            >
                              Cập nhật
                            </Button>
                          ) : (
                            <div className={item.isToday ? "current-day" : ""}>
                              <Input
                                type="text"
                                key={record["storeName"] + item.key}
                                style={{ width: "100%" }}
                                defaultValue={record[item.key]}
                                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                onChange={(e) => handleChangeCounters(record, item.key, e)}
                              />
                            </div>
                          )
                        ) : (
                          record[item.key]
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
    </CustomerPhoneSMSCountersStyle>
  );
}

export default CustomerPhoneSMSCounters;
