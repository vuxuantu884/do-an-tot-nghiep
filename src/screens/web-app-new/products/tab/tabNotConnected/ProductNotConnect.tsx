import { Button, Card, Dropdown, Form, Input, Menu, Modal, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import { useDispatch } from "react-redux";

import CustomTable from "component/table/CustomTable";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { WebAppProductQuery } from "model/query/web-app.query";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import ConnectedItemActionColumn from "./ActionColumn";
import AutoCompleteProduct from "./AutoCompleteProduct";
import { deleteWebAppProductAction, getWebAppProductAction, getWebAppShopList, putConnectWebAppProductAction } from "domain/actions/web-app/web-app.actions";
import { StyledProductFilter } from "../../styles";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { showError, showSuccess } from "utils/ToastUtils";
import circleDeleteIcon from "assets/icon/circle-delete.svg";
import ConnectProductByExcel from "./ConnectProductByExcel";
import ConfirmConnectProductModal from "./ConfirmConnectProductModal";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";

type ProductNotConnectProps = {
    handleMappingVariantJob: (x: any) => void;
    exportFileProduct?: (variantData: any, selectedRows: any, params: any) => void;
    getVariantData?: (variantData: any) => void;
    isReloadData?: boolean;
}

const ProductNotConnect = (props: ProductNotConnectProps) => {
    const { handleMappingVariantJob, exportFileProduct, getVariantData, isReloadData } = props;

    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    //permisson
    const productsConnectPermission = [EcommerceProductPermission.products_update];
    const productsDeletePermission = [EcommerceProductPermission.products_delete];
    const [allowProductsConnect] = useAuthorization({
        acceptPermissions: productsConnectPermission,
        not: false,
    });
    const [allowProductsDelete] = useAuthorization({
        acceptPermissions: productsDeletePermission,
        not: false,
    });

    //state
    const [isLoading, setIsLoading] = useState(false);
    const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
    const [isVisibleConcatenateByExcelModal, setIsVisibleConcatenateByExcelModal] = useState(false);
    const [isShowConfirmConnectModal, setIsShowConfirmConnectModal] = useState(false);
    const [variantDiffPriceList, setVariantDiffPriceList] = useState<Array<any>>([]);
    const [selectedRows, setSelectedRows] = useState<Array<any>>([]);
    const [idsSelected, setIdsSelected] = useState<Array<any>>([]);
    const [suggestConnect, setSuggestConnect] = useState("suggest");
    const [shopList, setShopList] = useState<Array<WebAppResponse>>([]);

    //state params
    const initialParams: WebAppProductQuery = {
        page: 1,
        limit: 30,
        ecommerce_id: null,
        shop_ids: [],
        connect_status: "waiting",
        update_stock_status: null,
        sku_or_name_core: null,
        sku_or_name_ecommerce: null,
        connected_date_from: null,
        connected_date_to: null,
    }
    const queryParamsParsed: { [key: string]: string | (string | null)[] | null; } = queryString.parse(
        location.search
    );
    let dataParam: WebAppProductQuery = {
        ...initialParams,
        ...getQueryParamsFromQueryString(queryParamsParsed),
        suggest: window.localStorage.getItem("suggest"),
    };
    const [params, setParams] = useState<WebAppProductQuery>(dataParam)

    //data
    const [variantData, setVariantData] = useState<PageResponse<any>>({
        metadata: {
            limit: 30,
            page: 1,
            total: 0,
        },
        items: [],
    });
    const variantDataRef = useRef(variantData);

    // update connect item
    const handleUpdateSkuCoreToLineItem = (item: any) => {
        if (variantDataRef.current) {
            let index = variantDataRef.current.items.findIndex(a => a.id === item.id);
            if (index !== -1) {
                let variant = variantDataRef.current.items[index];
                variant.core_sku = item.core_sku;
                variant.core_variant_id = item.core_variant_id;
                variant.core_variant = item.core_variant;
                variant.core_price = item.core_price;
                variant.core_product_id = item.core_product_id;
                variantDataRef.current.items[index] = variant;
                setVariantData(variantDataRef.current);
            }
        }
    }

    //handle delete item
    const handleDeleteItem = (item: any) => {
        setIsShowDeleteItemModal(true);
        setIdsSelected([item.id])
    };
    const handleDeleteMultiItem = () => {
        setIsShowDeleteItemModal(true);
        let ids = selectedRows.map(a => {
            return a.id;
        })
        setIdsSelected(ids);
    }
    const handleConfirmDeleteItem = () => {
        setIsShowDeleteItemModal(false);
        dispatch(
            deleteWebAppProductAction(idsSelected, (result) => {
                if (result) {
                    showSuccess("Xóa sản phẩm thành công");
                    getVariantList();
                    let rows = [...selectedRows];
                    rows = rows.filter(a => {
                        return !idsSelected.includes(a.id);
                    });
                    setSelectedRows(rows);
                }
            })
        );
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

    //handle select table row
    const handleSelectTableRow = (rows: Array<any>) => {
        rows = rows.filter((row: any) => {
            return row !== undefined;
        });
        setSelectedRows(rows);
    }

    //handle change page
    const handleChangePage = (page: any, limit: any) => {
        let newParams = { ...params, page, limit };
        setParams(newParams);
        window.scrollTo(0, 0);
        let queryParam = generateQuery(newParams);
        history.push(`${location.pathname}?${queryParam}`);
    }

    //handle suggest connect item
    const handleSuggestItem = () => {
        let sugguest = "";
        if (suggestConnect === "suggest") {
            sugguest = "suggested";
        }
        else {
            sugguest = "suggest";
        }
        let newParams = { ...params };
        newParams.suggest = sugguest;
        setParams(newParams);
        setSuggestConnect(sugguest);
    }

    //handle connect variant
    const handleConnectMultiProduct = () => {
        let variantDiffPrice: Array<any> = [];
        let variantConnects = selectedRows.filter(a => {
            return a.core_sku !== null
        })
        if (variantConnects.length === 0) {
            showError("Vui lòng chọn Sản phẩm (Unicorn) để ghép nối");
        }
        else {
            variantConnects.forEach((row) => {
                if (row.core_price && row.ecommerce_price !== row.core_price) {
                    variantDiffPrice.push(row);
                }
            })
            if (variantDiffPrice.length > 0) {
                setIsShowConfirmConnectModal(true);
                setVariantDiffPriceList(variantDiffPrice);
            }
            else {
                connectProduct();
            }
        }
    }

    const connectProduct = () => {
        let variantConnect: Array<any> = selectedRows.filter(a => {
            return a.core_sku !== null
        })
        let requestVariant = variantConnect.map(item => {
            return {
                id: item.id,
                core_variant_id: item.core_variant_id,
                core_sku: item.core_sku,
                core_variant: item.core_variant,
                core_price: item.core_price,
                core_product_id: item.core_product_id,
                ecommerce_correspond_to_core: 1,
            };
        })
        let request = {
            variants: requestVariant
        }
        dispatch(
            putConnectWebAppProductAction(request, (data: any) => {
                setIsShowConfirmConnectModal(false);
                if (data) {
                    handleMappingVariantJob(data.process_id);
                    getVariantList();
                }
            })
        );
    }

    //get variant list
    const getVariantList = () => {
        setIsLoading(true);
        dispatch(getWebAppProductAction(params, (result: PageResponse<any> | false) => {
            setIsLoading(false);
            if (result) {
                setVariantData(result);
                getVariantData && getVariantData(result);
                variantDataRef.current = result;
            }
        }));
    }
    useEffect(() => {
        getVariantList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, isReloadData])

    //handle filter
    const handleFinish = (value: any) => {
        let newParams = { ...params, ...value };
        setParams(newParams);
    }

    //action list
    const actionList = (
        <Menu>
            <Menu.Item
                key="2"
                onClick={() => exportFileProduct && exportFileProduct(variantData, selectedRows, params)}
                disabled={!variantData.metadata || !variantData.metadata.total}
            >
                <span>Xuất excel sản phẩm</span>
            </Menu.Item>
            <Menu.Item key="3" onClick={handleSuggestItem}>
                <span>{suggestConnect === "suggested" ? "Bỏ gợi ý ghép nối" : "Gợi ý ghép nối"}</span>
            </Menu.Item>
            <Menu.Item key="4" onClick={handleConnectMultiProduct} disabled={!selectedRows || selectedRows.length === 0}>
                <span>Ghép nối các sản phẩm đã chọn</span>
            </Menu.Item>
            <Menu.Item key="5" onClick={() => setIsVisibleConcatenateByExcelModal(true)}>
                <span>Ghép nối bằng excel</span>
            </Menu.Item>
            {allowProductsDelete &&
                <Menu.Item key="1" onClick={handleDeleteMultiItem} disabled={!selectedRows || selectedRows.length === 0}>
                    <span>Xóa sản phẩm</span>
                </Menu.Item>
            }
        </Menu>
    )

    //column
    const [columns,] = useState<any>([
        {
            title: "Ảnh",
            align: "center",
            width: "70px",
            render: (item: any) => {
                return (
                    <img
                        src={item.ecommerce_image_url}
                        style={{ height: "40px" }}
                        alt=""
                    />
                );
            },
        },
        {
            title: "Sku/ itemID (Sàn)",
            width: "13%",
            render: (item: any) => {
                return (
                    <div>
                        <div>{item.ecommerce_sku}</div>
                        <div style={{ color: "#737373" }}>{item.ecommerce_product_id}</div>
                        <div style={{ color: "#2a2a86" }}>({item.shop})</div>
                    </div>
                );
            },
        },
        {
            title: "Sản phẩm (Sàn)",
            width: "24%",
            render: (item: any) => {
                return <div>{item.ecommerce_variant}</div>;
            },
        },
        {
            title: "Giá bán (Sàn)",
            align: "center",
            width: "10%",
            render: (item: any) => {
                return (
                    <span>
                        {item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}
                    </span>
                );
            },
        },
        {
            title: "Sản phẩm (Unicorn)",
            render: (item: any, data: any) => {
                return (
                    <AutoCompleteProduct
                        lineItem={item}
                        updateSkuCoreToLineItem={handleUpdateSkuCoreToLineItem}
                        handleMappingVariantJob={handleMappingVariantJob}
                    />
                )
            }
        },
        {
            title: "Ghép nối",
            align: "center",
            width: "150px",
            render: (item: any) => {
                return (
                    <StyledStatus>
                        {item.connect_status === "waiting" && (
                            <span className="blue-status">Chưa ghép nối</span>
                        )}
                    </StyledStatus>
                );
            },
        },

        ConnectedItemActionColumn(
            handleDeleteItem,
        ),
    ]);


    return (
        <>
            <Card>
                <StyledProductFilter>
                    <div className="filter not-connected-items-filter">
                        <Form form={form} onFinish={handleFinish} initialValues={params}>

                            <div className="action-dropdown">
                                <Dropdown
                                    overlay={actionList}
                                    trigger={["click"]}
                                    disabled={isLoading}
                                >
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
                                    placeholder="SKU, tên sản phẩm sàn"
                                />
                            </Form.Item>

                            <div>
                                <Button type="primary" htmlType="submit" disabled={isLoading}>
                                    Lọc
                                </Button>
                            </div>
                        </Form>
                    </div>
                </StyledProductFilter>
                <CustomTable
                    bordered
                    isRowSelection={allowProductsConnect}
                    isLoading={isLoading}
                    onSelectedChange={handleSelectTableRow}
                    columns={columns}
                    dataSource={variantData.items}
                    scroll={{ x: 1080 }}
                    sticky={{ offsetScroll: 10, offsetHeader: 55 }}
                    pagination={{
                        pageSize: variantData.metadata && variantData.metadata.limit,
                        total: variantData.metadata && variantData.metadata.total,
                        current: variantData.metadata && variantData.metadata.page,
                        showSizeChanger: true,
                        onChange: handleChangePage,
                        onShowSizeChange: handleChangePage,
                    }}
                    rowKey={(data) => data.id}
                />
                {isVisibleConcatenateByExcelModal &&
                    <ConnectProductByExcel
                        onCancelConcatenateByExcel={() => setIsVisibleConcatenateByExcelModal(false)}
                        onOkConcatenateByExcel={() => setIsVisibleConcatenateByExcelModal(false)}
                    />
                }
                {isShowConfirmConnectModal &&
                    <ConfirmConnectProductModal
                        isVisible={isShowConfirmConnectModal}
                        isLoading={isLoading}
                        dataSource={variantDiffPriceList}
                        onOk={connectProduct}
                        onCancel={() => setIsShowConfirmConnectModal(false)}
                    />
                }
                <Modal
                    width="600px"
                    visible={isShowDeleteItemModal}
                    okText="Đồng ý"
                    cancelText="Hủy"
                    onCancel={() => setIsShowDeleteItemModal(false)}
                    onOk={handleConfirmDeleteItem}
                >
                    <div>
                        <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
                        <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
                    </div>
                </Modal>
            </Card>
        </>
    )
}
export default ProductNotConnect;