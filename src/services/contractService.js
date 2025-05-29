export class ContractService {
    constructor(contractContext, transactionNotifier) {
        this.contractContext = contractContext;
        this.transactionNotifier = transactionNotifier;
    }

    async registerComponent(name, description, initialMetadata) {
        try {
            const { contract } = this.contractContext.getState();
            if (!contract) throw new Error('Contract not initialized');

            this.transactionNotifier.showPending('Registering component...');
            
            const tx = await contract.registerComponent(name, description, initialMetadata);
            this.transactionNotifier.showPending(`Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                const componentId = receipt.events?.[0]?.args?.componentId?.toString();
                this.transactionNotifier.showSuccess(`Component registered successfully! ID: ${componentId}`);
                return { success: true, componentId, txHash: tx.hash };
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            const message = this.parseError(error);
            this.transactionNotifier.showError(`Registration failed: ${message}`);
            throw error;
        }
    }

    async transferOwnership(componentId, newOwnerAddress) {
        try {
            const { contract } = this.contractContext.getState();
            if (!contract) throw new Error('Contract not initialized');

            this.transactionNotifier.showPending('Transferring ownership...');
            
            const tx = await contract.transferOwnership(componentId, newOwnerAddress);
            this.transactionNotifier.showPending(`Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                this.transactionNotifier.showSuccess('Ownership transferred successfully!');
                return { success: true, txHash: tx.hash };
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            const message = this.parseError(error);
            this.transactionNotifier.showError(`Transfer failed: ${message}`);
            throw error;
        }
    }

    async updateComponentStatus(componentId, newStatus, details) {
        try {
            const { contract } = this.contractContext.getState();
            if (!contract) throw new Error('Contract not initialized');

            this.transactionNotifier.showPending('Updating status...');
            
            const tx = await contract.updateComponentStatus(componentId, newStatus, details);
            this.transactionNotifier.showPending(`Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                this.transactionNotifier.showSuccess('Status updated successfully!');
                return { success: true, txHash: tx.hash };
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            const message = this.parseError(error);
            this.transactionNotifier.showError(`Status update failed: ${message}`);
            throw error;
        }
    }

    async getComponentDetails(componentId) {
        try {
            const { contract } = this.contractContext.getState();
            if (!contract) throw new Error('Contract not initialize
d');

            const result = await contract.getComponentDetails(componentId);
            
            return {
                id: result.id.toString(),
                name: result.name,
                description: result.description,
                currentOwner: result.currentOwner,
                currentStatus: result.currentStatus,
                timestamp: result.timestamp.toString(),
                initialMetadata: result.initialMetadata
            };
        } catch (error) {
            const message = this.parseError(error);
            throw new Error(`Failed to get component details: ${message}`);
        }
    }

    async getComponentHistory(componentId) {
        try {
            const { contract } = this.contractContext.getState();
            if (!contract) throw new Error('Contract not initialized');

            const history = await contract.getComponentHistory(componentId);
            
            return history.map(entry => ({
                action: entry.action,
                details: entry.details,
                by: entry.by,
                timestamp: entry.timestamp.toString()
            }));
        } catch (error) {
            const message = this.parseError(error);
            throw new Error(`Failed to get component history: ${message}`);
        }
    }

    async hasRole(role, account) {
        try {
            const { contract } = this.contractContext.getState();
            if (!contract) throw new Error('Contract not initialized');

            return await contract.hasRole(role, account);
        } catch (error) {
            console.error('Failed to check role:', error);
            return false;
        }
    }

    parseError(error) {
        if (error.reason) return error.reason;
        if (error.data?.message) return error.data.message;
        if (error.message) return error.message;
        return 'Unknown error occurred';
    }
}
