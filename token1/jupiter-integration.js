const fetch = require('node-fetch');
const config = require('./config.js');

class JupiterIntegration {
    constructor() {
        this.apiKey = config.jupiter.apiKey;
        this.quoteApi = config.jupiter.quoteApi;
        this.swapApi = config.jupiter.swapApi;
        this.priceApi = config.jupiter.priceApi;
        this.headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey,
        };
    }

    /**
     * Get price quote for token swap
     * @param {string} inputMint - Input token mint address
     * @param {string} outputMint - Output token mint address
     * @param {number} amount - Amount to swap
     * @param {number} slippageBps - Slippage tolerance in basis points
     */
    async getQuote(inputMint, outputMint, amount, slippageBps = 50) {
        try {
            const url = `${this.quoteApi}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                throw new Error(`Quote API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting Jupiter quote:', error);
            throw error;
        }
    }

    /**
     * Get current price for a token
     * @param {string} tokenMint - Token mint address
     */
    async getPrice(tokenMint) {
        try {
            const url = `${this.priceApi}?ids=${tokenMint}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                throw new Error(`Price API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting Jupiter price:', error);
            throw error;
        }
    }

    /**
     * Get swap transaction
     * @param {Object} quoteResponse - Quote response from getQuote
     * @param {string} userPublicKey - User's public key
     * @param {boolean} wrapAndUnwrapSol - Whether to wrap/unwrap SOL
     */
    async getSwapTransaction(quoteResponse, userPublicKey, wrapAndUnwrapSol = true) {
        try {
            const swapRequest = {
                quoteResponse,
                userPublicKey,
                wrapAndUnwrapSol,
                computeUnitPriceMicroLamports: 'auto',
            };

            const response = await fetch(`${this.swapApi}/swap`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(swapRequest),
            });

            if (!response.ok) {
                throw new Error(`Swap API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting swap transaction:', error);
            throw error;
        }
    }

    /**
     * Get token list from Jupiter
     */
    async getTokenList() {
        try {
            const url = 'https://token.jup.ag/all';
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                throw new Error(`Token list API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting token list:', error);
            throw error;
        }
    }

    /**
     * Check if token is supported by Jupiter
     * @param {string} tokenMint - Token mint address
     */
    async isTokenSupported(tokenMint) {
        try {
            const tokenList = await this.getTokenList();
            return tokenList.some(token => token.address === tokenMint);
        } catch (error) {
            console.error('Error checking token support:', error);
            return false;
        }
    }

    /**
     * Get best route for token swap
     * @param {string} inputMint - Input token mint
     * @param {string} outputMint - Output token mint
     * @param {number} amount - Amount to swap
     * @param {number} slippageBps - Slippage tolerance
     */
    async getBestRoute(inputMint, outputMint, amount, slippageBps = 50) {
        try {
            const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps);
            
            if (!quote || !quote.routePlan) {
                throw new Error('No route found for this swap');
            }

            const routeInfo = {
                inputAmount: quote.inAmount,
                outputAmount: quote.outAmount,
                priceImpact: quote.priceImpactPct,
                marketInfos: quote.routePlan.map(route => ({
                    label: route.swapInfo.label,
                    inputMint: route.swapInfo.inputMint,
                    outputMint: route.swapInfo.outputMint,
                    inAmount: route.swapInfo.inAmount,
                    outAmount: route.swapInfo.outAmount,
                    feeAmount: route.swapInfo.feeAmount,
                    feeMint: route.swapInfo.feeMint,
                })),
                timeTaken: quote.timeTaken,
            };

            return routeInfo;
        } catch (error) {
            console.error('Error getting best route:', error);
            throw error;
        }
    }

    /**
     * Create a trading widget URL for Codox token
     * @param {string} codoxMint - Codox token mint address
     */
    createTradingWidgetUrl(codoxMint) {
        const params = new URLSearchParams({
            inputMint: 'So11111111111111111111111111111111111111112', // SOL
            outputMint: codoxMint,
            amount: '1000000000', // 1 SOL
            slippageBps: '50', // 0.5%
            referral: 'CodoxToken',
        });

        return `https://jup.ag/swap/${codoxMint}?${params.toString()}`;
    }

    /**
     * Monitor price changes for Codox token
     * @param {string} codoxMint - Codox token mint address
     * @param {number} intervalMs - Monitoring interval in milliseconds
     */
    async monitorPrice(codoxMint, intervalMs = 30000) {
        console.log(`Starting price monitoring for Codox token: ${codoxMint}`);
        
        let lastPrice = null;
        
        const checkPrice = async () => {
            try {
                const priceData = await this.getPrice(codoxMint);
                const currentPrice = priceData.data[codoxMint]?.price;
                
                if (currentPrice !== undefined) {
                    if (lastPrice !== null) {
                        const changePercent = ((currentPrice - lastPrice) / lastPrice) * 100;
                        console.log(`Codox Price: $${currentPrice.toFixed(6)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
                    } else {
                        console.log(`Codox Price: $${currentPrice.toFixed(6)}`);
                    }
                    lastPrice = currentPrice;
                } else {
                    console.log('Codox price not available yet');
                }
            } catch (error) {
                console.error('Error monitoring price:', error.message);
            }
        };

        // Initial check
        await checkPrice();
        
        // Set up interval
        setInterval(checkPrice, intervalMs);
    }
}

module.exports = JupiterIntegration; 