// ============================================================================
// Gord Scripts — SCRIPT.JS (JavaLauncher Style)
// Enhanced with data persistence and JavaLauncher animations
// ============================================================================

// Конфигурация
const CONFIG = {
    GITHUB_USER: 'Gord-Scripts',
    REPO: 'gord-scripts.github.io',
    SCRIPTS_FILE: 'scripts.json'
};

// Глобальные переменные
let scripts = [];
let currentUser = null;
let currentTags = [];

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
});

async function initApp() {
    await loadScripts();
    renderScripts();
    updateStats();
    
    // Загрузка темы
    loadTheme();
    
    // Проверяем авторизацию
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Загрузка скриптов
async function loadScripts() {
    try {
        const url = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/main/${CONFIG.SCRIPTS_FILE}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            scripts = data.scripts || [];
        } else {
            // Если файла нет, создаем демо-данные
            await createDemoScripts();
        }
    } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
        // Пробуем загрузить из localStorage
        loadFromLocalStorage();
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
loadstring(game:HttpGet("https://example.com/auto-farm.lua"))()

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
            likes: 89
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
            likes: 67
        }
    ];
    
    await saveScripts();
}

// Сохранение скриптов
async function saveScripts() {
    const dataToSave = {
        scripts: scripts,
        lastUpdated: new Date().toISOString()
    };
    
    // Сохраняем в localStorage
    localStorage.setItem('gordScriptsData', JSON.stringify(dataToSave));
    
    // В реальном приложении здесь был бы вызов GitHub API
    console.log('Скрипты сохранены:', dataToSave);
    showNotification('Данные успешно сохранены!', 'success');
}

// Загрузка из localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('gordScriptsData');
    if (savedData) {
        const data = JSON.parse(savedData);
        scripts = data.scripts || [];
        showNotification('Данные загружены из локального хранилища', 'success');
    } else {
        createDemoScripts();
    }
}

// Утилиты
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function $(selector) {
    return document.querySelector(selector);
}

