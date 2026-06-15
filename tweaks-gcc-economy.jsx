// tweaks-gcc-economy.jsx — lean Tweaks for the GCC peace-dividend article.
// Type + accent only. Drives CSS variables on :root.

const GCC_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#1E3A5F",
  "bodySize": 19,
  "headFont": "EB Garamond"
}/*EDITMODE-END*/;

const GCC_HEAD_FONTS = {
  "EB Garamond": '"EB Garamond", Georgia, "Times New Roman", serif',
  "Newsreader": '"Newsreader", Georgia, "Times New Roman", serif',
  "Archivo": '"Archivo", "Helvetica Neue", Arial, sans-serif'
};

function applyGccTweaks(t) {
  const root = document.documentElement;
  root.style.setProperty('--tw-accent', t.accent || '#1E3A5F');
  root.style.setProperty('--tw-bodysize', (t.bodySize || 19) + 'px');
  root.style.setProperty('--tw-headfont', GCC_HEAD_FONTS[t.headFont] || GCC_HEAD_FONTS["EB Garamond"]);
}

function GccTweaks() {
  const [t, setTweak] = useTweaks(GCC_TWEAKS);
  React.useEffect(() => { applyGccTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Type" />
      <TweakSlider label="Body size" value={t.bodySize} min={17} max={23} step={1} unit="px"
        onChange={(v) => setTweak('bodySize', v)} />
      <TweakSelect label="Headline font" value={t.headFont}
        options={["EB Garamond", "Newsreader", "Archivo"]}
        onChange={(v) => setTweak('headFont', v)} />
      <TweakSection label="Accent" />
      <TweakColor label="Accent" value={t.accent}
        options={["#1E3A5F", "#1F6F6B", "#7A2E2A", "#3A2E66"]}
        onChange={(v) => setTweak('accent', v)} />
    </TweaksPanel>
  );
}

(function mountGccTweaks() {
  const mount = document.getElementById('tweaks-root');
  if (mount && window.ReactDOM && window.useTweaks) {
    ReactDOM.createRoot(mount).render(<GccTweaks />);
  }
})();
