import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import axios from 'axios';

class N8NReporter implements Reporter {
  async onTestEnd(test: TestCase, result: TestResult) {
    console.log(`DEBUG: onTestEnd terpicu untuk ${test.title}`);
    const currentEnv = process.env.ENV || 'local';
    const browserName = test.parent.project()?.name || 'unknown';

    let finalStatus = '-';
    if (result.status === 'passed') {
      finalStatus = '✅ Passed';
    } else if (result.status === 'timedOut') {
      finalStatus = '⏰ Timeout';
    } else {
      finalStatus = '❌ Failed';
    }

    // Ambil pesan error, bersihkan dari karakter aneh, dan potong 200 karakter
    const rawError = result.error?.message || '-';
    const cleanError = rawError.replace(/\u001b\[\d+m/g, ''); // Hapus kode warna terminal (ANSI)

    const payload = {
      project: 'MICROSITE',
      timestamp: Math.floor(Date.now() / 1000), 
      testcase: test.title,
      status: finalStatus,
      env: currentEnv.toUpperCase(), 
      browser: browserName,
      error: cleanError.substring(0, 200)
    };

    try {
      await axios.post('https://n8n.gits.id/webhook/report-log', payload);
      console.log(`🚀 [${currentEnv}] [${browserName}] Report sent for: ${test.title}`);
    } catch (err: any) {
      console.error('❌ Gagal kirim report ke n8n:', err.message);
    }
  }
}

export default N8NReporter;