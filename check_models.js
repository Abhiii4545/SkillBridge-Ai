
import fs from 'fs';
const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyAxvZqwKZ2-z1ze_njjd3gxzztgOhHDwug';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log("Written to models_list.json");
    })
    .catch(err => {
        console.error(err);
        fs.writeFileSync('models_list.json', JSON.stringify({ error: err.toString() }));
    });
