import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Typography,
  IconButton,
  Button,
  Input,
  Menu,
  MenuItem,
  MenuHandler,
  MenuList
} from '@material-tailwind/react';
import { UserAgent, Inviter, Registerer, SessionState, URI } from 'sip.js';
import '../style/phone.css';
import axios from 'axios';
import ringtoneFile from '../assets/ringtone-126505.mp3';
import { C } from 'jssip';
function Phone() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timeout, setTimeout] = useState(0);
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [userAgent, setUserAgent] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(''); // Current number state
  const [direction, setDirection] = useState(''); // Direction
  const [country, setCountry] = useState(0);
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const webrtcUser = '4600120052';
  const webrtcPassword = '52AAAA26D4459170E37DA65EA0E9D779';
  const webrtcDomain = 'voip.46elks.com';
  const COUNTRIES = [
    'France (+33)',
    'Germany (+49)',
    'Sweden (+46)',
    'Denmark (+45)',
    'Finland (+358)',
    'Czech Republic (+420)',
    'Poland (+48)',
    'Netherlands (+31)',
    'Italy (+39)',
    'Norway (+47)',
    'UK (+44)',
    'USA (+1)'
  ];
  const CODES = ['+33', '+49', '+46', '+45', '+358', '+420', '+48', '+31', '+39', '+47', '+44', '+1'];

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8080/incoming-call');
        const data = await response.json();
        setIncomingCallData(data);
      } catch (error) {
        console.error('Error fetching incoming call data:', error);
      }
    }, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [incomingCall, callActive, session]);

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
          console.log('Incoming call');
          setIncomingCall(true);
          setSession(invitation);
          if (ringtoneRef.current) {
            ringtoneRef.current.play();
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
  }, []);

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
    try {
      const response = await axios.post('http://localhost:8080/make-call', {
        phoneNumber: CODES[country] + phoneNumber,
        timeout
      });
      console.log('Response data:', response.data);
      setDirection(response.data.direction);
      // Assuming you're using SIP.js to manage the session
      setCallActive(true);

      if (response.data.direction === 'outgoing') {
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
      setCurrentNumber(''); // Reset current number
      console.log('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const answerCall = async () => {
    setCurrentNumber(incomingCallData.from);
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
      // Notify backend to remove the incoming call instance
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
      {incomingCall && direction !== 'outgoing' && (
        <>
          <h3>Incoming call from:</h3>
          <p>{incomingCallData?.from}</p>
        </>
      )}
      {callActive && (
        <>
          <h3 className="text-xl">{currentNumber}</h3>
          <p className="text-xl">Call duration: {formatTime(elapsedTime)}</p>
        </>
      )}

      {!incomingCall && !callActive && (
        <CardBody className="phone-body">
          <div className="relative flex w-full">
            <Menu placement="bottom-start">
              <MenuHandler>
                <Button ripple={false} variant="text" className="button-country">
                  {CODES[country]}
                </Button>
              </MenuHandler>
              <MenuList className="max-h-[20rem] max-w-[18rem]">
                {COUNTRIES.map((country, index) => {
                  return (
                    <MenuItem key={country} value={country} onClick={() => setCountry(index)}>
                      {country}
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={12}
              placeholder="Phone number"
              className="nr-input"
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
              containerProps={{
                className: 'min-w-0'
              }}
            />
          </div>
        </CardBody>
      )}

      <CardFooter className="phone-footer">
        {!incomingCall && !callActive && (
          <>
            <IconButton onClick={makeCall} className="call-button">
              <i className="fas fa-phone text-2xl" />
            </IconButton>
          </>
        )}
        {incomingCall && !callActive && (
          <>
            <IconButton onClick={answerCall} className="call-button">
              <i className="fas fa-phone text-2xl" />
            </IconButton>
          </>
        )}
        {(callActive || incomingCall) && (
          <IconButton onClick={endCall} className="hangup-button">
            <i className="fas fa-phone-slash text-2xl" />
          </IconButton>
        )}
      </CardFooter>

      <audio ref={ringtoneRef} src={ringtoneFile} loop />
      <audio ref={remoteAudioRef} autoPlay />
    </Card>
  );
}

export default Phone;
