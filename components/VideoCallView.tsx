import React, { useEffect, useRef, useState } from 'react';
import { PhoneIcon, MicrophoneIcon, MicrophoneSlashIcon, VideoCameraIcon, VideoCameraSlashIcon, UserIcon } from './icons';

interface VideoCallViewProps {
    onEndCall: () => void;
    contact: { name: string; avatar: string; };
    callType: 'audio' | 'video';
}

const VideoCallView: React.FC<VideoCallViewProps> = ({ onEndCall, contact, callType }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');

    useEffect(() => {
        let currentStream: MediaStream;

        const startMedia = async () => {
            try {
                const constraints = { 
                    video: callType === 'video',
                    audio: true 
                };
                
                currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(currentStream);
                if (localVideoRef.current && callType === 'video') {
                    localVideoRef.current.srcObject = currentStream;
                }
            } catch (err) {
                console.error("Error accessing media devices:", err);
                alert("Could not access your microphone/webcam. Please check permissions and try again.");
                onEndCall();
            }
        };

        startMedia();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onEndCall, callType]);

    const handleEndCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        onEndCall();
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (stream && callType === 'video') {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(prev => !prev);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                
                {/* Background & Contact Info */}
                <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover blur-md scale-110" />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <img src={contact.avatar} alt={contact.name} className="w-32 h-32 rounded-full mb-4 border-4 border-white/50 shadow-lg" />
                        <p className="text-3xl font-bold">
                           {callType === 'audio' ? 'Audio call with' : 'Video call with'} {contact.name}
                        </p>
                        <p className="text-text-secondary mt-2">Connecting...</p>
                    </div>
                </div>

                {/* Local Video Preview */}
                {callType === 'video' && (
                    <div className="absolute bottom-28 md:bottom-6 right-6 w-48 h-36 bg-black rounded-lg shadow-2xl border-2 border-border-color object-cover flex items-center justify-center">
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className={`w-full h-full rounded-md object-cover ${isVideoEnabled ? 'block' : 'hidden'}`}
                        ></video>
                        {!isVideoEnabled && (
                            <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-md">
                                <UserIcon className="w-20 h-20 text-white/50" />
                            </div>
                        )}
                    </div>
                )}


                {/* Controls */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                            isMuted ? 'bg-white/20 hover:bg-white/30' : 'bg-background-panel/50 hover:bg-background-panel/70'
                        }`}
                        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                        {isMuted ? <MicrophoneSlashIcon className="w-7 h-7" /> : <MicrophoneIcon className="w-7 h-7" />}
                    </button>
                    
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                                !isVideoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-background-panel/50 hover:bg-background-panel/70'
                            }`}
                            aria-label={isVideoEnabled ? 'Disable video' : 'Enable video'}
                        >
                            {isVideoEnabled ? <VideoCameraIcon className="w-7 h-7" /> : <VideoCameraSlashIcon className="w-7 h-7" />}
                        </button>
                    )}

                    <button
                        onClick={handleEndCall}
                        className="w-16 h-16 bg-status-red rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors"
                        aria-label="End call"
                    >
                        <PhoneIcon className="w-8 h-8 transform -rotate-135" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallView;
