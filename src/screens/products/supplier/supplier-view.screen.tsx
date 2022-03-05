import { Button, Card, Col, Row, Space, Tabs } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import UrlConfig, { SupplierTabUrl } from "config/url.config";
import {
  SupplierCreateAddressAction,
  SupplierCreateContactAction,
  SupplierCreatePaymentAction,
  SupplierDeleteAddressAction,
  SupplierDeleteContactAction,
  SupplierDeletePaymentAction,
  SupplierDetailAction,
  SupplierUpdateAddressAction,
  SupplierUpdateContactAction,
  SupplierUpdatePaymentAction,
} from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import {
  SupplierAddressResposne,
  SupplierContactResposne,
  SupplierPaymentResposne,
  SupplierResponse,
} from "model/core/supplier.model";
import React, { useMemo } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import SupplierAddressTab from "./tab/SupplierAddressTab";
import SupplierContactTab from "./tab/SupplierContactTab";
import SupplierPaymentTab from "./tab/SupplierPaymentTab";
import RenderTabBar from "component/table/StickyTabBar";
import RowDetail from "screens/settings/store/RowDetail";
import SupplierAddressModal from "./modal/SupplierAddressModal";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { showSuccess } from "utils/ToastUtils";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import SupplierPaymentModal from "./modal/SupplierPaymentModal";
import SupplierContactModal from "./modal/SupplierContactModal";
type SupplierParam = {
  id: string;
};

