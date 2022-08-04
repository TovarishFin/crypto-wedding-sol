use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve, Token};

pub fn setup_ring(ctx: Context<SetupRing>) -> Result<()> {
    let token_info = ctx.accounts.token.to_account_info();
    let call_accts = Approve {
        to: ctx.accounts.to.to_account_info(),
        delegate: ctx.accounts.cryto_wedding.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let app_ctx = CpiContext::new(token_info, call_accts);
    token::approve(app_ctx, 1)?;
    Ok(())
}

#[derive(Accounts)]
pub struct SetupRing<'info> {
    token: Program<'info, Token>,
    /// CHECK: whatever for now
    to: AccountInfo<'info>,
    /// CHECK: whatever for now
    authority: AccountInfo<'info>,
    /// CHECK: whatever for now
    cryto_wedding: AccountInfo<'info>,
}
