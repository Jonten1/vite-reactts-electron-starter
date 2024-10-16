import React, { useState, useEffect, useRef } from 'react';
import { MdPhoneDisabled, MdPhoneEnabled } from 'react-icons/md';
import { UserAgent, Inviter, Registerer, SessionState, URI } from 'sip.js';
import ringtoneFile from '../assets/ringtone-126505.mp3';

function CallComponent() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [userAgent, setUserAgent] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(''); // Current number state
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const webrtcUser = '4600120052';
  const webrtcPassword = '52AAAA26D4459170E37DA65EA0E9D779';
  const webrtcDomain = 'voip.46elks.com';

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8080/incoming-call');
        const data = await response.json();
        setIncomingCallData(data);
        console.log('Incoming call data:', incomingCallData);
        console.log('Incoming call state:', incomingCall, 'call active state:', callActive, 'session', session);
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
    if (!userAgent) return;
    setIncomingCallData(null);
    try {
      const target = UserAgent.makeURI(`sip:${phoneNumber}@${webrtcDomain}`);
      if (!target) {
        throw new Error('Failed to create target URI');
      }

      const inviter = new Inviter(userAgent, target);
      const options = {
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false
          }
        }
      };
      await inviter.invite(options);

      setSession(inviter);
      setCallActive(true);

      inviter.stateChange.addListener((newState) => {
        if (newState === SessionState.Established) {
          setupRemoteAudio(inviter);
        } else if (newState === SessionState.Terminated) {
          setCallActive(false);
          setSession(null);
          console.log('Call terminated');
        }
      });

      console.log('Call initiated');
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const endCall = async () => {
    if (!session) return;

    console.log('Ending call, session state:', session.state);
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

  return (
    <div className="flex flex-col justify-center items-center h-full pt-32 space-y-4">
      {incomingCall && (
        <div className="w-full sm:w-1/2 l:w-1/3 flex justify-center items-center">
          <div className="mt-4">
            <h3>Incoming call from:</h3>
            <p>{incomingCallData?.from}</p>
          </div>
        </div>
      )}
      {callActive && (
        <div>
          <h3 className="text-xl">{currentNumber}</h3>
          <p className="text-xl">Call duration: {formatTime(elapsedTime)}</p>
        </div>
      )}
      {!incomingCall && !callActive && (
        <input
          className="border border-gray-300 rounded-md py-2 px-4 w-50 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          type="number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+46........"
        />
      )}
      <div className="w-full sm:w-1/2 l:w-1/3 flex justify-evenly items-center">
        {!incomingCall && !callActive && (
          <MdPhoneEnabled
            className="flex items-center justify-between bg-green-400 rounded-full size-16 px-2 py-2 focus:outline-none hover:bg-green-300 dark:text-white"
            onClick={makeCall}
          />
        )}
        {(callActive || incomingCall) && (
          <MdPhoneDisabled
            onClick={endCall}
            className="flex items-center justify-between bg-red-400 rounded-full size-16 px-2 py-2 focus:outline-none hover:bg-red-300 dark:text-white"
          />
        )}
        {incomingCall && !callActive && (
          <MdPhoneEnabled
            onClick={answerCall}
            className="flex items-center justify-between bg-green-400 rounded-full size-16 px-2 py-2 focus:outline-none hover:bg-green-300 dark:text-white"
          />
        )}
      </div>
      <audio ref={ringtoneRef} src={ringtoneFile} loop />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}

export default CallComponent;
