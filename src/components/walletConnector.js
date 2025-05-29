export class WalletConnector {
    constructor(web3Context) {
        this.web3Context = web3Context;
        this.element = null;
        this.init();
    }

    init() {
        this.render();
        this.web3Context.subscribe((state) => {
            this.render();
        });
    }

    render() {
        const container = document.getElementById('wallet-connector');
        if (!container) return;

        const state = this.web3Context.getState();
        
        if (state.isConnected) {
            container.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="text-sm text-gray-600">
                        ${this.formatAddress(state.account)}
                    </div>
                    <div class="text-xs text-gray-500">
                        ${state.networkName || 'Unknown Network'}
                    </div>
                    <button id="disconnect-btn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                        Disconnect
                    </button>
                </div>
            `;
            
            document.getElementById('disconnect-btn').addEventListener('click', () => {
                this.web3Context.disconnect();
            });
        } else {
            container.innerHTML = `
                <button id="connect-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium ${state.isLoading ? 'opacity-50 cursor-not-allowed' : ''}">
                    ${state.isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            `;
            
            const connectBtn = document.getElementById('connect-btn');
            if (!state.isLoading) {
                connectBtn.addEventListener('click', async () => {
                    try {
                        await this.web3Context.connectWallet();
                    } catch (error) {
                        console.error('Connection failed:', error);
                    }
                });
            }
        }

        if (state.error) {
            container.innerHTML += `
                <div class="text-red-500 text-sm mt-2">
                    ${state.error}
                </div>
            `;
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
}
