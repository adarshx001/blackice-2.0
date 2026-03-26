// ==========================================
// Routing & Navigation
// ==========================================

function navigateTo(viewId, pushToHistory = true) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    const targetLinks = document.querySelectorAll(`.nav-item[data-view="${viewId}"]`);
    targetLinks.forEach(link => {
        link.classList.add('active');
    });

    const navLinks = document.getElementById('navLinks');
    if (navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
    }

    if (pushToHistory) {
        try {
            history.pushState({ viewId }, document.title, `#${viewId}`);
        } catch (e) {
            window.location.hash = viewId;
        }
    }
}

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.viewId) {
        navigateTo(e.state.viewId, false);
    } else {
        let hash = window.location.hash.substring(1);
        if (hash && document.getElementById(`view-${hash}`)) {
            navigateTo(hash, false);
        } else {
            navigateTo('home', false);
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    let hash = window.location.hash.substring(1);
    if (!hash || !document.getElementById(`view-${hash}`)) {
        hash = 'home';
    }

    try {
        history.replaceState({ viewId: hash }, document.title, `#${hash}`);
    } catch (e) { }
    navigateTo(hash, false);
});

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});


// ==========================================
// Tool 1: Password Analyzer
// ==========================================

const pwdInput = document.getElementById('pwdInput');
const pwdToggle = document.getElementById('pwdToggle');
const pwdMeter = document.getElementById('pwdMeter');
const pwdStrengthText = document.getElementById('pwdStrengthText');
const pwdScore = document.getElementById('pwdScore');
const pwdFeedback = document.getElementById('pwdFeedback');

const reqLength = document.getElementById('req-length');
const reqUpper = document.getElementById('req-upper');
const reqLower = document.getElementById('req-lower');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');

pwdToggle.addEventListener('click', () => {
    const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
    pwdInput.setAttribute('type', type);
    pwdToggle.innerHTML = type === 'password' ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
    lucide.createIcons();
});

pwdInput.addEventListener('input', (e) => {
    analyzePassword(e.target.value);
});

function analyzePassword(password) {
    if (!password) {
        resetPasswordAnalyzer();
        return;
    }

    let score = 0;

    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    updateReqItem(reqLength, hasLength);
    updateReqItem(reqUpper, hasUpper);
    updateReqItem(reqLower, hasLower);
    updateReqItem(reqNumber, hasNumber);
    updateReqItem(reqSpecial, hasSpecial);

    score += Math.min(password.length * 4, 40);
    if (hasUpper) score += 15;
    if (hasLower) score += 15;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;

    if (hasLength && hasUpper && hasLower && hasNumber && hasSpecial) {
        score += 10;
    }

    const lowerPw = password.toLowerCase();
    if (lowerPw.includes('password') || lowerPw.includes('123456') || lowerPw.includes('qwerty')) {
        score -= 30;
    }

    score = Math.max(0, Math.min(100, score));

    pwdScore.textContent = `${score}/100`;
    pwdMeter.style.width = `${score}%`;

    let strength = '';
    let color = '';
    let feedback = '';

    if (score < 40) {
        strength = 'Weak';
        color = 'var(--danger)';
        feedback = 'Your password is weak and easily guessable. Attackers could crack this quickly.';
    } else if (score < 75) {
        strength = 'Medium';
        color = 'var(--warning)';
        feedback = 'Moderate strength. It might resist basic attacks but is vulnerable to targeted dictionary attacks.';
    } else {
        strength = 'Strong';
        color = 'var(--success)';
        feedback = 'This password is strong and highly resistant to brute force and dictionary attacks.';
    }

    pwdMeter.style.backgroundColor = color;
    pwdMeter.style.boxShadow = `0 0 10px ${color}`;
    pwdStrengthText.textContent = strength;
    pwdStrengthText.style.color = color;
    pwdStrengthText.style.textShadow = `0 0 8px ${color}80`;

    pwdFeedback.textContent = feedback;
    pwdFeedback.style.borderLeftColor = color;
}

function updateReqItem(el, isMet) {
    const currentIcon = el.querySelector('i') || el.querySelector('svg');
    if (currentIcon) {
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', isMet ? 'check-circle-2' : 'circle');
        el.replaceChild(newIcon, currentIcon);
    }

    if (isMet) {
        el.classList.add('met');
    } else {
        el.classList.remove('met');
    }
    lucide.createIcons({ root: el });
}

