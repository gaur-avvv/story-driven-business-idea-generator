
export type Language = 'en' | 'hi';

const translations = {
  en: {
    // Header
    headerTitle: 'Story-Driven Business Idea Generator',
    settings: 'Settings',
    history: 'History',

    // Language Switcher
    langEn: 'EN',
    langHi: 'HI',

    // Theme
    themeLight: 'Light theme',
    themeDark: 'Dark theme',
    themeSystem: 'System theme',

    // Welcome
    welcomeTitle: 'Welcome to the Idea Factory',
    welcomeDescription: 'Generate your next big business idea by combining cutting-edge market trends with timeless wisdom from the world\'s best business books.',
    feature1Title: 'Trend Analysis',
    feature1Description: 'Our AI scans for current market shifts, consumer behaviors, and tech advancements to find your opportunity.',
    feature2Title: 'Proven Principles',
    feature2Description: 'Ideas are grounded in foundational strategies from books like \'$100M Offers\' and \'The Lean Startup\'.',
    feature3Title: 'Compelling Narratives',
    feature3Description: 'Receive your idea as a memorable story, making it easy to understand, pitch, and share.',
    feature4Title: 'Audio Narration',
    feature4Description: 'Listen to a high-quality, AI-generated narration of your business parable on the go.',
    welcomeReady: 'Ready to start? Enter a topic above and click "Generate My Business Idea".',
    
    // Generator Form
    formTabNew: 'New Business Idea',
    formTabImprove: 'Improve My Business',
    formLabelNew: 'Enter an industry, trend, or book... (optional)',
    formPlaceholderNew: 'e.g., sustainable fashion, AI in education, The 4-Hour Workweek',
    formButtonNew: 'Generate New Business Idea',
    formLabelImprove: 'Describe your business and its challenges...',
    formPlaceholderImprove: 'e.g., \'I run a local coffee shop and foot traffic is low\', \'My online store has high cart abandonment rates\'',
    formButtonImprove: 'Generate Improvement Strategy',
    deepAnalysis: 'Deep Analysis',
    locationLabel: 'Location (Optional)',
    locationPlaceholder: 'e.g., San Francisco, or click icon for current location',
    inspirationLabel: 'Inspiration Link (Optional)',
    inspirationPlaceholder: 'e.g., YouTube video, blog post link',
    gettingLocation: 'Getting Location...',
    locationError: 'Location Error',
    useMyLocation: 'Use My Location',
    generating: 'Generating...',

    // Form Enhancements
    categoriesLabel: 'Book Categories (Influence Principle)',
    keywordsLabel: 'Market Trend Keywords',
    keywordsPlaceholder: 'e.g., decentralization, zero-waste, gen-alpha',
    catMarketing: 'Marketing',
    catStrategy: 'Strategy',
    catFinance: 'Finance',
    catOps: 'Operations',
    catSales: 'Sales',
    catLeadership: 'Leadership',
    catPsychology: 'Psychology',
    catSustainability: 'Sustainability',
    catTech: 'AI & Tech',
    catRetail: 'Retail',
    catB2BSaaS: 'B2B SaaS',
    catD2C: 'D2C',
    catFinTech: 'FinTech',
    catEdTech: 'EdTech',

    // Tooltips
    tipSettings: 'API Key and Preferences',
    tipHistory: 'View past generations',
    tipLanguage: 'Switch Language',
    tipDeepAnalysis: 'Uses heavy reasoning & market research agents',
    tipLocation: 'Tailor idea to a specific city or region',
    tipInspiration: 'Analyze a URL or text for contextual inspiration',
    tipCategories: 'Influence idea with specific business book frameworks',
    tipKeywords: 'Specific market trends to prioritize',
    tipModelSelection: 'Different models vary in intelligence, speed, and cost-efficiency',
    tipApiStorage: 'API keys are stored locally in your browser and never sent to our servers.',

    // Result Card
    insightTitleNew: 'Market Insight',
    insightTitleImprove: 'Problem Analysis',
    corePrincipleTitle: 'Core Principle',
    storyTitleNew: 'The Story',
    storyTitleImprove: 'Implementation Story',
    sourcesTitle: 'Sources',
    downloadIdea: 'Download Idea',
    downloadAudio: 'Download Audio',
    shareIdea: 'Share Idea',
    sharedToClipboard: 'Idea summary copied to clipboard!',
    feedbackTitle: 'Was this idea useful?',
    refineTitle: 'Refine This Idea',
    refinePlaceholder: 'Enter a new idea to modify, continue, or improve the story...',
    refineButton: 'Regenerate with My Idea',
    refining: 'Refining...',

    // History
    historyTitle: 'Recent Ideas',
    noHistory: 'No ideas saved yet.',
    clearHistory: 'Clear All',
    deleteItem: 'Delete',
    backToGenerator: 'Back to Generator',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',

    // Settings Modal
    settingsTitle: 'Settings',
    apiKeyLabel: 'Gemini API Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeyDescription: 'Your key is stored locally in your browser and never sent to our servers.',
    saveKeyButton: 'Save Key',
    removeKeyButton: 'Remove Key',

    // Errors
    apiKeyError: 'API Key missing. Please update it in Settings.',
    networkError: 'Network failure. Check your internet connection.',
    generationError: 'Model failed to generate a coherent response. Try again.',
    unknownError: 'An unexpected error occurred.',
    quotaError: 'API rate limit exceeded. Please wait a moment.',

  },
  hi: {
    // Header
    headerTitle: 'Kahani-Adharit Business Idea Generator',
    settings: 'Settings',
    history: 'इतिहास',

    // Language Switcher
    langEn: 'EN',
    langHi: 'HI',

    // Theme
    themeLight: 'हल्की थीम',
    themeDark: 'गहरी थीम',
    themeSystem: 'सिस्टम थीम',

    // Welcome
    welcomeTitle: 'Idea Factory Mein Aapka Swagat Hai',
    welcomeDescription: 'Market ke naye trends aur duniya ki behtareen business kitabon ke gyan ko milakar apna agla bada business idea banayein.',
    feature1Title: 'Trend Analysis',
    feature1Description: 'Hamara AI naye market shifts, customer behavior, aur tech advancements ko scan karke aapke liye opportunity dhundhta hai.',
    feature2Title: 'Siddhant Jo Kaam Karte Hain',
    feature2Description: '\'$100M Offers\' aur \'The Lean Startup\' jaisi kitabon ke anubhavi strategies par adharit ideas.',
    feature3Title: 'Aakarshak Kahaniyan',
    feature3Description: 'Apna idea ek yaadgar kahani ke roop mein prapt karein, jise samajhna, pitch karna aur share karna aasan ho.',
    feature4Title: 'Audio Kahani',
    feature4Description: 'Apne business ki kahani ko ek high-quality AI-generated audio narration mein sunein, kahin bhi, kabhi bhi.',
    welcomeReady: 'Shuru karne ke liye taiyar hain? Upar ek vishay darj karein aur "Naya Business Idea Banayein" par click karein.',
  
    // Generator Form
    formTabNew: 'Naya Business Idea',
    formTabImprove: 'Mera Business Sudharein',
    formLabelNew: 'Ek industry, trend, ya kitab ka naam likhein... (vaikalpik)',
    formPlaceholderNew: 'Jaise, sustainable fashion, AI in education, The 4-Hour Workweek',
    formButtonNew: 'Naya Business Idea Banayein',
    formLabelImprove: 'Apne business aur uski samasyaon ke baare mein batayein...',
    formPlaceholderImprove: 'Jaise, \'Main ek local coffee shop chalata hoon aur grahak kam hain\', \'Mere online store par log cart mein saaman daal kar chhod dete hain\'',
    formButtonImprove: 'Sudhar Ke Liye Strategy Banayein',
    deepAnalysis: 'Gehra Analysis',
    locationLabel: 'Sthan (Vaikalpik)',
    locationPlaceholder: 'Jaise, San Francisco, ya vartaman sthan ke liye icon par click karein',
    inspirationLabel: 'Prerna Link (Vaikalpik)',
    inspirationPlaceholder: 'Jaise, YouTube video, blog post link',
    gettingLocation: 'Location Le Rahe Hain...',
    locationError: 'Location Error',
    useMyLocation: 'Meri Location Istemal Karein',
    generating: 'Banaya Ja Raha Hai...',

    // Form Enhancements
    categoriesLabel: 'Book Categories (Siddhant ke liye)',
    keywordsLabel: 'Market Trend Keywords',
    keywordsPlaceholder: 'Jaise, decentralization, zero-waste, gen-alpha',
    catMarketing: 'Marketing',
    catStrategy: 'Strategy',
    catFinance: 'Finance',
    catOps: 'Operations',
    catSales: 'Sales',
    catLeadership: 'Leadership',
    catPsychology: 'Psychology',
    catSustainability: 'Sustainability',
    catTech: 'AI & Tech',
    catRetail: 'Retail',
    catB2BSaaS: 'B2B SaaS',
    catD2C: 'D2C',
    catFinTech: 'FinTech',
    catEdTech: 'EdTech',

    // Tooltips
    tipSettings: 'API Key aur bhasha badlein',
    tipHistory: 'Purane ideas dekhein',
    tipLanguage: 'Bhasha Badlein',
    tipDeepAnalysis: 'Gehra research karta hai',
    tipLocation: 'Sahar ke hisab se idea',
    tipInspiration: 'Kahin se prerna lein',
    tipCategories: 'Business kitabon ke gyan ka asar',
    tipKeywords: 'Khas market trends ko mahatva deing',
    tipModelSelection: 'Alag-alag models ki buddhimatta aur keemat alag hoti hai',
    tipApiStorage: 'API keys aapke browser mein save rehti hain aur hamare server par nahi jati.',

    // Result Card
    insightTitleNew: 'Market Ki Samajh',
    insightTitleImprove: 'Samasya Ka Vishleshan',
    corePrincipleTitle: 'Mool Siddhant',
    storyTitleNew: 'Kahani',
    storyTitleImprove: 'Kriyanvayan Ki Kahani',
    sourcesTitle: 'Srot',
    downloadIdea: 'Idea Download Karein',
    downloadAudio: 'Audio Download Karein',
    shareIdea: 'Idea Share Karein',
    sharedToClipboard: 'Idea summary copy ho gayi!',
    feedbackTitle: 'Kya ye idea kaam ka tha?',
    refineTitle: 'Is Idea Ko Sudharein',
    refinePlaceholder: 'Kahani ko badalne, aage badhane ya behtar banane ke liye naya idea darj karein...',
    refineButton: 'Mere Idea Ke Saath Dobara Banayein',
    refining: 'Sudhara Ja Raha Hai...',

    // History
    historyTitle: 'हाल के विचार',
    noHistory: 'अभी तक कोई विचार सेव नहीं किया गया है।',
    clearHistory: 'सभी साफ करें',
    deleteItem: 'हटाएं',
    backToGenerator: 'जेनरेटर पर वापस जाएं',
    justNow: 'अभी-अभी',
    minutesAgo: 'मि. पहले',
    hoursAgo: 'घं. पहले',

    // Settings Modal
    settingsTitle: 'Settings',
    apiKeyLabel: 'Gemini API Key',
    apiKeyPlaceholder: 'Apna API key yahan darj karein',
    apiKeyDescription: 'Aapki key aapke browser mein sthaniy roop se save ki jati hai aur hamare server par kabhi nahi bheji jati.',
    saveKeyButton: 'Key Save Karein',
    removeKeyButton: 'Key Hatayein',

    // Errors
    apiKeyError: 'API Key set nahi hai. Kripya settings mein jakar key add karein.',
    networkError: 'Internet connection check karein.',
    generationError: 'Idea banane mein dikkat hui, fir se koshish karein.',
    unknownError: 'Ek anjaan truti hui.',
    quotaError: 'Limit khatam, thodi der rukiye.',
  },
};

export const t = (lang: Language, key: keyof typeof translations.en): string => {
  return translations[lang][key] || translations.en[key];
};
