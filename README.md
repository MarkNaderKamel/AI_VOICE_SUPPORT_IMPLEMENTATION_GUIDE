# AI Voice Support - Documentation Files

This folder contains all the demo code files needed to implement AI Voice Support in any Laravel/PHP website.

## 📁 File Contents

| File | Description |
|------|-------------|
| `AI_VOICE_SUPPORT_IMPLEMENTATION_GUIDE.md` | Complete step-by-step implementation guide (Markdown) |
| `documentation.html` | **Professional styled documentation page** (HTML) |
| `demo-index.html` | Demo HTML page to test the feature |
| `demo-ai-knowledge-base.js` | Sample knowledge base with company data |
| `demo-ai-voice-support.js` | Main JavaScript module for voice interaction |
| `demo-ai-voice-support.css` | Glassmorphism styles for the modal |
| `demo-ai-voice-support.blade.php` | Laravel Blade component template |
| `demo-AiVoiceSupportController.php` | Backend PHP controller for secure API calls |
| `demo-routes-example.php` | Route configuration examples |

## 🚀 Quick Start

### 1. Test the Demo
Open `demo-index.html` in a browser to see the UI in action.

> **Note**: Full functionality requires a backend server with Gemini API configured.

### 2. Installation Steps

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
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

6. **Clear Cache**
   ```bash
   php artisan config:clear
   php artisan route:clear
   ```

## 📋 Requirements

- PHP 7.4+ with cURL extension
- Laravel 6+
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

### Update Knowledge Base
Edit `demo-ai-knowledge-base.js` with your company information:
- Company details
- Services offered
- FAQ content
- Greetings in different languages

## 🌐 Supported Languages

English, Arabic, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Turkish, Hindi, Urdu

## 📞 Support

For implementation assistance, contact your development team or refer to the full implementation guide.

---
*Last updated: January 2026*