function resetPasswordAnalyzer() {
    pwdMeter.style.width = '0%';
    pwdScore.textContent = '0/100';
    pwdStrengthText.textContent = 'None';
    pwdStrengthText.style.color = 'var(--text-main)';
    pwdFeedback.textContent = 'Please enter a password to begin analysis.';
    pwdFeedback.style.borderLeftColor = 'var(--text-muted)';

    [reqLength, reqUpper, reqLower, reqNumber, reqSpecial].forEach(el => updateReqItem(el, false));
}


// ==========================================
// Tool 2: Hash & Cipher Generator
// ==========================================

const hashInput = document.getElementById('hashInput');

const btnGenerateHash = document.getElementById('btnGenerateHash');
const hashResultBox = document.getElementById('hashResultBox');
const hashOutput = document.getElementById('hashOutput');
const btnCopyHash = document.getElementById('btnCopyHash');

btnGenerateHash.addEventListener('click', async () => {
    const text = hashInput.value;
    if (!text) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    hashOutput.textContent = hashHex;
    hashResultBox.classList.remove('hidden');

    hashResultBox.style.animation = 'none';
    hashResultBox.offsetHeight;
    hashResultBox.style.animation = 'fadeIn 0.4s ease forwards';
});

btnCopyHash.addEventListener('click', () => {
    const hash = hashOutput.textContent;
    if (!hash) return;

    navigator.clipboard.writeText(hash).then(() => {
        btnCopyHash.innerHTML = '<i data-lucide="check"></i>';
        lucide.createIcons();
        setTimeout(() => {
            btnCopyHash.innerHTML = '<i data-lucide="copy"></i>';
            lucide.createIcons();
        }, 2000);
    });
});

const btnGenerateCipher = document.getElementById('btnGenerateCipher');
const cipherShiftAmount = document.getElementById('cipherShiftAmount');
const cipherResultBox = document.getElementById('cipherResultBox');
const cipherOutput = document.getElementById('cipherOutput');
const btnCopyCipher = document.getElementById('btnCopyCipher');

btnGenerateCipher.addEventListener('click', () => {
    const text = hashInput.value;
    if (!text) return;

    let shift = parseInt(cipherShiftAmount.value, 10);
    if (isNaN(shift)) shift = 0;

    shift = shift % 26;
    if (shift < 0) shift += 26;

    let result = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char.match(/[A-Z]/)) {
            const code = text.charCodeAt(i);
            result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        else if (char.match(/[a-z]/)) {
            const code = text.charCodeAt(i);
            result += String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        else {
            result += char;
        }
    }

    cipherOutput.textContent = result;
    cipherResultBox.classList.remove('hidden');

    cipherResultBox.style.animation = 'none';
    cipherResultBox.offsetHeight;
    cipherResultBox.style.animation = 'fadeIn 0.4s ease forwards';
});

btnCopyCipher.addEventListener('click', () => {
    const cipherText = cipherOutput.textContent;
    if (!cipherText) return;

    navigator.clipboard.writeText(cipherText).then(() => {
        btnCopyCipher.innerHTML = '<i data-lucide="check"></i>';
        lucide.createIcons();
        setTimeout(() => {
            btnCopyCipher.innerHTML = '<i data-lucide="copy"></i>';
            lucide.createIcons();
        }, 2000);
    });
});

// ==========================================
// Caesar Cipher Decoder Logic
// ==========================================

const btnDecodeCipher = document.getElementById('btnDecodeCipher');
const decodeShiftAmount = document.getElementById('decodeShiftAmount');
const decodeInput = document.getElementById('decodeInput');
const decodeResultBox = document.getElementById('decodeResultBox');
const decodeOutput = document.getElementById('decodeOutput');
const btnCopyDecode = document.getElementById('btnCopyDecode');

btnDecodeCipher.addEventListener('click', () => {
    const text = decodeInput.value;
    if (!text) return;

    let shift = parseInt(decodeShiftAmount.value, 10);
    if (isNaN(shift)) shift = 0;

    shift = -(shift % 26);
    if (shift < 0) shift += 26;

    let result = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char.match(/[A-Z]/)) {
            const code = text.charCodeAt(i);
            result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        else if (char.match(/[a-z]/)) {
            const code = text.charCodeAt(i);
            result += String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        else {
            result += char;
        }
    }

    decodeOutput.textContent = result;
    decodeResultBox.classList.remove('hidden');

    decodeResultBox.style.animation = 'none';
    decodeResultBox.offsetHeight;
    decodeResultBox.style.animation = 'fadeIn 0.4s ease forwards';
});

