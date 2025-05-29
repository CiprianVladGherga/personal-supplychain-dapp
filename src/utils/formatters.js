export const formatters = {
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    formatTimestamp(timestamp) {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString();
    },

    formatEther(wei) {
        return ethers.utils.formatEther(wei);
    },

    parseEther(ether) {
        return ethers.utils.parseEther(ether);
    }
};
