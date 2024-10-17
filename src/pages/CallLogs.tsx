import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function CallLogsComponent() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await fetch('http://localhost:8080/call-logs'); // Adjust the URL as needed

        if (!response.ok) {
          throw new Error('Failed to fetch call logs');
        }

        const data = await response.json();
        setCallLogs(data.data);
        console.log('Call logs fetched:', data);
      } catch (error) {
        console.error('Error fetching call logs:', error);
        setError(error.message); // Set error message
        console.log(data);
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
        <table className="overflow-auto h-64 w-fit">
          <thead>
            <tr>
              <th>Status</th>
              <th>Created</th>
              <th>Duration</th>
              <th>From</th>
              <th></th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {callLogs.map((call) => (
              <tr key={call.id}>
                <td>{call.state}</td>
                <td>{call.start ? call.start : 'N/A'}</td>
                <td>{call.duration ? call.duration : 'N/A'}</td>
                <td>{call.from}</td>
                <td>{call.direction === 'incoming' ? <FaArrowLeft /> : <FaArrowRight />}</td>
                <td>{call.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
