// Las pruebas e2e usan una base propia para no tocar los datos de desarrollo.
const base = process.env.MONGO_URI ?? 'mongodb://localhost:27017/minho_gloss';
process.env.MONGO_URI = base.replace(/\/[^/?]*(\?|$)/, '/minho_gloss_e2e$1');
process.env.NODE_ENV = 'test';
process.env.ADMIN_EMAIL = '';
process.env.ADMIN_PASSWORD = '';
process.env.SMTP_HOST = '';
process.env.FRONTEND_URL = 'http://localhost:5173';