btnCopyDecode.addEventListener('click', () => {
    const decodedText = decodeOutput.textContent;
    if (!decodedText) return;

    navigator.clipboard.writeText(decodedText).then(() => {
        btnCopyDecode.innerHTML = '<i data-lucide="check"></i>';
        lucide.createIcons();
        setTimeout(() => {
            btnCopyDecode.innerHTML = '<i data-lucide="copy"></i>';
            lucide.createIcons();
        }, 2000);
    });
});


// ==========================================
// Tool 3: Phishing URL Checker
// ==========================================

const urlInput = document.getElementById('urlInput');
const btnAnalyzeUrl = document.getElementById('btnAnalyzeUrl');
const urlResultBox = document.getElementById('urlResultBox');
const urlRiskBadge = document.getElementById('urlRiskBadge');
const urlFindings = document.getElementById('urlFindings');

btnAnalyzeUrl.addEventListener('click', async () => {
    const urlString = urlInput.value.trim();
    if (!urlString) return;

    const originalBtnHTML = btnAnalyzeUrl.innerHTML;
    btnAnalyzeUrl.innerHTML = '<i data-lucide="loader" class="spin"></i> Analyzing...';
    btnAnalyzeUrl.disabled = true;
    lucide.createIcons();

    let url;
    try {
        url = new URL(urlString.startsWith('http') ? urlString : `http://${urlString}`);
    } catch (e) {
        showUrlResult('High Risk', 'danger', [{
            icon: 'alert-triangle',
            text: 'Invalid URL format. Malformed URLs are often a sign of malicious intent or hidden payloads.'
        }]);
        btnAnalyzeUrl.innerHTML = originalBtnHTML;
        btnAnalyzeUrl.disabled = false;
        lucide.createIcons();
        return;
    }

    const findings = [];
    let riskLevel = 'Safe';
    let riskClass = 'safe';
    let riskScore = 0;

    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    if (ipRegex.test(url.hostname)) {
        findings.push({ icon: 'alert-circle', text: 'Uses an IP address instead of a domain name to obscure the destination.' });
        riskScore += 50;
    }

    if (urlString.length > 75) {
        findings.push({ icon: 'eye-off', text: `Suspiciously long URL (${urlString.length} chars). Often used to hide the true domain out of view.` });
        riskScore += 20;
    }

    const domainParts = url.hostname.split('.');
    if (domainParts.length > 4 && !ipRegex.test(url.hostname)) {
        findings.push({ icon: 'layers', text: 'Excessive subdomains detected. Could be an attempt to fake a reputable domain (e.g., login.target.com.badguy.net).' });
        riskScore += 30;
    }

    const susKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'wallet', 'auth', 'confirm'];
    const foundKeywords = susKeywords.filter(kw => url.hostname.includes(kw) || url.pathname.includes(kw));

    if (foundKeywords.length > 0) {
        findings.push({ icon: 'alert-triangle', text: `Contains deceptive urgency/auth keywords: ${foundKeywords.join(', ')}.` });
        riskScore += 25;
    }

    if (url.username || url.password || urlString.includes('@')) {
        findings.push({ icon: 'at-sign', text: 'URL contains "@" symbol. Browsers typically ignore everything before the "@", redirecting to the actual host afterward.' });
        riskScore += 40;
    }

    try {
        const res = await fetch('https://web-production-7324.up.railway.app/api/check-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlString })
        });

        if (res.ok) {
            const data = await res.json();

            if (data.malicious > 0 || data.suspicious > 0) {
                findings.unshift({
                    icon: 'shield-alert',
                    text: `<strong>VirusTotal Detection:</strong> Flagged by ${data.malicious} engine(s) as malicious and ${data.suspicious} as suspicious.`
                });
                riskScore += (data.malicious * 50) + (data.suspicious * 20);
            } else if (data.harmless > 0) {
                findings.push({
                    icon: 'shield-check',
                    text: `<strong>VirusTotal Analysis:</strong> ${data.harmless} security vendors classified this as harmless.`
                });
            } else if (data.error) {
                findings.push({ icon: 'server-crash', text: `Server warning: ${data.error}` });
            }
        } else {
            findings.push({ icon: 'server-crash', text: 'Failed to retrieve deep analysis from backend API.' });
        }
    } catch (err) {
        findings.push({ icon: 'wifi-off', text: 'Backend API unreachable. Falling back to local static analysis only.' });
    }

    if (riskScore === 0) {
        findings.push({ icon: 'shield-check', text: 'No static or external phishing indicators detected.' });
    } else if (riskScore < 50) {
        riskLevel = 'Suspicious';
        riskClass = 'suspicious';
    } else {
        riskLevel = 'High Risk';
        riskClass = 'danger';
    }

    showUrlResult(riskLevel, riskClass, findings);

    btnAnalyzeUrl.innerHTML = originalBtnHTML;
    btnAnalyzeUrl.disabled = false;
    lucide.createIcons();
});

