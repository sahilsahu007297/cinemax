import { useState } from "react";

const sections = [
  {
    title: "Account",
    items: [
      { label: "Email", value: "user@cinemax.tv" },
      { label: "Password", value: "••••••••" },
      { label: "Subscription", value: "Premium · $14.99/mo" },
    ],
  },
  {
    title: "Playback",
    items: [
      { label: "Default quality", value: "Auto (provider controlled)" },
      { label: "Autoplay next", value: "On", toggle: true },
      { label: "Audio language", value: "English" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { label: "Personalized recommendations", value: "On", toggle: true },
      { label: "Viewing activity", value: "Visible to friends" },
    ],
  },
];

export default function Settings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Autoplay next": true,
    "Personalized recommendations": true,
  });

  return (
    <div className="px-6 lg:px-10 mt-4 max-w-3xl animate-fade-in">
      <h1
        className="text-white"
        style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em" }}
      >
        Settings
      </h1>
      <p className="text-white/40 text-sm mt-1">
        Manage your account, playback, and privacy.
      </p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl glass-heavy overflow-hidden"
          >
            <div
              className="px-5 py-3.5 border-b border-white/[0.04] text-white/90"
              style={{ fontWeight: 600 }}
            >
              {section.title}
            </div>
            <div>
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] last:border-0"
                >
                  <span className="text-sm text-white/70">{item.label}</span>
                  {item.toggle ? (
                    <button
                      onClick={() =>
                        setToggles((t) => ({
                          ...t,
                          [item.label]: !t[item.label],
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                        toggles[item.label]
                          ? "bg-white shadow-lg shadow-black/40"
                          : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black shadow transition-transform duration-300 ${
                          toggles[item.label] ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="text-sm text-white/40">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
