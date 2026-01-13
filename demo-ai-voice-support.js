/**
 * AI Voice Support - Gemini Multimodal Live API Integration (DEMO VERSION)
 * 
 * Uses Google's native audio streaming for natural voice conversations.
 * Features the Zephyr voice for high-quality speech synthesis.
 * 
 * INSTALLATION:
 * 1. Copy this file to: public/assets/front/js/ai-voice-support.js
 * 2. Include the @google/genai SDK (loaded dynamically)
 * 3. Add the modal HTML and CSS
 * 4. Call openAIVoiceSupport() to start
 * 
 * @version 2.0.0
 * @requires @google/genai SDK
 */

const AIVoiceSupport = {
    // ========================================
    // CONFIGURATION
    // ========================================
    config: {
        // Get the config endpoint URL
        getConfigEndpoint() {
            // Adjust this based on your setup
            const base = document.querySelector('base')?.href;
            if (base) {
                return base.replace(/\/$/, '') + '/api/ai-voice-support/config';
            }
            // Fallback - adjust for your domain
            return window.location.origin + '/api/ai-voice-support/config';
        },
        voiceName: 'Zephyr',
        model: 'gemini-2.5-flash-native-audio-preview-12-2025'
    },

    // ========================================
    // STATE
    // ========================================
    state: {
        session: null,
        stream: null,
        audioContext: null,
        inputAudioContext: null,
        outputNode: null,
        processorNode: null,
        sourceNodes: new Set(),
        nextStartTime: 0,
        isConnected: false,
        isConnecting: false,
        isSpeaking: false,
        apiKey: null
    },

    // ========================================
    // DOM ELEMENTS
    // ========================================
    elements: {
        modal: null,
        closeBtn: null,
        status: null,
        canvas: null,
        endCallBtn: null,
        retryBtn: null
    },

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        this.cacheElements();
        this.bindEvents();
        console.log('AI Voice Support initialized - Gemini Live API Mode');
    },

    cacheElements() {
        this.elements.modal = document.getElementById('aiVoiceSupportModal');
        this.elements.closeBtn = document.getElementById('aiVoiceCloseBtn');
        this.elements.status = document.getElementById('aiVoiceStatus');
        this.elements.canvas = document.getElementById('aiVoiceCanvas');
        this.elements.endCallBtn = document.getElementById('aiVoiceEndCall');
        this.elements.retryBtn = document.getElementById('aiVoiceRetry');
    },

    bindEvents() {
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.elements.endCallBtn) {
            this.elements.endCallBtn.addEventListener('click', () => this.endSession());
        }
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => this.startSession());
        }
    },

    // ========================================
    // MODAL MANAGEMENT
    // ========================================
    openModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.startSession();
        }
    },

    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');
            document.body.style.overflow = '';
            this.endSession();
        }
    },

    // ========================================
    // SESSION MANAGEMENT
    // ========================================
    async startSession() {
        if (this.state.isConnecting) return;

        try {
            this.state.isConnecting = true;
            this.updateStatus('connecting', 'Establishing secure connection...');

            // Get API config from backend
            const config = await this.getConfig();
            this.state.apiKey = config.apiKey;

            // Load the Google GenAI SDK dynamically if not already loaded
            if (typeof GoogleGenAI === 'undefined') {
                await this.loadGenAISDK();
            }

            // Create audio contexts
            this.state.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            // Resume audio contexts
            await this.state.inputAudioContext.resume();
            await this.state.audioContext.resume();

            // Setup audio visualizer
            this.setupVisualizer();

            // Get microphone access
            this.state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Build system instruction from knowledge base
            const kb = window.AI_KNOWLEDGE_BASE || {};
            let systemInstruction = config.systemInstruction || '';

            if (kb.documentContent) {
                systemInstruction += '\n\nCOMPANY KNOWLEDGE BASE:\n' + kb.documentContent;
            }

            // Initialize Gemini Live connection
            const ai = new GoogleGenAI({ apiKey: config.apiKey });

            const sessionPromise = ai.live.connect({
                model: config.model || this.config.model,
                config: {
                    responseModalities: ['AUDIO'],
                    systemInstruction: systemInstruction,
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: config.voiceName || this.config.voiceName
                            }
                        }
                    }
                },
                callbacks: {
                    onopen: () => {
                        this.state.isConnected = true;
                        this.state.isConnecting = false;
                        this.updateStatus('connected', 'Connected! Listening...');
                        this.startAudioCapture();
                    },
                    onmessage: async (message) => {
                        await this.handleAudioMessage(message);
                    },
                    onclose: () => {
                        this.state.isConnected = false;
                        this.updateStatus('idle', 'Connection closed');
                    },
                    onerror: (error) => {
                        console.error('Session error:', error);
                        this.state.isConnecting = false;
                        this.updateStatus('error', 'Connection error. Please try again.');
                    }
                }
            });

            this.state.session = await sessionPromise;
            this.drawVisualizer();

        } catch (error) {
            console.error('Session start error:', error);
            this.state.isConnecting = false;
            this.updateStatus('error', error.message || 'Failed to connect. Please try again.');
        }
    },

    async endSession() {
        try {
            // Stop audio capture
            if (this.state.stream) {
                this.state.stream.getTracks().forEach(track => track.stop());
                this.state.stream = null;
            }

            // Disconnect session
            if (this.state.session) {
                this.state.session.disconnect();
                this.state.session = null;
            }

            // Stop all audio playback
            this.state.sourceNodes.forEach(node => {
                try { node.stop(); } catch (e) { }
            });
            this.state.sourceNodes.clear();

            // Close audio contexts
            if (this.state.inputAudioContext) {
                this.state.inputAudioContext.close();
                this.state.inputAudioContext = null;
            }
            if (this.state.audioContext) {
                this.state.audioContext.close();
                this.state.audioContext = null;
            }

            this.state.isConnected = false;
            this.state.isConnecting = false;
            this.state.isSpeaking = false;
            this.state.nextStartTime = 0;

            this.updateStatus('idle', 'Session ended');

        } catch (error) {
            console.error('Error ending session:', error);
        }
    },

    // ========================================
    // CONFIG FETCHING
    // ========================================
    async getConfig() {
        try {
            const response = await fetch(this.config.getConfigEndpoint(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get configuration');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Configuration error');
            }

            return data;
        } catch (error) {
            console.error('Config error:', error);
            throw error;
        }
    },

    // ========================================
    // SDK LOADING
    // ========================================
    async loadGenAISDK() {
        return new Promise((resolve, reject) => {
            if (typeof GoogleGenAI !== 'undefined') {
                resolve();
                return;
            }

            // Create a module script to load the SDK
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import { GoogleGenAI } from 'https://esm.run/@google/genai';
                window.GoogleGenAI = GoogleGenAI;
                window.dispatchEvent(new Event('genai-loaded'));
            `;

            // Listen for SDK load event
            const loadHandler = () => {
                window.removeEventListener('genai-loaded', loadHandler);
                console.log('GenAI SDK loaded');
                resolve();
            };
            window.addEventListener('genai-loaded', loadHandler);

            script.onerror = () => reject(new Error('Failed to load GenAI SDK'));

            document.head.appendChild(script);

            // Fallback timeout check
            setTimeout(() => {
                if (typeof GoogleGenAI !== 'undefined') {
                    resolve();
                }
            }, 3000);
        });
    },

    // ========================================
    // AUDIO CAPTURE
    // ========================================
    startAudioCapture() {
        if (!this.state.stream || !this.state.inputAudioContext) return;

        const source = this.state.inputAudioContext.createMediaStreamSource(this.state.stream);
        this.state.processorNode = this.state.inputAudioContext.createScriptProcessor(4096, 1, 1);

        // Store the actual sample rate from the input audio context
        const actualSampleRate = this.state.inputAudioContext.sampleRate;
        console.log('Audio capture started, sample rate:', actualSampleRate);

        // Reference to this for use in callback
        const self = this;

        this.state.processorNode.onaudioprocess = (event) => {
            // Check connection state and get session directly from state
            if (!self.state.isConnected || self.state.isSpeaking) return;

            const session = self.state.session;
            if (!session) {
                // Session not yet assigned, skip this chunk
                return;
            }

            const inputData = event.inputBuffer.getChannelData(0);
            const pcmData = self.floatTo16BitPCM(inputData);
            const base64Data = self.arrayBufferToBase64(pcmData.buffer);

            try {
                // Use sendRealtimeInput with media object (correct API format)
                if (typeof session.sendRealtimeInput === 'function') {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: `audio/pcm;rate=${actualSampleRate}`,
                            data: base64Data
                        }
                    });
                } else if (typeof session.send === 'function') {
                    // Fallback for older SDK versions
                    session.send({
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: `audio/pcm;rate=${actualSampleRate}`,
                                data: base64Data
                            }]
                        }
                    });
                }
            } catch (error) {
                console.error('Error sending audio:', error);
            }
        };

        source.connect(this.state.processorNode);
        this.state.processorNode.connect(this.state.inputAudioContext.destination);
    },

    // ========================================
    // AUDIO MESSAGE HANDLING
    // ========================================
    async handleAudioMessage(message) {
        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            this.state.isSpeaking = true;
            this.updateStatus('speaking', 'AI is speaking...');

            try {
                const audioBuffer = await this.decodeAudioData(
                    this.base64ToBytes(base64Audio),
                    this.state.audioContext,
                    24000,
                    1
                );

                // Schedule playback
                this.state.nextStartTime = Math.max(this.state.nextStartTime, this.state.audioContext.currentTime);

                const source = this.state.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.state.outputNode);

                source.onended = () => {
                    this.state.sourceNodes.delete(source);
                    if (this.state.sourceNodes.size === 0) {
                        this.state.isSpeaking = false;
                        this.updateStatus('connected', 'Listening...');
                    }
                };

                source.start(this.state.nextStartTime);
                this.state.nextStartTime += audioBuffer.duration;
                this.state.sourceNodes.add(source);

            } catch (e) {
                console.error('Audio decode error:', e);
            }
        }

        // Handle interruption
        if (message.serverContent?.interrupted) {
            this.state.sourceNodes.forEach(node => {
                try { node.stop(); } catch (e) { }
            });
            this.state.sourceNodes.clear();
            this.state.nextStartTime = 0;
            this.state.isSpeaking = false;
            this.updateStatus('connected', 'Listening...');
        }
    },

    // ========================================
    // AUDIO UTILITIES
    // ========================================
    floatTo16BitPCM(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    },

    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    async decodeAudioData(audioBytes, audioContext, sampleRate, channels) {
        const numSamples = audioBytes.length / 2;
        const audioBuffer = audioContext.createBuffer(channels, numSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        const dataView = new DataView(audioBytes.buffer);
        for (let i = 0; i < numSamples; i++) {
            const sample = dataView.getInt16(i * 2, true);
            channelData[i] = sample / 32768.0;
        }

        return audioBuffer;
    },

    // ========================================
    // VISUALIZER
    // ========================================
    setupVisualizer() {
        if (!this.elements.canvas || !this.state.audioContext) return;

        const analyser = this.state.audioContext.createAnalyser();
        analyser.fftSize = 256;
        this.state.analyser = analyser;

        this.state.outputNode = this.state.audioContext.createGain();
        this.state.outputNode.connect(analyser);
        analyser.connect(this.state.audioContext.destination);
    },

    drawVisualizer() {
        if (!this.elements.canvas || !this.state.analyser) return;

        const canvas = this.elements.canvas;
        const ctx = canvas.getContext('2d');
        const analyser = this.state.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.state.isConnected) return;

            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, '#f7931e');
                gradient.addColorStop(1, '#e08100');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    },

    // ========================================
    // STATUS UPDATES
    // ========================================
    updateStatus(type, message) {
        if (!this.elements.status) return;

        this.elements.status.textContent = message;
        this.elements.status.className = 'ai-voice-status ' + type;

        // Show/hide retry button
        if (this.elements.retryBtn) {
            this.elements.retryBtn.style.display = type === 'error' ? 'block' : 'none';
        }
    }
};

// ========================================
// GLOBAL FUNCTION
// ========================================
function openAIVoiceSupport() {
    AIVoiceSupport.openModal();
}

// ========================================
// AUTO-INITIALIZE
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AIVoiceSupport.init());
} else {
    AIVoiceSupport.init();
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIVoiceSupport, openAIVoiceSupport };
}
