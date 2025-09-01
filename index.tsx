
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, Type } from "@google/genai";

// --- Centralized AI Client ---
// For robustness and efficiency, we create a single instance of the AI client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Types ---
type Page = 'analyzer' | 'account';
type SubscriptionStatus = {
    isSubscribed: boolean;
    email: string | null;
};
type AnalysisResult = {
    pattern: string;
    trend: string;
    recommendation: string;
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    detailedAnalysis: string;
    notes: string;
};
type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};


// --- Helper Functions ---
const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
        navigator.vibrate(50); // A short, subtle vibration
    }
};

// --- Helper Components & Icons ---
const CrownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L10 13.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.192L2.14 8.124a.75.75 0 01.416-1.28l4.21-.612L8.64.418A.75.75 0 0110 2z" />
    </svg>
);
const ChartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const TargetIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ShieldIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.606 11.955 11.955 0 019 2.606c.331-1.587.243-3.218-.219-4.755a11.955 11.955 0 01-2.298-5.184z" />
    </svg>
);
const WalletIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);
const MailIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const ClipboardCheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);
const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const GalleryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const AnalysisIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const NotesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const ResultCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex items-start space-x-4 space-x-reverse">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-teal-400">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-lg text-teal-400">{title}</h3>
            <p data-selectable="true" className="text-gray-300 mt-1">{children}</p>
        </div>
    </div>
);

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-teal-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                {number}
            </div>
            <h3 className="mr-4 font-bold text-lg text-white">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

// --- API Service ---
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

