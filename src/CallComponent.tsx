import React, { useState, useEffect, useRef } from 'react';
import { MdPhoneDisabled, MdPhoneEnabled } from 'react-icons/md';
import { UserAgent, Inviter, Registerer, SessionState, URI } from 'sip.js';
import ringtoneFile from './assets/ringtone-126505.mp3';

function CallComponent() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [userAgent, setUserAgent] = useState(null);
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
        if (data && Object.keys(data).length > 0) {
          setIncomingCallData(data);
        }
        console.log(incomingCallData);
      } catch (error) {
        console.error('Error fetching incoming call data:', error);
      }
    }, 2000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);
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
              setupRemoteAudio(invitation);
            } else if (newState === SessionState.Terminated) {
              setIncomingCall(false);
              setCallActive(false);
              setSession(null);
              ringtoneRef.current.pause();
              ringtoneRef.current.currentTime = 0;
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
  }, [session]);

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
          console.log(session);
        }
      });

      console.log('Call initiated');
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const endCall = async () => {
    if (session) {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      if (incomingCall) {
        await session.reject();
      } else {
        await session.bye();
      }

      console.log('Call ended');
      setIncomingCallData(null);
    }
  };

  const answerCall = async () => {
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
      console.log(session);
      setIncomingCallData(null);
    } else {
      console.log('No incoming call to answer');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full pt-32 space-y-4">
      {incomingCall && (
        <div className="w-full sm:w-1/2 l:w-1/3 flex justify-center items-center">
          <div className="mt-4">
            <h3>Incoming call from:</h3>
            <p>{incomingCallData.from}</p>
          </div>
        </div>
      )}
      <input
        className="border border-gray-300 rounded-md py-2 px-4 w-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        type="number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+46........"
      />
      <div className="w-full sm:w-1/2 l:w-1/3 flex justify-evenly items-center">
        {(!incomingCall || !callActive) && (
          <button
            className="flex items-center justify-between bg-green-400 rounded px-1 py-0 focus:outline-none hover:bg-green-300 dark:text-white"
            onClick={makeCall}
            disabled={incomingCall || callActive}
          >
            Call
            <MdPhoneEnabled className="ml-1" />
          </button>
        )}
        {(callActive || incomingCall) && (
          <button
            className="flex items-center justify-between bg-red-400 rounded px-1 py-0 focus:outline-none hover:bg-red-300 dark:text-white"
            onClick={endCall}
          >
            Hang up
            <MdPhoneDisabled className="ml-1" />
          </button>
        )}

        {incomingCall && (
          <button
            className="flex items-center justify-between bg-green-400 rounded px-1 py-0 focus:outline-none hover:bg-green-300 dark:text-white"
            onClick={answerCall}
          >
            Pick up
            <MdPhoneEnabled className="ml-1" />
          </button>
        )}
      </div>
      <audio ref={ringtoneRef} src={ringtoneFile} loop />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}

export default CallComponent;
