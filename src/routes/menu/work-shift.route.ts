import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const WorkShiftScheduleScreen = React.lazy(
  () => import("screens/work-shift/work-shift-schedule/WorkShiftSchedule"),
);
const StaffListScreen = React.lazy(() => import("screens/work-shift/staff-list/StaffList"));

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
    subMenu: [],
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
