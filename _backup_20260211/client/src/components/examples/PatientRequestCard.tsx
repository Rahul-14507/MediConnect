import PatientRequestCard from '../PatientRequestCard';

export default function PatientRequestCardExample() {
  const mockRequest = {
    id: "1",
    patientName: "Maria Santos",
    symptom: "High fever and headache for 2 days. Difficulty sleeping.",
    timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    status: "pending" as const,
  };

  return (
    <div className="p-4 max-w-md">
      <PatientRequestCard
        request={mockRequest}
        onReply={(id) => console.log('Reply triggered for patient:', id)}
        onCall={(id) => console.log('Call triggered for patient:', id)}
      />
    </div>
  );
}