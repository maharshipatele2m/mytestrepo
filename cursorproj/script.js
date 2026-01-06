// State management
let tasks = [];
let currentEditId = null;

// DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const encouragement = document.getElementById('encouragement');

// Encouraging messages
const encouragementMessages = [
    "You're doing great! 🌟",
    "Every step counts! 💪",
    "Keep going, you've got this! ✨",
    "Progress, not perfection! 🌱",
    "Small wins, big impact! 🎯",
    "You're making it happen! 🌈",
    "Focus and flow! 🧘",
    "One task at a time! 🎨"
];

// Initialize
loadTasks();
updateStats();
updateEmptyState();
showRandomEncouragement();

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Functions
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask); // Add to beginning
    taskInput.value = '';
    saveTasks();
    renderTasks();
    updateStats();
    updateEmptyState();
    showRandomEncouragement();

    // Focus back on input
    taskInput.focus();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
        showRandomEncouragement();
    }
}

function editTask(id) {
    // Cancel any existing edit
    if (currentEditId !== null && currentEditId !== id) {
        cancelEdit(currentEditId);
    }

    currentEditId = id;
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    const taskText = taskElement.querySelector('.task-text');
    const task = tasks.find(t => t.id === id);

    if (task) {
        taskText.contentEditable = true;
        taskText.classList.add('editing');
        taskText.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(taskText);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        // Handle save on blur or Enter
        const saveEdit = () => {
            const newText = taskText.textContent.trim();
            if (newText && newText !== task.text) {
                task.text = newText;
                saveTasks();
                showRandomEncouragement();
            }
            taskText.contentEditable = false;
            taskText.classList.remove('editing');
            currentEditId = null;
        };

        taskText.addEventListener('blur', saveEdit, { once: true });
        taskText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                taskText.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                taskText.textContent = task.text;
                taskText.contentEditable = false;
                taskText.classList.remove('editing');
                currentEditId = null;
            }
        }, { once: true });
    }
}

function cancelEdit(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        const taskText = taskElement.querySelector('.task-text');
        const task = tasks.find(t => t.id === id);
        if (task) {
            taskText.textContent = task.text;
            taskText.contentEditable = false;
            taskText.classList.remove('editing');
        }
    }
    currentEditId = null;
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add('deleting');
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
            updateEmptyState();
            showRandomEncouragement();
        }, 300);
    }
}

function renderTasks() {
    tasksList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);

        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="toggleTask(${task.id})"
                 role="checkbox"
                 aria-checked="${task.completed}"></div>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="task-btn edit" onclick="editTask(${task.id})" aria-label="Edit task">
                    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.013 2.424a1.5 1.5 0 0 1 2.122 0l2.441 2.441a1.5 1.5 0 0 1 0 2.122l-9.5 9.5a1.5 1.5 0 0 1-1.06.44H4.5a1 1 0 0 1-1-1v-2.414a1.5 1.5 0 0 1 .44-1.06l9.5-9.5zM5 13.086v1.414h1.414l8.086-8.086-1.414-1.414L5 13.086z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="task-btn delete" onclick="deleteTask(${task.id})" aria-label="Delete task">
                    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6h12M7 6V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m3 0v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h12zM9 9v4m2-4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;

        tasksList.appendChild(li);
    });
}

function updateStats() {
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    activeCount.textContent = active;
    completedCount.textContent = completed;

    // Animate stat changes
    activeCount.style.transform = 'scale(1.1)';
    completedCount.style.transform = 'scale(1.1)';
    setTimeout(() => {
        activeCount.style.transform = 'scale(1)';
        completedCount.style.transform = 'scale(1)';
    }, 200);
}

function updateEmptyState() {
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        tasksList.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        tasksList.style.display = 'flex';
    }
}

function showRandomEncouragement() {
    // Only show if there are tasks
    if (tasks.length === 0) {
        encouragement.textContent = '';
        return;
    }

    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;

    let message = '';
    if (completed === total && total > 0) {
        message = "🎉 All done! You're amazing!";
    } else if (completed > 0) {
        message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    } else {
        message = "Ready to tackle these? Let's go! 🚀";
    }

    encouragement.textContent = message;
    encouragement.classList.add('show');
}

function saveTasks() {
    localStorage.setItem('peacefulTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const stored = localStorage.getItem('peacefulTasks');
    if (stored) {
        try {
            tasks = JSON.parse(stored);
            renderTasks();
        } catch (e) {
            console.error('Error loading tasks:', e);
            tasks = [];
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for inline handlers
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
