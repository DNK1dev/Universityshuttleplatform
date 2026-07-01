  document.addEventListener('DOMContentLoaded', () => {
 
    // Backend Node.js API Base URL Configuration
    const API_BASE_URL = 'https://universityshuttleplatform-1.onrender.com/api';

    // BACKEND ROUTE GUARD: Check validation tags upon immediate page startup instantiation
    const activeSessionToken = localStorage.getItem('shuttle_user_token');
    
    // 1. Core Layout Section Container Elements (DECLARED ONCE ONLY)
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    
    // Auth Sliding Views Subcontainers
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    
    // Auth View Switching Interactive Link Triggers
    const linkToRegister = document.getElementById('linkToRegister');
    const linkToLogin = document.getElementById('linkToLogin');
    
    // Form and Event Triggers
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const btnLogout = document.getElementById('btnLogout');
    
    // Notification Message Output Nodes
    const errorDisplay = document.getElementById('errorMessage');
    const regErrorDisplay = document.getElementById('registerErrorMessage');
    const regSuccessDisplay = document.getElementById('registerSuccessMessage');

    // Live Tracking Map Variables
    let liveSimulationInterval = null;
    const shuttleState = {
        bus01: { cardEtaId: 'eta1', tableEtaId: 'tableEta1', etaValue: 4 },
        bus02: { cardEtaId: 'eta2', tableEtaId: 'tableEta2', etaValue: 6 }
    };

    // Route Guard Trigger Check
    if (activeSessionToken) {
        authSection.classList.add('view-hidden');
        dashboardSection.classList.remove('view-hidden');
        startLiveShuttleSimulation();
    }

    // ==========================================
    // LAYER A: REGISTRATION PANEL TOGGLE LOGIC
    // ==========================================
    
    linkToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('view-hidden');
        registerView.classList.remove('view-hidden');
        loginForm.reset();
        errorDisplay.style.display = 'none';
    });

    linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('view-hidden');
        loginView.classList.remove('view-hidden');
        registerForm.reset();
        regErrorDisplay.style.display = 'none';
        regSuccessDisplay.style.display = 'none';
    });

    // ==========================================
    // LAYER B: CONNECTED BACKEND SIGN-UP LOGIC
    // ==========================================

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        regErrorDisplay.style.display = 'none';
        regSuccessDisplay.style.display = 'none';

        const fullNameInput = document.getElementById('regFullName').value.trim();
        const emailInput = document.getElementById('regEmail').value.trim();
        const passwordInput = document.getElementById('regPassword').value;
        const confirmPasswordInput = document.getElementById('regConfirmPassword').value;

        if (passwordInput !== confirmPasswordInput) {
            regErrorDisplay.textContent = 'Passwords do not match. Please verify fields.';
            regErrorDisplay.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: fullNameInput,
                    email: emailInput,
                    password: passwordInput
                })
            });

            const data = await response.json();

            if (response.ok) {
                regSuccessDisplay.textContent = data.message || 'Account created securely!';
                regSuccessDisplay.style.display = 'block';
                registerForm.reset();
            } else {
                regErrorDisplay.textContent = data.message || 'Registration failed.';
                regErrorDisplay.style.display = 'block';
            }
        } catch (error) {
            regErrorDisplay.textContent = 'Cannot connect to backend authentication server.';
            regErrorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // LAYER C: CONNECTED BACKEND SIGN-IN LOGIC
    // ==========================================

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorDisplay.style.display = 'none';

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usernameInput,
                    password: passwordInput
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('shuttle_user_token', data.token);
                authSection.classList.add('view-hidden');
                dashboardSection.classList.remove('view-hidden');
                startLiveShuttleSimulation();
            } else {
                errorDisplay.textContent = data.message || 'Invalid login details.';
                errorDisplay.style.display = 'block';
            }
        } catch (error) {
            errorDisplay.textContent = 'Cannot connect to backend authentication server.';
            errorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // LAYER D: SIGN-OUT SESSION TERMINATION
    // ==========================================

    btnLogout.addEventListener('click', () => {
        if (liveSimulationInterval) clearTimeout(liveSimulationInterval);

        localStorage.removeItem('shuttle_user_token');
        loginForm.reset();
        errorDisplay.style.display = 'none';

        dashboardSection.classList.add('view-hidden');
        authSection.classList.remove('view-hidden');
        registerView.classList.add('view-hidden');
        loginView.classList.remove('view-hidden');
    });

    // ==========================================
    // LAYER E: LIVE REAL-TIME MAP STREAM SIMULATOR
    // ==========================================

    function updateShuttleETA(shuttle, newMinutes) {
        shuttle.etaValue = Math.max(0, newMinutes);
        const cardText = shuttle.etaValue === 0 ? "ETA: Arrived" : `ETA: ${shuttle.etaValue} Minutes`;
        const tableText = shuttle.etaValue === 0 ? "Arrived" : `${shuttle.etaValue} mins`;

        const cardElement = document.getElementById(shuttle.cardEtaId);
        const tableElement = document.getElementById(shuttle.tableEtaId);

        if (cardElement) cardElement.textContent = cardText;
        if (tableElement) tableElement.textContent = tableText;
    }

    function updateLiveMapLocation(latitude, longitude) {
    const mapFrame = document.getElementById('map');
    if (mapFrame) {
        mapFrame.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    }
}


    function startLiveShuttleSimulation() {
        console.log("Connected Live Dashboard actively streaming satellite mapping feeds...");
        liveSimulationInterval = setTimeout(() => {
            updateShuttleETA(shuttleState.bus01, 2);
            updateLiveMapLocation(6.5255, 3.3800);
        }, 3000);
    }
});