import { decode } from './audio';

export const downloadTextFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


// Function to create a downloadable WAV file from raw PCM data (base64)
export const downloadWavFile = (base64Pcm: string, filename: string) => {
    const pcmData = decode(base64Pcm);
    const header = createWavHeader(pcmData.length);
    const blob = new Blob([header, pcmData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Downloads narration audio regardless of source format.
 * Accepts either a `data:audio/<fmt>;base64,...` URI (ElevenLabs MP3) or
 * raw PCM base64 (Gemini TTS, saved as WAV).
 */
export const downloadAudio = (audioData: string, filename: string) => {
    if (audioData.startsWith('data:audio')) {
        const ext = audioData.startsWith('data:audio/mpeg') ? 'mp3' : (audioData.split(';')[0].split('/')[1] || 'mp3');
        const a = document.createElement('a');
        a.href = audioData;
        a.download = filename.replace(/\.(wav|mp3)$/i, '') + '.' + ext;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
    }
    // Raw PCM base64 → wrap as WAV
    downloadWavFile(audioData, filename.replace(/\.(wav|mp3)$/i, '') + '.wav');
};

// Creates a 44-byte WAV header
function createWavHeader(dataSize: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // RIFF chunk size
    view.setUint32(4, 36 + dataSize, true);
    // WAVE identifier
    writeString(view, 8, 'WAVE');
    // "fmt " sub-chunk identifier
    writeString(view, 12, 'fmt ');
    // "fmt " chunk size
    view.setUint32(16, 16, true);
    // Audio format (1 for PCM)
    view.setUint16(20, 1, true);
    // Number of channels
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate
    view.setUint32(28, byteRate, true);
    // Block align
    view.setUint16(32, blockAlign, true);
    // Bits per sample
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk identifier
    writeString(view, 36, 'data');
    // "data" chunk size
    view.setUint32(40, dataSize, true);

    return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
