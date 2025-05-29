import { ComponentCard } from '../components/componentCard.js';
import { ContractService } from '../services/contractService.js';

export class HomePage {
    constructor(contractContext, transactionNotifier) {
        this.contractContext = contractContext;
        this.contractService = new ContractService(contractContext, transactionNotifier);
        this.components = [];
        this.isLoading = false;
    }

    render() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Supply Chain Components</h1>
                    <button id="refresh-btn" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                        Refresh
                    </button>
                </div>
                
                <div id="components-container">
                    ${this.isLoading ? this.renderLoading() : this.renderComponents()}
                </div>
                
                <div class="text-center">
                    <div class="bg-white rounded-lg p-6 shadow">
                        <h3 class="text-lg font-medium mb-2">Search Component</h3>
                        <div class="flex space-x-2">
                            <input type="number" id="search-input" placeholder="Enter Component ID" 
                                   class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <button id="search-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="flex justify-center items-center py-12">
                <div class="text-gray-500">Loading components...</div>
            </div>
        `;
    }

    renderComponents() {
        if (this.components.length === 0) {
            return `
                <div class="text-center py-12">
                    <div class="text-gray-500 mb-4">No components found</div>
                    <p class="text-sm text-gray-400">Components will appear here when registered or when you search by ID</p>
                </div>
            `;
        }

        return `
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                ${this.components.map(component => new ComponentCard(component, this.viewComponent.bind(this)).render()).join('')}
            </div>
        `;
    }

    async init() {
        // Setup event listeners
        const refreshBtn = document.getElementById('refresh-btn');
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchComponent());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchComponent();
                }
            });
        }

        // Initialize component cards
        this.components.forEach(
component => {
            const card = new ComponentCard(component, this.viewComponent.bind(this));
            card.init();
        });

        // Listen for contract events
        this.contractContext.subscribe((state, event) => {
            if (event && event.type === 'ComponentRegistered') {
                this.loadComponent(event.data.componentId);
            }
        });
    }

    async searchComponent() {
        const input = document.getElementById('search-input');
        const componentId = input.value.trim();
        
        if (!componentId) return;
        
        try {
            const component = await this.contractService.getComponentDetails(componentId);
            
            // Add to components list if not already present
            const exists = this.components.find(c => c.id === componentId);
            if (!exists) {
                this.components.push(component);
                this.refresh();
            }
            
            // Navigate to component details
            this.viewComponent(componentId);
        } catch (error) {
            alert('Component not found or error loading details');
        }
    }

    async loadComponent(componentId) {
        try {
            const component = await this.contractService.getComponentDetails(componentId);
            const exists = this.components.find(c => c.id === componentId);
            if (!exists) {
                this.components.push(component);
                this.refresh();
            }
        } catch (error) {
            console.error('Failed to load component:', error);
        }
    }

    viewComponent(componentId) {
        window.router.navigate('component-details', { componentId });
    }

    refresh() {
        const container = document.getElementById('components-container');
        if (container) {
            container.innerHTML = this.renderComponents();
            this.init();
        }
    }
}
