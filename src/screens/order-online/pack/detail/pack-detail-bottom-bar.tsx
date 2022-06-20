import BottomBarContainer from "component/container/bottom-bar.container";
import { Button, Space } from "antd";
import { useHistory } from 'react-router';
import React, { useCallback, useState } from "react";
import UrlConfig from "config/url.config";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { useDispatch } from "react-redux";
import { getPrintGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
import { useReactToPrint } from "react-to-print";

type Props = {
    packDetail: GoodsReceiptsResponse | undefined;
}

interface GoodReceiptPrint {
    good_receipt_id: number;
    html_content: string;
    size: string;
}

const typePrint = {
    simple: "simple",
    detail: "detail"
}

const PackDetailBottomBar = (props: Props) => {
    const { packDetail } = props;
    const history = useHistory();
    const dispatch = useDispatch();

    //useRef
    const printElementRef = React.useRef(null);

    const [htmlContent, setHtmlContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePrint = useReactToPrint({
        content: () => printElementRef.current,
    });

    const handlePrintPack = useCallback((type: string) => {
        if (packDetail) {
            setIsLoading(true)
            dispatch(getPrintGoodsReceipts([packDetail.id], type, (data: GoodReceiptPrint[]) => {
                setIsLoading(false)
                if (data && data.length > 0) {
                    setHtmlContent(data[0].html_content);
                    setTimeout(() => {
                        if (handlePrint) {
                            handlePrint();
                        }
                    }, 500);
                }
            }))
        }
    }, [dispatch, handlePrint, packDetail]);
    return (
        <React.Fragment>
            <BottomBarContainer
                backAction={() => {
                    history.push(`${UrlConfig.DELIVERY_RECORDS}`)
                }}
                back={"Quay lại danh sách"}
                rightComponent={
                    <React.Fragment>
                        <Space>
                            <Button
                                style={{ paddingRight: "0px 25px;" }}
                                onClick={() => {
                                    handlePrintPack(typePrint.detail)
                                }}
                                loading={isLoading}
                            >
                                In biên bản đầy đủ
                            </Button>
                            <Button
                                style={{ paddingRight: "0px 25px;" }}
                                onClick={() => {
                                    handlePrintPack(typePrint.simple)
                                }}
                                loading={isLoading}
                            >
                                In biên bản rút gọn
                            </Button>
                            <Button type="primary" style={{ paddingRight: "0px 25px;" }} onClick={() => {
                                if (packDetail)
                                    history.push(`${UrlConfig.DELIVERY_RECORDS}/${packDetail.id}/update`);
                            }}>
                                Chỉnh sửa biên bản
                            </Button>
                        </Space>
                    </React.Fragment>
                }
            />
            <div style={{ display: "none" }}>
                <div className="printContent" ref={printElementRef}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: htmlContent,
                        }}
                    >
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default PackDetailBottomBar;