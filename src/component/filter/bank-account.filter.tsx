import { Button, Form, Input, Select } from "antd";
import { FilterWrapper } from "component/container/filter.container";
import React, { useEffect, useState } from "react";
import search from "assets/img/search.svg";
import TreeStore from "component/tree-node/tree-store";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { useDispatch } from "react-redux";
import { StoreResponse } from "model/core/store.model";

const BankAccountFilter: React.FC = () => {
    const dispatch = useDispatch();
    const [listStore, setListStore] = useState<Array<StoreResponse>>();

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
            >
                <FilterWrapper>
                    <Form.Item name="account_number" className="search" style={{ minWidth: 200 }}>
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
                            <Select.Option value={0} key={0}> Option 0</Select.Option>
                            <Select.Option value={1} key={1}> Option 1</Select.Option>
                            <Select.Option value={2} key={2}> Option 2</Select.Option>
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