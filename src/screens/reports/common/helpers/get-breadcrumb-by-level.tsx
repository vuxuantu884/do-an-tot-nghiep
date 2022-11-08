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
  return breadcrumb;
};
