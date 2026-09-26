import React, { useState } from 'react';
import {
  Code2,
  Database,
  FileCode,
  Copy,
  Check,
  Download,
  FolderTree,
  Terminal,
  Server,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SpringBootCodeView: React.FC = () => {
  const { addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'sql' | 'entities' | 'controllers' | 'security' | 'pom'>('sql');
  const [copied, setCopied] = useState(false);

  const postgresSchema = `-- ===================================================================
-- CANDIDLY - SCHÉMA DE BASE DE DONNÉES POSTGRESQL (M2 MIAGE IPM)
-- ===================================================================

-- 1. Types ENUM
CREATE TYPE app_status AS ENUM (
    'A_CONTACTER',
    'ENVOYEE',
    'EN_ATTENTE',
    'ENTRETIEN',
    'OFFRE_RECUE',
    'ACCEPTEE',
    'REFUSEE',
    'ABANDONNEE'
);

CREATE TYPE contract_type AS ENUM (
    'Stage',
    'Alternance',
    'CDI',
    'CDD',
    'Autre'
);

-- 2. Table Utilisateur
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    city VARCHAR(100),
    education VARCHAR(255),
    specialization VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table Candidature (Application)
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(150) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    contract_type contract_type NOT NULL DEFAULT 'Stage',
    domain VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    application_date DATE NOT NULL,
    status app_status NOT NULL DEFAULT 'ENVOYEE',
    job_url TEXT,
    salary_gratification VARCHAR(100),
    recruiter_name VARCHAR(150),
    recruiter_email VARCHAR(200),
    recruiter_phone VARCHAR(50),
    next_follow_up_date DATE,
    interview_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    resume_used VARCHAR(255),
    cover_letter_used VARCHAR(255),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table Entretiens
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL, -- RH, Technique, Manager, Final
    interviewer VARCHAR(150),
    location_or_link VARCHAR(255),
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table Relances & Rappels (Reminders)
CREATE TABLE reminders (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    reminder_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE
);

-- 6. Index de performance pour les requêtes de recherche et dashboard
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(application_date DESC);
CREATE INDEX idx_applications_domain ON applications(domain);
CREATE INDEX idx_interviews_app ON interviews(application_id);
`;

  const javaEntity = `package com.miage.jobtracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Le nom de l'entreprise est obligatoire")
    @Column(nullable = false, length = 150)
    private String company;

    @NotBlank(message = "L'intitulé du poste est obligatoire")
    @Column(nullable = false, length = 200)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractType contractType = ContractType.Stage;

    @Column(nullable = false, length = 100)
    private String domain;

    @Column(nullable = false, length = 150)
    private String location;

    @NotNull(message = "La date de candidature est obligatoire")
    @Column(nullable = false)
    private LocalDate applicationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.ENVOYEE;

    @Column(columnDefinition = "TEXT")
    private String jobUrl;

    private String salaryGratification;
    private String recruiterName;
    private String recruiterEmail;
    private String recruiterPhone;

    private LocalDate nextFollowUpDate;
    private LocalDateTime interviewDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String resumeUsed;
    private String coverLetterUsed;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Interview> interviews = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reminder> reminders = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
`;

  const javaController = `package com.miage.jobtracker.controller;

import com.miage.jobtracker.dto.ApplicationDTO;
import com.miage.jobtracker.dto.StatusUpdateDTO;
import com.miage.jobtracker.dto.StatisticsDTO;
import com.miage.jobtracker.entity.Application;
import com.miage.jobtracker.service.ApplicationService;
import com.miage.jobtracker.service.StatisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<List<ApplicationDTO>> getAllUserApplications(
            @AuthenticationPrincipal Long currentUserId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String domain) {
        return ResponseEntity.ok(applicationService.getApplications(currentUserId, search, status, domain));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getApplicationById(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(applicationService.getApplicationById(id, currentUserId));
    }

    @PostMapping
    public ResponseEntity<ApplicationDTO> createApplication(
            @Valid @RequestBody ApplicationDTO dto,
            @AuthenticationPrincipal Long currentUserId) {
        ApplicationDTO created = applicationService.createApplication(dto, currentUserId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDTO dto,
            @AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(applicationService.updateApplication(id, dto, currentUserId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO statusDto,
            @AuthenticationPrincipal Long currentUserId) {
        applicationService.updateStatus(id, statusDto.getStatus(), currentUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId) {
        applicationService.deleteApplication(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsDTO> getStatistics(@AuthenticationPrincipal Long currentUserId) {
        return ResponseEntity.ok(statisticsService.calculateUserStatistics(currentUserId));
    }
}
`;

  const securityCode = `package com.miage.jobtracker.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
`;

  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.miage</groupId>
    <artifactId>jobtracker-api</artifactId>
    <version>1.0.0</version>
    <name>JobTracker Spring Boot API</name>
    <description>Projet Master 2 MIAGE - Suivi de candidatures</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Web & Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Spring Data JPA & PostgreSQL -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Spring Security & JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
`;

  const getActiveCode = () => {
    switch (activeSubTab) {
      case 'sql':
        return postgresSchema;
      case 'entities':
        return javaEntity;
      case 'controllers':
        return javaController;
      case 'security':
        return securityCode;
      case 'pom':
        return pomXml;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    addToast('Code copié dans le presse-papier !', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-cyan-950/60 dark:text-teal-400 mb-2">
          <Server className="h-3.5 w-3.5" />
          <span>Architecture Backend & Portfolio M2 MIAGE</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Code Source Spring Boot 3 & PostgreSQL
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Consultez et exportez l'architecture complète Java Spring Boot, JPA, Spring Security et les tables relationnelles PostgreSQL pour votre projet local dans Visual Studio Code et GitHub.
        </p>
      </div>

      {/* Project Structure Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-teal-600" />
          Arborescence du projet Spring Boot pour VS Code
        </h2>

        <div className="font-mono text-[11px] bg-slate-900 text-teal-400 p-4 rounded-xl overflow-x-auto leading-relaxed">
{`jobtracker-backend/
├── pom.xml                                   # Dépendances Maven (Spring Boot 3.3, JPA, Security, JWT, PostgreSQL)
├── src/main/resources/
│   ├── application.yml                       # Config PostgreSQL (datasource, hibernate ddl-auto, jwt.secret)
│   └── db/migration/schema.sql               # Script DDL PostgreSQL
└── src/main/java/com/miage/jobtracker/
    ├── JobTrackerApplication.java            # Point d'entrée Spring Boot
    ├── entity/                               # Entités JPA (User, Application, Interview, Reminder, Document)
    ├── repository/                           # Spring Data JPA Repositories (ApplicationRepository...)
    ├── service/                              # Logique métier et calcul des statistiques
    ├── controller/                           # Endpoints REST (ApplicationController, AuthController...)
    ├── dto/                                  # Data Transfer Objects & validation Jakarta
    └── security/                             # Spring Security 6, JWT Filter, BCrypt`}
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-[#F4EFE6] dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('sql')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'sql'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>schema.sql (PostgreSQL)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('entities')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'entities'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Application.java (JPA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('controllers')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'controllers'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>ApplicationController.java (REST)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'security'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>SecurityConfig.java (JWT)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('pom')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'pom'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>pom.xml (Maven)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-[#F4EFE6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-teal-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier le code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-slate-200 leading-relaxed">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
