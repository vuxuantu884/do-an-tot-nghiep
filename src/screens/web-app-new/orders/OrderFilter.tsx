import { DeleteFilled, DownOutlined, FilterOutlined, SwapRightOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, Form, FormInstance, Input, InputNumber, Menu, Row, Select, Tag, TreeSelect } from "antd";
import { createRef, useCallback, useEffect, useState } from "react";
import { StyledOrderFilter, OrderBaseFilterStyle } from "./style";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import CustomSelect from "component/custom/select.custom";
import TreeStore from "component/tree-node/tree-store";
import { EcommerceOrderSearchQuery, OrderSearchQuery } from "model/order/order.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { OrderProcessingStatusModel, OrderProcessingStatusResponseModel } from "model/response/order-processing-status.response";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import { OrderStatus } from "utils/Order.constants";
import { useDispatch, useSelector } from "react-redux";
import { getSourceListAction, getWebAppShopList } from "domain/actions/web-app/web-app.actions";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction, searchAccountPublicAction } from "domain/actions/account/account.action";
import { SaveSearchType } from "utils/SaveSearchType";
import SaveSearchModal from "component/modal/SaveSearchModal/SaveSearchModal";
import { getSaveSearchLocalStorage } from "utils/LocalStorageUtils";
import { generateQuery } from "utils/AppUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { searchAccountPublicApi } from "service/accounts/account.service";
import moment from "moment";

type OrderFilterProps = {
    params: EcommerceOrderSearchQuery;
    actionList: Array<any>;
    accounts: Array<any>;
    deliveryService?: Array<any>;
    listPaymentMethod?: Array<PaymentMethodResponse>;
    isLoading?: boolean | undefined;
    onFilter?: (values: OrderSearchQuery | Object) => void;
    onShowColumnSetting?: () => void;
    onClearFilter?: () => void;
    initParams?: EcommerceOrderSearchQuery;
    changeActiveTabSaveSearch?: () => void;
    deleteSaveSearch?: () => void;
    isShowButtonRemoveSaveSearch?: boolean;
}

