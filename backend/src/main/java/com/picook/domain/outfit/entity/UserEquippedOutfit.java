package com.picook.domain.outfit.entity;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "user_equipped_outfits")
@IdClass(UserEquippedOutfit.PK.class)
public class UserEquippedOutfit {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "slot", nullable = false, length = 16)
    private String slot;

    /** NULL = 해제 */
    @Column(name = "outfit_id")
    private Long outfitId;

    protected UserEquippedOutfit() {}

    public UserEquippedOutfit(UUID userId, String slot, Long outfitId) {
        this.userId = userId;
        this.slot = slot;
        this.outfitId = outfitId;
    }

    public UUID getUserId() { return userId; }
    public String getSlot() { return slot; }
    public Long getOutfitId() { return outfitId; }
    public void setOutfitId(Long outfitId) { this.outfitId = outfitId; }

    public static class PK implements Serializable {
        private UUID userId;
        private String slot;

        public PK() {}

        public PK(UUID userId, String slot) {
            this.userId = userId;
            this.slot = slot;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PK pk)) return false;
            return Objects.equals(userId, pk.userId) && Objects.equals(slot, pk.slot);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, slot);
        }
    }
}
