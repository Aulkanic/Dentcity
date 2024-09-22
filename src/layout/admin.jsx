import {
  Avatar,
  Button,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  Popover,
} from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { RouterUrl } from "../routes";
import { IoNotificationsSharp } from "react-icons/io5";
import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../db";

const { Sider, Content } = Layout;

export default function AdminSide() {
  const navigate = useNavigate();
  const [form] = Form.useForm()
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Reauthenticate user if current password is provided
      if (values.currentPassword && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          values.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }

      // Update displayName if changed
      if (user.displayName !== values.displayName) {
        await updateProfile(user, { displayName: values.displayName });
      }

      // Update email if changed
      if (user.email !== values.email) {
        await updateEmail(user, values.email);
      }

      // Update password if new password is provided
      if (values.newPassword) {
        await updatePassword(user, values.newPassword);
      }

      message.success("Updated Successfully");
      form.resetFields()
      setIsOpen(false);  // Close the modal after success
    } catch (error) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        message.error("The current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        message.error("The new password is too weak.");
      } else if (error.code === "auth/email-already-in-use") {
        message.error("The email address is already in use.");
      } else if (error.code === "auth/invalid-email") {
        message.error("The email address is invalid.");
      } else {
        message.error("Failed to update information. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen w-full">
      <Sider width="15%" style={siderStyle}>
        <div className="h-40 flex flex-col justify-center items-center">
          <h1 className="text-6xl font-bold text-sky-600">Dentcity</h1>
          <p className="font-semibold text-xl text-red-400">Dental Clinic</p>
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
              key: RouterUrl.Reports,
            },
          ]}
        />
      </Sider>
      <Layout className="w-full">
        <Content style={{ padding: "24px", background: "#A2DCF3" }}>
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-xl font-bold tracking-widest">
              Welcome Administrator!
            </h1>
            <div className="flex gap-4 items-center">
              <IoNotificationsSharp size={30} color="white" />
              <div className="flex gap-4 items-center">
                <div>
                  <p className="font-bold text-xl">{user?.displayName}</p>
                  <p>Administrator</p>
                </div>
                <Popover
                  placement="bottomRight"
                  content={
                    <div className="w-32 p-0">
                      <p
                        className="hover:bg-[#4e38f5] hover:text-white cursor-pointer p-2 rounded-md"
                        onClick={() => setIsOpen(true)}
                      >
                        Profile
                      </p>
                      <p
                        className="hover:bg-[#4e38f5] hover:text-white cursor-pointer p-2 rounded-md"
                        onClick={() => navigate(RouterUrl.Login)}
                      >
                        Logout
                      </p>
                    </div>
                  }
                >
                  <Avatar size={40} className="cursor-pointer" />
                </Popover>
              </div>
            </div>
          </div>
          <div>
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Modal
        title="Update your Information"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}  // We don't need a footer because the buttons are inside the form
      >
        <Form
          onFinish={handleSubmit}
          layout="vertical"
          form={form}
          initialValues={{
            email: user?.email,
            displayName: user?.displayName,
          }}
        >
          <Form.Item name="displayName" label="Username">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="currentPassword" label="Current Password">
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="New Password">
            <Input.Password />
          </Form.Item>

          {/* Form buttons */}
          <div className="flex justify-end gap-4">
            <Button type="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
}
