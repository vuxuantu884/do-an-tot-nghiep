import React, { useState, useEffect } from "react";
import { Tag, TreeSelect, TreeSelectProps } from "antd";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";

interface Props extends TreeSelectProps<string> {
    name?: string;
    placeholder?: string;
    listStore: Array<StoreResponse> | undefined;
    onChange?: (value: any) => void;
}

const TreeStore = (props: Props) => {
    const { name, placeholder, listStore, onChange, ...restProps } = props;
    const [stores, setStores] = useState<Array<StoreResponse>>();

    const propConvert = () => {
        const restPropsExt: any = { ...restProps, }
        const restPropsConvert = {
            ...restProps,
            value: restPropsExt?.value?.map((p: string | number) => +p)
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
                return item?.title.toLowerCase().includes(search.toLowerCase().trim());
            }}
        >
            {
                stores?.map((departmentItem: any) => {
                    return (
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
                                                key={storeItem.id}
                                                value={storeItem.id}
                                                title={storeItem.name}
                                            />
                                        ))
                                    }
                                </React.Fragment>
                            }
                        </TreeSelect.TreeNode>
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