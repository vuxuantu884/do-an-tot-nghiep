import { Card } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { searchDepartmentAction } from "domain/actions/account/department.action";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ArrowRight from "assets/icon/arrow-left.svg";
import ArrowRightGray from "assets/icon/arrow-right-gray.svg";
import "./index.scss";
import { convertDepartment } from "utils/AppUtils";
import { useHistory } from "react-router-dom";

const DepartmentOverviewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [departments, setDepartment] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const [isShowFirstLv, setIsShowFirstLv] = useState<boolean>(false);

  const backAction = () => {
    history.push(`${UrlConfig.DEPARTMENT}`)
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

  const isExistEl = (id: number) => {
    if (selectedKeys.length === 0) return false;

    const selectedKeyFiltered = selectedKeys.filter((i: any) => i.id === id);


    return selectedKeyFiltered.length > 0;
  };

  const changeSelectedKeys = (key: number, parentId: number, level: number) => {
    let newSelectedKeys = [...selectedKeys];

    if (isExistEl(key)) {
      if (newSelectedKeys.length === 0) return;
      newSelectedKeys = newSelectedKeys.filter((i: any) => i.level < level);
    } else {
      newSelectedKeys = newSelectedKeys.filter((i) => i.level < level);
      newSelectedKeys = [...newSelectedKeys, {
        id: key,
        parentId,
        level,
      }];
    }

    setSelectedKeys(newSelectedKeys);
  };

  const goToDepartmentDetail = (id: number) => {
    history.push(`${UrlConfig.DEPARTMENT}/${id}`);
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
        <div className="department-tree">
          <div className={`level-one ${isShowFirstLv ? 'active' : ''}`}>
            <div className="center level-text fixed-header">Cấp 1</div>
            <div className="department-tree-level" onClick={() => setIsShowFirstLv(!isShowFirstLv)}>
              <div className="text-left">YODY</div>
              <img className="icon-right" src={isShowFirstLv ? ArrowRight : ArrowRightGray} alt="" />
            </div>
          </div>
          {isShowFirstLv && Object.keys(departments).map((i: any) => {
            return (
              <div className="other-level">
                <div className="center level-text fixed-header">Cấp {Number(i) + 2}</div>
                {departments[i].map((d: any) => {
                  return (
                    <div className={`cursor-p department-tree-level ${isExistEl(d.id)
                    || isExistEl(d.parent?.id) ? `${isExistEl(d.id) ? "active" : ""}` : d.level !== 0 ? "d-none" : ""}`}
                         onClick={() => goToDepartmentDetail(d.id)}
                    >
                      <div className="text-left">{d.name}</div>
                      {d.isHaveChild && (
                        <img
                          onClick={(e) => {
                            e.stopPropagation();
                            d.isHaveChild && changeSelectedKeys(d.id, d.parent?.id, d.level);
                          }}
                          className="icon-right"
                          src={isExistEl(d.id) ? ArrowRight : ArrowRightGray}
                          alt=""
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
      <BottomBarContainer
        back="Quay lại trang danh sách"
        backAction={backAction}
      />
    </ContentContainer>
  );
};

export default DepartmentOverviewScreen;
