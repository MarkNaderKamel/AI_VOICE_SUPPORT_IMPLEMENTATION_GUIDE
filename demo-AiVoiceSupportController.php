<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * AI Voice Support Controller (DEMO VERSION)
 * 
 * Updated for Gemini Multimodal Live API (v2.0)
 * Provides configuration for client-side WebSocket connections
 * 
 * INSTALLATION:
 * 1. Copy this file to: app/Http/Controllers/Front/AiVoiceSupportController.php
 * 2. Add GEMINI_API_KEY to your .env file
 * 3. Add the routes to routes/web.php (see demo-routes-example.php)
 * 
 * @version 2.0.0
 * @author Your Company Name
 * @license MIT
 */
class AiVoiceSupportController extends Controller
{
    /**
     * Get configuration for Gemini Live API
     * 
     * Returns the API key and settings for client-side WebSocket connection.
     * The frontend uses @google/genai SDK to connect directly to Gemini.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConfig(Request $request)
    {
        // Rate limiting - allow max 10 config requests per minute per session
        $sessionKey = 'ai_config_requests_' . session()->getId();
        $requestCount = session($sessionKey, 0);
        
        if ($requestCount >= 10) {
            return response()->json([
                'success' => false,
                'error' => 'Too many requests. Please wait a moment.'
            ], 429);
        }
        
        session([$sessionKey => $requestCount + 1]);
        
        // Get API key from environment
        $apiKey = env('GEMINI_API_KEY');
        
        if (!$apiKey) {
            Log::error('GEMINI_API_KEY not configured in .env');
            return response()->json([
                'success' => false,
                'error' => 'AI service not configured'
            ], 500);
        }

        // Get the knowledge base context from the request or use default
        $knowledgeContext = $request->input('context', $this->getDefaultContext());

        return response()->json([
            'success' => true,
            'apiKey' => $apiKey,
            'model' => 'gemini-2.5-flash-native-audio-preview-12-2025',
            'voiceName' => 'Zephyr',  // Options: Zephyr, Puck, Charon, Kore, Fenrir, Aoede
            'systemInstruction' => $knowledgeContext
        ]);
    }

    /**
     * Legacy REST API endpoint (fallback)
     * 
     * Use this for text-based queries when Live API is not suitable.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function query(Request $request)
    {
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

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            // Disable SSL verification for local development only
            // IMPORTANT: Remove these lines in production!
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
                
                if (strpos($response, 'RESOURCE_EXHAUSTED') !== false) {
                    return response()->json([
                        'success' => false,
                        'error' => 'AI service is temporarily busy. Please try again.'
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

    /**
     * Get default AI context/system prompt
     * 
     * Customize this with your company's information
     * 
     * @return string
     */
    private function getDefaultContext()
    {
        return "You are the official AI Voice Representative for Your Company Name.

Your tone is professional, friendly, and helpful. You speak naturally like a helpful colleague.

KNOWLEDGE BASE:
- You help users with questions about services, pricing, and general inquiries
- For specific issues, direct users to the contact page

RESPONSE STYLE:
- Keep responses concise but comprehensive (this is voice, not text)
- Speak naturally as if on a phone call
- Be warm and personable

IMPORTANT:
- Only answer from the provided knowledge base
- If you don't know, suggest contacting support
- Always be helpful and professional";
    }
}
