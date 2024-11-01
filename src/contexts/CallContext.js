// CallContext.js
import React, { createContext, useState, useContext, useRef } from 'react';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(''); // Current number state
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Other state management functions here...

  return (
    <CallContext.Provider
      value={{
        phoneNumber,
        setPhoneNumber,
        session,
        setSession,
        incomingCall,
        setIncomingCall,
        incomingCallData,
        setIncomingCallData,
        callActive,
        setCallActive,
        callStartTime,
        setCallStartTime,
        elapsedTime,
        setElapsedTime,
        currentNumber,
        setCurrentNumber,
        ringtoneRef,
        remoteAudioRef
        // Add other functions to manage state here...
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
