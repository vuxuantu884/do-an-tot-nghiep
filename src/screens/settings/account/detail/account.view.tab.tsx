import { Button, Divider, Space } from "antd";
import { ColumnProps } from "antd/lib/table";
import BottomBarContainer from "component/container/bottom-bar.container";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { AccountJobResponse } from "model/account/account.model";
import React, { useContext } from "react";
import { RiEditLine } from "react-icons/ri";
import { useHistory } from "react-router";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { AccountDetailContext } from "../provider/account.detail.provider";

type Job = {
  department: string;
  possition: string;
};
const JobColumn: Array<ColumnProps<Job>> = [
  {
    title: "Bộ phận",
    dataIndex: "department_name",
  },
  {
    title: "Vị trí",
    dataIndex: "position_name",
  },
];

function AccountViewTab() {
  const history = useHistory();
  const detailContext = useContext(AccountDetailContext);
  const { accountInfo, userCode , roleName } = detailContext;

  // const stores = useMemo(() => 
  // {
  //   // get role_name from accountInfo?.account_roles and join with ', '
  //   if (accountInfo?.account_stores) {
  //     return accountInfo.account_stores.map((role) => role.store).join(", ");
  //   }else{
  //     return "";
  //   }
  // }
  // , [accountInfo])
  const stores = "";
  return (
    <div className="padding-top-20">
      <table className="table-detail">
        <tbody>
          <tr>
            <td>
              <span className="account-title">Nhóm phân quyền </span>
            </td>
            <td>
              <b>: {roleName}</b>
            </td>
            <td>
              <span className="account-title">Tên đăng nhập </span>
            </td>
            <td>
              <b>: {accountInfo?.user_name}</b>
            </td>
            <td>
              <span className="account-title">Giới tính </span>
            </td>
            <td>
              <b>: {accountInfo?.gender === "female" ? "Nữ" : "Nam"}</b>
            </td>
          </tr>

          <tr>
            <td>
              <span className="account-title">Mã nhân viên </span>
            </td>
            <td>
              <b>: {accountInfo?.code} </b>
            </td>
            <td>
              <span className="account-title">Ngày sinh </span>
            </td>
            <td>
              <b>
                : {ConvertUtcToLocalDate(accountInfo?.birthday, DATE_FORMAT.DDMMYYY)}{" "}
              </b>
            </td>
            <td>
              <span className="account-title">Khu vực </span>
            </td>
            <td>
              <b>: {accountInfo?.district} </b>
            </td>
          </tr>
          <tr>
            <td>
              <span className="account-title">Họ và tên</span>
            </td>
            <td>
              <b>: {accountInfo?.full_name}</b>
            </td>
            <td>
              <span className="account-title">Số điện thoại</span>
            </td>
            <td>
              <b>: {accountInfo?.mobile}</b>
            </td>
            <td>
              <span className="account-title">Địa chỉ</span>
            </td>
            <td>
              <b>: {accountInfo?.address}</b>
            </td>
          </tr>
          <tr>
            <td>Cửa hàng</td>
            <td colSpan={5}>
              <b>: {stores}</b>
            </td>
          </tr>
        </tbody>
      </table>
      <h4 className="margin-top-20">THÔNG TIN CÔNG VIỆC</h4>
      <Divider />
      <CustomTable
        columns={JobColumn}
        dataSource={accountInfo?.account_jobs}
        pagination={false}
        sticky={{ offsetHeader: OFFSET_HEADER_TABLE }}
        rowKey={(key: AccountJobResponse) => key.department_id}
      />
      <BottomBarContainer
        back="Quay lại danh sách"
        backAction={() => history.push(`${UrlConfig.ACCOUNTS}`)}
        rightComponent={
          <Space>
            <Button
              onClick={() => history.push(`${UrlConfig.ACCOUNTS}/edit/${userCode}`)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <RiEditLine color="#757575" style={{ width: "15px" }} /> &nbsp; Chỉnh sửa
              </div>
            </Button>
          </Space>
        }
      />
    </div>
  );
}

export default AccountViewTab;
