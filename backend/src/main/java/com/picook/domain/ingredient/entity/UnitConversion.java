package com.picook.domain.ingredient.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 재료별 단위 환산표 (V25 신설).
 * 예: 다진마늘 1g = 0.067큰술 (15g/큰술 기준).
 */
@Entity
@Table(name = "unit_conversions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"ingredient_id", "from_unit", "to_unit"}))
public class UnitConversion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "from_unit", nullable = false, length = 20)
    private String fromUnit;

    @Column(name = "to_unit", nullable = false, length = 20)
    private String toUnit;

    /** 곱셈 비율. amount_to = amount_from * conversion */
    @Column(nullable = false, precision = 12, scale = 6)
    private BigDecimal conversion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected UnitConversion() {}

    public UnitConversion(Ingredient ingredient, String fromUnit, String toUnit, BigDecimal conversion) {
        this.ingredient = ingredient;
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.conversion = conversion;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public Ingredient getIngredient() { return ingredient; }
    public String getFromUnit() { return fromUnit; }
    public String getToUnit() { return toUnit; }
    public BigDecimal getConversion() { return conversion; }
    public Instant getCreatedAt() { return createdAt; }
}
