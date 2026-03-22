import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

// Allow Supabase/cloud SSL certs (pooler uses self-signed chain)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL });

export async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
            name TEXT PRIMARY KEY
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS software_items (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            version TEXT DEFAULT '',
            category TEXT DEFAULT '',
            url TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    const { rowCount } = await pool.query("SELECT 1 FROM categories LIMIT 1");
    if (rowCount === 0) {
        await pool.query(`INSERT INTO categories VALUES ('Developer Tools'), ('Security'), ('Utilities')`);
        await pool.query(`
            INSERT INTO software_items (name, description, version, category, url) VALUES
            ('VS Code', 'Code editing. Redefined.', '1.89.0', 'Developer Tools', 'https://code.visualstudio.com/download'),
            ('Git', 'Version control system', '2.45.0', 'Developer Tools', 'https://git-scm.com/downloads'),
            ('Wireshark', 'Network protocol analyzer', '4.2.4', 'Security', 'https://www.wireshark.org/download.html'),
            ('KeePassXC', 'Password manager', '2.7.8', 'Security', 'https://keepassxc.org/download/'),
            ('7-Zip', 'File archiver', '24.07', 'Utilities', 'https://www.7-zip.org/download.html'),
            ('VLC Media Player', 'Media player', '3.0.21', 'Utilities', 'https://www.videolan.org/vlc/')
        `);
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
    const { rows } = await pool.query("SELECT * FROM software_items ORDER BY id");
    return rows.map(toItem);
}

export async function getSoftwareById(id) {
    const { rows } = await pool.query("SELECT * FROM software_items WHERE id = $1", [id]);
    return rows[0] ? toItem(rows[0]) : null;
}

export async function addSoftware({ name, description, version, category, url }) {
    if (!name?.trim()) throw new Error("name is required");
    if (!url?.trim()) throw new Error("url is required");
    const { rows } = await pool.query(
        "INSERT INTO software_items (name, description, version, category, url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name.trim(), description || "", version || "", category || "", url.trim()]
    );
    return toItem(rows[0]);
}

export async function deleteSoftware(id) {
    const { rows } = await pool.query("DELETE FROM software_items WHERE id = $1 RETURNING *", [id]);
    return rows[0] ? toItem(rows[0]) : null;
}

export async function updateSoftware(id, { name, description, version, category, url }) {
    if (!name?.trim()) throw new Error("name is required");
    if (!url?.trim()) throw new Error("url is required");
    const { rows } = await pool.query(
        "UPDATE software_items SET name=$1, description=$2, version=$3, category=$4, url=$5 WHERE id=$6 RETURNING *",
        [name.trim(), description || "", version || "", category || "", url.trim(), id]
    );
    return rows[0] ? toItem(rows[0]) : null;
}

export async function getAllCategories() {
    const { rows } = await pool.query("SELECT name FROM categories ORDER BY name");
    return rows.map((r) => r.name);
}

export async function addCategory(name) {
    const trimmed = name.trim();
    try {
        await pool.query("INSERT INTO categories VALUES ($1)", [trimmed]);
        return trimmed;
    } catch {
        return null; // duplicate key = already exists
    }
}

export async function deleteCategory(name) {
    const { rows } = await pool.query("DELETE FROM categories WHERE name = $1 RETURNING name", [name]);
    return rows[0]?.name || null;
}

export async function resetSoftwareStore() {
    await pool.query("DELETE FROM software_items");
    await pool.query("DELETE FROM categories");
    await initDb();
}
