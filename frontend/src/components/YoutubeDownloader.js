export function renderYoutubeDownloader() {
  if (!document.getElementById('yt-dl-styles')) {
    const style = document.createElement('style');
    style.id = 'yt-dl-styles';
    style.textContent = `
      .yt-dl-card {
        background: #131313;
        border: 1px solid rgba(72,72,71,0.2);
        border-radius: 0.5rem;
        padding: 22px;
        margin-bottom: 28px;
      }
      .yt-dl-title {
        color: #99f7ff;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0 0 14px 0;
      }
      .yt-dl-row {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }
      .yt-dl-input {
        flex: 1;
        background: #0e0e0e;
        border: 1px solid rgba(153,247,255,0.2);
        border-radius: 0.5rem;
        padding: 10px 14px;
        color: #fff;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s ease;
      }
      .yt-dl-input::placeholder { color: #767575; }
      .yt-dl-input:focus { border-color: #99f7ff; }
      .yt-dl-btn {
        background: rgba(153, 247, 255, 0.1);
        color: #22d3ee;
        padding: 10px 16px;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 700;
        border: 1px solid rgba(153, 247, 255, 0.2);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
        white-space: nowrap;
      }
      .yt-dl-btn:hover:not(:disabled) { background: rgba(153, 247, 255, 0.2); }
      .yt-dl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .yt-dl-status {
        margin-top: 10px;
        font-family: monospace;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        min-height: 1em;
      }
      .yt-dl-status.info { color: #99f7ff; }
      .yt-dl-status.error { color: #ff716c; }
    `;
    document.head.appendChild(style);
  }

  const card = document.createElement('div');
  card.className = 'yt-dl-card';
  card.innerHTML = `
    <h3 class="yt-dl-title">YouTube Downloader</h3>
    <div class="yt-dl-row">
      <input type="url" class="yt-dl-input" placeholder="Paste YouTube link…" autocomplete="off" />
      <button class="yt-dl-btn" type="button">[ DOWNLOAD ]</button>
    </div>
    <div class="yt-dl-status"></div>
  `;

  const input = card.querySelector('.yt-dl-input');
  const btn = card.querySelector('.yt-dl-btn');
  const status = card.querySelector('.yt-dl-status');

  const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'yt-dl-status' + (kind ? ' ' + kind : '');
  }

  function trigger() {
    const url = input.value.trim();
    if (!url) {
      setStatus('// PASTE A LINK FIRST', 'error');
      return;
    }
    if (!YT_REGEX.test(url)) {
      setStatus('// NOT A VALID YOUTUBE URL', 'error');
      return;
    }

    btn.disabled = true;
    setStatus('// FETCHING STREAM...', 'info');

    const a = document.createElement('a');
    a.href = '/api/youtube/download?url=' + encodeURIComponent(url);
    a.download = '';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      btn.disabled = false;
      setStatus('// DOWNLOAD STARTED — CHECK YOUR BROWSER', 'info');
    }, 1500);
  }

  btn.addEventListener('click', trigger);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') trigger();
  });

  return card;
}
