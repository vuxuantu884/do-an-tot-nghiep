import {Button, Card, Checkbox, Col, Collapse, Form, Row} from "antd";
import {StoreDetailAction} from "domain/actions/core/store.action";
import {StoreResponse} from "model/core/store.model";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import {useParams} from "react-router-dom";
import {RootReducerType} from "model/reducers/RootReducerType";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import BottomBarContainer from "component/container/bottom-bar.container";
import RowDetail from "screens/products/product/component/RowDetail";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import useAuthorization from "hook/useAuthorization";
import { StorePermissions } from "config/permissions/setting.permisssion";
import { DepartmentResponse } from "../../../model/account/department.model";
import { departmentDetailAction } from "../../../domain/actions/account/department.action";
import { AppConfig } from "../../../config/app.config";
const {Panel} = Collapse;

type StoreParam = {
  id: string;
};

const StoreDetailScreen: React.FC = () => {
  const {id} = useParams<StoreParam>();
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
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const firstload = useRef(true);

  //phân quyền
  const [allowUpdateStore] = useAuthorization({
    acceptPermissions: [StorePermissions.UPDATE],
  });

  const findParent = useCallback((list: any, departmentId: number, parent = null) => {
    if (!list) return;
    for (let item of list) {
      let res: any = item.id === departmentId ? parent ? parent : item
        : item.children && findParent(item.children, departmentId, item);
      if (res) return res;
    }
  }, []);

  const onResDepartment = useCallback((departmentData: DepartmentResponse | Array<DepartmentResponse> | false) => {
    if (departmentData) {
      setDepartment(departmentData);

      setData((data: any) => {
        if (!data) return;

        const newData = { ...data };
        if (!newData) return;

        if (newData.parent_id === -1) newData.departmentParentName = newData.name;

        else newData.departmentParentName = findParent(departmentData, newData.department_id)
          ? findParent(departmentData, newData.department_id).name
          : null;

        setData(newData);

        return data;
      });
    }
  }, [findParent]);

  useEffect(() => {
    dispatch(
      departmentDetailAction(AppConfig.BUSINESS_DEPARTMENT ? AppConfig.BUSINESS_DEPARTMENT : '', onResDepartment)
    );
  }, [dispatch, onResDepartment])

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
          <Row gutter={20}>
             <Col span={18}>
                <Card
                  title="Thông tin cửa hàng">
                <Row style={{marginTop: 20}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Tên cửa hàng" value={data.name} />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Số điện thoại" value={data.hotline} />
                  </Col>
                </Row>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Quốc gia" value={data.country_name} />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail
                      title="Khu vực"
                      value={data.city_name + " - " + data.district_name}
                    />
                  </Col>
                </Row>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Phường/xã" value={data.ward_name} />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Địa chỉ" value={data.address} />
                  </Col>
                </Row>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Mã bưu điện" value={data.zip_code} />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Email" value={data.mail} />
                  </Col>
                </Row>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                  <RowDetail title="Trực thuộc" value={data.departmentParentName} />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Phân loại" value={data.type_name} />
                  </Col>
                </Row>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                  <RowDetail title="Mã tham chiếu" value={data.reference_id} />
                  </Col>
                </Row>
              </Card>
             </Col>
             <Col span={6}>
                <Card title="Thông tin tình trạng">
                  <RowDetail title="Trạng thái" value={status} />
                  <Row style={{marginTop: 20}}>
                    <Col>
                      <Checkbox
                        checked={data.is_saleable}
                        disabled={data.status === "inactive"}
                      >
                        Cho phép bán
                      </Checkbox>
                    </Col>
                  </Row>
                  <Row style={{marginTop: 20}}>
                    <Col>
                      <Checkbox
                        checked={data.is_stocktaking}
                        disabled={data.status === "inactive"}
                      >
                        Đang kiểm kho
                      </Checkbox>
                    </Col>
                  </Row>
                </Card>
             </Col>
          </Row>

          <Collapse
            style={{marginBottom: 50}}
            defaultActiveKey="1"
            className="ant-collapse-card margin-top-20"
            expandIconPosition="right"
          >
            <Panel key="1" header="Thông tin khác">
              <div style={{padding: 20}}>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Phân cấp" value={data.rank_name} />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="VM trực thuộc" value={data.vm} />
                  </Col>
                </Row>
                <Row style={{marginTop: 10}} gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail
                      title="Ngày mở cửa"
                      value={ConvertUtcToLocalDate(data.begin_date)}
                    />
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <RowDetail title="Diện tích cửa hàng (m²)" value={`${data.square ?? ""}`} />
                  </Col>
                </Row>
              </div>
            </Panel>
          </Collapse>
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
