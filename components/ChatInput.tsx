import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, GlobeIcon, ExpandIcon, SettingsIcon, ArrowUpIcon, XCircleIcon, MicrophoneIcon, StopCircleIcon, DocumentTextIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onTypingStart, onTypingStop }) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      if (scrollHeight > 192) {
          textareaRef.current.style.height = '192px';
      } else {
          textareaRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input, filePreview]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    if (input) {
        onTypingStart();
        typingTimeoutRef.current = setTimeout(() => {
            onTypingStop();
        }, 1500); // 1.5 seconds delay
    } else {
        onTypingStop();
    }

    return () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };
  }, [input, onTypingStart, onTypingStop]);

  const handleStartRecording = async () => {
    if (file) {
      alert("Please remove the current attachment before recording audio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        setFile(audioFile);
        setFilePreview(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access your microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordButtonClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
        handleStopRecording();
    }
    if ((input.trim() || file) && !isLoading) {
      onSendMessage(input, file || undefined);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTypingStop();
      setInput('');
      setFile(null);
      setFilePreview(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRecording) {
        alert("Please stop recording before attaching a file.");
        return;
    }
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('audio/')) {
            setFilePreview(URL.createObjectURL(selectedFile));
        } else {
            setFilePreview('generic'); // Indicate a generic file preview
        }
    }
  };

  const handleRemoveFile = () => {
    if (isRecording) {
        handleStopRecording();
    }
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-background-panel p-1 rounded-2xl border border-border-color/50">
        <form
        onSubmit={handleSubmit}
        className="relative"
        >
        {filePreview && (
            <div className="p-2">
                <div className="relative inline-block">
                    {file && file.type.startsWith('image/') ? (
                        <img src={filePreview} alt="preview" className="max-h-24 rounded-lg"/>
                    ) : file && file.type.startsWith('audio/') ? (
                        <audio src={filePreview} controls className="max-w-xs" />
                    ) : file ? (
                        <div className="flex items-center gap-2 p-2 bg-input-field rounded-lg border border-border-color">
                            <DocumentTextIcon className="w-6 h-6 text-text-secondary" />
                            <span className="text-sm text-text-primary truncate">{file.name}</span>
                        </div>
                    ) : null}
                    <button 
                        type="button" 
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-background-main rounded-full text-text-secondary hover:text-text-primary"
                        aria-label="Remove attachment"
                    >
                        <XCircleIcon className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        )}
        <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={file ? "Add a comment..." : "Type your message..."}
            rows={1}
            className="w-full bg-transparent text-text-primary resize-none focus:outline-none placeholder:text-text-secondary/80 text-base p-4 no-scrollbar"
            disabled={isLoading}
        />
        <div className="flex justify-between items-center p-2 pt-0">
            <div className="flex items-center gap-3">
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isRecording}
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-text-secondary hover:text-text-primary transition-colors" 
                    aria-label="Add file"
                    disabled={isRecording}
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={handleRecordButtonClick}
                    className={`text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 ${isRecording ? 'text-status-red' : ''}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    disabled={!!file && !isRecording}
                >
                    {isRecording ? <StopCircleIcon className="w-5 h-5 animate-pulse" /> : <MicrophoneIcon className="w-5 h-5" />}
                </button>
                <button type="button" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Search web">
                    <GlobeIcon className="w-5 h-5" />
                </button>
                <button type="button" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Expand">
                    <ExpandIcon className="w-5 h-5" />
                </button>
                <button type="button" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Settings">
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>
            <button
                type="submit"
                disabled={isLoading || (!input.trim() && !file)}
                className="w-8 h-8 flex items-center justify-center bg-accent text-white rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-panel focus:ring-accent transition-all duration-200 shrink-0"
                aria-label="Send message"
            >
                {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                <ArrowUpIcon className="w-5 h-5" />
                )}
            </button>
        </div>
        </form>
    </div>
  );
};

export default ChatInput;