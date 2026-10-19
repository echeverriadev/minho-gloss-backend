export interface AppConfig {
  port: number;
  mongoUri: string;
  corsOrigin: string;
}

export default (): AppConfig => ({
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/minho_gloss',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
});
