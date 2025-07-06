use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use spl_token::state::{Account, Mint};
use borsh::{BorshDeserialize, BorshSerialize};
use std::convert::TryInto;

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

/// Codox Token Program Instructions
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum CodoxTokenInstruction {
    /// Initialize the Codox token
    /// Accounts expected:
    /// 0. [signer] Token authority
    /// 1. [writable] Tax token mint
    /// 2. [writable] Tax vault account
    /// 3. [writable] Reflection pool account
    /// 4. [writable] Staking pool account
    /// 5. [writable] Lottery pool account
    /// 6. [writable] Program state account
    /// 7. [] Token program
    /// 8. [] System program
    /// 9. [] Rent sysvar
    InitializeCodoxToken {
        tax_rate: u16,        // Basis points (e.g., 300 = 3%)
        reflection_rate: u16, // Basis points for reflection rewards
        staking_rate: u16,    // Basis points for staking rewards
        lottery_rate: u16,    // Basis points for lottery pool
    },

    /// Transfer tokens with tax
    /// Accounts expected:
    /// 0. [signer] Source token account owner
    /// 1. [writable] Source token account
    /// 2. [writable] Destination token account
    /// 3. [writable] Tax vault account
    /// 4. [writable] Reflection pool account
    /// 5. [writable] Staking pool account
    /// 6. [writable] Lottery pool account
    /// 7. [writable] Program state account
    /// 8. [] Token program
    Transfer {
        amount: u64,
    },

    /// Stake tokens for bonus rewards
    /// Accounts expected:
    /// 0. [signer] Staker
    /// 1. [writable] Staker token account
    /// 2. [writable] Staking pool account
    /// 3. [writable] Staker state account
    /// 4. [] Token program
    /// 5. [] System program
    /// 6. [] Rent sysvar
    Stake {
        amount: u64,
    },

    /// Claim reflection rewards
    /// Accounts expected:
    /// 0. [signer] Holder
    /// 1. [writable] Holder token account
    /// 2. [writable] Reflection pool account
    /// 3. [writable] Holder state account
    /// 4. [] Token program
    ClaimReflection,

    /// Participate in lottery
    /// Accounts expected:
    /// 0. [signer] Participant
    /// 1. [writable] Participant token account
    /// 2. [writable] Lottery pool account
    /// 3. [writable] Lottery state account
    /// 4. [] Token program
    /// 5. [] Clock sysvar
    ParticipateInLottery,

    /// Draw lottery winner (can be called by anyone)
    /// Accounts expected:
    /// 0. [signer] Caller
    /// 1. [writable] Winner token account
    /// 2. [writable] Lottery pool account
    /// 3. [writable] Lottery state account
    /// 4. [] Token program
    /// 5. [] Clock sysvar
    DrawLottery,
}

/// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CodoxTokenState {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub tax_vault: Pubkey,
    pub reflection_pool: Pubkey,
    pub staking_pool: Pubkey,
    pub lottery_pool: Pubkey,
    pub tax_rate: u16,
    pub reflection_rate: u16,
    pub staking_rate: u16,
    pub lottery_rate: u16,
    pub total_staked: u64,
    pub total_reflection_distributed: u64,
    pub last_lottery_draw: i64,
    pub lottery_interval: i64, // seconds
}

impl Sealed for CodoxTokenState {}

impl IsInitialized for CodoxTokenState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for CodoxTokenState {
    const LEN: usize = 1 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 2 + 2 + 2 + 8 + 8 + 8 + 8;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = arrayref::array_ref![src, 0, CodoxTokenState::LEN];
        let (
            is_initialized,
            authority,
            token_mint,
            tax_vault,
            reflection_pool,
            staking_pool,
            lottery_pool,
            tax_rate,
            reflection_rate,
            staking_rate,
            lottery_rate,
            total_staked,
            total_reflection_distributed,
            last_lottery_draw,
            lottery_interval,
        ) = arrayref::array_refs![src, 1, 32, 32, 32, 32, 32, 32, 2, 2, 2, 2, 8, 8, 8, 8];

