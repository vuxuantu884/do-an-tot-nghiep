import React, { useState, useEffect, useCallback } from "react";
import { Tag, TreeSelect, TreeSelectProps } from "antd";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import './styles.scss';

interface Props extends TreeSelectProps<string> {
    formRef?: any;
    name?: string;
    placeholder?: string;
    listStore: Array<StoreResponse> | undefined;
    onChange?: (value: any) => void;
    onSelectAll?: (isValue: boolean) => void;
}

const TreeStore = (props: Props) => {
    const { name, placeholder, listStore, onSelectAll, onChange, ...restProps } = props;
    const [stores, setStores] = useState<Array<StoreResponse>>();
    const [isSelectAll, setIsSelectAll] = useState(false);
    const propConvert = () => {
        const restPropsExt: any = { ...restProps, }
        const restPropsConvert = {
            ...restProps,
            value:  Array.isArray(restPropsExt?.value)?restPropsExt?.value?.map((p: string | number) => +p):[restPropsExt?.value]
        }
        return restPropsConvert;
    }

    useEffect(() => {
        const groupBy = (list: Array<StoreResponse>, keyGetter: any) => {
            const map = new Map();
            list.forEach((item) => {
                const key = keyGetter(item);
                const collection = map.get(key);
                if (!collection) {
                    map.set(key, [item]);
                } else {
                    collection.push(item);
                }
            });
            return map;
        }

        const grouped: any = listStore !== undefined ? groupBy(listStore, (store: StoreResponse) => store.department) : [];
        const newStores = _.filter([...grouped], store => store[1]);
        // console.log("groupBy",grouped)
        // console.log("newStores",newStores)
        setStores(newStores);
    }, [listStore]);

    function tagRender(props: any) {
        const { label, closable, onClose } = props;
        const onPreventMouseDown = (event: any) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                className="primary-bg"
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
            >
                {label}
            </Tag>
        );
    }

    const handleSelectAll = useCallback((isValue: boolean) => {
        if (onSelectAll) {
            onSelectAll(isValue); setIsSelectAll(isValue);
        }
    }, [onSelectAll])

    return (
        <TreeSelect
        placeholder={placeholder}
        treeDefaultExpandAll
        className="selector"
        allowClear
        showSearch
        multiple
        treeCheckable
        treeNodeFilterProp='title'
        tagRender={tagRender}
        maxTagCount="responsive"
        onChange={onChange}
        {...propConvert()}
        filterTreeNode={(search: any, item: any) => {
            return item?.title?.toString().toLowerCase().includes(search?.toString().toLowerCase());
        }}
        onClear={() => setIsSelectAll(false)}
    >
        {onSelectAll && (
            <TreeSelect.TreeNode
                className="tree-node-select-all"
                title={
                    !isSelectAll ? (
                        <span
                            onClick={() => {
                                handleSelectAll(true);
                            }}
                            style={{
                                display: "inline-block",
                                color: "#286FBE",
                                cursor: "pointer"
                            }}
                        >
                            Chọn tất cả
                        </span>
                    ) : (
                        <span
                            onClick={() => {
                                handleSelectAll(false);
                            }}
                            style={{
                                display: "inline-block",
                                color: "#286FBE",
                                cursor: "pointer"
                            }}
                        >
                           Bỏ chọn tất cả
                        </span>
                    )

                }
                value={"xxx"}
                disableCheckbox={true}
                disabled={true}
                checkable={false}
            />
        )}

        {
            stores?.map((departmentItem: any) => {
                return (
                    <React.Fragment>
                        <TreeSelect.TreeNode
                            key={`${_.find(listStore, ["department", departmentItem[0]])?.code || ''}`}
                            value={`${_.find(listStore, ["department", departmentItem[0]])?.code || ''}`}
                            title={departmentItem[0]}
                        >
                            {
                                <React.Fragment>
                                    {
                                        departmentItem[1].map((storeItem: any) => (
                                            <TreeSelect.TreeNode
                                                key={+storeItem.id}
                                                value={+storeItem.id}
                                                title={storeItem.name}
                                            />
                                        ))
                                    }
                                </React.Fragment>
                            }
                        </TreeSelect.TreeNode>
                    </React.Fragment>
                )
            })
        }
    </TreeSelect>
    );
};
TreeStore.defaultProps = {
    placeholder: "Chọn cửa hàng"
}
export default TreeStore;