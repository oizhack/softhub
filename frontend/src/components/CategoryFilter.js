export function renderCategoryFilter(categories, activeCategory, onSelect) {
  if (!document.getElementById("category-filter-styles")) {
    const style = document.createElement("style");
    style.id = "category-filter-styles";
    style.textContent = `
      .category-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 2rem;
        justify-content: center;
        padding: 0 1rem;
      }
      .filter-chip {
        background: #262626;
        border: none;
        color: #adaaaa;
        padding: 0.35rem 1rem;
        border-radius: 9999px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .filter-chip:hover {
        color: #99f7ff;
        background: rgba(153,247,255,0.1);
      }
      .filter-chip.active {
        color: #99f7ff;
        background: rgba(153,247,255,0.15);
        box-shadow: 0 0 8px rgba(153,247,255,0.2);
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement("div");
  container.className = "category-filter";

  const allCategories = ["All", ...categories];

  allCategories.forEach(category => {
    const button = document.createElement("button");
    button.className = "filter-chip";
    if (activeCategory === category) {
      button.classList.add("active");
    }
    button.textContent = category.toUpperCase();
    button.onclick = () => onSelect(category);
    container.appendChild(button);
  });

  return container;
}
