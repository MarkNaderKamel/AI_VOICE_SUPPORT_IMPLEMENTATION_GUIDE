# AI Voice Support - Documentation Files

This folder contains all the demo code files needed to implement AI Voice Support in any Laravel/PHP website. Now featuring **bilingual support (English/Arabic)** and **custom avatar customization**.

## 📁 File Contents

| File | Description |
|------|-------------|
| `AI_VOICE_SUPPORT_IMPLEMENTATION_GUIDE.md` | Complete step-by-step implementation guide (Markdown) with Arabic version |
| `ai-implementation-prompt.md` | AI agent prompt for automated implementation |
| `documentation.html` | **Professional styled documentation page** with language switcher |
| `index.html` | Demo HTML page to test the feature |
| `demo-ai-knowledge-base.js` | Sample knowledge base with company data |
| `demo-ai-voice-support.js` | Main JavaScript module for voice interaction |
| `demo-ai-voice-support.css` | Glassmorphism styles for the modal + custom avatar styles |
| `demo-ai-voice-support.blade.php` | Laravel Blade component template |
| `demo-AiVoiceSupportController.php` | Backend PHP controller for secure API calls |
| `demo-routes-example.php` | Route configuration examples |
| `favicon.png` | Documentation favicon |

## ✨ What's New

### Custom Avatar / Character Support
Replace the default microphone icon with a custom animated GIF or character:
- Floating wrapper with speech bubble label
- Smooth floating animations
- Circular avatar frame with glow effects
- Fully customizable colors and sizing

### Bilingual Support (English/Arabic)
- Language switcher buttons in documentation header
- Complete Arabic guide section (الدليل العربي)
- RTL layout support for Arabic content

### Dynamic Path Detection
- Automatic base path detection for localhost vs production deployment
- No more hardcoded `/aseu/` paths - works everywhere!

## 🚀 Quick Start

### 1. Test the Demo
Open `index.html` in a browser to see the UI in action.

> **Note**: Full functionality requires a backend server with Gemini API configured.

### 2. View Documentation
Open `documentation.html` for the full styled implementation guide.

### 3. Installation Steps

1. **Copy Controller**
   ```
   demo-AiVoiceSupportController.php → app/Http/Controllers/Front/AiVoiceSupportController.php
   ```

2. **Copy Blade Template**
   ```
   demo-ai-voice-support.blade.php → resources/views/front/partials/ai-voice-support.blade.php
   ```

3. **Copy Assets**
   ```
   demo-ai-knowledge-base.js → public/assets/front/js/ai-knowledge-base.js
   demo-ai-voice-support.js → public/assets/front/js/ai-voice-support.js
   demo-ai-voice-support.css → public/assets/front/css/ai-voice-support.css
   ```

4. **Add Route** (see `demo-routes-example.php`)

5. **Configure .env**
   ```env
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
   GEMINI_VOICE=Puck
   ```

6. **Clear Cache**
   ```bash
   php artisan config:clear
   php artisan route:clear
   ```

## 🎨 Custom Avatar Setup

Replace the microphone icon with a custom character:

```html
<div class="ai-floating-wrapper">
  <div class="ai-floating-label">
    <span>🤖 AI Voice Agent</span>
  </div>
  <button class="ai-floating-btn" onclick="openAIVoiceSupport()">
    <img src="assets/img/your-avatar.gif" alt="AI Assistant" class="ai-btn-gif">
  </button>
</div>
```

See the **Custom Avatar** section in `documentation.html` for full CSS styling.

## 📋 Requirements

- PHP 7.4+ with cURL extension
- Laravel 6+ (or any PHP framework)
- Google Gemini API Key
- Modern browser (Chrome, Edge, Safari)

## 🔧 Customization

### Change Colors
Edit CSS variables in `demo-ai-voice-support.css`:
```css
:root {
    --ai-primary-color: #f7931e;    /* Main button color */
    --ai-primary-dark: #e08100;     /* Darker shade */
    --ai-secondary-color: #1e2a3c;  /* Background color */
}
```

### Available AI Voices
| Voice | Type |
|-------|------|
| Puck | Male |
| Charon | Male |
| Kore | Female |
| Zephyr | Female |

### Update Knowledge Base
Edit `demo-ai-knowledge-base.js` with your company information:
- Company details
- Services offered
- FAQ content
- Greetings in different languages

## 🌐 Supported Languages

English, Arabic, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Turkish, Hindi, Urdu

## �‍💻 Developer

**Developed by [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)**

## �📞 Support

For implementation assistance, refer to the full documentation or contact the development team.

**Contact Me [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)**
---
*Version 2.0 - Gemini Live API*  
*Last updated: January 2026*
