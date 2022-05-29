import CustomTable from "component/table/CustomTable";
import { WebAppConfigTabUrl } from "config/url.config";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { StyledComponent } from "../styles";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import actionColumn from "./action.column";

type ShopListProps = {
    data: any;
    showDeleteModal: (value: WebAppResponse) => void;
    loading?: boolean;
};

const ShopList = (props: ShopListProps) => {
    const { data, showDeleteModal, loading } = props;

    const history = useHistory();

    const handleSelectedShop = (item: any) => {
        history.push(`${WebAppConfigTabUrl.CONFIG_SHOP}/${item.id}`);
    }
    const handleUpdate = (item: any) => {
        history.push(`${WebAppConfigTabUrl.CONFIG_SHOP}/${item.id}`);
    };
    const handleShowDeleteModal = (item: WebAppResponse) => {
        showDeleteModal(item);
    };
    //column
    const [columns] = useState<any>([
        {
            title: "STT",
            align: "center",
            width: "70px",
            fixed: "left",
            render: (l: any, v: any, i: any) => {
                return <span>{i + 1}</span>
            }
        },
        {
            title: "Tên gian hàng",
            //width: "20%",
            fixed: "left",
            render: (value: any, data: any) => {
                return (
                    <div style={{ display: "flex" }}>
                        <strong className="link" onClick={() => handleSelectedShop(data)}>{data.name}</strong>
                    </div>
                )
            }
        },
        {
            title: "Website",
            width: "20%",
            dataIndex: "website",
            render: (value: any, data: any) => (
                <div className="shop-show-style" style={{ textAlign: "left", minWidth: "150px" }}>
                    <a href={`http://${data.website}`} target="_blank" rel="noopener noreferrer">{data.website}</a>
                </div>

            ),
        },
        {
            title: "Ngày kết nối",
            dataIndex: "created_date",
            width: 120,
            align: "center",
            render: (value: string) => {
                return (
                    <div>{ConvertUtcToLocalDate(value, "DD/MM/YYYY")}</div>
                )
            }
        },
        actionColumn(handleUpdate, handleShowDeleteModal),
    ]);
    return (
        <StyledComponent>
            <div>
                <CustomTable
                    bordered
                    isLoading={loading}
                    columns={columns}
                    dataSource={data}
                    sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
                    pagination={false}
                    rowKey={(data) => data.id}
                />
            </div>
        </StyledComponent>
    )
}
export default ShopList;