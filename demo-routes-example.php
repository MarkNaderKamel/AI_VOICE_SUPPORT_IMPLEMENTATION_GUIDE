<?php
/**
 * AI Voice Support - Routes Configuration (DEMO VERSION)
 * 
 * Add these routes to your routes/web.php file.
 * Updated for Gemini Live API (v2.0)
 * 
 * @version 2.0.0
 */

// ============================================================
// AI VOICE SUPPORT ROUTES
// Add these lines to your routes/web.php file
// ============================================================

// Config endpoint for Gemini Live API (NEW in v2.0)
// Returns API key and settings for WebSocket connection
Route::get('/api/ai-voice-support/config', 'Front\AiVoiceSupportController@getConfig')
    ->name('front.ai.voice.config');

// Legacy REST API endpoint (fallback for text-based queries)
Route::post('/api/ai-voice-support', 'Front\AiVoiceSupportController@query')
    ->name('front.ai.voice.query');


// ============================================================
// ALTERNATIVE: Using Route Groups
// ============================================================
// If you prefer using route groups:

/*
Route::prefix('api/ai-voice-support')->group(function () {
    Route::get('/config', 'Front\AiVoiceSupportController@getConfig')
        ->name('front.ai.voice.config');
    
    Route::post('/', 'Front\AiVoiceSupportController@query')
        ->name('front.ai.voice.query');
});
*/


// ============================================================
// ALTERNATIVE: Laravel 8+ Syntax with fully qualified class names
// ============================================================

/*
use App\Http\Controllers\Front\AiVoiceSupportController;

Route::get('/api/ai-voice-support/config', [AiVoiceSupportController::class, 'getConfig'])
    ->name('front.ai.voice.config');

Route::post('/api/ai-voice-support', [AiVoiceSupportController::class, 'query'])
    ->name('front.ai.voice.query');
*/


// ============================================================
// WITH MIDDLEWARE (Recommended for production)
// ============================================================

/*
Route::middleware(['web', 'throttle:60,1'])->group(function () {
    Route::get('/api/ai-voice-support/config', 'Front\AiVoiceSupportController@getConfig')
        ->name('front.ai.voice.config');
    
    Route::post('/api/ai-voice-support', 'Front\AiVoiceSupportController@query')
        ->name('front.ai.voice.query');
});
*/
