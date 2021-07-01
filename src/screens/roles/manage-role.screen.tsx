import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";

const ManageRoleScreen = () => {
  return (
    <ContentContainer title="Quản lý phân quyền" breadcrumb={[
      {
        name: 'Tổng quản',
        path: '/',
      },
      {
        name: 'Phân quyền',
        path: `${UrlConfig.ROLES}`
      },
    ]}>
      Invetory
    </ContentContainer>
  )
}

export default ManageRoleScreen;