// ============================================================================
// Gord Scripts — Enhanced Script Manager
// Features: Persistent storage, shareable links, real-time updates
// ============================================================================

const CONFIG = {
    STORAGE_KEY: 'gordScriptsData',
    SHARE_BASE_URL: window.location.origin + window.location.pathname
};

// Глобальные переменные
let scripts = [];
let currentUser = null;
let currentTags = [];
let currentScriptId = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
    checkUrlForScript();
});

async function initApp() {
    await loadScripts();
    renderScripts();
    updateStats();
    loadTheme();
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Проверка URL для загрузки скрипта по ссылке
function checkUrlForScript() {
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('script');
    
    if (scriptId) {
        openScriptView(scriptId);
        // Очищаем URL без перезагрузки страницы
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Загрузка скриптов
async function loadScripts() {
    try {
        const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            scripts = data.scripts || [];
            console.log('Скрипты загружены из localStorage:', scripts.length);
        } else {
            await createDemoScripts();
        }
    } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
        await createDemoScripts();
    }
}

// Создание демо-скриптов
async function createDemoScripts() {
    scripts = [
        {
            id: generateId(),
            title: "Авто-фарм монет",
            description: "Автоматический сбор монет в Brookhaven с настройкой интервалов",
            code: `-- Авто-фарм монет для Brookhaven
local Players = game:GetService("Players")
local player = Players.LocalPlayer

function autoFarm()
    while true do
        wait(1)
        for _, coin in pairs(workspace.Coins:GetChildren()) do
            if coin:IsA("Part") then
                firetouchinterest(coin, player.Character.HumanoidRootPart, 0)
                wait(0.1)
                firetouchinterest(coin, player.Character.HumanoidRootPart, 1)
            end
        end
    end
end

autoFarm()`,
            author: "Gord",
            game: "Brookhaven",
            tags: ["авто-фарм", "монеты", "брукхейвен"],
            createdAt: new Date().toISOString(),
            views: 1250,
            likes: 89,
            downloads: 342
        },
        {
            id: generateId(),
            title: "ESP для игроков",
            description: "Отображение игроков через стены с настройкой цветов",
            code: `-- ESP скрипт
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local LocalPlayer = Players.LocalPlayer

function createESP(player)
    if player == LocalPlayer then return end
    
    local highlight = Instance.new("Highlight")
    highlight.Parent = player.Character
    highlight.FillColor = Color3.fromRGB(255, 0, 0)
    highlight.OutlineColor = Color3.fromRGB(255, 255, 255)
    highlight.Name = "ESP_" .. player.Name
end

Players.PlayerAdded:Connect(createESP)`,
            author: "Gord",
            game: "Universal",
            tags: ["ESP", "игроки", "видимость"],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            views: 890,
            likes: 67,
            downloads: 234
        }
    ];
    
    await saveScripts();
}

// Сохранение скриптов
async function saveScripts() {
    const dataToSave = {
        scripts: scripts,
        totalScripts: scripts.length,
        totalViews: scripts.reduce((acc, script) => acc + (script.views || 0), 0),
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('Скрипты сохранены:', dataToSave);
    showNotification('Данные успешно сохранены!', 'success');
    
    // Обновляем статистику
    updateStats();
}

// Генерация ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Утилиты
function $(selector) {
    return document.querySelector(selector);
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notificationIcon');
    const text = document.getElementById('notificationText');
    
    if (notification && icon && text) {
        notification.className = `notification ${type}`;
        icon.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
        text.textContent = message;
        
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }
}

// Рендеринг скриптов
function renderScripts(filteredScripts = null) {
    const scriptsGrid = document.getElementById('scriptsGrid');
    const scriptsToRender = filteredScripts || scripts;
    
    if (scriptsToRender.length === 0) {
        scriptsGrid.innerHTML = `
            <div class="no-scripts">
                <div class="no-scripts-icon">📝</div>
                <h3>СКРИПТОВ НЕ НАЙДЕНО</h3>
                <p>Попробуйте изменить параметры поиска или загрузите первый скрипт!</p>
                <button class="btn btn-primary" onclick="showUploadModal()">
                    <i class="fas fa-upload"></i>
                    ЗАГРУЗИТЬ СКРИПТ
                </button>
            </div>
        `;
        return;
    }
    
    scriptsGrid.innerHTML = scriptsToRender.map(script => `
        <div class="script-card" onclick="openScriptView('${script.id}')">
            <div class="script-header">
                <h3 class="script-title">${script.title}</h3>
                <span class="script-badge">${script.game}</span>
            </div>
            
            <div class="script-meta">
                <span class="script-author">
                    <i class="fas fa-user"></i>
                    ${script.author}
                </span>
                <span class="script-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(script.createdAt)}
                </span>
                <span class="script-views">
                    <i class="fas fa-eye"></i>
                    ${script.views || 0}
                </span>
            </div>
            
            <p class="script-description">${script.description}</p>
            
            ${script.tags && script.tags.length > 0 ? `
                <div class="script-tags">
                    ${script.tags.slice(0, 3).map(tag => `
                        <span class="tag">${tag}</span>
                    `).join('')}
                    ${script.tags.length > 3 ? `<span class="tag">+${script.tags.length - 3}</span>` : ''}
                </div>
            ` : ''}
            
            <div class="script-stats">
                <span class="stat">
                    <i class="fas fa-eye"></i> ${script.views || 0}
                </span>
                <span class="stat">
                    <i class="fas fa-heart"></i> ${script.likes || 0}
                </span>
                <span class="stat">
                    <i class="fas fa-download"></i> ${script.downloads || 0}
                </span>
            </div>
            
            <div class="script-actions">
                <button class="btn btn-small" onclick="event.stopPropagation(); copyScript('${script.id}')">
                    <i class="fas fa-copy"></i>
                    КОПИРОВАТЬ
                </button>
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); shareScript('${script.id}')">
                    <i class="fas fa-share"></i>
                    ПОДЕЛИТЬСЯ
                </button>
            </div>
        </div>
    `).join('');
}

// Форматирование даты
function formatDate(dateString) {
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

// Обновление статистики
function updateStats() {
    const scriptsCount = document.getElementById('scriptsCount');
    const usersCount = document.getElementById('registeredCount');
    
    if (scriptsCount) scriptsCount.textContent = scripts.length;
    if (usersCount) {
        // Простая логика подсчета "пользователей" - можно улучшить
        const uniqueAuthors = [...new Set(scripts.map(script => script.author))];
        usersCount.textContent = uniqueAuthors.length + 150; // Базовое число + авторы
    }
}

// Поиск скриптов
function searchScripts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredScripts = scripts.filter(script => 
        script.title.toLowerCase().includes(searchTerm) ||
        script.description.toLowerCase().includes(searchTerm) ||
        script.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        script.game.toLowerCase().includes(searchTerm)
    );
    
    renderScripts(filteredScripts);
}

// Управление тегами
function addTag() {
    const tagInput = document.getElementById('tagInput');
    const tag = tagInput.value.trim().toLowerCase();
    
    if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
        tagInput.value = '';
    }
}

function removeTag(index) {
    currentTags.splice(index, 1);
    renderTags();
}

function renderTags() {
    const tagsList = document.getElementById('tagsList');
    if (tagsList) {
        tagsList.innerHTML = currentTags.map((tag, index) => `
            <span class="tag">
                ${tag}
                <button type="button" onclick="removeTag(${index})" class="tag-remove">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
    }
}

// Модальные окна
function showUploadModal() {
    if (!currentUser) {
        showNotification('Для загрузки скриптов необходимо войти в систему', 'error');
        showLoginModal();
        return;
    }
    
    currentTags = [];
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) uploadForm.reset();
    
    const tagsList = document.getElementById('tagsList');
    if (tagsList) tagsList.innerHTML = '';
    
    const uploadModal = document.getElementById('uploadModal');
    const overlay = document.getElementById('modal-overlay');
    
    if (uploadModal) uploadModal.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeUploadModal() {
    const uploadModal = document.getElementById('uploadModal');
    const overlay = document.getElementById('modal-overlay');
    
    if (uploadModal) uploadModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function openScriptView(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    // Сохраняем ID текущего скрипта
    currentScriptId = scriptId;
    
    // Увеличиваем счетчик просмотров
    script.views = (script.views || 0) + 1;
    saveScripts();
    
    // Обновляем модальное окно просмотра
    const title = document.getElementById('viewScriptTitle');
    const description = document.getElementById('viewScriptDescription');
    const code = document.getElementById('viewScriptCode');
    const meta = document.getElementById('viewScriptMeta');
    const tags = document.getElementById('viewScriptTags');
    
    if (title) title.textContent = script.title;
    if (description) description.textContent = script.description;
    if (code) code.textContent = script.code;
    
    if (meta) {
        meta.innerHTML = `
            <div class="script-meta">
                <span class="script-author">
                    <i class="fas fa-user"></i>
                    ${script.author}
                </span>
                <span class="script-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(script.createdAt)}
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
    }
    
    if (tags && script.tags) {
        tags.innerHTML = script.tags.map(tag => `
            <span class="tag">${tag}</span>
        `).join('');
    }
    
    const scriptViewModal = document.getElementById('scriptViewModal');
    const overlay = document.getElementById('modal-overlay');
    
    if (scriptViewModal) scriptViewModal.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeScriptViewModal() {
    const scriptViewModal = document.getElementById('scriptViewModal');
    const overlay = document.getElementById('modal-overlay');
    
    if (scriptViewModal) scriptViewModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Действия со скриптами
function copyScript(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;
    
    navigator.clipboard.writeText(script.code).then(() => {
        showNotification('Код скрипта скопирован в буфер обмена!');
    }).catch(() => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = script.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Код скрипта скопирован в буфер обмена!');
    });
}

function shareScript(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;
    
    const shareUrl = `${CONFIG.SHARE_BASE_URL}?script=${scriptId}`;
    
    if (navigator.share) {
        navigator.share({
            title: script.title,
            text: script.description,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('Ссылка на скрипт скопирована в буфер обмена!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Ссылка на скрипт скопирована в буфер обмена!');
        });
    }
}

function shareCurrentScript() {
    if (currentScriptId) {
        shareScript(currentScriptId);
    }
}

function copyScriptCode() {
    const code = document.getElementById('viewScriptCode');
    if (!code) return;
    
    navigator.clipboard.writeText(code.textContent).then(() => {
        showNotification('Код скопирован в буфер обмена!');
    });
}

function downloadScript() {
    const title = document.getElementById('viewScriptTitle');
    const code = document.getElementById('viewScriptCode');
    
    if (!title || !code) return;

    const script = scripts.find(s => s.id === currentScriptId);
    if (script) {
        script.downloads = (script.downloads || 0) + 1;
        saveScripts();
    }
    
    const blob = new Blob([code.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${title.textContent.replace(/[^a-z0-9]/gi, '_')}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Скрипт "${title.textContent}" скачан!`);
}

// Загрузка скрипта
function uploadScript() {
    const title = document.getElementById('scriptTitle');
    const description = document.getElementById('scriptDescription');
    const code = document.getElementById('scriptCode');
    const game = document.getElementById('scriptGame');
    
    if (!title || !description || !code || !game) return;
    
    const titleValue = title.value.trim();
    const descriptionValue = description.value.trim();
    const codeValue = code.value.trim();
    const gameValue = game.value;
    
    if (!titleValue || !descriptionValue || !codeValue || !gameValue) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    const newScript = {
        id: generateId(),
        title: titleValue,
        description: descriptionValue,
        code: codeValue,
        author: currentUser.username,
        game: gameValue,
        tags: [...currentTags],
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        downloads: 0
    };

    scripts.unshift(newScript);
    saveScripts();
    renderScripts();
    closeUploadModal();
    
    showNotification(`Скрипт "${titleValue}" успешно загружен!`);
    
    // Автоматически генерируем ссылку для распространения
    setTimeout(() => {
        shareScript(newScript.id);
    }, 1000);
}

// Авторизация
function showLoginModal() {
    const username = prompt('Введите имя пользователя:');
    if (username && username.trim()) {
        currentUser = { 
            username: username.trim(), 
            role: 'user',
            joinedAt: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        showNotification(`Добро пожаловать, ${username.trim()}!`);
    }
}

function showRegisterModal() {
    const username = prompt('Введите имя пользователя для регистрации:');
    if (username && username.length >= 3) {
        currentUser = { 
            username: username.trim(), 
            role: 'user',
            joinedAt: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        showNotification('Регистрация успешна! Добро пожаловать!');
    } else {
        showNotification('Имя пользователя должно быть не менее 3 символов', 'error');
    }
}

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons && currentUser) {
        authButtons.innerHTML = `
            <div class="user-info">
                <span class="user-greeting">Привет, ${currentUser.username}!</span>
                <button class="btn btn-small" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    ВЫЙТИ
                </button>
            </div>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="showLoginModal()">
                <i class="fas fa-sign-in-alt"></i>
                Войти
            </button>
            <button class="btn btn-primary" onclick="showRegisterModal()">
                <i class="fas fa-user-plus"></i>
                Регистрация
            </button>
        `;
    }
    showNotification('Вы вышли из системы');
}

// Переключение темы
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const icon = document.querySelector('#themeToggle i');
    
    if (savedTheme === 'light') {
        body.classList.add('theme-light');
        if (icon) icon.className = 'fas fa-sun';
    } else {
        body.classList.add('theme-dark');
        if (icon) icon.className = 'fas fa-moon';
    }
}

// Обработчики событий
function setupEventListeners() {
    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchScripts);
    }
    
    // Enter для добавления тегов
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addTag();
            }
        });
    }
    
    // Переключение темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const body = document.body;
            const isLight = body.classList.contains('theme-light');
            const icon = this.querySelector('i');
            
            if (isLight) {
                body.classList.remove('theme-light');
                body.classList.add('theme-dark');
                if (icon) icon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('theme-dark');
                body.classList.add('theme-light');
                if (icon) icon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'light');
            }
            
            // Анимация переключения
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 500);
        });
    }
    
    // Закрытие модалок по клику вне
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            closeUploadModal();
            closeScriptViewModal();
        }
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.site-header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

console.log('%c🚀 Gord Scripts Enhanced Loaded!', 'color:#3AA655;font-size:16px;font-weight:bold;');
console.log('%c📁 Система сохранения данных активирована', 'color:#4FC3F7;font-size:14px;');
