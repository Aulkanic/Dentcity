/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Modal, Form, Input, TimePicker, Button, notification, Select, Card, Col, Row } from 'antd';
import { getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from '../../../db'; // Adjust the import path as necessary
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Import locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import useStore from '../../../zustand/store/store';
import { selector } from '../../../zustand/store/store.provider';

// Setup date-fns localizer
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }, // Use the imported locale
});

export const ClientAppointmentPage = () => {
  const user = useStore(selector('user'));
  const clientId = user.info.id; // Get the user ID from the store
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch appointments and services
  const fetchAppointmentsAndServices = async () => {
    setLoading(true);
    try {
      // Fetch appointments for the current user only
      const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
      const appointmentsList = appointmentsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(appt => appt.patientId === clientId); // Filter appointments by user ID

      // Sort appointments by createdAt field
      appointmentsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(appointmentsList);

      // Fetch all services
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      servicesList?.shift()
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndServices();
  }, []);

  // Handle saving the new appointment
  const handleSaveAppointment = async (values) => {
    setLoading(true);
    try {
      const { time, location, service } = values;

      // Save the new appointment
      const appointmentRef = await addDoc(collection(db, 'appointments'), {
        patientId: clientId, // Use the current user's ID
        date: selectedDate,
        startTime: dayjs(time[0]).format('h:mm A'),
        endTime: dayjs(time[1]).format('h:mm A'),
        location,
        service,
        createdAt: dayjs().format(),
        status: 'Pending'
      });

      // Create notification for admin
      await addDoc(collection(db, 'notifications'), {
        appointmentId: appointmentRef.id,
        message: `New appointment scheduled for ${service} on ${selectedDate} from ${dayjs(time[0]).format('h:mm A')} to ${dayjs(time[1]).format('h:mm A')}`,
        createdAt: dayjs().format(),
        read: false // Set initial notification status as unread
      });

      notification.success({
        message: 'Success',
        description: 'Appointment added successfully!',
      });
      setIsConfirming(false);
      fetchAppointmentsAndServices(); // Refresh the data
    } catch (error) {
      console.error('Error saving appointment:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save appointment.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert appointments to events for the calendar
  const events = appointments.map(appt => ({
    id: appt.id,
    title: `${appt.service} - ${appt.startTime} - ${appt.location}`,
    start: new Date(`${appt.date}T${dayjs(appt.startTime, 'h:mm A').format('HH:mm:ss')}`),
    end: new Date(`${appt.date}T${dayjs(appt.endTime, 'h:mm A').format('HH:mm:ss')}`),
    location: appt.location,
    service: appt.service,
  }));

  // Check if the selected date already has an appointment
  const hasAppointmentOnDate = (date) => {
    return appointments.some(appt => appt.date === format(date, 'yyyy-MM-dd'));
  };

  // Handle date slot selection
  const handleSelectSlot = (slotInfo) => {
    const date = slotInfo.start;
    if (hasAppointmentOnDate(date)) {
      notification.error({
        message: 'Date Unavailable',
        description: `This date (${format(date, 'yyyy-MM-dd')}) already has an appointment.`,
      });
    } else {
      setSelectedDate(format(date, 'yyyy-MM-dd'));
      setIsConfirming(true);
    }
  };

  if (loading) {
    return <div className="w-full min-h-[700px] flex justify-center items-center"><p className="loader" /></div>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Button to open calendar modal */}
      <div className='flex w-full justify-end'>
        <Button 
          type="primary" 
          onClick={() => setIsCalendarVisible(true)} 
          className="mb-4"
        >
          Add Appointment
        </Button>
      </div>

      {/* Cards for all appointments */}
      <Row gutter={[16, 16]}>
        {appointments.map((appointment) => (
          <Col xs={24} sm={12} md={8} key={appointment.id}>
            <Card title={`Appointment on ${appointment.date}`} bordered>
              <p><strong>Service:</strong> {appointment.service}</p>
              <p><strong>Time:</strong> {appointment.startTime} - {appointment.endTime}</p>
              <p><strong>Location:</strong> {appointment.location}</p>
              <p><strong>Status:</strong> {appointment.status}</p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Calendar Modal for selecting date */}
      <Modal
        title="Select Appointment Date"
        open={isCalendarVisible}
        onCancel={() => setIsCalendarVisible(false)}
        footer={null}
        width="100%"
        style={{ maxWidth: '1200px' }} // Limit max width for larger screens
      >
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={handleSelectSlot}
        />
      </Modal>

      {/* Appointment Details Form Modal */}
      <Modal
        title={`Add Appointment for ${selectedDate}`}
        open={isConfirming}
        onCancel={() => setIsConfirming(false)}
        footer={null}
        width="100%"
        style={{ maxWidth: '600px' }} // Limit max width for larger screens
      >
        <div>
          {/* Form to add a new appointment */}
          <Form form={form} onFinish={handleSaveAppointment}>
            <Form.Item
              label="Appointment Time"
              name="time"
              rules={[{ required: true, message: 'Please select an appointment time!' }]}
            >
              <TimePicker.RangePicker format="h:mm A" className="w-full" />
            </Form.Item>
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: 'Please enter the appointment location!' }]}
            >
              <Input className="w-full" />
            </Form.Item>
            <Form.Item
              label="Service"
              name="service"
              rules={[{ required: true, message: 'Please enter the service!' }]}
            >
              <Select className="w-full">
                {services.map((service) => (
                  <Select.Option key={service.id} value={service.serviceName}>
                    {service.serviceName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                Save Appointment
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
