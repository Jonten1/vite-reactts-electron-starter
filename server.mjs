import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 8080;

// Your 46elks credentials
const elksUsername = process.env.REACT_APP_ELKS_USERNAME;
const elksPassword = process.env.REACT_APP_ELKS_PASSWORD;
const elksNumber = process.env.ELKS_NUMBER;
const webrtcNumber = process.env.WEB_NUMBER;

let incomingCall = null; // Store incoming call

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/receive-call', (req, res) => {
  incomingCall = req.body; // Store incoming call
  console.log('Received incoming call:', incomingCall);
  res.status(200).json({ connect: webrtcNumber });
});

app.post('/make-call', async (req, res) => {
  console.log(req.body);

  const { phoneNumber } = req.body;

  try {
    // API credentials
    const authKey = Buffer.from(`${elksUsername}:${elksPassword}`).toString('base64');

    // Set the call endpoint
    const url = 'https://api.46elks.com/a1/calls';

    // Request data object
    const data = new URLSearchParams({
      voice_start: JSON.stringify({ connect: phoneNumber }),
      to: webrtcNumber,
      from: elksNumber
    }).toString();

    // Set the headers
    const config = {
      headers: {
        Authorization: `Basic ${authKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    // Send request
    const response = await axios.post(url, data, config);

    // Log and respond with the response data
    console.log(response.data);
    res.json(response.data);
  } catch (err) {
    console.error('Error making call:', err);
    res.status(500).json({ error: 'Failed to make call' });
  }

  console.log(req.body);
});

app.get('/incoming-call', (req, res) => {
  if (incomingCall) {
    res.json(incomingCall);
  } else {
    res.json({});
  }
});

app.post('/call-answered', (req, res) => {
  incomingCall = null; // Clear incoming call when answered
  console.log('Call answered and removed from server');
  res.status(200).json({ message: 'Call answered and removed' });
});

app.get('/call-logs', async (req, res) => {
  try {
    const response = await axios.get('https://api.46elks.com/a1/calls', {
      headers: {
        Authorization: `Basic ${Buffer.from(`${elksUsername}:${elksPassword}`).toString('base64')}`
      }
    });

    // Send the fetched call logs back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ message: 'Error fetching call logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/numbers', async (req, res) => {
  try {
    const response = await axios.get('https://api.46elks.com/a1/numbers', {
      headers: {
        Authorization: `Basic ${Buffer.from(`${elksUsername}:${elksPassword}`).toString('base64')}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ message: 'Error fetching numbers' });
  }
});
