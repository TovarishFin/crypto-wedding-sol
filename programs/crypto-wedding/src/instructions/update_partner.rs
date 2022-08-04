use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;

pub fn update_partner(ctx: Context<UpdatePartner>, name: String, vows: String) -> Result<()> {
    ctx.accounts.partner.name = name;
    ctx.accounts.partner.vows = vows;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String, vows: String)]
pub struct UpdatePartner<'info> {
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
        realloc = Partner::space(&name, &vows),
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
    // ensure that Wedding PDA exists before updating
    pub wedding: Account<'info, Wedding>,
    pub system_program: Program<'info, System>,
}
