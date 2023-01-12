import { CopyOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Modal, Space, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import BottomBarContainer from "component/container/bottom-bar.container";
import TextShowMore from "component/container/show-more/text-show-more";
import ModalConfirm from "component/modal/ModalConfirm";
import CustomTable from "component/table/CustomTable";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import { AccountJobResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useContext, useMemo, useRef, useState } from "react";
import { RiEditLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { resetPasswordApi } from "service/accounts/account.service";
import { callApiNative } from "utils/ApiUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { AccountDetailContext } from "../provider/account.detail.provider";
import { copyTextToClipboard } from "utils/AppUtils";

type Job = {
  department: string;
  possition: string;
};
const JobColumn: Array<ColumnProps<Job>> = [
  {
    title: "Phòng ban",
    dataIndex: "department",
  },
  {
    title: "Vị trí",
    dataIndex: "position",
  },
];

function AccountViewTab() {
  const history = useHistory();
  const listGender = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.gender);
  const detailContext = useContext(AccountDetailContext);
  const { accountInfo, userCode } = detailContext;
  const [isShowModalResetPassword, setIsShowModalResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const dispatch = useDispatch();

  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });

  const stores = useMemo(() => {
    if (accountInfo?.account_stores) {
      return accountInfo.account_stores.map((role) => role.store).join(", ");
    } else {
      return "";
    }
  }, [accountInfo]);

  const resetPassword = async () => {
    const accountId = accountInfo?.id;
    if (!accountId) {
      showError("Không tìm thấy tài khoản");
      return;
    }
    const response = await callApiNative(
      { isShowLoading: true, isShowError: true },
      dispatch,
      resetPasswordApi,
      [accountInfo?.id],
    );
    if (response) {
      setNewPassword(response);
      showSuccess("Đặt lại mật khẩu thành công");
    }
    setIsShowModalResetPassword(false);
  };
  return (
    <div className="padding-top-20">
      <table className="table-detail">
        <tbody>
          <tr>
            <td>
              <span className="account-title">Nhóm phân quyền </span>
            </td>
            <td>
              <b>: {accountInfo?.role_name}</b>
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
              <b>
                :{" "}
                {accountInfo?.gender &&
                  listGender?.find((item) => item.value.toLocaleLowerCase() === accountInfo.gender)
                    ?.name}{" "}
              </b>
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
              <b>: {ConvertUtcToLocalDate(accountInfo?.birthday, DATE_FORMAT.DDMMYYY)} </b>
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
              <b>: {accountInfo?.phone}</b>
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
              <b>
                :{" "}
                <TextShowMore maxLength={500} splitCharactor=",">
                  {stores}
                </TextShowMore>
              </b>
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
            <Button danger onClick={() => setIsShowModalResetPassword(true)}>
              Đặt lại mật khẩu
            </Button>
            <Button onClick={() => history.push(`${UrlConfig.ACCOUNTS}/${userCode}/update`)}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {allowUpdateAcc ? (
                  <>
                    <RiEditLine color="#757575" style={{ width: "15px" }} /> &nbsp; Chỉnh sửa
                  </>
                ) : null}
              </div>
            </Button>
          </Space>
        }
      />
      {isShowModalResetPassword && (
        <ModalConfirm
          visible={true}
          title="Đặt lại mật khẩu"
          subTitle="Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản này?"
          onOk={resetPassword}
          onCancel={() => setIsShowModalResetPassword(false)}
        />
      )}
      {newPassword && (
        <Modal
          visible={true}
          title="Mật khẩu mới"
          onCancel={() => setNewPassword("")}
          footer={
            <Button
              onClick={(e) => {
                setNewPassword("");
                copyTextToClipboard(e, newPassword);
              }}
              type="primary"
            >
              Sao chép và đóng
            </Button>
          }
        >
          <Input.Group compact>
            <Input
              style={{ width: "calc(100% - 42px)", backgroundColor: "white", color: "black" }}
              disabled
              value={newPassword}
            />
            <Tooltip title="Sao chép mật khẩu">
              <Button
                icon={<CopyOutlined />}
                onClick={(e) => copyTextToClipboard(e, newPassword)}
              />
            </Tooltip>
          </Input.Group>
        </Modal>
      )}
    </div>
  );
}

export default AccountViewTab;
