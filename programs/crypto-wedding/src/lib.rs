use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod util;

pub use errors::*;
pub use instructions::*;
pub use state::*;
pub use util::*;

declare_id!("sRT1XWM1ZoPVaBzsvjmCUfjGxBGbNAWGdRc8V15t7aQ");

#[program]
pub mod crypto_wedding {
    use super::*;

    /// creates a new wedding. checks for previous partner weddings are done in SetupWedding
    pub fn setup_wedding(ctx: Context<SetupWedding>) -> Result<()> {
        instructions::setup_wedding(ctx)
    }

    /// Cancels Wedding that is in Status::Created. Can be cancelled by any of: partner0, partner1,
    /// or creator accounts. Storage costs are refunded to the creator user account, which originally paid for
    /// storage costs.
    pub fn cancel_wedding(ctx: Context<CancelWedding>) -> Result<()> {
        instructions::cancel_wedding(ctx)
    }

    /// Closes Partner PDA storage. Can only be called if the associated Wedding PDA storage no
    /// longer exists AND the Partner PDA storage STILL exists.
    pub fn close_partner(ctx: Context<ClosePartner>) -> Result<()> {
        instructions::close_partner(ctx)
    }

    /// Sets up Partner PDA storage. Sets everything on ther than their answer which is called
    /// after both partners have setup a Partner PDA.
    pub fn setup_partner(ctx: Context<SetupPartner>, name: String, vows: String) -> Result<()> {
        instructions::setup_partner(ctx, name, vows)
    }

    /// Updates name and vows on an already setup Partner PDA.
    pub fn update_partner(ctx: Context<UpdatePartner>, name: String, vows: String) -> Result<()> {
        instructions::update_partner(ctx, name, vows)
    }

    /// Updates name on an already setup Partner PDA.
    pub fn update_name(ctx: Context<UpdateName>, name: String) -> Result<()> {
        instructions::update_name(ctx, name)
    }

    /// Updates vows on an already setup Partner PDA.
    pub fn update_vows(ctx: Context<UpdateVows>, vows: String) -> Result<()> {
        instructions::update_vows(ctx, vows)
    }

    pub fn give_answer(ctx: Context<GiveAnswer>, answer: bool) -> Result<()> {
        instructions::give_answer(ctx, answer)
    }

    pub fn divorce(ctx: Context<Divorce>) -> Result<()> {
        instructions::divorce(ctx)
    }

    pub fn setup_ring(ctx: Context<SetupRing>) -> Result<()> {
        instructions::setup_ring(ctx)
    }
}
