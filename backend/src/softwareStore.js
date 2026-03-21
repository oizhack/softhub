import { sql } from "@vercel/postgres";

export async function initDb() {
    await sql`
        CREATE TABLE IF NOT EXISTS categories (
            name TEXT PRIMARY KEY
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS software_items (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            version TEXT DEFAULT '',
            category TEXT DEFAULT '',
            url TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    // Seed only if empty
    const { rowCount } = await sql`SELECT 1 FROM categories LIMIT 1`;
    if (rowCount === 0) {
        await sql`INSERT INTO categories VALUES ('Developer Tools'), ('Security'), ('Utilities')`;
        await sql`
            INSERT INTO software_items (name, description, version, category, url) VALUES
            ('VS Code', 'Code editing. Redefined.', '1.89.0', 'Developer Tools', 'https://code.visualstudio.com/download'),
            ('Git', 'Version control system', '2.45.0', 'Developer Tools', 'https://git-scm.com/downloads'),
            ('Wireshark', 'Network protocol analyzer', '4.2.4', 'Security', 'https://www.wireshark.org/download.html'),
            ('KeePassXC', 'Password manager', '2.7.8', 'Security', 'https://keepassxc.org/download/'),
            ('7-Zip', 'File archiver', '24.07', 'Utilities', 'https://www.7-zip.org/download.html'),
            ('VLC Media Player', 'Media player', '3.0.21', 'Utilities', 'https://www.videolan.org/vlc/')
        `;
    }
}

const toItem = (r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    version: r.version,
    category: r.category,
    url: r.url,
    createdAt: r.created_at,
});

export async function getAllSoftware() {
    const { rows } = await sql`SELECT * FROM software_items ORDER BY id`;
    return rows.map(toItem);
}

export async function getSoftwareById(id) {
    const { rows } = await sql`SELECT * FROM software_items WHERE id = ${id}`;
    return rows[0] ? toItem(rows[0]) : null;
}

export async function addSoftware({ name, description, version, category, url }) {
    if (!name?.trim()) throw new Error("name is required");
    if (!url?.trim()) throw new Error("url is required");
    const { rows } = await sql`
        INSERT INTO software_items (name, description, version, category, url)
        VALUES (${name.trim()}, ${description || ""}, ${version || ""}, ${category || ""}, ${url.trim()})
        RETURNING *
    `;
    return toItem(rows[0]);
}

export async function deleteSoftware(id) {
    const { rows } = await sql`DELETE FROM software_items WHERE id = ${id} RETURNING *`;
    return rows[0] ? toItem(rows[0]) : null;
}

export async function getAllCategories() {
    const { rows } = await sql`SELECT name FROM categories ORDER BY name`;
    return rows.map((r) => r.name);
}

export async function addCategory(name) {
    const trimmed = name.trim();
    try {
        await sql`INSERT INTO categories VALUES (${trimmed})`;
        return trimmed;
    } catch {
        return null; // duplicate key = already exists
    }
}

export async function deleteCategory(name) {
    const { rows } = await sql`DELETE FROM categories WHERE name = ${name} RETURNING name`;
    return rows[0]?.name || null;
}

export async function resetSoftwareStore() {
    await sql`DELETE FROM software_items`;
    await sql`DELETE FROM categories`;
    await initDb();
}
