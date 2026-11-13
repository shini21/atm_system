package com.bank.atm.enums;

/**
 * The kinds of completed action that can appear in an account's transaction history.
 */
public enum TransactionType {
    /** Money added to an account. */
    DEPOSIT,
    /** Money removed from an account at the ATM. */
    WITHDRAWAL,
    /** Money received from another account (recorded on the receiver). */
    TRANSFER_IN,
    /** Money sent to another account (recorded on the sender). */
    TRANSFER_OUT,
    /** The card PIN was changed; no money moves, so the amount is zero. */
    PIN_CHANGE
}
