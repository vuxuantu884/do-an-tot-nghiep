import { createRef, useEffect, useState } from "react"
import { DownOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Dropdown, Form, FormInstance, Input, Menu, Select, Tag } from "antd"

import BaseFilter from "component/filter/base.filter"
import { WebAppProductQuery } from "model/query/web-app.query"
import { ConvertUtcToLocalDate } from "utils/DateUtils"
import { StyledBaseFilter, StyledProductFilter } from "../../styles"
import CustomRangeDatePicker from "component/custom/new-date-range-picker"

import filterIcon from "assets/icon/filter.svg";
import { WebAppResponse } from "model/response/web-app/ecommerce.response"
import { useDispatch } from "react-redux"
import { getWebAppShopList } from "domain/actions/web-app/web-app.actions"
import moment from "moment"

type ProductFilterProps = {
    params: WebAppProductQuery;
    isLoading?: boolean | undefined;
    onFilter?: (values: WebAppProductQuery | Object) => void;
    actionList: Array<any>;
    type?: string
}

const ProductFilter = (props: ProductFilterProps) => {
    const { params, isLoading, onFilter, actionList, type } = props;

    const form = createRef<FormInstance>();
    const dispatch = useDispatch();

    //state
    const [filterTags, setFilterTags] = useState<Array<any>>([]);
    const [visibleFilterModal, setVisibleFilterModal] = useState(false);
    const [createdClick, setCreatedClick] = useState('');
    const [shopList, setShopList] = useState<Array<WebAppResponse>>([]);

    // useEffect(() => {
    //     if((params.connected_date_from !== null && params.connected_date_from.length > 10) || (params.connected_date_from != null && params.connected_date_from._isUTC)){
    //         params.connected_date_from = ConvertUtcToLocalDate(params.connected_date_from, "DD-MM-YYYY")
    //     }
    //     if((params.connected_date_to !== null && params.connected_date_to.length > 10) || (params.connected_date_to !== null && params.connected_date_to._isUTC)){
    //         params.connected_date_to = ConvertUtcToLocalDate(params.connected_date_to, "DD-MM-YYYY")
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // },[params.connected_date_from,params.connected_date_to])

    //init params
    const initialFormValues: WebAppProductQuery = {
        page: 1,
        limit: 30,
        ecommerce_id: null,
        shop_ids: [],
        connect_status: null,
        update_stock_status: null,
        sku_or_name_core: null,
        sku_or_name_ecommerce: null,
        connected_date_from: null,
        connected_date_to: null,
    }

    //handle form
    const handleFinish = (value: any) => {
        onFilter && onFilter(value);
    }

    const handleClearFilter = () => {
        onFilter && onFilter(initialFormValues);
        setVisibleFilterModal(false);
    }

    //handle remote tag
    const handleRemoveTag = (e: React.MouseEvent<HTMLElement, MouseEvent>, tag: any) => {
        e.preventDefault();
        let newParams = { ...params };
        if (tag.key === "created_date") {
            newParams = { ...newParams, ...{ connected_date_from: null, connected_date_to: null } };
            setCreatedClick("");
        }
        if (tag.key === "shop_ids") {
            newParams = { ...newParams, ...{ shop_ids: [] } };
        }
        else {
            newParams = { ...newParams, ...{ [tag.key]: null } };
        }
        onFilter && onFilter(newParams);
    }

    //render action
    const actionDropdown = () => {
        return (
            <Menu>
                {actionList?.map((item: any) => (
                    <Menu.Item
                        disabled={item.disabled}
                        key={item.id}
                        onClick={item.onClick}
                        icon={item.icon}
                    >
                        {item.name}
                    </Menu.Item>
                ))}
            </Menu>
        )
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

    //handle tag filter
    useEffect(() => {
        //sku sapo
        let filters = [];
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
        if (params.sku_or_name_ecommerce) {
            filters.push({
                key: "sku_or_name_ecommerce",
                name: "Sku, tên sản phẩm (shop)",
                value: params.sku_or_name_ecommerce
            })
        }
        if (params.sku_or_name_core) {
            filters.push({
                key: "sku_or_name_core",
                name: "Sku, tên sản phẩm (Unicorn)",
                value: params.sku_or_name_core
            })
        }
        if (params.connect_status) {
            filters.push({
                key: "connect_status",
                name: "Trạng thái ghép nối",
                value: params.connect_status === "connected" ? "Thành công" : "Chưa ghép nối"
            })
        }
        if (params.update_stock_status) {
            let statusName = "";
            switch (params.update_stock_status) {
                case "done":
                    statusName = "Thành công";
                    break;
                case "in_progress":
                    statusName = "Đang xử lý"
                    break;
                case "error":
                    statusName = "Thất bại"
                    break;
            }
            filters.push({
                key: "update_stock_status",
                name: "Trạng thái đồng bộ tồn kho",
                value: statusName
            });
        }
        if (params.connected_date_from || params.connected_date_to) {
            let text =
                (params.connected_date_from
                    ? moment(params.connected_date_from, "DD-MM-YYYY").format("DD-MM-YYYY")
                    : "??") +
                " ~ " +
                (params.connected_date_to
                    ? moment(params.connected_date_to, "DD-MM-YYYY").format("DD-MM-YYYY")
                    : "??");
            filters.push({
                key: "created_date",
                name: "Ngày ghép nối",
                value: text,
            });
        }
        setFilterTags(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params,shopList])

    //set params to form
    useEffect(() => {
        form.current?.setFieldsValue({
            shop_ids: params.shop_ids,
            sku_or_name_ecommerce: params.sku_or_name_ecommerce,
            sku_or_name_core: params.sku_or_name_core,
            connect_status: params.connect_status,
            update_stock_status: params.update_stock_status,
            connected_date_from: params.connected_date_from,
            connected_date_to: params.connected_date_to
        }); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    return (
        <StyledProductFilter>
            <div className="filter">
                <Form
                    ref={form}
                    onFinish={handleFinish}
                    initialValues={params}
                >
                    <div className="action-dropdown">
                        <Dropdown
                            overlay={actionDropdown}
                            trigger={["click"]}
                            disabled={isLoading}>
                            <Button className="action-button">
                                <div style={{ marginRight: 10 }}>Thao tác</div>
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                    </div>
                    <Form.Item className="source-dropdown-filter" name="shop_ids">
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
                    </Form.Item>
                    <Form.Item name="sku_or_name_ecommerce" className="search-ecommerce-product">
                        <Input
                            disabled={isLoading}
                            prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                            placeholder="SKU, tên sản phẩm (Sapo)"
                        />
                    </Form.Item>
                    <Form.Item name="sku_or_name_core" className="search-yody-product">
                        <Input
                            disabled={isLoading}
                            prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                            placeholder="SKU, Sản phẩm Yody"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginRight: 10 }}>
                        <Button type="primary" htmlType="submit" disabled={isLoading}>
                            Lọc
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => setVisibleFilterModal(true)} disabled={isLoading}>
                            <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
                            <span>Thêm bộ lọc</span>
                        </Button>
                    </Form.Item>
                </Form>
                <div className="order-filter-tags">
                    {filterTags && filterTags.map((filter: any, index: any) => {
                        return (
                            <Tag key={index} className="tag" closable onClose={(e) => handleRemoveTag(e, filter)}>{filter.name}: {filter.value}</Tag>
                        )
                    })}
                </div>
            </div>
            <BaseFilter
                onClearFilter={handleClearFilter}
                onFilter={() => {
                    setVisibleFilterModal(false);
                    form?.current?.submit();
                }}
                onCancel={() => setVisibleFilterModal(false)}
                visible={visibleFilterModal}
                width={400}
                className="order-filter-drawer2">
                <StyledBaseFilter>
                    <Form
                        ref={form}
                        onFinish={handleFinish}
                        initialValues={params}
                        layout="vertical">
                        {
                            type !== "connected" && (
                                <Form.Item name="connect_status" label={<b>TRẠNG THÁI GHÉP NỐI</b>}>
                                    <Select
                                        showSearch
                                        placeholder="Chọn trạng thái ghép nối"
                                        allowClear>
                                        <Select.Option key={1} value="connected">
                                            Thành công
                                        </Select.Option>
                                        <Select.Option key={2} value="waiting">
                                            Chưa ghép nối
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            )
                        }
                        <Form.Item
                            name="update_stock_status"
                            label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}>
                            <Select
                                showSearch
                                placeholder="Chọn trạng thái đồng bộ tồn kho"
                                allowClear>
                                <Select.Option key={1} value="done">
                                    Thành công
                                </Select.Option>
                                <Select.Option key={2} value="in_progress">
                                    Đang xử lý
                                </Select.Option>
                                <Select.Option key={2} value="error">
                                    Thất bại
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label={<b>NGÀY GHÉP NỐI</b>}>
                            <CustomRangeDatePicker
                                fieldNameFrom="connected_date_from"
                                fieldNameTo="connected_date_to"
                                activeButton={createdClick}
                                setActiveButton={setCreatedClick}
                                format="DD-MM-YYYY"
                                formRef={form}
                            />
                        </Form.Item>
                    </Form>
                </StyledBaseFilter>
            </BaseFilter>
        </StyledProductFilter>
    )
}
export default ProductFilter;