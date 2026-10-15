(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/AppBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AppBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SignOutButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SignOutButton.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// The bar across the top of every signed-in page: brand, who you are, where
// else you can go, and the way out. One component so the header cannot drift
// from page to page, and so "sign out" is never the thing someone forgot.
const ROLE_LABEL = {
    STUDENT: "Student",
    TEACHER: "Teacher",
    PARENT: "Parent"
};
const ROLE_CLASS = {
    STUDENT: "rolechip rolechip-student",
    TEACHER: "rolechip rolechip-teacher",
    PARENT: "rolechip rolechip-parent"
};
// Where each role's own home lives, used for the brand link.
const HOME = {
    STUDENT: "/dashboard",
    TEACHER: "/teacher",
    PARENT: "/parent"
};
function AppBar({ links = [], wide = false }) {
    _s();
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const role = session?.user?.role ?? "";
    const name = session?.user?.name ?? session?.user?.email ?? null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: wide ? "appbar appbar-wide" : "appbar",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: HOME[role] ?? "/",
                className: "appbar-brand",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    src: "/logo.png",
                    alt: "ThinkKraft",
                    width: 132,
                    height: 44,
                    className: "appbar-logo",
                    priority: true
                }, void 0, false, {
                    fileName: "[project]/app/components/AppBar.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/AppBar.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "appbar-links",
                children: [
                    role && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: ROLE_CLASS[role] ?? "rolechip",
                        children: [
                            ROLE_LABEL[role] ?? role,
                            name ? ` · ${name}` : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/AppBar.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    links.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: l.href,
                            className: "btn-ghost btn-sm",
                            children: l.label
                        }, l.href, false, {
                            fileName: "[project]/app/components/AppBar.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SignOutButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/components/AppBar.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/AppBar.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/AppBar.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_s(AppBar, "xGqsfA9Yc4bug2CeORcyTsHwvXY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = AppBar;
var _c;
__turbopack_context__.k.register(_c, "AppBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/SignOutButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SignOutButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
"use client";
;
;
function SignOutButton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        className: "btn-danger btn-sm",
        onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])({
                callbackUrl: "/"
            }),
        children: "Sign out"
    }, void 0, false, {
        fileName: "[project]/app/components/SignOutButton.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = SignOutButton;
var _c;
__turbopack_context__.k.register(_c, "SignOutButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/workspace/HintPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HintPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
// A hint that asks a question is one the child can answer. Milo's level-1
// nudges are written as questions on purpose, so this is most of them.
function isQuestion(text) {
    return text.trim().endsWith("?");
}
function HintPanel({ studentId, lessonId, captureProject, onApproved }) {
    _s();
    const [attempts, setAttempts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [good, setGood] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hints, setHints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Tips the child has closed. The server stamps them so they stay closed on
    // any device, and the stream stops sending them; this list only covers the
    // moment between the click and the next poll.
    const [dismissed, setDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [replyTo, setReplyTo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reply, setReply] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const seen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    // onApproved is called from inside the stream handler, which is set up once.
    // Holding it in a ref keeps the latest one without reopening the connection
    // every time the parent re-renders.
    const announce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onApproved);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HintPanel.useEffect": ()=>{
            announce.current = onApproved;
        }
    }["HintPanel.useEffect"], [
        onApproved
    ]);
    // Live stream of approved hints via Server-Sent Events. The browser opens one
    // connection and receives each hint the moment a teacher approves it.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HintPanel.useEffect": ()=>{
            if (!studentId) return;
            // No studentId in the URL: the stream serves whoever the session says you
            // are, so one child cannot listen in on another's hints. lessonId only
            // narrows it to the lesson on screen.
            const source = new EventSource(`/api/hints/stream?lessonId=${encodeURIComponent(lessonId)}`);
            source.onmessage = ({
                "HintPanel.useEffect": (event)=>{
                    const hint = JSON.parse(event.data);
                    if (seen.current.has(hint.id)) return;
                    seen.current.add(hint.id);
                    setHints({
                        "HintPanel.useEffect": (prev)=>{
                            // The same wording twice is not a second tip, whatever its id.
                            if (prev.some({
                                "HintPanel.useEffect": (h)=>h.text === hint.text
                            }["HintPanel.useEffect"])) return prev;
                            return [
                                {
                                    id: hint.id,
                                    text: hint.text,
                                    level: hint.level
                                },
                                ...prev
                            ];
                        }
                    }["HintPanel.useEffect"]);
                    setStatus(null);
                    setGood(false);
                    // Only a tip that has just come through the gate is worth interrupting
                    // for. Catching up on old ones when the page opens is not news.
                    // Only a tip that has just come through is worth interrupting for, and
                    // what it says depends on who let it through. Claiming a teacher
                    // approved something no teacher ever saw is a small lie about the one
                    // promise this product makes.
                    if (!hint.backlog) announce.current(hint.text, hint.autoApproved === true);
                }
            })["HintPanel.useEffect"];
            source.onerror = ({
                "HintPanel.useEffect": ()=>{
                // The browser auto-reconnects on a dropped connection; nothing to do here.
                }
            })["HintPanel.useEffect"];
            return ({
                "HintPanel.useEffect": ()=>source.close()
            })["HintPanel.useEffect"];
        // Reconnect if the child moves to a different lesson, so the panel follows.
        }
    }["HintPanel.useEffect"], [
        studentId,
        lessonId
    ]);
    async function dismiss(id) {
        // Hide it at once: a child pressing the close button should see it go,
        // not wait on a round trip.
        setDismissed((prev)=>[
                ...prev,
                id
            ]);
        if (replyTo === id) setReplyTo(null);
        try {
            await fetch("/api/hints/dismiss", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    hintId: id
                })
            });
        } catch  {
        // It stays closed for this session either way, and the card is not
        // worth an error message to a ten-year-old.
        }
    }
    async function checkWork() {
        setBusy(true);
        setGood(false);
        setStatus("Milo is looking at your blocks...");
        try {
            // Take the project as it is right now, rather than whatever was last
            // uploaded: a tip about stale blocks is worse than no tip.
            const sb3Ref = await captureProject();
            if (!sb3Ref) {
                setStatus("Milo could not read your project. Give the editor a moment, then try again.");
                return;
            }
            const next = attempts + 1;
            setAttempts(next);
            const res = await fetch("/api/hints/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lessonId,
                    sb3Ref,
                    attempts: next
                })
            });
            if (!res.ok) {
                setStatus("Milo could not look at your project just now. Try again in a moment.");
                return;
            }
            const r = await res.json();
            if (r.correct) {
                setGood(true);
                setStatus("Nice work. That looks right.");
            } else if (r.status === "sent") {
                // No teacher is online, so the tip is already on its way rather than
                // sitting in a queue nobody is reading.
                setStatus("Milo has a tip for you, just below.");
            } else if (r.status === "already") {
                setStatus("Milo has already told you about this one. His tip is below.");
            } else if (r.status === "pending") {
                setStatus("Milo has a tip for you. Your teacher is just checking it first.");
            } else {
                setStatus("Keep going.");
            }
        } catch  {
            setStatus("Something went wrong. Try again in a moment.");
        } finally{
            setBusy(false);
        }
    }
    async function sendReply(hintId) {
        const answer = reply.trim();
        if (!answer) return;
        setSending(true);
        try {
            const res = await fetch("/api/hints/reply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    hintId,
                    answer
                })
            });
            if (!res.ok) {
                setStatus("Milo could not read that just now. Try again in a moment.");
                return;
            }
            const r = await res.json();
            // A question about something other than their project. Milo says so
            // himself; nothing was sent to the AI and nothing was filed.
            if (r.status === "out-of-scope") {
                setReplyTo(null);
                setReply("");
                setGood(false);
                setStatus(r.reply);
                return;
            }
            setReplyTo(null);
            setReply("");
            setGood(false);
            // Even an answer goes through the teacher. Say so, rather than leaving a
            // child waiting for a reply that is sitting in a queue.
            setStatus(r.status === "sent" ? "Milo read your answer. His reply is just below." : r.status === "already" ? "Milo has already answered that one. His tip is below." : "Milo read your answer. Your teacher is checking his reply first.");
        } catch  {
            setStatus("Something went wrong. Try again in a moment.");
        } finally{
            setSending(false);
        }
    }
    const visible = hints.filter((h)=>!dismissed.includes(h.id));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel hints",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hints-head",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hints-who",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hints-avatar",
                                "aria-hidden": "true",
                                children: "✦"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hints-who-text",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hints-name",
                                        children: "Milo"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 224,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hints-sub",
                                        children: "your coding buddy"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 225,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/workspace/HintPanel.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hints-actions",
                        children: [
                            visible.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hints-count",
                                children: [
                                    visible.length,
                                    " tip",
                                    visible.length === 1 ? "" : "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-solid",
                                onClick: checkWork,
                                disabled: busy,
                                children: busy ? "Checking..." : "Check my work"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/workspace/HintPanel.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/workspace/HintPanel.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: good ? "hint-status hint-status-good" : "hint-status",
                role: "status",
                children: status
            }, void 0, false, {
                fileName: "[project]/app/workspace/HintPanel.tsx",
                lineNumber: 242,
                columnNumber: 9
            }, this),
            visible.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "hint-empty",
                children: [
                    "No tips yet. Press ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                        children: "Check my work"
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/HintPanel.tsx",
                        lineNumber: 252,
                        columnNumber: 30
                    }, this),
                    " whenever you want Milo to look at your blocks, and he will also say something if you get stuck. Your teacher reads every tip before it reaches you."
                ]
            }, void 0, true, {
                fileName: "[project]/app/workspace/HintPanel.tsx",
                lineNumber: 251,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hint-list",
                children: visible.map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: i === 0 ? "hint-card hint-card-latest" : "hint-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hint-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "hint-text",
                                        children: h.text
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 264,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "hint-close",
                                        onClick: ()=>void dismiss(h.id),
                                        "aria-label": "Close this tip",
                                        title: "Close this tip",
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 265,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 263,
                                columnNumber: 15
                            }, this),
                            isQuestion(h.text) && replyTo !== h.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-ghost btn-sm hint-answer",
                                onClick: ()=>{
                                    setReplyTo(h.id);
                                    setReply("");
                                },
                                children: "Answer Milo"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 277,
                                columnNumber: 17
                            }, this),
                            replyTo === h.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hint-reply",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "hint-reply-label",
                                        htmlFor: `reply-${h.id}`,
                                        children: "Tell Milo what you think"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 290,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        id: `reply-${h.id}`,
                                        className: "input hint-reply-input",
                                        // The child just asked for this box. Put the cursor in it,
                                        // which also brings it into view inside the scrolling list.
                                        autoFocus: true,
                                        value: reply,
                                        maxLength: 300,
                                        rows: 2,
                                        placeholder: "I think I need a block that...",
                                        onChange: (e)=>setReply(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 293,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hint-reply-actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-solid btn-sm",
                                                onClick: ()=>sendReply(h.id),
                                                disabled: sending || reply.trim().length === 0,
                                                children: sending ? "Sending..." : "Send"
                                            }, void 0, false, {
                                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                                lineNumber: 306,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-ghost btn-sm",
                                                onClick: ()=>setReplyTo(null),
                                                disabled: sending,
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                                lineNumber: 313,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/workspace/HintPanel.tsx",
                                        lineNumber: 305,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/HintPanel.tsx",
                                lineNumber: 289,
                                columnNumber: 17
                            }, this)
                        ]
                    }, h.id, true, {
                        fileName: "[project]/app/workspace/HintPanel.tsx",
                        lineNumber: 259,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/workspace/HintPanel.tsx",
                lineNumber: 257,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/workspace/HintPanel.tsx",
        lineNumber: 215,
        columnNumber: 5
    }, this);
}
_s(HintPanel, "VimAKj9t53RUvR4b/5v5o0WKAOc=");
_c = HintPanel;
var _c;
__turbopack_context__.k.register(_c, "HintPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/workspace/SkillsCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SkillsCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
// The enum stored against a skill, as a child should read it.
const WORD = {
    NOT_STARTED: "not started",
    LEARNING: "needs help",
    PRACTISING: "getting there",
    MASTERED: "confident"
};
const NAME = {
    events: "Starting your project",
    sequencing: "Putting steps in order",
    motion: "Making things move",
    loops: "Repeating things",
    conditionals: "Making choices",
    variables: "Remembering numbers"
};
function SkillsCard({ studentId, lessonId }) {
    _s();
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SkillsCard.useCallback[load]": async ()=>{
            try {
                const res = await fetch(`/api/learner/${encodeURIComponent(studentId)}`);
                if (!res.ok) return;
                const body = await res.json();
                setRows(body.rows ?? []);
            } catch  {
            // The skills card is not worth an error message on the workspace. A
            // child who cannot see it can still build and still get hints.
            }
        }
    }["SkillsCard.useCallback[load]"], [
        studentId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SkillsCard.useEffect": ()=>{
            // Through a timer so the effect never sets state synchronously.
            const first = setTimeout({
                "SkillsCard.useEffect.first": ()=>void load()
            }["SkillsCard.useEffect.first"], 0);
            return ({
                "SkillsCard.useEffect": ()=>clearTimeout(first)
            })["SkillsCard.useEffect"];
        }
    }["SkillsCard.useEffect"], [
        load
    ]);
    async function learnThis() {
        setBusy(true);
        try {
            const res = await fetch("/api/learner/next", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentId,
                    lessonId
                })
            });
            if (res.ok) {
                setStep(await res.json());
                setOpen(true);
            }
        } catch  {
        // Same again: a failed suggestion is not a reason to interrupt them.
        } finally{
            setBusy(false);
        }
    }
    const known = (rows ?? []).filter((r)=>r.attempts > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "panel skills",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hints-head",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hints-who",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hints-avatar",
                                "aria-hidden": "true",
                                children: "★"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hints-who-text",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hints-name",
                                        children: "My skills"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                                        lineNumber: 101,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hints-sub",
                                        children: "what you are getting good at"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 100,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hints-actions",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn-solid",
                            onClick: ()=>void learnThis(),
                            disabled: busy,
                            children: busy ? "Looking..." : "Learn this"
                        }, void 0, false, {
                            fileName: "[project]/app/workspace/SkillsCard.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/workspace/SkillsCard.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            known.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "hint-empty",
                children: [
                    "Nothing here yet. Press ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                        children: "Check my work"
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 114,
                        columnNumber: 35
                    }, this),
                    " and this fills in as you build."
                ]
            }, void 0, true, {
                fileName: "[project]/app/workspace/SkillsCard.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "skill-list",
                children: known.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "skill-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "skill-name",
                                children: NAME[r.skill] ?? r.skill
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 121,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `skill-level skill-${r.level.toLowerCase()}`,
                                children: WORD[r.level] ?? "getting there"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 122,
                                columnNumber: 15
                            }, this)
                        ]
                    }, r.skill, true, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 120,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/workspace/SkillsCard.tsx",
                lineNumber: 118,
                columnNumber: 9
            }, this),
            open && step && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "skill-step",
                children: [
                    step.action === "advance" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "hint-status hint-status-good",
                        children: "Nothing to catch up on. Keep going with your project."
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 133,
                        columnNumber: 13
                    }, this) : step.content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "skill-step-title",
                                children: step.content.name
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 138,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "skill-step-text",
                                children: step.content.micro_lesson.explanation
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 139,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "skill-step-text skill-step-example",
                                children: step.content.micro_lesson.worked_example
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 142,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "skill-task",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "thread-who",
                                        children: "Try this"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                                        lineNumber: 146,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "skill-step-text",
                                        children: step.content.practice.prompt
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                                        lineNumber: 147,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/SkillsCard.tsx",
                                lineNumber: 145,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 137,
                        columnNumber: 13
                    }, this) : // The planner decided, but the content has not been approved, so
                    // there is nothing to show. Same rule as a hint.
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "hint-status",
                        children: "Milo has an idea for what to work on next. Your teacher is checking it first."
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 153,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-ghost btn-sm skill-close",
                        onClick: ()=>setOpen(false),
                        children: "Close"
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/SkillsCard.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/workspace/SkillsCard.tsx",
                lineNumber: 131,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/workspace/SkillsCard.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
