/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { Card, Typography } from '@material-tailwind/react';
import { FaArrowLeft, FaArrowRight, FaSync } from 'react-icons/fa';
import '../style/call_logs.css';

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
    return (
      <div className="table-div flex flex-row justify-between overflow-hidden w-full">
        <div className="animate-pulse">
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
          <div className="w-72 h-8 bg-gray-300 rounded-md mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert(`Copied to clipboard: ${text}`);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  return (
    <>
      {callLogs.length === 0 ? (
        <p>No call logs found.</p>
      ) : (
        <Card className="table-div">
          <button onClick={fetchCallLogs} className="refresh-button">
            <FaSync />
          </button>
          <table>
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
                <tr key={call.id}>
                  <td>{call.state}</td>
                  <td>{call.start ? formatDate(call.start) : 'N/A'}</td>
                  <td>{call.duration !== undefined ? formatDuration(call.duration) : 'N/A'}</td>
                  <td>{cmNumber}</td>
                  <td>{call.direction === 'incoming' ? 'Incoming' : 'Outgoing'}</td>
                  <td className="cursor-pointer" onClick={() => copyToClipboard(getToValue(call))}>
                    {getToValue(call)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