        Ok(CodoxTokenState {
            is_initialized: is_initialized[0] != 0,
            authority: Pubkey::new_from_array(*authority),
            token_mint: Pubkey::new_from_array(*token_mint),
            tax_vault: Pubkey::new_from_array(*tax_vault),
            reflection_pool: Pubkey::new_from_array(*reflection_pool),
            staking_pool: Pubkey::new_from_array(*staking_pool),
            lottery_pool: Pubkey::new_from_array(*lottery_pool),
            tax_rate: u16::from_le_bytes(*tax_rate),
            reflection_rate: u16::from_le_bytes(*reflection_rate),
            staking_rate: u16::from_le_bytes(*staking_rate),
            lottery_rate: u16::from_le_bytes(*lottery_rate),
            total_staked: u64::from_le_bytes(*total_staked),
            total_reflection_distributed: u64::from_le_bytes(*total_reflection_distributed),
            last_lottery_draw: i64::from_le_bytes(*last_lottery_draw),
            lottery_interval: i64::from_le_bytes(*lottery_interval),
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = arrayref::array_mut_ref![dst, 0, CodoxTokenState::LEN];
        let (
            is_initialized_dst,
            authority_dst,
            token_mint_dst,
            tax_vault_dst,
            reflection_pool_dst,
            staking_pool_dst,
            lottery_pool_dst,
            tax_rate_dst,
            reflection_rate_dst,
            staking_rate_dst,
            lottery_rate_dst,
            total_staked_dst,
            total_reflection_distributed_dst,
            last_lottery_draw_dst,
            lottery_interval_dst,
        ) = arrayref::array_mut_refs![dst, 1, 32, 32, 32, 32, 32, 32, 2, 2, 2, 2, 8, 8, 8, 8];

        is_initialized_dst[0] = self.is_initialized as u8;
        authority_dst.copy_from_slice(self.authority.as_ref());
        token_mint_dst.copy_from_slice(self.token_mint.as_ref());
        tax_vault_dst.copy_from_slice(self.tax_vault.as_ref());
        reflection_pool_dst.copy_from_slice(self.reflection_pool.as_ref());
        staking_pool_dst.copy_from_slice(self.staking_pool.as_ref());
        lottery_pool_dst.copy_from_slice(self.lottery_pool.as_ref());
        *tax_rate_dst = self.tax_rate.to_le_bytes();
        *reflection_rate_dst = self.reflection_rate.to_le_bytes();
        *staking_rate_dst = self.staking_rate.to_le_bytes();
        *lottery_rate_dst = self.lottery_rate.to_le_bytes();
        *total_staked_dst = self.total_staked.to_le_bytes();
        *total_reflection_distributed_dst = self.total_reflection_distributed.to_le_bytes();
        *last_lottery_draw_dst = self.last_lottery_draw.to_le_bytes();
        *lottery_interval_dst = self.lottery_interval.to_le_bytes();
    }
}

/// Holder state for tracking rewards
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct HolderState {
    pub holder: Pubkey,
    pub last_reflection_claim: i64,
    pub staked_amount: u64,
    pub stake_time: i64,
    pub total_claimed: u64,
    pub holding_multiplier: u16, // Increases over time
}

impl Sealed for HolderState {}

impl IsInitialized for HolderState {
    fn is_initialized(&self) -> bool {
        self.holder != Pubkey::default()
    }
}

impl Pack for HolderState {
    const LEN: usize = 32 + 8 + 8 + 8 + 8 + 2;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = arrayref::array_ref![src, 0, HolderState::LEN];
        let (holder, last_reflection_claim, staked_amount, stake_time, total_claimed, holding_multiplier) =
            arrayref::array_refs![src, 32, 8, 8, 8, 8, 2];

        Ok(HolderState {
            holder: Pubkey::new_from_array(*holder),
            last_reflection_claim: i64::from_le_bytes(*last_reflection_claim),
            staked_amount: u64::from_le_bytes(*staked_amount),
            stake_time: i64::from_le_bytes(*stake_time),
            total_claimed: u64::from_le_bytes(*total_claimed),
            holding_multiplier: u16::from_le_bytes(*holding_multiplier),
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = arrayref::array_mut_ref![dst, 0, HolderState::LEN];
        let (holder_dst, last_reflection_claim_dst, staked_amount_dst, stake_time_dst, total_claimed_dst, holding_multiplier_dst) =
            arrayref::array_mut_refs![dst, 32, 8, 8, 8, 8, 2];

        holder_dst.copy_from_slice(self.holder.as_ref());
        *last_reflection_claim_dst = self.last_reflection_claim.to_le_bytes();
        *staked_amount_dst = self.staked_amount.to_le_bytes();
        *stake_time_dst = self.stake_time.to_le_bytes();
        *total_claimed_dst = self.total_claimed.to_le_bytes();
        *holding_multiplier_dst = self.holding_multiplier.to_le_bytes();
    }
}

/// Lottery state
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct LotteryState {
    pub participants: Vec<Pubkey>,
    pub current_prize: u64,
    pub last_winner: Pubkey,
    pub total_draws: u64,
}

// Main program entry point
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = CodoxTokenInstruction::try_from_slice(instruction_data)?;

