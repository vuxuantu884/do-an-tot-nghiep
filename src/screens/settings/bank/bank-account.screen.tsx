import { Button, Card, Tag } from "antd";
import ContentContainer from "component/container/content.container";
import BankAccountFilter from "component/filter/bank-account.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { BankAccountResponse, BankAccountSearchQuery } from "model/bank/bank.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import iconEdit from "assets/icon/edit.svg";
// import { RiCheckboxCircleLine } from "react-icons/ri";
import ButtonCreate from "component/header/ButtonCreate";
import { getBankAccountAction } from 'domain/actions/bank/bank.action';
import { CheckOutlined } from "@ant-design/icons";


const initQuery: BankAccountSearchQuery = {
    ids: null,
    store_ids: [],
    account_numbers: "",
    account_holders: "",
    status: null,
    is_default: null,
};

interface BankAccountResponseResult extends BankAccountResponse {
    isShorten?: boolean,
}

const BankAccountScreen: React.FC = () => {
    const query = useQuery();
    const history = useHistory();
    const dispatch = useDispatch();
    let dataQuery: BankAccountSearchQuery = {
        ...initQuery,
        ...getQueryParams(query),
    };

    const [tableLoading, setTableLoading] = useState(false);

    let [params, setPrams] = useState<BankAccountSearchQuery>(dataQuery);

    const [data, setData] = useState<PageResponse<BankAccountResponseResult>>({
        metadata: {
            limit: 0,
            page: 1,
            total: 0,
        },
        items: []
    });

    const showAllInOneRow = (index: number) => {
        console.log("index", index);
        let dataItemsClone = [...data.items];
        dataItemsClone[index].isShorten = false;
        setData({
            ...data,
            items: dataItemsClone,
        })
    }

    const handleEdit = (
        e: React.MouseEvent<HTMLElement, MouseEvent>,
        id: string | number
    ) => {
        e.stopPropagation();
        history.push(`${UrlConfig.BANK_ACCOUNT}/update/${id}`);
    };

    const defaultColumns: Array<ICustomTableColumType<BankAccountResponseResult>> = [
        {
            title: "STT",
            align: "center",
            width: 150,
            render: (value, row, index) => {
                return <span>{(params?.page ? params.page - 1 : 0) * (params?.limit ? params.limit : 0) + index + 1}</span>;
            }
        },
        {
            title: "Số tài khoản ",
            fixed: "left",
            width: 300,
            dataIndex: "account_number",
            render: (value, row: BankAccountResponse, index) => {
                return <React.Fragment>
                    <Link target="_blank" to={`${UrlConfig.BANK_ACCOUNT}/update/${row.id}`}>
                        {value}
                    </Link>
                    <div style={{ fontSize: "0.86em" }}>
                        {row.bank_name}
                    </div>
                    <div style={{ fontSize: "0.86em" }}>
                        {row.account_holder}
                    </div>
                </React.Fragment>
            }
        },
        {
            title: "Cửa hàng áp dụng",
            fixed: "left",
            //width: 300,
            render: (value, row, index) => {
                console.log("row", row)
                if (row.stores.length < 6 || !row?.isShorten) {
                    return (
                        <React.Fragment>
                            {row?.stores?.map((item, index) => {
                                return <span>{item?.store_name} {index + 1 < row.stores.length ? ", " : ""}</span>;
                            })}
                        </React.Fragment>
                    );

                } else {
                    return (
                        <React.Fragment>
                            <span>
                                <span>{row.stores[0]?.store_name}, </span>
                                <span>{row.stores[1]?.store_name}, </span>
                                <span>{row.stores[2]?.store_name}, </span>
                                <span>{row.stores[3]?.store_name}, </span>
                                <span>{row.stores[4]?.store_name}, </span>
                                <span>{row.stores[5]?.store_name}, </span>
                                <Button type="link" style={{ padding: 0 }} onClick={() => showAllInOneRow(index)}>...xem thêm</Button>
                            </span>
                        </React.Fragment>
                    );
                }
            },
        },
        {
            title: "Mặc định",
            width: 150,
            align: "center",
            dataIndex: "is_default",
            render: (value, row, index) => {
                let text = row.default ? "text-success" : "text-error";

                return (
                    <div style={row.default ? { textAlign: "center", fontSize: "20px", color: "#2A2A86" }
                        : { textAlign: "center", fontSize: "20px", display: "none" }}
                        className={text}
                    >
                        {/* <RiCheckboxCircleLine /> */}
                        <CheckOutlined />
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            width: 150,
            align: "center",
            dataIndex: "status",
            render: (value, row, index) => {
                if (row.status) {
                    return <span style={{ color: "#27AE60" }}>Áp dụng</span>;
                }
            },
        },
        {
            title: "Thao tác",
            width: 150,
            align: "center",
            render: (value, row, index) => {
                return (
                    <div className="columnAction">
                        <Button
                            className="columnAction__singleButton columnAction__singleButton--edit"
                            onClick={(e) => {
                                handleEdit(e, row.id);
                            }}
                        >
                            <img src={iconEdit} alt="" className="icon--normal" />
                            Sửa
                        </Button>
                    </div>
                );
            },
        }
    ]

    const onPageChange = useCallback(
        (page, size) => {
            params.page = page;
            params.limit = size;
            let queryParam = generateQuery(params);
            setPrams({ ...params });
            history.replace(`${UrlConfig.BANK_ACCOUNT}?${queryParam}`);
        },
        [history, params]
    );

    const onFilter = useCallback((value) => {
        let newParams = { ...params, ...value, page: 1 };
        setPrams(newParams);

        let queryParam = generateQuery(newParams);
        history.push(`${UrlConfig.BANK_ACCOUNT}?${queryParam}`);
    }, [history, params])

    const handleSearchResult = useCallback(() => {
        setTableLoading(true);
        dispatch(getBankAccountAction(params, (data: PageResponse<BankAccountResponse>) => {
            // setAbc(data.items);
            let abc: BankAccountResponseResult[] = [...data.items]
            const gg = abc.map(item => {
                item.isShorten = true;
                return item
            })
            setData({
                ...data,
                items: gg
            })
            setTableLoading(false);
        }));
    }, [dispatch, params]);



    useEffect(() => {
        handleSearchResult();
    }, [handleSearchResult]);

    console.log("data", data)
    return (
        <ContentContainer
            title="Tài khoản ngân hàng"
            breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name: "Tài khoản ngân hàng",
                },
            ]}
            extra={<ButtonCreate child="Thêm mới" path={`${UrlConfig.BANK_ACCOUNT}/create`} />}
        >
            <Card>
                <BankAccountFilter params={params} onFilter={onFilter} />

                <CustomTable
                    isLoading={tableLoading}
                    pagination={{
                        pageSize: data.metadata.limit,
                        total: data.metadata.total,
                        current: data.metadata.page,
                        showSizeChanger: true,
                        onChange: onPageChange,
                        onShowSizeChange: onPageChange,
                    }}
                    dataSource={data.items}
                    columns={defaultColumns}
                    rowKey={(item: BankAccountResponseResult) => item.id}
                    sticky={{ offsetScroll: 5, offsetHeader: 55 }}
                />
            </Card>

        </ContentContainer>
    )
}

export default BankAccountScreen;