import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardFooter, IconButton, Input } from '@material-tailwind/react';
import { UserAgent, Registerer, SessionState, URI } from 'sip.js';
import '../style/phone.css';
import axios from 'axios';
import ringtoneFile from '../assets/ringtone-126505.mp3';

function Phone(cmNumber) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timeout, setTimeout] = useState(0);
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallNumber, setIncomingCallNumber] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [userAgent, setUserAgent] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentNumber, setCurrentNumber] = useState('');
  const [direction, setDirection] = useState('incoming');
  const [webrtcUser, setWebrtcUser] = useState(null);
  const [webrtcPassword, setWebrtcPassword] = useState(null);
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const webrtcDomain = 'voip.46elks.com';

  useEffect(() => {
    let timer;
    if (callStartTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      clearInterval(timer);
    };
  }, [callStartTime]);
  useEffect(() => {
    let timer;
    if (callStartTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      clearInterval(timer);
    };
  }, [callStartTime]);

  // Separate effect for fetching numbers
  useEffect(() => {
    const fetchNumbers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8080/numbers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch numbers');
        }

        const data = await response.json();
        const webNumber = data.data.find((number) => number.number === cmNumber.cmNumber);

        if (webNumber) {
          const cleanNumber = webNumber.number.replace('+', '');
          setWebrtcUser(cleanNumber);
          setWebrtcPassword(webNumber.secret);
        }
      } catch (err) {
        console.error('Error fetching numbers:', err);
      }
    };

    if (cmNumber?.cmNumber) {
      fetchNumbers();
    }
  }, [cmNumber?.cmNumber]);
  useEffect(() => {
    const initializeUserAgent = async () => {
      const uri = new URI('sip', webrtcUser, webrtcDomain);
      const ua = new UserAgent({
        uri,
        authorizationUsername: webrtcUser,
        authorizationPassword: webrtcPassword,
        transportOptions: {
          server: `wss://${webrtcDomain}/w1/websocket`
        },
        sessionDescriptionHandlerFactoryOptions: {
          peerConnectionOptions: {
            rtcConfiguration: {
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            }
          }
        }
      });

      await ua.start();
      setUserAgent(ua);

      const registerer = new Registerer(ua);
      await registerer.register();

      ua.delegate = {
        onInvite: (invitation) => {
          console.log('Establishing call');
          setIncomingCall(true);
          setSession(invitation);
          if (ringtoneRef.current) {
            ringtoneRef.current.play();
          }
          if (direction === 'incoming') {
            const from = invitation.request.headers.From[0].parsed.uri.user;
            console.log('Incoming call data', from);
            setIncomingCallNumber(from);
          }

          invitation.stateChange.addListener((newState) => {
            if (newState === SessionState.Established) {
              console.log('Call answered');
              setCallActive(true);
              setCallStartTime(Date.now());
              setupRemoteAudio(invitation);
              console.log('Call established', newState);
            } else if (newState === SessionState.Terminating || newState === SessionState.Terminated) {
              setIncomingCall(false);
              setCallActive(false);
              setCallStartTime(null);
              setElapsedTime(0);
              setSession(null);
              if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current.currentTime = 0;
              }
            }
          });
        }
      };
    };
    initializeUserAgent();
    return () => {
      if (userAgent) {
        userAgent.stop();
      }
    };
  }, [webrtcUser, webrtcPassword]);

  const setupRemoteAudio = (session) => {
    const remoteStream = new MediaStream();
    session.sessionDescriptionHandler.peerConnection.getReceivers().forEach((receiver) => {
      if (receiver.track) {
        remoteStream.addTrack(receiver.track);
      }
    });
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play();
    }
  };

  const makeCall = async () => {
    setTimeout(10);
    setCurrentNumber(phoneNumber);
    try {
      const response = await axios.post('http://localhost:8080/make-call', {
        phoneNumber,
        timeout
      });
      console.log('Response data:', response.data);
      setDirection('outgoing');
      setCallActive(true);

      if (response.data.direction === 'outgoing' && session) {
        const invitation = await session.answer();
        console.log('Call answered');
        setupRemoteAudio(invitation);
      }
    } catch (error) {
      console.error('Error making call:', error);
      if (error.response) {
        setCallActive(false);

        // Log additional information if available
        console.error('Server responded with:', error.response.data);
      }
    }
  };
  const endCall = async () => {
    if (!session) return;

    console.log('Ending call, session state:', session.state);
    setDirection('');
    try {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      if (session.state === SessionState.Established) {
        await session.bye();
      } else if (session.state === SessionState.Initial || session.state === SessionState.Establishing) {
        await session.reject();
      }

      setIncomingCall(false);
      setCallActive(false);
      setSession(null);
      setCurrentNumber('');
      setPhoneNumber('');
      setIncomingCallNumber('');
      console.log('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const answerCall = async () => {
    if (direction === 'incoming') {
      setCurrentNumber(incomingCallNumber);
    }

    if (session) {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      const options = {
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false
          }
        }
      };
      await session.accept(options);
      console.log('Call answered');
      setIncomingCall(false);
      try {
        await fetch('http://localhost:8080/call-answered', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error notifying backend about answered call:', error);
      }
    } else {
      console.log('No incoming call to answer');
    }
  };
  const handleCallButtonClick = () => {
    if (incomingCall) {
      answerCall();
    } else {
      makeCall();
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  useEffect(() => {
    if (direction === 'outgoing') {
      answerCall();
    }
  }, [session]);
  return (
    <Card className="phone">
      {(incomingCall || direction === 'outgoing') && (
        <h3 className="text-xl">{direction === 'outgoing' ? 'Outgoing call to:' : 'Incoming call from:'}</h3>
      )}
      {incomingCall && direction !== 'outgoing' && <p className="text-xl">{incomingCallNumber}</p>}
      {callActive && (
        <>
          <h3 className="text-xl">{currentNumber || incomingCallNumber}</h3>
          <p className="text-xl">{formatTime(elapsedTime)}</p>
        </>
      )}

      {!incomingCall && !callActive && (
        <CardBody className="phone-body">
          <div className="relative flex w-full">
            <Input
              variant="standard"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={12}
              label="Phone number"
              className="nr-input"
              labelProps={{
                className: 'before:content-none after:content-none custom-dark-label'
              }}
              containerProps={{
                className: 'min-w-0'
              }}
            />
          </div>
        </CardBody>
      )}

      <CardFooter className="phone-footer">
        {!callActive && (
          <IconButton onClick={handleCallButtonClick} className="call-button">
            <i className="fas fa-phone text-2xl" />
          </IconButton>
        )}
        <IconButton className="mute-button">
          <i className="fas fa-microphone text-2xl" />
        </IconButton>
        {(callActive || incomingCall) && (
          <>
            <IconButton className="transfer-button">
              <i className="fas fa-right-left text-2xl" />
            </IconButton>{' '}
            <IconButton onClick={endCall} className="hangup-button">
              <i className="fas fa-phone-slash text-2xl" />
            </IconButton>
          </>
        )}
      </CardFooter>

      <audio ref={ringtoneRef} src={ringtoneFile} loop />
      <audio ref={remoteAudioRef} autoPlay />
    </Card>
  );
}

export default Phone;
