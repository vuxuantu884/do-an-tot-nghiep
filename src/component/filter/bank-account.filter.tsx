import { Button, Form, FormInstance, Input, Select } from "antd";
import { FilterWrapper } from "component/container/filter.container";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import TreeStore from "component/tree-node/tree-store";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { useDispatch } from "react-redux";
import { StoreResponse } from "model/core/store.model";
import { BankAccountSearchQuery } from "model/bank/bank.model";

type BankAccountType = {
    params: BankAccountSearchQuery;
    onFilter?: (values: BankAccountSearchQuery | Object) => void;
}

const BankAccountFilter: React.FC<BankAccountType> = (props: BankAccountType) => {
    const { params, onFilter } = props;
    const dispatch = useDispatch();
    const [listStore, setListStore] = useState<Array<StoreResponse>>();

    const formRef = React.createRef<FormInstance>();

    const initialValues = useMemo(() => {
        return { ...params }
    }, [params])

    const onFinish = useCallback((value) => {
        let query = {
            ...value,
            status:value.status==="true"?true:value.status==="false"?false:null
        }
        value.status =
            onFilter && onFilter(query);
    }, [onFilter]);

    useEffect(() => {
        dispatch(
            getListStoresSimpleAction((stores) => {
                setListStore(stores);
            })
        );
    }, [dispatch]);

    return (
        <React.Fragment>
            <Form
                layout="inline"
                ref={formRef}
                onFinish={onFinish}
                initialValues={initialValues}
            >
                <FilterWrapper>
                    <Form.Item name="account_numbers" className="search" style={{ minWidth: 200 }}>
                        <Input
                            prefix={<img src={search} alt="" />}
                            placeholder="Tìm kiếm theo số tài khoản"
                        />
                    </Form.Item>

                    <Form.Item name="store_ids" style={{ width: 400 }}>
                        <TreeStore
                            name="store_ids"
                            listStore={listStore}
                        />
                    </Form.Item>

                    <Form.Item name="status" style={{ width: 400 }}>
                        <Select
                            placeholder="Chọn trạng thái"
                            allowClear
                            showArrow
                        >
                            <Select.Option key={"true"} value={"true"}>Áp dụng</Select.Option>
                            <Select.Option key={"false"} value={"false"}>Ngưng áp dụng</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Lọc
                        </Button>
                    </Form.Item>
                </FilterWrapper>

            </Form>
        </React.Fragment>
    )
}

export default BankAccountFilter;