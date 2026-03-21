export function renderCategoryFilter(categories, activeCategory, onSelect) {
    const filterContainer = document.createElement("div");
    filterContainer.className = "category-filter";

    const allCategories = ["All", ...categories];

    if (!document.getElementById("category-filter-styles")) {
        const style = document.createElement("style");
        style.id = "category-filter-styles";
        style.textContent = `
            .category-filter {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-bottom: 2rem;
                padding: 0 1rem;
                justify-content: center;
                border-bottom: 1px dashed var(--border);
                padding-bottom: 1.5rem;
            }

            .filter-btn {
                background-color: transparent;
                border: 1px solid var(--border);
                color: var(--text-muted);
                padding: 0.4rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                font-family: 'Fira Code', monospace;
                font-size: 0.85rem;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .filter-btn:hover {
                border-color: var(--neon-cyan);
                color: var(--neon-cyan);
            }

            .filter-btn.active {
                border-color: var(--neon-cyan);
                color: var(--neon-cyan);
                background-color: rgba(0,255,240,0.08);
                box-shadow: 0 0 5px rgba(0,255,240,0.3);
            }
        `;
        document.head.appendChild(style);
    }

    allCategories.forEach(category => {
        const button = document.createElement("button");
        button.className = "filter-btn";
        button.textContent = `[ ${category.toUpperCase()} ]`;
        if (category === activeCategory) {
            button.classList.add("active");
        }
        button.addEventListener("click", () => onSelect(category));
        filterContainer.appendChild(button);
    });

    return filterContainer;
}