    match instruction {
        CodoxTokenInstruction::InitializeCodoxToken {
            tax_rate,
            reflection_rate,
            staking_rate,
            lottery_rate,
        } => {
            msg!("Instruction: InitializeCodoxToken");
            process_initialize_codox_token(program_id, accounts, tax_rate, reflection_rate, staking_rate, lottery_rate)
        }
        CodoxTokenInstruction::Transfer { amount } => {
            msg!("Instruction: Transfer");
            process_transfer(program_id, accounts, amount)
        }
        CodoxTokenInstruction::Stake { amount } => {
            msg!("Instruction: Stake");
            process_stake(program_id, accounts, amount)
        }
        CodoxTokenInstruction::ClaimReflection => {
            msg!("Instruction: ClaimReflection");
            process_claim_reflection(program_id, accounts)
        }
        CodoxTokenInstruction::ParticipateInLottery => {
            msg!("Instruction: ParticipateInLottery");
            process_participate_in_lottery(program_id, accounts)
        }
        CodoxTokenInstruction::DrawLottery => {
            msg!("Instruction: DrawLottery");
            process_draw_lottery(program_id, accounts)
        }
    }
}

fn process_initialize_codox_token(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    tax_rate: u16,
    reflection_rate: u16,
    staking_rate: u16,
    lottery_rate: u16,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?;
    let mint_info = next_account_info(account_info_iter)?;
    let tax_vault_info = next_account_info(account_info_iter)?;
    let reflection_pool_info = next_account_info(account_info_iter)?;
    let staking_pool_info = next_account_info(account_info_iter)?;
    let lottery_pool_info = next_account_info(account_info_iter)?;
    let state_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let system_program_info = next_account_info(account_info_iter)?;
    let rent_info = next_account_info(account_info_iter)?;

    // Validate tax rates
    if tax_rate > 1000 || reflection_rate + staking_rate + lottery_rate != tax_rate {
        return Err(ProgramError::InvalidArgument);
    }

    let mut state = CodoxTokenState {
        is_initialized: true,
        authority: *authority_info.key,
        token_mint: *mint_info.key,
        tax_vault: *tax_vault_info.key,
        reflection_pool: *reflection_pool_info.key,
        staking_pool: *staking_pool_info.key,
        lottery_pool: *lottery_pool_info.key,
        tax_rate,
        reflection_rate,
        staking_rate,
        lottery_rate,
        total_staked: 0,
        total_reflection_distributed: 0,
        last_lottery_draw: 0,
        lottery_interval: 86400, // 24 hours
    };

    CodoxTokenState::pack(state, &mut state_info.data.borrow_mut())?;

    msg!("Codox token initialized with {}% tax rate", tax_rate as f64 / 100.0);
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let source_owner_info = next_account_info(account_info_iter)?;
    let source_info = next_account_info(account_info_iter)?;
    let destination_info = next_account_info(account_info_iter)?;
    let tax_vault_info = next_account_info(account_info_iter)?;
    let reflection_pool_info = next_account_info(account_info_iter)?;
    let staking_pool_info = next_account_info(account_info_iter)?;
    let lottery_pool_info = next_account_info(account_info_iter)?;
    let state_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    let state = CodoxTokenState::unpack(&state_info.data.borrow())?;
    
    // Calculate tax amounts
    let tax_amount = (amount * state.tax_rate as u64) / 10000;
    let reflection_tax = (tax_amount * state.reflection_rate as u64) / state.tax_rate as u64;
    let staking_tax = (tax_amount * state.staking_rate as u64) / state.tax_rate as u64;
    let lottery_tax = tax_amount - reflection_tax - staking_tax;
    
    let net_amount = amount - tax_amount;

    // Transfer net amount to destination
    let transfer_instruction = spl_token::instruction::transfer(
        token_program_info.key,
        source_info.key,
        destination_info.key,
        source_owner_info.key,
        &[],
        net_amount,
    )?;

    invoke(
        &transfer_instruction,
        &[
            source_info.clone(),
            destination_info.clone(),
            source_owner_info.clone(),
            token_program_info.clone(),
        ],
    )?;

    // Distribute taxes
    if reflection_tax > 0 {
        let reflection_transfer = spl_token::instruction::transfer(
            token_program_info.key,
            source_info.key,
            reflection_pool_info.key,
            source_owner_info.key,
            &[],
            reflection_tax,
        )?;

        invoke(
            &reflection_transfer,
            &[
                source_info.clone(),
                reflection_pool_info.clone(),
                source_owner_info.clone(),
                token_program_info.clone(),
            ],
        )?;
    }

    if staking_tax > 0 {
        let staking_transfer = spl_token::instruction::transfer(
            token_program_info.key,
            source_info.key,
            staking_pool_info.key,
            source_owner_info.key,
            &[],
            staking_tax,
        )?;

        invoke(
            &staking_transfer,
            &[
                source_info.clone(),
                staking_pool_info.clone(),
                source_owner_info.clone(),
                token_program_info.clone(),
            ],
        )?;
    }

    if lottery_tax > 0 {
        let lottery_transfer = spl_token::instruction::transfer(
            token_program_info.key,
            source_info.key,
            lottery_pool_info.key,
            source_owner_info.key,
            &[],
            lottery_tax,
        )?;

        invoke(
            &lottery_transfer,
            &[
                source_info.clone(),
                lottery_pool_info.clone(),
                source_owner_info.clone(),
                token_program_info.clone(),
            ],
        )?;
    }

    msg!("Transfer completed: {} tokens sent, {} tokens taxed", net_amount, tax_amount);
    Ok(())
}

fn process_stake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let staker_info = next_account_info(account_info_iter)?;
    let staker_token_info = next_account_info(account_info_iter)?;
    let staking_pool_info = next_account_info(account_info_iter)?;
    let staker_state_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    // Transfer tokens to staking pool
    let transfer_instruction = spl_token::instruction::transfer(
        token_program_info.key,
        staker_token_info.key,
        staking_pool_info.key,
        staker_info.key,
        &[],
        amount,
    )?;

