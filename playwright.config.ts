import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// 1. Logika Load Environment (Ambil ENV dari terminal, default ke 'dev')
const envTag = process.env.ENV || 'dev'; 
const envPath = path.resolve(__dirname, `.env.${envTag}`);

dotenv.config({ path: envPath });

// Kasih log biar lu tau di terminal lagi pake env yang mana
console.log(`🚀 Running tests on environment: ${envTag.toUpperCase()}`);
console.log(`📍 Using URL: ${process.env.CMS_URL}`);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  timeout: 60000,
    expect: {
    timeout: 10000,
  },
  reporter: [
    ['html'],           
    ['list'],              
    ['./n8n-reporter.ts']
  ],

  use: {
    // 2. BaseURL otomatis narik dari file .env yang terpilih
    baseURL: process.env.CMS_URL, 
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit', // Ini untuk simulasi Safari
      use: { ...devices['Desktop Safari'] },
    },

    /* Lu juga bisa nambahin browser spesifik yang terinstall di laptop lu */
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // Pake Chrome beneran
    },
    
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' }, // Pake Edge
    },
  ],
});