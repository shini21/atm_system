package com.bank.atm.interfaces;

/**
 * Contract for domain objects that can print a short, human-readable summary
 * of themselves to the console (for example, an account, a card, or a transaction).
 */
public interface Printable {

    /**
     * Prints a concise summary of this object to standard output.
     */
    void printSummary();
}
