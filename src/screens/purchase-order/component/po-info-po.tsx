import { Card, Form, FormInstance, Input } from "antd";
import { POField } from "model/purchase-order/po-field";
import React, { Fragment, useContext, useEffect } from "react";
import PORowDetail from "./po-row-detail";
import { POStatus } from "utils/Constants";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { PurchaseOrderCreateContext } from "../provider/purchase-order.provider";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { InfoCircleOutlined } from "@ant-design/icons";
import styled from "styled-components";


type POInfoPOProps = {
    formMain: FormInstance;
    isEditDetail?: boolean;
};
const POInfoPO: React.FC<POInfoPOProps> = (props: POInfoPOProps) => {

    const userReducer = useSelector((state: RootReducerType) => state.userReducer);


    const { formMain, isEditDetail } = props;
    const { fetchMerchandiser } = useContext(PurchaseOrderCreateContext);
    const { setMerchans, merchans } = fetchMerchandiser;


    useEffect(() => {
        if (Array.isArray(merchans?.items)) {
            const findCurrentUser = merchans.items.find(
                (merchan) => merchan.code === userReducer.account?.code
            );
            //Check nếu tài khoản hiện tại không có trong danh sách merchandiser thì thêm vào
            if (!findCurrentUser && userReducer) {
                setMerchans({
                    ...merchans,
                    items: [
                        {
                            code: userReducer.account?.code || "",
                            full_name: userReducer.account?.full_name || "",
                        },
                        ...merchans.items,
                    ],
                });
            }
        }
    }, [merchans, setMerchans, userReducer]);

    return <Card
        className="po-form"
        title={
            <div className="d-flex">
                <span className="title-card">THÔNG TIN ĐƠN MUA HÀNG</span>
            </div>
        }>
        <div style={{
            display: "flex",
            gap: "20px"
        }}>
            <Form.Item noStyle shouldUpdate={(prev, current) => prev.status !== current.status}>
                {({ getFieldValue }) => {
                    if (isEditDetail) {
                        return (
                            <DetailInfoPo formMain={formMain} />
                        );
                    }
                    const status = getFieldValue(POField.status);
                    const detailCheck = (status === POStatus.FINISHED ||
                        status === POStatus.CANCELLED ||
                        status === POStatus.COMPLETED);

                    if (detailCheck) {
                        return (
                            <DetailInfoPo formMain={formMain} />
                        );
                    }
                    return (
                        <CreateInfoPo />
                    );
                }}
            </Form.Item>
        </div>
    </Card>
}

type DetailInfoPoProps = {
    formMain: FormInstance;
};
const DetailInfoPo = (props: DetailInfoPoProps) => {
    const { formMain } = props;
    const { purchaseOrder } = useContext(PurchaseOrderCreateContext);
    return <Fragment>
        <Form.Item name={POField.code} noStyle hidden>
            <Input />
        </Form.Item>
        <Form.Item name={POField.merchandiser_code} noStyle hidden>
            <Input />
        </Form.Item>
        <Form.Item name={POField.qc_code} noStyle hidden>
            <Input />
        </Form.Item>
        <Form.Item name={POField.designer_code} noStyle hidden>
            <Input />
        </Form.Item>

        <Form.Item name={POField.merchandiser} noStyle hidden>
            <Input />
        </Form.Item>
        <Form.Item name={POField.reference} noStyle hidden>
            <Input />
        </Form.Item>
        <PORowDetail title="Mã đơn mua hàng" value={formMain.getFieldValue(POField.code)} />
        <PORowDetail
            title="Merchandiser"
            value={`${purchaseOrder.merchandiser_code && purchaseOrder.merchandiser_code.toUpperCase()} - ${purchaseOrder.merchandiser}`}
        />
        <PORowDetail
            title="QC"
            value={`${purchaseOrder.qc && purchaseOrder.qc_code ? `${purchaseOrder.qc_code.toUpperCase()} - ${purchaseOrder.qc}` : ""}`}
        />

        <PORowDetail
            title="Thiết kế"
            value={`${purchaseOrder.designer_code && purchaseOrder.designer ? `${purchaseOrder.designer_code.toUpperCase()} - ${purchaseOrder.designer}` : ""
                }`}
        />
        <PORowDetail title="Mã tham chiếu" value={formMain.getFieldValue(POField.reference)} />
    </Fragment>
}

const CreateInfoPo = () => {
    const { fetchMerchandiser, fetchDesigner } = useContext(PurchaseOrderCreateContext);

    const { fetchMerchans, merchans, isLoadingMerchans } = fetchMerchandiser;
    const {
        fetchMerchans: fetchDesigners,
        merchans: designers,
        isLoadingMerchans: isLoadingDesigners,
    } = fetchDesigner;
    return <Fragment>
        <StyledFormItem
            name={POField.merchandiser_code}
            label="Merchandiser"

            rules={[
                {
                    required: true,
                    message: "Vui lòng chọn Merchandiser",
                },
            ]}>

            <BaseSelectMerchans
                merchans={merchans}
                fetchMerchans={fetchMerchans}
                isLoadingMerchans={isLoadingMerchans}
                placeholder="Chọn Merchandiser"
            />
        </StyledFormItem>
        <StyledFormItem name={POField.qc_code} label="QC"  >
            <BaseSelectMerchans
                merchans={merchans}
                fetchMerchans={fetchMerchans}
                isLoadingMerchans={isLoadingMerchans}
                placeholder="Chọn QC"
            />
        </StyledFormItem>
        <StyledFormItem name={POField.designer_code} label="Thiết kế" >
            <BaseSelectMerchans
                merchans={designers}
                fetchMerchans={fetchDesigners}
                isLoadingMerchans={isLoadingDesigners}
                placeholder="Chọn Nhà thiết kế"
            />
        </StyledFormItem>

        <StyledFormItem
            tooltip={{
                title: "Thêm số tham chiếu hoặc mã hợp đồng",
                icon: <InfoCircleOutlined />,
            }}
            name={POField.reference}
            label="Số tham chiếu">
            <Input placeholder="Nhập số tham chiếu" maxLength={255} />
        </StyledFormItem>
    </Fragment>
}

const StyledFormItem = styled(Form.Item)`
 width: 23%;
`;

export default POInfoPO;