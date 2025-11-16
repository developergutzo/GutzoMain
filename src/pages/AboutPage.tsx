import { useRouter } from "../components/Router";
import { useEffect } from "react";
import { ImageWithFallback } from "../components/common/ImageWithFallback";

export function AboutPage() {
  const { navigate } = useRouter();

  // Ensure page starts at top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <button
                  type="button"
                  aria-label="Go to homepage"
                  onClick={() => navigate('/')}
                  className="p-0 bg-transparent border-0 inline-flex items-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
                >
                  <ImageWithFallback
                    src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
                    alt="Gutzo - Healthy Feels Good"
                    className="h-32 w-auto sm:h-36 md:h-40"
                  />
                </button>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">About Us</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content - Minimal About */}
      <main className="max-w-3xl mx-auto px-6 sm:px-6 lg:px-8 pt-4 lg:pt-2 pb-4">
        <div className="w-full mx-auto text-center mt-2 sm:mt-2 lg:mt-0 relative overflow-hidden">
          {/* Background image (subtle, emotional) */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=60')",
              filter: 'brightness(0.96) contrast(0.86) saturate(0.6)',
            }}
          />

          {/* Soft white overlay to keep content readable and fade toward bottom */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.94) 55%)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Content (above background) */}
          <div className="relative z-10 px-4 py-6 lg:py-8">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-0"
              style={{ fontFamily: 'Poppins', color: 'var(--color-gutzo-selected, var(--gutzo-selected))' }}
            >
              Who we are
            </h1>
            <p className="text-sm text-gray-500 sm:text-gray-600 mb-2">We’re here to make healthy eating simple and local.</p>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 sm:p-6 space-y-3 text-gray-700 w-full max-w-[600px] sm:max-w-[500px] lg:max-w-[600px] mx-auto mt-2">
              <div className="text-center leading-8">
                <div className="space-y-1 mb-4">
                  <p className="m-0 text-lg font-semibold">We are a small team that cares about one thing:</p>
                  <p className="m-0 text-base font-normal">making healthy eating feel easy.</p>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="m-0 text-base font-normal">We started Gutzo because finding clean and honest food</p>
                  <p className="m-0 text-base font-normal">felt difficult every single day.</p>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="m-0 text-lg font-semibold">So we built a simple place for better choices.</p>
                  <p className="m-0 text-base font-normal">Trusted restaurants.</p>
                  <p className="m-0 text-base font-normal">Clear information.</p>
                  <p className="m-0 text-base font-normal">No confusion.</p>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="m-0 text-lg font-semibold">We believe good food should feel natural, not stressful.</p>
                  <p className="m-0 text-base font-normal">Local, honest and made for people who want to take care of themselves.</p>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="m-0 text-lg font-semibold">This is who we are.</p>
                  <p className="m-0 text-base font-normal">And we are growing one city at a time, starting with Coimbatore.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copilot prompt for simplifying the page (paste into Copilot Chat) */}
        {/*
        "Rewrite the About Us page to be minimal, clean, and easy to scan.
        Remove long paragraphs, reduce clutter, and keep the page focused on a short founder story + a clear purpose.

        Apply the following:

        • Use a short headline + small subtitle
        • Add the minimal About Us content below (I will paste it)
        • Increase white space around sections to avoid text overload
        • Keep the layout simple, neutral, and lightweight
        • No heavy descriptions, no long storytelling blocks
        • Limit text to 3–4 short paragraphs max
        • Make sure everything is readable, calm, and not overwhelming

        This is an informational page — not a marketing page.
        */}
      </main>
    </div>
  );
}
