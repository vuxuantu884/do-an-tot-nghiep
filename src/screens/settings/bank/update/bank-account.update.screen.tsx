import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useCallback } from "react";
import AddBankAccountBottombar from "../component/add-bank-account-bottombar";

const BackAccountUpdateScreen: React.FC = () => {
    const onOkPress = useCallback(() => {
        //goodsReceiptsForm.submit();
      }, []);
    return (
        <ContentContainer
            title="Sửa tài khoản ngân hàng"
            breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name:"Tài khoản ngân hàng",
                    path: UrlConfig.BANK_ACCOUNT
                },
                {
                    name:"Sửa tài khoản ngân hàng"
                }
            ]}
        >
            <AddBankAccountBottombar onOkPress={onOkPress}/>
        </ContentContainer>
    )
}

export default BackAccountUpdateScreen;