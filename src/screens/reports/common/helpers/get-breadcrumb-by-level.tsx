import { BreadcrumbProps } from "component/container/breadcrumb.container";
import queryString from "query-string";

export const getBreadcrumbByLevel = (
  queries: any,
  departmentLv2: string | null,
  departmentLv3: string | null,
) => {
  const {
    departmentLv2: departmentLv2Param,
    departmentLv3: departmentLv3Param,
    ...others
  } = queries;
  const breadcrumb: BreadcrumbProps[] = [
    {
      name: "TỔNG CÔNG TY",
      path: `?${queryString.stringify({ ...others })}`,
    },
  ];

  if (departmentLv2) {
    breadcrumb.push({
      name: departmentLv2,
      path: `?${queryString.stringify({ ...others, departmentLv2 })}`,
    });
  }
  if (departmentLv2 && departmentLv3) {
    breadcrumb.push({
      name: departmentLv3,
      path: `?${queryString.stringify({
        ...queries,
        departmentLv2,
        departmentLv3,
      })}`,
    });
  }
  if (queries.groupLv2) {
    const { groupLv2, groupLv, groupLvName, groupLv3, groupLv4, groupLv5, groupLv6, ...noGroupLv } =
      queries;
    breadcrumb.push({
      name: "Báo cáo kết quả kinh doanh",
      path: `?${queryString.stringify({
        ...noGroupLv,
      })}`,
    });
    breadcrumb.push({
      name: groupLv2,
      path: `?${queryString.stringify({
        ...noGroupLv,
        groupLv2,
        groupLv: 2,
        groupLvName: groupLv2,
      })}`,
    });
  }
  if (queries.groupLv3) {
    const { groupLv3, groupLv4, groupLv5, groupLv6, ...noGroupLv } = queries;
    breadcrumb.push({
      name: groupLv3,
      path: `?${queryString.stringify({
        ...noGroupLv,
        groupLv3,
        groupLv: 3,
        groupLvName: groupLv3,
      })}`,
    });
  }
  if (queries.groupLv4) {
    const { groupLv4, groupLv5, groupLv6, ...noGroupLv } = queries;
    breadcrumb.push({
      name: groupLv4,
      path: `?${queryString.stringify({
        ...noGroupLv,
        groupLv4,
        groupLv: 4,
        groupLvName: groupLv4,
      })}`,
    });
  }
  if (queries.groupLv5) {
    const { groupLv5, groupLv6, ...noGroupLv } = queries;
    breadcrumb.push({
      name: groupLv5,
      path: `?${queryString.stringify({
        ...noGroupLv,
        groupLv5,
        groupLv: 5,
        groupLvName: groupLv5,
      })}`,
    });
  }
  return breadcrumb;
};
