use crate::util::sort_pubkeys;
use anchor_lang::prelude::*;

#[account]
pub struct Wedding {
    pub creator: Pubkey,
    pub partner0: Pubkey, // pubkey is to PDA, not a user account
    pub partner1: Pubkey, // pubkey is to PDA , not a user account
    pub status: Status,
}

impl Wedding {
    pub fn space() -> usize {
        // discriminator + 3 * pubkey + enum
        8 + (32 * 3) + 2
    }

    pub fn seed_partner0<'a>(pubkey_a: &'a Pubkey, pubkey_b: &'a Pubkey) -> &'a Pubkey {
        let (pubkey0, _) = sort_pubkeys(pubkey_a, pubkey_b);

        pubkey0
    }

    pub fn seed_partner1<'a>(pubkey_a: &'a Pubkey, pubkey_b: &'a Pubkey) -> &'a Pubkey {
        let (_, pubkey1) = sort_pubkeys(pubkey_a, pubkey_b);

        pubkey1
    }

    pub fn initialize(
        &mut self,
        creator: &Pubkey,
        partner0: &Pubkey,
        partner1: &Pubkey,
    ) -> Result<()> {
        self.status = Status::Created;
        self.creator = *creator;
        self.partner0 = *partner0;
        self.partner1 = *partner1;

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum Status {
    Created,
    Marrying,
    Married,
    Divorcing,
    Divorced,
}

#[account]
pub struct Partner {
    pub wedding: Pubkey,
    pub user: Pubkey,
    pub name: String,
    pub vows: String,
    pub answer: bool,
}

impl Partner {
    pub fn space(name: &str, vows: &str) -> usize {
        // discriminator + 2 * pubkey + nameLen + name + vowsLen + vows + bool
        8 + (32 * 2) + 4 + name.len() + 4 + vows.len() + 1
    }
}
