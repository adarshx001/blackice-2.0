// ==========================================
// Routing & Navigation
// ==========================================

function navigateTo(viewId, pushToHistory = true) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Set active link (handling both desktop and mobile links if they share classes)
    const targetLinks = document.querySelectorAll(`.nav-item[data-view="${viewId}"]`);
    targetLinks.forEach(link => {
        link.classList.add('active');
    });
    
    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    if (navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
    }
    
    // Update Browser History (for mobile back button support)
    if (pushToHistory) {
        history.pushState({ viewId }, document.title, `#${viewId}`);
    }
}

// Handle Browser Back/Forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.viewId) {
        navigateTo(e.state.viewId, false); // false = don't push history again
    } else {
        // Fallback to home if no state
        navigateTo('home', false);
    }
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    // Check if URL has a hash initially
    let hash = window.location.hash.substring(1);
    if (!hash || !document.getElementById(`view-${hash}`)) {
        hash = 'home';
    }
    
    // Replace initial state
    history.replaceState({ viewId: hash }, document.title, `#${hash}`);
    navigateTo(hash, false);
});

// Mobile Menu Toggle
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

// Requirements Elements
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
    
    // Checks
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    // Update UI indicators
    updateReqItem(reqLength, hasLength);
    updateReqItem(reqUpper, hasUpper);
    updateReqItem(reqLower, hasLower);
    updateReqItem(reqNumber, hasNumber);
    updateReqItem(reqSpecial, hasSpecial);

    // Calculate Score (Max ~100)
    score += Math.min(password.length * 4, 40); // Up to 40 pts for length
    if (hasUpper) score += 15;
    if (hasLower) score += 15;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;

    // Bonus for combinations
    if (hasLength && hasUpper && hasLower && hasNumber && hasSpecial) {
        score += 10; 
    }
    
    // Penalty for predictable patterns (simple mock check)
    const lowerPw = password.toLowerCase();
    if (lowerPw.includes('password') || lowerPw.includes('123456') || lowerPw.includes('qwerty')) {
        score -= 30;
    }

    score = Math.max(0, Math.min(100, score)); // Clamp 0-100

    // Update UI
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

// SHA-256 logic
const btnGenerateHash = document.getElementById('btnGenerateHash');
const hashResultBox = document.getElementById('hashResultBox');
const hashOutput = document.getElementById('hashOutput');
const btnCopyHash = document.getElementById('btnCopyHash');

