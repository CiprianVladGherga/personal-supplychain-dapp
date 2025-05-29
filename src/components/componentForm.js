export class ComponentForm {
    constructor(contractService, onSuccess) {
        this.contractService = contractService;
        this.onSuccess = onSuccess;
        this.isLoading = false;
    }

    render() {
        return `
            <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-6">Register New Component</h2>
                
                <form id="component-form" class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Component Name</label>
                        <input type="text" id="name" name="name" required
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" rows="3" required
                                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    
                    <div>
                        <label for="metadata" class="block text-sm font-medium text-gray-700">Initial Metadata</label>
                        <textarea id="metadata" name="metadata" rows="2"
                                  placeholder="Manufacturing details, specifications, etc."
                                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" id="submit-btn"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                            Register Component
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    init() {
        const form = document.getElementById('component-form');
        const submitBtn = document.getElementById('submit-btn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.isLoading) return;
            
            const formData = new FormData(form);
            const name = formData.get('name');
            const description = formData.get('description');
            const metadata = formData.get('metadata') || '';
            
            try {
                this.isLoading = true;
                submitBtn.textContent = 'Registering...';
                submitBtn.disabled = true;
                
                const result = await this.contractService.registerComponent(name, description, metadata);
                
                if (result.success) {
                    form.reset();
                    if (this.onSuccess) {
                        this.onSuccess(result);
                    }
                }
            } catch (error) {
                console.error('Registration failed:', error);
            } finally {
                this.isLoading = false;
                submitBtn.textContent = 'Register Component';
                submitBtn.disabled = false;
            }
        });
    }
}
