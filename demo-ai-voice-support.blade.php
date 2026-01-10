{{-- 
    AI Voice Support - Blade Component (DEMO VERSION)
    
    Modal component for AI voice interactions using Gemini Live API.
    Updated for v2.0 with canvas visualizer support.
    
    INSTALLATION:
    1. Copy this file to: resources/views/front/partials/ai-voice-support.blade.php
    2. Include in your layout: @include('front.partials.ai-voice-support')
    3. Add CSS and JS files to your layout
    
    @version 2.0.0
--}}

{{-- AI Voice Support Modal Component --}}
<div id="aiVoiceSupportModal" class="ai-voice-modal">
    <div class="ai-voice-container">
        {{-- Background Glow Effect --}}
        <div class="ai-voice-glow" id="aiVoiceGlow"></div>

        {{-- Close Button --}}
        <button type="button" class="ai-voice-close" id="aiVoiceCloseBtn" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>

        {{-- Header --}}
        <div class="ai-voice-header">
            <h3><i class="fas fa-robot"></i> Voice AI Support</h3>
            <p>Powered by AI Natural Voice</p>
        </div>

        {{-- Status Display --}}
        <div class="ai-voice-status" id="aiVoiceStatus">
            Tap to start voice support
        </div>

        {{-- Canvas Visualizer --}}
        <div class="ai-voice-visualizer">
            <canvas id="aiVoiceCanvas" width="320" height="100"></canvas>
        </div>

        {{-- CSS Wave Animation (Fallback) --}}
        <div class="ai-voice-wave" id="aiVoiceWave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>

        {{-- AI Response Display (Optional) --}}
        <div class="ai-voice-response-area">
            <p id="aiVoiceResponse"></p>
        </div>

        {{-- Control Buttons --}}
        <div class="ai-voice-controls">
            <button type="button" class="ai-voice-end-btn" id="aiVoiceEndCall">
                <i class="fas fa-phone-slash"></i> End Call
            </button>
            <button type="button" class="ai-voice-retry-btn" id="aiVoiceRetry" style="display: none;">
                <i class="fas fa-redo"></i> Retry Connection
            </button>
        </div>

        {{-- Contact Link --}}
        <a href="{{ url('/contact') }}" class="ai-voice-contact">
            <i class="fas fa-headset"></i>
            Need human assistance? Contact our team
        </a>
    </div>
</div>

{{-- Floating Trigger Button (Optional - Add where needed) --}}
{{-- 
<button class="ai-floating-btn" onclick="openAIVoiceSupport()" aria-label="AI Voice Support">
    <i class="fas fa-microphone"></i>
    <span class="pulse-ring"></span>
</button>
--}}

{{-- 
    USAGE EXAMPLES:
    
    1. As a button in your header:
    <button class="btn" onclick="openAIVoiceSupport()">
        <i class="fas fa-microphone"></i> AI Voice Support
    </button>
    
    2. As a navigation link:
    <a href="javascript:void(0)" onclick="openAIVoiceSupport()">
        <i class="fas fa-headset"></i> Talk to AI
    </a>
    
    3. As a floating button (add the floating button HTML above)
--}}