function showUrlResult(level, className, findings) {
    urlResultBox.classList.remove('hidden');

    urlRiskBadge.className = `risk-indicator ${className}`;
    const iconObj = {
        'safe': 'shield-check',
        'suspicious': 'alert-triangle',
        'danger': 'shield-alert'
    };
    urlRiskBadge.innerHTML = `<i data-lucide="${iconObj[className]}"></i> Result: ${level}`;

    urlFindings.innerHTML = '';
    findings.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<i data-lucide="${f.icon}"></i> <span>${f.text}</span>`;
        urlFindings.appendChild(li);
    });

    lucide.createIcons();
}

// ==========================================
// Tool 4: File Analyzer
// ==========================================

const fileDropZone = document.getElementById('fileDropZone');
const fileInput = document.getElementById('fileInput');
const fileResultBox = document.getElementById('fileResultBox');

const fName = document.getElementById('fileMetaName');
const fSize = document.getElementById('fileMetaSize');
const fType = document.getElementById('fileMetaType');
const fDate = document.getElementById('fileMetaDate');

const fileRiskBadge = document.getElementById('fileRiskBadge');
const fileFindings = document.getElementById('fileFindings');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

['dragenter', 'dragover'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, () => fileDropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, () => fileDropZone.classList.remove('dragover'), false);
});

fileDropZone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFileSelect, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) analyzeFile(files[0]);
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) analyzeFile(e.target.files[0]);
}

async function analyzeFile(file) {
    fName.textContent = file.name;
    fSize.textContent = formatBytes(file.size);
    fType.textContent = file.type || 'Unknown / Binary';
    fDate.textContent = file.lastModifiedDate ? file.lastModifiedDate.toLocaleString() : new Date(file.lastModified).toLocaleString();

    fileRiskBadge.className = `risk-indicator`;
    fileRiskBadge.innerHTML = `<i data-lucide="loader" class="spin"></i> Uploading to VirusTotal...`;
    fileFindings.innerHTML = '';
    lucide.createIcons();
    fileResultBox.classList.remove('hidden');

    let riskScore = 0;
    const findings = [];
    const fileName = file.name.toLowerCase();

    const highRiskExts = ['.exe', '.bat', '.cmd', '.msi', '.vbs', '.ps1', '.js', '.wsf', '.scr', '.pif'];
    if (highRiskExts.some(ext => fileName.endsWith(ext))) {
        findings.push({ icon: 'alert-triangle', text: `Contains a highly dangerous file extension. Executable files can run arbitrary code.` });
        riskScore += 80;
    }

    const macroExts = ['.docm', '.xlsm', '.pptm', '.dotm'];
    if (macroExts.some(ext => fileName.endsWith(ext))) {
        findings.push({ icon: 'alert-circle', text: `This is a macro-enabled Office document. Macros are frequently used by attackers.` });
        riskScore += 60;
    }

    const nameParts = fileName.split('.');
    if (nameParts.length > 2) {
        const combo = `${nameParts[nameParts.length - 2]}.${nameParts[nameParts.length - 1]}`;
        const safeDoubles = ['tar.gz', 'min.js', 'min.css', 'd.ts'];
        if (!safeDoubles.includes(combo)) {
            findings.push({ icon: 'eye-off', text: `Double extension detected (.${combo}). Attackers use this to trick Windows users.` });
            riskScore += 50;
        }
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('https://web-production-7324.up.railway.app/api/scan-file', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            if (data.malicious > 0 || data.suspicious > 0) {
                findings.unshift({
                    icon: 'shield-alert',
                    text: `<strong>VirusTotal Deep Scan:</strong> Flagged by ${data.malicious} engine(s) as malicious and ${data.suspicious} as suspicious.`
                });
                riskScore += (data.malicious * 50);
            } else if (data.harmless > 0 || data.undetected > 0) {
                findings.push({
                    icon: 'shield-check',
                    text: `<strong>VirusTotal Deep Scan:</strong> Clean. ${data.harmless + data.undetected} engines detected no threats.`
                });
            } else if (data.error) {
                findings.push({ icon: 'server-crash', text: `Server analysis warning: ${data.error}` });
            }
        } else {
            findings.push({ icon: 'server-crash', text: 'Failed to retrieve deep analysis from backend API.' });
        }

    } catch (err) {
        findings.push({ icon: 'wifi-off', text: 'Backend API unreachable. Analysis relies purely on local static checks.' });
    }

    let riskLevel = 'Safe';
    let riskClass = 'safe';

    if (riskScore === 0) {
        if (findings.length === 0) {
            findings.push({ icon: 'shield-check', text: 'File appears to be a standard document or media type with no obvious static threat indicators.' });
        }
    } else if (riskScore < 50) {
        riskLevel = 'Suspicious';
        riskClass = 'suspicious';
    } else {
        riskLevel = 'High Risk';
        riskClass = 'danger';
    }

    showFileResult(riskLevel, riskClass, findings);
}

function showFileResult(level, className, findings) {
    fileRiskBadge.className = `risk-indicator ${className}`;
    const iconObj = {
        'safe': 'shield-check',
        'suspicious': 'alert-triangle',
        'danger': 'shield-alert'
    };
    fileRiskBadge.innerHTML = `<i data-lucide="${iconObj[className]}"></i> Result: ${level}`;

    fileFindings.innerHTML = '';
    findings.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<i data-lucide="${f.icon}"></i> <span>${f.text}</span>`;
        fileFindings.appendChild(li);
    });

    lucide.createIcons();
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ==========================================
// Chatbot Logic Complete Rebuild
// ==========================================

