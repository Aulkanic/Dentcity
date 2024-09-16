import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { RouterUrl } from "../routes";
import { logoutAdmin } from "../zustand/store/store.provider";

const { Header, Sider, Content } = Layout;

export default function AdminSide() {
  const navigate = useNavigate();

  const handleMenuClick = (key) => {
    if (key === "logout") {
      logoutAdmin();
      navigate(RouterUrl.Login);
    } else {
      navigate(key);
    }
  };



  return (
    <Layout className="min-h-screen w-full">
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <div>Admin Panel</div>
      </Header>

      <Layout className="w-full">
        <Sider width="15%">
          <Menu
            theme="dark"
            mode="inline"
            onClick={handleMenuClick}
            items={[
              {
                label: "Home",
                key: RouterUrl.AdminHome,
              },
              {
                label: "Appointment",
                key: RouterUrl.AdminCard,
              },
              {
                label: "Records",
                key: RouterUrl.AdminTransaction,
              },
              {
                label: "Services",
                key: RouterUrl.AdminUsersManage,
              },
              {
                label: "Reports",
                key: RouterUrl.AdminUsersManage,
              },
              { label: "Log out", key: "logout", icon: <CiLogout /> },
            ]}
          />
        </Sider>
        <Content style={{ padding: "24px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
