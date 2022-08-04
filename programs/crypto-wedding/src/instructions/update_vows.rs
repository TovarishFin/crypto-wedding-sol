use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;

pub fn update_vows(ctx: Context<UpdateVows>, vows: String) -> Result<()> {
    ctx.accounts.partner.vows = vows;

    Ok(())
}

#[derive(Accounts)]
#[instruction(vows: String)]
pub struct UpdateVows<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: this is only used to compute wedding PDA
    pub other: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [
            b"partner",
            user.key().as_ref(),
        ],
        bump,
        has_one = wedding @ WeddingError::PartnerWeddingNotWedding,
        realloc = Partner::space(&partner.name, &vows),
        realloc::payer = user,
        realloc::zero = false,
    )]
    pub partner: Account<'info, Partner>,
    #[account(
        seeds = [
            b"wedding",
            Wedding::seed_partner0(user.key, other.key).key().as_ref(),
            Wedding::seed_partner1(user.key, other.key).key().as_ref(),
        ],
        bump,
    )]
    /// CHECK: this is only used to ensure existance
    pub wedding: Account<'info, Wedding>,
    pub system_program: Program<'info, System>,
}
