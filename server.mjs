import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import path from 'path';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 8080;

// Your 46elks credentials
const elksUsername = 'u0350c47b9ce438d299ddfc1762488036';
const elksPassword = '71D873DF52A30ADE550D807C607AA47C';
const elksNumber = '+46766861565';
const webrtcNumber = '+4600120052';

let incomingCall = null; // Store incoming call

// Log incoming call every 2 seconds
setInterval(() => {
  console.log('Incoming call data:', incomingCall);
}, 2000);

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
  const { phoneNumber } = req.body;

  const voiceStart = {
    callerid: elksNumber
  };

  const data = new URLSearchParams({
    from: elksNumber,
    to: phoneNumber,
    voice_start: JSON.stringify(voiceStart)
  });

  try {
    const response = await fetch('https://api.46elks.com/a1/calls', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${elksUsername}:${elksPassword}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    });

    const responseData = await response.json();
    res.json(responseData);
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Failed to make call' });
  }
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
