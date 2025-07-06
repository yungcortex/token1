const {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const {
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    getAssociatedTokenAddress,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const fs = require('fs');
const BN = require('bn.js');
const config = require('./config.js');

// Configuration using Helius RPC for better performance
const SOLANA_RPC_URL = config.solana.network === 'devnet' ? config.helius.devnet : config.helius.mainnet;
const PRIVATE_KEY_PATH = config.solana.keypairPath;

// Codox Token Configuration from config file
const CODOX_TOKEN_CONFIG = {
    name: config.token.name,
    symbol: config.token.symbol,
    decimals: config.token.decimals,
    totalSupply: config.token.totalSupply,
    taxRate: config.tax.totalRate,
    reflectionRate: config.tax.reflectionRate,
    stakingRate: config.tax.stakingRate,
    lotteryRate: config.tax.lotteryRate,
};

// Raydium Configuration
const RAYDIUM_CONFIG = {
    programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
    ammProgramId: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
    serumProgramId: new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'),
    initialLiquidity: {
        tokenAmount: config.raydium.initialLiquidity.tokenAmount,
        solAmount: config.raydium.initialLiquidity.solAmount,
    },
};

class CodoxTokenDeployer {
    constructor() {
        this.connection = new Connection(SOLANA_RPC_URL, config.solana.commitment);
        this.payer = null;
        this.codoxTokenMint = null;
        this.codoxTokenAddress = null;
        console.log('Using Helius RPC for better performance:', config.solana.network);
    }

    async loadPayer() {
        try {
            const secretKey = JSON.parse(fs.readFileSync(PRIVATE_KEY_PATH, 'utf8'));
            this.payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
            console.log('Payer loaded:', this.payer.publicKey.toString());
            
            const balance = await this.connection.getBalance(this.payer.publicKey);
            console.log('Payer balance:', balance / LAMPORTS_PER_SOL, 'SOL');
            
            const requiredSol = config.solana.network === 'devnet' ? 2 : 10;
            if (balance < requiredSol * LAMPORTS_PER_SOL) {
                throw new Error(`Insufficient SOL balance. Need at least ${requiredSol} SOL for deployment.`);
            }
        } catch (error) {
            console.error('Error loading payer:', error);
            throw error;
        }
    }

    async createCodoxTokenMint() {
        console.log('Creating Codox token mint...');
        
        try {
            // Generate mint keypair
            this.codoxTokenMint = Keypair.generate();
            console.log('Codox token mint address:', this.codoxTokenMint.publicKey.toString());

            // Calculate rent for mint account
            const rentExemption = await this.connection.getMinimumBalanceForRentExemption(MINT_SIZE);

            // Create mint account
            const createMintAccountInstruction = SystemProgram.createAccount({
                fromPubkey: this.payer.publicKey,
                newAccountPubkey: this.codoxTokenMint.publicKey,
                space: MINT_SIZE,
                lamports: rentExemption,
                programId: TOKEN_PROGRAM_ID,
            });

            // Initialize mint
            const initializeMintInstruction = createInitializeMintInstruction(
                this.codoxTokenMint.publicKey,
                CODOX_TOKEN_CONFIG.decimals,
                this.payer.publicKey,
                this.payer.publicKey,
                TOKEN_PROGRAM_ID
            );

            const transaction = new Transaction().add(
                createMintAccountInstruction,
                initializeMintInstruction
            );

            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.payer, this.codoxTokenMint]
            );

            console.log('Codox token mint created successfully. Signature:', signature);
            return this.codoxTokenMint.publicKey;
        } catch (error) {
            console.error('Error creating Codox token mint:', error);
            throw error;
        }
    }

    async createTokenAccounts() {
        console.log('Creating token accounts...');
        
        try {
            // Create associated token account for deployer
            this.codoxTokenAddress = await getAssociatedTokenAddress(
                this.codoxTokenMint.publicKey,
                this.payer.publicKey
            );

            const createAtaInstruction = createAssociatedTokenAccountInstruction(
                this.payer.publicKey,
                this.codoxTokenAddress,
                this.payer.publicKey,
                this.codoxTokenMint.publicKey
            );

            const transaction = new Transaction().add(createAtaInstruction);

            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.payer]
            );

            console.log('Token account created successfully. Signature:', signature);
            console.log('Token account address:', this.codoxTokenAddress.toString());
        } catch (error) {
            console.error('Error creating token accounts:', error);
            throw error;
        }
    }

    async mintTokens() {
        console.log('Minting tokens...');
        
        try {
            const mintAmount = CODOX_TOKEN_CONFIG.totalSupply * Math.pow(10, CODOX_TOKEN_CONFIG.decimals);

            const mintInstruction = createMintToInstruction(
                this.codoxTokenMint.publicKey,
                this.codoxTokenAddress,
                this.payer.publicKey,
                mintAmount
            );

            const transaction = new Transaction().add(mintInstruction);

            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.payer]
            );

            console.log('Tokens minted successfully. Signature:', signature);
            console.log('Total supply:', CODOX_TOKEN_CONFIG.totalSupply.toLocaleString());
        } catch (error) {
            console.error('Error minting tokens:', error);
            throw error;
        }
    }

    async deployCodoxProgram() {
        console.log('Deploying Codox program...');
        
        try {
            // In a real deployment, you would compile and deploy the Rust program
            // For now, we'll simulate the deployment
            console.log('Codox program deployment simulated');
            console.log('Tax rate:', CODOX_TOKEN_CONFIG.taxRate / 100, '%');
            console.log('Reflection rate:', CODOX_TOKEN_CONFIG.reflectionRate / 100, '%');
            console.log('Staking rate:', CODOX_TOKEN_CONFIG.stakingRate / 100, '%');
            console.log('Lottery rate:', CODOX_TOKEN_CONFIG.lotteryRate / 100, '%');
        } catch (error) {
            console.error('Error deploying Codox program:', error);
            throw error;
        }
    }

    async createRaydiumPool() {
        console.log('Creating Raydium liquidity pool...');
        
        try {
            // This is a simplified version - actual Raydium integration requires more setup
            const poolSetup = {
                tokenMint: this.codoxTokenMint.publicKey.toString(),
                tokenAmount: RAYDIUM_CONFIG.initialLiquidity.tokenAmount,
                solAmount: RAYDIUM_CONFIG.initialLiquidity.solAmount,
                slippage: 1, // 1% slippage tolerance
            };

            console.log('Pool setup configuration:', poolSetup);
            console.log('Note: Complete Raydium integration requires additional setup');
            console.log('Visit https://raydium.io/pool/ to complete pool creation');
        } catch (error) {
            console.error('Error creating Raydium pool:', error);
            throw error;
        }
    }

    async generateDeploymentSummary() {
        const summary = {
            deployment: {
                network: 'Solana Mainnet',
                timestamp: new Date().toISOString(),
                deployer: this.payer.publicKey.toString(),
            },
            token: {
                name: CODOX_TOKEN_CONFIG.name,
                symbol: CODOX_TOKEN_CONFIG.symbol,
                decimals: CODOX_TOKEN_CONFIG.decimals,
                totalSupply: CODOX_TOKEN_CONFIG.totalSupply,
                mintAddress: this.codoxTokenMint.publicKey.toString(),
                tokenAccount: this.codoxTokenAddress.toString(),
            },
            taxMechanics: {
                totalTaxRate: CODOX_TOKEN_CONFIG.taxRate / 100,
                reflectionRate: CODOX_TOKEN_CONFIG.reflectionRate / 100,
                stakingRate: CODOX_TOKEN_CONFIG.stakingRate / 100,
                lotteryRate: CODOX_TOKEN_CONFIG.lotteryRate / 100,
            },
            liquidity: {
                initialTokens: RAYDIUM_CONFIG.initialLiquidity.tokenAmount,
                initialSol: RAYDIUM_CONFIG.initialLiquidity.solAmount,
                platform: 'Raydium',
            },
            nextSteps: [
                '1. Complete Raydium pool setup at https://raydium.io/pool/',
                '2. Add initial liquidity',
                '3. Verify contract on Solana Explorer',
                '4. Update tokenomics page with live data',
                '5. Launch marketing campaign',
            ],
        };

        fs.writeFileSync('./deployment-summary.json', JSON.stringify(summary, null, 2));
        console.log('\n=== DEPLOYMENT SUMMARY ===');
        console.log(JSON.stringify(summary, null, 2));
        console.log('\nDeployment summary saved to deployment-summary.json');
    }

    async deploy() {
        console.log('Starting Codox Token deployment...\n');
        
        try {
            await this.loadPayer();
            await this.createCodoxTokenMint();
            await this.createTokenAccounts();
            await this.mintTokens();
            await this.deployCodoxProgram();
            await this.createRaydiumPool();
            await this.generateDeploymentSummary();
            
            console.log('\n✅ Deployment completed successfully!');
            console.log('Token mint address:', this.codoxTokenMint.publicKey.toString());
            console.log('Next: Complete Raydium pool setup for trading');
            
        } catch (error) {
            console.error('\n❌ Deployment failed:', error);
            throw error;
        }
    }
}

// CLI usage
async function main() {
    const deployer = new CodoxTokenDeployer();
    await deployer.deploy();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { CodoxTokenDeployer, CODOX_TOKEN_CONFIG, RAYDIUM_CONFIG }; 