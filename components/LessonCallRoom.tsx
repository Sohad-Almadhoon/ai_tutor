"use client";

import {
  abandonLessonSessionAction,
  completeLessonSessionAction,
  startLessonSessionAction,
} from "@/actions/lesson-session.action";
import Vapi from "@vapi-ai/web";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  UserRound,
} from "lucide-react";
import { voiceOptions } from "@/constants";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ToastProvider";

type LessonCallVoice = (typeof voiceOptions)[number];

type LessonCallCompanion = {
  id: number;
  name: string;
  description: string;
  companionIcon: string;
  language: string;
  speakingStyle: string;
  voice: LessonCallVoice;
};

type LessonCallRoomProps = {
  lesson: {
    id: number;
    name: string;
    topic: string;
    subject: string;
    targetDurationMinutes: number;
  };
  companions: LessonCallCompanion[];
  defaultCompanionId: number | null;
  publicKey: string;
  assistantId: string;
};

type TranscriptEntry = {
  role: "user" | "assistant";
  text: string;
};

function getVapiVoiceOverride(voice: LessonCallVoice) {
  switch (voice.provider) {
    case "11labs":
      return { provider: voice.provider, voiceId: voice.id };
    case "openai":
      return { provider: voice.provider, voiceId: voice.id };
    case "deepgram":
      return { provider: voice.provider, voiceId: voice.id };
  }
}

function getVoiceErrorMessage(
  error: unknown,
  fallback: string,
  depth = 0
): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error !== "object" || error === null || depth >= 3) {
    return fallback;
  }

  for (const key of ["msg", "message", "error", "details"]) {
    const value = Reflect.get(error, key);
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "object" && value !== null) {
      const message = getVoiceErrorMessage(value, "", depth + 1);
      if (message) return message;
    }
  }

  return fallback;
}

