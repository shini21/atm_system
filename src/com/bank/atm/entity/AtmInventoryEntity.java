package com.bank.atm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "atm_inventory")
public class AtmInventoryEntity {

    @Id
    @Column(name = "denomination", nullable = false)
    private Integer denomination; // 100, 200, or 500

    @Column(name = "note_count", nullable = false)
    private Integer noteCount;

    public AtmInventoryEntity() {
    }

    public AtmInventoryEntity(Integer denomination, Integer noteCount) {
        this.denomination = denomination;
        this.noteCount = noteCount;
    }

    public Integer getDenomination() {
        return denomination;
    }

    public void setDenomination(Integer denomination) {
        this.denomination = denomination;
    }

    public Integer getNoteCount() {
        return noteCount;
    }

    public void setNoteCount(Integer noteCount) {
        this.noteCount = noteCount;
    }
}

