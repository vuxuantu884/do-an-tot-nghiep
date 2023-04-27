import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const WorkShiftScheduleScreen = React.lazy(
  () => import("screens/work-shift/work-shift-schedule/WorkShiftSchedule"),
);
const WorkShiftScheduleDetailScreen = React.lazy(
  () => import("screens/work-shift/work-shift-schedule-detail"),
);

const StaffListScreen = React.lazy(() => import("screens/work-shift/staff-list"));

const workShiftRoute: Array<RouteMenu> = [
  {
    path: UrlConfig.WORK_SHIFT,
    exact: true,
    title: "Lịch phân ca",
    icon: "icon-dot",
    component: WorkShiftScheduleScreen,
    key: "work-shift-schedule",
    isShow: true,
    header: null,
    // permissions: [],
    subMenu: [
      {
        path: `${UrlConfig.WORK_SHIFT}/:id`,
        exact: true,
        title: "Chi tiết lịch phân ca",
        icon: "icon-dot",
        component: WorkShiftScheduleDetailScreen,
        key: "work-shift-schedule-detail",
        isShow: true,
        header: null,
        // permissions: [],
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.WORK_SHIFT}/staff`,
    exact: true,
    title: "Danh sách nhân viên",
    icon: "icon-dot",
    component: StaffListScreen,
    key: "staff-list",
    isShow: true,
    header: null,
    // permissions: [],
    subMenu: [],
  },
];

export default workShiftRoute;
