/**
 * AI Voice Support - Knowledge Base (DEMO VERSION)
 * 
 * Contains company information, services, and FAQ data for the AI agent.
 * This file provides context for the Gemini Live API to answer questions.
 * 
 * IMPORTANT: The AI will ONLY answer from this data.
 * Customize all content below with your company information.
 * 
 * @version 2.0.0 (Updated for Gemini Live API)
 * @author Your Company Name
 */

const AI_KNOWLEDGE_BASE = {
    // ============================================================
    // FULL DOCUMENT CONTENT
    // ============================================================
    // Paste your company's detailed documentation here.
    // This is the primary source of information for the AI.
    // The more detailed this is, the better the AI can answer questions.
    documentContent: `
        === SAMPLE COMPANY DOCUMENTATION ===
        
        Welcome to Sample Company, your trusted partner in digital solutions.
        
        ABOUT US:
        Sample Company was founded in 2020 with a mission to provide 
        high-quality digital services to businesses of all sizes. We 
        specialize in web development, mobile applications, and digital 
        marketing solutions.
        
        OUR HISTORY:
        - 2020: Company founded
        - 2021: Launched first major product
        - 2022: Expanded to international markets
        - 2023: Reached 1000+ clients
        - 2024: Opened new regional offices
        
        TEAM MEMBERS:
        - John Smith, CEO & Founder
        - Jane Doe, CTO
        - Mike Johnson, Head of Development
        - Sarah Williams, Marketing Director
        - David Brown, Customer Success Manager
        
        SERVICES WE OFFER:
        
        1. Web Development
           We create responsive, modern websites using the latest 
           technologies including React, Vue.js, and Laravel. Our 
           websites are optimized for speed, security, and SEO.
        
        2. Mobile App Development
           Native and cross-platform mobile applications for iOS 
           and Android. We use Flutter and React Native to deliver 
           high-quality apps efficiently.
        
        3. E-Commerce Solutions
           Complete online store setup with payment integration, 
           inventory management, and analytics dashboards.
        
        4. Digital Marketing
           SEO optimization, social media management, PPC campaigns,
           and content marketing strategies.
        
        5. IT Consulting
           Technology assessment, digital transformation planning,
           and system architecture design.
        
        CONTACT INFORMATION:
        - Phone: +1 (555) 123-4567
        - Email: info@samplecompany.com
        - Address: 123 Business Street, Tech City, TC 12345
        - Hours: Monday - Friday, 9:00 AM - 6:00 PM
        
        === END OF DOCUMENTATION ===
    `,

    // ============================================================
    // COMPANY INFORMATION
    // ============================================================
    company: {
        name: "Sample Company",
        nameArabic: "شركة نموذجية",
        tagline: "Your Digital Solutions Partner",
        description: "Sample Company is a leading provider of digital solutions including web development, mobile applications, and IT consulting services. We help businesses transform their digital presence and achieve their goals.",
        website: "https://samplecompany.com",
        contactPage: "https://samplecompany.com/contact",
        email: "info@samplecompany.com",
        phone: "+1 (555) 123-4567",
        location: "123 Business Street, Tech City, TC 12345"
    },

    // ============================================================
    // SERVICES OFFERED
    // ============================================================
    services: [
        {
            name: "Web Development",
            description: "Custom website development using modern technologies including React, Vue.js, Next.js, and Laravel. We create responsive, fast, and secure websites with e-commerce solutions, CMS customization, and SEO optimization.",
            pricing: "Starting at $2,500"
        },
        {
            name: "Mobile App Development",
            description: "Native and cross-platform mobile applications for iOS and Android using Flutter and React Native. Includes UI/UX design, API integration, and app store deployment.",
            pricing: "Starting at $5,000"
        },
        {
            name: "E-Commerce Solutions",
            description: "Complete online store development with payment gateway integration, inventory management, order tracking, and analytics dashboards. Compatible with Shopify, WooCommerce, and custom solutions.",
            pricing: "Starting at $3,500"
        },
        {
            name: "Digital Marketing",
            description: "Comprehensive digital marketing services including SEO optimization, social media management, Google Ads campaigns, content marketing, and email marketing strategies.",
            pricing: "Starting at $1,000/month"
        },
        {
            name: "IT Consulting",
            description: "Expert IT consulting services including technology assessment, digital transformation planning, system architecture design, security audits, and cloud migration strategies.",
            pricing: "Contact us for custom quote"
        },
        {
            name: "UI/UX Design",
            description: "User-centered design services including wireframing, prototyping, user research, usability testing, and complete design system creation for web and mobile applications.",
            pricing: "Starting at $1,500"
        }
    ],

    // ============================================================
    // FREQUENTLY ASKED QUESTIONS
    // ============================================================
    faq: [
        {
            question: "What services do you offer?",
            answer: "We offer a comprehensive range of digital services including web development, mobile app development, e-commerce solutions, digital marketing, IT consulting, and UI/UX design. Each service is tailored to meet your specific business needs."
        },
        {
            question: "How much do your services cost?",
            answer: "Our pricing varies based on project scope and requirements. Web development starts at $2,500, mobile apps at $5,000, and digital marketing at $1,000/month. Contact us for a detailed quote tailored to your project."
        },
        {
            question: "How long does a typical project take?",
            answer: "Project timelines vary based on complexity. A simple website takes 2-4 weeks, while a custom mobile app may take 2-4 months. We always provide realistic timelines during our initial consultation."
        },
        {
            question: "Do you offer ongoing support and maintenance?",
            answer: "Yes, we offer comprehensive support and maintenance packages for all our projects. This includes bug fixes, security updates, performance optimization, and feature enhancements."
        },
        {
            question: "How can I contact you?",
            answer: "You can reach us at info@samplecompany.com or call +1 (555) 123-4567. Our office hours are Monday through Friday, 9 AM to 6 PM. You can also visit our contact page to submit an inquiry."
        },
        {
            question: "Where are you located?",
            answer: "Our main office is located at 123 Business Street, Tech City, TC 12345. We also serve clients remotely worldwide."
        },
        {
            question: "Do you work with international clients?",
            answer: "Absolutely! We work with clients from all over the world. Our team is experienced in remote collaboration and we use modern tools to ensure smooth communication across time zones."
        },
        {
            question: "What technologies do you use?",
            answer: "We use modern, industry-standard technologies including React, Vue.js, Next.js, Laravel, Node.js, Flutter, React Native, AWS, and Google Cloud. We always choose the best technology stack for each specific project."
        }
    ],

    // ============================================================
    // MULTILINGUAL GREETINGS
    // ============================================================
    greetings: {
        en: "Hello! Welcome to Sample Company. I'm your AI assistant. I can answer questions about our services, pricing, and more. How can I help you today?",
        ar: "مرحباً! أهلاً بك في شركتنا النموذجية. أنا مساعدك الآلي. يمكنني الإجابة على أسئلتك حول خدماتنا والأسعار والمزيد. كيف يمكنني مساعدتك اليوم؟",
        fr: "Bonjour! Bienvenue chez Sample Company. Je suis votre assistant IA. Je peux répondre à vos questions sur nos services, nos prix et plus encore. Comment puis-je vous aider?",
        es: "¡Hola! Bienvenido a Sample Company. Soy tu asistente de IA. Puedo responder preguntas sobre nuestros servicios, precios y más. ¿Cómo puedo ayudarte hoy?",
        de: "Hallo! Willkommen bei Sample Company. Ich bin Ihr KI-Assistent. Ich kann Fragen zu unseren Dienstleistungen, Preisen und mehr beantworten. Wie kann ich Ihnen helfen?",
        default: "Hello! Welcome to Sample Company. How can I help you?"
    },

    // ============================================================
    // FALLBACK MESSAGES
    // ============================================================
    fallbackMessages: {
        en: "I don't have specific information about that. Please contact our team at https://samplecompany.com/contact for detailed assistance.",
        ar: "ليس لدي معلومات محددة حول ذلك. يرجى التواصل مع فريقنا على الموقع للمساعدة.",
        fr: "Je n'ai pas d'informations spécifiques à ce sujet. Veuillez contacter notre équipe pour obtenir de l'aide.",
        es: "No tengo información específica sobre eso. Por favor contacte a nuestro equipo para obtener ayuda.",
        de: "Ich habe keine spezifischen Informationen dazu. Bitte kontaktieren Sie unser Team für Hilfe.",
        default: "Please contact us at https://samplecompany.com/contact for assistance."
    },

    // ============================================================
    // SYSTEM PROMPT
    // ============================================================
    // This controls the AI's behavior. Customize carefully.
    systemPrompt: `You are a helpful AI voice assistant for Sample Company. You MUST follow these rules strictly:

CRITICAL RULES:
1. You can ONLY answer questions using the information provided in the context below (documentContent and company info). Do NOT use any external knowledge.
2. If a question cannot be answered from the provided information, tell the user: "I don't have that specific information. Please contact our team at https://samplecompany.com/contact for assistance."
3. NEVER make up or invent information that is not in the provided context.
4. If asked about topics outside of Sample Company, politely explain that you can only help with Sample Company services.

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

// For Node.js/CommonJS environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI_KNOWLEDGE_BASE;
}
