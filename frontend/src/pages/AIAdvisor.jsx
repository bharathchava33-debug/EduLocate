
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AIAdvisor() {
    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "ai",
            text: "Hello! I'm your EduLocate AI Education Advisor. 🎓",
        },
        {
            id: 2,
            type: "ai",
            text: "Ask me about schools, junior colleges, diploma, engineering or degree courses. I'll understand your answers and guide you step by step.",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Stores the user's answers during this conversation
    const [advisorData, setAdvisorData] = useState({
        topic: "",
        educationLevel: "",
        marks: "",
        rank: "",
        stream: "",
        branch: "",
        location: "",
        budget: "",
        board: "",
        stage: "",
    });

    const quickQuestions = [
        "My child got 88% in 10th class. Which junior colleges are suitable?",
        "I got rank 25000 in EAMCET. Suggest engineering colleges.",
        "Find CBSE schools in Hyderabad.",
        "What is the difference between JNTU and Osmania University?",
    ];

    // Check whether a message contains a percentage
    const getPercentage = (text) => {
        const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
        return match ? match[1] : "";
    };

    // Check whether a message contains a number
    const getNumber = (text) => {
        const match = text.match(/\b\d{1,6}\b/);
        return match ? match[0] : "";
    };

    // AI RESPONSE
    const generateResponse = (question, previousData) => {
        const q = question.toLowerCase().trim();

        let data = { ...previousData };
        let reply = "";

        // ------------------------------------------------
        // 1. DIRECT EDUCATIONAL QUESTIONS
        // ------------------------------------------------

        if (
            q.includes("what is mpc") ||
            q.includes("meaning of mpc") ||
            q.includes("mpc means")
        ) {
            return {
                data,
                reply:
                    "MPC stands for Mathematics, Physics and Chemistry.\n\n" +
                    "It is an Intermediate stream for students interested in engineering, technology, mathematics and physical sciences.\n\n" +
                    "After MPC, you can consider courses such as B.Tech, B.Sc, BCA and other eligible degree programmes.",
            };
        }

        if (
            q.includes("what is bipc") ||
            q.includes("meaning of bipc")
        ) {
            return {
                data,
                reply:
                    "BiPC stands for Biology, Physics and Chemistry.\n\n" +
                    "It is suitable for students interested in biology, healthcare, medicine and life sciences.\n\n" +
                    "Possible future courses include MBBS, BDS, B.Pharmacy, Nursing and B.Sc programmes, depending on eligibility.",
            };
        }

        if (
            q.includes("what is eamcet") ||
            q.includes("what is eapcet")
        ) {
            return {
                data,
                reply:
                    "EAPCET (previously commonly called EAMCET) is an entrance examination used for admission to eligible professional courses in Telangana and Andhra Pradesh.\n\n" +
                    "Your rank, category, preferred branch and counselling options can affect college allotment.",
            };
        }

        if (
            q.includes("difference between jntu") ||
            q.includes("jntu and osmania") ||
            q.includes("osmania university")
        ) {
            return {
                data,
                reply:
                    "JNTU and Osmania University are different universities in Telangana.\n\n" +
                    "JNTU is known for its technology and engineering programmes. Osmania University offers a wider range of programmes, including arts, sciences, commerce and engineering.\n\n" +
                    "The better option depends on your course, college, curriculum and career goals.",
            };
        }

        // ------------------------------------------------
        // 2. IDENTIFY THE EDUCATION TOPIC
        // ------------------------------------------------

        if (
            q.includes("junior college") ||
            q.includes("intermediate") ||
            q.includes("10th class") ||
            q.includes("10th standard")
        ) {
            data.topic = "junior";
            data.educationLevel = "inter_college";

            const percentage = getPercentage(q);

            if (percentage) {
                data.marks = percentage + "%";
            }

            if (q.includes("mpc")) data.stream = "MPC";
            if (q.includes("bipc")) data.stream = "BiPC";
            if (q.includes("mec")) data.stream = "MEC";
            if (q.includes("cec")) data.stream = "CEC";
            if (q.includes("hec")) data.stream = "HEC";

            if (!data.stream) {
                data.stage = "stream";

                reply =
                    `I have recorded your Class 10 result${data.marks ? " of " + data.marks : ""}.\n\n` +
                    "Which Intermediate stream are you interested in?\n\n" +
                    "• MPC\n" +
                    "• BiPC\n" +
                    "• MEC\n" +
                    "• CEC\n" +
                    "• HEC\n\n" +
                    "Tell me your preferred stream.";
            } else {
                data.stage = "location";
                reply =
                    `You selected ${data.stream}.`;

                if (data.marks) {
                    reply += ` Your Class 10 result is ${data.marks}.`;
                }

                reply += "\n\nWhich city or district are you looking for?";
            }

            return { data, reply };
        }

        if (
            q.includes("engineering college") ||
            q.includes("engineering admission") ||
            q.includes("eamcet") ||
            q.includes("eapcet")
        ) {
            data.topic = "engineering";
            data.educationLevel = "engineering";

            const rank = q.match(/rank\s*[:\-]?\s*(\d+)/);

            if (rank) {
                data.rank = rank[1];
            } else if (q.includes("rank")) {
                data.rank = getNumber(q);
            }

            if (!data.rank) {
                data.stage = "rank";

                reply =
                    "I can help you explore engineering colleges.\n\n" +
                    "What is your EAMCET/EAPCET rank?";
            } else {
                data.stage = "branch";

                reply =
                    `Your entrance rank is ${data.rank}.\n\n` +
                    "Which engineering branch are you interested in?\n\n" +
                    "For example: CSE, ECE, EEE, Civil or Mechanical.";
            }

            return { data, reply };
        }

        if (
            q.includes("diploma college") ||
            q.includes("polytechnic") ||
            q === "diploma"
        ) {
            data.topic = "diploma";
            data.educationLevel = "diploma";
            data.stage = "branch";

            reply =
                "I can help you find diploma colleges.\n\n" +
                "Which diploma branch are you interested in?\n\n" +
                "For example: CME, ECE, EEE, Civil or Mechanical.";

            return { data, reply };
        }

        if (
            q.includes("school") ||
            q.includes("cbse") ||
            q.includes("icse")
        ) {
            data.topic = "school";
            data.educationLevel = "school";

            if (q.includes("cbse")) data.board = "CBSE";
            else if (q.includes("icse")) data.board = "ICSE";
            else if (q.includes("state board")) data.board = "State";

            data.stage = "location";

            reply =
                `I can help you find ${data.board ? data.board + " " : ""}schools.\n\n` +
                "Which city or district should I search in?";

            return { data, reply };
        }

        if (
            q.includes("degree college") ||
            q.includes("bsc") ||
            q.includes("bcom") ||
            q.includes("bca") ||
            q.includes("degree course")
        ) {
            data.topic = "degree";
            data.educationLevel = "degree";
            data.stage = "course";

            reply =
                "I can help you explore degree colleges.\n\n" +
                "Which degree course are you interested in?\n\n" +
                "For example: B.Sc, B.Com, BCA or BA.";

            return { data, reply };
        }

        // ------------------------------------------------
        // 3. UNDERSTAND SHORT ANSWERS USING CHAT CONTEXT
        // ------------------------------------------------

        // User selects an Intermediate stream
        const streams = ["mpc", "bipc", "mec", "cec", "hec"];

        if (data.topic === "junior" && streams.includes(q)) {
            data.stream = q.toUpperCase();
            data.stage = "location";

            reply =
                `Understood! Your selected stream is ${data.stream}.\n\n` +
                "Which city or district are you looking for?";

            return { data, reply };
        }

        // User provides EAMCET rank
        if (
            data.topic === "engineering" &&
            data.stage === "rank" &&
            /^\d+$/.test(q)
        ) {
            data.rank = q;
            data.stage = "branch";

            reply =
                `Your EAMCET/EAPCET rank is ${q}.\n\n` +
                "Which engineering branch do you prefer?";

            return { data, reply };
        }

        // User provides engineering branch
        if (
            data.topic === "engineering" &&
            data.stage === "branch"
        ) {
            data.branch = question.toUpperCase();
            data.stage = "location";

            reply =
                `Your preferred branch is ${data.branch}.\n\n` +
                "Which city or district do you prefer?";

            return { data, reply };
        }

        // User provides diploma branch
        if (
            data.topic === "diploma" &&
            data.stage === "branch"
        ) {
            data.branch = question.toUpperCase();
            data.stage = "location";

            reply =
                `Your preferred diploma branch is ${data.branch}.\n\n` +
                "Which city or district are you looking for?";

            return { data, reply };
        }

        // User provides degree course
        if (
            data.topic === "degree" &&
            data.stage === "course"
        ) {
            data.branch = question.toUpperCase();
            data.stage = "location";

            reply =
                `You are interested in ${question}.\n\n` +
                "Which city or district do you prefer?";

            return { data, reply };
        }

        // User provides marks in a junior college conversation
        if (
            data.topic === "junior" &&
            (q.includes("mark") || /^\d+$/.test(q))
        ) {
            const number = getNumber(q);

            if (number) {
                data.marks = number;

                data.stage = "marks_confirmation";

                reply =
                    `I received ${number} as your marks.\n\n` +
                    "Are these Intermediate marks or Class 10 marks? Also tell me the total marks (for example, 892 out of 1000).";
            } else {
                reply =
                    "Please share your marks clearly. For example, 892 out of 1000 or 88%.";
            }

            return { data, reply };
        }

        // User confirms marks
        if (
            data.topic === "junior" &&
            data.stage === "marks_confirmation"
        ) {
            data.stage = "location";

            reply =
                "Thank you for clarifying your marks.\n\n" +
                "Which city or district should I consider for junior colleges?";

            return { data, reply };
        }

        // User provides location
        if (
            data.topic &&
            data.stage === "location" &&
            !/^\d+$/.test(q)
        ) {
            data.location = question.trim();
            data.stage = "budget";

            reply =
                `Your preferred location is ${data.location}.\n\n` +
                "What is your maximum annual college or school fee budget? You can also say 'No fixed budget'.";

            return { data, reply };
        }

        // User provides budget
        if (
            data.topic &&
            data.stage === "budget"
        ) {
            data.budget = question.trim();
            data.stage = "complete";

            reply =
                "Thank you! I have collected your requirements:\n\n" +
                `• Education type: ${data.educationLevel}\n` +
                `${data.stream ? "• Stream: " + data.stream + "\n" : ""}` +
                `${data.branch ? "• Course/Branch: " + data.branch + "\n" : ""}` +
                `${data.marks ? "• Marks: " + data.marks + "\n" : ""}` +
                `${data.rank ? "• Entrance rank: " + data.rank + "\n" : ""}` +
                `${data.board ? "• Board: " + data.board + "\n" : ""}` +
                `• Location: ${data.location}\n` +
                `• Budget: ${data.budget}\n\n` +
                "These details can be used to find matching institutions in EduLocate. I won't suggest college names until they are checked against the institution database.";

            return { data, reply };
        }

        // ------------------------------------------------
        // 4. FOLLOW-UP QUESTIONS ABOUT THE CURRENT TOPIC
        // ------------------------------------------------

        if (data.topic === "junior" && q.includes("course")) {
            reply =
                "For Intermediate, the main streams are:\n\n" +
                "• MPC – Mathematics, Physics and Chemistry\n" +
                "• BiPC – Biology, Physics and Chemistry\n" +
                "• MEC – Mathematics, Economics and Commerce\n" +
                "• CEC – Civics, Economics and Commerce\n" +
                "• HEC – History, Economics and Civics\n\n" +
                "Which stream would you like to know more about?";

            return { data, reply };
        }

        if (data.topic === "engineering" && q.includes("branch")) {
            reply =
                "Common engineering branches include:\n\n" +
                "• CSE – Computer Science and Engineering\n" +
                "• ECE – Electronics and Communication Engineering\n" +
                "• EEE – Electrical and Electronics Engineering\n" +
                "• Mechanical Engineering\n" +
                "• Civil Engineering\n\n" +
                "Which branch are you interested in?";

            return { data, reply };
        }

        // ------------------------------------------------
        // 5. IF THE MESSAGE DOES NOT MATCH THE CURRENT TOPIC
        // ------------------------------------------------

        if (data.topic && data.stage === "location" && /^\d+$/.test(q)) {
            reply =
                `I received ${question}.\n\n` +
                "Are these marks, a rank or a location PIN code? I still need your preferred city or district.";

            return { data, reply };
        }

        reply =
            "I can help with that education-related question. Could you tell me a little more about what you want to know?\n\n" +
            "For example, you can ask about admission, courses, eligibility, fees, college types or university differences.";

        return { data, reply };
    };

    // SEND MESSAGE
    const sendMessage = (question = input) => {
        const text = question.trim();

        if (!text || loading) return;

        const userMessage = {
            id: Date.now(),
            type: "user",
            text,
        };

        setMessages((previous) => [...previous, userMessage]);
        setInput("");
        setLoading(true);

        // Use the previous conversation details
        const result = generateResponse(text, advisorData);

        setTimeout(() => {
            setAdvisorData(result.data);

            setMessages((previous) => [
                ...previous,
                {
                    id: Date.now() + 1,
                    type: "ai",
                    text: result.reply,
                },
            ]);

            setLoading(false);
        }, 500);
    };

    // ENTER KEY
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#eef2ff]">

            {/* HEADER */}
            <header className="h-[80px] flex-shrink-0 border-b border-slate-200 bg-white shadow-sm">
                <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-800 text-xl text-white shadow-md">
                            🎓
                        </div>

                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                                EduLocate
                            </h1>
                            <p className="text-xs text-slate-500">
                                AI Education Advisor
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/search")}
                        className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:px-5"
                    >
                        <span>←</span>
                        <span>Back to Search</span>
                    </button>

                </div>
            </header>

            {/* CHAT AREA */}
            <main className="flex min-h-0 flex-1 flex-col">

                <div className="flex-1 overflow-y-auto px-5 py-8 lg:px-8">
                    <div className="mx-auto max-w-7xl">

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-6 flex gap-4 ${
                                    message.type === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                {message.type === "ai" && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                                        🤖
                                    </div>
                                )}

                                <div
                                    className={`max-w-5xl whitespace-pre-line rounded-2xl px-5 py-4 leading-relaxed shadow-sm ${
                                        message.type === "ai"
                                            ? "border border-slate-100 bg-white text-slate-800"
                                            : "bg-blue-700 text-white"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="mb-6 flex gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                                    🤖
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* QUICK QUESTIONS */}
                <div className="border-t border-slate-200 bg-white px-5 py-4 lg:px-8">
                    <div className="mx-auto max-w-7xl">

                        <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                            <span>✧</span>
                            <span>Quick starts</span>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendMessage(question)}
                                    disabled={loading}
                                    className="max-w-[460px] flex-shrink-0 truncate rounded-full border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
                                    title={question}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* INPUT */}
                <div className="border-t border-slate-200 bg-white px-5 py-5 lg:px-8">
                    <div className="mx-auto max-w-7xl">

                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask an education-related question..."
                                className="h-[60px] flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />

                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className={`flex h-[60px] w-[60px] items-center justify-center rounded-2xl text-xl transition ${
                                    input.trim() && !loading
                                        ? "bg-blue-800 text-white shadow-lg hover:bg-blue-900"
                                        : "cursor-not-allowed bg-slate-300 text-white"
                                }`}
                            >
                                ➤
                            </button>
                        </div>

                        <p className="mt-3 text-center text-xs text-slate-400">
                            College recommendations must be verified using EduLocate institution records.
                        </p>

                    </div>
                </div>

            </main>
        </div>
    );
}

export default AIAdvisor;
