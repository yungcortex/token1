// Configuration file for Codox Token deployment
module.exports = {
    // Helius RPC Configuration (Premium endpoints)
    helius: {
        apiKey: 'b301277c-743a-4448-9a15-03fbfce4c6ed',
        mainnet: 'https://mainnet.helius-rpc.com/?api-key=b301277c-743a-4448-9a15-03fbfce4c6ed',
        devnet: 'https://devnet.helius-rpc.com/?api-key=b301277c-743a-4448-9a15-03fbfce4c6ed',
    },
    
    // Jupiter Pro API Configuration
    jupiter: {
        apiKey: '9af4a829-79f0-400d-802e-eac78171a34c',
        quoteApi: 'https://quote-api.jup.ag/v6',
        swapApi: 'https://quote-api.jup.ag/v6/swap',
        priceApi: 'https://price.jup.ag/v4/price',
    },
    
    // Solana Network Configuration
    solana: {
        network: process.env.SOLANA_NETWORK || 'devnet',
        commitment: 'confirmed',
        keypairPath: process.env.PRIVATE_KEY_PATH || './deployer-keypair.json',
    },
    
    // Token Configuration
    token: {
        name: 'Codox',
        symbol: 'CODOX',
        decimals: 9,
        totalSupply: 1_000_000_000,
        description: 'Advanced reward token with multi-layered incentives',
        image: 'https://codox.com/logo.png', // Update with actual logo URL
        website: 'https://codox.com',
        twitter: 'https://twitter.com/codoxvirus',
        telegram: 'https://t.me/codoxvirus',
    },
    
    // Tax Configuration
    tax: {
        totalRate: 300, // 3% in basis points
        reflectionRate: 150, // 1.5%
        stakingRate: 100, // 1%
        lotteryRate: 50, // 0.5%
    },
    
    // Raydium Configuration
    raydium: {
        initialLiquidity: {
            tokenAmount: 100_000_000, // 10% of supply
            solAmount: 10, // 10 SOL for devnet testing
        },
        slippageTolerance: 100, // 1% in basis points
    },
    
    // Development Settings
    dev: {
        airdropAmount: 2, // SOL to airdrop for testing
        testTokens: 10_000, // Test tokens to mint for testing
        enableDebugLogs: true,
    }
}; 