function showNotification(message, type = 'success') {
    const notification = $('#notification');
    const icon = $('#notificationIcon');
    const text = $('#notificationText');
    
    notification.className = `notification ${type}`;
    icon.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
    text.textContent = message;
    
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Рендеринг скриптов
function renderScripts() {
    const scriptsGrid = $('#scriptsGrid');
    
    if (scripts.length === 0) {
        scriptsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📝</div>
                <h3 style="margin-bottom: 1rem; font-family: var(--ff-heading);">СКРИПТОВ ПОКА НЕТ</h3>
                <p style="color: var(--muted); margin-bottom: 2rem;">Будьте первым, кто загрузит скрипт!</p>
                <button class="upload-btn" onclick="showUploadModal()">
                    <i class="fas fa-upload"></i>
                    ЗАГРУЗИТЬ СКРИПТ
                </button>
            </div>
        `;
        return;
    }
    
    scriptsGrid.innerHTML = scripts.map(script => `
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
            
            <div class="script-actions">
                <button class="btn btn-small" onclick="event.stopPropagation(); copyScript('${script.id}')">
                    <i class="fas fa-copy"></i>
                    КОПИРОВАТЬ
                </button>
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); openScriptView('${script.id}')">
                    <i class="fas fa-eye"></i>
                    ПРОСМОТР
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
    $('#scriptsCount').textContent = scripts.length;
    const totalViews = scripts.reduce((acc, script) => acc + (script.views || 0), 0);
    // Можно добавить больше статистики
}

// Управление тегами
function addTag() {
    const tagInput = $('#tagInput');
    const tag = tagInput.value.trim();
    
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
    const tagsList = $('#tagsList');
    tagsList.innerHTML = currentTags.map((tag, index) => `
        <span class="tag">
            ${tag}
            <button type="button" onclick="removeTag(${index})" style="background: none; border: none; color: inherit; margin-left: 4px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

// Модальные окна
function showUploadModal() {
    if (!currentUser) {
        showNotification('Для загрузки скриптов необходимо войти в систему', 'error');
        return;
    }
    
    currentTags = [];
    $('#uploadForm').reset();
    $('#tagsList').innerHTML = '';
    $('#uploadModal').classList.add('active');
    $('#modal-overlay').classList.add('active');
}

function closeUploadModal() {
    $('#uploadModal').classList.remove('active');
    $('#modal-overlay').classList.remove('active');
}

function openScriptView(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    // Увеличиваем счетчик просмотров
    script.views = (script.views || 0) + 1;
    
    $('#viewScriptTitle').textContent = script.title;
    $('#viewScriptDescription').textContent = script.description;
    $('#viewScriptCode').textContent = script.code;
    
    $('#viewScriptMeta').innerHTML = `
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
        </div>
    `;

    $('#scriptViewModal').classList.add('active');
    $('#modal-overlay').classList.add('active');
    saveScripts(); // Сохраняем обновленные просмотры
}

function closeScriptViewModal() {
    $('#scriptViewModal').classList.remove('active');
    $('#modal-overlay').classList.remove('active');
}

// Действия со скриптами
function copyScript(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;
    
    navigator.clipboard.writeText(script.code).then(() => {
        showNotification('Код скрипта скопирован в буфер обмена!');
    }).catch(() => {
        showNotification('Ошибка копирования', 'error');
    });
}

function copyScriptCode() {
    const code = $('#viewScriptCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Код скопирован в буфер обмена!');
    }).catch(() => {
        showNotification('Ошибка копирования', 'error');
    });
}

function downloadScript() {
    const title = $('#viewScriptTitle').textContent;
    const code = $('#viewScriptCode').textContent;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Скрипт "${title}" скачан!`);
}

// Загрузка скрипта
function uploadScript() {
    const title = $('#scriptTitle').value.trim();
    const description = $('#scriptDescription').value.trim();
    const code = $('#scriptCode').value.trim();
    
    if (!title || !description || !code) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    const newScript = {
        id: generateId(),
        title,
        description,
        code,
        author: currentUser.username,
        game: "Universal",
        tags: [...currentTags],
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0
    };

    scripts.unshift(newScript);
    saveScripts();
    renderScripts();
    updateStats();
    closeUploadModal();
    
    showNotification(`Скрипт "${title}" успешно загружен!`);
}

// Авторизация (упрощенная)
function showLoginModal() {
    const username = prompt('Введите имя пользователя:');
    if (username) {
        currentUser = { username: username.trim(), role: 'user' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        showNotification(`Добро пожаловать, ${username}!`);
    }
}

function showRegisterModal() {
    const username = prompt('Введите имя пользователя для регистрации:');
    if (username && username.length >= 3) {
        currentUser = { username: username.trim(), role: 'user' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        showNotification('Регистрация успешна! Добро пожаловать!');
    } else {
        showNotification('Имя пользователя должно быть не менее 3 символов', 'error');
    }
}

function updateAuthUI() {
    const authButtons = $('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: var(--muted); font-size: 12px;">Привет, ${currentUser.username}!</span>
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
    updateAuthUI();
    showNotification('Вы вышли из системы');
}

// Переключение темы
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const icon = $('#themeToggle i');
    
    if (savedTheme === 'light') {
        body.classList.add('theme-light');
        icon.className = 'fas fa-sun';
    } else {
        body.classList.add('theme-dark');
        icon.className = 'fas fa-moon';
    }
}

$('#themeToggle').addEventListener('click', function() {
    const body = document.body;
    const isLight = body.classList.contains('theme-light');
    const icon = $('#themeToggle i');
    
    if (isLight) {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    }
    
    // Анимация переключения
    this.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        this.style.transform = '';
    }, 500);
});

// Обработчики событий
function setupEventListeners() {
    // Закрытие модалок по клику вне
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            closeUploadModal();
            closeScriptViewModal();
        }
    });
    
    // Enter для добавления тегов
    $('#tagInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTag();
        }
    });
    
    // Поиск
    $('#heroSearch').addEventListener('input', function(event) {
        const searchTerm = event.target.value.toLowerCase();
        // Реализация поиска
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.site-header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

console.log('%c🚀 Gord Scripts Enhanced Loaded!', 'color:#3AA655;font-size:16px;font-weight:bold;');
