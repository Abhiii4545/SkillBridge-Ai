
import fs from 'fs';
const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyD1mv81h3dPgFMMebSPtMEpLQrhCtepRfw';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking models for key: ${apiKey.substring(0, 10)}...`);

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            fs.writeFileSync('models_list_v2.json', JSON.stringify(data, null, 2));
            console.log("Success: Written to models_list_v2.json");
        } else {
            console.error("Error response:", JSON.stringify(data));
        }
    })
    .catch(err => {
        console.error("Fetch error:", err);
    });
