// Конфигурация
const CONFIG = {
    GITHUB_USER: 'Gord-Scripts',
    REPO: 'gord-scripts.github.io',
    SCRIPTS_FILE: 'scripts.json',
    USERS_FILE: 'users.json'
};

// Глобальные переменные
let scripts = [];
let users = [];
let currentUser = null;
let currentTags = [];
let currentImage = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    await loadData();
    updateOnlineCounters();
    renderScripts();
    setupEventListeners();
    
    // Проверяем авторизацию
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Загрузка данных
async function loadData() {
    try {
        // Загружаем скрипты
        const scriptsUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/main/${CONFIG.SCRIPTS_FILE}`;
        const scriptsResponse = await fetch(scriptsUrl);
        
        if (scriptsResponse.ok) {
            const scriptsData = await scriptsResponse.json();
            scripts = scriptsData.scripts || [];
        } else {
            // Если файла нет, создаем демо-данные
            await createDemoData();
        }
        
        // Загружаем пользователей
        const usersUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/main/${CONFIG.USERS_FILE}`;
        const usersResponse = await fetch(usersUrl);
        
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            users = usersData.users || [];
        }
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Пробуем загрузить из localStorage как резерв
        loadFromLocalStorage();
    }
}

// Создание демо-данных
async function createDemoData() {
    scripts = [
        {
            id: generateId(),
            title: "Авто-фарм монет",
            description: "Автоматический сбор монет в популярных играх Roblox с настройкой интервалов",
            code: `-- Авто-фарм монет
loadstring(game:HttpGet("https://example.com/auto-farm.lua"))()

local Players = game:GetService("Players")
local player = Players.LocalPlayer

function autoFarm()
    while true do
        wait(1)
        -- Код автоматического фарма
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
            game: "Universal",
            tags: ["авто-фарм", "монеты", "автоматизация"],
            image: null,
            createdAt: new Date().toISOString(),
            views: 1250,
            likes: 89
        },
        {
            id: generateId(),
            title: "ESP для игроков",
            description: "Отображение игроков через стены с настройкой цветов и расстояния",
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

Players.PlayerAdded:Connect(createESP)

for _, player in pairs(Players:GetPlayers()) do
    if player.Character then
        createESP(player)
    end
    player.CharacterAdded:Connect(function()
        createESP(player)
    end)
end)`,
            author: "Gord",
            game: "Universal",
            tags: ["ESP", "игроки", "видимость"],
            image: null,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            views: 890,
            likes: 67
        }
    ];
    
    users = [
        {
            id: generateId(),
            username: "Gord",
            email: "gord@example.com",
            role: "admin",
            joinedAt: new Date().toISOString(),
            uploadedScripts: 2
        }
    ];
    
    await saveData();
}

// Сохранение данных
async function saveData() {
    const dataToSave = {
        scripts: scripts,
        users: users,
        lastUpdated: new Date().toISOString()
    };
    
    // Сохраняем в localStorage как резерв
    localStorage.setItem('gordScriptsData', JSON.stringify(dataToSave));
    
    // В реальном приложении здесь был бы вызов GitHub API
    console.log('Данные для сохранения:', dataToSave);
    showNotification('Данные успешно сохранены!', 'success');
}

