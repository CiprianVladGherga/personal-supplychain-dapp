# Supply Chain Tracking System

Decentralized application using Solidity, Hardhat, and React to track product components throughout a supply chain. This repository contains the smart contract, deployment scripts, tests, and a basic React frontend for interacting with the contract.

## Project Overview

This project implements a transparent and immutable system for tracking product components. Using a Solidity smart contract deployed on an Ethereum-compatible blockchain, it allows manufacturers to register unique components, current owners to transfer ownership, and authorized parties to update component statuses. A React frontend provides a user interface for interacting with the smart contract, enabling wallet connection, component registration, and viewing component details and history.

## Directory Structure

The project adheres to a standard Hardhat and web application structure:

```
.
├── contracts/           # Smart contract source files
│   └── SupplyChain.sol    # The main Supply Chain contract
├── scripts/             # Hardhat deployment scripts
│   └── deploy.js          # Script to deploy SupplyChain.sol
├── test/                # Smart contract test files
│   └── SupplyChain.js     # Tests for the SupplyChain contract (using Mocha/Chai)
├── client/              # React frontend application
│   ├── public/          # Static assets (index.html, etc.)
│   ├── src/             # Frontend source code
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React Contexts for Web3/Contract state
│   │   ├── pages/         # Components for different views/routes
│   │   ├── services/      # Logic for interacting with the smart contract
│   │   ├── utils/         # Helper functions
│   │   └── ...
│   ├── package.json     # Frontend dependencies
│   └── ...
├── hardhat.config.js    # Hardhat configuration
├── package.json         # Hardhat project dependencies
└── README.md            # This file
```

-   `contracts/`: Contains `SupplyChain.sol`, the core logic.
-   `scripts/`: Contains `deploy.js`, used to deploy the `SupplyChain` contract.
-   `test/`: Contains `SupplyChain.js`, automated tests for the contract.
-   `client/`: Houses the React frontend, including components, context for blockchain state, service layer for contract interaction, and pages for different views. The `src/contracts/SupplyChain.json` file is expected to contain the contract ABI and address after compilation/deployment.

## Prerequisites

Before running this project, ensure you have the following installed:

