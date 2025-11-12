
import { useState, useRef, useCallback } from 'react';

type RecorderState = 'idle' | 'permission' | 'recording' | 'stopped';
type AudioResult = {
    audioBlob: Blob | null;
    audioUrl: string | null;
}

export const useAudioRecorder = () => {
    const [recorderState, setRecorderState] = useState<RecorderState>('idle');
    const [audioResult, setAudioResult] = useState<AudioResult>({ audioBlob: null, audioUrl: null });
    const [error, setError] = useState<string | null>(null);
    
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const getMicrophonePermission = useCallback(async () => {
        setRecorderState('permission');
        setError(null);
        if ("MediaRecorder" in window) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                return stream;
            } catch (err: any) {
                setError(err.message);
                setRecorderState('idle');
                return null;
            }
        } else {
            setError("The MediaRecorder API is not supported in your browser.");
            setRecorderState('idle');
            return null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        const stream = await getMicrophonePermission();
        if (!stream) return;

        setRecorderState('recording');
        
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        audioChunks.current = [];
        
        recorder.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };
        
        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioResult({ audioBlob, audioUrl });
            setRecorderState('stopped');
            // Stop all tracks to turn off the microphone indicator
            stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
    }, [getMicrophonePermission]);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
        }
    }, []);

    const resetRecording = useCallback(() => {
        setRecorderState('idle');
        setAudioResult({ audioBlob: null, audioUrl: null });
        setError(null);
        audioChunks.current = [];
    }, []);

    return {
        recorderState,
        audioResult,
        error,
        startRecording,
        stopRecording,
        resetRecording
    };
};
