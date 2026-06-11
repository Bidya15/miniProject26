package com.backend.backend.controller;

import com.backend.backend.model.*;
import com.backend.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/cms")
@RequiredArgsConstructor
public class CmsController {

    private final GalleryImageRepository galleryImageRepository;
    private final NewsItemRepository newsItemRepository;
    private final NotableAlumniRepository notableAlumniRepository;
    private final GivingInitiativeRepository givingInitiativeRepository;
    private final AlumniServiceItemRepository alumniServiceItemRepository;
    private final FaqRepository faqRepository;
    private final SocialLinkRepository socialLinkRepository;
    private final FooterConfigRepository footerConfigRepository;
    private final SiteStatRepository siteStatRepository;
    private final UserRepository userRepository;
    private final HomeConfigRepository homeConfigRepository;
    private final MessageDeskItemRepository messageDeskItemRepository;

    @GetMapping("/gallery")
    public ResponseEntity<List<GalleryImage>> getGallery() {
        return ResponseEntity.ok(galleryImageRepository.findAll());
    }

    @PostMapping("/gallery")
    public ResponseEntity<GalleryImage> addGalleryImage(@RequestBody GalleryImage item) {
        return ResponseEntity.ok(galleryImageRepository.save(item));
    }

    @DeleteMapping("/gallery/{id}")
    public ResponseEntity<Void> deleteGalleryImage(@PathVariable Long id) {
        galleryImageRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/news")
    public ResponseEntity<List<NewsItem>> getNews() {
        return ResponseEntity.ok(newsItemRepository.findAll());
    }

    @PostMapping("/news")
    public ResponseEntity<NewsItem> addNewsItem(@RequestBody NewsItem item) {
        item.setId(null); // ensure DB assigns the ID
        return ResponseEntity.ok(newsItemRepository.save(item));
    }

    @PutMapping("/news/{id}")
    public ResponseEntity<NewsItem> updateNewsItem(@PathVariable Long id, @RequestBody NewsItem item) {
        item.setId(id);
        return ResponseEntity.ok(newsItemRepository.save(item));
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notable-alumni")
    public ResponseEntity<List<NotableAlumni>> getNotableAlumni() {
        return ResponseEntity.ok(notableAlumniRepository.findAll());
    }

    @PostMapping("/notable-alumni")
    public ResponseEntity<NotableAlumni> addNotableAlumni(@RequestBody NotableAlumni item) {
        item.setId(null); // ensure DB assigns the ID
        return ResponseEntity.ok(notableAlumniRepository.save(item));
    }

    @PutMapping("/notable-alumni/{id}")
    public ResponseEntity<NotableAlumni> updateNotableAlumni(@PathVariable Long id, @RequestBody NotableAlumni item) {
        item.setId(id);
        return ResponseEntity.ok(notableAlumniRepository.save(item));
    }

    @DeleteMapping("/notable-alumni/{id}")
    public ResponseEntity<Void> deleteNotable(@PathVariable Long id) {
        notableAlumniRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/giving-initiatives")
    public ResponseEntity<List<GivingInitiative>> getGiving() {
        return ResponseEntity.ok(givingInitiativeRepository.findAll());
    }

    @PostMapping("/giving-initiatives")
    public ResponseEntity<GivingInitiative> addGiving(@RequestBody GivingInitiative item) {
        return ResponseEntity.ok(givingInitiativeRepository.save(item));
    }

    @DeleteMapping("/giving-initiatives/{id}")
    public ResponseEntity<Void> deleteGiving(@PathVariable Long id) {
        givingInitiativeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/alumni-services")
    public ResponseEntity<List<AlumniServiceItem>> getServices() {
        return ResponseEntity.ok(alumniServiceItemRepository.findAll());
    }

    @PostMapping("/alumni-services")
    public ResponseEntity<AlumniServiceItem> addService(@RequestBody AlumniServiceItem item) {
        return ResponseEntity.ok(alumniServiceItemRepository.save(item));
    }

    @DeleteMapping("/alumni-services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        alumniServiceItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── FAQ Management ──
    @GetMapping("/faqs")
    public ResponseEntity<List<FaqItem>> getFaqs() {
        return ResponseEntity.ok(faqRepository.findAll());
    }

    @PostMapping("/faqs")
    public ResponseEntity<FaqItem> saveFaq(@RequestBody FaqItem item) {
        return ResponseEntity.ok(faqRepository.save(item));
    }

    @DeleteMapping("/faqs/{id}")
    public ResponseEntity<Void> deleteFaq(@PathVariable Long id) {
        faqRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── Social Links ──
    @GetMapping("/social-links")
    public ResponseEntity<List<SocialLink>> getSocialLinks() {
        return ResponseEntity.ok(socialLinkRepository.findAll());
    }

    @PostMapping("/social-links")
    public ResponseEntity<SocialLink> saveSocialLink(@RequestBody SocialLink item) {
        return ResponseEntity.ok(socialLinkRepository.save(item));
    }

    @DeleteMapping("/social-links/{id}")
    public ResponseEntity<Void> deleteSocialLink(@PathVariable Long id) {
        socialLinkRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── Footer Config ──
    @GetMapping("/footer-config")
    public ResponseEntity<FooterConfig> getFooterConfig() {
        List<FooterConfig> configs = footerConfigRepository.findAll();
        if (configs.isEmpty()) {
            return ResponseEntity.ok(FooterConfig.builder()
                    .email("alumni@college.edu")
                    .phone("+91 98765 43210")
                    .address("CSE Department, Assam Engineering College, Jalukbari, Guwahati, Assam 781013")
                    .officeHours("Mon–Fri, 9 AM – 5 PM")
                    .mapUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.082504627443!2d91.6617585!3d26.1421292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a4583182f6d97%3A0x851177d2f3e0b8c6!2sComputer%20Science%20and%20Engineering%20Department%2C%20Assam%20Engineering%20College!5e0!3m2!1sen!2sin!4v1709121743000!5m2!1sen!2sin")
                    .appName("AEC Alumni Portal")
                    .appLogo("/aec_logo_v1.png")
                    .build());
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PostMapping("/footer-config")
    public ResponseEntity<FooterConfig> updateFooterConfig(@RequestBody FooterConfig newConfig) {
        List<FooterConfig> configs = footerConfigRepository.findAll();
        if (!configs.isEmpty()) {
            newConfig.setId(configs.get(0).getId());
        }
        return ResponseEntity.ok(footerConfigRepository.save(newConfig));
    }

    // ── Site Stats ──
    @GetMapping("/stats")
    public ResponseEntity<List<SiteStat>> getStats() {
        return ResponseEntity.ok(siteStatRepository.findAllByOrderBySortOrderAsc());
    }

    @PostMapping("/stats")
    public ResponseEntity<SiteStat> addStat(@RequestBody SiteStat item) {
        return ResponseEntity.ok(siteStatRepository.save(item));
    }

    @PutMapping("/stats/{id}")
    public ResponseEntity<SiteStat> updateStat(@PathVariable Long id, @RequestBody SiteStat item) {
        item.setId(id);
        return ResponseEntity.ok(siteStatRepository.save(item));
    }

    @DeleteMapping("/stats/{id}")
    public ResponseEntity<Void> deleteStat(@PathVariable Long id) {
        siteStatRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/dynamic")
    public ResponseEntity<List<SiteStat>> getDynamicStats() {
        long alumniCount = userRepository.countByRoleAndStatus(User.Role.ROLE_ALUMNI, User.Status.APPROVED);
        long companyCount = userRepository.countDistinctCompaniesByStatus(User.Status.APPROVED);
        long locationCount = userRepository.countDistinctLocationsByStatus(User.Status.APPROVED);

        List<SiteStat> dynamicStats = new ArrayList<>();

        dynamicStats.add(new SiteStat(null, "Alumni Network", formatStat(alumniCount), 1));
        dynamicStats.add(new SiteStat(null, "Partner Companies", formatStat(companyCount), 2));
        dynamicStats.add(new SiteStat(null, "Countries Reached", formatStat(locationCount), 3));
        dynamicStats.add(new SiteStat(null, "Year Founded", "1955", 4));

        return ResponseEntity.ok(dynamicStats);
    }

    private String formatStat(long count) {
        // Display exact number up to 4 digits, add '+' only after 4 digits (>= 10,000)
        if (count > 9999) {
            return count + "+";
        }
        return String.valueOf(count);
    }

    // ── Home Config ──
    @GetMapping("/home-config")
    public ResponseEntity<HomeConfig> getHomeConfig() {
        List<HomeConfig> configs = homeConfigRepository.findAll();
        if (configs.isEmpty()) {
            return ResponseEntity.ok(HomeConfig.builder()
                    .badge("🎓 College Alumni Network")
                    .titleMain("Connect. Grow.")
                    .titleGradient("Give Back.")
                    .subtext(
                            "AecianConnect bridges students with alumni for mentorship, referrals, jobs, and real-world guidance — all on one platform.")
                    .bgImages(List.of(
                            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop"))
                    .build());
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PostMapping("/home-config")
    public ResponseEntity<HomeConfig> updateHomeConfig(@RequestBody HomeConfig newConfig) {
        List<HomeConfig> configs = homeConfigRepository.findAll();
        if (!configs.isEmpty()) {
            newConfig.setId(configs.get(0).getId());
        }
        return ResponseEntity.ok(homeConfigRepository.save(newConfig));
    }

    // ── Message Desk ──
    @GetMapping("/message-desk")
    public ResponseEntity<List<MessageDeskItem>> getMessageDesk() {
        return ResponseEntity.ok(messageDeskItemRepository.findAllByOrderBySortOrderAsc());
    }

    @PostMapping("/message-desk")
    public ResponseEntity<MessageDeskItem> addMessageDeskItem(@RequestBody MessageDeskItem item) {
        return ResponseEntity.ok(messageDeskItemRepository.save(item));
    }

    @PutMapping("/message-desk/{id}")
    public ResponseEntity<MessageDeskItem> updateMessageDeskItem(@PathVariable Long id,
            @RequestBody MessageDeskItem item) {
        item.setId(id);
        return ResponseEntity.ok(messageDeskItemRepository.save(item));
    }

    @DeleteMapping("/message-desk/{id}")
    public ResponseEntity<Void> deleteMessageDeskItem(@PathVariable Long id) {
        messageDeskItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