const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSendBtn = document.getElementById('chatbot-send-btn');
const chatbotMessages = document.getElementById('chatbot-messages');

const GEMINI_API_KEY = 'AIzaSyDCn_kAo6wUxzPvAdc-Dxf9aRd76yhG6vs';
const SYSTEM_PROMPT = `You are BlackICE Assistant, a cybersecurity chatbot built into the BlackICE toolkit. You have two areas of expertise:
1. About BlackICE project:
BlackICE is a free web-based cybersecurity toolkit built by students Adarsh S, Prachi N and Swanandi N. It has 5 tools:
Password Analyzer: checks password strength in real time, scores it, estimates crack time. Runs entirely in JavaScript — password never leaves the device.
SHA-256 Hash Generator: converts any text into a cryptographic hash using the browser's built-in Web Crypto API. One way — cannot be reversed.
Caesar Cipher: encrypts and decrypts text using a shift value. Both encoder and decoder are available.
Phishing URL Checker: analyzes URLs using heuristic pattern checks and VirusTotal deep scan across 70+ antivirus engines.
File Analyzer: reads file metadata, hex preview, calculates SHA-256 hash, and runs a VirusTotal malware scan. Files never leave the device.
The frontend is hosted on GitHub Pages. The backend is Python Flask hosted on Railway. VirusTotal API key is secured in Railway environment variables. Live at: adarshx001.github.io/blackice-2.0

2. About cybersecurity in general:
Answer any cybersecurity question clearly and simply — hashing, encryption, phishing, malware, firewalls, VPNs, SQL injection, XSS, network security, ethical hacking, or anything else related to cybersecurity.
Keep all answers simple, clear and educational. If asked something completely unrelated to cybersecurity or BlackICE, politely say you can only help with cybersecurity topics.`;

let chatHistory = [];

function toggleChatbot() {
    chatbotContainer.classList.toggle('chatbot-hidden');
    if (!chatbotContainer.classList.contains('chatbot-hidden')) {
        setTimeout(() => chatbotInput.focus(), 100);
    }
}

chatbotToggleBtn.addEventListener('click', toggleChatbot);
chatbotCloseBtn.addEventListener('click', toggleChatbot);

function addChatMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');
    msgDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    
    // Parse basic markdown: bolding
    let formattedText = text.replace(/\\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    msgDiv.innerHTML = formattedText;
    
    chatbotMessages.appendChild(msgDiv);
    // Auto scroll to latest message
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatbotMessages.appendChild(indicator);
    // Auto scroll to latest message
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

async function sendChatMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;
    
    chatbotInput.value = '';
    addChatMessage(text, 'user');
    showTypingIndicator();
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }],
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
            })
        });
        
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            addChatMessage(aiText, 'ai');
        } else {
            addChatMessage("I'm sorry, I couldn't generate a response.", 'ai');
            if (data.error) console.error('Gemini API Error:', data.error);
        }
    } catch (err) {
        removeTypingIndicator();
        addChatMessage("Connection error. Please try again later.", 'ai');
        console.error('Chatbot error:', err);
    }
}

chatbotSendBtn.addEventListener('click', sendChatMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});
