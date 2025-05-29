import { ContractService } from '../services/contractService.js';
import { formatters } from '../utils/formatters.js';

export class ComponentDetailsPage {
    constructor(contractContext, transactionNotifier) {
        this.contractContext = contractContext;
        this.contractService = new ContractService(contractContext, transactionNotifier);
        this.component = null;
        this.history = [];
        this.isLoading = true;
        this.componentId = null;
    }

    render(componentId) {
        this.componentId = componentId;
        
        if (this.isLoading) {
            return `
                <div class="max-w-4xl mx-auto">
                    <div class="flex justify-center items-center py-12">
                        <div class="text-gray-500">Loading component details...</div>
                    </div>
                </div>
            `;
        }

        if (!this.component) {
            return `
                <div class="max-w-4xl mx-auto">
                    <div class="text-center py-12">
                        <div class="text-red-500 mb-4">Component not found</div>
                        <button onclick="window.router.navigate('home')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                            Back to Home
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Component Details</h1>
                    <button onclick="window.router.navigate('home')" class="text-gray-600 hover:text-gray-900">
                        ← Back to Home
                    </button>
                </div>

                ${this.renderComponentDetails()}
                ${this.renderOwnerActions()}
                ${this.renderHistory()}
            </div>
        `;
    }

    renderComponentDetails() {
        return `
            <div class="bg-white shadow rounded-lg p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                        <dl class="space-y-3">
                            <div>
                                <dt class="text-sm font-medium text-gray-500">ID</dt>
                                <dd class="text-sm text-gray-900">${this.component.id}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Name</dt>
                                <dd class="text-sm text-gray-900">${this.component.name}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Description</dt>
                                <dd class="text-sm text-gray-900">${this.component.description}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Initial Metadata</dt>
                                <dd class="text-sm text-gray-900">${this.component.initialMetadata || 'None'}</dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 mb-4">Current Status</h2>
                        <dl class="space-y-3">
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Status</dt>
                                <dd class="text-sm text-gray-900">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ${this.component.currentStatus}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Current Owner</dt>
                                <dd class="text-sm text-gray-900 font-mono">${this.component.currentOwner}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                                <dd class="text-sm text-gray-900">${formatters.formatTimestamp(this.component.timestamp)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        `;
    }

    renderOwnerActions() {
        const web3State = this.contractContext.web3Context.getState();
        const isOwner = web3State.account && web3State.account.toLowerCase() === this.component.currentOwner.toLowerCase();
        
        if (!web3State.isConnected || !isOwner) {
            return '';
        }

        return `
            <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Owner Actions</h2>
                <div class="flex space-x-4">
                    <button id="transfer-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Transfer Ownership
                    </button>
                    <button id="update-status-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                        Update Status
                    </button>
                </div>
                
                <div id="action-forms"></div>
            </div>
        `;
    }

    renderHistory() {
        return `
            <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">History</h2>
                <div class="space-y-4">
                    ${this.history.map(entry => `
                        <div class="border-l-2 border-gray-200 pl-4 pb-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="text-sm font-medium text-gray-900">${entry.action}</h3>
                                    <p class="text-sm text-gray-600 mt-1">${entry.details}</p>
                                    <p class="text-xs text-gray-500 mt-1">By: ${formatters.formatAddress(entry.by)}</p>
                                </div>
                                <span class="text-xs text-gray-500">${formatters.formatTimestamp(entry.timestamp)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async init(componentId) {
        this.componentId = componentId;
        await this.loadComponentData();
        this.setupEventListeners();
    }

    async loadComponentData() {
        try {
            this.isLoading = true;
            const [component, history] = await Promise.all([
                this.contractService.getComponentDetails(this.componentId),
                this.contractService.getComponentHistory(this.componentId)
            ]);
            
            this.component = component;
            this.history = history;
            this.isLoading = false;
            
            // Re-render with loaded data
            document.getElementById('page-content').innerHTML = this.render(this.componentId);
            this.setupEventListeners();
        } catch (error) {
            this.isLoading = false;
            console.error('Failed to load component data:', error);
            document.getElementById('page-content').innerHTML = this.render(this.componentId);
        }
    }

    setupEventListeners() {
        const transferBtn = document.getElementById('transfer-btn');
        const updateStatusBtn = document.getElementById('update-status-btn');
        
        if (transferBtn) {
            transferBtn.addEventListener('click', () => this.showTransferForm());
        }
        
        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', () => this.showUpdateStatusForm());
        }
    }

    showTransferForm() {
        const formsContainer = document.getElementById('action-forms');
        formsContainer.innerHTML = `
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-medium mb-3">Transfer Ownership</h3>
                <form id="transfer-form" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">New Owner Address</label>
                        <input type="text" id="new-owner" required
                               placeholder="0x..."
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                            Transfer
                        </button>
                        <button type="button" onclick="document.getElementById('action-forms').innerHTML=''" 
                                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('transfer-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newOwner = document.getElementById('new-owner').value;
            try {
                await this.contractService.transferOwnership(this.componentId, newOwner);
                document.getElementById('action-forms').innerHTML = '';
                await this.loadComponentData();
            } catch (error) {
                console.error('Transfer failed:', error);
            }
        });
    }

    showUpdateStatusForm() {
        const formsContainer = document.getElementById('action-forms');
        formsContainer.innerHTML = `
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-medium mb-3">Update Status</h3>
                <form id="status-form" class="space-y-3">
                    <div>
                        
<label class="block text-sm font-medium text-gray-700">New Status</label>
                        <input type="text" id="new-status" required
                               placeholder="e.g., In Transit, Delivered, etc."
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Details</label>
                        <textarea id="status-details" rows="2"
                                  placeholder="Additional details about the status change..."
                                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
                            Update Status
                        </button>
                        <button type="button" onclick="document.getElementById('action-forms').innerHTML=''" 
                                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('status-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('new-status').value;
            const details = document.getElementById('status-details').value;
            try {
                await this.contractService.updateComponentStatus(this.componentId, newStatus, details);
                document.getElementById('action-forms').innerHTML = '';
                await this.loadComponentData();
            } catch (error) {
                console.error('Status update failed:', error);
            }
        });
    }
}
