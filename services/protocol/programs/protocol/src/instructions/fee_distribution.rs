use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Transfer};
use crate::{
    errors::ErrorCode,
    state::fee_vault::FeeVault
};

/// Initialize the FeeVault with references to protocol/creator vaults
pub fn handle_init_fee_vault(ctx: Context<InitFeeVault>) -> Result<()> {
    let vault = &mut ctx.accounts.fee_vault;
    vault.protocol_sol_vault = ctx.accounts.protocol_sol_vault.key();
    vault.creator_token_vault = ctx.accounts.creator_token_vault.key();
    vault.protocol_pubkey = ctx.accounts.protocol_pubkey;
    vault.creator_pubkey = ctx.accounts.creator_pubkey;
    vault.lp_token_vault = ctx.accounts.lp_token_vault.key();

    Ok(())
}

/// Allows the protocol to withdraw SOL fees from their vault
pub fn handle_withdraw_protocol_sol(
    ctx: Context<WithdrawProtocolSol>,
    amount: u64
) -> Result<()> {
    let fee_vault = &ctx.accounts.fee_vault;
    require_keys_eq!(fee_vault.protocol_pubkey, ctx.accounts.protocol_signer.key(), 
        ErrorCode::Unauthorized);

    let from_info = &ctx.accounts.protocol_sol_vault;
    let to_info = &ctx.accounts.recipient_account;

    let from_balance = **from_info.lamports.borrow();
    require!(from_balance >= amount, ErrorCode::InsufficientBalance);

    **from_info.lamports.borrow_mut() -= amount;
    **to_info.lamports.borrow_mut() += amount;

    msg!("Withdrew {} lamports to recipient", amount);
    Ok(())
}

/// Allows the creator to withdraw the token-side fees
pub fn handle_withdraw_creator_tokens(
    ctx: Context<WithdrawCreatorTokens>,
    amount: u64
) -> Result<()> {
    let fee_vault = &ctx.accounts.fee_vault;
    require_keys_eq!(fee_vault.creator_pubkey, ctx.accounts.creator_signer.key(),
        ErrorCode::Unauthorized);

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.creator_token_vault.clone(),
            to: ctx.accounts.recipient_token_account.clone(),
            authority: ctx.accounts.creator_signer.clone(),
        },
    );
    anchor_spl::token::transfer(cpi_ctx, amount)?;

    msg!("Withdrew {} tokens to recipient token account", amount);
    Ok(())
}


// -------------- Context structs --------------

#[derive(Accounts)]
pub struct InitFeeVault<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + (5 * 32)
    )]
    pub fee_vault: Account<'info, FeeVault>,

    #[account(mut)]
    pub protocol_sol_vault: AccountInfo<'info>,
    #[account(mut)]
    pub creator_token_vault: AccountInfo<'info>,

    pub protocol_pubkey: Pubkey,
    pub creator_pubkey: Pubkey,

    #[account(mut)]
    pub lp_token_vault: AccountInfo<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawProtocolSol<'info> {
    #[account(mut)]
    pub fee_vault: Account<'info, FeeVault>,

    #[account(mut)]
    pub protocol_sol_vault: AccountInfo<'info>,

    #[account(signer)]
    pub protocol_signer: AccountInfo<'info>,

    #[account(mut)]
    pub recipient_account: AccountInfo<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawCreatorTokens<'info> {
    #[account(mut)]
    pub fee_vault: Account<'info, FeeVault>,

    #[account(mut)]
    pub creator_token_vault: AccountInfo<'info>,

    #[account(signer)]
    pub creator_signer: AccountInfo<'info>,

    #[account(mut)]
    pub recipient_token_account: AccountInfo<'info>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
}
