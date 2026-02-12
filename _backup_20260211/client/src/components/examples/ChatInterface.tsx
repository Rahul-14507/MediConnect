import ChatInterface from '../ChatInterface';

export default function ChatInterfaceExample() {
  const mockMessages = [
    {
      id: "1",
      sender: "patient" as const,
      message: "Hello Doctor, I have been having a high fever and headache for 2 days now.",
      timestamp: Date.now() - 15 * 60 * 1000,
      senderName: "Maria Santos"
    },
    {
      id: "2", 
      sender: "doctor" as const,
      message: "I understand your concern. Can you tell me what your temperature has been and if you've taken any medication?",
      timestamp: Date.now() - 10 * 60 * 1000,
      senderName: "Dr. Johnson"
    },
    {
      id: "3",
      sender: "patient" as const,
      message: "It's been around 39°C. I took some paracetamol but it only helped temporarily.",
      timestamp: Date.now() - 5 * 60 * 1000,
      senderName: "Maria Santos"
    }
  ];

  return (
    <div className="p-4 h-96">
      <ChatInterface
        patientName="Maria Santos"
        messages={mockMessages}
        onSendMessage={(message) => console.log('Send message:', message)}
      />
    </div>
  );
}