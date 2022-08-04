use anchor_lang::error_code;

#[error_code]
pub enum WeddingError {
    #[msg("signer is not wedding member")]
    NotWeddingMember,
    #[msg("cannot cancel after created status")]
    CannotCancel,
    #[msg("partner data not empty")]
    PartnerDataNotEmpty,
    #[msg("partner lamports not zero")]
    PartnerBalanceNotZero,
    #[msg("partner not owned by crypto-wedding program")]
    PartnerNotOwned,
    #[msg("partner cannot be closed while wedding is initialized")]
    WeddingInitialized,
    #[msg("wedding not initialized")]
    WeddingNotInitialized,
    #[msg("partner wedding does not match account wedding")]
    PartnerWeddingNotWedding,
    #[msg("cannot answer during invalid status")]
    InvalidAnswerStatus,
    #[msg("cannot divorce during invalid status")]
    InvalidDivorceStatus,
    #[msg("creator does not match wedding storage")]
    InvalidCreator,
}