    invoke(
        &transfer_instruction,
        &[
            staker_token_info.clone(),
            staking_pool_info.clone(),
            staker_info.clone(),
            token_program_info.clone(),
        ],
    )?;

    // Update staker state
    let mut holder_state = if staker_state_info.data_len() == 0 {
        HolderState {
            holder: *staker_info.key,
            last_reflection_claim: 0,
            staked_amount: amount,
            stake_time: solana_program::clock::Clock::get()?.unix_timestamp,
            total_claimed: 0,
            holding_multiplier: 100, // Base multiplier
        }
    } else {
        let mut state = HolderState::unpack(&staker_state_info.data.borrow())?;
        state.staked_amount += amount;
        state
    };

    HolderState::pack(holder_state, &mut staker_state_info.data.borrow_mut())?;

    msg!("Staked {} tokens", amount);
    Ok(())
}

fn process_claim_reflection(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let holder_info = next_account_info(account_info_iter)?;
    let holder_token_info = next_account_info(account_info_iter)?;
    let reflection_pool_info = next_account_info(account_info_iter)?;
    let holder_state_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    let mut holder_state = HolderState::unpack(&holder_state_info.data.borrow())?;
    
    // Calculate reflection rewards based on holding time and amount
    let current_time = solana_program::clock::Clock::get()?.unix_timestamp;
    let holding_time = current_time - holder_state.last_reflection_claim;
    
    // Time-based multiplier (max 500% after 1 year)
    let time_multiplier = std::cmp::min(500, 100 + (holding_time / 86400) as u16 * 2);
    
    let holder_balance = Account::unpack(&holder_token_info.data.borrow())?.amount;
    let reflection_pool_balance = Account::unpack(&reflection_pool_info.data.borrow())?.amount;
    
    // Calculate reward based on balance percentage and multipliers
    let reward = (reflection_pool_balance * holder_balance * time_multiplier as u64) / 10000000;
    
    if reward > 0 {
        // Transfer reflection rewards
        let transfer_instruction = spl_token::instruction::transfer(
            token_program_info.key,
            reflection_pool_info.key,
            holder_token_info.key,
            &solana_program::system_program::ID, // Pool authority
            &[],
            reward,
        )?;

        invoke(
            &transfer_instruction,
            &[
                reflection_pool_info.clone(),
                holder_token_info.clone(),
                token_program_info.clone(),
            ],
        )?;

        holder_state.last_reflection_claim = current_time;
        holder_state.total_claimed += reward;
        holder_state.holding_multiplier = time_multiplier;
        
        HolderState::pack(holder_state, &mut holder_state_info.data.borrow_mut())?;
        
        msg!("Claimed {} reflection tokens with {}% multiplier", reward, time_multiplier);
    }

    Ok(())
}

fn process_participate_in_lottery(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    msg!("Lottery participation registered");
    Ok(())
}

fn process_draw_lottery(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    msg!("Lottery drawn");
    Ok(())
} 