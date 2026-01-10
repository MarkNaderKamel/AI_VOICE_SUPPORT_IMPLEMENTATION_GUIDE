# AI Voice Support Implementation Guide

## Complete Step-by-Step Tutorial for Laravel/PHP Websites

This guide provides detailed instructions to implement an AI-powered voice support feature using Google Gemini API, Web Speech API, and Laravel. The implementation includes secure API key handling, multilingual support, and a custom knowledge base.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Step 1: Create the Knowledge Base](#step-1-create-the-knowledge-base-javascript)
4. [Step 2: Create the AI Voice Support JavaScript Module](#step-2-create-the-ai-voice-support-javascript-module)
5. [Step 3: Create the CSS Styles](#step-3-create-the-css-styles)
6. [Step 4: Create the Modal Blade Component](#step-4-create-the-modal-blade-component)
7. [Step 5: Create the Backend Controller](#step-5-create-the-backend-controller-secure-api-proxy)
8. [Step 6: Add the Route](#step-6-add-the-route)
9. [Step 7: Configure Environment Variables](#step-7-configure-environment-variables)
10. [Step 8: Include Assets in Layout](#step-8-include-assets-in-layout)
11. [Step 9: Add Trigger Buttons](#step-9-add-trigger-buttons)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- **PHP 7.4+** with cURL extension enabled
- **Laravel 6+** framework
- **Google Gemini API Key** (get one at https://aistudio.google.com/apikey)
- **Modern browser** supporting Web Speech API (Chrome, Edge, Safari)
- **HTTPS** (recommended for production, required for microphone access)

---

## 2. Project Structure

After implementation, your project will have these new files:

```
your-laravel-project/
├── .env                                          # Add GEMINI_API_KEY here
├── app/Http/Controllers/Front/
│   └── AiVoiceSupportController.php              # Backend API proxy
├── routes/
│   └── web.php                                   # Add API route
├── resources/views/front/partials/
│   └── ai-voice-support.blade.php                # Modal component
└── public/assets/front/
    ├── css/
    │   └── ai-voice-support.css                  # Styles
    └── js/
        ├── ai-knowledge-base.js                  # Knowledge base data
        └── ai-voice-support.js                   # Main JavaScript module
```

---

## Step 1: Create the Knowledge Base (JavaScript)

Create file: `public/assets/front/js/ai-knowledge-base.js`

This file contains all the information the AI will use to answer questions. **Customize this with your company's data.**

```javascript
/**
 * AI Voice Support - Knowledge Base
 * Contains company information, services, and FAQ data for the AI agent
 * 
 * IMPORTANT: The AI will ONLY answer from this data.
 * Customize all content below with your company information.
 */

const AI_KNOWLEDGE_BASE = {
    // Full document content - paste your company's detailed information here
    // This is the primary source of information for the AI
    documentContent: `
        [PASTE YOUR COMPANY'S FULL DOCUMENTATION HERE]
        
        Include:
        - Company history and overview
        - Detailed service descriptions
        - Team members and their roles
        - Contact information
        - Pricing information
        - Frequently asked questions
        - Any other relevant information
        
        The more detailed this is, the better the AI can answer questions.
    `,

    // Company Information - Basic details
    company: {
        name: "Your Company Name",
        nameArabic: "اسم شركتك", // Arabic name if applicable
        tagline: "Your Company Tagline",
        description: "A detailed description of what your company does and offers.",
        website: "https://yourwebsite.com",
        contactPage: "https://yourwebsite.com/contact",
        email: "info@yourcompany.com",
        phone: "+1234567890",
        location: "Your Location"
    },

    // Services offered - Add all your services
    services: [
        {
            name: "Service 1",
            description: "Detailed description of service 1. Include what it involves, who it's for, and any key features.",
            pricing: "Contact us for pricing" // or specific pricing
        },
        {
            name: "Service 2",
            description: "Detailed description of service 2.",
            pricing: "Starting at $XXX"
        },
        {
            name: "Service 3",
            description: "Detailed description of service 3.",
            pricing: "Custom quotes available"
        }
        // Add more services as needed
    ],

    // Frequently Asked Questions
    faq: [
        {
            question: "What services do you offer?",
            answer: "We offer [list your main services]. Each service is designed to [explain benefits]."
        },
        {
            question: "How can I contact you?",
            answer: "You can reach us at [email] or [phone]. Our office hours are [hours]."
        },
        {
            question: "What are your prices?",
            answer: "Our pricing varies based on the specific service and requirements. Please contact us for a custom quote."
        }
        // Add more FAQs as needed
    ],

    // Multilingual greetings - Customize for your supported languages
    greetings: {
        en: "Hello! Welcome to [Your Company]. I'm your AI assistant. How can I help you today?",
        ar: "مرحباً! أهلاً بك في [شركتك]. أنا مساعدك الآلي. كيف يمكنني مساعدتك اليوم؟",
        fr: "Bonjour! Bienvenue chez [Votre Entreprise]. Je suis votre assistant IA. Comment puis-je vous aider?",
        es: "¡Hola! Bienvenido a [Su Empresa]. Soy tu asistente de IA. ¿Cómo puedo ayudarte?",
        de: "Hallo! Willkommen bei [Ihr Unternehmen]. Ich bin Ihr KI-Assistent. Wie kann ich Ihnen helfen?",
        default: "Hello! How can I help you?"
    },

    // Fallback messages when AI doesn't have an answer
    fallbackMessages: {
        en: "I don't have specific information about that. Please contact our team at [your contact page] for detailed assistance.",
        ar: "ليس لدي معلومات محددة حول ذلك. يرجى التواصل مع فريقنا للمساعدة.",
        fr: "Je n'ai pas d'informations spécifiques à ce sujet. Veuillez contacter notre équipe.",
        es: "No tengo información específica sobre eso. Por favor contacte a nuestro equipo.",
        de: "Ich habe keine spezifischen Informationen dazu. Bitte kontaktieren Sie unser Team.",
        default: "Please contact us for assistance."
    },

    // System prompt - Controls AI behavior (IMPORTANT: Customize carefully)
    systemPrompt: `You are a helpful AI voice assistant for [Your Company Name]. You MUST follow these rules strictly:

CRITICAL RULES:
1. You can ONLY answer questions using the information provided in the context below (documentContent and company info). Do NOT use any external knowledge.
2. If a question cannot be answered from the provided information, tell the user: "I don't have that specific information. Please contact our team at [your contact page] for assistance."
3. NEVER make up or invent information that is not in the provided context.
4. If asked about topics outside of [Your Company], politely explain that you can only help with [Your Company] services.

RESPONSE GUIDELINES:
1. Respond in the SAME LANGUAGE as the user's question.
2. Provide detailed and comprehensive answers using ALL relevant information from the context.
3. Be friendly, professional, and helpful.
4. Structure responses clearly.
5. Always include contact page URL when you cannot answer.
6. Keep responses suitable for voice output but include all important details.

LANGUAGE SUPPORT:
- Support ALL languages. Detect the language and respond in the same language.
- For Arabic, use formal Modern Standard Arabic.

Remember: Only provide information from the context. Never fabricate details.`
};

// Export for use in AI Voice Support module
if (typeof window !== 'undefined') {
    window.AI_KNOWLEDGE_BASE = AI_KNOWLEDGE_BASE;
}
```

---

## Step 2: Create the AI Voice Support JavaScript Module

Create file: `public/assets/front/js/ai-voice-support.js`

This is the main JavaScript module that handles voice recognition, API calls, and speech synthesis.

```javascript
/**
 * AI Voice Support - Main Module
 * Integrates Web Speech API with Google Gemini for voice-based AI assistance
 * Supports multiple languages with automatic language detection
 */

const AIVoiceSupport = {
    // Configuration - API key is now securely stored on server
    config: {
        // Dynamic base URL from document base or default
        getApiEndpoint() {
            const base = document.querySelector('base')?.href || '';
            const baseUrl = base.replace(/\/$/, '') || window.location.origin;
            return baseUrl + '/api/ai-voice-support';
        },
        contactPageUrl: 'https://yourwebsite.com/contact', // Update this
        defaultLanguage: 'en-US',
        voiceRate: 1.0,
        voicePitch: 1.0,
        // Supported languages for speech recognition
        supportedLanguages: {
            'en': 'en-US',
            'ar': 'ar-SA',
            'fr': 'fr-FR',
            'es': 'es-ES',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'tr': 'tr-TR',
            'hi': 'hi-IN',
            'ur': 'ur-PK'
        }
    },

    // State
    state: {
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        recognition: null,
        synthesis: null,
        conversationHistory: [],
        currentLanguage: 'en-US',
        detectedLanguage: 'en'
    },

    // DOM Elements
    elements: {
        modal: null,
        micButton: null,
        statusText: null,
        transcript: null,
        responseText: null,
        waveContainer: null,
        closeButton: null,
        languageSelect: null
    },

    /**
     * Initialize the AI Voice Support system
     */
    init() {
        this.cacheElements();
        this.detectBrowserLanguage();
        this.initSpeechRecognition();
        this.initSpeechSynthesis();
        this.bindEvents();
        console.log('AI Voice Support initialized - Multilingual support enabled');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.modal = document.getElementById('aiVoiceSupportModal');
        this.elements.micButton = document.getElementById('aiVoiceMicButton');
        this.elements.statusText = document.getElementById('aiVoiceStatus');
        this.elements.transcript = document.getElementById('aiVoiceTranscript');
        this.elements.responseText = document.getElementById('aiVoiceResponse');
        this.elements.waveContainer = document.getElementById('aiVoiceWave');
        this.elements.closeButton = document.getElementById('aiVoiceCloseBtn');
        this.elements.languageSelect = document.getElementById('aiVoiceLanguage');
    },

    /**
     * Detect browser language for initial setting
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];

        if (this.config.supportedLanguages[langCode]) {
            this.state.currentLanguage = this.config.supportedLanguages[langCode];
            this.state.detectedLanguage = langCode;
        }

        console.log('Detected browser language:', this.state.currentLanguage);
    },

    /**
     * Initialize Web Speech Recognition API with language support
     */
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        this.state.recognition = new SpeechRecognition();
        this.state.recognition.continuous = false;
        this.state.recognition.interimResults = true;
        this.state.recognition.lang = this.state.currentLanguage;

        this.state.recognition.onstart = () => {
            this.state.isListening = true;
            this.updateUI('listening');
        };

        this.state.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            this.elements.transcript.textContent = transcript;

            if (event.results[0].isFinal) {
                this.detectTextLanguage(transcript);
                this.processUserInput(transcript);
            }
        };

        this.state.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateUI('error', this.getLocalizedMessage('error', event.error));
            this.state.isListening = false;
        };

        this.state.recognition.onend = () => {
            this.state.isListening = false;
            if (!this.state.isProcessing && !this.state.isSpeaking) {
                this.updateUI('idle');
            }
        };
    },

    /**
     * Detect language from text using simple heuristics
     */
    detectTextLanguage(text) {
        // Arabic detection
        if (/[\u0600-\u06FF]/.test(text)) {
            this.state.detectedLanguage = 'ar';
            return 'ar';
        }
        // Chinese detection
        if (/[\u4e00-\u9fff]/.test(text)) {
            this.state.detectedLanguage = 'zh';
            return 'zh';
        }
        // Japanese detection
        if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
            this.state.detectedLanguage = 'ja';
            return 'ja';
        }
        // Korean detection
        if (/[\uac00-\ud7af]/.test(text)) {
            this.state.detectedLanguage = 'ko';
            return 'ko';
        }
        // Russian/Cyrillic detection
        if (/[\u0400-\u04FF]/.test(text)) {
            this.state.detectedLanguage = 'ru';
            return 'ru';
        }
        // Hindi/Devanagari detection
        if (/[\u0900-\u097F]/.test(text)) {
            this.state.detectedLanguage = 'hi';
            return 'hi';
        }
        return this.state.detectedLanguage || 'en';
    },

    /**
     * Get localized message based on current language
     */
    getLocalizedMessage(type, param = '') {
        const messages = {
            en: {
                listening: 'Listening... Speak now',
                processing: 'Processing your question...',
                speaking: 'Speaking...',
                idle: 'Tap the microphone to speak',
                error: `Error: ${param}`
            },
            ar: {
                listening: 'جارٍ الاستماع... تحدث الآن',
                processing: 'جارٍ معالجة سؤالك...',
                speaking: 'جارٍ التحدث...',
                idle: 'اضغط على الميكروفون للتحدث',
                error: `خطأ: ${param}`
            },
            fr: {
                listening: 'Écoute en cours... Parlez maintenant',
                processing: 'Traitement de votre question...',
                speaking: 'En train de parler...',
                idle: 'Appuyez sur le microphone pour parler',
                error: `Erreur: ${param}`
            },
            es: {
                listening: 'Escuchando... Habla ahora',
                processing: 'Procesando tu pregunta...',
                speaking: 'Hablando...',
                idle: 'Toca el micrófono para hablar',
                error: `Error: ${param}`
            }
        };

        const lang = this.state.detectedLanguage || 'en';
        const langMessages = messages[lang] || messages.en;
        return langMessages[type] || messages.en[type];
    },

    /**
     * Initialize Speech Synthesis API
     */
    initSpeechSynthesis() {
        this.state.synthesis = window.speechSynthesis;

        if (!this.state.synthesis) {
            console.warn('Speech Synthesis not supported in this browser');
        }
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mic button click
        if (this.elements.micButton) {
            this.elements.micButton.addEventListener('click', () => this.toggleListening());
        }

        // Close button
        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener('click', () => this.closeModal());
        }

        // Close on backdrop click
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.closeModal();
                }
            });
        }

        // Language selector change
        if (this.elements.languageSelect) {
            this.elements.languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    },

    /**
     * Change the recognition and synthesis language
     */
    changeLanguage(langCode) {
        if (this.config.supportedLanguages[langCode]) {
            this.state.currentLanguage = this.config.supportedLanguages[langCode];
            this.state.detectedLanguage = langCode;

            if (this.state.recognition) {
                this.state.recognition.lang = this.state.currentLanguage;
            }

            console.log('Language changed to:', this.state.currentLanguage);
        }
    },

    /**
     * Open the voice support modal
     */
    openModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.updateUI('idle');
            this.greetUser();
        }
    },

    /**
     * Close the voice support modal
     */
    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');
            document.body.style.overflow = '';
            this.stopListening();
            this.stopSpeaking();
        }
    },

    /**
     * Greet the user when modal opens - in their language
     */
    greetUser() {
        const kb = window.AI_KNOWLEDGE_BASE;
        const lang = this.state.detectedLanguage || 'en';

        let greeting;
        if (kb?.greetings) {
            greeting = kb.greetings[lang] || kb.greetings.default || kb.greetings.en;
        } else {
            greeting = "Hello! How can I help you today?";
        }

        setTimeout(() => {
            this.speak(greeting);
            this.elements.responseText.textContent = greeting;
        }, 500);
    },

    /**
     * Toggle listening state
     */
    toggleListening() {
        if (this.state.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },

    /**
     * Start listening for voice input
     */
    startListening() {
        if (!this.state.recognition) {
            this.updateUI('error', 'Voice recognition not supported in this browser');
            return;
        }

        this.stopSpeaking();
        this.state.recognition.lang = this.state.currentLanguage;

        try {
            this.state.recognition.start();
            this.elements.transcript.textContent = '';
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    },

    /**
     * Stop listening
     */
    stopListening() {
        if (this.state.recognition && this.state.isListening) {
            this.state.recognition.stop();
        }
    },

    /**
     * Process user input and get AI response
     */
    async processUserInput(userText) {
        if (!userText.trim()) return;

        this.state.isProcessing = true;
        this.updateUI('processing');

        try {
            const response = await this.getGeminiResponse(userText);
            this.elements.responseText.textContent = response;
            this.speak(response);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const lang = this.state.detectedLanguage || 'en';
            const kb = window.AI_KNOWLEDGE_BASE?.fallbackMessages;
            const fallback = kb?.[lang] || kb?.default ||
                "I'm having trouble processing your request. Please visit our contact page for assistance.";
            this.elements.responseText.textContent = fallback;
            this.speak(fallback);
        }

        this.state.isProcessing = false;
    },

    /**
     * Call backend API proxy for secure Gemini access
     * The API key is stored server-side in .env for security
     */
    async getGeminiResponse(userMessage) {
        const knowledgeBase = window.AI_KNOWLEDGE_BASE || {};

        // Build comprehensive context from knowledge base
        const context = this.buildContext(knowledgeBase);

        // Detect user's language
        const userLang = this.detectTextLanguage(userMessage);

        // Enhanced context with language instructions
        const enhancedContext = `${context}

IMPORTANT INSTRUCTION: The user is asking in ${userLang === 'ar' ? 'Arabic' : userLang === 'fr' ? 'French' : userLang === 'es' ? 'Spanish' : userLang === 'de' ? 'German' : 'English'}. You MUST respond in the SAME language.

Remember: 
1. ONLY use information from the context above. 
2. If the answer is not in the context, say you don't have that information and direct to the contact page.
3. Provide detailed, helpful answers with all relevant information.
4. Respond in the same language as the user's question.`;

        // Get CSRF token from meta tag (Laravel)
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Call secure backend proxy
        const response = await fetch(this.config.getApiEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken || ''
            },
            body: JSON.stringify({
                message: userMessage,
                context: enhancedContext,
                systemPrompt: knowledgeBase.systemPrompt || "You are a helpful AI assistant that only answers from provided context."
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.response) {
            return data.response;
        }

        throw new Error(data.error || 'Invalid response from AI service');
    },

    /**
     * Build comprehensive context string from knowledge base
     */
    buildContext(kb) {
        let context = `=== KNOWLEDGE BASE ===
You must ONLY use this information to answer questions. Do NOT use any external knowledge.

`;

        // Include document content if available
        if (kb.documentContent) {
            context += `== FULL DOCUMENTATION ==
${kb.documentContent}

`;
        }

        // Company Information
        if (kb.company) {
            context += `== COMPANY INFORMATION ==
Name: ${kb.company.name}
Name (Arabic): ${kb.company.nameArabic || ''}
Tagline: ${kb.company.tagline}
Website: ${kb.company.website}
Contact Page: ${kb.company.contactPage}
Email: ${kb.company.email || ''}
Location: ${kb.company.location || ''}

Description:
${kb.company.description}

`;
        }

        // All Services with Full Details
        if (kb.services && kb.services.length > 0) {
            context += `== SERVICES OFFERED ==\n`;
            kb.services.forEach((service, index) => {
                context += `
${index + 1}. ${service.name.toUpperCase()}
Description: ${service.description}
Pricing: ${service.pricing || 'Contact us for pricing'}
`;
            });
            context += "\n";
        }

        // All FAQs with Full Answers
        if (kb.faq && kb.faq.length > 0) {
            context += `== FREQUENTLY ASKED QUESTIONS ==\n`;
            kb.faq.forEach((faq, index) => {
                context += `
Q${index + 1}: ${faq.question}
A${index + 1}: ${faq.answer}
`;
            });
            context += "\n";
        }

        context += `== FALLBACK INSTRUCTION ==
If you cannot find the answer in the information above, respond with:
"I don't have specific information about that topic. For detailed assistance, please contact our team at ${kb.company?.contactPage || 'the contact page'}"

Do NOT make up information. Only use what is provided above.
=== END OF KNOWLEDGE BASE ===

`;

        return context;
    },

    /**
     * Speak text using Speech Synthesis with language support
     */
    speak(text) {
        if (!this.state.synthesis) {
            console.warn('Speech synthesis not available');
            return;
        }

        this.stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set language based on detected language
        const langCode = this.state.detectedLanguage || 'en';
        utterance.lang = this.config.supportedLanguages[langCode] || this.config.defaultLanguage;
        utterance.rate = this.config.voiceRate;
        utterance.pitch = this.config.voicePitch;

        // Try to find the best voice for the language
        const voices = this.state.synthesis.getVoices();
        const langPrefix = langCode;

        // Prefer natural/enhanced voices
        let preferredVoice = voices.find(voice =>
            voice.lang.startsWith(langPrefix) &&
            (voice.name.includes('Natural') || voice.name.includes('Enhanced') || voice.name.includes('Google'))
        );

        // Fallback to any voice matching the language
        if (!preferredVoice) {
            preferredVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
        }

        // Fallback to English if no match
        if (!preferredVoice) {
            preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            this.state.isSpeaking = true;
            this.updateUI('speaking');
        };

        utterance.onend = () => {
            this.state.isSpeaking = false;
            this.updateUI('idle');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.state.isSpeaking = false;
            this.updateUI('idle');
        };

        this.state.synthesis.speak(utterance);
    },

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (this.state.synthesis) {
            this.state.synthesis.cancel();
            this.state.isSpeaking = false;
        }
    },

    /**
     * Update UI based on state with localized messages
     */
    updateUI(state, message = '') {
        const micButton = this.elements.micButton;
        const statusText = this.elements.statusText;
        const waveContainer = this.elements.waveContainer;

        // Remove all state classes
        micButton?.classList.remove('listening', 'processing', 'speaking', 'error');
        waveContainer?.classList.remove('active');

        switch (state) {
            case 'listening':
                micButton?.classList.add('listening');
                waveContainer?.classList.add('active');
                if (statusText) statusText.textContent = this.getLocalizedMessage('listening');
                break;

            case 'processing':
                micButton?.classList.add('processing');
                if (statusText) statusText.textContent = this.getLocalizedMessage('processing');
                break;

            case 'speaking':
                micButton?.classList.add('speaking');
                waveContainer?.classList.add('active');
                if (statusText) statusText.textContent = this.getLocalizedMessage('speaking');
                break;

            case 'error':
                micButton?.classList.add('error');
                if (statusText) statusText.textContent = message || this.getLocalizedMessage('error');
                break;

            default: // idle
                if (statusText) statusText.textContent = this.getLocalizedMessage('idle');
                break;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AIVoiceSupport.init();
});

// Global function to open modal (called from buttons)
function openAIVoiceSupport() {
    AIVoiceSupport.openModal();
}
```

---

## Step 3: Create the CSS Styles

Create file: `public/assets/front/css/ai-voice-support.css`

```css
/**
 * AI Voice Support - Styles
 * Modern glassmorphism design with animated elements
 */

/* Modal Overlay */
.ai-voice-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.ai-voice-modal.active {
    opacity: 1;
    visibility: visible;
}

/* Modal Content */
.ai-voice-content {
    background: linear-gradient(135deg, rgba(30, 40, 60, 0.95), rgba(20, 30, 50, 0.98));
    border-radius: 24px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    position: relative;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
                inset 0 1px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.ai-voice-modal.active .ai-voice-content {
    transform: scale(1);
}

/* Close Button */
.ai-voice-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 28px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-voice-close:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
}

/* Header */
.ai-voice-header h3 {
    color: #fff;
    font-size: 24px;
    margin-bottom: 8px;
    font-weight: 600;
}

.ai-voice-header p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin-bottom: 30px;
}

/* Microphone Button */
.ai-voice-mic-btn {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #f7931e, #e08100);
    color: #fff;
    font-size: 48px;
    cursor: pointer;
    margin: 20px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 40px rgba(247, 147, 30, 0.4),
                inset 0 -2px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.ai-voice-mic-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
}

.ai-voice-mic-btn:hover::before {
    left: 100%;
}

.ai-voice-mic-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 50px rgba(247, 147, 30, 0.5);
}

/* Listening State */
.ai-voice-mic-btn.listening {
    animation: pulse 1.5s infinite;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    box-shadow: 0 10px 40px rgba(76, 175, 80, 0.4);
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 10px 40px rgba(76, 175, 80, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 15px 50px rgba(76, 175, 80, 0.6);
    }
}

/* Processing State */
.ai-voice-mic-btn.processing {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Speaking State */
.ai-voice-mic-btn.speaking {
    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
    animation: speak-pulse 0.5s infinite alternate;
}

@keyframes speak-pulse {
    from { transform: scale(1); }
    to { transform: scale(1.03); }
}

/* Error State */
.ai-voice-mic-btn.error {
    background: linear-gradient(135deg, #f44336, #d32f2f);
}

/* Voice Wave Animation */
.ai-voice-wave {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    margin: 20px 0;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.ai-voice-wave.active {
    opacity: 1;
}

.ai-voice-wave span {
    display: inline-block;
    width: 6px;
    height: 20px;
    margin: 0 3px;
    background: linear-gradient(180deg, #f7931e, #e08100);
    border-radius: 3px;
    animation: wave 1s ease-in-out infinite;
}

.ai-voice-wave span:nth-child(1) { animation-delay: 0s; }
.ai-voice-wave span:nth-child(2) { animation-delay: 0.1s; }
.ai-voice-wave span:nth-child(3) { animation-delay: 0.2s; }
.ai-voice-wave span:nth-child(4) { animation-delay: 0.3s; }
.ai-voice-wave span:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
    0%, 100% { height: 10px; }
    50% { height: 35px; }
}

/* Status Text */
.ai-voice-status {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    margin: 15px 0;
    min-height: 24px;
}

/* Transcript */
.ai-voice-transcript {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 15px;
    margin: 15px 0;
    min-height: 50px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-voice-transcript h4 {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Response Area */
.ai-voice-response {
    background: rgba(247, 147, 30, 0.1);
    border-radius: 12px;
    padding: 15px;
    margin: 15px 0;
    min-height: 80px;
    max-height: 200px;
    overflow-y: auto;
    color: #fff;
    font-size: 15px;
    line-height: 1.6;
    border: 1px solid rgba(247, 147, 30, 0.2);
    text-align: left;
}

.ai-voice-response h4 {
    color: #f7931e;
    font-size: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Language Selector */
.ai-voice-language-selector {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-voice-language-selector label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    display: block;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.ai-voice-language-selector select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 15px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    width: 100%;
    max-width: 200px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
}

.ai-voice-language-selector select:focus {
    outline: none;
    border-color: #f7931e;
}

.ai-voice-language-selector select option {
    background: #1e2a3c;
    color: #fff;
}

/* Floating Trigger Button (Optional) */
.ai-voice-floating-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f7931e, #e08100);
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(247, 147, 30, 0.4);
    z-index: 9999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-voice-floating-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 30px rgba(247, 147, 30, 0.5);
}

/* Responsive Styles */
@media (max-width: 576px) {
    .ai-voice-content {
        padding: 30px 20px;
        margin: 20px;
    }

    .ai-voice-mic-btn {
        width: 100px;
        height: 100px;
        font-size: 40px;
    }

    .ai-voice-header h3 {
        font-size: 20px;
    }

    .ai-voice-floating-btn {
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        font-size: 20px;
    }
}

/* RTL Support for Arabic */
[dir="rtl"] .ai-voice-response,
[lang="ar"] .ai-voice-response {
    text-align: right;
    direction: rtl;
}
```

---

## Step 4: Create the Modal Blade Component

Create file: `resources/views/front/partials/ai-voice-support.blade.php`

```blade
{{-- AI Voice Support Modal Component --}}
<div id="aiVoiceSupportModal" class="ai-voice-modal">
    <div class="ai-voice-content">
        {{-- Close Button --}}
        <button id="aiVoiceCloseBtn" class="ai-voice-close" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>

        {{-- Header --}}
        <div class="ai-voice-header">
            <h3>{{ __('AI Voice Support') }}</h3>
            <p>{{ __('Speak your question and get instant answers') }}</p>
        </div>

        {{-- Microphone Button --}}
        <button id="aiVoiceMicButton" class="ai-voice-mic-btn" aria-label="Start voice input">
            <i class="fas fa-microphone"></i>
        </button>

        {{-- Voice Wave Animation --}}
        <div id="aiVoiceWave" class="ai-voice-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>

        {{-- Status Text --}}
        <div id="aiVoiceStatus" class="ai-voice-status">
            {{ __('Tap the microphone to speak') }}
        </div>

        {{-- User Transcript --}}
        <div class="ai-voice-transcript">
            <h4>{{ __('You said:') }}</h4>
            <p id="aiVoiceTranscript">---</p>
        </div>

        {{-- AI Response --}}
        <div class="ai-voice-response">
            <h4>{{ __('AI Response:') }}</h4>
            <p id="aiVoiceResponse">{{ __('Waiting for your question...') }}</p>
        </div>

        {{-- Language Selector --}}
        <div class="ai-voice-language-selector">
            <label for="aiVoiceLanguage">{{ __('Language') }}</label>
            <select id="aiVoiceLanguage">
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="fr">Français (French)</option>
                <option value="es">Español (Spanish)</option>
                <option value="de">Deutsch (German)</option>
                <option value="it">Italiano (Italian)</option>
                <option value="pt">Português (Portuguese)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="tr">Türkçe (Turkish)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ur">اردو (Urdu)</option>
            </select>
        </div>
    </div>
</div>
```

---

## Step 5: Create the Backend Controller (Secure API Proxy)

Create file: `app/Http/Controllers/Front/AiVoiceSupportController.php`

This is the **crucial security component** that keeps your API key safe.

```php
<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * AI Voice Support Controller
 * 
 * Handles secure Gemini API calls for the AI Voice Support feature.
 * The API key is stored in .env and never exposed to the client.
 */
class AiVoiceSupportController extends Controller
{
    /**
     * Process AI voice support query
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function query(Request $request)
    {
        // Validate the request
        $request->validate([
            'message' => 'required|string|max:1000',
            'context' => 'required|string',
            'systemPrompt' => 'required|string',
        ]);

        $apiKey = env('GEMINI_API_KEY');
        
        if (!$apiKey) {
            Log::error('GEMINI_API_KEY not configured in .env');
            return response()->json([
                'success' => false,
                'error' => 'AI service not configured'
            ], 500);
        }

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={$apiKey}";
            
            $postData = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $request->context . "\n\nUser question: " . $request->message]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.3,
                    'topK' => 20,
                    'topP' => 0.8,
                    'maxOutputTokens' => 500
                ],
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $request->systemPrompt]
                    ]
                ]
            ];

            // Use cURL for better compatibility
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            // For local development - disable SSL verification
            // IMPORTANT: Enable SSL verification in production!
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                Log::error('Gemini API cURL error: ' . $curlError);
                return response()->json([
                    'success' => false,
                    'error' => 'AI service connection failed'
                ], 500);
            }

            if ($httpCode !== 200) {
                Log::error('Gemini API HTTP error: ' . $httpCode . ' - ' . $response);
                
                // Check for rate limit error
                if (strpos($response, 'RESOURCE_EXHAUSTED') !== false) {
                    return response()->json([
                        'success' => false,
                        'error' => 'AI service is temporarily busy. Please try again in a few moments.'
                    ], 429);
                }
                
                return response()->json([
                    'success' => false,
                    'error' => 'AI service temporarily unavailable'
                ], 500);
            }

            $data = json_decode($response, true);
            
            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                return response()->json([
                    'success' => true,
                    'response' => $data['candidates'][0]['content']['parts'][0]['text']
                ]);
            }
            
            Log::error('Gemini API invalid response format: ' . $response);
            return response()->json([
                'success' => false,
                'error' => 'Invalid response format from AI'
            ], 500);

        } catch (\Exception $e) {
            Log::error('AI Voice Support error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to process request'
            ], 500);
        }
    }
}
```

---

## Step 6: Add the Route

Edit file: `routes/web.php`

Add this route inside your main route group (with 'setlang' middleware or similar):

```php
// AI Voice Support API Route (secure Gemini proxy)
Route::post('/api/ai-voice-support', 'Front\AiVoiceSupportController@query')->name('front.ai.voice.query');
```

**Example placement:**

```php
Route::group(['middleware' => 'setlang'], function () {
    
    // ... your existing routes ...

    // AI Voice Support API Route (secure Gemini proxy)
    Route::post('/api/ai-voice-support', 'Front\AiVoiceSupportController@query')->name('front.ai.voice.query');

    // ... more routes ...
});
```

---

## Step 7: Configure Environment Variables

Edit file: `.env`

Add your Gemini API key at the end of the file:

```env
# AI Voice Support - Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** 
- Get your API key from https://aistudio.google.com/apikey
- Never commit the `.env` file to version control
- The `.env` file should already be in `.gitignore`

After adding the key, clear the config cache:

```bash
php artisan config:clear
php artisan cache:clear
```

---

## Step 8: Include Assets in Layout

Edit your main layout file (e.g., `resources/views/front/layout.blade.php`)

### Add CSS in the `<head>`:

```blade
<!--====== AI Voice Support CSS ======-->
<link rel="stylesheet" href="{{ asset('assets/front/css/ai-voice-support.css') }}">
```

### Add the Modal Component before `</body>`:

```blade
<!--====== AI Voice Support Modal ======-->
@include('front.partials.ai-voice-support')
```

### Add JavaScript before `</body>` (after jQuery and other scripts):

```blade
<!--====== AI Voice Support JS ======-->
<script src="{{ asset('assets/front/js/ai-knowledge-base.js') }}"></script>
<script src="{{ asset('assets/front/js/ai-voice-support.js') }}"></script>
```

### Ensure CSRF Meta Tag exists in `<head>`:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

---

## Step 9: Add Trigger Buttons

Add buttons anywhere on your site to open the AI Voice Support modal.

### Option 1: Navigation Button

```blade
<button type="button" class="main-btn" onclick="openAIVoiceSupport()">
    <i class="fas fa-microphone"></i> AI Voice Support
</button>
```

### Option 2: Floating Button (Optional)

Add this HTML before the closing `</body>` tag:

```blade
<button class="ai-voice-floating-btn" onclick="openAIVoiceSupport()" aria-label="AI Voice Support">
    <i class="fas fa-microphone"></i>
</button>
```

### Option 3: Link in Navigation Menu

```blade
<a href="javascript:void(0)" onclick="openAIVoiceSupport()">
    <i class="fas fa-microphone"></i> AI Support
</a>
```

---

## Testing

### 1. Clear All Caches

```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### 2. Test the Modal

1. Open your website in a browser
2. Click the "AI Voice Support" button
3. The modal should appear with a greeting

### 3. Test Voice Recognition

1. Click the microphone button
2. Speak a question clearly
3. Your transcript should appear
4. Wait for the AI response

### 4. Test the API Endpoint

You can test the backend directly using curl:

```bash
curl -X POST http://yoursite.com/api/ai-voice-support \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your_csrf_token" \
  -d '{"message":"What services do you offer?","context":"Test context","systemPrompt":"You are a helpful assistant."}'
```

---

## Troubleshooting

### Problem: Modal doesn't open

**Solution:** Check browser console for JavaScript errors. Ensure all JS files are loaded correctly.

### Problem: Voice recognition doesn't work

**Solutions:**
- Use HTTPS (required for microphone access in many browsers)
- Use a supported browser (Chrome, Edge, Safari)
- Allow microphone permissions when prompted

### Problem: 419 CSRF Token Error

**Solution:** Ensure the CSRF meta tag is present in your layout:
```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

### Problem: 500 Server Error

**Solutions:**
- Check Laravel logs: `storage/logs/laravel-*.log`
- Verify GEMINI_API_KEY is set in `.env`
- Run `php artisan config:clear`
- Check if cURL extension is enabled in PHP

### Problem: Rate Limit Error (429)

**Solution:** The Gemini API free tier has usage limits. Wait a minute and try again, or upgrade your API plan.

### Problem: AI gives wrong answers

**Solution:** Update the knowledge base in `ai-knowledge-base.js` with more detailed and accurate information. The AI can only answer from what you provide.

---

## Security Best Practices

1. ✅ **API key stored server-side** in `.env`
2. ✅ **CSRF protection** enabled on API route
3. ✅ **Input validation** in controller
4. ✅ **Error logging** for debugging
5. ⚠️ **Enable SSL verification** in production (remove `CURLOPT_SSL_VERIFYPEER` = false)
6. ⚠️ **Rate limiting** - Consider adding rate limiting middleware
7. ⚠️ **HTTPS** - Use HTTPS in production

---

## Customization Tips

### Change the Color Scheme

Edit `ai-voice-support.css` and change the gradient colors:
```css
/* Orange theme */
background: linear-gradient(135deg, #f7931e, #e08100);

/* Blue theme */
background: linear-gradient(135deg, #2196F3, #1976D2);

/* Purple theme */
background: linear-gradient(135deg, #9C27B0, #7B1FA2);
```

### Add More Languages

In `ai-voice-support.js`, add to `supportedLanguages`:
```javascript
supportedLanguages: {
    // ... existing languages
    'nl': 'nl-NL',  // Dutch
    'pl': 'pl-PL',  // Polish
    'sv': 'sv-SE',  // Swedish
}
```

### Adjust Voice Settings

In `ai-voice-support.js`:
```javascript
voiceRate: 1.0,   // Speed: 0.1 to 10 (1 is normal)
voicePitch: 1.0,  // Pitch: 0 to 2 (1 is normal)
```

---

## License and Credits

This implementation guide is provided as-is for educational purposes. Feel free to modify and use in your projects.

**Technologies Used:**
- Google Gemini API
- Web Speech API (Speech Recognition & Synthesis)
- Laravel PHP Framework
- Modern CSS (Glassmorphism design)

---

*Guide created for Al-Hekma Labs AI Voice Support Implementation*
*Last updated: January 2026*