// Загрузка из localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('gordScriptsData');
    if (savedData) {
        const data = JSON.parse(savedData);
        scripts = data.scripts || [];
        users = data.users || [];
        showNotification('Данные загружены из локального хранилища', 'success');
    } else {
        createDemoData();
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

// Обновление счетчиков онлайн
function updateOnlineCounters() {
    const registered = Math.floor(Math.random() * 100) + 300;
    const guests = Math.floor(Math.random() * 500) + 2800;
    
    $('#registeredCount').textContent = registered;
    $('#guestsCount').textContent = guests;
}

// Рендеринг скриптов
function renderScripts() {
    const scriptsGrid = $('#scriptsGrid');
    
    if (scripts.length === 0) {
        scriptsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 1rem;">Скриптов пока нет</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Будьте первым, кто загрузит скрипт!</p>
                <button class="btn btn-primary" onclick="showUploadModal()">
                    <i class="fas fa-upload"></i>
                    Загрузить скрипт
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
                <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); copyScript('${script.id}')">
                    <i class="fas fa-copy"></i>
                    Копировать
                </button>
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); openScriptView('${script.id}')">
                    <i class="fas fa-eye"></i>
                    Подробнее
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

// Загрузка изображения
$('#scriptImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            $('#imagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Модальные окна
function showLoginModal() {
    $('#loginModal').classList.add('active');
}

function closeLoginModal() {
    $('#loginModal').classList.remove('active');
}

function showRegisterModal() {
    $('#registerModal').classList.add('active');
}

function closeRegisterModal() {
    $('#registerModal').classList.remove('active');
}

function showUploadModal() {
    if (!currentUser) {
        showNotification('Для загрузки скриптов необходимо войти в систему', 'error');
        showLoginModal();
        return;
    }
    
    currentTags = [];
    currentImage = null;
    $('#uploadForm').reset();
    $('#tagsList').innerHTML = '';
    $('#imagePreview').innerHTML = '';
    $('#uploadModal').classList.add('active');
}

function closeUploadModal() {
    $('#uploadModal').classList.remove('active');
}

function openScriptView(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;
    
    // Увеличиваем счетчик просмотров
    script.views = (script.views || 0) + 1;
    
    $('#viewScriptTitle').textContent = script.title;
    $('#viewScriptAuthor').textContent = `Автор: ${script.author}`;
    $('#viewScriptDate').textContent = `Загружен: ${formatDate(script.createdAt)}`;
    $('#viewScriptGame').textContent = `Игра: ${script.game}`;
    $('#viewScriptDescription').textContent = script.description;
    $('#viewScriptCode').textContent = script.code;
    
    // Теги
    const tagsContainer = $('#viewScriptTags');
    tagsContainer.innerHTML = script.tags ? script.tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('') : '';
    
    // Изображение
    const imageContainer = $('#viewScriptImage');
    if (script.image) {
        imageContainer.innerHTML = `<img src="${script.image}" alt="${script.title}" style="max-width: 100%; border-radius: 8px;">`;
    } else {
        imageContainer.innerHTML = '';
    }
    
    $('#scriptViewModal').classList.add('active');
    saveData(); // Сохраняем обновленные просмотры
}

function closeScriptViewModal() {
    $('#scriptViewModal').classList.remove('active');
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
    const game = $('#scriptGame').value;
    
    if (!title || !description || !code || !game) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    const newScript = {
        id: generateId(),
        title,
        description,
        code,
        author: currentUser.username,
        game,
        tags: [...currentTags],
        image: currentImage,
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0
    };
    
    scripts.unshift(newScript);
    saveData();
    renderScripts();
    closeUploadModal();
    
    showNotification(`Скрипт "${title}" успешно загружен!`);
}

// Авторизация
$('#loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = $('#loginUsername').value.trim();
    const password = $('#loginPassword').value.trim();
    
    const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password // В реальном приложении должно быть хэширование
    );
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateAuthUI();
        closeLoginModal();
        showNotification(`Добро пожаловать, ${user.username}!`);
    } else {
        showNotification('Неверные учетные данные', 'error');
    }
});

$('#registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = $('#registerUsername').value.trim();
    const email = $('#registerEmail').value.trim();
    const password = $('#registerPassword').value.trim();
    
    if (users.find(u => u.username === username)) {
        showNotification('Имя пользователя уже занято', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('Email уже используется', 'error');
        return;
    }
    
    const newUser = {
        id: generateId(),
        username,
        email,
        password, // В реальном приложении должно быть хэширование
        role: 'user',
        joinedAt: new Date().toISOString(),
        uploadedScripts: 0
    };
    
    users.push(newUser);
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    saveData();
    updateAuthUI();
    closeRegisterModal();
    showNotification('Регистрация успешна! Добро пожаловать!');
});

function updateAuthUI() {
    const authButtons = $('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <span style="color: var(--text-secondary);">Привет, ${currentUser.username}!</span>
                <button class="btn btn-outline btn-small" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Выйти
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
$('#themeToggle').addEventListener('click', function() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    const icon = $('#themeToggle i');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    }
});

// Загрузка сохраненной темы
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const icon = $('#themeToggle i');
    
    body.classList.add(savedTheme + '-theme');
    icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Закрытие модалок по клику вне
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeLoginModal();
            closeRegisterModal();
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
    $('#searchInput').addEventListener('input', function(event) {
        // Реализация поиска
    });
    
    $('#heroSearch').addEventListener('input', function(event) {
        // Реализация поиска в hero секции
    });
}

// Загрузка темы при инициализации
loadTheme();

// Обновляем счетчики каждые 30 секунд
setInterval(updateOnlineCounters, 30000);
