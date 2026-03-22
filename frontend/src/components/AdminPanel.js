export function renderAdminPanel(onAdd, onLogout, categories = [], onAddCategory, onDeleteCategory, allSoftware = [], onDelete) {
  const existingStyle = document.getElementById('admin-styles');
  if (existingStyle) existingStyle.remove();

  const style = document.createElement('style');
  style.id = 'admin-styles';
  style.textContent = `
    .admin-panel { background: #1a1a1a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 2rem; }
    .admin-bento-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
    @media (max-width: 768px) { .admin-bento-grid { grid-template-columns: 1fr; } }
    .admin-section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .admin-section-accent { width: 3px; height: 1.25rem; background: #99f7ff; display: inline-block; flex-shrink: 0; }
    .admin-section-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; font-weight: 700; color: #99f7ff; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
    .admin-card { background: #131313; border-radius: 0.5rem; padding: 1rem; }
    .vault-input, .vault-select, .vault-textarea { width: 100%; background: #000; border: 1px solid rgba(72,72,71,0.3); border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #fff; font-family: 'Inter', sans-serif; font-size: 0.8rem; outline: none; transition: all 0.3s; box-sizing: border-box; }
    .vault-input:focus, .vault-select:focus, .vault-textarea:focus { box-shadow: 0 0 10px rgba(153,247,255,0.2); border-color: transparent; }
    .vault-textarea { resize: vertical; min-height: 60px; }
    .vault-select { appearance: none; }
    .vault-btn-primary { width: 100%; padding: 0.65rem; background: linear-gradient(to right, #99f7ff, #00f1fe); color: #004145; font-family: 'Space Grotesk', sans-serif; font-weight: 900; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 16px rgba(0,241,254,0.2); }
    .vault-btn-primary:hover { filter: brightness(1.1); }
    .vault-btn-secondary { background: transparent; border: 1px solid rgba(153,247,255,0.3); color: #99f7ff; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.45rem 0.75rem; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .vault-btn-secondary:hover { background: rgba(153,247,255,0.1); }
    .category-chip { background: #262626; border-radius: 9999px; padding: 0.2rem 0.625rem; font-size: 0.7rem; color: #adaaaa; display: inline-flex; align-items: center; gap: 0.25rem; font-family: 'Inter', sans-serif; }
    .category-chip-del { background: transparent; border: none; color: #adaaaa; cursor: pointer; font-size: 0.9rem; line-height: 1; padding: 0 2px; }
    .category-chip-del:hover { color: #ff716c; }
    .chips-container { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 0.75rem; }
    .admin-form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .admin-form-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #adaaaa; font-family: 'Inter', sans-serif; display: block; }
    .admin-software-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
    @media (max-width: 768px) { .admin-software-form { grid-template-columns: 1fr; } }
    .admin-software-form .full-width { grid-column: 1 / -1; }
    .error-text { color: #ff716c; font-size: 0.75rem; text-align: center; margin-top: 0.375rem; }

    @media (max-width: 640px) {
      .admin-panel { padding: 0.75rem; }
      .admin-card { padding: 0.75rem; }
      .admin-bento-grid { gap: 0.75rem; }
      .vault-input, .vault-select, .vault-textarea { font-size: 16px; }
      .vault-btn-secondary { min-height: 44px; }
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'admin-panel';

  const grid = document.createElement('div');
  grid.className = 'admin-bento-grid';

  // --- Section 1: NEW_CATEGORY ---
  const catCard = document.createElement('div');
  catCard.className = 'admin-card';

  const catHeader = document.createElement('div');
  catHeader.className = 'admin-section-header';
  catHeader.innerHTML = '<span class="admin-section-accent"></span><h2 class="admin-section-title">NEW CATEGORY</h2>';
  catCard.appendChild(catHeader);

  const chipsContainer = document.createElement('div');
  chipsContainer.className = 'chips-container';
  catCard.appendChild(chipsContainer);

  function renderCategoryTags() {
    chipsContainer.innerHTML = '';
    if (categories.length === 0) {
      const empty = document.createElement('p');
      empty.style.cssText = 'color:#adaaaa;font-size:0.875rem;';
      empty.textContent = 'No categories yet.';
      chipsContainer.appendChild(empty);
    } else {
      categories.forEach(cat => {
        const chip = document.createElement('div');
        chip.className = 'category-chip';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = cat;
        const delBtn = document.createElement('button');
        delBtn.className = 'category-chip-del';
        delBtn.innerHTML = '&times;';
        delBtn.title = `Delete ${cat}`;
        delBtn.onclick = () => onDeleteCategory(cat);
        chip.appendChild(nameSpan);
        chip.appendChild(delBtn);
        chipsContainer.appendChild(chip);
      });
    }
  }
  renderCategoryTags();

  const addCatRow = document.createElement('div');
  addCatRow.style.cssText = 'display:flex;gap:0.5rem;';
  const catInput = document.createElement('input');
  catInput.type = 'text';
  catInput.className = 'vault-input';
  catInput.placeholder = 'Category name';
  const addCatBtn = document.createElement('button');
  addCatBtn.className = 'vault-btn-secondary';
  addCatBtn.textContent = 'SAVE';
  addCatBtn.onclick = () => {
    const val = catInput.value.trim();
    if (val) { onAddCategory(val); catInput.value = ''; }
  };
  addCatRow.appendChild(catInput);
  addCatRow.appendChild(addCatBtn);
  catCard.appendChild(addCatRow);

  // --- Section 2: REGISTER_SOFTWARE ---
  const artifactCard = document.createElement('div');
  artifactCard.className = 'admin-card';

  const artifactHeader = document.createElement('div');
  artifactHeader.className = 'admin-section-header';
  artifactHeader.innerHTML = '<span class="admin-section-accent"></span><h2 class="admin-section-title">REGISTER SOFTWARE</h2>';
  artifactCard.appendChild(artifactHeader);

  const form = document.createElement('form');
  form.className = 'admin-software-form';

  const fields = [
    { name: 'name',        label: 'Software Name',   type: 'text',     required: true },
    { name: 'version',     label: 'Version',         type: 'text',     required: false },
    { name: 'url',         label: 'Download URL',    type: 'url',      required: true,  cls: 'full-width' },
    { name: 'category',    label: 'Category',        type: 'select',   required: true },
    { name: 'description', label: 'Description',     type: 'textarea', required: false, cls: 'full-width' },
  ];

  function toDirectDownload(url) {
    // drive.google.com/file/d/FILE_ID/... → direct download
    const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFile) return `https://drive.google.com/uc?export=download&id=${driveFile[1]}`;

    // drive.google.com/open?id=FILE_ID
    const driveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (driveOpen) return `https://drive.google.com/uc?export=download&id=${driveOpen[1]}`;

    // Google Sheets → export as xlsx
    const sheets = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheets) return `https://docs.google.com/spreadsheets/d/${sheets[1]}/export?format=xlsx`;

    // Google Docs → export as docx
    const docs = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docs) return `https://docs.google.com/document/d/${docs[1]}/export?format=docx`;

    // Google Slides → export as pptx
    const slides = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slides) return `https://docs.google.com/presentation/d/${slides[1]}/export/pptx`;

    return url;
  }

  const inputs = {};
  fields.forEach(field => {
    const group = document.createElement('div');
    group.className = `admin-form-group${field.cls ? ' ' + field.cls : ''}`;

    const label = document.createElement('label');
    label.className = 'admin-form-label';
    label.textContent = field.label;
    group.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      input.className = 'vault-select';
      const placeholder = document.createElement('option');
      placeholder.value = ''; placeholder.disabled = true; placeholder.selected = true;
      placeholder.textContent = 'Select category';
      input.appendChild(placeholder);
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat;
        input.appendChild(opt);
      });
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'vault-textarea';
    } else {
      input = document.createElement('input');
      input.type = field.type;
      input.className = 'vault-input';
      if (field.placeholder) input.placeholder = field.placeholder;
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
  errorMsg.className = 'error-text full-width';
  errorMsg.style.display = 'none';
  form.appendChild(errorMsg);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'vault-btn-primary full-width';
  submitBtn.style.cssText = 'width:auto;padding-left:2.5rem;padding-right:2.5rem;';
  submitBtn.textContent = 'ADD SOFTWARE';
  form.appendChild(submitBtn);

  form.onsubmit = async (e) => {
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
      await onAdd(data);
      resetForm();
    } catch (err) {
      errorMsg.textContent = err.message || '// ERROR';
      errorMsg.style.display = 'block';
    }
  };

  artifactCard.appendChild(form);

  grid.appendChild(catCard);
  grid.appendChild(artifactCard);
  panel.appendChild(grid);

  const resetForm = () => {
    form.reset();
    errorMsg.style.display = 'none';
  };

  return { element: panel, resetForm, renderCategoryTags };
}
