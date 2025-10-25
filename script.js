// Task List App JavaScript
class TaskListApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateEmptyMessage();
    }

    bindEvents() {
        // Add task button
        document.getElementById('addButton').addEventListener('click', () => {
            this.addTask();
        });

        // Enter key in input field
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const taskText = input.value.trim();

        if (taskText === '') {
            this.showMessage('Please enter a task!', 'error');
            return;
        }

        const task = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateEmptyMessage();
        
        // Clear input and focus
        input.value = '';
        input.focus();
        
        this.showMessage('Task added successfully!', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.renderTasks();
                this.updateEmptyMessage();
            }, 300);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'not-completed':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();
        
        taskList.innerHTML = '';

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-task-id', task.id);

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn">Delete</button>
            `;

            // Bind events for this task
            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => {
                this.toggleTask(task.id);
            });

            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            taskList.appendChild(li);
        });
    }

    updateEmptyMessage() {
        const emptyMessage = document.getElementById('emptyMessage');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            let message = 'No tasks yet. Add one above!';
            
            if (this.tasks.length > 0) {
                switch (this.currentFilter) {
                    case 'completed':
                        message = 'No completed tasks yet.';
                        break;
                    case 'not-completed':
                        message = 'No pending tasks. Great job!';
                        break;
                }
            }
            
            emptyMessage.textContent = message;
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('taskListApp_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showMessage('Error saving tasks to local storage', 'error');
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('taskListApp_tasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
            this.showMessage('Error loading tasks from local storage', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Style the message
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        switch (type) {
            case 'success':
                messageEl.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                break;
            case 'error':
                messageEl.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
                break;
            default:
                messageEl.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }

        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskListApp();
});

// Add some utility functions for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input field when page loads
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.focus();
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addButton').click();
        }
        
        // Escape to clear input
        if (e.key === 'Escape') {
            const input = document.getElementById('taskInput');
            input.value = '';
            input.focus();
        }
    });
});
