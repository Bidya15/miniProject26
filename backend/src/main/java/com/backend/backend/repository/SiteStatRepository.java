package com.backend.backend.repository;

import com.backend.backend.model.SiteStat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SiteStatRepository extends JpaRepository<SiteStat, Long> {
    List<SiteStat> findAllByOrderBySortOrderAsc();
}
