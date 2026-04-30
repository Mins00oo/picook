package com.picook.domain.ingredient.repository;

import com.picook.domain.ingredient.entity.UnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitConversionRepository extends JpaRepository<UnitConversion, Integer> {
}