const OrderFilter = (props: OrderFilterProps) => {
    const { params, actionList, isLoading, accounts, onFilter, initParams, onClearFilter,
        changeActiveTabSaveSearch, deleteSaveSearch, isShowButtonRemoveSaveSearch } = props;

    const formRef = createRef<FormInstance>();
    const [form] = Form.useForm();
    const { Item } = Form;
    const dispatch = useDispatch();
    const user = useSelector((state: RootReducerType) => state.userReducer.account);

    //state
    const [accountList, setAccountList] = useState<Array<AccountResponse>>([]);
    const [assigneeFound, setAssigneeFound] = useState<Array<AccountResponse>>([]);
    const [storeList, setStoreList] = useState<Array<StoreResponse>>();
    const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);
    const [subStatusList, setSubStatusList] = useState<OrderProcessingStatusModel[]>([]);
    const [filterTags, setFilterTags] = useState<Array<any>>();
    const [isShowFilterModal, setIsShowFilterModal] = useState(false);
    const [isShowSaveSearchModal, setIsShowSaveSearchModal] = useState(false);
    const [disableButtonSaveSearch, setDisableButtonSaveSearch] = useState(true);
    const [issuedClick, setIssuedClick] = useState('');
    const [completedClick, setCompletedClick] = useState('');
    const [cancelledClick, setCancelledClick] = useState('');
    const [shopList, setShopList] = useState<Array<WebAppResponse>>([]);

    //render element
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
    
    useEffect(() => {
        if (accounts) {
            setAccountList(accounts);
        }
    }, [accounts]);

    useEffect(() => {
        if (params.assignee_codes && params.assignee_codes?.length > 0) {
            searchAccountPublicApi({
                codes: params.assignee_codes,
            }).then((response) => {
                setAssigneeFound(response.data.items);
            });
        }
    }, [params.assignee_codes])

    //get init data filter
    useEffect(() => {
        const getSourceList = () => {
            dispatch(getSourceListAction((result: Array<SourceResponse>) => {
                if (result) {
                    setSourceList(result);
                }
            }))
        }
        const getStoreList = () => {
            dispatch(StoreGetListAction((setStoreList)));
        }
        const getSubStatusList = () => {
            dispatch(actionFetchListOrderProcessingStatus(
                {},
                (data: OrderProcessingStatusResponseModel) => {
                    setSubStatusList(data.items);
                }
            )
            );
        }
        getStoreList();
        getSourceList();
        getSubStatusList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //handle tag
    useEffect(() => {
        let filters = [];
        // if (params.assignee_codes && params.assignee_codes.length > 0) {
        //     let text = "";
        //     params.assignee_codes?.forEach(i => {
        //         let account = accountList.find(item => item.code === i);
        //         text = account ? text + account.full_name + " - " + account.code + "; " : text
        //     })
        //     filters.push({
        //         key: "assignee_codes",
        //         name: "Sku, tên sản phẩm (shop)",
        //         value: text
        //     })
        // }
        if (params.store_ids && params.store_ids.length > 0) {
            let text = "";
            params.store_ids.forEach((store_id: any) => {
                const store = storeList?.find(store => store.id.toString() === store_id.toString())
                text = store ? text + store.name + "; " : text
            })
            filters.push({
                key: 'store_ids',
                name: 'Cửa hàng',
                value: text
            })
        }
        if (params.ecommerce_shop_ids && params.ecommerce_shop_ids.length > 0) {
            let text = "";
            params.ecommerce_shop_ids.forEach((shop_id: any) => {
                const shop = shopList?.find(shop => shop.id.toString() === shop_id.toString())
                text = shop ? text + shop.name + "; " : text
            })
            filters.push({
                key: 'ecommerce_shop_ids',
                name: 'Gian hàng',
                value: text
            })
        }
        if (params.source_ids?.length > 0) {
            let textSource = ""
            params.source_ids.forEach((source_id: any) => {
                const source = sourceList?.find(source => source.id.toString() === source_id.toString());
                textSource = source ? textSource + source.name + "; " : textSource;
            })

            filters.push({
                key: 'source_ids',
                name: 'Nguồn',
                value: textSource
            })
        }
        if (params.issued_on_min || params.issued_on_max) {
            let text = (params.issued_on_min ? moment(params.issued_on_min, "DD-MM-YYYY").format("DD-MM-YYYY"): '??')
                + " ~ " + (params.issued_on_max ? moment(params.issued_on_max, "DD-MM-YYYY").format("DD-MM-YYYY") : '??')
            filters.push({
                key: 'issued',
                name: 'Ngày tạo đơn',
                value: text
            })
        }
        if (params.completed_on_min || params.completed_on_max) {
            let textOrderCompleteDate = (params.completed_on_min ? moment(params.completed_on_min, "DD-MM-YYYY").format("DD-MM-YYYY") : '??') + " ~ " + (params.completed_on_max ? moment(params.completed_on_max, "DD-MM-YYYY").format("DD-MM-YYYY") : '??')
            filters.push({
                key: 'completed',
                name: 'Ngày hoàn tất đơn',
                value: textOrderCompleteDate
            })
        }
        if (params.cancelled_on_min || params.cancelled_on_max) {
            let textOrderCancelDate = (params.cancelled_on_min ? moment(params.cancelled_on_min, "DD-MM-YYYY").format("DD-MM-YYYY") : '??') + " ~ " + (params.cancelled_on_max ? moment(params.cancelled_on_max, "DD-MM-YYYY").format("DD-MM-YYYY") : '??')
            filters.push({
                key: 'cancelled',
                name: 'Ngày huỷ đơn',
                value: textOrderCancelDate
            })
        }
        if (params.sub_status_code && params.sub_status_code.length) {
            let textStatus = ""

            params.sub_status_code.forEach((statusCode: any) => {
                const findStatus = subStatusList?.find(item => item.code.toString() === statusCode.toString())
                textStatus += findStatus ? textStatus + findStatus.sub_status + "; " : textStatus
            })
            filters.push({
                key: 'sub_status_code',
                name: 'Trạng thái xử lý đơn',
                value: textStatus
            })
        }
        if (params.order_status && params.order_status.length > 0) {
            let textStatus = ""
            params.order_status.forEach(i => {
                textStatus += OrderStatus.getName(i) + "; ";
            })
            filters.push({
                key: 'order_status',
                name: 'Trạng thái đơn hàng',
                value: textStatus
            })
        }
        if (params.assignee_codes && params.assignee_codes.length > 0) {
            let textAccount = ""
            params.assignee_codes.forEach(i => {
                const findAccount = assigneeFound?.find(item => item.code === i)
                textAccount = findAccount ? textAccount + findAccount.code + " - " + findAccount.full_name + "; " : textAccount
            })
            filters.push({
                key: 'assignee_codes',
                name: 'Nhân viên bán hàng',
                value: textAccount
            })
        }
        if (params.price_min || params.price_max) {
            let textPrice = (params.price_min ? `${params.price_min} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : " 0 ") + " ~ " + (params.price_max ? `${params.price_max} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : " ?? ")
            filters.push({
                key: 'price',
                name: 'Tổng tiền',
                value: textPrice
            })
        }
        if (params.search_term) {
            filters.push({
                key: 'search_term',
                name: 'ID đơn hàng, SĐT KH',
                value: params.search_term
            })
        }
        if (params.customer_note) {
            filters.push({
                key: 'customer_note',
                name: 'Ghi chú của khách',
                value: params.customer_note
            })
        }
        if (params.marketing_campaign && params.marketing_campaign.length > 0) {
            let text = "";
            for (let i = 0; i < params.marketing_campaign.length; i++) {
                if (i < params.marketing_campaign.length - 1) {
                    text = text + params.marketing_campaign[i] + " ";
                } else {
                    text = text + params.marketing_campaign[i];
                }
            }
            filters.push({
                key: "marketing_campaign",
                name: "Marketing Campaign",
                value: text,
            });
        }
        setFilterTags(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, storeList, sourceList, assigneeFound, shopList])

    const handleRemoveTag = useCallback( (e: any, tag: any) => {
        e.preventDefault();
        let newParams = { ...params };
        if (tag.key === "issued") {
            newParams = { ...newParams, ...{ issued_on_min: null, issued_on_max: null } };
            setIssuedClick("");
        }
        else if (tag.key === "completed") {
            newParams = { ...newParams, ...{ completed_on_min: null, completed_on_max: null } };
            setCompletedClick("");
        }
        else if (tag.key === "cancelled") {
            newParams = { ...newParams, ...{ cancelled_on_min: null, cancelled_on_max: null } };
            setCancelledClick("")
        }
        else if (tag.key === "price") {
            newParams = { ...newParams, ...{ price_min: undefined, price_max: undefined } };
        }
        else if (tag.key === "assignee_codes") {
            newParams = { ...newParams, assignee_codes:[] };
        }
        else if (tag.key === "ecommerce_shop_ids") {
            newParams = { ...newParams, ecommerce_shop_ids: [] };
        }
        else if (tag.key === "order_status") {
            newParams = { ...newParams, order_status: [] };
        }
        else if (tag.key === "search_term") {
            newParams = { ...newParams, search_term: null };
        }
        else if (tag.key === "store_ids") {
            newParams = { ...newParams, store_ids: [] };
        }
        else if (tag.key === "sub_status_code") {
            newParams = { ...newParams, sub_status_code: [] };
        }
        else if (tag.key === "customer_note") {
            newParams = { ...newParams, customer_note: null };
        }
        else if (tag.key === "source_ids") {
            newParams = { ...newParams, source_ids: [] };
        }
        else if (tag.key === "marketing_campaign") {
            newParams = { ...newParams, marketing_campaign: [] };
        }
        else {
            newParams = { ...newParams, ...{ [tag.key]: null } };
        }
        onFilter && onFilter(newParams);
    },[onFilter,params])

    //handle form
    const handleFinish = (value: any) => {
        onFilter && onFilter(value);
    }
    const handleClearBaseFilter = () => {
        setIsShowFilterModal(false);
        form.setFieldsValue(initParams);
        onClearFilter && onClearFilter();
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

    //set params to form
    useEffect(() => {
        formRef.current?.setFieldsValue({
            source_ids: params.source_ids,
            assignee_codes: params.assignee_codes,
            store_ids: params.store_ids,
            issued_on_min: params.issued_on_min,
            issued_on_max: params.issued_on_max,
            completed_on_min: params.completed_on_min,
            completed_on_max: params.completed_on_max,
            cancelled_on_min: params.cancelled_on_min,
            cancelled_on_max: params.cancelled_on_max,
            order_status: params.order_status,
            sub_status_code: params.sub_status_code,
            price_min: params.price_min,
            price_max: params.price_max,
            customer_note: params.customer_note,
            marketing_campaign: params.marketing_campaign,
            ecommerce_shop_ids: params.ecommerce_shop_ids,
            search_term: params.search_term
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    //handle save search
    useEffect(() => {
        let key = "savesearch";
        let value = getSaveSearchLocalStorage(key);
        let result: Array<any> = [];
        if (value) {
            result = JSON.parse(value)
            result = result.filter((a) => {
                return a.userId === user?.id && a.type === SaveSearchType.WEBAPP_ORDER;
            });
        }
        let paramQuery = generateQuery(params);
        let saveSearch = result.find((a) => a.value === paramQuery && a.userId === user?.id && a.type === SaveSearchType.WEBAPP_ORDER);
        if (saveSearch) {
            setDisableButtonSaveSearch(true);
        }
        else {
            let newParam = { ...params };
            newParam.page = null;
            newParam.limit = null;
            let newParamQuery = generateQuery(newParam);
            if (newParamQuery === "") {
                setDisableButtonSaveSearch(true);
            }
            else {
                setDisableButtonSaveSearch(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])
    const handleSaveSearch = () => {
        setIsShowSaveSearchModal(false);
        setDisableButtonSaveSearch(true);
        if (changeActiveTabSaveSearch) {
            changeActiveTabSaveSearch();
        }
    }

    return (
        <StyledOrderFilter>
            <div className="order-filter">
                <Form
                    onFinish={handleFinish}
                    ref={formRef}
                    initialValues={params}
                >
                    <Form.Item className="action-dropdown">
                        <Dropdown overlay={actionDropdown} trigger={["click"]} disabled={isLoading}>
                            <Button className="action-button">
                                <div style={{ marginRight: 5 }}>Thao tác</div>
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Form.Item>
                    <Form.Item className="source-dropdown-filter" name="source_ids">
                        <Select
                            mode="multiple"
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
                    </Form.Item>
                    <Item name="ecommerce_shop_ids" className="search-id-order-ecommerce">
                        <TreeSelect
                            placeholder="Chọn gian hàng"
                            treeDefaultExpandAll
                            className="selector"
                            allowClear
                            showArrow
                            showSearch
                            multiple
                            treeCheckable
                            treeNodeFilterProp="title"
                            maxTagCount="responsive"
                        >
                            {shopList?.map((item: any) => (
                                <TreeSelect.TreeNode
                                    key={item.id}
                                    value={item.id}
                                    title={item.name}
                                />
                            ))}
                        </TreeSelect>
                    </Item>
                    <Form.Item name="search_term" className="search-term-input">
                        <Input
                            disabled={isLoading}
                            prefix={<img src={search} alt="" />}
                            placeholder="ID đơn hàng, SĐT KH"
                            onBlur={(e) => {
                                form?.setFieldsValue({
                                    search_term: e.target.value.trim(),
                                });
                            }}
                        />
                    </Form.Item>
                    <div style={{ marginRight: "10px" }}>
                        <Button type="primary" htmlType="submit" disabled={isLoading}>Lọc</Button>
                    </div>
                    <div style={{ marginRight: "10px" }}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setIsShowFilterModal(true)}
                            disabled={isLoading}
                        >
                            Thêm bộ lọc
                        </Button>
                    </div>
                    <div style={{ marginRight: "10px" }}>
                        <Button
                            type="primary"
                            disabled={disableButtonSaveSearch}
                            onClick={() => setIsShowSaveSearchModal(true)}
                        >
                            Lưu bộ lọc
                        </Button>
                    </div>
                    {isShowButtonRemoveSaveSearch && (
                        <div style={{ marginRight: "10px" }}>
                            <Button
                                icon={<DeleteFilled />}
                                onClick={deleteSaveSearch}
                            >
                            </Button>
                        </div>
                    )}
                </Form>
                <div className="order-filter-tags">
                    {filterTags && filterTags.map((tag: any, index) => {
                        return (
                            <Tag key={index} className="tag" closable onClose={(e) => handleRemoveTag(e, tag)}>{tag.name}: {tag.value}</Tag>
                        )
                    })}
                </div>
                <SaveSearchModal
                    visible={isShowSaveSearchModal}
                    type={SaveSearchType.WEBAPP_ORDER}
                    params={params}
                    onCancel={() => setIsShowSaveSearchModal(false)}
                    onOK={() => handleSaveSearch()}
                />
                <BaseFilter
                    onClearFilter={handleClearBaseFilter}
                    onFilter={() => {
                        setIsShowFilterModal(false);
                        formRef?.current?.submit();
                    }}
                    onCancel={() => setIsShowFilterModal(false)}
                    visible={isShowFilterModal}
                    className="order-filter-drawer"
                    width={1000}
                >
                    <Form
                        onFinish={handleFinish}
                        ref={formRef}
                        initialValues={params}
                        layout="vertical"
                    >
                        <OrderBaseFilterStyle>
                            <Row gutter={20}>
                                <Col span={24}>
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <p>Kho cửa hàng</p>
                                            <Item name="store_ids">
                                                <TreeStore listStore={storeList} placeholder="Cửa hàng" notFoundContent="Không tìm thấy kết quả" style={{ width: '100%' }} />
                                            </Item>
                                        </Col>
                                        <Col span={8}>
                                            <p>Trạng thái đơn</p>
                                            <Item name="order_status">
                                                <CustomSelect
                                                    mode="multiple" allowClear
                                                    showSearch placeholder="Chọn trạng thái đơn hàng"
                                                    notFoundContent="Không tìm thấy kết quả" style={{ width: '100%' }}
                                                    optionFilterProp="children" showArrow
                                                    getPopupContainer={trigger => trigger.parentNode}
                                                    maxTagCount='responsive'
                                                >
                                                    {OrderStatus.getAll().map((item, index) => (
                                                        <CustomSelect.Option key={index} value={item}>
                                                            {OrderStatus.getName(item)}
                                                        </CustomSelect.Option>
                                                    ))}
                                                </CustomSelect>
                                            </Item>
                                        </Col>
                                        <Col span={8}>
                                            <p>Trạng thái xử lý đơn hàng</p>
                                            <Item
                                                className="select-sub-status"
                                                name="sub_status_code"
                                            >
                                                <Select
                                                    mode="multiple"
                                                    showSearch
                                                    showArrow
                                                    allowClear
                                                    placeholder="TT xử lý đơn"
                                                    notFoundContent="Không tìm thấy kết quả"
                                                    disabled={isLoading}
                                                    optionFilterProp="children"
                                                    maxTagCount='responsive'
                                                >
                                                    {subStatusList && subStatusList?.map((item: any) => (
                                                        <Select.Option key={item.id} value={item.code?.toString()}>
                                                            {item.sub_status}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <p>Ngày tạo đơn</p>
                                            <CustomRangeDatePicker
                                                fieldNameFrom="issued_on_min"
                                                fieldNameTo="issued_on_max"
                                                activeButton={issuedClick}
                                                setActiveButton={setIssuedClick}
                                                format="DD-MM-YYYY"
                                                formRef={formRef}
                                            />
                                        </Col>
                                        <Col span={8} style={{ marginBottom: '20px' }}>
                                            <p>Ngày hoàn tất đơn</p>
                                            <CustomRangeDatePicker
                                                fieldNameFrom="completed_on_min"
                                                fieldNameTo="completed_on_max"
                                                activeButton={completedClick}
                                                setActiveButton={setCompletedClick}
                                                format="DD-MM-YYYY"
                                                formRef={formRef}
                                            />
                                        </Col>
                                        <Col span={8} style={{ marginBottom: '20px' }}>
                                            <p>Ngày huỷ đơn</p>
                                            <CustomRangeDatePicker
                                                fieldNameFrom="cancelled_on_min"
                                                fieldNameTo="cancelled_on_max"
                                                activeButton={cancelledClick}
                                                setActiveButton={setCancelledClick}
                                                format="DD-MM-YYYY"
                                                formRef={formRef}
                                            />
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <p>Nhân viên bán hàng</p>
                                            <Item name="assignee_codes" >
                                                <AccountCustomSearchSelect
                                                    placeholder="chọn nhân viên bán hàng"
                                                    dataToSelect={accountList}
                                                    setDataToSelect={setAccountList}
                                                    initDataToSelect={accounts}
                                                    mode="multiple"
                                                    getPopupContainer={(trigger: any) => trigger.parentNode}
                                                    maxTagCount="responsive"
                                                />
                                            </Item>
                                        </Col>
                                        <Col span={8}>
                                            <p>Tổng tiền</p>
                                            <div className="date-range" style={{ display: "flex", alignItems: "center" }}>
                                                <Item name="price_min" style={{ width: '45%', marginBottom: 0 }}>
                                                    <InputNumber
                                                        className="price_min"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        placeholder="Từ"
                                                        min="0"
                                                        max="100000000"
                                                        style={{ width: "100%" }}
                                                    />
                                                </Item>
                                                <div className="swap-right-icon" style={{ width: "10%", textAlign: "center" }}><SwapRightOutlined /></div>
                                                <Item name="price_max" style={{ width: '45%', marginBottom: 0 }}>
                                                    <InputNumber
                                                        className="site-input-right price_max"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        placeholder="Đến"
                                                        min="0"
                                                        max="1000000000"
                                                        style={{ width: "100%" }}
                                                    />
                                                </Item>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <Item name="customer_note" label="Ghi chú của khách">
                                                <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                                            </Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <Item name="marketing_campaign" label="Marketing Campaign">
                                                <CustomSelect
                                                    mode="tags"
                                                    optionFilterProp="children"
                                                    showSearch
                                                    showArrow
                                                    allowClear
                                                    placeholder="Điền 1 hoặc nhiều tag"
                                                    style={{ width: "100%" }}
                                                />
                                            </Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </OrderBaseFilterStyle>
                    </Form>
                </BaseFilter>
            </div>
        </StyledOrderFilter>
    )
}
export default OrderFilter;