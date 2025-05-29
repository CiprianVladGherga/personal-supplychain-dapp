import { formatters } from '../utils/formatters.js';

export class ComponentCard {
    constructor(component, onClick) {
        this.component = component;
        this.onClick = onClick;
    }

    render() {
        return `
            <div class="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer component-card"
                 data-component-id="${this.component.id}">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-medium text-gray-900">${this.component.name}</h3>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ID: ${this.component.id}
                    </span>
                </div>
                
                <p class="text-gray-600 mb-4">${this.component.description}</p>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Status:</span>
                        <span class="font-medium">${this.component.currentStatus}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Owner:</span>
                        <span class="font-mono text-xs">${formatters.formatAddress(this.component.currentOwner)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Last Updated:</span>
                        <span>${formatters.formatTimestamp(this.component.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        const cardElement = document.querySelector(`[data-component-id="${this.component.id}"]`);
        if (cardElement && this.onClick) {
            cardElement.addEventListener('click', () => {
                this.onClick(this.component.id);
            });
        }
    }
}
