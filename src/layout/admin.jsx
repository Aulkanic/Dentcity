import { Avatar, Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { RouterUrl } from "../routes";
import { IoNotificationsSharp } from "react-icons/io5";

const { Sider, Content } = Layout;



export default function AdminSide() {
  const navigate = useNavigate();

  const siderStyle = {
    textAlign: "center",
    lineHeight: "120px",
    color: "#fff",
    backgroundColor: "white",
    borderRight: "2px solid #E8E8E8",
  };

  const handleMenuClick = (e) => {
      navigate(e.key);
  };



  return (
    <Layout className="min-h-screen w-full">

      <Sider width="15%" style={siderStyle}>
        <div className="h-40 flex flex-col justify-center items-center">
        <h1 className="text-6xl font-bold text-sky-600">Dentcity</h1><p className='font-semibold text-xl text-red-400'>Dental Clinic</p>
        
        </div>
          <Menu
          style={{ background: "white", color: "black" }}
          className="custom-menu"
            mode="inline"
            onClick={handleMenuClick}
            items={[
              {
                label: "Home",
                key: RouterUrl.Dashboard,
              },
              {
                label: "Appointment",
                key: RouterUrl.Appointments,
              },
              {
                label: "Records",
                key: RouterUrl.Record,
              },
              {
                label: "Services",
                key: RouterUrl.Services,
              },
              {
                label: "Reports",
                key: RouterUrl.AdminUsersManage,
              },
            ]}
          />
        </Sider>
      <Layout className="w-full">
        <Content style={{ padding: "24px",background:'#A2DCF3' }}>
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-xl font-bold tracking-widest">Welcome Administrator!</h1>
            <div className="flex gap-4 items-center">
            <IoNotificationsSharp size={30} color="white" />
            <div className="flex gap-4 items-center">
              <Avatar  />
              <div>
                <p>Mathew Bernal</p>
                <p>Administrator</p>
              </div>
            </div>
            </div>
          </div>
          <div>
          <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