const LessonCallRoom = ({
  lesson,
  companions,
  defaultCompanionId,
  publicKey,
  assistantId,
}: LessonCallRoomProps) => {
  const showToast = useToast();
  const [selectedCompanionId, setSelectedCompanionId] = useState(
    defaultCompanionId && companions.some(({ id }) => id === defaultCompanionId)
      ? defaultCompanionId
      : (companions[0]?.id ?? 0)
  );
  const [callState, setCallState] = useState<
    "idle" | "starting" | "connected" | "ending"
  >("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [notice, setNotice] = useState("");
  const vapiRef = useRef<Vapi | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const finishedSessionRef = useRef(false);
  const startCancelledRef = useRef(false);
  const desiredSessionStatusRef = useRef<"COMPLETED" | "ABANDONED">(
    "COMPLETED"
  );
  const selectedCompanion = companions.find(
    ({ id }) => id === selectedCompanionId
  );
  const configured = Boolean(publicKey && assistantId);

  const finishSession = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (sessionId === null || finishedSessionRef.current) return;

    finishedSessionRef.current = true;
    try {
      const result =
        desiredSessionStatusRef.current === "COMPLETED"
          ? await completeLessonSessionAction(sessionId, transcriptRef.current)
          : await abandonLessonSessionAction(sessionId, transcriptRef.current);
      if (!result.success) throw new Error(result.error);

      sessionIdRef.current = null;
      setNotice(
        desiredSessionStatusRef.current === "COMPLETED"
          ? "Lesson session saved to My Journey."
          : "Lesson session marked as abandoned."
      );
      if (desiredSessionStatusRef.current === "COMPLETED") {
        showToast("success", "Lesson session saved to My Journey.");
      }
    } catch (finishError) {
      finishedSessionRef.current = false;
      const message =
        finishError instanceof Error
          ? finishError.message
          : "The lesson session could not be saved.";
      setError(message);
      showToast("error", message);
    }
  }, [showToast]);

  useEffect(() => {
    if (!configured) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;
    startCancelledRef.current = false;

    vapi.on("call-start", () => {
      setCallState("connected");
      setError("");
      showToast("success", "Voice lesson connected.");
    });
    vapi.on("call-end", () => {
      setCallState("idle");
      setIsSpeaking(false);
      void finishSession();
    });
    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));
    vapi.on("message", (message: unknown) => {
      if (typeof message !== "object" || message === null) return;
      const event = message as {
        type?: unknown;
        role?: unknown;
        transcript?: unknown;
        transcriptType?: unknown;
      };
      if (
        event.type !== "transcript" ||
        (event.transcriptType && event.transcriptType !== "final") ||
        (event.role !== "user" && event.role !== "assistant") ||
        typeof event.transcript !== "string"
      ) {
        return;
      }

      const role: TranscriptEntry["role"] =
        event.role === "user" ? "user" : "assistant";
      const text = event.transcript;
      if (typeof text !== "string") return;
      const nextTranscript = [...transcriptRef.current, { role, text }];
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
    });
    vapi.on("call-start-failed", (event) => {
      desiredSessionStatusRef.current = "ABANDONED";
      const message = getVoiceErrorMessage(
        event.error,
        "The voice call could not be started."
      );
      setError(message);
      showToast("error", message);
      void finishSession();
      void vapi.stop().catch((stopError) => {
        console.error("Failed to stop Vapi call after startup failure:", stopError);
      });
    });
    vapi.on("error", (event) => {
      const message = getVoiceErrorMessage(
        event,
        "A voice connection error occurred. Please try again."
      );
      setError(message);
      showToast("error", message);
    });

    return () => {
      startCancelledRef.current = true;
      desiredSessionStatusRef.current = "ABANDONED";
      void finishSession();
      void vapi.stop().catch((stopError) => {
        console.error("Failed to stop Vapi call during cleanup:", stopError);
      });
      vapi.removeAllListeners();
      vapiRef.current = null;
    };
  }, [configured, finishSession, publicKey, showToast]);

  const startCall = async () => {
    const vapi = vapiRef.current;
    if (!vapi || !selectedCompanion || callState !== "idle") return;

    setError("");
    setNotice("");
    setTranscript([]);
    transcriptRef.current = [];
    setCallState("starting");
    startCancelledRef.current = false;
    finishedSessionRef.current = false;
    desiredSessionStatusRef.current = "COMPLETED";

    try {
      const sessionResult = await startLessonSessionAction(
        lesson.id,
        selectedCompanion.id
      );
      if (!sessionResult.success) throw new Error(sessionResult.error);
      sessionIdRef.current = sessionResult.data.id;
      if (startCancelledRef.current) {
        desiredSessionStatusRef.current = "ABANDONED";
        await finishSession();
        return;
      }

      const call = await vapi.start(assistantId, {
        voice: getVapiVoiceOverride(selectedCompanion.voice),
        variableValues: {
          lessonName: lesson.name,
          lessonTopic: lesson.topic,
          lessonSubject: lesson.subject,
          targetDurationMinutes: String(lesson.targetDurationMinutes),
          companionName: selectedCompanion.name,
          companionDescription: selectedCompanion.description,
          companionLanguage: selectedCompanion.language,
          speakingStyle: selectedCompanion.speakingStyle,
        },
      });
      if (!call) throw new Error("Vapi did not create a voice call.");
    } catch (startError) {
      desiredSessionStatusRef.current = "ABANDONED";
      const message = getVoiceErrorMessage(
        startError,
        "The voice call could not be started."
      );
      setError(message);
      showToast("error", message);
      await finishSession();
      try {
        await vapi.stop();
      } catch (stopError) {
        console.error("Failed to stop Vapi after the call could not start:", stopError);
      } finally {
        setCallState("idle");
      }
    }
  };

  const endCall = async () => {
    const vapi = vapiRef.current;
    if (!vapi || callState !== "connected") return;
    setCallState("ending");
    try {
      await vapi.stop();
      await finishSession();
      setIsSpeaking(false);
      setCallState("idle");
    } catch (stopError) {
      setCallState("connected");
      const message = getVoiceErrorMessage(
        stopError,
        "The call could not be ended cleanly."
      );
      setError(message);
      showToast("error", message);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-6 py-7 sm:px-8">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white bg-white text-3xl shadow-sm">
            {selectedCompanion?.companionIcon ?? <UserRound aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
              Voice lesson
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {selectedCompanion
                ? `Learn with ${selectedCompanion.name}`
                : "Choose a learning companion"}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Start a live voice conversation about {lesson.topic}.
            </p>
          </div>
          <span
            className={`hidden shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex ${
              callState === "connected"
                ? "bg-emerald-50 text-emerald-700"
                : callState === "starting" || callState === "ending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {callState === "connected"
              ? "Connected"
              : callState === "starting"
                ? "Connecting"
                : callState === "ending"
                  ? "Ending call"
                  : "Ready"}
          </span>
        </div>

        {companions.length > 1 && (
          <label className="mt-6 block max-w-md text-sm font-semibold text-slate-700">
            Choose your tutor
            <select
              value={selectedCompanionId}
              onChange={(event) => setSelectedCompanionId(Number(event.target.value))}
              disabled={callState !== "idle"}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100"
            >
              {companions.map((companion) => (
                <option key={companion.id} value={companion.id}>
                  {companion.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="px-6 py-6 sm:px-8">
        {!configured && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-900"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>
              Vapi is not configured yet. Add the public key and assistant ID
              to the environment to enable voice lessons.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-5 text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="mb-5 flex items-center gap-2 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {notice}
          </p>
        )}

        {sessionIdRef.current !== null && callState === "idle" && (
          <button
            type="button"
            onClick={() => void finishSession()}
            className="mb-5 text-sm font-semibold text-violet-700 underline underline-offset-4 hover:text-violet-900"
          >
            Retry saving this session
          </button>
        )}

        <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-7 text-center">
          <span
            className={`flex size-16 items-center justify-center rounded-full transition ${
              isSpeaking
                ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                : callState === "connected"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-slate-400 shadow-sm"
            }`}
          >
            {isSpeaking ? (
              <Mic className="size-7" aria-hidden="true" />
            ) : (
              <MicOff className="size-7" aria-hidden="true" />
            )}
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-800">
            {callState === "connected"
              ? isSpeaking
                ? "Your tutor is speaking"
                : "You’re connected. Go ahead and speak."
              : callState === "starting"
                ? "Connecting to your tutor…"
                : callState === "ending"
                  ? "Saving your session…"
                  : "Allow microphone access when your browser asks."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {lesson.targetDurationMinutes} minute lesson · You can end the call
            whenever you&apos;re ready
          </p>

          {callState === "connected" || callState === "ending" ? (
            <button
              type="button"
              onClick={endCall}
              disabled={callState === "ending"}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-wait disabled:opacity-70"
            >
              {callState === "ending" ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <PhoneOff className="size-4" aria-hidden="true" />
              )}
              End lesson
            </button>
          ) : (
            <button
              type="button"
              onClick={startCall}
              disabled={!configured || !selectedCompanion || callState === "starting"}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {callState === "starting" ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Phone className="size-4" aria-hidden="true" />
              )}
              {callState === "starting" ? "Connecting…" : "Start voice lesson"}
            </button>
          )}
        </div>

        {transcript.length > 0 && (
          <div
            aria-live="polite"
            className="mt-6 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Recent conversation
            </h3>
            {transcript.slice(-12).map((entry, index) => (
              <p
                key={`${index}-${entry.role}`}
                className={`text-sm leading-5 ${
                  entry.role === "assistant"
                    ? "text-slate-800"
                    : "text-violet-800"
                }`}
              >
                <span className="font-semibold">
                  {entry.role === "assistant"
                    ? selectedCompanion?.name ?? "Tutor"
                    : "You"}
                  :
                </span>{" "}
                {entry.text}
              </p>
            ))}
          </div>
        )}

        <Link
          href="/lessons"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to lessons
        </Link>
      </div>
    </section>
  );
};

export default LessonCallRoom;
