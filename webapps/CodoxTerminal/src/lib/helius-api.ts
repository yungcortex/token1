import axios from 'axios'

const HELIUS_BASE_URL = `https://api.helius.xyz/v0`

export class HeliusAPI {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || ''
  }

  // Get real-time Solana token prices
  async getTokenPrices(tokenMints: string[]): Promise<any> {
    try {
      const response = await axios.post(`${HELIUS_BASE_URL}/token-metadata`, {
        mintAccounts: tokenMints
      }, {
        params: { 'api-key': this.apiKey }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching token prices from Helius:', error)
      throw error
    }
  }

  // Get Solana meme coin data
  async getSolanaMemeTokens(): Promise<any[]> {
    const memeTokenMints = [
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
      'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
      'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4', // MYRO
      '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4', // JUP
      'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',  // BOME
    ]

    try {
      const response = await axios.post(`${HELIUS_BASE_URL}/token-metadata`, {
        mintAccounts: memeTokenMints
      }, {
        params: { 'api-key': this.apiKey }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching Solana meme tokens:', error)
      return []
    }
  }

  // Get real-time transactions for whale tracking
  async getWhaleTxns(tokenMint: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${HELIUS_BASE_URL}/transactions`, {
        params: {
          'api-key': this.apiKey,
          'type': 'SWAP',
          'source': 'RAYDIUM',
          'limit': limit,
          'token-account-address': tokenMint
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching whale transactions:', error)
      return []
    }
  }

  // Get DeFi analytics
  async getDeFiMetrics(): Promise<any> {
    try {
      const response = await axios.get(`${HELIUS_BASE_URL}/defi-analytics`, {
        params: { 'api-key': this.apiKey }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching DeFi metrics:', error)
      return null
    }
  }

  // WebSocket connection for real-time updates
  createWebSocket(): WebSocket {
    const wsUrl = `wss://api.helius.xyz/v0/ws?api-key=${this.apiKey}`
    return new WebSocket(wsUrl)
  }

  // Subscribe to real-time token updates
  subscribeToTokenUpdates(ws: WebSocket, tokenMints: string[]) {
    const subscriptionMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'transactionSubscribe',
      params: [
        {
          accountInclude: tokenMints,
          vote: false,
          failed: false
        },
        {
          commitment: 'finalized',
          encoding: 'json',
          transactionDetails: 'full',
          maxSupportedTransactionVersion: 0
        }
      ]
    }

    ws.send(JSON.stringify(subscriptionMessage))
  }

  // Get NFT floor prices for popular Solana collections
  async getNFTFloorPrices(): Promise<any[]> {
    const popularCollections = [
      'DeGod', 'y00ts', 'Okay Bears', 'Solana Monkey Business',
      'Degenerate Ape Academy', 'SolPunks'
    ]

    try {
      const response = await axios.get(`${HELIUS_BASE_URL}/nft/get-nft-events`, {
        params: {
          'api-key': this.apiKey,
          'types': 'SALE',
          'limit': 100
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching NFT floor prices:', error)
      return []
    }
  }

  // Get account holdings for portfolio tracking
  async getAccountHoldings(walletAddress: string): Promise<any> {
    try {
      const response = await axios.get(`${HELIUS_BASE_URL}/addresses/${walletAddress}/balances`, {
        params: { 'api-key': this.apiKey }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching account holdings:', error)
      return null
    }
  }
}

export const heliusAPI = new HeliusAPI() 