import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 8080;
let incomingCallData = null;

// Your 46elks credentials
const elksUsername = 'u0350c47b9ce438d299ddfc1762488036';
const elksPassword = '71D873DF52A30ADE550D807C607AA47C';
const elksNumber = '+46766861565';
const webrtcNumber = '+4600120052';

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webrtc.html'));
});
app.post('/receive-call', (req, res) => {
  res.status(200);
  console.log(req.body);
  incomingCallData = req.body;
  res.json({ connect: webrtcNumber });
  res.end();
});

app.get('/incoming-call', (req, res) => {
  res.json(incomingCallData || {});
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

// Endpoint to end a call
// app.post('/end-call', async (req, res) => {
// 	const callId = req.body.callId

// 	try {
// 		const response = await fetch(`https://api.46elks.com/a1/calls/${callId}`, {
// 			method: 'DELETE',
// 			headers: {
// 				Authorization: `Basic ${Buffer.from(
// 					`${elksUsername}:${elksPassword}`
// 				).toString('base64')}`
// 			}
// 		})

// 		if (!response.ok) {
// 			throw new Error('Failed to end call')
// 		}

// 		res.status(204).send()
// 	} catch (error) {
// 		console.error('Error ending call:', error)
// 		res.status(500).json({ error: 'Failed to end call' })
// 	}
// })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
