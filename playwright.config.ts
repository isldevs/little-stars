import {existsSync} from 'node:fs';
import {defineConfig} from '@playwright/test';
const chromiumPath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
export default defineConfig({
 testDir:'./e2e',fullyParallel:true,timeout:30000,retries:0,reporter:'list',
 webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
 use:{baseURL:'http://127.0.0.1:5173',headless:true,viewport:{width:1440,height:1000},launchOptions:{executablePath:chromiumPath,args:['--no-sandbox','--disable-dev-shm-usage']},trace:'retain-on-failure'},
});