_s(SkillsCard, "wmda+DvBL8u7pkAdhojVcaP6I00=");
_c = SkillsCard;
var _c;
__turbopack_context__.k.register(_c, "SkillsCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/workspace/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkspacePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$workspace$2f$HintPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/workspace/HintPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$workspace$2f$SkillsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/workspace/SkillsCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$AppBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/AppBar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function WorkspaceContent() {
    _s();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])() || {
        data: null,
        status: "unauthenticated"
    };
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    // The Student row id, not the User id. Every studentId foreign key points at
    // this one. It is used here only to decide what to render: the API routes
    // read it from the session themselves and ignore anything the page sends.
    const studentId = session?.user?.studentId;
    const role = session?.user?.role;
    const lessonId = searchParams.get("lessonId") || "";
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [err, setErr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // --- NEW: UI/UX STATE ---
    const [isAnalyzing, setIsAnalyzing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Helper to trigger a toast that auto-hides after 4 seconds
    const showToast = (message, type = 'info')=>{
        setToast({
            message,
            type
        });
        setTimeout(()=>setToast(null), 4000);
    };
    const iframeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Requests for the editor's project, waiting on their reply. The editor
    // answers with the requestId it was given, so two overlapping requests cannot
    // be confused for each other.
    const sb3Waiters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    // Ask the editor to zip up what the child has on screen, then store it.
    //
    // This is what makes "check my work" work without the child exporting a file
    // by hand: the VM can serialise itself, so the hint is about the blocks that
    // are actually there right now. Returns the stored project's ref, or null.
    async function captureProject() {
        const frame = iframeRef.current?.contentWindow;
        if (!frame || !lessonId) return null;
        const requestId = crypto.randomUUID();
        const reply = await new Promise((resolve)=>{
            sb3Waiters.current.set(requestId, resolve);
            // The editor may still be booting, and a child should not be left
            // waiting on a promise that never settles.
            const timeout = setTimeout(()=>{
                sb3Waiters.current.delete(requestId);
                resolve(null);
            }, 15000);
            sb3Waiters.current.set(requestId, (r)=>{
                clearTimeout(timeout);
                resolve(r);
            });
            frame.postMessage({
                type: "REQUEST_SB3",
                requestId
            }, window.location.origin);
        });
        if (!reply || reply.error || !reply.buffer) return null;
        const form = new FormData();
        form.append("file", new Blob([
            reply.buffer
        ]), "project.sb3");
        form.append("lessonId", lessonId);
        const res = await fetch("/api/projects", {
            method: "POST",
            body: form
        }).then((r)=>r.json()).catch(()=>null);
        if (!res || res.error) return null;
        return res.project.sb3Ref;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WorkspaceContent.useEffect": ()=>{
            const handleIframeMessage = {
                "WorkspaceContent.useEffect.handleIframeMessage": async (event)=>{
                    // The editor is served from this same origin, so anything from elsewhere
                    // is not our editor. This is the only thing standing between a child's
                    // activity feed and any other page that can reach this window.
                    if (event.origin !== window.location.origin) return;
                    // The editor handing back a project we asked for.
                    if (event.data && event.data.type === 'PROJECT_SB3') {
                        const waiter = sb3Waiters.current.get(event.data.requestId);
                        if (waiter) {
                            sb3Waiters.current.delete(event.data.requestId);
                            waiter({
                                buffer: event.data.buffer,
                                error: event.data.error
                            });
                        }
                        return;
                    }
                    // Live activity from the embedded Scratch editor. The bridge in
                    // public/scratch-editor/index.html sends one of the four kinds the
                    // monitor understands; lessonId is added here, and studentId comes from
                    // the session inside /api/activity, never from the page.
                    if (event.data && event.data.source === 'thinkkraft-editor') {
                        if (!lessonId) return;
                        try {
                            await fetch('/api/activity', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    lessonId,
                                    kind: event.data.kind
                                })
                            });
                        } catch (error) {
                            // Losing an activity event is not worth interrupting the child.
                            console.error('Activity forward failed:', error);
                        }
                        return;
                    }
                    if (event.data && event.data.type === 'PROJECT_SAVED') {
                        if (!studentId || !lessonId) return;
                        setIsAnalyzing(true); // Turn on the loader!
                        try {
                            const res = await fetch('/api/hints/proactive', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    lessonId
                                })
                            });
                            const data = await res.json();
                            if (data.created && data.created.length > 0) {
                                // Turn off loader and show success toast!
                                setIsAnalyzing(false);
                                showToast("AI noticed you might be stuck! Hint sent to your teacher for approval.", "success");
                            } else {
                                // Silently finish if no hint was needed
                                setIsAnalyzing(false);
                            }
                        } catch (error) {
                            console.error("Proactive check failed:", error);
                            setIsAnalyzing(false);
                        }
                    }
                }
            }["WorkspaceContent.useEffect.handleIframeMessage"];
            window.addEventListener('message', handleIframeMessage);
            const syncInterval = setInterval({
                "WorkspaceContent.useEffect.syncInterval": ()=>{
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        // Same origin, so name it rather than broadcasting with "*".
                        iframeRef.current.contentWindow.postMessage({
                            type: 'REQUEST_SAVE'
                        }, window.location.origin);
                    }
                }
            }["WorkspaceContent.useEffect.syncInterval"], 30000);
            return ({
                "WorkspaceContent.useEffect": ()=>{
                    window.removeEventListener('message', handleIframeMessage);
                    clearInterval(syncInterval);
                }
            })["WorkspaceContent.useEffect"];
        }
    }["WorkspaceContent.useEffect"], [
        studentId,
        lessonId
    ]);
    // Security Check
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WorkspaceContent.useEffect": ()=>{
            if (status === "unauthenticated") {
                router.push("/login");
            } else if (status === "authenticated" && role !== "STUDENT") {
                router.push("/");
            }
        }
    }["WorkspaceContent.useEffect"], [
        status,
        role,
        router
    ]);
    async function save() {
        setErr(null);
        setMsg(null);
        if (!studentId || !lessonId) {
            setErr("Missing student or lesson information.");
            return;
        }
        if (!file) {
            setErr("Choose your saved .sb3 file first.");
            return;
        }
        const form = new FormData();
        form.append("file", file);
        form.append("lessonId", lessonId);
        const res = await fetch("/api/projects", {
            method: "POST",
            body: form
        }).then((r)=>r.json());
        if (res.error) {
            setErr(typeof res.error === "string" ? res.error : "That upload was rejected.");
            return;
        }
        setMsg(`Saved. Project id: ${res.project.id}`);
    }
    if (status === "loading") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$AppBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/workspace/page.tsx",
                    lineNumber: 210,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "shell",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading workspace..."
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 211,
                        columnNumber: 33
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/workspace/page.tsx",
                    lineNumber: 211,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/workspace/page.tsx",
            lineNumber: 209,
            columnNumber: 7
        }, this);
    }
    if (!studentId) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$AppBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                wide: true,
                links: [
                    {
                        href: "/dashboard",
                        label: "My lessons"
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/app/workspace/page.tsx",
                lineNumber: 220,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "shell-wide",
                children: [
                    toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: toast.type === 'success' ? 'panel-flat toast toast-success' : 'panel-flat toast',
                        children: toast.message
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 225,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "workspace-head",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "Build your project"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 237,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "workspace-meta",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rolechip",
                                        children: [
                                            "Lesson ",
                                            lessonId || "not chosen"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/workspace/page.tsx",
                                        lineNumber: 239,
                                        columnNumber: 11
                                    }, this),
                                    isAnalyzing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted thinking",
                                        children: "Milo is looking at your blocks"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/page.tsx",
                                        lineNumber: 241,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 238,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 236,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel panel-frame",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                            ref: iframeRef,
                            src: "/scratch-editor/index.html",
                            className: "editor-frame",
                            title: "ThinkKraft Scratch Editor"
                        }, void 0, false, {
                            fileName: "[project]/app/workspace/page.tsx",
                            lineNumber: 247,
                            columnNumber: 9
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 246,
                        columnNumber: 7
                    }, this),
                    studentId && lessonId && // Keyed by lesson so moving to another one starts a fresh panel rather
                    // than leaving the previous lesson's tips on screen.
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$workspace$2f$HintPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        studentId: studentId,
                        lessonId: lessonId,
                        captureProject: captureProject,
                        onApproved: (text, autoApproved)=>showToast(autoApproved ? `Milo sent you a tip: ${text}` : `Your teacher approved a tip: ${text}`, "success")
                    }, `hints-${lessonId}`, false, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this),
                    studentId && lessonId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$workspace$2f$SkillsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        studentId: studentId,
                        lessonId: lessonId
                    }, `skills-${lessonId}`, false, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 280,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "panel-title",
                                children: "Save your project"
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 284,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "muted panel-note",
                                children: [
                                    "Use ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: [
                                            "File ",
                                            '>',
                                            " Save to your computer"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/workspace/page.tsx",
                                        lineNumber: 286,
                                        columnNumber: 15
                                    }, this),
                                    " in the editor above, then choose that file here. Milo already looks at your blocks when you press",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: "Check my work"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/page.tsx",
                                        lineNumber: 288,
                                        columnNumber: 11
                                    }, this),
                                    ", so this is just for keeping a copy."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 285,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "save-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: ".sb3",
                                        className: "input-file",
                                        onChange: (e)=>setFile(e.target.files?.[0] ?? null)
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/page.tsx",
                                        lineNumber: 291,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn-solid",
                                        onClick: save,
                                        children: "Save project"
                                    }, void 0, false, {
                                        fileName: "[project]/app/workspace/page.tsx",
                                        lineNumber: 297,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 290,
                                columnNumber: 9
                            }, this),
                            err && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "notice notice-error panel-msg",
                                children: err
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 301,
                                columnNumber: 17
                            }, this),
                            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "notice notice-ok panel-msg",
                                children: msg
                            }, void 0, false, {
                                fileName: "[project]/app/workspace/page.tsx",
                                lineNumber: 302,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/workspace/page.tsx",
                        lineNumber: 283,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/workspace/page.tsx",
                lineNumber: 223,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/workspace/page.tsx",
        lineNumber: 219,
        columnNumber: 5
    }, this);
}
_s(WorkspaceContent, "5ACRn/JDe1R5FmPMG0NXQLc3VYU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = WorkspaceContent;
function WorkspacePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "shell",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Loading workspace..."
            }, void 0, false, {
                fileName: "[project]/app/workspace/page.tsx",
                lineNumber: 311,
                columnNumber: 49
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/workspace/page.tsx",
            lineNumber: 311,
            columnNumber: 25
        }, this),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WorkspaceContent, {}, void 0, false, {
            fileName: "[project]/app/workspace/page.tsx",
            lineNumber: 312,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/workspace/page.tsx",
        lineNumber: 311,
        columnNumber: 5
    }, this);
}
_c1 = WorkspacePage;
var _c, _c1;
__turbopack_context__.k.register(_c, "WorkspaceContent");
__turbopack_context__.k.register(_c1, "WorkspacePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_1hfnn_l._.js.map