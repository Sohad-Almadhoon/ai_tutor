"use client";

import { updateCompanionAction } from "@/actions/companion.action";
import {
  companionAvatars,
  languages,
  speakingStyles,
  voiceOptions,
  voiceProviders,
} from "@/constants";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type CompanionEditFormProps = {
  companion: {
    id: number;
    name: string;
    companionIcon: string;
    voiceProvider: string;
    voiceId: string;
    language: string;
    speakingStyle: string;
    isPublic: boolean;
  };
};

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

const CompanionEditForm = ({ companion }: CompanionEditFormProps) => {
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState(companion.name);
  const [companionIcon, setCompanionIcon] = useState(companion.companionIcon);
  const [voiceProvider, setVoiceProvider] = useState(companion.voiceProvider);
  const [voiceId, setVoiceId] = useState(companion.voiceId);
  const [language, setLanguage] = useState(companion.language);
  const [styles, setStyles] = useState(
    companion.speakingStyle
      .split(",")
      .map((style) => style.trim())
      .filter(Boolean)
  );
  const [isPublic, setIsPublic] = useState(companion.isPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const availableVoices = voiceOptions.filter(
    (voice) => voice.provider === voiceProvider
  );

  const toggleStyle = (style: string) => {
    setStyles((current) =>
      current.some((selected) => selected.toLowerCase() === style.toLowerCase())
        ? current.filter(
            (selected) => selected.toLowerCase() !== style.toLowerCase()
          )
        : [...current, style]
    );
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (styles.length === 0) {
      setError("Choose at least one teaching style.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await updateCompanionAction(companion.id, {
        name,
        companionIcon,
        voiceProvider,
        voiceId,
        language,
        speakingStyle: styles.join(", "),
        isPublic,
      });
      if (!result.success) throw new Error(result.error);

      showToast("success", "Companion updated successfully.");
      router.push("/companions");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update this companion.";
      setError(message);
      showToast("error", message);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor="edit-companion-name" className="text-sm font-semibold text-slate-800">
          Companion name
        </label>
        <input
          id="edit-companion-name"
          required
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClassName}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">
          Avatar
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {companionAvatars.map((avatar) => (
            <button
              key={avatar}
              type="button"
              aria-label={`Choose ${avatar} avatar`}
              aria-pressed={companionIcon === avatar}
              onClick={() => setCompanionIcon(avatar)}
              className={`flex size-14 items-center justify-center rounded-2xl border text-2xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 ${
                companionIcon === avatar
                  ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100"
                  : "border-slate-200 bg-white hover:border-violet-300"
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">
          Teaching style
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {speakingStyles.map((style) => {
            const isSelected = styles.some(
              (selected) => selected.toLowerCase() === style.toLowerCase()
            );
            return (
              <button
                key={style}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleStyle(style)}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 ${
                  isSelected
                    ? "border-violet-300 bg-violet-50 text-violet-800"
                    : "border-slate-200 text-slate-600 hover:border-violet-200"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-companion-provider" className="text-sm font-semibold text-slate-800">
            Voice provider
          </label>
          <select
            id="edit-companion-provider"
            value={voiceProvider}
            onChange={(event) => {
              const nextProvider = event.target.value;
              setVoiceProvider(nextProvider);
              setVoiceId(
                voiceOptions.find((voice) => voice.provider === nextProvider)?.id ??
                  ""
              );
            }}
            className={fieldClassName}
          >
            {voiceProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-companion-voice" className="text-sm font-semibold text-slate-800">
            Voice
          </label>
          <select
            id="edit-companion-voice"
            value={voiceId}
            onChange={(event) => setVoiceId(event.target.value)}
            className={fieldClassName}
          >
            {availableVoices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-companion-language" className="text-sm font-semibold text-slate-800">
            Language
          </label>
          <select
            id="edit-companion-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className={fieldClassName}
          >
            {languages.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-violet-200">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          className="mt-0.5 size-4 accent-violet-600"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-800">
            Make this companion public
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Public companions can be discovered and used by other learners.
          </span>
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default CompanionEditForm;
