import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, FormInstance, Input, Menu, Select, Tag } from "antd";
import { useDispatch } from "react-redux";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

import BaseFilter from "component/filter/base.filter";
import { WebAppGetOrdersMappingQuery } from "model/query/web-app.query";
import { SourceResponse } from "model/response/order/source.response";
import { createRef, useEffect, useState } from "react";
import { OrderSyncBaseFilterStyle, OrderSyncFilterStyle } from "./style";
import search from "assets/img/search.svg";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { getWebAppShopList } from "domain/actions/web-app/web-app.actions";


type OrderSyncFilterProps = {
    params: WebAppGetOrdersMappingQuery;
    isLoading: boolean;
    onFilter?: (values: WebAppGetOrdersMappingQuery | Object) => void;
    initQuery: WebAppGetOrdersMappingQuery;
    handleDownloadOrderSelected: () => void;
    onClearFilter?: () => void;
    sourceList: Array<SourceResponse>;
    isSelectedRow: boolean;
}
const CONNECTED_STATUS = [
    {
        title: "Thành công",
        value: "connected",
    },
    {
        title: "Thất bại",
        value: "waiting",
    },
];

const OrderSyncFilter = (props: OrderSyncFilterProps) => {
    const { params, isLoading, onFilter, initQuery, handleDownloadOrderSelected, onClearFilter, sourceList, isSelectedRow } = props;
    const { Item } = Form;
    const { Option } = Select;
    const [formFilter] = Form.useForm();
    const formRef = createRef<FormInstance>();
    const dispatch = useDispatch();

    const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
    const [filterTags, setFilterTags] = useState<Array<any>>();
    const [createdClick, setCreatedClick] = useState('');
    const [shopList, setShopList] = useState<Array<WebAppResponse>>([]);

    const actionList = (
        <Menu>
            <Menu.Item key="orrder-sync" onClick={() => handleDownloadOrderSelected()} disabled={!isSelectedRow}>
                <span>Đồng bộ đơn hàng</span>
            </Menu.Item>
        </Menu>
    );

    //handle clear base filter
    const handleClearBaseFilter = () => {
        setVisibleBaseFilter(false);
        formFilter.setFieldsValue(initQuery);
        onClearFilter && onClearFilter();
    }

    //handle form
    const handleFinish = (values: any) => {
        onFilter && onFilter(values);
    }

    //get shop
    const getShopList = () => {
        dispatch(getWebAppShopList({}, (responseData) => {
            setShopList(responseData);
        }));
    }
    useEffect(() => {
        getShopList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //handle tag
    useEffect(() => {
        let filters = [];
        if (params.source_id && params.source_id > 0) {
            const source = sourceList?.find(source => source.id.toString() === params.source_id?.toString());
            let textSource = source ? source.name : "";
            filters.push({
                key: 'source_id',
                name: 'Nguồn',
                value: textSource
            })
        }
        if (params.shop_ids && params.shop_ids?.length > 0) {
            let textShop = ""
            params.shop_ids.forEach((shop_id: any) => {
                const shop = shopList?.find(shop => shop.id.toString() === shop_id.toString());
                textShop = shop ? textShop + shop.name + "; " : textShop;
            })

            filters.push({
                key: 'shop_ids',
                name: 'Gian hàng',
                value: textShop
            })
        }
        if (params.ecommerce_order_code) {
            filters.push({
                key: 'ecommerce_order_code',
                name: 'ID đơn hàng Sapo',
                value: params.ecommerce_order_code,
            })
        }
        if (params.core_order_code) {
            filters.push({
                key: 'core_order_code',
                name: 'ID đơn hàng',
                value: params.core_order_code,
            })
        }
        if (params.connected_status) {
            const connectStatus = CONNECTED_STATUS.find(
                (item) => item.value === params.connected_status
            );
            filters.push({
                key: "connected_status",
                name: "Trạng thái liên kết",
                value: connectStatus?.title,
            });
        }
        if (params.created_date_from || params.created_date_to) {
            let textOrderCreateDate =
                (params.created_date_from
                    ? ConvertUtcToLocalDate(params.created_date_from, "DD/MM/YYYY")
                    : "??") +
                " ~ " +
                (params.created_date_to
                    ? ConvertUtcToLocalDate(params.created_date_to, "DD/MM/YYYY")
                    : "??");
            filters.push({
                key: "created_date",
                name: "Ngày tạo đơn",
                value: textOrderCreateDate,
            });
        }

        setFilterTags(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, sourceList])
    const handleRemoveTag = (e: any, tag: any) => {
        e.preventDefault();
        let newParams = { ...params };
        if (tag.key === "created_date") {
            newParams = { ...newParams, ...{ created_date_from: null, created_date_to: null } };
            setCreatedClick("");
        }
        else {
            newParams = { ...newParams, ...{ [tag.key]: null } };
        }
        onFilter && onFilter(newParams);
    }

    //set params to form
    useEffect(() => {
        formRef.current?.setFieldsValue({
            source_id: params.source_id,
            ecommerce_order_code: params.ecommerce_order_code,
            core_order_code: params.core_order_code,
            connected_status: params.connected_status,
            created_date_from: params.created_date_from,
            created_date_to: params.created_date_to,
            ecommerce_order_statuses: params.ecommerce_order_statuses,
            page: params.page
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    return (
        <OrderSyncFilterStyle>
            <div className="order-filter">
                <Form
                    ref={formRef}
                    onFinish={handleFinish}
                    className="default-filter"
                    initialValues={params}
                >
                    <Form.Item className="action-dropdown">
                        <Dropdown overlay={actionList} trigger={["click"]}>
                            <Button className="action-button">
                                <div style={{ marginRight: 10 }}>Thao tác</div>
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Form.Item>
                    <Item className="source-dropdown-filter" name="source_id">
                        <Select
                            showArrow
                            allowClear
                            showSearch
                            placeholder="Nguồn đơn hàng"
                            notFoundContent="Không tìm thấy kết quả"
                            optionFilterProp="children"
                            maxTagCount='responsive'
                            disabled={isLoading}
                        >
                            {sourceList && sourceList.map((item, index) => (
                                <Select.Option style={{ width: "100%" }} key={index.toString()} value={item.id.toString()}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Item>
                    <Item className="source-dropdown-filter" name="shop_ids">
                        <Select
                            showArrow
                            mode="multiple"
                            allowClear
                            showSearch
                            placeholder="Gian hàng"
                            notFoundContent="Không tìm thấy kết quả"
                            optionFilterProp="children"
                            maxTagCount='responsive'
                            disabled={isLoading}
                        >
                            {shopList && shopList.map((item, index) => (
                                <Select.Option style={{ width: "100%" }} key={index.toString()} value={item.id.toString()}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Item>
                    <Item name="ecommerce_order_code" className="search-input">
                        <Input
                            disabled={isLoading}
                            prefix={<img src={search} alt="" />}
                            placeholder="ID đơn hàng (Sapo)"
                            onBlur={(e) => {
                                formFilter?.setFieldsValue({
                                    ecommerce_order_code: e.target.value.trim(),
                                });
                            }}
                            onPressEnter={(e: any) => {
                                formFilter.setFieldsValue({
                                    ecommerce_order_code: e.target.value.trim(),
                                });
                            }}
                        />
                    </Item>
                    <Item name="core_order_code" className="search-input">
                        <Input
                            disabled={isLoading}
                            prefix={<img src={search} alt="" />}
                            placeholder="ID đơn hàng"
                            onBlur={(e) => {
                                formFilter?.setFieldsValue({
                                    core_order_code: e.target.value.trim(),
                                });
                            }}
                            onPressEnter={(e: any) => {
                                formFilter.setFieldsValue({
                                    core_order_code: e.target.value.trim(),
                                });
                            }}
                        />
                    </Item>
                    <Item style={{ marginRight: "15px" }}>
                        <Button type="primary" htmlType="submit" disabled={isLoading}>
                            Lọc
                        </Button>
                    </Item>
                    <Item>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setVisibleBaseFilter(true)}
                            disabled={isLoading}>
                            Thêm bộ lọc
                        </Button>
                    </Item>
                </Form>
                <div className="order-filter-tags">
                    {filterTags && filterTags.map((tag: any, index) => {
                        return (
                            <Tag key={index} className="tag" closable onClose={(e) => handleRemoveTag(e, tag)}>{tag.name}: {tag.value}</Tag>
                        )
                    })}
                </div>
                <BaseFilter
                    onClearFilter={handleClearBaseFilter}
                    onFilter={() => {
                        setVisibleBaseFilter(false);
                        formRef?.current?.submit();
                    }}
                    onCancel={() => setVisibleBaseFilter(false)}
                    visible={visibleBaseFilter}
                    className="order-filter-drawer"
                    width={500}>
                    <OrderSyncBaseFilterStyle>
                        <Form
                            ref={formRef}
                            onFinish={handleFinish}
                            initialValues={params}
                            layout="vertical">
                            <Form.Item
                                label={<b>Trạng thái liên kết</b>}
                                name="connected_status">
                                <Select placeholder="Chọn trạng thái" allowClear>
                                    {CONNECTED_STATUS.map((item: any) => (
                                        <Option key={item.value} value={item.value}>
                                            {item.title}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label={<b>NGÀY TẠO ĐƠN</b>}>
                                <CustomRangeDatePicker
                                    fieldNameFrom="created_date_from"
                                    fieldNameTo="created_date_to"
                                    activeButton={createdClick}
                                    setActiveButton={setCreatedClick}
                                    format="DD-MM-YYYY"
                                    formRef={formRef}
                                />
                            </Form.Item>
                        </Form>
                    </OrderSyncBaseFilterStyle>
                </BaseFilter>
            </div>
        </OrderSyncFilterStyle>
    )
}
export default OrderSyncFilter;