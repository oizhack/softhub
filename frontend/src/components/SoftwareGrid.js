export function renderSoftwareGrid(items, categories, onDelete, isAdmin, onEdit, onReorderCategories) {
  if (!document.getElementById('sw-grid-styles')) {
    const style = document.createElement('style');
    style.id = 'sw-grid-styles';
    style.textContent = `
      .vault-accordion-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
      }
      .vault-category {
        border-radius: 0.5rem;
        overflow: hidden;
        border: 1px solid rgba(72,72,71,0.2);
      }
      .vault-category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px;
        cursor: pointer;
        background: #131313;
        user-select: none;
        transition: background 0.2s ease;
      }
      .vault-category-header:hover { background: #1a1a1a; }
      .vault-category-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #99f7ff;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .vault-chevron {
        font-family: 'Material Symbols Outlined';
        font-size: 22px;
        color: #99f7ff;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .vault-category.open .vault-chevron { transform: rotate(90deg); }
      .vault-badge {
        font-size: 0.75rem;
        background: rgba(153, 247, 255, 0.08);
        border: 1px solid rgba(153,247,255,0.2);
        padding: 3px 10px;
        border-radius: 9999px;
        color: #99f7ff;
        font-family: monospace;
        letter-spacing: 0.05em;
      }
      .vault-items-drawer {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        background: #0e0e0e;
      }
      .vault-category.open .vault-items-drawer { grid-template-rows: 1fr; }
      .vault-drawer-inner { min-height: 0; }
      .vault-software-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 22px 14px 48px;
        border-top: 1px solid rgba(72,72,71,0.1);
        border-left: 2px solid transparent;
        transition: all 0.2s ease;
      }
      .vault-software-row:hover {
        background: rgba(153, 247, 255, 0.03);
        border-left-color: #99f7ff;
      }
      .vault-software-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .vault-dot {
        width: 5px;
        height: 5px;
        background: #99f7ff;
        border-radius: 50%;
        box-shadow: 0 0 6px #99f7ff;
        flex-shrink: 0;
      }
      .vault-software-name {
        font-weight: 700;
        font-size: 1rem;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
      }
      .vault-software-version {
        font-family: monospace;
        font-size: 0.8rem;
        color: #adaaaa;
      }
      .vault-actions { display: flex; gap: 6px; }
      .vault-btn {
        background: transparent;
        border: 1px solid rgba(72,72,71,0.4);
        color: #adaaaa;
        cursor: pointer;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        text-decoration: none;
        flex-shrink: 0;
      }
      .vault-btn:hover { border-color: #99f7ff; color: #99f7ff; }
      .vault-btn-delete:hover { border-color: #ff716c; color: #ff716c; }
      .vault-btn-edit:hover { border-color: #fbbf24; color: #fbbf24; }
      .vault-category.dragging { opacity: 0.4; }
      .vault-category.drag-over { box-shadow: 0 -3px 0 0 #99f7ff; }
      .vault-drag-handle { font-family: 'Material Symbols Outlined'; font-size: 18px; color: #484847; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; cursor: grab; user-select: none; margin-right: 4px; transition: color 0.2s; }
      .vault-drag-handle:hover { color: #99f7ff; }
      .vault-software-description {
        font-size: 0.75rem;
        color: #6b6b6b;
        font-family: 'Inter', sans-serif;
        font-style: italic;
        margin-top: 2px;
      }
      .vault-software-updated {
        font-size: 0.65rem;
        color: #484847;
        font-family: monospace;
        margin-top: 3px;
        letter-spacing: 0.03em;
      }
      .vault-btn span {
        font-family: 'Material Symbols Outlined';
        font-size: 16px;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .vault-empty {
        padding: 14px 36px;
        font-style: italic;
        color: #484847;
        font-size: 0.8rem;
        border-top: 1px solid rgba(72,72,71,0.1);
        font-family: 'Inter', sans-serif;
      }

      @media (max-width: 640px) {
        .vault-category-header { padding: 12px 14px; }
        .vault-category-title { font-size: 0.75rem; }
        .vault-software-row { padding-left: 20px; }
        .vault-software-name { font-size: 0.775rem; }
        .vault-btn { width: 36px; height: 36px; }
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement('div');
  container.className = 'vault-accordion-container';

  let dragSrcIndex = null;

  categories.forEach((category, catIndex) => {
    const categoryItems = items.filter(item => item.category === category);

    const catSection = document.createElement('div');
    catSection.className = 'vault-category';

    const header = document.createElement('div');
    header.className = 'vault-category-header';
    header.addEventListener('click', () => catSection.classList.toggle('open'));

    const titleDiv = document.createElement('div');
    titleDiv.className = 'vault-category-title';

    if (isAdmin && onReorderCategories) {
      const dragHandle = document.createElement('span');
      dragHandle.className = 'vault-drag-handle';
      dragHandle.textContent = 'drag_indicator';
      dragHandle.addEventListener('mousedown', () => { catSection.draggable = true; });
      dragHandle.addEventListener('mouseup', () => { catSection.draggable = false; });
      titleDiv.appendChild(dragHandle);

      catSection.addEventListener('dragstart', (e) => {
        dragSrcIndex = catIndex;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => catSection.classList.add('dragging'), 0);
      });
      catSection.addEventListener('dragend', () => {
        catSection.draggable = false;
        catSection.classList.remove('dragging');
        container.querySelectorAll('.vault-category').forEach(c => c.classList.remove('drag-over'));
      });
      catSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (catIndex !== dragSrcIndex) catSection.classList.add('drag-over');
      });
      catSection.addEventListener('dragleave', (e) => {
        if (!catSection.contains(e.relatedTarget)) catSection.classList.remove('drag-over');
      });
      catSection.addEventListener('drop', (e) => {
        e.preventDefault();
        catSection.classList.remove('drag-over');
        if (dragSrcIndex === null || dragSrcIndex === catIndex) return;
        const newOrder = [...categories];
        const [moved] = newOrder.splice(dragSrcIndex, 1);
        newOrder.splice(catIndex, 0, moved);
        dragSrcIndex = null;
        onReorderCategories(newOrder);
      });
    }

    const chevron = document.createElement('span');
    chevron.className = 'vault-chevron';
    chevron.textContent = 'chevron_right';
    const titleText = document.createElement('span');
    titleText.textContent = category;
    titleDiv.appendChild(chevron);
    titleDiv.appendChild(titleText);

    const badge = document.createElement('div');
    badge.className = 'vault-badge';
    badge.textContent = `${categoryItems.length} item${categoryItems.length !== 1 ? 's' : ''}`;

    header.appendChild(titleDiv);
    header.appendChild(badge);

    const drawer = document.createElement('div');
    drawer.className = 'vault-items-drawer';
    const inner = document.createElement('div');
    inner.className = 'vault-drawer-inner';

    if (categoryItems.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'vault-empty';
      empty.textContent = 'No software registered.';
      inner.appendChild(empty);
    } else {
      categoryItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'vault-software-row';

        const info = document.createElement('div');
        info.className = 'vault-software-info';
        info.style.alignItems = 'flex-start';
        const dot = document.createElement('div');
        dot.className = 'vault-dot';
        dot.style.marginTop = '6px';
        const name = document.createElement('span');
        name.className = 'vault-software-name';
        name.textContent = item.name;
        const version = document.createElement('span');
        version.className = 'vault-software-version';
        version.textContent = item.version || '';

        const nameVersionRow = document.createElement('div');
        nameVersionRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        nameVersionRow.appendChild(name);
        nameVersionRow.appendChild(version);

        const infoBlock = document.createElement('div');
        infoBlock.appendChild(nameVersionRow);
        if (item.description) {
          const desc = document.createElement('div');
          desc.className = 'vault-software-description';
          desc.textContent = item.description;
          infoBlock.appendChild(desc);
        }
        if (item.updatedAt) {
          const updated = document.createElement('div');
          updated.className = 'vault-software-updated';
          const d = new Date(item.updatedAt);
          updated.textContent = 'updated ' + d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          infoBlock.appendChild(updated);
        }

        info.appendChild(dot);
        info.appendChild(infoBlock);

        const actions = document.createElement('div');
        actions.className = 'vault-actions';

        const dlBtn = document.createElement('a');
        dlBtn.href = item.url;
        dlBtn.target = '_blank';
        dlBtn.rel = 'noopener noreferrer';
        dlBtn.className = 'vault-btn';
        dlBtn.title = 'Download';
        const dlIcon = document.createElement('span');
        dlIcon.textContent = 'download';
        dlBtn.appendChild(dlIcon);
        actions.appendChild(dlBtn);

        if (isAdmin) {
          const editBtn = document.createElement('button');
          editBtn.className = 'vault-btn vault-btn-edit';
          editBtn.title = 'Edit';
          const editIcon = document.createElement('span');
          editIcon.textContent = 'edit';
          editBtn.appendChild(editIcon);
          editBtn.addEventListener('click', () => onEdit(item));
          actions.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'vault-btn vault-btn-delete';
          delBtn.title = 'Delete';
          const delIcon = document.createElement('span');
          delIcon.textContent = 'delete';
          delBtn.appendChild(delIcon);
          delBtn.addEventListener('click', () => onDelete(item.id));
          actions.appendChild(delBtn);
        }

        row.appendChild(info);
        row.appendChild(actions);
        inner.appendChild(row);
      });
    }

    drawer.appendChild(inner);
    catSection.appendChild(header);
    catSection.appendChild(drawer);
    container.appendChild(catSection);
  });

  return container;
}
