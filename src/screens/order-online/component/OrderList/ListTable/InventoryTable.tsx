import { Col, Row } from "antd";
import React, { useMemo } from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
import { AllInventoryProductInStore } from "model/inventory";
import { OrderLineItemResponse } from "model/response/order/order.response";
import { StoreResponse } from "model/core/store.model";
import {StyledComponent} from "./InventoryTable.styles";

type InventoryTableProps = {
    storeId: number;
    items: OrderLineItemResponse[];
    listStore?: StoreResponse[];
    inventoryData: AllInventoryProductInStore[];
};

const priority = {
    ware_house: 2,
    store: 1,
    distribution_center: 1,
    stockpile: 1,
};

interface InventoryStore {
    id: number,
    name: string,
    priority: number,
    data: any,
}

const InventoryTable: React.FC<InventoryTableProps> = (
    props: InventoryTableProps
) => {
    const { storeId, items, listStore, inventoryData } = props;

    

    const data = useMemo(() => {
        let stores: Array<InventoryStore> = [];
        listStore?.forEach((value, index) => {
            let store: InventoryStore = {
                id: value.id,
                name: value.name,
                priority: value.type === "ware_house" ? priority.ware_house : 1,
                data: {},
            };

            items?.forEach((p) => {
                let inventory = inventoryData.find((p1) => p.variant_id === p1.variant_id && value.id === p1.store_id);
                store.data[p.variant_id.toString()] = inventory && inventory.available ? inventory.available : 0;

            });
            stores.push(store);
        });
        stores.sort((a, b) => {
            let item1 = 0;
            let item2 = 0;
            let totalAvaiable1 = 0;
            let totalAvaiable2 = 0;
            items?.forEach((value) => {
                if (a.data[value.variant_id.toString()] > value.quantity) {
                    item1++;
                }
                if (b.data[value.variant_id.toString()] > value.quantity) {
                    item2++;
                }
            });

            Object.keys(a.data).forEach((key) => {
                totalAvaiable1 = totalAvaiable1 + a.data[key];
            })
            Object.keys(b.data).forEach((key) => {
                totalAvaiable2 = totalAvaiable2 + b.data[key];
            })
            if (item1 === items?.length && item2 === items?.length) {
                if (a.priority >= b.priority) {
                    return totalAvaiable2 - totalAvaiable1;
                } else {
                    return b.priority - a.priority;
                }
            }
            if (totalAvaiable1 !== totalAvaiable2) {
                return totalAvaiable2 - totalAvaiable1;
            }
            return item2 - item1;
        })

        let removeIndex = stores.findIndex((p) => p.id === storeId);
        if (removeIndex !== -1) {
            let newStore = stores[removeIndex];
            stores.splice(removeIndex, 1);
            stores.splice(0, 0, newStore);
        }

        return stores;
    }, [listStore, items, inventoryData, storeId]);

    return (
        <Row style={{ marginTop: 10 }}>
                <Col span={24}>
                <StyledComponent>
                    <div className="overflow-table" style={{ overflowX: "auto" , WebkitScrollSnapPointsY:"2px" }}>
                        <table className="rules">
                            <thead>
                                <tr>
                                    <th className="condition">Sản phẩm 1</th>
                                    {items?.map((data, index) => (
                                        <th className="condition" key={index}>{data.variant}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {data?.map((item, index) => (
                                    <tr key={index}>
                                        <th className="condition" key={index}>
                                            {item.name} <CheckCircleOutlined hidden={item.id === storeId ? false : true} style={{ color: "#2A2A86" }} />
                                        </th>

                                        {items?.map((_itemi, index) => (
                                            <td className={`condition ${item.data[_itemi.variant_id] <=0 ? "red" : null}`}  key={_itemi.variant_id}>
                                                {item.data[_itemi.variant_id]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
        </StyledComponent>
                </Col>
            </Row>

    );
};
export default InventoryTable;
