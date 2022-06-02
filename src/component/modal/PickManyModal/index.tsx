import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Divider, Input, InputProps, List, Modal, ModalProps, Skeleton } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import CustomPagination from 'component/table/CustomPagination';
import { ICustomTablePaginationConfig } from 'component/table/CustomTable';
import React from 'react'

type Props<T> = {
    modalProps: ModalProps
    inputProps: InputProps
    pagingProps: ICustomTablePaginationConfig | false
    rowKey: (string) | ((item: T) => string)

    listItem: (item: T, index: number) => React.ReactNode
    options: T[];
    onSelectAll: (checked: boolean) => void
}

function PickManyModal<T>(props: Props<T>) {
    const { modalProps, listItem: ListItem, inputProps, options, rowKey, pagingProps, onSelectAll } = props
    const handleSelectAll = (e: CheckboxChangeEvent) => {
        onSelectAll(e.target.checked)
    }
    return (

        <Modal
            cancelText="Thoát"
            okText="Thêm sản phẩm"
            width={800}
            title="Chọn sản phẩm"

            {...modalProps}
        >
            <Input
                size="middle"
                placeholder="Tìm kiếm "
                allowClear
                prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                {...inputProps}
            />
            <Divider />
            <Checkbox
                style={{ marginLeft: 12 }}
                onChange={handleSelectAll}
            >
                Chọn tất cả
            </Checkbox>
            <Divider />
            {options ? (
                <div>
                    <List<T>
                        locale={{
                            emptyText: 'Không có dữ liệu'
                        }}
                        className="product"
                        style={{ maxHeight: 280, overflow: "auto" }}
                        dataSource={options}
                        rowKey={rowKey}
                        renderItem={ListItem}
                    />
                    {options.length > 0 && <CustomPagination
                        pagination={pagingProps}
                    />}
                </div>
            ) : (
                <Skeleton loading={true} active avatar></Skeleton>
            )}
        </Modal>
    )
}

export default PickManyModal