import DoctorDashboard from '../DoctorDashboard';

export default function DoctorDashboardExample() {
  return (
    <DoctorDashboard
      doctorName="Johnson"
      onLogout={() => console.log('Logout triggered')}
    />
  );
}