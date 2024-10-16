import React, { useEffect, useState } from 'react';

const CallLogsComponent = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await fetch('/call-logs'); // Adjust the URL as needed
        if (!response.ok) {
          throw new Error('Failed to fetch call logs');
        }

        const data = await response.json();
        setCallLogs(data);
        console.log('Call logs fetched:', data);
      } catch (error) {
        console.error('Error fetching call logs:', error);
        setError(error.message); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  return (
    <div>
      <h2>Call Logs</h2>
      {callLogs.length === 0 ? ( // Handle empty call logs
        <p>No call logs found.</p>
      ) : (
        <ul>
          {callLogs.map((call) => (
            <li key={call.id}>
              <p>From: {call.from}</p>
              <p>To: {call.to}</p>
              <p>Status: {call.status}</p>
              <p>Duration: {call.duration} seconds</p>
              <p>Created: {new Date(call.created * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CallLogsComponent;