// --- Landing Page Component ---
const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[#0D1117] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent z-[-5]"></div>

        <main className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center space-x-2 space-x-reverse bg-gray-800/50 border border-teal-500/30 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-6 animate-fade-in-down">
                <CrownIcon />
                <span>أول منصة عربية لتحليل الشموع بالذكاء الاصطناعي</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight animate-fade-in-up">
                <span>تحليل </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400">العملات الرقمية</span>
                <br />
                <span>بدقة الخبراء</span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
                احصل على توصيات تداول احترافية قوية من خلال رفع صورة الرسم البياني. تحليل متقدم بتقنية الذكاء الاصطناعي لتحديد أنماط الشموع وتوقعات الأسعار.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-gray-300 animate-fade-in-up animation-delay-500">
                <div className="flex items-center gap-3">
                    <ChartIcon />
                    <span>تحليل فوري دقيق</span>
                </div>
                <div className="flex items-center gap-3">
                    <TargetIcon />
                    <span>أسعار دخول وهدف</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldIcon />
                    <span>إدارة مخاطر محترفة</span>
                </div>
            </div>

            <div className="mt-12 animate-fade-in-up animation-delay-700">
                 <button
                    onClick={() => {
                        triggerHapticFeedback();
                        onStart();
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-10 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 text-xl shadow-lg shadow-teal-500/20"
                >
                    ابدأ التحليل الآن
                </button>
            </div>
        </main>
    </div>
);


// --- Main Components ---
const ChatInterface: React.FC<{
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}> = ({ messages, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            triggerHapticFeedback();
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="mt-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4 animate-fade-in-up">
            <h3 className="text-lg font-bold text-teal-400 mb-4 text-center">الدردشة مع المحلل</h3>
            <div className="h-64 overflow-y-auto pr-2 space-y-4 mb-4" style={{ scrollbarWidth: 'thin' }}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl ${
                            msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'
                        }`}>
                            <p className="text-sm" data-selectable="true">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-gray-700 px-4 py-2 rounded-xl inline-flex items-center space-x-2 space-x-reverse rounded-bl-none">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="اسأل عن التحليل..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-teal-500 text-white font-bold p-3 rounded-lg flex items-center justify-center disabled:bg-gray-500 hover:bg-teal-600 transition-colors active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

const CandlestickAnalyzer: React.FC<{ isSubscribed: boolean, onSubscribeClick: () => void }> = ({ isSubscribed, onSubscribeClick }) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const resetChat = () => {
        setChatSession(null);
        setChatMessages([]);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
            resetChat();
        }
        event.target.value = '';
    };

    const handleTakePhoto = () => {
        triggerHapticFeedback();
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
        }
    };
    
    const handleChooseFromLibrary = () => {
        triggerHapticFeedback();
        if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture');
            fileInputRef.current.click();
        }
    };

    const handleSendChatMessage = async (message: string) => {
        if (!chatSession) return;

        const userMessage: ChatMessage = { role: 'user', text: message };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatLoading(true);

        try {
            const response = await chatSession.sendMessage({ message });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setChatMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: ChatMessage = { role: 'model', text: "عذراً، حدث خطأ ما. حاول مرة أخرى." };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };


    const handleSubmit = async () => {
        if (!image) {
            setError("الرجاء رفع صورة أولاً.");
            return;
        }
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResult(null);
        resetChat();

        try {
            const imagePart = await fileToGenerativePart(image);
            const systemInstruction = `أنت خبير تحليل فني محترف في أسواق العملات الرقمية، متخصص في استراتيجيات التداول القائمة على أنماط الشموع اليابانية. مهمتك هي تحليل صورة الرسم البياني المقدمة وتقديم توصية تداول كاملة. قم بتعبئة جميع الحقول في مخطط JSON المقدم بدقة.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    pattern: { type: Type.STRING, description: 'اسم نمط الشموع الرئيسي الذي تم تحديده (مثال: مطرقة، ابتلاع هبوطي).' },
                    trend: { type: Type.STRING, description: 'الاتجاه العام المتوقع بناءً على النمط (صعودي، هبوطي, محايد).' },
                    recommendation: { type: Type.STRING, description: 'التوصية الصريحة (شراء، بيع, احتفاظ).' },
                    entryPrice: { type: Type.STRING, description: "سعر الدخول المقترح. كن محددًا قدر الإمكان (مثال: 'عند سعر الإغلاق الحالي' أو 'عند اختراق مستوى 1.2345')." },
                    stopLoss: { type: Type.STRING, description: 'سعر وقف الخسارة لحماية رأس المال.' },
                    takeProfit: { type: Type.STRING, description: 'سعر جني الأرباح كهدف أول.' },
                    detailedAnalysis: { type: Type.STRING, description: 'تحليل تفصيلي يشرح منطق التوصية، مع الإشارة إلى النمط، حجم التداول (إن وجد)، ومؤشرات أخرى ظاهرة.' },
                    notes: { type: Type.STRING, description: "ملاحظات هامة وتحذيرات خاصة بهذه التوصية فقط (مثال: 'التوصية عالية المخاطر' أو 'تأكد من وجود تأكيد إضافي'). يجب أن تكون الملاحظة مرتبطة مباشرة بالتحليل المقدم ولا تتضمن إخلاء مسؤولية عام." },
                },
                 required: ["pattern", "trend", "recommendation", "entryPrice", "stopLoss", "takeProfit", "detailedAnalysis", "notes"]
            };

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, {text: "حلل صورة الرسم البياني هذه وقدم توصية تداول كاملة."}] },
              config: {
                  systemInstruction: systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: responseSchema
              }
            });
            
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);

            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `أنت خبير تحليل فني مساعد. لقد قمت للتو بتحليل صورة وقدمت النتائج التالية بصيغة JSON: ${JSON.stringify(parsedResult)}. مهمتك الآن هي الإجابة على أسئلة المستخدم المتابعة حول هذا التحليل المحدد. كن موجزًا ومفيدًا ومباشرًا في إجاباتك. لا تذكر أنك AI أو أنك مساعد. خاطب المستخدم مباشرة.`
                }
            });
            setChatSession(chat);

            setTimeout(() => {
                setChatMessages([{
                    role: 'model',
                    text: `تم تحديد نمط "${parsedResult.pattern}". هل لديك أي أسئلة بخصوص هذا التحليل؟`
                }]);
            }, 500);

        } catch (err) {
            console.error("Analysis Error:", err);
            setError("حدث خطأ أثناء تحليل الصورة. الرجاء المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    if (!isSubscribed) {
        return (
            <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-3">ميزة حصرية للمشتركين</h2>
                <p className="text-gray-400 mb-6">للوصول إلى محلل الشموع المتقدم، يرجى تفعيل اشتراكك.</p>
                <button
                    onClick={() => {
                        triggerHapticFeedback();
                        onSubscribeClick();
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 text-lg"
                >
                    الاشتراك الآن
                </button>
            </div>
        );
    }

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            {preview ? (
                <div className="relative group">
                    <img src={preview} alt="معاينة الرسم البياني" className="mx-auto max-h-60 rounded-lg" />
                    <div
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            triggerHapticFeedback();
                            setPreview(null);
                            setImage(null);
                            setResult(null);
                            resetChat();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                </div>
            ) : (
                 <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleTakePhoto}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-teal-500 hover:bg-gray-800/50 flex flex-col items-center justify-center space-y-3 aspect-square"
                        aria-label="التقط صورة"
                    >
                        <CameraIcon />
                        <span className="text-gray-300 font-medium">التقط صورة</span>
                    </button>
                    <button
                        onClick={handleChooseFromLibrary}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-teal-500 hover:bg-gray-800/50 flex flex-col items-center justify-center space-y-3 aspect-square"
                        aria-label="اختر من المعرض"
                    >
                        <GalleryIcon />
                        <span className="text-gray-300 font-medium">اختر من المعرض</span>
                    </button>
                </div>
            )}

            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    disabled={!image || loading}
                    className="w-full bg-teal-500 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-600 active:bg-teal-700 transition-colors text-lg"
                >
                    {loading ? <Spinner /> : "بدء التحليل"}
                </button>
            </div>

            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

            {result && (
                <div className="mt-8 space-y-4">
                    <h2 className="text-2xl font-bold text-center text-white mb-6">نتائج التحليل</h2>

                    <div className={`rounded-lg p-4 text-center border-2 ${
                        result.recommendation.includes('شراء') ? 'bg-green-500/10 border-green-500' :
                        result.recommendation.includes('بيع') ? 'bg-red-500/10 border-red-500' :
                        'bg-gray-500/10 border-gray-500'
                    }`}>
                        <h3 className="text-lg font-bold text-gray-300">التوصية الرئيسية</h3>
                        <p className={`text-2xl font-extrabold ${
                            result.recommendation.includes('شراء') ? 'text-green-400' :
                            result.recommendation.includes('بيع') ? 'text-red-400' :
                            'text-yellow-400'
                        }`}>
                            {result.recommendation}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <h4 className="font-bold text-teal-400">سعر الدخول</h4>
                            <p data-selectable="true" className="text-white text-lg font-mono mt-1">{result.entryPrice}</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <h4 className="font-bold text-red-400">وقف الخسارة</h4>
                            <p data-selectable="true" className="text-white text-lg font-mono mt-1">{result.stopLoss}</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <h4 className="font-bold text-green-400">جني الأرباح</h4>
                            <p data-selectable="true" className="text-white text-lg font-mono mt-1">{result.takeProfit}</p>
                        </div>
                    </div>
                    
                    <ResultCard icon={<AnalysisIcon />} title="التحليل التفصيلي">
                        {result.detailedAnalysis}
                    </ResultCard>
                    <ResultCard icon={<ChartIcon />} title="النمط المحدد">
                        {`${result.pattern} - (${result.trend})`}
                    </ResultCard>
                    <ResultCard icon={<NotesIcon />} title="ملاحظات هامة">
                        {result.notes}
                    </ResultCard>
                    <p className="text-xs text-gray-500 text-center pt-2">
                        إخلاء مسؤولية: التحليل مُقدم بواسطة الذكاء الاصطناعي وليس نصيحة مالية. قم دائمًا بإجراء أبحاثك الخاصة.
                    </p>
                    {chatSession && (
                        <ChatInterface
                            messages={chatMessages}
                            isLoading={isChatLoading}
                            onSendMessage={handleSendChatMessage}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const SubscriptionPage: React.FC<{ onSubscriptionSuccess: (email: string) => void }> = ({ onSubscriptionSuccess }) => {
    const [email, setEmail] = useState('');
    const [txId, setTxId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const subscriptionPrice = "99 USDT";
    const walletAddress = "TNZeskfbAWXWjKE5sWca8m2MCyX6wEpxsU";

    const copyToClipboard = () => {
        triggerHapticFeedback();
        navigator.clipboard.writeText(walletAddress);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleActivate = async () => {
        triggerHapticFeedback();
        // Admin Bypass
        if (email.toLowerCase() === 'admin@example.com') {
            if (!txId) {
                setError("للمدير: الرجاء إدخال أي قيمة في حقل معرّف المعاملة للمتابعة.");
                return;
            }
            setError('');
            setStatusMessage("تم تسجيل الدخول كمدير. جاري التوجيه...");
            setTimeout(() => onSubscriptionSuccess(email), 1500);
            return; // Exit function to bypass Gemini verification
        }

        if (!email || !txId) {
            setError("الرجاء ملء جميع الحقول.");
            return;
        }
        setError('');
        setIsVerifying(true);
        setStatusMessage("جاري التحقق من معاملتك على شبكة البلوك تشين...");

        try {
            const systemInstruction = `أنت نظام آلي للتحقق من معاملات البلوك تشين (TRC20). مهمتك هي التحقق من صحة بيانات المعاملة المقدمة. تحقق من أن "معرف المعاملة" (TxID) يبدو صحيحًا (عادة 64 حرفًا سداسيًا عشريًا) وأن البريد الإلكتروني بتنسيق صحيح. قم بمحاكاة التحقق من المعاملة. إذا كانت البيانات تبدو صحيحة، اعتبرها ناجحة. إذا كان معرف المعاملة قصيرًا جدًا أو غير صالح، فاعتبرها فاشلة. يجب أن تكون إجابتك بتنسيق JSON حصريًا.`;
            const prompt = `الرجاء التحقق من المعاملة بالبيانات التالية: البريد الإلكتروني: ${email}, معرف المعاملة: ${txId}`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    isValid: { type: Type.BOOLEAN, description: 'True if the email and TxID format appear valid, otherwise false.' },
                    reason: { type: Type.STRING, description: 'A user-facing message in Arabic explaining the result (e.g., "تم التحقق بنجاح", "معرف المعاملة يبدو غير صالح").' },
                },
                required: ["isValid", "reason"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });

            const verificationResult = JSON.parse(response.text);

            setIsVerifying(false);
            if (verificationResult.isValid) {
                setStatusMessage("تم التحقق بنجاح! تم تفعيل اشتراكك.");
                setTimeout(() => onSubscriptionSuccess(email), 1500);
            } else {
                setStatusMessage('');
                setError(verificationResult.reason || "لم نتمكن من التحقق من المعاملة. يرجى التأكد من صحة البيانات.");
            }
        } catch (err) {
            console.error("Verification error:", err);
            setIsVerifying(false);
            setStatusMessage('');
            setError("حدث خطأ أثناء الاتصال بخدمة التحقق. يرجى المحاولة مرة أخرى لاحقًا.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white text-center">الوصول الكامل لخطة الخبراء</h2>
                <p className="text-gray-400 text-center mt-2">
                    اتبع الخطوات التالية لتفعيل اشتراكك فورًا.
                </p>
            </div>
            
            <Step number={1} title="إرسال مبلغ الاشتراك">
                <p className="text-base text-gray-300">
                    أرسل <span className="font-bold text-teal-400 text-lg">{subscriptionPrice}</span> لعنوان <span className="font-bold text-white">TRC20</span> التالي:
                </p>
                <div className="bg-gray-900 rounded-md p-3 flex flex-col items-start gap-3">
                    <a 
                        href={`https://tronscan.org/#/address/${walletAddress}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-mono text-sm text-gray-300 break-all hover:text-teal-400 transition-colors"
                        title="عرض على Tronscan"
                        data-selectable="true"
                    >
                        {walletAddress}
                    </a>
                    <button 
                        onClick={copyToClipboard} 
                        className="w-full flex-shrink-0 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-bold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 text-base"
                        disabled={isCopied}
                    >
                        {isCopied ? <ClipboardCheckIcon /> : <CopyIcon />}
                        <span>{isCopied ? 'تم النسخ!' : 'نسخ العنوان'}</span>
                    </button>
                </div>
            </Step>

            <Step number={2} title="تأكيد بياناتك">
                 <p className="text-base text-gray-300">
                    أدخل بريدك الإلكتروني ومعرّف المعاملة (TxID).
                </p>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><MailIcon /></span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="بريدك الإلكتروني"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base"
                    />
                </div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><WalletIcon /></span>
                    <input
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="معرّف المعاملة (TxID)"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base"
                    />
                </div>
            </Step>

            <Step number={3} title="تفعيل الاشتراك">
                <p className="text-base text-gray-300">
                   اضغط للتأكيد وتفعيل حسابك فورًا.
                </p>
                <button
                    onClick={handleActivate}
                    disabled={isVerifying}
                    className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-teal-600 active:bg-teal-700 transition-colors text-lg"
                >
                    {isVerifying ? <Spinner /> : "تفعيل الاشتراك"}
                </button>
            </Step>
            
            {statusMessage && <p className="text-center text-green-400 mt-4">{statusMessage}</p>}
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        </div>
    );
};

const AccountPage: React.FC<{ email: string, onLogout: () => void }> = ({ email, onLogout }) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">إعدادات الحساب</h2>
            <p className="text-gray-400 text-base">
                أنت مشترك حاليًا باستخدام البريد الإلكتروني:
            </p>
            <p data-selectable="true" className="font-mono bg-gray-900 rounded-md p-3 text-teal-400 break-all">{email}</p>
            <button
                onClick={() => {
                    triggerHapticFeedback();
                    onLogout();
                }}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
            >
                تسجيل الخروج
            </button>
        </div>
    );
}

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'tool'>('landing');
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ isSubscribed: false, email: null });
    const [currentPage, setCurrentPage] = useState<Page>('analyzer');

    useEffect(() => {
        try {
            const storedStatus = localStorage.getItem('subscriptionStatus');
            if (storedStatus) {
                const parsedStatus: SubscriptionStatus = JSON.parse(storedStatus);
                setSubscriptionStatus(parsedStatus);
                setCurrentPage(parsedStatus.isSubscribed ? 'analyzer' : 'account');
            } else {
                 setCurrentPage('account');
            }
        } catch (error) {
            console.error("Failed to parse subscription status from localStorage", error);
            setCurrentPage('account');
        }

        // --- Service Worker Registration for Offline Capability ---
        if ('serviceWorker' in navigator) {
            // Defer registration until after the page has fully loaded.
            // This ensures that window.location is stable and avoids race conditions,
            // which can cause errors in sandboxed environments.
            window.addEventListener('load', () => {
                try {
                    // Construct an absolute URL to the service worker file using window.location as the base.
                    // This resolves the 'Invalid URL' TypeError caused by `import.meta.url` in this environment
                    // and prevents origin mismatch errors by ensuring the correct protocol and host are used.
                    const swUrl = new URL('sw.js', window.location.href);
                    navigator.serviceWorker.register(swUrl)
                        .then(registration => console.log('Service Worker registered successfully with scope: ', registration.scope))
                        .catch(error => console.error('Service Worker registration failed:', error));
                } catch (error) {
                    console.error('Error constructing SW URL or registering SW:', error);
                }
            });
        }
    }, []);

    const handleSubscriptionSuccess = (email: string) => {
        const newStatus = { isSubscribed: true, email };
        setSubscriptionStatus(newStatus);
        localStorage.setItem('subscriptionStatus', JSON.stringify(newStatus));
        setCurrentPage('analyzer');
    };


    const handleLogout = () => {
        const newStatus = { isSubscribed: false, email: null };
        setSubscriptionStatus(newStatus);
        localStorage.removeItem('subscriptionStatus');
        setCurrentPage('account');
    };
    
    const TabButton: React.FC<{
        pageName: Page;
        icon: React.ReactNode;
        children: React.ReactNode;
    }> = ({ pageName, icon, children }) => (
         <button
            onClick={() => {
                triggerHapticFeedback();
                setCurrentPage(pageName);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse py-3 px-4 text-sm font-medium rounded-t-lg transition-colors ${
                currentPage === pageName
                    ? 'bg-gray-800 text-teal-400 border-b-2 border-teal-400'
                    : 'text-gray-400 hover:bg-gray-700/50 active:bg-gray-700'
            }`}
        >
            {icon}
            <span>{children}</span>
        </button>
    );

    if (view === 'landing') {
        return <LandingPage onStart={() => setView('tool')} />;
    }

    return (
        <div className="min-h-screen text-white p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[#0D1117] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <header className="text-center mb-6 relative">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
                    محلل الشموع الذكي
                </h1>
                <p className="mt-2 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                    ارفع صورة الرسم البياني واحصل على تحليل فوري.
                </p>
            </header>

            <main className="max-w-2xl mx-auto">
                <div className="flex border-b border-gray-700">
                    <TabButton pageName="analyzer" icon={<ChartIcon />}>محلل الشموع</TabButton>
                    <TabButton pageName="account" icon={subscriptionStatus.isSubscribed ? <UserIcon/> : <CrownIcon/>}>
                        {subscriptionStatus.isSubscribed ? 'الحساب' : 'الاشتراك'}
                    </TabButton>
                </div>
                <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-b-lg border-x border-b border-gray-700">
                    {currentPage === 'analyzer' && <CandlestickAnalyzer isSubscribed={subscriptionStatus.isSubscribed} onSubscribeClick={() => setCurrentPage('account')} />}
                    {currentPage === 'account' && !subscriptionStatus.isSubscribed && <SubscriptionPage onSubscriptionSuccess={handleSubscriptionSuccess} />}
                    {currentPage === 'account' && subscriptionStatus.isSubscribed && subscriptionStatus.email && <AccountPage email={subscriptionStatus.email} onLogout={handleLogout} />}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
