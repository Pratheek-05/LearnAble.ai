import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import type { Chat } from "@google/genai";

const PROFILES = {
  DYSLEXIA: {
    name: 'Dyslexia',
    description: 'Simplified text & text-to-speech.',
    icon: ' D ',
    systemInstruction: 'You are an AI tutor for a user with dyslexia. Provide clear, concise explanations. Use simple language, short sentences, and bullet points. Avoid complex vocabulary and long paragraphs. Emphasize key terms using bold formatting.',
  },
  ADHD: {
    name: 'ADHD',
    description: 'Gamified micro-lessons.',
    icon: ' A ',
    systemInstruction: 'You are an AI tutor for a user with ADHD. Present information in engaging, bite-sized micro-lessons or quests. Use a positive and encouraging tone. Break down complex topics into a series of simple, actionable steps. Use emojis and lists to keep the content stimulating.',
  },
  AUTISM: {
    name: 'Autism',
    description: 'Clear, structured content.',
    icon: ' U ',
    systemInstruction: 'You are an AI tutor for a user with autism. Provide direct, literal, and structured information. Use clear headings, bullet points, and logical sequencing. Avoid sarcasm, metaphors, and ambiguous language. Explain concepts step-by-step in a predictable and calm format.',
  }
};

type ProfileKey = keyof typeof PROFILES;

interface Message {
  role: 'user' | 'model';
  text: string;
}

const App: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileKey | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initializeChat = useCallback((profileKey: ProfileKey) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const profile = PROFILES[profileKey];
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: profile.systemInstruction,
        },
      });
      setChat(newChat);
      setSelectedProfile(profileKey);
      setMessages([{ role: 'model', text: `Hello! I'm your AI tutor, ready to help you learn in a way that works for you. What topic would you like to explore today?` }]);
    } catch (e) {
      console.error(e);
      setError("Failed to initialize the AI Tutor. Please check the API key and refresh the page.");
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!chat) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text }]);

    try {
      const response = await chat.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Sorry, I couldn't get a response. Please try again.");
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetSession = () => {
      setSelectedProfile(null);
      setChat(null);
      setMessages([]);
      setError(null);
  }

  if (error) {
      return <ErrorDisplay message={error} />
  }

  return (
    <div style={styles.container} className={selectedProfile === 'DYSLEXIA' ? 'dyslexia-font' : ''}>
      {!selectedProfile ? (
        <ProfileSelector onSelectProfile={initializeChat} />
      ) : (
        <TutorView
          profile={PROFILES[selectedProfile]}
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onReset={resetSession}
        />
      )}
    </div>
  );
};

const ProfileSelector: React.FC<{ onSelectProfile: (profile: ProfileKey) => void }> = ({ onSelectProfile }) => (
  <div style={styles.profileSelector}>
    <h1 style={styles.title}>Welcome to Your Personalized AI Tutor</h1>
    <p style={styles.subtitle}>Please select a profile to tailor your learning experience.</p>
    <div style={styles.profileGrid}>
      {(Object.keys(PROFILES) as ProfileKey[]).map(key => (
        <button key={key} onClick={() => onSelectProfile(key)} style={styles.profileCard}>
          <div style={styles.profileIcon}>{PROFILES[key].icon}</div>
          <h2 style={styles.profileName}>{PROFILES[key].name}</h2>
          <p style={styles.profileDescription}>{PROFILES[key].description}</p>
        </button>
      ))}
    </div>
  </div>
);

const TutorView: React.FC<{
  profile: typeof PROFILES[ProfileKey],
  messages: Message[],
  onSendMessage: (text: string) => void,
  isLoading: boolean,
  onReset: () => void,
}> = ({ profile, messages, onSendMessage, isLoading, onReset }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.tutorView}>
       <header style={styles.header}>
            <h1 style={styles.headerTitle}><span style={styles.headerIcon}>{profile.icon}</span>{profile.name} Mode</h1>
            <button onClick={onReset} style={styles.resetButton}>Change Profile</button>
        </header>
      <div style={styles.messageList}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} profile={profile} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

const ChatMessage: React.FC<{ message: Message; profile: typeof PROFILES[ProfileKey] }> = ({ message, profile }) => {
    const handleSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(message.text);
        window.speechSynthesis.cancel(); // Stop any previous speech
        window.speechSynthesis.speak(utterance);
    };

    const formatText = (text: string) => {
        const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <div dangerouslySetInnerHTML={{ __html: boldedText.replace(/\n/g, '<br />') }} />;
    };

    const isModel = message.role === 'model';
    return (
        <div style={{ ...styles.messageBubble, ...(isModel ? styles.modelBubble : styles.userBubble) }}>
            <div style={styles.messageContent}>
                {formatText(message.text)}
            </div>
            {isModel && profile.name === 'Dyslexia' && (
                <button onClick={handleSpeak} style={styles.speakButton} aria-label="Read text aloud">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                </button>
            )}
        </div>
    );
};


