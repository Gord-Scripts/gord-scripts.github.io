// ============================================================================
// Gord Scripts - Enhanced JavaScript
// Modern features, animations, and bug fixes
// ============================================================================

class GordScripts {
    constructor() {
        this.scripts = [];
        this.currentUser = null;
        this.currentTags = [];
        this.currentScriptId = null;
        this.currentStep = 1;
        this.isLoading = false;
        
        this.config = {
            STORAGE_KEY: 'gordScriptsData',
            SHARE_BASE_URL: window.location.origin + window.location.pathname,
            API_BASE: '/api'
        };
        
        this.init();
    }

    async init() {
        // Initialize particles
        this.initParticles();
        
        // Load data
        await this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check URL parameters
        this.checkUrlParameters();
        
        // Initialize animations
        this.initAnimations();
        
        // Hide preloader
        this.hidePreloader();
        
        console.log('🚀 Gord Scripts initialized successfully!');
    }

    // Particle Background
    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: '#6366f1' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: true },
                    size: { value: 3, random: true },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#6366f1',
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out',
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'grab' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true
                    }
                }
            });
        }
    }

    // Data Management
    async loadData() {
        try {
            const savedData = localStorage.getItem(this.config.STORAGE_KEY);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.scripts = data.scripts || [];
                this.currentUser = data.currentUser || null;
            } else {
                await this.createDemoData();
            }
            
            this.renderScripts();
            this.updateStats();
            this.updateAuthUI();
        } catch (error) {
            console.error('Error loading data:', error);
            await this.createDemoData();
        }
    }

    async saveData() {
        const dataToSave = {
            scripts: this.scripts,
            currentUser: this.currentUser,
            totalScripts: this.scripts.length,
            totalViews: this.scripts.reduce((acc, script) => acc + (script.views || 0), 0),
            totalDownloads: this.scripts.reduce((acc, script) => acc + (script.downloads || 0), 0),
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(this.config.STORAGE_KEY, JSON.stringify(dataToSave));
        this.updateStats();
        this.showNotification('Данные сохранены!', 'success');
    }

    async createDemoData() {
        this.scripts = [
            {
                id: this.generateId(),
                title: "Авто-фарм монет Brookhaven",
                description: "Автоматический сбор монет с настройкой интервалов и фильтрацией",
                code: `-- Авто-фарм для Brookhaven RP
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local player = Players.LocalPlayer

local collectDelay = 1 -- Задержка между сбором
local coinTypes = {"Coin", "Money", "Dollar"} -- Типы собираемых объектов

function collectCoins()
    for _, obj in pairs(workspace:GetDescendants()) do
        if obj:IsA("Part") and table.find(coinTypes, obj.Name) then
            firetouchinterest(obj, player.Character.HumanoidRootPart, 0)
            task.wait(0.1)
            firetouchinterest(obj, player.Character.HumanoidRootPart, 1)
        end
    end
end

-- Основной цикл сбора
while true do
    if player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
        collectCoins()
    end
    task.wait(collectDelay)
end`,
                author: "Gord",
                game: "Brookhaven",
                tags: ["авто-фарм", "монеты", "брукхейвен", "автоматизация"],
                createdAt: new Date().toISOString(),
                views: 1542,
                likes: 128,
                downloads: 567,
                rating: 4.8
            },
            {
                id: this.generateId(),
                title: "ESP для игроков Universal",
                description: "Отображение игроков через стены с настройкой цветов и расстояния",
                code: `-- Universal ESP Script
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local LocalPlayer = Players.LocalPlayer

local espEnabled = true
local maxDistance = 500 -- Максимальная дистанция отображения
local teamColor = Color3.fromRGB(0, 255, 0) -- Цвет союзников
local enemyColor = Color3.fromRGB(255, 0, 0) -- Цвет врагов

function createESP(player)
    if player == LocalPlayer then return end
    
    local highlight = Instance.new("Highlight")
    highlight.FillColor = enemyColor
    highlight.OutlineColor = Color3.fromRGB(255, 255, 255)
    highlight.FillTransparency = 0.3
    highlight.OutlineTransparency = 0
    highlight.Parent = player.Character
    highlight.Name = "ESP_" .. player.Name
    highlight.Adornee = player.Character
end

function updateESP()
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character then
            local distance = (LocalPlayer.Character.HumanoidRootPart.Position - 
                            player.Character.HumanoidRootPart.Position).Magnitude
            if distance <= maxDistance then
                if not player.Character:FindFirstChild("ESP_" .. player.Name) then
                    createESP(player)
                end
            else
                local esp = player.Character:FindFirstChild("ESP_" .. player.Name)
                if esp then esp:Destroy() end
            end
        end
    end
end

-- Обработчики событий
Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function()
        if espEnabled then
            createESP(player)
        end
    end)
end)

-- Основной цикл обновления
RunService.Heartbeat:Connect(function()
    if espEnabled then
        updateESP()
    end
end)`,
                author: "Gord",
                game: "Universal",
                tags: ["ESP", "игроки", "видимость", "радар"],
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                views: 2341,
                likes: 198,
                downloads: 892,
                rating: 4.9
            },
            {
                id: this.generateId(),
                title: "Авто-ферма Pet Simulator X",
                description: "Автоматическая ферма питомцев с интеллектуальным сбором",
                code: `-- Auto Farm для Pet Simulator X
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local player = Players.LocalPlayer

local farmSpeed = 1 -- Скорость фарма
local preferredPets = {"Dominus", "Huge", "Exclusive"} -- Приоритетные питомцы

function collectPets()
    local pets = Workspace:FindFirstChild("Pets")
    if pets then
        for _, pet in pairs(pets:GetChildren()) do
            if pet:FindFirstChild("HumanoidRootPart") then
                -- Интеллектуальный выбор питомцев
                local shouldCollect = false
                for _, preferred in ipairs(preferredPets) do
                    if string.find(pet.Name, preferred) then
                        shouldCollect = true
                        break
                    end
                end
                
                if shouldCollect then
                    player.Character.HumanoidRootPart.CFrame = pet.HumanoidRootPart.CFrame
                    task.wait(0.2)
                end
            end
        end
    end
end

-- Основной цикл фарма
while true do
    if player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
        collectPets()
    end
    task.wait(farmSpeed)
end`,
                author: "ProGamer",
                game: "Pet Simulator X",
                tags: ["авто-фарм", "питомцы", "ферма", "автоматизация"],
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                views: 1890,
                likes: 145,
                downloads: 623,
                rating: 4.7
            }
        ];
        
        await this.saveData();
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    // DOM Utilities
    $(selector) {
        return document.querySelector(selector);
    }

    $$(selector) {
        return document.querySelectorAll(selector);
    }

    // Rendering
    renderScripts(filteredScripts = null) {
        const scriptsGrid = this.$('#scriptsGrid');
        const scriptsToRender = filteredScripts || this.scripts;
        
        if (scriptsToRender.length === 0) {
            scriptsGrid.innerHTML = `
                <div class="no-scripts">
                    <div class="no-scripts-icon">📝</div>
                    <h3>СКРИПТОВ НЕ НАЙДЕНО</h3>
                    <p>Попробуйте изменить параметры поиска или загрузите первый скрипт!</p>
                    <button class="btn btn-primary" onclick="gordScripts.showUploadModal()">
                        <i class="fas fa-upload"></i>
                        ЗАГРУЗИТЬ СКРИПТ
                    </button>
                </div>
            `;
            return;
        }
        
        scriptsGrid.innerHTML = scriptsToRender.map(script => `
            <div class="script-card animate-on-scroll" onclick="gordScripts.openScriptView('${script.id}')">
                <div class="script-header">
                    <div>
                        <h3 class="script-title">${this.escapeHtml(script.title)}</h3>
                        <div class="script-meta">
                            <span class="script-author">
                                <i class="fas fa-user"></i>
                                ${this.escapeHtml(script.author)}
                            </span>
                            <span class="script-date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDate(script.createdAt)}
                            </span>
                            <span class="script-views">
                                <i class="fas fa-eye"></i>
                                ${script.views || 0}
                            </span>
                        </div>
                    </div>
                    <span class="script-badge">${this.escapeHtml(script.game)}</span>
                </div>
                
                <p class="script-description">${this.escapeHtml(script.description)}</p>
                
                ${script.tags && script.tags.length > 0 ? `
                    <div class="script-tags">
                        ${script.tags.slice(0, 4).map(tag => `
                            <span class="tag">${this.escapeHtml(tag)}</span>
                        `).join('')}
                        ${script.tags.length > 4 ? `<span class="tag">+${script.tags.length - 4}</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="script-stats">
                    <div class="script-stat">
                        <i class="fas fa-eye"></i> ${script.views || 0}
                    </div>
                    <div class="script-stat">
                        <i class="fas fa-heart"></i> ${script.likes || 0}
                    </div>
                    <div class="script-stat">
                        <i class="fas fa-download"></i> ${script.downloads || 0}
                    </div>
                    <div class="script-stat">
                        <i class="fas fa-star"></i> ${script.rating || '4.5'}
                    </div>
                </div>
                
                <div class="script-actions">
                    <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); gordScripts.copyScript('${script.id}')">
                        <i class="fas fa-copy"></i>
                        Копировать
                    </button>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); gordScripts.shareScript('${script.id}')">
                        <i class="fas fa-share"></i>
                        Поделиться
                    </button>
                </div>
            </div>
        `).join('');
        
        // Re-initialize scroll animations
        this.initScrollAnimations();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Search and Filter
    searchScripts() {
        const searchTerm = this.$('#scriptSearch').value.toLowerCase();
        const gameFilter = this.$('#gameFilter').value;
        const sortFilter = this.$('#sortFilter').value;
        
        let filteredScripts = this.scripts.filter(script => {
            const matchesSearch = !searchTerm || 
                script.title.toLowerCase().includes(searchTerm) ||
                script.description.toLowerCase().includes(searchTerm) ||
                script.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            const matchesGame = !gameFilter || script.game === gameFilter;
            
            return matchesSearch && matchesGame;
        });
        
        // Sort scripts
        switch (sortFilter) {
            case 'popular':
                filteredScripts.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'downloads':
                filteredScripts.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                break;
            case 'views':
                filteredScripts.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'newest':
            default:
                filteredScripts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        
        this.renderScripts(filteredScripts);
    }

    // Modal Management
    showUploadModal() {
        if (!this.currentUser) {
            this.showNotification('Для загрузки скриптов необходимо войти в систему', 'error');
            this.showAuthModal('register');
            return;
        }
        
        this.currentTags = [];
        this.currentStep = 1;
        
        const form = this.$('#scriptUploadForm');
        if (form) form.reset();
        
        const tagsList = this.$('#tagsList');
        if (tagsList) tagsList.innerHTML = '';
        
        this.updateUploadSteps();
        this.showModal('uploadModal');
    }

    updateUploadSteps() {
        // Update step indicators
        this.$$('.step').forEach((step, index) => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update form steps
        this.$$('.form-step').forEach(step => {
            if (parseInt(step.dataset.step) === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update navigation buttons
        const prevBtn = this.$('#prevStep');
        const nextBtn = this.$('#nextStep');
        const submitBtn = this.$('#submitForm');
        
        if (this.currentStep === 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        } else if (this.currentStep === 3) {
            prevBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            prevBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    nextStep() {
        if (this.currentStep < 3) {
            // Validate current step
            if (this.validateStep(this.currentStep)) {
                this.currentStep++;
                this.updateUploadSteps();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUploadSteps();
        }
    }

    validateStep(step) {
        switch (step) {
            case 1:
                const title = this.$('#scriptTitle').value.trim();
                const game = this.$('#scriptGame').value;
                const description = this.$('#scriptDescription').value.trim();
                
                if (!title) {
                    this.showNotification('Введите название скрипта', 'error');
                    return false;
                }
                if (!game) {
                    this.showNotification('Выберите игру', 'error');
                    return false;
                }
                if (!description) {
                    this.showNotification('Введите описание скрипта', 'error');
                    return false;
                }
                return true;
                
            case 2:
                const code = this.$('#scriptCode').value.trim();
                if (!code) {
                    this.showNotification('Введите код скрипта', 'error');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }

    // Script Management
    async uploadScript() {
        if (!this.validateStep(3)) return;
        
        const title = this.$('#scriptTitle').value.trim();
        const description = this.$('#scriptDescription').value.trim();
        const code = this.$('#scriptCode').value.trim();
        const game = this.$('#scriptGame').value;
        
        const newScript = {
            id: this.generateId(),
            title,
            description,
            code,
            author: this.currentUser.username,
            game,
            tags: [...this.currentTags],
            createdAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            downloads: 0,
            rating: 5.0
        };

        this.scripts.unshift(newScript);
        await this.saveData();
        this.renderScripts();
        this.closeModal('uploadModal');
        
        this.showNotification(`Скрипт "${title}" успешно загружен!`, 'success');
        
        // Auto-share after upload
        setTimeout(() => {
            this.shareScript(newScript.id);
        }, 1000);
    }

    openScriptView(scriptId) {
        const script = this.scripts.find(s => s.id === scriptId);
        if (!script) return;

        this.currentScriptId = scriptId;
        
        // Increase view count
        script.views = (script.views || 0) + 1;
        this.saveData();
        
        // Update modal content
        this.$('#viewScriptTitle').textContent = script.title;
        this.$('#viewScriptDescription').textContent = script.description;
        this.$('#viewScriptCode').textContent = script.code;
        
        this.$('#viewScriptMeta').innerHTML = `
            <div class="script-meta">
                <span class="script-author">
                    <i class="fas fa-user"></i>
                    ${script.author}
                </span>
                <span class="script-date">
                    <i class="fas fa-calendar"></i>
                    ${this.formatDate(script.createdAt)}
                </span>
                <span class="script-views">
                    <i class="fas fa-eye"></i>
                    ${script.views}
                </span>
                <span class="script-game">
                    <i class="fas fa-gamepad"></i>
                    ${script.game}
                </span>
            </div>
        `;
        
        if (script.tags) {
            this.$('#viewScriptTags').innerHTML = script.tags.map(tag => `
                <span class="tag">${tag}</span>
            `).join('');
        }
        
        this.showModal('scriptViewModal');
    }

    copyScript(scriptId) {
        const script = this.scripts.find(s => s.id === scriptId);
        if (!script) return;
        
        navigator.clipboard.writeText(script.code).then(() => {
            this.showNotification('Код скрипта скопирован в буфер обмена!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = script.code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Код скрипта скопирован в буфер обмена!');
        });
    }

    shareScript(scriptId) {
        const script = this.scripts.find(s => s.id === scriptId);
        if (!script) return;
        
        const shareUrl = `${this.config.SHARE_BASE_URL}?script=${scriptId}`;
        
        if (navigator.share) {
            navigator.share({
                title: script.title,
                text: script.description,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showNotification('Ссылка на скрипт скопирована в буфер обмена!');
            }).catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Ссылка на скрипт скопирована в буфер обмена!');
            });
        }
    }

    // Authentication
    showAuthModal(type = 'login') {
        this.$('#authModalTitle').textContent = type === 'login' ? 'Вход в аккаунт' : 'Регистрация';
        
        // Update tabs
        this.$$('.auth-tab').forEach(tab => tab.classList.remove('active'));
        this.$$('.auth-content').forEach(content => content.classList.remove('active'));
        
        this.$(`[data-tab="${type}"]`).classList.add('active');
        this.$(`${type}Form`).classList.add('active');
        
        this.showModal('authModal');
    }

    async login(username, password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.currentUser = {
            id: this.generateId(),
            username: username,
            email: `${username}@example.com`,
            role: 'user',
            joinedAt: new Date().toISOString(),
            uploadedScripts: 0
        };
        
        await this.saveData();
        this.updateAuthUI();
        this.closeModal('authModal');
        this.showNotification(`Добро пожаловать, ${username}!`, 'success');
    }

    async register(username, email, password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.currentUser = {
            id: this.generateId(),
            username: username,
            email: email,
            role: 'user',
            joinedAt: new Date().toISOString(),
            uploadedScripts: 0
        };
        
        await this.saveData();
        this.updateAuthUI();
        this.closeModal('authModal');
        this.showNotification('Регистрация успешна! Добро пожаловать!', 'success');
    }

    logout() {
        this.currentUser = null;
        this.saveData();
        this.updateAuthUI();
        this.showNotification('Вы вышли из системы', 'success');
    }

    updateAuthUI() {
        const authButtons = this.$('#authButtons');
        const userProfile = this.$('#userProfile');
        
        if (this.currentUser) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            this.$('#username').textContent = this.currentUser.username;
        } else {
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    // UI Management
    showModal(modalId) {
        const modal = this.$(`#${modalId}`);
        const overlay = this.$('#overlay');
        
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = this.$(`#${modalId}`);
        const overlay = this.$('#overlay');
        
        if (modal) modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    showSection(sectionId) {
        // Hide all sections
        this.$$('.section').forEach(section => section.classList.remove('active'));
        
        // Show target section
        const targetSection = this.$(`#${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        this.$$('.nav-link').forEach(link => link.classList.remove('active'));
        const activeLink = this.$(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateStats() {
        const totalScripts = this.scripts.length;
        const totalUsers = new Set(this.scripts.map(s => s.author)).size;
        const totalDownloads = this.scripts.reduce((acc, script) => acc + (script.downloads || 0), 0);
        
        this.$('#totalScripts').textContent = totalScripts;
        this.$('#totalUsers').textContent = totalUsers + 150; // Base users + authors
        this.$('#totalDownloads').textContent = totalDownloads;
        
        // Community stats
        this.$('#communityScripts').textContent = totalScripts;
        this.$('#communityUsers').textContent = totalUsers + 150;
        this.$('#communityDownloads').textContent = totalDownloads;
    }

    // Theme Management
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const toggle = this.$('#themeToggle');
        
        if (savedTheme === 'light') {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
            if (toggle) toggle.checked = true;
        } else {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
            if (toggle) toggle.checked = false;
        }
    }

    toggleTheme() {
        const isLight = document.body.classList.contains('theme-light');
        
        if (isLight) {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
            localStorage.setItem('theme', 'light');
        }
    }

    // Animations
    initAnimations() {
        this.initScrollAnimations();
        this.initHeaderScroll();
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.$$('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    initHeaderScroll() {
        let lastScroll = 0;
        const header = this.$('.site-header');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    hidePreloader() {
        const preloader = this.$('.preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('fade-out');
                setTimeout(() => preloader.remove(), 500);
            }, 1000);
        }
    }

    // URL Parameter Handling
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const scriptId = urlParams.get('script');
        
        if (scriptId) {
            this.openScriptView(scriptId);
            // Clean URL without reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        this.$$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
        
        // Theme toggle
        const themeToggle = this.$('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => this.toggleTheme());
        }
        
        // Search and filters
        this.$('#scriptSearch')?.addEventListener('input', () => this.searchScripts());
        this.$('#gameFilter')?.addEventListener('change', () => this.searchScripts());
        this.$('#sortFilter')?.addEventListener('change', () => this.searchScripts());
        
        // Upload form
        this.$('#nextStep')?.addEventListener('click', () => this.nextStep());
        this.$('#prevStep')?.addEventListener('click', () => this.prevStep());
        this.$('#scriptUploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadScript();
        });
        
        // Tags
        this.$('#tagInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });
        
        // Auth form
        this.$('#authForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });
        
        // Auth tabs
        this.$$('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                this.showAuthModal(tabType);
            });
        });
        
        // Modal close events
        this.$$('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });
        
        this.$('#overlay')?.addEventListener('click', () => {
            this.$$('.modal.active').forEach(modal => this.closeModal(modal.id));
        });
        
        // Global search
        this.$('#globalSearch')?.addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.$$('.modal.active').forEach(modal => this.closeModal(modal.id));
            }
        });
    }

    // Tag Management
    addTag() {
        const input = this.$('#tagInput');
        const tag = input.value.trim().toLowerCase();
        
        if (tag && !this.currentTags.includes(tag)) {
            this.currentTags.push(tag);
            this.renderTags();
            input.value = '';
        }
    }

    addSuggestedTag(tag) {
        if (!this.currentTags.includes(tag)) {
            this.currentTags.push(tag);
            this.renderTags();
        }
    }

    removeTag(index) {
        this.currentTags.splice(index, 1);
        this.renderTags();
    }

    renderTags() {
        const tagsList = this.$('#tagsList');
        if (tagsList) {
            tagsList.innerHTML = this.currentTags.map((tag, index) => `
                <span class="tag-input">
                    ${tag}
                    <button type="button" class="tag-remove" onclick="gordScripts.removeTag(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `).join('');
        }
    }

    // Global Search
    handleGlobalSearch(query) {
        // Implement global search functionality
        console.log('Global search:', query);
    }

    // Auth Form Handler
    handleAuthSubmit() {
        const activeTab = this.$('.auth-tab.active').dataset.tab;
        
        if (activeTab === 'login') {
            const username = this.$('#loginUsername').value.trim();
            const password = this.$('#loginPassword').value;
            
            if (!username || !password) {
                this.showNotification('Заполните все поля', 'error');
                return;
            }
            
            this.login(username, password);
        } else {
            const username = this.$('#registerUsername').value.trim();
            const email = this.$('#registerEmail').value.trim();
            const password = this.$('#registerPassword').value;
            
            if (!username || !email || !password) {
                this.showNotification('Заполните все поля', 'error');
                return;
            }
            
            if (username.length < 3) {
                this.showNotification('Имя пользователя должно быть не менее 3 символов', 'error');
                return;
            }
            
            this.register(username, email, password);
        }
    }

    // Code Editor Functions
    formatCode() {
        const codeTextarea = this.$('#scriptCode');
        // Basic code formatting logic
        let code = codeTextarea.value;
        // Add basic indentation logic here
        codeTextarea.value = code;
        this.showNotification('Код отформатирован', 'success');
    }

    clearCode() {
        if (confirm('Очистить поле с кодом?')) {
            this.$('#scriptCode').value = '';
        }
    }
}

// Initialize the application
const gordScripts = new GordScripts();

// Global functions for HTML onclick handlers
function showSection(sectionId) {
    gordScripts.showSection(sectionId);
}

function showUploadModal() {
    gordScripts.showUploadModal();
}

function showAuthModal(type) {
    gordScripts.showAuthModal(type);
}

function closeAuthModal() {
    gordScripts.closeModal('authModal');
}

function logout() {
    gordScripts.logout();
}

function copyScriptCode() {
    const code = gordScripts.$('#viewScriptCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        gordScripts.showNotification('Код скопирован в буфер обмена!');
    });
}

function downloadScript() {
    const title = gordScripts.$('#viewScriptTitle').textContent;
    const code = gordScripts.$('#viewScriptCode').textContent;
    
    const script = gordScripts.scripts.find(s => s.id === gordScripts.currentScriptId);
    if (script) {
        script.downloads = (script.downloads || 0) + 1;
        gordScripts.saveData();
    }
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    gordScripts.showNotification(`Скрипт "${title}" скачан!`);
}

function shareScript() {
    if (gordScripts.currentScriptId) {
        gordScripts.shareScript(gordScripts.currentScriptId);
    }
}

function closeScriptView() {
    gordScripts.closeModal('scriptViewModal');
}

function addTag() {
    gordScripts.addTag();
}

function addSuggestedTag(tag) {
    gordScripts.addSuggestedTag(tag);
}

function removeTag(index) {
    gordScripts.removeTag(index);
}

function formatCode() {
    gordScripts.formatCode();
}

function clearCode() {
    gordScripts.clearCode();
}

// Make gordScripts globally available
window.gordScripts = gordScripts;
