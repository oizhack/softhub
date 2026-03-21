export function renderAdminPanel(onAdd, onLogout, categories = [], onAddCategory, onDeleteCategory) {
    const existingStyle = document.getElementById("admin-styles");
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.id = "admin-styles";
    style.textContent = `
        .admin-panel {
            background-color: var(--surface); border: 1px solid var(--border);
            border-radius: 8px; padding: 2rem; margin-bottom: 2rem;
            box-shadow: 0 0 20px rgba(0,255,240,0.06);
        }
        .admin-panel h2 {
            font-family: 'Orbitron', sans-serif; color: var(--neon-cyan);
            margin-bottom: 1.5rem; text-align: center;
            text-shadow: 0 0 5px rgba(0,255,240,0.2);
        }
        .admin-section {
            border: 1px dashed var(--border); border-radius: 4px; padding: 1rem;
            margin-bottom: 1.5rem;
        }
        .admin-section h3 {
            font-family: 'Fira Code', monospace; color: var(--text);
            margin-bottom: 1rem; text-align: center; font-size: 1.1rem;
        }
        .admin-form {
            display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .admin-form .form-group {
            display: flex; flex-direction: column;
        }
        .admin-form .full-width {
            grid-column: 1 / -1;
        }
        .admin-form label {
            margin-bottom: 0.5rem; color: var(--text); font-size: 0.9rem;
        }
        .admin-panel input[type="text"],
        .admin-panel input[type="url"],
        .admin-panel textarea,
        .admin-panel select {
            width: 100%; padding: 0.8rem; background-color: var(--bg);
            border: 1px solid var(--border); color: var(--text);
            border-radius: 4px; font-family: 'Fira Code', monospace;
            font-size: 0.9rem; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-panel input[type="text"]:focus,
        .admin-panel input[type="url"]:focus,
        .admin-panel textarea:focus,
        .admin-panel select:focus {
            border-color: var(--neon-cyan);
            box-shadow: 0 0 8px rgba(0,255,240,0.1);
        }
        .admin-panel textarea { resize: vertical; min-height: 80px; }
        .admin-panel .add-btn {
            background-color: var(--neon-cyan); color: var(--bg);
            border: 1px solid var(--neon-cyan); padding: 0.8rem 1.5rem;
            border-radius: 4px; font-size: 0.95rem; cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 0 8px rgba(0,255,240,0.1);
        }
        .admin-panel .add-btn:hover {
            background-color: #00e6d6;
            box-shadow: 0 0 10px rgba(0,255,240,0.25);
        }
        .admin-panel .logout-btn {
            background-color: transparent; color: var(--danger);
            border: 1px solid var(--danger); padding: 0.8rem 1.5rem;
            border-radius: 4px; margin-top: 1rem; cursor: pointer;
            transition: all 0.2s ease; width: 100%;
        }
        .admin-panel .logout-btn:hover {
            background-color: rgba(255,62,62,0.1);
            box-shadow: 0 0 10px rgba(255,62,62,0.25);
        }
        .admin-panel .category-list {
            display: flex; flex-wrap: wrap; gap: 8px; margin-top: 1rem; margin-bottom: 1.5rem;
        }
        .admin-panel .category-tag {
            font-family: 'Fira Code', monospace; font-size: 0.8rem;
            border: 1px solid var(--border); border-radius: 4px;
            padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;
            background-color: var(--bg); color: var(--text);
        }
        .admin-panel .category-tag button {
            background: transparent; border: none; color: var(--text-muted);
            font-size: 0.9rem; cursor: pointer; padding: 0 2px; line-height: 1;
        }
        .admin-panel .category-tag button:hover { color: var(--danger); opacity: 1; }
        .admin-panel .add-category-input-group {
            display: flex; gap: 8px; margin-bottom: 1rem;
        }
        .admin-panel .add-category-input-group input { flex-grow: 1; }
        .admin-panel .add-category-input-group button { padding: 0.6rem 1rem; font-size: 0.9rem; }
        .admin-panel .error-message {
            color: var(--danger); text-align: center; margin-top: 1rem; font-size: 0.85rem;
        }
        @media (max-width: 600px) {
            .admin-form { grid-template-columns: 1fr; }
            .admin-form .full-width { grid-column: 1; }
        }
    `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.className = "admin-panel";

    const title = document.createElement("h2");
    title.textContent = "[ ADMIN PANEL ]";
    panel.appendChild(title);

    // --- MANAGE CATEGORIES SECTION ---
    const categorySection = document.createElement("div");
    categorySection.className = "admin-section";
    const categoryTitle = document.createElement("h3");
    categoryTitle.textContent = "[ MANAGE CATEGORIES ]";
    categorySection.appendChild(categoryTitle);

    const categoryList = document.createElement("div");
    categoryList.className = "category-list";

    function renderCategoryTags() {
        categoryList.innerHTML = "";
        if (categories.length === 0) {
            categoryList.innerHTML = `<span style="color:var(--text-muted);">No categories yet.</span>`;
            return;
        }
        categories.forEach(cat => {
            const tag = document.createElement("span");
            tag.className = "category-tag";
            tag.textContent = cat;
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "&times;";
            deleteBtn.title = `Delete ${cat}`;
            deleteBtn.onclick = () => onDeleteCategory(cat);
            tag.appendChild(deleteBtn);
            categoryList.appendChild(tag);
        });
    }
    renderCategoryTags();
    categorySection.appendChild(categoryList);

    const addCatGroup = document.createElement("div");
    addCatGroup.className = "add-category-input-group";
    const newCatInput = document.createElement("input");
    newCatInput.type = "text";
    newCatInput.placeholder = "New category name";
    const addCatBtn = document.createElement("button");
    addCatBtn.className = "add-btn";
    addCatBtn.textContent = "[ ADD ]";
    addCatBtn.onclick = () => {
        const name = newCatInput.value.trim();
        if (name) { onAddCategory(name); newCatInput.value = ""; }
    };
    addCatGroup.appendChild(newCatInput);
    addCatGroup.appendChild(addCatBtn);
    categorySection.appendChild(addCatGroup);
    panel.appendChild(categorySection);

    // --- ADD SOFTWARE SECTION ---
    const softwareSection = document.createElement("div");
    softwareSection.className = "admin-section";
    const softwareTitle = document.createElement("h3");
    softwareTitle.textContent = "[ ADD SOFTWARE ]";
    softwareSection.appendChild(softwareTitle);

    const form = document.createElement("form");
    form.className = "admin-form";

    const fields = [
        { id: "name",        label: "NAME:",         type: "text",     placeholder: "e.g., VS Code" },
        { id: "version",     label: "VERSION:",      type: "text",     placeholder: "e.g., 1.85.1" },
        { id: "url",         label: "DOWNLOAD URL:", type: "url",      placeholder: "https://example.com/setup.exe" },
        { id: "category",    label: "CATEGORY:",     type: "select",   placeholder: "Select category" },
        { id: "description", label: "DESCRIPTION:",  type: "textarea", placeholder: "Brief description...", cls: "full-width" },
    ];

    const inputs = {};
    fields.forEach(field => {
        const group = document.createElement("div");
        group.className = `form-group ${field.cls || ""}`;

        const label = document.createElement("label");
        label.htmlFor = `admin-${field.id}`;
        label.textContent = field.label;
        group.appendChild(label);

        let input;
        if (field.type === "select") {
            input = document.createElement("select");
            input.id = `admin-${field.id}`;
            const placeholder = document.createElement("option");
            placeholder.value = ""; placeholder.disabled = true; placeholder.selected = true;
            placeholder.textContent = field.placeholder;
            input.appendChild(placeholder);
            categories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat; opt.textContent = cat;
                input.appendChild(opt);
            });
        } else if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.id = `admin-${field.id}`;
            input.placeholder = field.placeholder;
        } else {
            input = document.createElement("input");
            input.type = field.type;
            input.id = `admin-${field.id}`;
            input.placeholder = field.placeholder;
        }
        inputs[field.id] = input;
        group.appendChild(input);
        form.appendChild(group);
    });

    const errorMsg = document.createElement("p");
    errorMsg.className = "error-message full-width";
    form.appendChild(errorMsg);

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "add-btn full-width";
    submitBtn.textContent = "[ ADD SOFTWARE ]";
    form.appendChild(submitBtn);

    form.onsubmit = async (e) => {
        e.preventDefault();
        errorMsg.textContent = "";
        const data = {
            name:        inputs.name.value.trim(),
            version:     inputs.version.value.trim(),
            category:    inputs.category.value,
            url:         inputs.url.value.trim(),
            description: inputs.description.value.trim(),
        };
        if (!data.name || !data.url || !data.category) {
            errorMsg.textContent = "// NAME, URL and CATEGORY are required";
            return;
        }
        try {
            await onAdd(data);
            resetForm();
        } catch (err) {
            errorMsg.textContent = err.message || "// ERROR";
        }
    };

    softwareSection.appendChild(form);
    panel.appendChild(softwareSection);

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "logout-btn";
    logoutBtn.textContent = "[ LOGOUT ]";
    logoutBtn.onclick = onLogout;
    panel.appendChild(logoutBtn);

    const resetForm = () => {
        form.reset();
        errorMsg.textContent = "";
    };

    return { element: panel, resetForm, renderCategoryTags };
}
