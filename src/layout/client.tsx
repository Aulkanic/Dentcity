import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons';
import { Outlet, To, useLocation, useNavigate } from 'react-router-dom';
import { RouterUrl } from '../routes';

const { Header, Content, Sider } = Layout;

const items = [
  { key: RouterUrl.ClientHome, icon: <UserOutlined />, label: 'Dashboard' },
  { key:RouterUrl.ClientAppoint, icon: <VideoCameraOutlined />, label: 'Appointments' },
  { key: RouterUrl.ClientService, icon: <UploadOutlined />, label: 'Services' },
];

export default function ClientSide() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate(); // Hook to navigate
  const currentKey = location.pathname; // Get current URL path

  const handleMenuClick = (e: { key: To; }) => {
    navigate(e.key); // Navigate to the selected key
  };

  return (
    <Layout className='min-h-screen client'>
      <Sider
        className='client'
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          className='client'
          mode="inline"
          selectedKeys={[currentKey]}
          items={items}
          onClick={handleMenuClick} // Attach click handler
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className='flex flex-col'>
            <h1 className="text-4xl font-bold text-center flex flex-col text-sky-600">
              Dentcity
              <span className='text-center font-semibold text-sm text-red-400'>Dental Clinic</span>
            </h1>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
        </div>
        </Content>
      </Layout>
    </Layout>
  );
}
