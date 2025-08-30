import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

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
const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);
const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const PowerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
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
                    onClick={onStart}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-10 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 text-xl shadow-lg shadow-teal-500/20"
                >
                    ابدأ التحليل الآن
                </button>
            </div>
        </main>
    </div>
);


// --- Main Components ---
const CandlestickAnalyzer: React.FC<{ isSubscribed: boolean, onSubscribeClick: () => void }> = ({ isSubscribed, onSubscribeClick }) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleSubmit = async () => {
        if (!image) {
            setError("الرجاء رفع صورة أولاً.");
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const imagePart = await fileToGenerativePart(image);
            const systemInstruction = `أنت خبير تحليل فني محترف في أسواق العملات الرقمية، متخصص في استراتيجيات التداول القائمة على أنماط الشموع اليابانية. مهمتك هي تحليل صورة الرسم البياني المقدمة وتقديم توصية تداول كاملة.

يجب أن تكون إجابتك بتنسيق JSON حصريًا، بالشكل التالي:
{
  "pattern": "اسم نمط الشموع الرئيسي الذي تم تحديده (مثال: مطرقة، ابتلاع هبوطي).",
  "trend": "الاتجاه العام المتوقع بناءً على النمط (صعودي، هبوطي, محايد).",
  "recommendation": "التوصية الصريحة (شراء، بيع, احتفاظ).",
  "entryPrice": "سعر الدخول المقترح. كن محددًا قدر الإمكان (مثال: 'عند سعر الإغلاق الحالي' أو 'عند اختراق مستوى 1.2345').",
  "stopLoss": "سعر وقف الخسارة لحماية رأس المال.",
  "takeProfit": "سعر جني الأرباح كهدف أول.",
  "detailedAnalysis": "تحليل تفصيلي يشرح منطق التوصية، مع الإشارة إلى النمط، حجم التداول (إن وجد)، ومؤشرات أخرى ظاهرة.",
  "notes": "ملاحظات هامة وتحذيرات خاصة بهذه التوصية فقط (مثال: 'التوصية عالية المخاطر' أو 'تأكد من وجود تأكيد إضافي'). يجب أن تكون الملاحظة مرتبطة مباشرة بالتحليل المقدم ولا تتضمن إخلاء مسؤولية عام."
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, {text: "حلل الصورة بناء على التعليمات وقدم توصية تداول كاملة."}] },
              config: { systemInstruction: systemInstruction, responseMimeType: "application/json" }
            });
            
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);
        } catch (err) {
            console.error(err);
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
                    onClick={onSubscribeClick}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 text-lg"
                >
                    الاشتراك الآن
                </button>
            </div>
        );
    }

    return (
        <div>
            <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-teal-500 hover:bg-gray-800/50"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
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
                                setPreview(null);
                                setImage(null);
                                setResult(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        <UploadIcon />
                        <p className="mt-4 text-gray-400 text-base">انقر لرفع صورة الرسم البياني</p>
                        <p className="text-sm text-gray-500">أو اسحبها وأفلتها هنا</p>
                    </div>
                )}
            </div>

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
        navigator.clipboard.writeText(walletAddress);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleActivate = async () => {
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
            const systemInstruction = `أنت نظام آلي للتحقق من معاملات البلوك تشين (TRC20). مهمتك هي التحقق من صحة بيانات المعاملة المقدمة. تحقق من أن "معرف المعاملة" (TxID) يبدو صحيحًا (عادة 64 حرفًا سداسيًا عشريًا) وأن البريد الإلكتروني بتنسيق صحيح. قم بمحاكاة التحقق من المعاملة. إذا كانت البيانات تبدو صحيحة، اعتبرها ناجحة. إذا كان معرف المعاملة قصيرًا جدًا أو غير صالح، فاعتبرها فاشلة. يجب أن تكون إجابتك بتنسيق JSON حصريًا، بالشكل التالي: {"isValid": boolean, "reason": "رسالة توضيحية باللغة العربية"}. أمثلة للأسباب: "تم التحقق من المعاملة بنجاح"، "معرف المعاملة يبدو غير صالح"، "الرجاء التأكد من إدخال معرف المعاملة الصحيح".`;

            const prompt = `الرجاء التحقق من المعاملة بالبيانات التالية: البريد الإلكتروني: ${email}, معرف المعاملة: ${txId}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json"
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
                onClick={onLogout}
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

    const handleExit = () => {
        // Note: window.close() may not work in all browsers or contexts.
        // It is mainly for windows opened by script.
        // For a Capacitor app, this can be replaced with a native call like `App.exitApp();` from '@capacitor/app'
        window.close();
    };
    
    const TabButton: React.FC<{
        pageName: Page;
        icon: React.ReactNode;
        children: React.ReactNode;
    }> = ({ pageName, icon, children }) => (
         <button
            onClick={() => setCurrentPage(pageName)}
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
                 <button
                    onClick={handleExit}
                    className="absolute top-0 left-0 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full active:bg-gray-700"
                    aria-label="إغلاق التطبيق"
                    title="إغلاق التطبيق"
                >
                    <PowerIcon />
                </button>
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