export class TransactionNotifier {
    constructor() {
        this.notifications = [];
        this.container = document.getElementById('transaction-notifier');
        this.setupContainer();
    }

    setupContainer() {
        if (this.container) {
            this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
        }
    }

    showPending(message) {
        this.addNotification(message, 'pending');
    }

    showSuccess(message) {
        this.addNotification(message, 'success');
    }

    showError(message) {
        this.addNotification(message, 'error');
    }

    addNotification(message, type) {
        const id = Date.now().toString();
        const notification = { id, message, type };
        this.notifications.push(notification);
        
        this.render();
        
        if (type !== 'pending') {
            setTimeout(() => {
                this.removeNotification(id);
            }, 5000);
        }
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.render();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = this.notifications.map(notification => {
            const bgColor = {
                pending: 'bg-blue-500',
                success: 'bg-green-500',
                error: 'bg-red-500'
            }[notification.type];

            return `
                <div class="max-w-sm w-full ${bgColor} text-white rounded-lg shadow-lg p-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            ${this.getIcon(notification.type)}
                            <span class="ml-2 text-sm">${notification.message}</span>
                        </div>
                        ${notification.type !== 'pending' ? `
                            <button onclick="window.transactionNotifier.removeNotification('${notification.id}')"
                                    class="ml-2 text-white hover:text-gray-200">
                                ×
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getIcon(type) {
        const icons = {
            pending: '⏳',
            success: '✅',
            error: '❌'
        };
        return icons[type] || '';
    }
}

// Make globally accessible
window.transactionNotifier = new TransactionNotifier();
