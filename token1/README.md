# 🚀 Codox - Advanced Solana Reward System

A revolutionary Codox token built on Solana with multiple reward mechanisms designed to benefit long-term holders through reflection rewards, staking bonuses, and lottery systems.

## 🎯 Features

### Multi-Layered Reward System
- **Reflection Rewards**: Time-weighted passive income for all holders
- **Staking System**: 25% APY for staked tokens with no lock-up period
- **Daily Lottery**: Automatic participation with balance-weighted chances
- **Anti-Whale Protection**: Higher taxes on large sells redistributed to smaller holders
- **Diamond Hand Bonuses**: Up to 500% multiplier for long-term holders

### Technical Features
- **Rust-based Smart Contract**: Secure, efficient, and auditable code
- **Raydium Integration**: Seamless DEX trading and liquidity provision
- **Zero-Gas Claims**: Reflection rewards claimed without transaction fees
- **Deflationary Mechanics**: 10% of taxes permanently burned
- **Real-time Analytics**: Track rewards, staking, and lottery stats

## 📊 Tokenomics

| Metric | Value |
|--------|-------|
| Total Supply | 1,000,000,000 CODOX |
| Transaction Tax | 3% |
| Reflection Pool | 1.5% |
| Staking Pool | 1.0% |
| Lottery Pool | 0.5% |
| Max Hold Multiplier | 500% |
| Staking APY | 25% |

## 🔧 Prerequisites

- **Rust**: Latest stable version
- **Node.js**: v16 or higher
- **Solana CLI**: v1.18 or higher
- **Cargo**: For building Rust programs

### Installation

1. **Install Rust and Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

2. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
   export PATH="~/.local/share/solana/install/active_release/bin:$PATH"
   ```

3. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

## 🏗️ Building the Project

### Build the Rust Program
```bash
# Debug build
cargo build-bpf

# Release build (optimized)
cargo build-bpf --release
```

### Run Tests
```bash
cargo test
```

## 🚀 Deployment

### 1. Setup Deployer Wallet
```bash
# Generate new keypair
solana-keygen new --outfile ./deployer-keypair.json

# Or use existing keypair
export PRIVATE_KEY_PATH="./your-keypair.json"
```

### 2. Configure Network
```bash
# Mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Devnet (for testing)
solana config set --url https://api.devnet.solana.com
```

### 3. Fund Deployer Account
```bash
# Mainnet: Transfer SOL to your deployer address
# Devnet: Get airdrop
solana airdrop 10
```

### 4. Deploy Token
```bash
npm run deploy
```

### 5. Set Environment Variables
```bash
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
export PRIVATE_KEY_PATH="./deployer-keypair.json"
```

## 📈 Reward Mechanisms Explained

### 1. Time-Weighted Reflection System
```
Base Multiplier: 100%
Daily Increase: +2%
Maximum: 500% (after 365 days)

Example:
- Day 1: 100% multiplier
- Day 30: 160% multiplier  
- Day 180: 460% multiplier
- Day 365+: 500% multiplier
```

### 2. Staking Rewards
```
Base APY: 25%
Compounding: Daily
Lock-up: None
Additional Benefits: Staked tokens still earn reflection rewards

Daily Return = (Staked Amount × 25%) ÷ 365
```

### 3. Lottery System
```
Frequency: Daily (24-hour intervals)
Participation: Automatic for all holders
Win Chance: Proportional to token balance
Average Prize: 10,000-50,000 CODOX tokens
```

### 4. Anti-Whale Tax
```
Threshold: >1% of total supply
Standard Tax: 3%
Whale Tax: 6%
Redistribution: Extra tax goes to holders with <10M tokens
```

## 🔄 Usage Examples

### Transfer with Tax
```javascript
const { TransactionInstruction } = require('@solana/web3.js');

