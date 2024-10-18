import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaSync } from 'react-icons/fa';

interface CallLog {
  id: string;
  state: string;
  start?: string;
  duration?: number;
  from: string;
  direction: 'incoming' | 'outgoing';
  to?: string;
  legs?: Array<{
    to: string;
  }>;
}
interface NumberData {
  id: string;
  number: string;
  country: string;
  name: string;
  category: string;
}

export default function CallLogsComponent() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [numbers, setNumbers] = useState<NumberData[]>([]);
  const [cmNumber, setCmNumber] = useState<string | null>(null);
  const [cmNumberWeb, setCmNumberWeb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCallLogs = async () => {
    setLoading(true); // Show loading indicator while fetching
    try {
      const response = await fetch('http://localhost:8080/call-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch call logs');
      }

      const data = await response.json();
      setCallLogs(data.data);
      console.log('Call logs', data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNumbers = async () => {
    try {
      const response = await fetch('http://localhost:8080/numbers');

      if (!response.ok) {
        throw new Error('Failed to fetch numbers');
      }

      const data = await response.json();
      setNumbers(data.data);
      console.log('Numbers', data.data);
      const mobileNumber = data.data.find((number: NumberData) => number.name === 'sv_mobile');
      const webNumber = data.data.find((number: NumberData) => number.name === 'sv_web_number');

      if (mobileNumber) {
        setCmNumber(mobileNumber.number);
      }

      if (webNumber) {
        setCmNumberWeb(webNumber.number);
      }

      console.log('Mobile Number:', cmNumber);
      console.log('Web Number:', cmNumberWeb);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCallLogs(); // Fetch call logs on mount
    fetchNumbers(); // Fetch numbers on mount
  }, []);

  const getToValue = (call: CallLog) => {
    if (call.direction === 'incoming') {
      return call.from;
    }
    if (call.legs) {
      return call.legs.map((leg) => leg.to).join(', ');
    }
    return 'N/A';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  };

  return (
    <>
      <button
        onClick={fetchCallLogs}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center"
      >
        <FaSync className="mr-2" /> Refresh
      </button>
      {callLogs.length === 0 ? (
        <p>No call logs found.</p>
      ) : (
        <table>
          <caption className="caption-top">Last 100 calls</caption>
          <div className="m-5 border border-slate-600 rounded bg-gray-500">
            <thead>
              <tr>
                <th>Status</th>
                <th>Created</th>
                <th>Duration</th>
                <th>User</th>
                <th>Direction</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {callLogs.map((call) => (
                <tr className="border border-slate-700" key={call.id}>
                  <td>{call.state}</td>
                  <td>{call.start ? formatDate(call.start) : 'N/A'}</td>
                  <td>{call.duration !== undefined ? formatDuration(call.duration) : 'N/A'}</td>
                  <td>{cmNumber}</td>
                  <td>{call.direction === 'incoming' ? <FaArrowLeft /> : <FaArrowRight />}</td>
                  <td>{getToValue(call)}</td>
                </tr>
              ))}
            </tbody>
          </div>
        </table>
      )}
    </>
  );
}
