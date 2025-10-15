import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read original data
const originalData = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../src/default-data.json'),
    'utf-8'
));

const [categoryMap, supplierMap] = originalData as [Record<string, string>, Record<string, string>];

// Helper to extract emoji and name from combined string
function splitEmojiAndName(combined: string): [string, string] {
    const match = combined.match(/^([\p{Emoji}]+)(.+)$/u);
    if (match) {
        return [match[1].trim(), match[2].trim()];
    }
    return ['📦', combined.trim()]; // Default emoji if none found
}

// Transform categories
const categories: Record<string, any> = {};
const categoryNameToId: Record<string, string> = {};

Object.values(categoryMap).forEach((combinedName: string) => {
    if (combinedName === 'item') return;
    
    const [emoji, name] = splitEmojiAndName(combinedName);
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    if (!categories[id]) {
        categories[id] = {
            id,
            name,
            emoji,
        };
        categoryNameToId[name] = id;
    }
});

// Transform suppliers
const suppliers: Record<string, any> = {};
const uniqueSupplierNames = new Set(Object.values(supplierMap));

uniqueSupplierNames.forEach((name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    suppliers[id] = {
        id,
        name,
        defaultPaymentMethod: 'cash', // Default value
        defaultOrderType: 'pickup',    // Default value
    };
});

// Transform items
const items = Object.entries(categoryMap)
    .filter(([itemName]) => itemName !== 'item')
    .map(([itemName, categoryName]) => {
        const supplier = supplierMap[itemName];
        const [_, categoryNameOnly] = splitEmojiAndName(categoryName as string);
        
        return {
            id: itemName.toLowerCase().replace(/\s+/g, '-'),
            name: itemName,
            category: categoryNameToId[categoryNameOnly],
            supplier: (supplier || 'unknown').toLowerCase().replace(/\s+/g, '-'),
            tags: [],
        };
    });

// Keep existing stores
const stores = {
    "cv2": {
        "id": "cv2",
        "name": "CV2",
        "tag": "cv2",
        "isActive": true
    },
    "o2": {
        "id": "o2",
        "name": "O2",
        "tag": "o2",
        "isActive": true
    },
    "wb": {
        "id": "wb",
        "name": "WB",
        "tag": "wb",
        "isActive": true
    },
    "sti": {
        "id": "sti",
        "name": "STI",
        "tag": "sti",
        "isActive": true
    },
    "myym": {
        "id": "myym",
        "name": "MYYM",
        "tag": "myym",
        "isActive": true
    },
    "leo": {
        "id": "leo",
        "name": "LEO",
        "tag": "leo",
        "isActive": true
    }
};

// Combine everything into new format
const newData = {
    stores,
    categories,
    suppliers,
    items,
    settings: {
        posMode: true,
        autosave: true,
        defaultSupplier: "pisey"
    },
    exportInfo: {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
    }
};

// Write the new data
fs.writeFileSync(
    path.join(__dirname, '../src/default-data-new.json'),
    JSON.stringify(newData, null, 2)
);

console.log('Data transformation complete!');
console.log(`Categories: ${Object.keys(categories).length}`);
console.log(`Suppliers: ${Object.keys(suppliers).length}`);
console.log(`Items: ${items.length}`);