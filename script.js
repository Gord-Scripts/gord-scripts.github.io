// Конфигурация
const CONFIG = {
    GITHUB_USER: 'Gord-Scripts',
    REPO: 'gord-scripts.github.io',
    SCRIPTS_FILE: 'scripts.json',
    GITHUB_TOKEN: '' // Оставь пустым для публичного репозитория
};

// Глобальные переменные
let scripts = [];
let currentFeatures = [];

// DOM элементы
const elements = {
    scriptsGrid: document.getElementById('scriptsGrid'),
    scriptsCount: document.getElementById('scriptsCount'),
    featuresCount: document.getElementById('featuresCount'),
    scriptModal: document.getElementById('scriptModal'),
    adminModal: document.getElementById('adminModal'),
    notification: document.getElementById('notification')
};

// Утилиты
function $(selector) { return document.querySelector(selector); }
function showNotification(message, type = 'success') {
    const notification = elements.notification;
    const icon = $('#notificationIcon');
    const text = $('#notificationText');
    
    notification.className = `notification ${type}`;
    icon.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
    text.textContent = message;
    
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// GitHub API функции
async function loadScriptsFromGitHub() {
    try {
        const url = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/main/${CONFIG.SCRIPTS_FILE}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Файл со скриптами не найден');
        }
        
        const data = await response.json();
        scripts = data.scripts || [];
        renderScripts();
        updateStats();
        
    } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
        elements.scriptsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Не удалось загрузить скрипты</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadScriptsFromGitHub()">
                    <i class="fas fa-redo"></i>
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

async function saveScriptsToGitHub() {
    // В реальном приложении здесь был бы вызов GitHub API
    // Для демо сохраняем в localStorage и показываем уведомление
    const data = {
        scripts: scripts,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('gord-scripts-backup', JSON.stringify(data));
    showNotification('Скрипты успешно сохранены!', 'success');
    
    // В реальности: отправить PUT запрос к GitHub API
    console.log('Скрипты для сохранения:', data);
}

// Рендеринг
function renderScripts() {
    if (scripts.length === 0) {
        elements.scriptsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-code"></i>
                <h3>Скриптов пока нет</h3>
                <p>Будьте первым, кто добавит скрипт!</p>
                <button class="btn btn-primary" onclick="showAdminModal()">
                    <i class="fas fa-plus"></i>
                    Добавить скрипт
                </button>
            </div>
        `;
        return;
    }

    elements.scriptsGrid.innerHTML = scripts.map(script => `
        <div class="card script-card" onclick="openScriptModal('${script.id}')">
            <div class="script-header">
                <div>
                    <h3 class="script-title">${script.title}</h3>
                    <div class="script-meta">
                        <span class="script-author">
                            <i class="fas fa-user"></i>
                            ${script.author}
                        </span>
                        <span>
                            <i class="fas fa-calendar"></i>
                            ${new Date(script.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
            
            ${script.features && script.features.length > 0 ? `
                <div class="script-features">
                    ${script.features.slice(0, 3).map(feature => `
                        <span class="feature-tag">${feature}</span>
                    `).join('')}
                    ${script.features.length > 3 ? `<span class="feature-tag">+${script.features.length - 3}</span>` : ''}
                </div>
            ` : ''}
            
            <p class="script-description">${script.description}</p>
            
            <div class="script-actions">
                <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); copyScriptCode('${script.id}')">
                    <i class="fas fa-copy"></i>
                    Копировать
                </button>
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); openScriptModal('${script.id}')">
                    <i class="fas fa-eye"></i>
                    Подробнее
                </button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    elements.scriptsCount.textContent = scripts.length;
    
    const totalFeatures = scripts.reduce((acc, script) => 
        acc + (script.features ? script.features.length : 0), 0
    );
    elements.featuresCount.textContent = totalFeatures;
}

// Модальные окна
function openScriptModal(scriptId) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    $('#scriptModalTitle').textContent = script.title;
    $('#scriptModalDescription').textContent = script.description;
    $('#scriptModalCode').textContent = script.code;
    
    $('#scriptModalMeta').innerHTML = `
        <div class="script-meta">
            <span class="script-author">
                <i class="fas fa-user"></i>
                ${script.author}
            </span>
            <span>
                <i class="fas fa-calendar"></i>
                ${new Date(script.createdAt).toLocaleDateString('ru-RU')}
            </span>
            ${script.features && script.features.length > 0 ? `
                <span>
                    <i class="fas fa-star"></i>
                    ${script.features.length} функций
                </span>
            ` : ''}
        </div>
    `;

    elements.scriptModal.classList.add('active');
}

function closeScriptModal() {
    elements.scriptModal.classList.remove('active');
}

function showAdminModal() {
    currentFeatures = [];
    $('#scriptForm').reset();
    $('#featuresList').innerHTML = '';
    elements.adminModal.classList.add('active');
}

function closeAdminModal() {
    elements.adminModal.classList.remove('active');
}

// Управление функциями
function addFeature() {
    const featureInput = $('#featureInput');
    const feature = featureInput.value.trim();
    
    if (feature && !currentFeatures.includes(feature)) {
        currentFeatures.push(feature);
        renderFeatures();
        featureInput.value = '';
    }
}

function removeFeature(index) {
    currentFeatures.splice(index, 1);
    renderFeatures();
}

function renderFeatures() {
    const featuresList = $('#featuresList');
    featuresList.innerHTML = currentFeatures.map((feature, index) => `
        <span class="feature-tag">
            ${feature}
            <button type="button" onclick="removeFeature(${index})" style="background: none; border: none; color: var(--text-muted); margin-left: 4px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

// Сохранение скрипта
function saveScript() {
    const title = $('#scriptTitle').value.trim();
    const description = $('#scriptDescription').value.trim();
    const code = $('#scriptCode').value.trim();
    const author = $('#scriptAuthor').value.trim() || 'Gord';

    if (!title || !description || !code) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    const newScript = {
        id: generateId(),
        title,
        description,
        code,
        author,
        features: [...currentFeatures],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    scripts.unshift(newScript);
    saveScriptsToGitHub();
    renderScripts();
    updateStats();
    closeAdminModal();
    
    showNotification(`Скрипт "${title}" успешно добавлен!`);
}

// Действия со скриптами
function copyScriptCode(scriptId = null) {
    let code;
    
    if (scriptId) {
        const script = scripts.find(s => s.id === scriptId);
        code = script ? script.code : '';
    } else {
        code = $('#scriptModalCode').textContent;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Код скопирован в буфер обмена!');
    }).catch(() => {
        showNotification('Ошибка копирования', 'error');
    });
}

function downloadScript() {
    const title = $('#scriptModalTitle').textContent;
    const code = $('#scriptModalCode').textContent;
    
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

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    loadScriptsFromGitHub();
    
    // Закрытие модалок по клику вне области
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeScriptModal();
            closeAdminModal();
        }
    });
    
    // Enter в поле ввода функций
    $('#featureInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addFeature();
        }
    });
});

// Добавим демо-данные если скриптов нет
function addDemoScripts() {
    if (scripts.length === 0) {
        scripts = [
            {
                id: 'demo1',
                title: 'Авто-фарм монет',
                description: 'Автоматически собирает монеты в популярных играх Roblox',
                code: `-- Авто-фарм монет
loadstring(game:HttpGet("https://example.com/auto-farm.lua"))()

function autoFarm()
    while true do
        wait(1)
        -- Код фарма монет
        print("Фармим монеты...")
    end
end

autoFarm()`,
                author: 'Gord',
                features: ['Авто-сбор', 'Безопасность', 'Настройки'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'demo2',
                title: 'ESP для игроков',
                description: 'Показывает расположение других игроков через стены',
                code: `-- ESP скрипт
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

function createESP(player)
    -- Код создания ESP
    print("ESP создано для: " .. player.Name)
end

Players.PlayerAdded:Connect(createESP)`,
                author: 'Gord',
                features: ['ESP игроков', 'Сквозь стены', 'Настройка цветов'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        renderScripts();
        updateStats();
    }
}

// Инициализация
setTimeout(addDemoScripts, 1000);
