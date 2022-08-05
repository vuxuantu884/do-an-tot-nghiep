import { Button, Card, Col, Form, Row } from "antd";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { RootReducerType } from "model/reducers/RootReducerType";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import { StorePermissions } from "config/permissions/setting.permisssion";
import { DepartmentResponse } from "model/account/department.model";
import { departmentDetailAction } from "domain/actions/account/department.action";
import { AppConfig } from "config/app.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { Map } from "component/ggmap";
import BottomBarContainer from "component/container/bottom-bar.container";
import TickIcon from "assets/icon/tick.svg";
import copy from "copy-to-clipboard";
import "./styles.scss";
import { showSuccess } from "utils/ToastUtils";

type StoreParam = {
  id: string;
};

const API_KEY = "AIzaSyB6sGeWZ-0xWzRNGK0eCCdZW1CtzYTfJ0g";

const StoreDetailScreen: React.FC = () => {
  const { id } = useParams<StoreParam>();
  const idNumber = parseInt(id);
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //State
  const [formMain] = Form.useForm();
  const [, setDepartment] = useState<any>();
  const [data, setData] = useState<StoreResponse | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status,
  );
  const firstload = useRef(true);

  //phân quyền
  const [allowUpdateStore] = useAuthorization({
    acceptPermissions: [StorePermissions.UPDATE],
  });

  const findParent = useCallback((list: any, departmentId: number, parent = null) => {
    if (!list) return;
    for (let item of list) {
      let res: any =
        item.id === departmentId
          ? parent
            ? parent
            : item
          : item.children && findParent(item.children, departmentId, item);
      if (res) return res;
    }
  }, []);

  const onResDepartment = useCallback(
    (departmentData: DepartmentResponse | Array<DepartmentResponse> | false) => {
      if (departmentData) {
        setDepartment(departmentData);

        setData((data: any) => {
          if (!data) return;

          const newData = { ...data };
          if (!newData) return;

          if (newData.parent_id === -1) newData.departmentParentName = newData.name;
          else
            newData.departmentParentName = findParent(departmentData, newData.department_id)
              ? findParent(departmentData, newData.department_id).name
              : null;

          setData(newData);

          return data;
        });
      }
    },
    [findParent],
  );

  useEffect(() => {
    dispatch(
      departmentDetailAction(AppConfig.BUSINESS_DEPARTMENT ? AppConfig.BUSINESS_DEPARTMENT : "", onResDepartment),
    );
  }, [dispatch, onResDepartment]);

  const setResult = useCallback((data: StoreResponse | false) => {
    setLoadingData(false);
    if (!data) {
      setError(false);
    } else {
      setData(data);
    }
  }, []);
  const status = useMemo(() => {
    if (!storeStatusList) {
      return "";
    }
    let index = storeStatusList?.findIndex((item) => item.value === data?.status);
    if (index === -1) {
      return "";
    }
    return storeStatusList[index].name;
  }, [data?.status, storeStatusList]);

  useEffect(() => {
    if (firstload.current) {
      if (!Number.isNaN(idNumber)) {
        dispatch(StoreDetailAction(idNumber, setResult));
      }
    }
    firstload.current = true;
  }, [dispatch, idNumber, setResult]);

  const copyCode = () => {
    const url = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${data?.latitude},${data?.longitude}`
    copy(`<iframe width="600" height="450" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={${url}} />`);
    showSuccess("Đã sao chép!");
  }

  return (
    <ContentContainer
      title={"Chi tiết cửa hàng " + data?.name}
      isError={isError}
      isLoading={loadingData}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Cửa hàng",
          path: `${UrlConfig.STORE}`,
        },
        {
          name: data ? data.code : "",
        },
      ]}
    >
      {data !== null && (
        <Form form={formMain} layout="vertical" initialValues={data}>
          <Row gutter={20} className="store-detail-screen">
            <Col span={18}>
              <Card
                title="Thông tin cửa hàng">
                <Row style={{ marginTop: 20 }} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Tên cửa hàng:</div>
                    <div className="value">{data.name}</div>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Số điện thoại:</div>
                    <div className="value">{data.hotline}</div>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Phân loại:</div>
                    <div className="value">{data.type_name}</div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 10 }} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Quốc gia:</div>
                    <div className="value">{data.country_name}</div>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Khu vực:</div>
                    <div className="value">{data.city_name + " - " + data.district_name}</div>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Phường/xã:</div>
                    <div className="value">{data.ward_name}</div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 10 }} gutter={50}>
                  <Col span={24} lg={16} md={16} sm={24}>
                    <div className="title">Địa chỉ:</div>
                    <div className="value">{data.address}</div>
                  </Col>
                  <Col span={24} lg={8} md={8} sm={24}>
                    <div className="title">Mã bưu điện:</div>
                    <div className="value">{data.zip_code}</div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 10 }} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Email:</div>
                    <div className="value">{data.mail}</div>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Trực thuộc:</div>
                    <div className="value">{data.departmentParentName}</div>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <div className="title">Mã tham chiếu:</div>
                    <div className="value">{data.reference_id}</div>
                  </Col>
                </Row>
              </Card>

              <Card title="Bản đồ định vị cửa hàng">
                <Row gutter={50}>
                  <Col span={12}>
                    <div className="mb-5">Tọa độ (kinh độ, vĩ độ)</div>
                    {data.longitude && data.latitude && (
                      <div className="font-weight-500">{data.latitude}, {data.longitude}</div>
                    )}
                  </Col>
                  <Col span={12}>
                    <div className="mb-5">Link google map</div>
                    <a className="font-weight-500" href={data.link_google_map} target="_blank" rel="noreferrer">
                      {data.link_google_map}
                    </a>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <div className="mb-5 font-weight-500 status-info mt-10">
                      <div>Mã nhúng bản đồ</div>
                      <div className="copy-text right" onClick={() => data.longitude && data.latitude && copyCode()}>SAO CHÉP MÃ</div>
                    </div>
                    {data.longitude && data.latitude && (
                      <div className="iframe">&lt;iframe width="600" height="450" loading="lazy" allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${data.latitude},${data.longitude}`} /&gt;</div>
                    )}
                  </Col>
                  <Col span={24}>
                    {data.longitude && data.latitude && (
                      <Map
                        searchable={false}
                        zoom={16}
                        draggable={false}
                        center={{ lat: Number(data.latitude), lng: Number(data.longitude) }}
                        styles={{ width: "100%", height: 478 }}
                      />
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Thông tin tình trạng">
                <div className="status-info">
                  <div>
                    Trạng thái:
                  </div>
                  <div
                    className={`${data.status === "active" ? "success" : "danger"} font-weight-500 right`}>{status}</div>
                </div>
                <div className="status-info">
                  <div>Cho phép bán:</div>
                  <div className="right">{data.is_saleable ? <img src={TickIcon} alt="tick" /> : "---"}</div>
                </div>
                <div className="status-info">
                  <div>Đang kiểm kho:</div>
                  <div className="right">{data.is_stocktaking ? <img src={TickIcon} alt="tick" /> : "---"}</div>
                </div>
              </Card>

              <Card title="Thông tin khác">
                <Row gutter={50}>
                  <Col span={24}>
                    <div className="title">Phân cấp:</div>
                    <div className="value">{data.rank_name}</div>
                  </Col>
                  <Col span={24} style={{ marginTop: 10 }}>
                    <div className="title">VM trực thuộc:</div>
                    <div className="value">{data.vm}</div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 10 }} gutter={50}>
                  <Col span={24}>
                    <div className="title">Ngày mở cửa:</div>
                    <div className="value">{ConvertUtcToLocalDate(data.begin_date)}</div>
                  </Col>
                  <Col span={24} style={{ marginTop: 10 }}>
                    <div className="title">Diện tích cửa hàng (m²):</div>
                    <div className="value">{`${data.square ?? ""}`}</div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={() => history.push(UrlConfig.STORE)}
            rightComponent={
              allowUpdateStore &&
              <Button
                onClick={() => {
                  history.push(`${UrlConfig.STORE}/${idNumber}/update`);
                }}
                type="primary"
              >
                Sửa cửa hàng
              </Button>
            }
          />
        </Form>
      )}
    </ContentContainer>
  );
};

export default StoreDetailScreen;
