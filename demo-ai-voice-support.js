/**
 * AI Voice Support - Gemini Multimodal Live API Integration (DEMO VERSION)
 * 
 * UPDATED: Uses the correct callbacks-based pattern for Gemini Live API
 * Uses Google's native audio streaming for natural voice conversations.
 * 
 * CRITICAL: This version uses the correct API pattern with callbacks:
 * - onopen, onmessage, onclose, onerror
 * - session.sendRealtimeInput({ media: { data, mimeType } })
 * 
 * @version 3.0.0 - Fixed WebSocket implementation
 * @requires @google/genai SDK
 */

const AIVoiceSupport = {
    // ========================================
    // CONFIGURATION
    // ========================================
    config: {
        getConfigEndpoint() {
            const path = window.location.pathname;
            const subfolderMatch = path.match(/^\/([^\/]+)\//);
            const basePath = subfolderMatch ? '/' + subfolderMatch[1] : '';
            return window.location.origin + basePath + '/api/ai-config.php';
        },
        voiceName: 'Puck',
        model: 'gemini-2.5-flash-native-audio-preview-12-2025'
    },

    // ========================================
    // STATE
    // ========================================
    isInitialized: false,
    isConnected: false,
    isSpeaking: false,
    session: null,
    inputAudioContext: null,
    outputAudioContext: null,
    mediaStream: null,
    scriptProcessor: null,
    nextStartTime: 0,
    sourceNodes: new Set(),
    analyser: null,
    outputNode: null,
    animationFrame: 0,

    // ========================================
    // DOM ELEMENTS
    // ========================================
    elements: {
        modal: null,
        statusText: null,
        statusContainer: null,
        visualizer: null,
        endBtn: null,
        retryBtn: null
    },

    // ========================================
    // INITIALIZATION
    // ========================================
    async init() {
        if (this.isInitialized) return;

        this.elements.modal = document.getElementById('ai-voice-modal');
        this.elements.statusText = document.getElementById('ai-status-text');
        this.elements.statusContainer = document.getElementById('ai-status');
        this.elements.visualizer = document.getElementById('ai-visualizer');
        this.elements.endBtn = document.getElementById('ai-end-btn');
        this.elements.retryBtn = document.getElementById('ai-retry-btn');

        // Load SDK dynamically
        try {
            const module = await import('https://esm.run/@google/genai');
            window.GoogleGenAI = module.GoogleGenAI;
            window.Modality = module.Modality;
            console.log('Gemini SDK loaded successfully');
        } catch (error) {
            console.error('Failed to load Gemini SDK:', error);
        }

        this.isInitialized = true;
        console.log('AI Voice Support initialized');
    },

    // ========================================
    // CONFIG LOADING
    // ========================================
    async loadConfig() {
        try {
            const endpoint = this.config.getConfigEndpoint();
            console.log('Loading config from:', endpoint);

            const response = await fetch(endpoint);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load configuration');
            }

            this.config.apiKey = data.apiKey;
            this.config.model = data.model || this.config.model;
            this.config.voiceName = data.voiceName || this.config.voiceName;
            this.config.systemInstruction = data.systemInstruction || '';

            console.log('Config loaded:', { model: this.config.model, voice: this.config.voiceName });
            return true;
        } catch (error) {
            console.error('Error loading config:', error);
            this.updateStatus('error', 'Configuration error');
            return false;
        }
    },

    // ========================================
    // MODAL MANAGEMENT
    // ========================================
    async openModal() {
        if (!this.isInitialized) {
            await this.init();
        }

        this.elements.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.elements.retryBtn?.classList.remove('visible');
        this.updateStatus('connecting', 'Connecting...');

        this.initVisualizer();

        const configLoaded = await this.loadConfig();
        if (configLoaded) {
            await this.startSession();
        }
    },

    closeModal() {
        this.stopSession();
        this.elements.modal.classList.remove('active');
        document.body.style.overflow = '';
    },

    // ========================================
    // SESSION MANAGEMENT - CORRECT PATTERN
    // ========================================
    stopSession() {
        if (this.session) {
            try { this.session.close(); } catch (e) { }
            this.session = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.inputAudioContext) {
            try { this.inputAudioContext.close(); } catch (e) { }
            this.inputAudioContext = null;
        }
        if (this.outputAudioContext) {
            try { this.outputAudioContext.close(); } catch (e) { }
            this.outputAudioContext = null;
        }

        this.sourceNodes.forEach(node => {
            try { node.stop(); } catch (e) { }
        });
        this.sourceNodes.clear();

        cancelAnimationFrame(this.animationFrame);

        this.isConnected = false;
        this.isSpeaking = false;
        this.nextStartTime = 0;
    },

    /**
     * Start session using CORRECT Gemini Live API pattern
     * KEY: Uses callbacks object instead of .on() methods or async iteration
     */
    async startSession() {
        try {
            if (!window.GoogleGenAI) {
                throw new Error('Gemini SDK not loaded');
            }

            if (!this.config.apiKey) {
                throw new Error('API key not configured');
            }

            // Create Gemini client
            const ai = new window.GoogleGenAI({ apiKey: this.config.apiKey });

            // Create separate audio contexts for input (16kHz) and output (24kHz)
            this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            await this.inputAudioContext.resume();
            await this.outputAudioContext.resume();

            // Set up audio output chain with analyser
            this.analyser = this.outputAudioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.outputNode = this.outputAudioContext.createGain();
            this.outputNode.connect(this.analyser);
            this.analyser.connect(this.outputAudioContext.destination);

            // Get microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const self = this;
            const inputAudioContext = this.inputAudioContext;
            const stream = this.mediaStream;

            // ========================================
            // CORRECT PATTERN: Use callbacks object
            // ========================================
            const sessionPromise = ai.live.connect({
                model: this.config.model,
                config: {
                    responseModalities: window.Modality ? [window.Modality.AUDIO] : ['AUDIO'],
                    systemInstruction: this.config.systemInstruction,
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: this.config.voiceName
                            }
                        }
                    }
                },
                // ========================================
                // CALLBACKS - The correct way to handle events
                // ========================================
                callbacks: {
                    onopen: function () {
                        console.log('Live session opened');
                        self.isConnected = true;
                        self.updateStatus('listening', 'Listening...');

                        // Set up audio input processing
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        self.scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

                        self.scriptProcessor.onaudioprocess = function (event) {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = self.createAudioBlob(inputData, inputAudioContext.sampleRate);

                            // Send audio using sendRealtimeInput with media object
                            sessionPromise.then(function (session) {
                                try {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                } catch (e) {
                                    console.error('Error sending audio input:', e);
                                }
                            }).catch(function (err) {
                                console.error('Session promise error:', err);
                            });
                        };

                        source.connect(self.scriptProcessor);
                        self.scriptProcessor.connect(inputAudioContext.destination);
                    },

                    onmessage: async function (message) {
                        // Handle audio response
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            self.isSpeaking = true;
                            self.updateStatus('speaking', 'Speaking...');

                            const audioCtx = self.outputAudioContext;
                            if (audioCtx) {
                                self.nextStartTime = Math.max(self.nextStartTime, audioCtx.currentTime);

                                try {
                                    const audioBuffer = await self.decodeAudioData(
                                        self.base64ToBytes(base64Audio),
                                        audioCtx,
                                        24000,
                                        1
                                    );

                                    const source = audioCtx.createBufferSource();
                                    source.buffer = audioBuffer;
                                    source.connect(self.outputNode);

                                    source.onended = function () {
                                        self.sourceNodes.delete(source);
                                        if (self.sourceNodes.size === 0) {
                                            self.isSpeaking = false;
                                            if (self.isConnected) {
                                                self.updateStatus('listening', 'Listening...');
                                            }
                                        }
                                    };

                                    source.start(self.nextStartTime);
                                    self.nextStartTime += audioBuffer.duration;
                                    self.sourceNodes.add(source);
                                } catch (e) {
                                    console.error('Audio decode error:', e);
                                }
                            }
                        }

                        // Handle interruption
                        if (message.serverContent?.interrupted) {
                            self.sourceNodes.forEach(function (node) {
                                try { node.stop(); } catch (e) { }
                            });
                            self.sourceNodes.clear();
                            self.nextStartTime = 0;
                            self.isSpeaking = false;
                            self.updateStatus('listening', 'Listening...');
                        }
                    },

                    onclose: function () {
                        console.log('Session closed');
                        self.isConnected = false;
                        self.updateStatus('', 'Disconnected');
                    },

                    onerror: function (err) {
                        console.error('Session error:', err);
                        self.updateStatus('error', 'Connection error');
                        self.elements.retryBtn?.classList.add('visible');
                    }
                }
            });

            this.session = await sessionPromise;
            this.drawVisualizer();

        } catch (error) {
            console.error('Failed to start session:', error);
            this.updateStatus('error', error.message || 'Connection failed');
            this.elements.retryBtn?.classList.add('visible');
        }
    },

    // ========================================
    // AUDIO UTILITIES
    // ========================================
    createAudioBlob(data, sampleRate) {
        const length = data.length;
        const int16 = new Int16Array(length);
        for (let i = 0; i < length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
        }
        return {
            data: this.bytesToBase64(new Uint8Array(int16.buffer)),
            mimeType: `audio/pcm;rate=${sampleRate}`
        };
    },

    bytesToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToBytes(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    },

    async decodeAudioData(data, ctx, sampleRate, numChannels) {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    },

    // ========================================
    // VISUALIZER
    // ========================================
    initVisualizer() {
        const canvas = this.elements.visualizer;
        if (!canvas) return;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    drawVisualizer() {
        const self = this;
        const canvas = this.elements.visualizer;
        if (!canvas || !this.analyser) return;

        const ctx = canvas.getContext('2d');
        const analyser = this.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if (!self.isConnected) return;
            self.animationFrame = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barColor = self.isSpeaking ? '#8b5cf6' : '#475569';
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                ctx.fillStyle = barColor;
                const y = (canvas.height - barHeight) / 2;

                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, y, barWidth, barHeight, 4);
                } else {
                    ctx.rect(x, y, barWidth, barHeight);
                }
                ctx.fill();

                x += barWidth + 1;
            }
        }
        draw();
    },

    // ========================================
    // STATUS UPDATES
    // ========================================
    updateStatus(state, text) {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }
        if (this.elements.statusContainer) {
            this.elements.statusContainer.className = 'ai-status ' + state;
        }
    },

    // ========================================
    // RETRY
    // ========================================
    async retry() {
        this.elements.retryBtn?.classList.remove('visible');
        this.stopSession();
        this.updateStatus('connecting', 'Reconnecting...');

        const configLoaded = await this.loadConfig();
        if (configLoaded) {
            await this.startSession();
        }
    }
};

// ========================================
// GLOBAL FUNCTIONS
// ========================================
function openAIVoiceSupport() {
    AIVoiceSupport.openModal();
}

function closeAIVoiceSupport() {
    AIVoiceSupport.closeModal();
}

function retryAIVoiceSupport() {
    AIVoiceSupport.retry();
}

// ========================================
// AUTO-INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    AIVoiceSupport.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIVoiceSupport;
}