// Transfer 1000 tokens (97% received, 3% taxed)
const transferInstruction = new TransactionInstruction({
    keys: [
        { pubkey: sourceAccount, isSigner: true, isWritable: true },
        { pubkey: destinationAccount, isSigner: false, isWritable: true },
        // ... other required accounts
    ],
    programId: taxTokenProgramId,
    data: Buffer.from([1, ...amount.toArray('le', 8)]) // Transfer instruction
});
```

### Stake Tokens
```javascript
// Stake 10,000 tokens for 25% APY
const stakeInstruction = new TransactionInstruction({
    keys: [
        { pubkey: stakerAccount, isSigner: true, isWritable: true },
        { pubkey: stakingPool, isSigner: false, isWritable: true },
        // ... other required accounts
    ],
    programId: taxTokenProgramId,
    data: Buffer.from([2, ...stakeAmount.toArray('le', 8)]) // Stake instruction
});
```

### Claim Reflection Rewards
```javascript
// Claim accumulated reflection rewards
const claimInstruction = new TransactionInstruction({
    keys: [
        { pubkey: holderAccount, isSigner: true, isWritable: true },
        { pubkey: reflectionPool, isSigner: false, isWritable: true },
        // ... other required accounts
    ],
    programId: taxTokenProgramId,
    data: Buffer.from([3]) // Claim instruction
});
```

## 💰 Reward Calculator

Calculate your potential earnings:

```javascript
// Example calculation for 100K tokens held for 6 months
const calculateRewards = (balance, holdingDays, isStaked = false) => {
    const timeMultiplier = Math.min(5.0, 1.0 + (holdingDays * 0.02));
    const dailyReflection = (balance / 1000000000) * 50000 * timeMultiplier;
    const dailyStaking = isStaked ? (balance * 0.25) / 365 : 0;
    
    return {
        dailyReflection: dailyReflection.toFixed(2),
        dailyStaking: dailyStaking.toFixed(2),
        totalDaily: (dailyReflection + dailyStaking).toFixed(2),
        monthlyTotal: ((dailyReflection + dailyStaking) * 30).toFixed(2),
        annualProjection: ((dailyReflection + dailyStaking) * 365).toFixed(2)
    };
};

// 100K tokens, 180 days, staked
console.log(calculateRewards(100000, 180, true));
// Output: Daily ~91.5 tokens, Monthly ~2,745 tokens, Annual ~33,397 tokens
```

## 🔗 Raydium Integration

### Create Liquidity Pool
1. Visit [Raydium Pool Creator](https://raydium.io/pool/)
2. Connect your wallet
3. Select your token mint address
4. Set initial liquidity:
   - Token Amount: 100,000,000 CODOX (10% of supply)
   - SOL Amount: 50 SOL
   - Slippage: 1%

### Add Liquidity
```bash
# After pool creation, add initial liquidity
raydium add-liquidity \
  --token-a-mint YOUR_TOKEN_MINT \
  --token-b-mint So11111111111111111111111111111111111111112 \
  --amount-a 100000000 \
  --amount-b 50000000000
```

## 📊 Monitoring & Analytics

### View Token Info
```bash
# Check token supply
spl-token supply YOUR_TOKEN_MINT

# Check account balance
spl-token balance YOUR_TOKEN_MINT

# View program accounts
solana program show YOUR_PROGRAM_ID
```

### Track Rewards
```javascript
// Monitor reflection pool growth
const checkReflectionPool = async () => {
    const poolInfo = await connection.getTokenAccountBalance(reflectionPoolAddress);
    console.log('Reflection Pool Balance:', poolInfo.value.uiAmount);
};

// Track staking stats
const checkStakingStats = async () => {
    const stakingInfo = await connection.getTokenAccountBalance(stakingPoolAddress);
    console.log('Total Staked:', stakingInfo.value.uiAmount);
};
```

## 🛡️ Security Features

- **Audited Smart Contract**: Comprehensive security review
- **Overflow Protection**: SafeMath operations throughout
- **Access Control**: Role-based permissions
- **Reentrancy Guards**: Protection against recursive calls
- **Emergency Pause**: Circuit breaker for emergencies

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
cargo test

# Run specific test
cargo test test_transfer_with_tax

# Run with output
cargo test -- --nocapture
```

### Integration Tests
```bash
# Test on devnet
solana config set --url https://api.devnet.solana.com
npm run deploy
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow Rust best practices
- Add tests for new features
- Update documentation
- Use conventional commits
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://codox.com](https://codox.com)
- **Tokenomics**: [View tokenomics.html](./tokenomics.html)
- **Raydium Pool**: [Trade on Raydium](https://raydium.io/swap)
- **Solana Explorer**: [View on Explorer](https://explorer.solana.com)
- **Discord**: [Join Community](https://discord.gg/codox)
- **Twitter**: [@Codox](https://twitter.com/codox)

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord for support and discussions
- **Email**: support@codox.com

## 🎯 Roadmap

- [x] Core tax token implementation
- [x] Reflection reward system
- [x] Staking mechanism
- [x] Lottery system
- [x] Anti-whale protection
- [x] Raydium integration
- [x] Tokenomics website
- [ ] Mobile app
- [ ] Governance system
- [ ] Cross-chain bridge
- [ ] NFT rewards
- [ ] Yield farming partnerships

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always do your own research and never invest more than you can afford to lose. The Codox token mechanisms are complex and may not perform as expected in all market conditions.

---

**Built with ❤️ for the Solana community** 