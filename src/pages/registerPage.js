import { ComponentForm } from '../components/componentForm.js';
import { ContractService } from '../services/contractService.js';

export class RegisterPage {
    constructor(contractContext, transactionNotifier) {
        this.contractContext = contractContext;
        this.contractService = new ContractService(contractContext, transactionNotifier);
        this.componentForm = null;
    }

    render() {
        return `
            <div class="max-w-2xl mx-auto">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Register New Component</h1>
                    <p class="text-gray-600 mt-2">Add a new component to the supply chain tracking system.</p>
                </div>
                
                <div id="wallet-check"></div>
                <div id="form-container"></div>
            </div>
        `;
    }

    init() {
        this.checkWalletConnection();
        
        this.contractContext.subscribe((state) => {
            this.checkWalletConnection();
        });
    }

    checkWalletConnection() {
        const walletCheck = document.getElementById('wallet-check');
        const formContainer = document.getElementById('form-container');
        const web3State = this.contractContext.web3Context.getState();
        
        if (!web3State.isConnected) {
            walletCheck.innerHTML = `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">Wallet Connection Required</h3>
                            <p class="mt-1 text-sm text-yellow-700">Please connect your wallet to register components.</p>
                        </div>
                    </div>
                </div>
            `;
            formContainer.innerHTML = '';
            return;
        }

        walletCheck.innerHTML = '';
        
        if (!this.componentForm) {
            this.componentForm = new ComponentForm(
                this.contractService,
                (result) => this.onRegistrationSuccess(result)
            );
        }
        
        formContainer.innerHTML = this.componentForm.render();
        this.componentForm.init();
    }

    onRegistrationSuccess(result) {
        // Navigate to component details
        window.router.navigate('component-details', { componentId: result.componentId });
    }
}
