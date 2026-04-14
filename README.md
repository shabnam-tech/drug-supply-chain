# Drug Supply Chain DApp

This project contains:
- Hardhat smart contract code in the root folder
- React + Vite frontend in `drug-ui`

## 1) Deploy smart contract

From the project root:

```bash
npx hardhat node
```

In another terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed contract address.

## 2) Configure frontend contract address

```bash
cd drug-ui
cp .env.example .env
```

Update `drug-ui/.env`:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## 3) Run frontend

```bash
cd drug-ui
npm run dev
```

Open the app in your browser and connect MetaMask.
