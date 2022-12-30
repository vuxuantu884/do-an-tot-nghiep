import { Card, Tooltip } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { searchDepartmentAction } from "domain/actions/account/department.action";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ArrowRight from "assets/icon/arrow-left.svg";
import ArrowRightGray from "assets/icon/arrow-right-gray.svg";
import StarIcon from "assets/icon/star.svg";
import DetailIcon from "assets/icon/detail.svg";
import "./index.scss";
import { convertDepartment } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { DepartmentView } from "model/account/department.model";

type selectedKeysType = {
  id: number,
  parentId: number | undefined,
  level: number,
};

const DepartmentOverviewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [departments, setDepartment] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<selectedKeysType[]>([]);
  const [isShowFirstLv, setIsShowFirstLv] = useState(false);

  const backAction = () => {
    history.push(`${UrlConfig.DEPARTMENT}`);
  };

  useEffect(() => {
    dispatch(
      searchDepartmentAction((result) => {
        if (result) {
          const newResult = convertDepartment(result);

          const resultMap = new Map();
          newResult.forEach((i) => {
            if (resultMap.get(i.level)) {
              resultMap.get(i.level).push(i);
            } else {
              resultMap.set(i.level, [i]);
            }
          });

          setDepartment(Object.fromEntries(resultMap));
        }
      }),
    );
  }, [dispatch]);

  const isExistEl = (id: number | undefined) => {
    if (selectedKeys.length === 0) return false;

    const selectedKeyFiltered = selectedKeys.filter((i: any) => i.id === id);

    return selectedKeyFiltered.length > 0;
  };

  const changeSelectedKeys = (key: number, parentId: number | undefined, level: number) => {
    let newSelectedKeys = [...selectedKeys];

    if (isExistEl(key)) {
      if (newSelectedKeys.length === 0) return;
      newSelectedKeys = newSelectedKeys.filter((i: any) => i.level < level);
    } else {
      newSelectedKeys = newSelectedKeys.filter((i) => i.level < level);
      newSelectedKeys = [
        ...newSelectedKeys,
        {
          id: key,
          parentId,
          level,
        },
      ];
    }

    setSelectedKeys(newSelectedKeys);
  };

  const goToDepartmentDetail = (event: React.MouseEvent<HTMLDivElement>, id: number) => {
    event.stopPropagation();
    window.open(`${BASE_NAME_ROUTER}${UrlConfig.DEPARTMENT}/${id}`, "_blank")
  };

  return (
    <ContentContainer
      title="Sơ đồ tổng quan"
      breadcrumb={[
        {
          name: "Cài đặt",
        },
        {
          name: "Quản lý phòng ban",
          path: UrlConfig.DEPARTMENT,
        },
        {
          name: "Sơ đồ tổng quan",
        },
      ]}
    >
      <Card title="Sơ đồ tổ chức phòng ban công ty thời trang số 1 Việt Nam">
        <div className="container-overview">
          <div className="header-tree">
            <div className="center level-text">Cấp 1</div>
            {departments && Object.keys(departments).map((i: string) => {
              return <div className={`center level-text`}>Cấp {Number(i) + 2}</div>
            })}
          </div>
          <div className="department-tree">
            <div className="level-one">
              <div className="department-tree-level-wrapper mt-38">
                <div className={`department-tree-level ${isShowFirstLv ? "active" : ""}`} onClick={() => setIsShowFirstLv(!isShowFirstLv)}>
                  <div className="left-content">
                    <div className="font-weight-500">YODY</div>
                    <div><img
                      className="mr-5"
                      src={StarIcon}
                      alt="star"
                    />Nguyễn Việt Hòa</div>
                  </div>
                  <img
                    className="icon-right"
                    src={isShowFirstLv ? ArrowRight : ArrowRightGray}
                    alt=""
                  />
                </div>
              </div>
            </div>
            {isShowFirstLv &&
              Object.keys(departments).map((i: string) => {
                console.log(departments[i])
                return (
                  <div className="other-level">
                    {departments[i].map((d: DepartmentView, index: number) => {
                      return (
                        <div className={`department-tree-level-wrapper ${index === 0 && 'mt-38'}`}>
                          <div
                            className={`cursor-p department-tree-level ${
                              isExistEl(d.id) || isExistEl(d.parent?.id)
                                ? `${isExistEl(d.id) ? "active" : ""}`
                                : d.level !== 0
                                  ? "d-none"
                                  : ""
                            }`}
                            onClick={() => {
                              d.isHaveChild && changeSelectedKeys(d.id, d.parent?.id, d.level);
                            }}
                          >
                            <div className="left-content">
                              <div className="font-weight-500">
                                {d.name}
                                <Tooltip title="Xem chi tiết" className="icon-detail">
                                  <img
                                    onClick={(event) => goToDepartmentDetail(event, d.id)} src={DetailIcon} alt="detail"
                                  />
                                </Tooltip>
                              </div>
                              <div><img
                                className="mr-5"
                                src={StarIcon}
                                alt="star"
                              />{d.manager ? d.manager : "---"}</div>
                            </div>
                            {d.isHaveChild && (
                              <img
                                className="icon-right"
                                src={isExistEl(d.id) ? ArrowRight : ArrowRightGray}
                                alt=""
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      </Card>
      <BottomBarContainer back="Quay lại trang danh sách" backAction={backAction} />
    </ContentContainer>
  );
};

export default DepartmentOverviewScreen;
