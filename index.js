const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://api.storytv.asia';

// Local JSON Files Import
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');
const profileData = require('./profile.json');
const stateData = require('./state.json');

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Helper Function
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}

// ---------------- LOCAL CUSTOM ENDPOINTS ----------------

// Subscription API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

// Homepage Struct API
app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

app.get('/userservice/v1/profile', (req, res) => {
    sendJsonWithCdnProxy(res, req, profileData);
});

app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    sendJsonWithCdnProxy(res, req, stateData);
});

// ---------------- LIVE PROXY HANDLER ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        const headers = {
    'appVersion': req.headers['appversion'] || '62',
    'platform': req.headers['platform'] || '0',
    'deviceId': req.headers['deviceid'] || 'a6229bad5c179d51',
    'os': req.headers['os'] || 'Android 16 (API 36)',
    'network_type': req.headers['network_type'] || 'WIFI',
    
    // Session ID from ProxyPin log
    'ep_session_id': '6096700_1785680943806',
    
    'X-AYUSH-KEY': req.headers['x-ayush-key'] || 'INDAPKS_2026_VIP_FINAL',
    'Authorization': req.headers['authorization'] || 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjUtMDktMTAgMTQ6MDU6MDEuNzU1Iiwic2Vzc2lvbklkIjoiMTgyMDk2MTI0IiwiZGV2aWNlSWQiOiJhNjIyOWJhZDVjMTc5ZDUxIiwic3ViIjoiNjA5NjcwMCIsImV4cCI6MTc4NTk0MDE1Nn0.BDa4Lbsr5odp32FgJV13SA2cYpS7GVE-QPZGerc4r_E',
    'User-Agent': 'ktor-client',
    'Content-Type': 'application/json',
    'ts': Math.floor(Date.now() / 1000).toString()
};

        const fetchOptions = {
            method: req.method,
            headers: headers
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).json({
            status: "PROXY_ERROR",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running live on port ${PORT}`);
});