*   Node.js: Version 14 or higher. [Download Node.js](https://nodejs.org/)
*   npm or Yarn: npm comes with Node.js, Yarn is an alternative package manager. [Install Yarn](https://yarnpkg.com/)

You will also need a browser extension wallet like MetaMask to interact with the frontend and a local blockchain node (like the one provided by Hardhat).

## Setup and Installation

Follow these steps to set up and run the project locally:

1.  Clone the repository:
    ```bash
    # Replace with your repository URL
    git clone https://github.com/your-username/supply-chain-tracker.git
    cd supply-chain-tracker
    ```

2.  Install Hardhat project dependencies:
    Navigate to the root directory of the project and install the necessary packages for smart contract development:
    ```bash
    npm install
    # or
    yarn install
    ```
    Key dependencies installed: `hardhat`, `ethers`, `@nomicfoundation/hardhat-toolbox` (includes Mocha, Chai, Waffle), `@openzeppelin/contracts` (for `AccessControl`).

3.  Install React client dependencies:
    Navigate into the `client` directory and install its dependencies:
    ```bash
    cd client
    npm install
    # or
    yarn install
    ```
    Key dependencies installed: `react`, `react-dom`, `ethers` (for frontend blockchain interaction), `serve` (for local static server).

## Smart Contract (`SupplyChain.sol`)

The `SupplyChain.sol` smart contract is built using Solidity and leverages OpenZeppelin's `AccessControl` for role-based permissions. Its core functionalities include:

*   Component Registration: Only accounts with the `MANUFACTURER_ROLE` can register new components with unique IDs, name, description, and initial metadata. The registering account becomes the initial owner.
*   Ownership Transfer: The current owner of a component can transfer its ownership to another address.
*   Status Updates: The current owner of a component can update its status (e.g., "Manufactured", "In Transit", "Delivered") and add details about the change.
*   History Logging: Every significant action (registration, transfer, status update) is recorded as an immutable `HistoryEntry` associated with the component.
*   Data Retrieval: Public view functions allow anyone to retrieve the current details and the full history of any registered component by its ID.

## Compilation

To compile the smart contract, navigate to the root directory of the project and run:

```bash
npx hardhat compile
```
This command compiles the `SupplyChain.sol` contract and generates artifacts (including the ABI and bytecode) in the `artifacts/` directory. A copy of the ABI and a placeholder address are placed in `client/src/contracts/SupplyChain.json` for frontend usage.

## Testing

The project includes unit tests for the smart contract using Mocha and Chai within the Hardhat environment. To run the tests:

```bash
npx hardhat test
```
The tests cover deployment, role assignment, component registration (including access control), ownership transfer (including permissions and error conditions), status updates (including permissions and error conditions), and data retrieval for components and their history.

## Deployment

You can deploy the `SupplyChain.sol` contract to a local Hardhat network for testing the full application flow.

1.  Start a local Hardhat network:
    Open a separate terminal window in the project's root directory and run:
    ```bash
    npx hardhat node
    ```
    This starts a local blockchain node and provides test accounts and private keys.

2.  Deploy the contract:
    In your primary terminal (in the project root), run the deployment script targeting the local network:
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    The deployment script will print the address where the `SupplyChain` contract was deployed. Note down this address as you will need it for the frontend. The `client/src/contracts/SupplyChain.json` file *should* be automatically updated by a Hardhat task or manually updated with this address for the frontend to connect correctly. The provided `SupplyChain.json` reference includes a default local address (`0x5FbDB2315678afecb367f032d93F642f64180aa3`) which matches Hardhat's default first deployed contract address, so manual update might not be strictly necessary if using the default setup.

## React Frontend (`client/`)

The React frontend is located in the `client/` directory. It provides a web interface to interact with the deployed smart contract.

1.  Start the React development server:
    Navigate into the `client` directory and run the start script:
    ```bash
    cd client
    npm start
    # or
    yarn start
    ```
    This command uses the `serve` package to host the static `index.html` and its linked JavaScript files. It will typically open the application in your browser at `http://localhost:3000`.

2.  Frontend Functionality:
    The frontend allows users to:
    *   Connect their Ethereum wallet (e.g., MetaMask) using the `WalletConnector` component and `web3Context`.
    *   See their connected account and network.
    *   Register new components (requires the connected account to have the `MANUFACTURER_ROLE` on the contract). This uses the `RegisterPage` and `ComponentForm`.
    *   Search for components by ID (`HomePage`).
    *   View detailed information and the full history of a specific component (`ComponentDetailsPage`).
    *   If the connected account is the current owner of a component, the frontend presents options to transfer ownership or update the component's status (`ComponentDetailsPage`).
    *   Transaction notifications (`TransactionNotifier`) provide feedback on blockchain interactions.

3.  Configuring the Contract Address:
    The frontend needs to know the address of the deployed `SupplyChain.sol` contract. This is configured in `client/src/contexts/contractContext.js`. It attempts to fetch `./src/contracts/SupplyChain.json`, which should contain the deployed address and the contract's ABI. Ensure this file contains the correct address after deployment if you are deploying to a network other than the default Hardhat local network or if the default address changes.

## Connecting Frontend to Smart Contract

The frontend interacts with the deployed `SupplyChain.sol` contract using the `ethers.js` library.

*   The `client/src/contexts/web3Context.js` manages the connection to the user's wallet (`window.ethereum`), providing an `ethers.js` Provider and Signer.
*   The `client/src/contexts/contractContext.js` uses the Provider/Signer from `web3Context` and the contract's ABI (Application Binary Interface, loaded from `client/src/contracts/SupplyChain.json`) and deployed address to create an `ethers.Contract` instance.
*   The `client/src/services/contractService.js` acts as an abstraction layer. It uses the `ethers.Contract` instance from `contractContext` to:
    *   Call state-changing functions (`registerComponent`, `transferOwnership`, `updateComponentStatus`) by sending transactions signed by the connected wallet's Signer.
    *   Call read-only (view) functions (`getComponentDetails`, `getComponentHistory`, `hasRole`) using the contract instance with the Provider (or Signer).
    *   Handle transaction submission, waiting for confirmations, and parsing potential errors.
*   The frontend components (`HomePage`, `RegisterPage`, `ComponentDetailsPage`) call methods on the `ContractService` to perform blockchain operations or fetch data, keeping the UI logic separate from the blockchain interaction details.
*   The `contractContext` also sets up event listeners using `contract.on()` to subscribe to events like `ComponentRegistered`, `OwnershipTransferred`, and `StatusUpdated`, allowing the frontend UI to react to changes on the blockchain in real-time (e.g., updating component lists or details).