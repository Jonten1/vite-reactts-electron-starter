import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UserAgent, Inviter, Registerer, SessionState, URI } from 'sip.js';
import ringtoneFile from './assets/ringtone-126505.mp3';

function CallComponent() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [userAgent, setUserAgent] = useState(null);
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const webrtcUser = '4600120052';
  const webrtcPassword = '52AAAA26D4459170E37DA65EA0E9D779';
  const webrtcDomain = 'voip.46elks.com';

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
              console.log('Call ended');
              setIncomingCall(false);
              setCallActive(false);
              setSession(null);
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
    } else {
      console.log('No incoming call to answer');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+46701740605"
      />
      <button onClick={makeCall} disabled={incomingCall || callActive}>
        Call
      </button>
      {(callActive || incomingCall) && <button onClick={endCall}>Hang up</button>}
      {incomingCall && <button onClick={answerCall}>Pick up</button>}
      <audio ref={ringtoneRef} src={ringtoneFile} loop />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}

export default CallComponent;
