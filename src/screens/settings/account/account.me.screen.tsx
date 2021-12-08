import { 
  Avatar,
  Button,
  Card,
  Col,
  Row, 
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, {useCallback, useEffect, useState} from "react";
import { useHistory } from "react-router";
import {  useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import TitleCustom from "component/tag/TitleCustom";
import { EditOutlined, LockOutlined, SolutionOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { AccountMeStyle } from "./account.me.style";
import RowDetail from "screens/products/product/component/RowDetail";
import { AccountResponse } from "model/account/account.model";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import {getAccountMeAction } from "domain/actions/account/account.action";
import { Link } from "react-router-dom";
import { showInfo } from "utils/ToastUtils";

type OrtherInfoType ={
  departments: string|null,
  jobs: string|null,
  permissions: string|null,
  stores: string|null,
}

const AccountMeScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [user, setUser] = useState<AccountResponse>();
  const [objOrther, setObjOrther] =useState<OrtherInfoType>();
  const listGender = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.gender
  );

  const backAction = ()=>{    
    history.push(UrlConfig.HOME);
  }; 

  const setAccount = useCallback(
    (data: AccountResponse) => {
      if (data) {
        setUser(data); 
        
        setObjOrther({
          departments: data.account_jobs?.map(({department})=>department).toString(),
          jobs: data.account_jobs?.map(({position})=>position).toString(),
          permissions: data.permissions?.modules?.map(e=>e.name).toString(),
          stores: data.account_stores?.map(({store})=>store).toString()
        })
      }
      
    },
    [setUser]
  );

  useEffect(() => {
      dispatch(getAccountMeAction(setAccount));
  }, [history, dispatch, setAccount]);  
  
  return (
    <ContentContainer
      title="Thông tin cá nhân"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Thông tin cá nhân",
        }, 
      ]}
    >
      <AccountMeStyle>
        <Row gutter={20}>
          <Col span={8}>
            <Card className="general">
              <div className="avatar">
                <Avatar style={{backgroundColor: "#eeb8b8"}} size={150} icon={<UserOutlined />} /> 
              </div>    
              <div className="general-info">
                <RowDetail title="Họ và tên" value={user?.full_name ?? "---"}/>
                <RowDetail title="Mã NV" value={user?.code ?? "---"}/>
                <RowDetail title="Giới tính" value={user?.gender ?  listGender?.find((item) => item.value === user?.gender)?.name ?? "" : "---"}/>
                <RowDetail title="Ngày sinh" value={user?.birthday ? ConvertUtcToLocalDate(user.birthday, DATE_FORMAT.DDMMYYY) : "---"}/>
                <Row>
                  <Link to={`${UrlConfig.ACCOUNTS}/me/update-password`}><LockOutlined /> Đổi mật khẩu</Link>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={16}>
            <Card 
              title={<TitleCustom 
                color="#2A2A86" 
                bgColor="#EFEFFF" 
                size={40} 
                icon={<SolutionOutlined />} 
                text="THÔNG TIN LIÊN HỆ"/>}
                extra={<Button color="#1890ff" type="link" onClick={()=>{
                  showInfo("Tính năng đang phát triển");
                }}><EditOutlined /> Đổi thông tin liên hệ</Button>}>   
              <RowDetail title="Số điện thoại" value={user?.mobile ?? "---"}/>
              <RowDetail title="Khu vực" value={user?.district ?? "---"}/>
              <RowDetail title="Địa chỉ" value={user?.address ?? "---"}/>
            </Card>

            <Card title={<TitleCustom color="#FCAF17" bgColor="#FFF7E8" size={40} icon={<TeamOutlined />} text="THÔNG TIN KHÁC"/>}>   
              <RowDetail title="Phòng ban" value={(objOrther?.departments && objOrther.departments?.length > 0) ? objOrther.jobs : "---"}/>
              <RowDetail title="Vị trí" value={(objOrther?.jobs && objOrther.jobs?.length > 0) ? objOrther?.jobs : "---"}/>
              <RowDetail title="Nhóm quyền" value={objOrther?.permissions ?? "---"}/>
              <RowDetail title="Cửa hàng" value={(objOrther?.stores && objOrther.stores?.length > 0) ? objOrther.stores : "---"}/>
            </Card>
          </Col>
        </Row>
          
        <BottomBarContainer
          back="Quay lại"
          backAction={backAction}
        />
      </AccountMeStyle>
    </ContentContainer>
  );
}; 

export default AccountMeScreen;
