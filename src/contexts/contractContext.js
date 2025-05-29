export class ContractContext {
    constructor(web3Context) {
        this.web3Context = web3Context;
        this.contract = null;
        this.contractAddress = null;
        this.isLoading = false;
        this.error = null;
        this.listeners = [];
        
        this.init();
    }

    async init() {
        // Load contract ABI and address
        try {
            const response = await fetch('./src/contracts/SupplyChain.json');
            const contractData = await response.json();
            this.abi = contractData.abi;
            this.contractAddress = contractData.address || '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default for local development
            
            this.web3Context.subscribe((web3State) => {
                if (web3State.signer && !this.contract) {
                    this.initializeContract(web3State.signer);
                } else if (!web3State.signer && this.contract) {
                    this.contract = null;
                    this.notifyListeners();
                }
            });
        } catch (error) {
            this.error = 'Failed to load contract data';
            console.error('Contract initialization error:', error);
        }
    }

    initializeContract(signer) {
        try {
            this.contract = new ethers.Contract(this.contractAddress, this.abi, signer);
            this.setupEventListeners();
            this.error = null;
            this.notifyListeners();
        } catch (error) {
            this.error = 'Failed to initialize contract';
            console.error('Contract creation error:', error);
        }
    }

    setupEventListeners() {
        if (this.contract) {
            this.contract.on('ComponentRegistered', (componentId, manufacturer, name) => {
                this.notifyListeners({
                    type: 'ComponentRegistered',
                    data: { componentId: componentId.toString(), manufacturer, name }
                });
            });

            this.contract.on('OwnershipTransferred', (componentId, from, to) => {
                this.notifyListeners({
                    type: 'OwnershipTransferred',
                    data: { componentId: componentId.toString(), from, to }
                });
            });

            this.contract.on('StatusUpdated', (componentId, newStatus, updatedBy) => {
                this.notifyListeners({
                    type: 'StatusUpdated',
                    data: { componentId: componentId.toString(), newStatus, updatedBy }
                });
            });
        }
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners(event = null) {
        this.listeners.forEach(listener => listener(this.getState(), event));
    }

    getState() {
        return {
            contract: this.contract,
            contractAddress: this.contractAddress,
            abi: this.abi,
            isLoading: this.isLoading,
            error: this.error
        };
    }
}