const MessageInput: React.FC<{ onSendMessage: (text: string) => void, isLoading: boolean }> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.inputForm}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question or enter a topic..."
        style={styles.inputField}
        disabled={isLoading}
        aria-label="Your message"
      />
      <button type="submit" style={styles.sendButton} disabled={isLoading} aria-label="Send message">
        {isLoading ? '...' : 
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z"/></svg>}
      </button>
    </form>
  );
};

const LoadingIndicator: React.FC = () => (
    <div style={{...styles.messageBubble, ...styles.modelBubble}}>
        <div style={styles.loadingDots}>
            <span></span><span></span><span></span>
        </div>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div style={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{message}</p>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--background-color)',
  },
  title: {
    fontSize: '2rem',
    color: 'var(--on-background-color)',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--on-surface-color)',
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  profileSelector: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },
  profileCard: {
    backgroundColor: 'var(--surface-color)',
    color: 'var(--on-surface-color)',
    border: '1px solid #333',
    borderRadius: 'var(--border-radius)',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  profileIcon: {
      backgroundColor: 'var(--primary-variant-color)',
      color: 'var(--on-background-color)',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto 1rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
  },
  profileName: {
      fontSize: '1.25rem',
      color: 'var(--on-background-color)',
      marginBottom: '0.5rem',
  },
  profileDescription: {
      fontSize: '0.9rem',
      color: 'var(--on-surface-color)',
  },
  tutorView: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #333',
    marginBottom: '1rem',
  },
  headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1.25rem',
  },
  headerIcon: {
      backgroundColor: 'var(--surface-color)',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '1rem',
  },
  resetButton: {
      backgroundColor: 'transparent',
      color: 'var(--secondary-color)',
      padding: '0.5rem 1rem',
      border: '1px solid var(--secondary-color)',
      fontSize: '0.9rem',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '10px',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius)',
    marginBottom: '0.75rem',
    wordWrap: 'break-word',
    lineHeight: 1.5,
  },
  userBubble: {
    backgroundColor: 'var(--primary-color)',
    color: '#000',
    marginLeft: 'auto',
    borderBottomRightRadius: '0',
  },
  modelBubble: {
    backgroundColor: 'var(--surface-color)',
    color: 'var(--on-surface-color)',
    marginRight: 'auto',
    borderBottomLeftRadius: '0',
    position: 'relative',
  },
  messageContent: {
      
  },
  speakButton: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      background: 'rgba(0,0,0,0.3)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
  },
  inputForm: {
    display: 'flex',
    marginTop: '1rem',
    gap: '0.5rem',
  },
  inputField: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid #444',
    borderRadius: 'var(--border-radius)',
    color: 'var(--on-background-color)',
    fontSize: '1rem',
  },
  sendButton: {
    backgroundColor: 'var(--primary-color)',
    color: '#000',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDots: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '2rem',
    margin: 'auto',
    backgroundColor: 'var(--surface-color)',
    borderRadius: 'var(--border-radius)',
  }
};

// Keyframe animation for loading dots
const keyframes = `
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = keyframes;
document.head.appendChild(styleSheet);

const loadingDotStyle: React.CSSProperties = {
  width: '10px',
  height: '10px',
  backgroundColor: 'var(--on-surface-color)',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'bounce 1.4s infinite ease-in-out both',
  margin: '0 2px'
};

styles.loadingDots = {
    ...styles.loadingDots,
    ... {
        children: {
            dot1: {...loadingDotStyle, animationDelay: '-0.32s'},
            dot2: {...loadingDotStyle, animationDelay: '-0.16s'},
            dot3: {...loadingDotStyle}
        }
    }
}
const loadingDotsStyle = `
.loading-dots span {
  width: 10px;
  height: 10px;
  background-color: var(--on-surface-color);
  border-radius: 50%;
  display: inline-block;
  margin: 0 3px;
  animation: bounce 1.4s infinite ease-in-out both;
}
.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
`;

const dynamicStyles = document.createElement('style');
dynamicStyles.innerHTML = keyframes + loadingDotsStyle;
document.head.appendChild(dynamicStyles);


const root = createRoot(document.getElementById('root')!);
root.render(<App />);
