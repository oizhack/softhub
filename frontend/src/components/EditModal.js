function toDirectDownload(url) {
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFile) return `https://drive.google.com/uc?export=download&id=${driveFile[1]}`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpen) return `https://drive.google.com/uc?export=download&id=${driveOpen[1]}`;
  const sheets = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheets) return `https://docs.google.com/spreadsheets/d/${sheets[1]}/export?format=xlsx`;
  const docs = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docs) return `https://docs.google.com/document/d/${docs[1]}/export?format=docx`;
  const slides = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slides) return `https://docs.google.com/presentation/d/${slides[1]}/export/pptx`;
  return url;
}

export function showEditModal({ item, categories, onUpdate }) {
  document.getElementById('edit-modal')?.remove();

  if (!document.getElementById('edit-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'edit-modal-styles';
    style.textContent = `
      #edit-modal { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
      .em-card-outer { max-width: 560px; width: 100%; background: linear-gradient(135deg, rgba(251,191,36,0.3), transparent, rgba(251,191,36,0.08)); padding: 1px; border-radius: 0.75rem; box-shadow: 0 0 24px rgba(251,191,36,0.12); position: relative; }
      .em-card-inner { background: #1a1a1a; border-radius: calc(0.75rem - 1px); padding: 2rem; position: relative; }
      .em-close-btn { position: absolute; top: 0.75rem; right: 0.75rem; background: transparent; border: none; color: #adaaaa; cursor: pointer; line-height: 1; transition: color 0.2s; }
      .em-close-btn:hover { color: #fbbf24; }
      .em-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; margin-top: 1.5rem; }
      @media (max-width: 600px) { .em-form-grid { grid-template-columns: 1fr; } }
      .em-form-grid .full-width { grid-column: 1 / -1; }
      .em-form-group { display: flex; flex-direction: column; gap: 0.25rem; }
      .em-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #adaaaa; font-family: 'Inter', sans-serif; display: block; }
      .em-error { color: #ff716c; font-size: 0.75rem; text-align: center; margin-top: 0.25rem; display: none; }
      .em-submit-btn { width: 100%; padding: 0.7rem; background: linear-gradient(to right, #fbbf24, #f59e0b); color: #422006; font-family: 'Space Grotesk', sans-serif; font-weight: 900; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; border: none; border-radius: 0.375rem; cursor: pointer; transition: filter 0.2s; box-shadow: 0 0 16px rgba(251,191,36,0.2); }
      .em-submit-btn:hover { filter: brightness(1.1); }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.id = 'edit-modal';

  const cardOuter = document.createElement('div');
  cardOuter.className = 'em-card-outer';

  const cardInner = document.createElement('div');
  cardInner.className = 'em-card-inner';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'em-close-btn';
  closeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.5rem;">close</span>';
  cardInner.appendChild(closeBtn);

  // Header
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;';
  headerRow.innerHTML = '<div style="height:2px;width:2rem;background:#fbbf24;flex-shrink:0;"></div><span style="font-size:10px;letter-spacing:0.2em;color:#fbbf24;font-weight:700;text-transform:uppercase;">Software Registry</span>';
  cardInner.appendChild(headerRow);

  const title = document.createElement('h2');
  title.style.cssText = "font-family:'Space Grotesk',sans-serif;font-size:1.75rem;font-weight:900;letter-spacing:-0.04em;color:#fff;margin:0;";
  title.textContent = 'EDIT SOFTWARE';
  cardInner.appendChild(title);

  // Form
  const form = document.createElement('form');
  form.className = 'em-form-grid';

  const fields = [
    { name: 'name',        label: 'Software Name', type: 'text',     required: true },
    { name: 'version',     label: 'Version',        type: 'text',     required: false },
    { name: 'url',         label: 'Download URL',   type: 'url',      required: true,  cls: 'full-width' },
    { name: 'category',    label: 'Category',       type: 'select',   required: true },
    { name: 'description', label: 'Description',    type: 'textarea', required: false, cls: 'full-width' },
  ];

  const inputs = {};
  fields.forEach(field => {
    const group = document.createElement('div');
    group.className = `em-form-group${field.cls ? ' ' + field.cls : ''}`;

    const label = document.createElement('label');
    label.className = 'em-label';
    label.textContent = field.label;
    group.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      input.className = 'vault-select';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        if (cat === item.category) opt.selected = true;
        input.appendChild(opt);
      });
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'vault-textarea';
      input.value = item[field.name] || '';
    } else {
      input = document.createElement('input');
      input.type = field.type;
      input.className = 'vault-input';
      input.value = item[field.name] || '';
    }
    input.name = field.name;
    inputs[field.name] = input;
    group.appendChild(input);

    if (field.name === 'url') {
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        input.value = toDirectDownload(pasted.trim());
      });
      const hint = document.createElement('span');
      hint.style.cssText = 'font-size:9px;color:#484847;font-family:Inter,sans-serif;margin-top:2px;';
      hint.textContent = 'Google Drive share links are converted automatically';
      group.appendChild(hint);
    }

    form.appendChild(group);
  });

  const errorMsg = document.createElement('p');
  errorMsg.className = 'em-error full-width';
  form.appendChild(errorMsg);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'em-submit-btn full-width';
  submitBtn.style.cssText = 'width:auto;padding-left:2.5rem;padding-right:2.5rem;';
  submitBtn.textContent = 'UPDATE SOFTWARE';
  form.appendChild(submitBtn);

  cardInner.appendChild(form);
  cardOuter.appendChild(cardInner);
  overlay.appendChild(cardOuter);

  const handleClose = () => {
    document.removeEventListener('keydown', handleEscape);
    overlay.remove();
  };
  const handleEscape = (e) => { if (e.key === 'Escape') handleClose(); };

  overlay.addEventListener('click', (e) => { if (e.target === overlay) handleClose(); });
  closeBtn.addEventListener('click', handleClose);
  document.addEventListener('keydown', handleEscape);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';
    const data = {
      name:        inputs.name.value.trim(),
      version:     inputs.version.value.trim(),
      url:         toDirectDownload(inputs.url.value.trim()),
      category:    inputs.category.value,
      description: inputs.description.value.trim(),
    };
    if (!data.name || !data.url || !data.category) {
      errorMsg.textContent = '// NAME, URL and CATEGORY are required';
      errorMsg.style.display = 'block';
      return;
    }
    try {
      await onUpdate(item.id, data);
      handleClose();
    } catch (err) {
      errorMsg.textContent = err.message || '// UPDATE FAILED';
      errorMsg.style.display = 'block';
    }
  });

  document.body.appendChild(overlay);
  inputs.name.focus();
}
