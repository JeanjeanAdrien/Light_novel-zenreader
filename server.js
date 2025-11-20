import app from './src/app.js';
import { PORT } from './src/config.js';

app.listen(PORT, () => {
    console.log(`🚀 ZenReader Stream (Gemini 2.5) running on http://localhost:${PORT}`);
});