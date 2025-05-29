export class Web3Context {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
        this.networkName = null;
        this.isConnected = false;
        this.isLoading = false;
        this.error = null;
        this.listeners = [];
        
        this.init();
    }

    async init() {
        if (typeof window.ethereum !== 'undefined') {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.setupEventListeners();
            
            // Check if already connected
            const accounts = await this.provider.listAccounts();
            if (accounts.length > 0) {
                await this.setConnectedState(accounts[0]);
            }
        }
    }

    setupEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.setConnectedState(accounts[0]);
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }
    }

    async connectWallet() {
        try {
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            await this.setConnectedState(accounts[0]);
            
        } catch (error) {
            this.error = error.message;
            this.isLoading = false;
            this.notifyListeners();
            throw error;
        }
    }

    async setConnectedState(account) {
        this.account = account;
        this.signer = this.provider.getSigner();
        const network = await this.provider.getNetwork();
        this.chainId = network.chainId;
        this.networkName = network.name;
        this.isConnected = true;
        this.isLoading = false;
        this.error = null;
        this.notifyListeners();
    }

    disconnect() {
        this.account = null;
        this.signer = null;
        this.chainId = null;
        this.networkName = null;
        this.isConnected = false;
        this.isLoading = false;
        this.error = null;
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    getState() {
        return {
            provider: this.provider,
            signer: this.signer,
            account: this.account,
            chainId: this.chainId,
            networkName: this.networkName,
            isConnected: this.isConnected,
            isLoading: this.isLoading,
            error: this.error
        };
    }
}
