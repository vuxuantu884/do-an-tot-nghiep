import { Button, Card, Form, Input, Select, Table, Tooltip } from "antd"
import ContentContainer from "component/container/content.container"
import { CustomerVisitorsFilter, LocalStorageKey } from "model/report/customer-visitors"
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { getCustomerVisitors, updateCustomerVisitors } from "service/report/analytics.service";
import { callApiNative } from "utils/ApiUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { CustomerVisitorsStyle } from "./index.style"
import UrlConfig from "config/url.config";

function CustomerVisitors() {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [stores, setStores] = useState<Array<StoreResponse>>([]);
    const [yearList, setYearList] = useState<string[]>([]);
    const [customerVisitors, setCustomerVisitors] = useState<any[]>([]);
    const [customerVisitorsUpdate, setCustomerVisitorsUpdate] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([
        {
            title: 'Tên cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
        }
    ]);
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFilter, setIsFilter] = useState<boolean>(true);

    const currentYear = moment().year();
    const numberOfYears = 10;
    const initialFilterValues = {
        [CustomerVisitorsFilter.StoreIds]: [],
        [CustomerVisitorsFilter.Month]: moment().month() + 1,
        [CustomerVisitorsFilter.Year]: currentYear,
    }

    const handleFilter = () => {
        const { storeIds } = form.getFieldsValue();
        localStorage.setItem(LocalStorageKey.CustomerVisitorsStore, JSON.stringify(storeIds));
        setIsFilter(true);
    }

    useEffect(() => {
        const years = [];
        for (let i = currentYear; i > currentYear - numberOfYears; --i) {
            years.push(i.toString());
        }
        setYearList(years);
    }, [currentYear])

    useEffect(() => {
        dispatch(getListStoresSimpleAction((stores) => {
            const storeIds = localStorage.getItem(LocalStorageKey.CustomerVisitorsStore);
            if (storeIds?.length) {
                const validatedStoreIds = JSON.parse(storeIds).filter((storeId: number) => stores.findIndex((item) => item.id === +storeId) !== -1);
                form.setFieldsValue({
                    [CustomerVisitorsFilter.StoreIds]: validatedStoreIds,
                })
            }
            setLoading(false);
            setStores(stores);
        }));
    }, [dispatch, form]);

    useEffect(() => {
        const fetchCustomerVisitors = async () => {
            let monthQuery = moment().month() + 1;
            let yearQuery = moment().year();
            const { storeIds, month, year } = form.getFieldsValue();
            monthQuery = month;
            yearQuery = year;
            setLoadingTable(true);
            setCustomerVisitors([]);
            setColumns([{
                title: 'Tên cửa hàng',
                dataIndex: 'storeName',
                key: 'storeName',
            }]);
            const customerVisitors = await callApiNative({ isShowError: true }, dispatch, getCustomerVisitors, { month: monthQuery, year: yearQuery, storeIds });
            if (customerVisitors) {
                const dataMapper = stores.filter(item => !storeIds.length || storeIds.includes(item.id)).map((store: any) => {
                    const { id, name, code, department } = store;
                    const existedStore = customerVisitors.find((item: any) => item.store_id === id);
                    if (existedStore) {
                        return { storeName: name, code, department, ...existedStore };
                    }
                    const dayValues = Array.from({ length: moment(`${year}-${month}`).daysInMonth() }, (x, i) => {
                        return { [`day${moment().startOf('month').add(i, 'days').format('DD')}`]: 0 }
                    }).reduce((result, item) => {
                        return { ...result, ...item }
                    }, {});
                    return {
                        year, month, storeName: name, code, department, store_id: id, ...dayValues
                    }
                })
                const columnsTmp: any[] = [];
                Array.from({ length: moment(`${year}-${month}`).daysInMonth() }, (x, i) => `${moment().startOf('month').add(i, 'days').format('DD')}`).forEach((day: string) => {
                    const column = {
                        title: day,
                        dataIndex: `day${day}`,
                        key: `day${day}`,
                    }
                    columnsTmp.push(column);
                })
                setColumns((prev) => [...prev, ...columnsTmp, {
                    title: 'Thao tác',
                    dataIndex: 'actions',
                    key: 'actions',
                }])
                setCustomerVisitors(dataMapper);
            }
            setLoadingTable(false);
            setIsFilter(false);
        }
        if (yearList.length && stores.length && isFilter) {
            fetchCustomerVisitors();
        }
    }, [dispatch, form, stores, yearList.length, isFilter])

    const handleChangeVisitors = _.debounce((record: any, key: string, event: any) => {
        const { store_id } = record;
        const exitedStore = customerVisitorsUpdate.find(item => item.store_id === store_id);
        if (!exitedStore) {
            setCustomerVisitorsUpdate([...customerVisitorsUpdate, { ...record, [key]: +event.target.value }]);
        } else {
            setCustomerVisitorsUpdate(customerVisitorsUpdate.map(store => {
                if (store.store_id === store_id) {
                    store[key] = +event.target.value;
                }
                return store;
            }));
        }
    }, 150)

    const handleUpdateCustomerVisitors = async (storeId: any) => {
        const params = customerVisitorsUpdate && customerVisitorsUpdate.find((item: any) => item.store_id === storeId);
        if (params) {
            const response = await callApiNative({ isShowError: true }, dispatch, updateCustomerVisitors, params);
            if (response) {
                showSuccess("Cập nhật lượng khách vào cửa hàng thành công");
            } else {
                showError("Cập nhật lượng khách vào cửa hàng không thành công");
            }
        }
    }

    return (
        <CustomerVisitorsStyle>
            <ContentContainer
                isLoading={loading}
                title={'Nhập số lượng khách vào cửa hàng'}
                breadcrumb={[{
                    name: `Danh sách báo cáo bán hàng`,
                    path: UrlConfig.ANALYTIC_SALES,
                }, { name: 'Nhập số lượng khách vào cửa hàng' }]}
            >
                <Form form={form} name="filter-block" initialValues={initialFilterValues}>
                    <Card bodyStyle={{ paddingBottom: 0, paddingTop: 0 }} title="Bộ lọc">
                        <div className="w-100 d-flex justify-content-start align-items-end">
                            <Form.Item
                                label="Cửa hàng"
                                name={CustomerVisitorsFilter.StoreIds}
                                labelCol={{ span: 24 }}
                                help={false}>
                                <TreeStore
                                    className="input-width"
                                    form={form}
                                    name={CustomerVisitorsFilter.StoreIds}
                                    placeholder="Chọn cửa hàng"
                                    listStore={stores}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Tháng"
                                name={CustomerVisitorsFilter.Month}
                                labelCol={{ span: 24 }}
                                className="px-2"
                                help={false}>
                                <Select
                                    className="input-width"
                                    placeholder="Chọn tháng">
                                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => {
                                        return (
                                            <Select.Option key={month} value={+month}>
                                                Tháng {month}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Năm"
                                name={CustomerVisitorsFilter.Year}
                                labelCol={{ span: 24 }}
                                help={false}>
                                <Select
                                    className="input-width"
                                    placeholder="Chọn năm">
                                    {yearList.map((year) => {
                                        return (
                                            <Select.Option key={year} value={+year}>
                                                Năm {year}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" onClick={() => handleFilter()}>Lọc</Button>
                            </Form.Item>
                        </div>
                    </Card>
                    <Card
                        title="Bảng số lượng khách hàng đến các cửa hàng"
                        headStyle={{ padding: "8px 20px" }}>
                        {
                            customerVisitors && (
                                <Table
                                    dataSource={customerVisitors}
                                    loading={loadingTable}
                                    scroll={{ x: 1000, y: 450 }}
                                    sticky={{ offsetScroll: 55, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
                                    pagination={false}
                                    bordered={true}

                                >
                                    {columns.map((item: any, index: number) => {
                                        return (
                                            <Table.Column<any>
                                                ellipsis
                                                align="center"
                                                className="px-1"
                                                title={
                                                    <Tooltip
                                                        title={item.title}>
                                                        {item.title}
                                                    </Tooltip>
                                                }
                                                fixed={
                                                    index > 0 && index < columns.length - 1
                                                        ? undefined
                                                        : (index === 0 ? 'left' : 'right')
                                                }
                                                key={index}
                                                width={index > 0 ? (index === columns.length - 1 ? 100 : 80) : 150}
                                                render={(record: any) => {
                                                    return (
                                                        index > 0 ? (index === columns.length - 1 ? <Button type="primary" className="px-1" size="small" onClick={() => handleUpdateCustomerVisitors(record.store_id)}>Cập nhật</Button> : <Input style={{ width: "100%" }} defaultValue={record[item.key]} onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()} onChange={(e) => handleChangeVisitors(record, item.key, e)} />) : record[item.key]
                                                    )
                                                }}
                                            />)
                                    })}
                                </Table>
                            )
                        }
                    </Card>
                </Form>
            </ContentContainer>
        </CustomerVisitorsStyle >
    )
}

export default CustomerVisitors

