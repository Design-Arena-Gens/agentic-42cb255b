/* Simple UI controls for the logo page */
(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const colorInputs = {
    primary: document.getElementById('colorPrimary'),
    accent: document.getElementById('colorAccent'),
    dark: document.getElementById('colorDark'),
    light: document.getElementById('colorLight'),
  };
  const resetBtn = document.getElementById('resetColors');
  const toggleThemeBtn = document.getElementById('toggleTheme');
  const logoImg = document.getElementById('logoImg');

  const defaults = {
    primary: '#0ea5e9',
    accent: '#22d3ee',
    dark: '#0b1220',
    light: '#e6f6ff',
  };

  // Apply colors to :root CSS variables so variants update
  function applyColors() {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colorInputs.primary.value);
    root.style.setProperty('--color-accent', colorInputs.accent.value);
    root.style.setProperty('--color-dark', colorInputs.dark.value);
    root.style.setProperty('--color-light', colorInputs.light.value);
    // Also recolor the inline SVG by query param replacement
    if (logoImg) {
      const url = new URL(logoImg.src, window.location.href);
      url.searchParams.set('p', colorInputs.primary.value.replace('#', ''));
      url.searchParams.set('a', colorInputs.accent.value.replace('#', ''));
      url.searchParams.set('d', colorInputs.dark.value.replace('#', ''));
      url.searchParams.set('l', colorInputs.light.value.replace('#', ''));
      // Prevent flicker by swapping once loaded
      const tmp = new Image();
      tmp.onload = () => { logoImg.src = tmp.src; };
      tmp.src = url.toString();
    }
  }

  Object.values(colorInputs).forEach((input) => {
    if (input) input.addEventListener('input', applyColors);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      colorInputs.primary.value = defaults.primary;
      colorInputs.accent.value = defaults.accent;
      colorInputs.dark.value = defaults.dark;
      colorInputs.light.value = defaults.light;
      applyColors();
    });
  }

  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-bg');
    });
  }

  // PNG download via canvas render
  const downloadPngBtn = document.getElementById('downloadPng');
  if (downloadPngBtn && logoImg) {
    downloadPngBtn.addEventListener('click', async () => {
      try {
        // Fetch current SVG as text (including customized query params)
        const res = await fetch(logoImg.src, { cache: 'no-cache' });
        const svgText = await res.text();
        // Create blob URL for image
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const scale = 4; // export at 4x for crisp PNG
          const size = 256 * scale;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff00'; // transparent
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          URL.revokeObjectURL(svgUrl);
          canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = 'agentic-logo.png';
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          }, 'image/png');
        };
        img.src = svgUrl;
      } catch (e) {
        console.error(e);
        alert('PNG export failed. Try again.');
      }
    });
  }

  // Initialize once
  applyColors();
})();