btnGenerateHash.addEventListener('click', async () => {
    const text = hashInput.value;
    if (!text) return;

    // Convert string to array buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generate hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    hashOutput.textContent = hashHex;
    hashResultBox.classList.remove('hidden');
    
    // Add small glow effect to show generation
    hashResultBox.style.animation = 'none';
    hashResultBox.offsetHeight; /* trigger reflow */
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

// Caesar Cipher Logic
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
    
    // Normalize shift to positive 0-25 range
    shift = shift % 26;
    if (shift < 0) shift += 26;
    
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Uppercase
        if (char.match(/[A-Z]/)) {
            const code = text.charCodeAt(i);
            result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Lowercase
        else if (char.match(/[a-z]/)) {
            const code = text.charCodeAt(i);
            result += String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        // Non-alphabetic (keep as is)
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
// Tool 3: Phishing URL Checker
// ==========================================

const urlInput = document.getElementById('urlInput');
const btnAnalyzeUrl = document.getElementById('btnAnalyzeUrl');
const urlResultBox = document.getElementById('urlResultBox');
const urlRiskBadge = document.getElementById('urlRiskBadge');
const urlFindings = document.getElementById('urlFindings');

btnAnalyzeUrl.addEventListener('click', () => {
    const urlString = urlInput.value.trim();
    if (!urlString) return;

    let url;
    try {
        // Automatically prepend http:// if missing so URL parser works
        url = new URL(urlString.startsWith('http') ? urlString : `http://${urlString}`);
    } catch (e) {
        showUrlResult('High Risk', 'danger', [{
            icon: 'alert-triangle',
            text: 'Invalid URL format. Malformed URLs are often a sign of malicious intent or hidden payloads.'
        }]);
        return;
    }

    const findings = [];
    let riskLevel = 'Safe';
    let riskClass = 'safe';
    let riskScore = 0;

    // 1. IP Address check
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    if (ipRegex.test(url.hostname)) {
        findings.push({ icon: 'alert-circle', text: 'Uses an IP address instead of a domain name to obscure the destination.' });
        riskScore += 50;
    }

    // 2. Length check
    if (urlString.length > 75) {
        findings.push({ icon: 'eye-off', text: `Suspiciously long URL (${urlString.length} chars). Often used to hide the true domain out of view.` });
        riskScore += 20;
    }

    // 3. Subdomain check
    const domainParts = url.hostname.split('.');
    if (domainParts.length > 4 && !ipRegex.test(url.hostname)) {
        findings.push({ icon: 'layers', text: 'Excessive subdomains detected. Could be an attempt to fake a reputable domain (e.g., login.target.com.badguy.net).' });
        riskScore += 30;
    }

    // 4. Suspicious keywords in hostname or path
    const susKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'wallet', 'auth', 'confirm'];
    const foundKeywords = susKeywords.filter(kw => url.hostname.includes(kw) || url.pathname.includes(kw));
    
    if (foundKeywords.length > 0) {
        findings.push({ icon: 'alert-triangle', text: `Contains deceptive urgency/auth keywords: ${foundKeywords.join(', ')}.` });
        riskScore += 25;
    }

    // 5. AT symbol
    if (url.username || url.password || urlString.includes('@')) {
        findings.push({ icon: 'at-sign', text: 'URL contains "@" symbol. Browsers typically ignore everything before the "@", redirecting to the actual host afterward.' });
        riskScore += 40;
    }

    // Determine overall risk
    if (riskScore === 0) {
        findings.push({ icon: 'shield-check', text: 'No immediate static phishing indicators detected.' });
    } else if (riskScore < 50) {
        riskLevel = 'Suspicious';
        riskClass = 'suspicious';
    } else {
        riskLevel = 'High Risk';
        riskClass = 'danger';
    }

    showUrlResult(riskLevel, riskClass, findings);
});

function showUrlResult(level, className, findings) {
    urlResultBox.classList.remove('hidden');
    
    // Set Badge
    urlRiskBadge.className = `risk-indicator ${className}`;
    const iconObj = {
        'safe': 'shield-check',
        'suspicious': 'alert-triangle',
        'danger': 'shield-alert'
    };
    urlRiskBadge.innerHTML = `<i data-lucide="${iconObj[className]}"></i> Result: ${level}`;
    
    // Set Findings
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

// Drag and drop events
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

function analyzeFile(file) {
    // 1. Display Metadata
    fName.textContent = file.name;
    fSize.textContent = formatBytes(file.size);
    fType.textContent = file.type || 'Unknown / Binary';
    fDate.textContent = file.lastModifiedDate ? file.lastModifiedDate.toLocaleString() : new Date(file.lastModified).toLocaleString();

    // 2. Risk Assessment
    let riskScore = 0;
    let riskLevel = 'Safe';
    let riskClass = 'safe';
    const findings = [];
    
    const fileName = file.name.toLowerCase();
    
    // Check for executables and scripts
    const highRiskExts = ['.exe', '.bat', '.cmd', '.msi', '.vbs', '.ps1', '.js', '.wsf', '.scr', '.pif'];
    const hasHighRiskExt = highRiskExts.some(ext => fileName.endsWith(ext));
    if (hasHighRiskExt) {
        findings.push({ icon: 'alert-triangle', text: `Contains a highly dangerous file extension. Executable files can run arbitrary code on your machine.` });
        riskScore += 80;
    }

    // Check for macro-enabled office documents
    const macroExts = ['.docm', '.xlsm', '.pptm', '.dotm'];
    const hasMacroExt = macroExts.some(ext => fileName.endsWith(ext));
    if (hasMacroExt) {
        findings.push({ icon: 'alert-circle', text: `This is a macro-enabled Office document. Macros are frequently used by attackers to download malware payloads.` });
        riskScore += 60;
    }
    
    // Check for archives/disk images often used for smuggling
    const archiveExts = ['.zip', '.rar', '.7z', '.iso', '.img', '.cab'];
    const hasArchiveExt = archiveExts.some(ext => fileName.endsWith(ext));
    if (hasArchiveExt) {
        findings.push({ icon: 'package-open', text: `Archive or disk image file. These are often used to smuggle malicious files past email filters. Extract with caution.` });
        riskScore += 30;
    }
    
    // Check for Double Extensions (e.g., invoice.pdf.exe)
    const nameParts = fileName.split('.');
    if (nameParts.length > 2) {
        // e.g., parts = ["invoice", "pdf", "exe"]
        const secondToLast = nameParts[nameParts.length - 2];
        const last = nameParts[nameParts.length - 1];
        
        // Common safe multi-extensions (tar.gz, min.js, etc.)
        const safeDoubles = ['tar.gz', 'min.js', 'min.css', 'd.ts'];
        const combo = `${secondToLast}.${last}`;
        
        if (!safeDoubles.includes(combo)) {
            findings.push({ icon: 'eye-off', text: `Double extension detected (.${secondToLast}.${last}). Attackers use this to trick Windows users into thinking an executable is a document.`});
            riskScore += 50;
        }
    }
    
    // Determine overall risk
    if (riskScore === 0) {
        findings.push({ icon: 'shield-check', text: 'File appears to be a standard document or media type with no obvious static threat indicators.' });
    } else if (riskScore < 50) {
        riskLevel = 'Suspicious';
        riskClass = 'suspicious';
    } else {
        riskLevel = 'High Risk';
        riskClass = 'danger';
    }

    showFileResult(riskLevel, riskClass, findings);
    
    fileResultBox.classList.remove('hidden');
}

function showFileResult(level, className, findings) {
    // Set Badge
    fileRiskBadge.className = `risk-indicator ${className}`;
    const iconObj = {
        'safe': 'shield-check',
        'suspicious': 'alert-triangle',
        'danger': 'shield-alert'
    };
    fileRiskBadge.innerHTML = `<i data-lucide="${iconObj[className]}"></i> Result: ${level}`;
    
    // Set Findings
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
