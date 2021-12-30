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
import { AccountResponse, MeRequest } from "model/account/account.model";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import {getAccountMeAction, updateMeAction } from "domain/actions/account/account.action";
import { Link } from "react-router-dom";
import CustomModal from "component/modal/CustomModal";
import MeContact from "./components/me-contact";
import { showSuccess } from "utils/ToastUtils";

type OrtherInfoType ={
  departments: string|null,
  jobs: string|null,
  permissions: any,
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
  const [isShowUpdate, setIsShowUpdate] =useState<boolean>(false); 

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
          permissions: data.permissions,
          stores: data.account_stores?.map(({store})=>store).toString(),
        })
      }
      
    },
    [setUser]
  ); 

  const updateMeContact = useCallback((data: MeRequest)=>{
     let accountUpdate : MeRequest = { 
      district_id: data.district_id,
      phone: data.phone, 
      district: data.district,
      address: data.address };
       if (user?.id) {
        dispatch(updateMeAction(accountUpdate,  (res)=>{
          if (res) {
            showSuccess("Cập nhật thành công");
            setIsShowUpdate(false);
            dispatch(getAccountMeAction(setAccount));
          }
        }));
       }
  },[user, dispatch, setAccount]);

  useEffect(() => {
      dispatch(getAccountMeAction(setAccount));
  }, [history, dispatch, setAccount]);  
  
  return (
    <ContentContainer
      title="Thông tin tài khoản"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Thông tin tài khoản",
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
                  setIsShowUpdate(true);
                }}><EditOutlined /> Đổi thông tin liên hệ</Button>}>   
              <RowDetail title="Số điện thoại" value={user?.phone ?? "---"}/>
              <RowDetail title="Khu vực" value={user?.district ?? "---"}/>
              <RowDetail title="Địa chỉ" value={user?.address ?? "---"}/>
            </Card>

            <Card title={<TitleCustom color="#FCAF17" bgColor="#FFF7E8" size={40} icon={<TeamOutlined />} text="THÔNG TIN KHÁC"/>}>   
              <RowDetail title="Phòng ban" value={(objOrther?.departments && objOrther.departments?.length > 0) ? objOrther.departments : "---"}/>
              <RowDetail title="Vị trí" value={(objOrther?.jobs && objOrther.jobs?.length > 0) ? objOrther?.jobs : "---"}/>
              <RowDetail title="Nhóm quyền" value={objOrther?.permissions?.role_name ?? "---"}/>
              <RowDetail title="Cửa hàng" value={(objOrther?.stores && objOrther.stores?.length > 0) ? objOrther.stores : "---"}/>
            </Card>
          </Col>
        </Row>
          
        <BottomBarContainer
          back="Quay lại"
          backAction={backAction}
        />
      </AccountMeStyle>
      <CustomModal
        updateText="Lưu lại"
        visible={isShowUpdate}
        onCreate={() => {}}
        onEdit={(formValues: MeRequest) => updateMeContact(formValues)}
        onDelete={()=>{}}
        onCancel={() => setIsShowUpdate(false)}
        modalAction="onlyedit"
        componentForm={MeContact}
        formItem={user}
        modalTypeText="thông tin liên hệ"
      />
    </ContentContainer>
  );
}; 

export default AccountMeScreen;
