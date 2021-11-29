import { StickyUnderNavbar } from "component/container/sticky-under-navbar";

const RenderTabBar = <P extends object>(
  props: any,
  DefaultTabBar: React.ComponentType<P>
) => (
  <StickyUnderNavbar>
    <DefaultTabBar {...props} />
  </StickyUnderNavbar>
);

export default RenderTabBar;