const ViewSupplierScreen: React.FC = () => {
  const { id } = useParams<SupplierParam>();
  let idNumber = parseInt(id);
  const dispatch = useDispatch();
  const history = useHistory();
  const [allowCreateSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.UPDATE],
    not: false,
  });
  const path = history.location.pathname;
  let active = path.split("/");
  const [activeTab, setActiveTab] = useState<string>(
    active.length === 4 ? active[3] : SupplierTabUrl.CONTACTS
  );
  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [loadingTableAddress, setLoadingTableAddress] = useState<boolean>(false);
  const [loadingTablePayment, setLoadingTablePayment] = useState<boolean>(false);
  const [loadingTableContact, setLoadingTableContact] = useState<boolean>(false);
  const [visibleAddress, setVisibleAddress] = useState<boolean>(false);
  const [visiblePayment, setVisiblePayment] = useState<boolean>(false);
  const [visibleContact, setVisibleContact] = useState<boolean>(false);
  const [address, setAddress] = useState<SupplierAddressResposne | null>(null);
  const [payment, setPayment] = useState<SupplierPaymentResposne | null>(null);
  const [contact, setContact] = useState<SupplierContactResposne | null>(null);
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [confirmLoadingAddress, setConfirmLoadingAddress] = useState<boolean>(false);
  const [confirmLoadingPayment, setConfirmLoadingPayment] = useState<boolean>(false);
  const [confirmLoadingContact, setConfirmLoadingContact] = useState<boolean>(false);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const setSupplierDetail = useCallback((data: SupplierResponse | false) => {
    setLoading(false);
    if (!data) {
      setError(true);
    } else {
      setSupplier(data);
    }
  }, []);

  const updateSupplier = useCallback(
    (data: SupplierResponse | null) => {
      switch (activeTab) {
        case SupplierTabUrl.ADDRESSES:
          setConfirmLoadingAddress(false);
          setLoadingTableAddress(false);
          break;
        case SupplierTabUrl.CONTACTS:
          setConfirmLoadingContact(false);
          setLoadingTableContact(false);
          break;
        case SupplierTabUrl.PAYMENTS:
          setConfirmLoadingPayment(false);
          setLoadingTablePayment(false);
          break;
      }
      if (data) {
        setSupplier(data);
        switch (activeTab) {
          case SupplierTabUrl.ADDRESSES:
            setVisibleAddress(false);
            showSuccess("Thêm mới địa chỉ thành công");
            break;
          case SupplierTabUrl.CONTACTS:
            setVisibleContact(false);
            showSuccess("Thêm mới thông tin liên hệ thành công");
            break;
          case SupplierTabUrl.PAYMENTS:
            setVisiblePayment(false);
            showSuccess("Thêm thông tin ngân hàng thành công");
            break;
        }
      }
    },
    [activeTab]
  );

  const getButtonRight = useMemo(() => {
    switch (activeTab) {
      case SupplierTabUrl.ADDRESSES:
        return "Thêm địa chỉ";
      case SupplierTabUrl.CONTACTS:
        return "Thêm liên hệ";
      case SupplierTabUrl.PAYMENTS:
        return "Thêm thanh toán";
    }
  }, [activeTab]);

  const onClickAdd = useCallback(() => {
    switch (activeTab) {
      case SupplierTabUrl.ADDRESSES:
        setAddress(null);
        setVisibleAddress(true);
        break;
      case SupplierTabUrl.CONTACTS:
        setContact(null);
        setVisibleContact(true);
        break;
      case SupplierTabUrl.PAYMENTS:
        setPayment(null);
        setVisiblePayment(true);
        break;
    }
  }, [activeTab]);
  useEffect(() => {
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(233, setListDistrict));
  }, [dispatch, setListDistrict]);
  useEffect(() => {
    if (!Number.isNaN(idNumber)) {
      setLoading(true);
      dispatch(SupplierDetailAction(idNumber, setSupplierDetail));
    }
  }, [dispatch, idNumber, setSupplierDetail]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      isError={isError}
      isLoading={isLoading}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhà cung cấp",
          path: `${UrlConfig.SUPPLIERS}`,
        },
        {
          name: supplier ? supplier.code : "",
        },
      ]}
    >
      {supplier && (
        <React.Fragment>
          <Card title="Thông tin cơ bản" extra={
                  <Space size={15}>
                    <label className="text-default">Trạng thái:</label>
                    <label
                      className={supplier.status === "active" ? "text-success" : "text-error"}
                    >
                      {supplier.status_name}
                    </label>
                  </Space>}>
            <Row gutter={50}>
              <Col span={8}>
                <RowDetail title="Mã nhà cung cấp" value={supplier.code} />
                <RowDetail title="Tên nhà cung cấp" value={supplier.name} />
                <RowDetail title="Loại nhà cung cấp" value={supplier.type_name} />
              </Col>
              <Col span={8}>
                <RowDetail title="Số điện thoại" value={supplier.phone} />
                <RowDetail title="Phân cấp" value={supplier.scorecard_name} />
                <RowDetail
                  title="Merchandiser"
                  value={`${supplier.pic_code} - ${supplier.pic}`}
                />
              </Col>
              <Col span={8}>
                <RowDetail title="Mã số thuế" value={supplier.tax_code} />
                <RowDetail
                  title="SL Tối thiểu"
                  value={
                    supplier.moq ? `${supplier.moq} (${supplier.moq_unit_name})` : ""
                  }
                />
                <RowDetail
                  title="TG công nợ"
                  value={
                    supplier.debt_time
                      ? `${supplier.debt_time} (${supplier.debt_time_unit_name})`
                      : ""
                  }
                />
              </Col>
            </Row>
          </Card>
          <Card className="card-tab">
            <Tabs
              style={{ overflow: "initial" }}
              activeKey={activeTab}
              onChange={(active) => {
                history.push(`${UrlConfig.SUPPLIERS}/${id}/${active}`);
                setActiveTab(active);
              }}
              tabBarExtraContent={{
                right: allowCreateSup && (
                  <Button onClick={onClickAdd}>{getButtonRight}</Button>
                ),
              }}
              renderTabBar={RenderTabBar}
            >
              <Tabs.TabPane tab="Danh sách liên hệ" key={SupplierTabUrl.CONTACTS}>
                <SupplierContactTab
                  loading={loadingTableContact}
                  onDetail={(data) => {
                    setContact(data);
                    setVisibleContact(true);
                  }}
                  onDefault={(contactId, data) => {
                    setLoadingTableContact(true);
                    dispatch(
                      SupplierUpdateContactAction(
                        idNumber,
                        contactId,
                        data,
                        updateSupplier
                      )
                    );
                  }}
                  onDelete={(contactId) => {
                    setModalConfirm({
                      title: "Xác nhận",
                      subTitle: "Bạn đồng ý xóa thông tin liên hệ nhà cung cấp?",
                      visible: true,
                      onCancel: () => {
                        setModalConfirm({ visible: false });
                      },
                      onOk: () => {
                        setModalConfirm({ visible: false });
                        setLoadingTableContact(true);
                        dispatch(
                          SupplierDeleteContactAction(idNumber, contactId, updateSupplier)
                        );
                      },
                    });
                  }}
                  data={supplier.contacts}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Danh sách địa chỉ" key={SupplierTabUrl.ADDRESSES}>
                <SupplierAddressTab
                  loading={loadingTableAddress}
                  onDetail={(data) => {
                    setAddress(data);
                    setVisibleAddress(true);
                  }}
                  onDefault={(addressId, data) => {
                    setLoadingTableAddress(true);
                    dispatch(
                      SupplierUpdateAddressAction(
                        idNumber,
                        addressId,
                        data,
                        updateSupplier
                      )
                    );
                  }}
                  onDelete={(addressId) => {
                    setModalConfirm({
                      title: "Xác nhận",
                      subTitle: "Bạn đồng ý xóa địa chỉ nhà cung cấp?",
                      visible: true,
                      onCancel: () => {
                        setModalConfirm({ visible: false });
                      },
                      onOk: () => {
                        setModalConfirm({ visible: false });
                        setLoadingTablePayment(true);
                        dispatch(
                          SupplierDeleteAddressAction(idNumber, addressId, updateSupplier)
                        );
                      },
                    });
                  }}
                  data={supplier.addresses}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Danh sách ngân hàng" key={SupplierTabUrl.PAYMENTS}>
                <SupplierPaymentTab
                  loading={loadingTablePayment}
                  onDetail={(data) => {
                    setPayment(data);
                    setVisiblePayment(true);
                  }}
                  onDelete={(paymentId) => {
                    setModalConfirm({
                      title: "Xác nhận",
                      subTitle: "Bạn đồng ý xóa thông tin ngân hàng?",
                      visible: true,
                      onCancel: () => {
                        setModalConfirm({ visible: false });
                      },
                      onOk: () => {
                        setModalConfirm({ visible: false });
                        setLoadingTablePayment(true);
                        dispatch(
                          SupplierDeletePaymentAction(idNumber, paymentId, updateSupplier)
                        );
                      },
                    });
                  }}
                  data={supplier.payments}
                />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </React.Fragment>
      )}
      <SupplierAddressModal
        confirmLoading={confirmLoadingAddress}
        countries={countries}
        listDistrict={listDistrict}
        visible={visibleAddress}
        data={address}
        onCancle={() => setVisibleAddress(false)}
        onSave={(addressId: number | undefined | null, request) => {
          setConfirmLoadingAddress(true);
          if (addressId === undefined || addressId === null) {
            dispatch(SupplierCreateAddressAction(idNumber, request, updateSupplier));
            return;
          }
          dispatch(
            SupplierUpdateAddressAction(idNumber, addressId, request, updateSupplier)
          );
        }}
      />
      <SupplierPaymentModal
        confirmLoading={confirmLoadingPayment}
        visible={visiblePayment}
        data={payment}
        onCancle={() => setVisiblePayment(false)}
        onSave={(paymentId: number | undefined | null, request) => {
          setConfirmLoadingPayment(true);
          if (paymentId === undefined || paymentId === null) {
            dispatch(SupplierCreatePaymentAction(idNumber, request, updateSupplier));
            return;
          }
          dispatch(
            SupplierUpdatePaymentAction(idNumber, paymentId, request, updateSupplier)
          );
        }}
      />
      <SupplierContactModal
        confirmLoading={confirmLoadingContact}
        visible={visibleContact}
        data={contact}
        onCancle={() => setVisibleContact(false)}
        onSave={(contactId: number | undefined | null, request) => {
          setConfirmLoadingContact(true);
          if (contactId === undefined || contactId === null) {
            dispatch(SupplierCreateContactAction(idNumber, request, updateSupplier));
            return;
          }
          dispatch(
            SupplierUpdateContactAction(idNumber, contactId, request, updateSupplier)
          );
        }}
      />
      <ModalConfirm {...modalConfirm} />
      <BottomBarContainer
        back="Quay lại danh sách"
        rightComponent={
          allowCreateSup && (
            <Button onClick={() => {
              history.push(`${UrlConfig.SUPPLIERS}/${id}/update`)
            }} htmlType="submit" type="primary">
              Sửa nhà cung cấp
            </Button>
          )
        }
      />
    </ContentContainer>
  );
};

export default ViewSupplierScreen;
