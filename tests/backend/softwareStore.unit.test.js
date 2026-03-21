import {
  getAllSoftware,
  addSoftware,
  deleteSoftware,
  getAllCategories,
  resetSoftwareStore
} from '../../backend/src/softwareStore.js';

beforeEach(() => {
  resetSoftwareStore();
});

describe('Software Store', () => {
  it('starts with 6 seed entries', () => {
    expect(getAllSoftware().length).toBe(6);
  });

  it('getAllCategories returns sorted deduplicated string array', () => {
    const categories = getAllCategories();
    expect(categories).toEqual(["Developer Tools", "Security", "Utilities"]);
  });

  it('addSoftware creates entry with correct shape', () => {
    const software = addSoftware({ name: 'NewApp', version: '1.0', category: 'Utilities', url: 'https://example.com' });
    expect(software).toHaveProperty('id');
    expect(software).toHaveProperty('name', 'NewApp');
    expect(software).toHaveProperty('version', '1.0');
    expect(software).toHaveProperty('category', 'Utilities');
    expect(software).toHaveProperty('url', 'https://example.com');
    expect(software).toHaveProperty('createdAt');
  });

  it('addSoftware throws if name missing', () => {
    expect(() => addSoftware({ version: '1.0', category: 'Utilities', url: 'https://example.com' })).toThrow('name is required');
  });

  it('addSoftware throws if url missing', () => {
    expect(() => addSoftware({ name: 'NewApp', version: '1.0', category: 'Utilities' })).toThrow('url is required');
  });

  it('deleteSoftware removes entry and returns it', () => {
    const deleted = deleteSoftware(1);
    expect(deleted).toHaveProperty('id', 1);
    expect(getAllSoftware().length).toBe(5);
  });

  it('deleteSoftware returns null for unknown id', () => {
    const result = deleteSoftware(9999);
    expect(result).toBeNull();
  });
});
