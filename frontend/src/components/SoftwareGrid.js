export function renderSoftwareGrid(items, onDelete, isAdmin) {
    if (!document.getElementById("sw-grid-styles")) {
        const style = document.createElement("style");
        style.id = "sw-grid-styles";
        style.textContent = `
            .sw-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1.5rem;
            }

            .sw-card {
                display: flex;
                flex-direction: column;
                border: 1px solid var(--border);
                background-color: var(--surface);
                border-radius: 8px;
                padding: 1.5rem;
                transition: border-color 0.2s, box-shadow 0.2s;
                overflow: hidden;
            }

            .sw-card:hover {
                border-color: var(--neon-cyan);
                box-shadow: 0 0 12px rgba(0,255,240,0.15);
            }

            .sw-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.75rem;
            }

            .sw-card h3 {
                font-family: 'Orbitron', sans-serif;
                color: var(--neon-cyan);
                margin: 0;
                font-size: 1.1rem;
                line-height: 1.3;
                word-break: break-word;
            }

            .sw-card .badge {
                background-color: rgba(0,255,240,0.1);
                color: var(--neon-cyan);
                border: 1px solid var(--neon-cyan);
                border-radius: 4px;
                padding: 2px 8px;
                font-size: 0.7rem;
                text-transform: uppercase;
                white-space: nowrap;
                margin-left: 1rem;
            }

            .sw-card p {
                color: var(--text-muted);
                font-size: 0.9rem;
                margin: 0.75rem 0;
                line-height: 1.5;
            }

            .sw-card-footer {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-top: auto;
                padding-top: 1rem;
                border-top: 1px dashed var(--border);
            }

            .sw-card .version {
                font-family: 'Fira Code', monospace;
                color: var(--text-muted);
                font-size: 0.85rem;
            }

            .sw-card .download-btn {
                background-color: var(--neon-cyan);
                color: var(--bg);
                font-weight: bold;
                padding: 0.4rem 1rem;
                border-radius: 4px;
                text-decoration: none;
                font-family: 'Fira Code', monospace;
                white-space: nowrap;
                font-size: 0.85rem;
                transition: background-color 0.2s, box-shadow 0.2s;
            }

            .sw-card .download-btn:hover {
                background-color: #00e6d6;
                box-shadow: 0 0 8px rgba(0,255,240,0.4);
            }

            .sw-card .delete-btn {
                color: var(--danger);
                border: 1px solid var(--danger);
                background-color: transparent;
                padding: 0.25rem 0.6rem;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Fira Code', monospace;
                font-size: 0.8rem;
                margin-left: auto;
                transition: background-color 0.2s, color 0.2s;
            }

            .sw-card .delete-btn:hover {
                background-color: var(--danger);
                color: var(--bg);
            }
        `;
        document.head.appendChild(style);
    }

    const grid = document.createElement("div");
    grid.className = "sw-grid";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "sw-card";

        const header = document.createElement("div");
        header.className = "sw-card-header";

        const name = document.createElement("h3");
        name.textContent = item.name;
        header.appendChild(name);

        const category = document.createElement("span");
        category.className = "badge";
        category.textContent = item.category;
        header.appendChild(category);

        card.appendChild(header);

        const description = document.createElement("p");
        description.textContent = item.description;
        card.appendChild(description);

        const footer = document.createElement("div");
        footer.className = "sw-card-footer";

        const version = document.createElement("span");
        version.className = "version";
        version.textContent = `v${item.version}`;
        footer.appendChild(version);

        const downloadLink = document.createElement("a");
        downloadLink.className = "download-btn";
        downloadLink.href = item.url;
        downloadLink.target = "_blank";
        downloadLink.rel = "noopener noreferrer";
        downloadLink.textContent = "[ DOWNLOAD ]";
        footer.appendChild(downloadLink);

        if (isAdmin) {
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "[ DEL ]";
            deleteButton.addEventListener("click", () => onDelete(item.id));
            footer.appendChild(deleteButton);
        }

        card.appendChild(footer);
        grid.appendChild(card);
    });

    return grid;
}
