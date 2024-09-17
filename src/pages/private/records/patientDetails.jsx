/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, Table, Modal, notification, Spin, TimePicker, Select, Descriptions, Tag } from 'antd';
import { getDoc, doc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../db';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import moment from 'moment';

// Set up localizer
const localizer = momentLocalizer(moment);

export const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [isAppointing, setIsAppointing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
    });
  };

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const patientDoc = await getDoc(doc(db, 'patients', id));
      setPatient({ id: patientDoc.id, ...patientDoc.data() });

      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const patientAppointments = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((appt) => appt.patientId === id);
      setAppointments(patientAppointments);

      const serviceSnapshot = await getDocs(collection(db, 'services'));
      const servicesList = serviceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      servicesList.shift()
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching data: ', error);
      openNotification('error', 'Error', 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setIsAppointing(false);
    setIsConfirming(true);
  };

  const handleSaveAppointment = async (values) => {
    setLoading(true);
    try {
      const appointmentDate = dayjs(selectedDate).format('YYYY-MM-DD');
      
      const isConflict = appointments.some(appt =>
        dayjs(appt.date).isSame(appointmentDate, 'day')
      );
      
      if (isConflict) {
        openNotification('error', 'Error', 'Appointment date conflicts with an existing appointment.');
        setLoading(false);
        return;
      }
      
      await addDoc(collection(db, 'appointments'), {
        patientId: id,
        date: appointmentDate,
        startTime: values.time[0].format('h:mm A'),
        endTime: values.time[1].format('h:mm A'),
        location: values.location,
        service: values.service,
        createdAt: dayjs().format(),
        status:'Pending'
      });

      openNotification('success', 'Success', 'Appointment added successfully!');
      setIsConfirming(false);
      fetchPatientDetails();
    } catch (error) {
      console.error('Error saving appointment: ', error);
      openNotification('error', 'Error', 'Failed to save appointment.');
    } finally {
      setLoading(false);
    }
  };

  const events = appointments.map(appt => ({
    title: `${appt.startTime} - ${appt.endTime} (${appt.service})`,
    start: moment(appt.date).toDate(),
    end: moment(appt.date).toDate(),
    allDay: false
  }));

  return (
    <div className="p-6 mx-auto">
      {loading ? (
        <Spin />
      ) : (
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h1 className='text-4xl font-bold'>Patient Records</h1>
            <Button type="primary" onClick={() => setIsAppointing(true)}>
              Appoint Patient
            </Button>
          </div>
          <div className='flex flex-nowrap gap-4 w-full my-4'>
            <div className='bg-white p-8 rounded-lg text-xl flex-1'>
              <p><strong className='text-sky-600'>Patient Name</strong> {patient?.firstName} {patient?.lastName}</p>
            </div>
            <div className='bg-white p-8 rounded-lg text-xl w-max'>
              <p><strong className='text-sky-600'>Id</strong> {patient?.id}</p>
            </div>
          </div>
          <div className='flex gap-8 flex-nowrap'>
            {patient && (
              <div className="mb-4 w-[400px]">
                <Descriptions column={1} title={<h1 className='bg-sky-600 p-4 absolute w-full top-0 left-0 text-center text-xl text-white'>Details</h1>} style={{borderRadius:'10px 10px 0px 0px',overflow:'hidden',position:'relative',padding:'8px 24px',background:'white',paddingBottom:'20px'}} className='shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]' layout='vertical'>
                  <Descriptions.Item label="Last Name">{patient.lastName}</Descriptions.Item>
                  <Descriptions.Item label="First Name">{patient.firstName}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{patient.gender}</Descriptions.Item>
                  <Descriptions.Item label="Age">{patient.age}</Descriptions.Item>
                  <Descriptions.Item label="Contact Number">{patient.contactNumber}</Descriptions.Item>
                  <Descriptions.Item label="Address">{patient.address}</Descriptions.Item>
                </Descriptions>
              </div>
            )}
            <div className="mb-4 flex-1">
              <div className="bg-sky-600 text-white p-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">Appointment History</h2>
              </div>
              <Table
                dataSource={appointments}
                columns={[
                  { title: 'Date', dataIndex: 'date', key: 'date' },
                  { title: 'Start Time', dataIndex: 'startTime', key: 'startTime' },
                  { title: 'End Time', dataIndex: 'endTime', key: 'endTime'},
                  { title: 'Location', dataIndex: 'location', key: 'location' },
                  { title: 'Service', dataIndex: 'service', key: 'service' }, 
                  { title: 'Status', dataIndex: 'status', key: 'status',render:((v) => <Tag color={v === 'Completed' ? 'success' : v === 'Cancelled' ? 'error' : 'orange'}>{v}</Tag>) }, 
                ]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                className="bg-white shadow-md rounded-md"
              />
            </div>
          </div>

          <Modal
            title="Select Appointment Date"
            open={isAppointing}
            width={1000}
            onCancel={() => setIsAppointing(false)}
            footer={null}
          >
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              style={{ height: '500px' }}
            />
          </Modal>

          <Modal
            title="Confirm Appointment Details"
            open={isConfirming}
            onCancel={() => setIsConfirming(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleSaveAppointment}>
              <Form.Item
                label="Appointment Time"
                name="time"
                rules={[{ required: true, message: 'Please select the appointment time!' }]}
              >
                <TimePicker.RangePicker format="h:mm A" showTime={{ format: 'h:mm A' }} />
              </Form.Item>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter the location!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Service"
                name="service"
                rules={[{ required: true, message: 'Please select a service!' }]}
              >
                <Select>
                  {services.map((service) => (
                    <Select.Option key={service.id} value={service.name}>
                      {service.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Appointment
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </div>
  );
};
