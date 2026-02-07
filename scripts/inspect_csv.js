const Papa = require('papaparse');
const PRODUCTS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTifC-ytvLqv-aSRvxlvmSSxdH4fj328ICJebelmAJPW0AyYki8ZBWp5C6Gt5462gCgBOE51LflLVWB/pub?gid=0&single=true&output=csv';
const CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTifC-ytvLqv-aSRvxlvmSSxdH4fj328ICJebelmAJPW0AyYki8ZBWp5C6Gt5462gCgBOE51LflLVWB/pub?gid=1412483830&single=true&output=csv';

async function check(url, name) {
    console.log(`Checking ${name}...`);
    try {
        const res = await fetch(url);
        const text = await res.text();
        const results = Papa.parse(text, { header: true, preview: 2 });
        console.log(`--- ${name} HEADERS ---`);
        console.log(JSON.stringify(results.meta.fields, null, 2));
        console.log(`--- ${name} SAMPLE ---`);
        console.log(JSON.stringify(results.data[0], null, 2));
    } catch (err) {
        console.error(`Error checking ${name}:`, err);
    }
}

(async () => {
    await check(PRODUCTS_URL, 'PRODUCTS');
    await check(CONFIG_URL, 'CONFIG');
})();
