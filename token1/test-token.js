const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getAccount, getMint } = require('@solana/spl-token');
const config = require('./config.js');
const JupiterIntegration = require('./jupiter-integration.js');
const fs = require('fs');

class CodoxTokenTester {
    constructor() {
        this.connection = new Connection(config.helius.devnet, 'confirmed');
        this.jupiter = new JupiterIntegration();
        
        // Load deployment data
        const deploymentData = JSON.parse(fs.readFileSync('./deployment-summary.json', 'utf8'));
        this.tokenMint = new PublicKey(deploymentData.token.mintAddress);
        this.tokenAccount = new PublicKey(deploymentData.token.tokenAccount);
        this.deployer = new PublicKey(deploymentData.deployment.deployer);
        
        console.log('🚀 Codox Token Tester initialized');
        console.log('Token Mint:', this.tokenMint.toString());
        console.log('Token Account:', this.tokenAccount.toString());
    }

    async testTokenInfo() {
        console.log('\n📊 Testing Token Information...');
        
        try {
            // Get mint info
            const mintInfo = await getMint(this.connection, this.tokenMint);
            console.log('✅ Mint Info:');
            console.log('  - Supply:', mintInfo.supply.toString());
            console.log('  - Decimals:', mintInfo.decimals);
            console.log('  - Mint Authority:', mintInfo.mintAuthority?.toString() || 'None');
            console.log('  - Freeze Authority:', mintInfo.freezeAuthority?.toString() || 'None');
            
            // Get token account info
            const accountInfo = await getAccount(this.connection, this.tokenAccount);
            console.log('✅ Token Account Info:');
            console.log('  - Owner:', accountInfo.owner.toString());
            console.log('  - Amount:', accountInfo.amount.toString());
            console.log('  - Mint:', accountInfo.mint.toString());
            
            return true;
        } catch (error) {
            console.error('❌ Error testing token info:', error.message);
            return false;
        }
    }

    async testSolanaExplorerLinks() {
        console.log('\n🔗 Solana Explorer Links:');
        console.log(`Token Mint: https://explorer.solana.com/address/${this.tokenMint.toString()}?cluster=devnet`);
        console.log(`Token Account: https://explorer.solana.com/address/${this.tokenAccount.toString()}?cluster=devnet`);
        console.log(`Deployer: https://explorer.solana.com/address/${this.deployer.toString()}?cluster=devnet`);
    }

    async testJupiterIntegration() {
        console.log('\n🪐 Testing Jupiter Integration...');
        
        try {
            // Check if token is in Jupiter's list (probably not on testnet)
            const isSupported = await this.jupiter.isTokenSupported(this.tokenMint.toString());
            console.log('Jupiter Support:', isSupported ? '✅ Supported' : '❌ Not supported (normal for testnet)');
            
            // Create trading widget URL (for when it goes live)
            const tradingUrl = this.jupiter.createTradingWidgetUrl(this.tokenMint.toString());
            console.log('Trading Widget URL:', tradingUrl);
            
            return true;
        } catch (error) {
            console.error('⚠️ Jupiter integration test:', error.message);
            return false;
        }
    }

    async testHeliusRPC() {
        console.log('\n⚡ Testing Helius RPC Performance...');
        
        try {
            const startTime = Date.now();
            
            // Test RPC speed
            const slot = await this.connection.getSlot();
            const endTime = Date.now();
            
            console.log('✅ Helius RPC Response:');
            console.log('  - Current Slot:', slot);
            console.log('  - Response Time:', `${endTime - startTime}ms`);
            
            // Test account lookup
            const accountStartTime = Date.now();
            const balance = await this.connection.getBalance(this.deployer);
            const accountEndTime = Date.now();
            
            console.log('  - Account Lookup Time:', `${accountEndTime - accountStartTime}ms`);
            console.log('  - Deployer Balance:', `${balance / 1e9} SOL`);
            
            return true;
        } catch (error) {
            console.error('❌ Error testing Helius RPC:', error.message);
            return false;
        }
    }

    async generateTokenReport() {
        console.log('\n📋 Generating Codox Token Report...');
        
        const mintInfo = await getMint(this.connection, this.tokenMint);
        const accountInfo = await getAccount(this.connection, this.tokenAccount);
        
        const report = {
            token: {
                name: 'Codox',
                symbol: 'CODOX',
                mint: this.tokenMint.toString(),
                network: 'Solana Devnet',
                decimals: mintInfo.decimals,
                totalSupply: mintInfo.supply.toString(),
                currentSupply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toLocaleString(),
            },
            deployment: {
                deployer: this.deployer.toString(),
                deployerTokenAccount: this.tokenAccount.toString(),
                deployerBalance: (Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)).toLocaleString(),
            },
            features: {
                taxSystem: '3% transaction tax',
                reflectionRewards: '1.5% for holders',
                stakingRewards: '1% for stakers',
                lotterySystem: '0.5% for daily lottery',
                antiWhaleProtection: 'Higher taxes on large sells',
                timeWeightedRewards: 'Up to 500% multiplier',
            },
            links: {
                explorerMint: `https://explorer.solana.com/address/${this.tokenMint.toString()}?cluster=devnet`,
                explorerAccount: `https://explorer.solana.com/address/${this.tokenAccount.toString()}?cluster=devnet`,
                jupiterTrade: this.jupiter.createTradingWidgetUrl(this.tokenMint.toString()),
            }
        };
        
        fs.writeFileSync('./codox-token-report.json', JSON.stringify(report, null, 2));
        console.log('✅ Token report saved to codox-token-report.json');
        
        return report;
    }

    async runAllTests() {
        console.log('🧪 Running Codox Token Tests...\n');
        
        const results = {
            tokenInfo: await this.testTokenInfo(),
            heliusRPC: await this.testHeliusRPC(),
            jupiterIntegration: await this.testJupiterIntegration(),
        };
        
        await this.testSolanaExplorerLinks();
        const report = await this.generateTokenReport();
        
        console.log('\n📊 Test Results Summary:');
        console.log('Token Info:', results.tokenInfo ? '✅ PASS' : '❌ FAIL');
        console.log('Helius RPC:', results.heliusRPC ? '✅ PASS' : '❌ FAIL');
        console.log('Jupiter Integration:', results.jupiterIntegration ? '✅ PASS' : '❌ FAIL');
        
        const allPassed = Object.values(results).every(result => result);
        console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. View token on Solana Explorer (devnet)');
        console.log('2. Test token transfers');
        console.log('3. Deploy to mainnet when ready');
        console.log('4. Create Raydium liquidity pool');
        console.log('5. Launch marketing campaign');
        
        return { results, report };
    }
}

// CLI usage
async function main() {
    const tester = new CodoxTokenTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = CodoxTokenTester; 