package com.bank.atm.model;

import com.bank.atm.interfaces.Printable;

/**
 * Stores the identity information of a bank customer.
 *
 * <p>The class is immutable: all fields are private and final, and the only way to
 * set them is through the constructor. It deliberately holds no sensitive data
 * beyond what the simulation needs.
 */
public class Customer implements Printable {

    private final String customerId;
    private final String fullName;
    private final String phoneNumber;
    private final String email;

    /**
     * Creates a customer.
     *
     * @param customerId  unique customer identifier, such as {@code CUST001}
     * @param fullName    the customer's full name
     * @param phoneNumber contact phone number
     * @param email       contact email address
     * @throws IllegalArgumentException if any argument is null or blank
     */
    public Customer(String customerId, String fullName, String phoneNumber, String email) {
        this.customerId = requireText(customerId, "Customer ID");
        this.fullName = requireText(fullName, "Full name");
        this.phoneNumber = requireText(phoneNumber, "Phone number");
        this.email = requireText(email, "Email");
    }

    /**
     * Rejects null or blank values so a customer can never be half-initialised.
     */
    private static String requireText(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " must not be empty.");
        }
        return value.trim();
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    /**
     * Prints the customer's details to the console.
     */
    @Override
    public void printSummary() {
        System.out.println("Customer ID : " + customerId);
        System.out.println("Name        : " + fullName);
        System.out.println("Phone       : " + phoneNumber);
        System.out.println("Email       : " + email);
    }

    @Override
    public String toString() {
        return customerId + " - " + fullName;
    }
}
