import React, { useRef } from "react";
import { Alert, Card, Checkbox } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { ConfigVATScreenWrapper } from "./styles";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import YDConfirmModal, { YDConfirmHandle } from "component/modal/YDConfirmModal";
import { callApiNative } from "utils/ApiUtils";
import { updateTaxConfig } from "service/core/tax.service";
import { TaxConfigCountry, TaxConfigResponse } from "model/core/tax.model";
import { showSuccess } from "utils/ToastUtils";
import { ADMIN_ROLE_ALL } from "../helper";
import useFetchTaxConfig from "hook/useFetchTaxConfig";

const ConfigTaxScreen: React.FC = () => {
  const modalConfirmRef = useRef<YDConfirmHandle>(null);
  const currentUser = useSelector((state: RootReducerType) => state.userReducer.account);
  const dispatch = useDispatch();
  const { taxConfig, getTaxConfig, error } = useFetchTaxConfig();

  const defaultColumns: Array<ICustomTableColumType<TaxConfigCountry>> = [
    {
      title: "Quốc gia/ Khu vực",
      dataIndex: "country_name",
      align: "center",
      width: "60%",
      render: (value, row: TaxConfigCountry) => {
        return (
          <span>
            <img className="country-flag" src={row.country_image_url} alt="country-flag" />
            {value}
          </span>
        );
      },
    },
    {
      title: "Mức thuế cơ sở (%)",
      dataIndex: "tax_rate",
      align: "center",
      width: "40%",
      render: (value) => {
        return <span>{value}%</span>;
      },
    },
  ];

  const confirmChangeConfigTax = async () => {
    const dataSubmit: Pick<TaxConfigResponse, "tax_included"> = {
      tax_included: !taxConfig?.tax_included,
    };
    const response = await callApiNative(
      { isShowLoading: true, isShowError: true },
      dispatch,
      updateTaxConfig,
      dataSubmit,
    );
    if (response) {
      showSuccess("Cập nhật thành công");
      getTaxConfig();
    }
    modalConfirmRef.current?.closeModal();
  };

  return (
    <ContentContainer
      title="Cài đặt cấu hình thuế"
      breadcrumb={[
        {
          name: "Cài đặt",
          path: UrlConfig.HOME,
        },
        {
          name: "Cấu hình thuế",
        },
      ]}
      isError={Boolean(error)}
    >
      <ConfigVATScreenWrapper>
        <Card title="QUẢN LÝ CẤU HÌNH THUẾ BÁN HÀNG" className="card-tax">
          <p className="card-tax-checkbox">
            <Checkbox
              disabled={currentUser?.role_id !== ADMIN_ROLE_ALL}
              checked={taxConfig?.tax_included}
              onChange={() => modalConfirmRef.current?.openModal()}
            >
              Giá sản phẩm đã bao gồm thuế
            </Checkbox>
          </p>
          <Alert
            className="card-tax-alert"
            message={
              <span>
                Tất cả mọi chỉnh sửa đều chỉ có quyền Admin hỗ trợ, vui lòng liên hệ <b>Admin</b> để
                yêu cầu.
              </span>
            }
            description={
              <div className="card-tax-alert-description">
                <span>Thông tin cấu hình thuế mặc định được áp dụng khi tạo mới sản phẩm.</span>
                <span>
                  Khi bỏ tích giá đã bao gồm thuế, IT và Kế toán phối hợp cập nhật lại giá mới.
                </span>
              </div>
            }
            type="error"
            showIcon
          />
          <CustomTable
            bordered
            dataSource={taxConfig?.data ?? []}
            columns={defaultColumns}
            pagination={false}
          />
        </Card>
      </ConfigVATScreenWrapper>
      <YDConfirmModal
        description="Bạn có chắc chắn sửa cấu hình thuế ?"
        ref={modalConfirmRef}
        type="warning"
        onOk={confirmChangeConfigTax}
        onCancel={() => modalConfirmRef.current?.closeModal()}
      />
    </ContentContainer>
  );
};

export default ConfigTaxScreen;
