# 🏗️ Reusable Backend Blueprint — Final Master Checklist

> **Stack**: NestJS + TypeScript + MongoDB (Adaptable for PostgreSQL, Express, Fastify, and other backend runtimes)  
> **Philosophy**: *Build once, reuse across projects, customize where required.*

This blueprint is designed for multiple enterprise-grade backend projects. It is organized into two distinct architectural levels:
- **Level 1 (Basic Common Foundation)**: Reusable components and standards required for almost every production backend project before implementing domain-specific business modules.
- **Level 2 (Advanced Foundation)**: Additional capabilities introduced progressively based on project requirements, scale, security, and infrastructure complexity.

---

## 📑 Table of Contents

- [LEVEL 1 — Basic Common Backend Foundation](#level-1--basic-common-backend-foundation)
  - [1. Project Setup & Architecture](#1-project-setup--architecture)
  - [2. Common Database Foundation](#2-common-database-foundation)
  - [3. Common Database Patterns](#3-common-database-patterns)
  - [4. Common API Response Standards](#4-common-api-response-standards)
  - [5. HTTP Status Code Standards](#5-http-status-code-standards)
  - [6. Common DTOs](#6-common-dtos)
  - [7. Common Interfaces & Types](#7-common-interfaces--types)
  - [8. Common Decorators](#8-common-decorators)
  - [9. Common Guards, Pipes & Interceptors](#9-common-guards-pipes--interceptors)
  - [10. Common Utility Functions](#10-common-utility-functions)
  - [11. Configuration Management](#11-configuration-management)
  - [12. Logger & Request Tracking](#12-logger--request-tracking)
  - [13. Swagger / OpenAPI](#13-swagger--openapi)
  - [14. Authentication Foundation](#14-authentication-foundation)
  - [15. Email Service](#15-email-service)
  - [16. Validation & Security Basics](#16-validation--security-basics)
  - [17. Common Testing Foundation](#17-common-testing-foundation)
  - [18. Health & Application Lifecycle](#18-health--application-lifecycle)
  - [19. DevOps & Deployment Basics](#19-devops--deployment-basics)
  - [20. Common Module Template](#20-common-module-template)
- [LEVEL 2 — Advanced & Project-Dependent Backend Foundation](#level-2--advanced--project-dependent-backend-foundation)
  - [21. Advanced Database Architecture](#21-advanced-database-architecture)
  - [22. Advanced Base Schema & Data Management](#22-advanced-base-schema--data-management)
  - [23. Advanced Authorization](#23-advanced-authorization)
  - [24. Advanced Authentication](#24-advanced-authentication)
  - [25. Caching & Performance](#25-caching--performance)
  - [26. Background Jobs & Scheduling](#26-background-jobs--scheduling)
  - [27. Advanced Email & Notification System](#27-advanced-email--notification-system)
  - [28. File Management & Storage](#28-file-management--storage)
  - [29. Webhooks & External Integrations](#29-webhooks--external-integrations)
  - [30. Transaction Reliability & Event Architecture](#30-transaction-reliability--event-architecture)
  - [31. Real-Time Communication](#31-real-time-communication)
  - [32. Search & Bulk Operations](#32-search--bulk-operations)
  - [33. Advanced Security](#33-advanced-security)
  - [34. Audit & Compliance](#34-audit--compliance)
  - [35. Observability & Monitoring](#35-observability--monitoring)
  - [36. Advanced API Management](#36-advanced-api-management)
  - [37. Feature Flags & Dynamic Configuration](#37-feature-flags--dynamic-configuration)
  - [38. Localization & Regional Support](#38-localization--regional-support)
  - [39. Reliability & Disaster Recovery](#39-reliability--disaster-recovery)
  - [40. Advanced DevOps & Scalability](#40-advanced-devops--scalability)
  - [41. Architecture & Maintainability](#41-architecture--maintainability)
  - [42. Advanced Developer Experience](#42-advanced-developer-experience)
- [Recommended Reusable Shared Foundation Structure](#recommended-reusable-shared-foundation-structure)
- [Recommended Implementation Order](#recommended-implementation-order)
- [Final Architecture Principle](#final-architecture-principle)

---

## LEVEL 1 — Basic Common Backend Foundation

> **Rule**: Build this foundation before implementing business feature modules.

### 1. Project Setup & Architecture
- [x] Project initialization and configuration
- [x] TypeScript strict configuration
- [x] NestJS application bootstrap
- [x] Standard folder structure
- [x] Module architecture
- [x] Naming conventions
- [x] Import aliases
- [x] Environment separation (local, development, staging, production)
- [x] ESLint and Prettier
- [x] Package scripts
- [x] Git configuration and .gitignore
- [x] README and setup documentation

### 2. Common Database Foundation
- [x] Base schema
- [x] Base document interface
- [x] Common schema factory
- [x] Common timestamps (createdAt, updatedAt)
- [x] Audit fields (createdBy, updatedBy)
- [x] Soft-delete fields (isDeleted, deletedAt, deletedBy)
- [x] Active/inactive status (isActive)
- [x] Common database configuration
- [x] Database connection module
- [x] Schema naming conventions
- [x] Common index conventions
- [x] ObjectId validation and conversion
- [x] Database error handling
- [x] Duplicate-key error handling
- [x] Database transaction conventions

### 3. Common Database Patterns
- [ ] Repository pattern (where useful)
- [x] Service pattern
- [x] CRUD operation conventions
- [x] Find by ID
- [x] Find by condition
- [x] Create and update conventions
- [ ] Soft delete and restore
- [x] Pagination queries
- [x] Filtering and sorting queries
- [x] Database document-to-response mapping
- [x] Projection and field selection
- [x] Query optimization conventions

### 4. Common API Response Standards
- [x] Standard success response format
- [x] Standard error response format
- [x] Common response interfaces
- [x] Common response DTOs
- [x] Global response interceptor
- [x] Global exception filter
- [x] Standard error codes
- [x] Standard success messages
- [x] Consistent HTTP status codes
- [x] Validation error formatting
- [x] API timestamp format
- [x] Request ID in responses

#### Suggested response structure:
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {},
  "meta": null,
  "timestamp": "2026-11-11T09:30:00.000Z",
  "path": "/api/v1/users"
}
```

### 5. HTTP Status Code Standards
- [x] 200 — OK
- [x] 201 — Created
- [ ] 202 — Accepted
- [x] 204 — No Content
- [x] 400 — Bad Request
- [x] 401 — Unauthorized
- [x] 403 — Forbidden
- [x] 404 — Not Found
- [x] 409 — Conflict
- [x] 422 — Unprocessable Entity
- [ ] 429 — Too Many Requests
- [x] 500 — Internal Server Error
- [ ] 503 — Service Unavailable

### 6. Common DTOs
- [x] Base DTO
- [x] Create DTO conventions
- [x] Update DTO conventions
- [x] Pagination DTO
- [x] Pagination response DTO
- [x] Search DTO
- [x] Sort DTO
- [x] Date range DTO
- [x] ID parameter DTO
- [x] Common response DTO
- [x] Nested DTO validation
- [x] Query parameter validation

### 7. Common Interfaces & Types
- [x] API response interface
- [x] API error interface
- [x] Pagination interface
- [x] Pagination metadata interface
- [x] Sort interface
- [x] Filter interface
- [x] Authenticated user interface
- [x] JWT payload interface
- [x] Service result interface
- [x] Common database document types
- [x] Common enum and union types

### 8. Common Decorators
- [x] `@Public()`
- [x] `@CurrentUser()`
- [x] `@Roles()`
- [ ] `@Permissions()`
- [ ] `@ApiPaginatedResponse()`
- [x] `@RequestId()`
- [x] Custom validation decorators
- [x] Reusable Swagger decorators

### 9. Common Guards, Pipes & Interceptors
- [x] JWT authentication guard
- [ ] Authorization guard
- [x] Roles guard
- [ ] Permissions guard
- [x] Global validation pipe
- [x] Response interceptor
- [x] Logging interceptor
- [ ] Request timeout handling
- [ ] Rate-limit guard (where required)
- [x] Global exception filter

### 10. Common Utility Functions

#### ID and crypto
- [x] UUID generation using `uuid` or Node.js `crypto`
- [x] Public ID generation
- [ ] Hash generation
- [x] Secure random token generation
- [ ] Constant-time token comparison where applicable

#### Date and time
- [x] Current UTC date
- [x] ISO date formatting
- [ ] Date parsing and validation
- [x] Add/subtract days, hours and minutes
- [x] Start/end of day with explicit timezone
- [ ] Date comparison
- [x] Expiry calculation
- [ ] Duration calculation

#### String and object
- [x] String trimming
- [x] String normalization
- [x] Slug generation
- [ ] Case conversion
- [x] Object pick/omit
- [x] Safe JSON parsing
- [ ] Deep clone where appropriate
- [x] Null/undefined checks

#### Number and array
- [x] Number formatting
- [x] Currency formatting
- [x] Array deduplication
- [x] Array grouping
- [ ] Array sorting
- [x] Safe numeric parsing

#### File and request
- [ ] Filename sanitization
- [ ] File extension validation
- [ ] MIME type validation
- [x] Query parameter parsing
- [x] Pagination calculation
- [ ] Search/filter parsing
- [x] Sensitive-data masking

### 11. Configuration Management
- [x] Centralized ConfigModule
- [ ] Environment variable validation
- [x] Typed configuration
- [x] .env.example
- [ ] Environment-specific settings
- [x] Database configuration
- [x] JWT configuration
- [x] Email configuration
- [x] CORS configuration
- [ ] Application configuration
- [x] Secret management conventions

### 12. Logger & Request Tracking
- [x] Centralized logger service
- [x] Structured logging
- [x] Log levels
- [x] Request ID generation
- [x] Correlation ID propagation
- [x] Request/response duration logging
- [x] Error stack logging
- [ ] Sensitive data redaction
- [ ] Log rotation and retention strategy
- [x] Environment-specific logging

### 13. Swagger / OpenAPI
- [x] Central Swagger configuration
- [x] API title and description
- [x] API version
- [x] Bearer authentication configuration
- [ ] Common response documentation
- [ ] Common error documentation
- [x] DTO examples
- [ ] Request/response examples
- [ ] Pagination documentation
- [ ] File upload documentation
- [x] API tags and grouping
- [ ] Production access restrictions

### 14. Authentication Foundation
- [x] Registration
- [x] Login
- [ ] Logout
- [x] Password hashing
- [x] JWT access token
- [ ] Refresh token
- [x] Token verification
- [x] Token expiry handling
- [x] Authentication guards
- [x] Current user decorator
- [x] Password reset
- [x] Email verification
- [x] Basic role-based authorization

### 15. Email Service
- [x] Centralized EmailModule
- [x] Email provider configuration
- [x] SMTP integration
- [x] Reusable EmailService
- [x] HTML email templates
- [ ] Plain-text email templates
- [x] Dynamic template variables
- [x] Welcome email
- [x] Email verification template
- [x] Password reset template
- [ ] Invitation template
- [x] Email error handling
- [ ] Provider timeout and retry conventions

### 16. Validation & Security Basics
- [x] Global validation pipe
- [x] DTO validation using class-validator
- [ ] Input sanitization where appropriate
- [ ] Request body limits
- [x] CORS configuration
- [ ] Helmet security headers
- [x] Password security
- [x] Secure environment variables
- [ ] Basic rate limiting
- [ ] NoSQL injection protection
- [x] Sensitive field exclusion
- [x] Secure error responses

### 17. Common Testing Foundation
- [ ] Unit testing configuration
- [ ] Service testing patterns
- [ ] Controller testing patterns
- [ ] Utility function tests
- [ ] Database integration tests
- [ ] Mock service patterns
- [ ] Test data factories
- [ ] Authentication tests
- [ ] API response contract tests
- [ ] Error handling tests
- [ ] Environment-specific test configuration

### 18. Health & Application Lifecycle
- [x] Health check endpoint
- [x] Liveness endpoint
- [x] Readiness endpoint
- [x] Database connectivity check
- [ ] Graceful shutdown
- [ ] Connection cleanup
- [ ] Process signal handling
- [ ] Startup validation

### 19. DevOps & Deployment Basics
- [ ] Dockerfile
- [ ] Docker Compose for local development where useful
- [ ] .dockerignore
- [x] Production build
- [ ] Environment-specific deployment
- [ ] GitLab/GitHub CI pipeline
- [ ] Lint and type-check pipeline
- [ ] Unit test pipeline
- [x] Build verification
- [ ] Deployment documentation
- [ ] Basic deployment and rollback strategy

### 20. Common Module Template
Every feature module should follow a consistent structure:

```text
users/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── query-user.dto.ts
├── schemas/
│   └── user.schema.ts
├── interfaces/
├── constants/
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── users.module.ts
└── users.service.spec.ts
```

- [x] Controller conventions
- [x] Service conventions
- [ ] Repository conventions (if used)
- [x] DTO conventions
- [x] Schema conventions
- [x] Module registration
- [ ] Unit test conventions
- [x] Swagger documentation conventions

---

## LEVEL 2 — Advanced & Project-Dependent Backend Foundation

> **Rule**: Implement these when business requirements, scale, security, or infrastructure needs justify them.

### 21. Advanced Database Architecture
- [x] Multi-tenancy architecture
- [ ] Shared database versus database-per-tenant
- [x] Tenant isolation
- [ ] Advanced indexing
- [x] Compound indexes
- [x] Database transactions
- [ ] Aggregation pipelines
- [ ] Read/write optimization
- [ ] Data archival
- [ ] Database migration strategy
- [ ] Backup and restore
- [ ] Data retention policies

### 22. Advanced Base Schema & Data Management
- [x] Tenant-aware base schema
- [ ] Versioning fields
- [ ] Soft-delete restoration tracking
- [ ] Audit history schema
- [ ] Status history schema
- [ ] Document versioning
- [ ] Optimistic concurrency control
- [ ] Common audit event model
- [ ] Data ownership conventions

### 23. Advanced Authorization
- [ ] Fine-grained RBAC
- [ ] Permission-based authorization
- [ ] Resource-level permissions
- [ ] Ownership-based access
- [ ] Attribute-based access control (ABAC)
- [ ] Dynamic permission management
- [ ] Permission caching
- [x] Multi-tenant authorization
- [ ] Access audit history

### 24. Advanced Authentication
- [ ] Refresh token rotation
- [ ] Refresh token reuse detection
- [ ] Device/session management
- [ ] Logout from all devices
- [ ] Multi-factor authentication
- [x] OTP service
- [ ] OAuth2 / OpenID Connect
- [ ] Social login
- [ ] Account lockout
- [ ] Login attempt tracking
- [ ] API key authentication
- [ ] Session revocation

### 25. Caching & Performance
- [ ] Redis integration
- [ ] Cache module
- [ ] Cache key conventions
- [ ] TTL management
- [ ] Cache invalidation
- [ ] Cache-aside pattern
- [ ] Distributed caching
- [ ] Cache stampede protection
- [ ] Database query optimization
- [ ] Performance profiling

### 26. Background Jobs & Scheduling
- [ ] Queue integration
- [ ] BullMQ integration where appropriate
- [ ] Worker modules
- [ ] Scheduled jobs
- [ ] Cron jobs
- [ ] Distributed scheduler locks
- [ ] Job retry and backoff
- [ ] Dead-letter handling
- [ ] Job status tracking
- [ ] Job cancellation
- [ ] Idempotent job processing
- [ ] Worker graceful shutdown

### 27. Advanced Email & Notification System
- [ ] Email queue
- [ ] Email delivery tracking
- [ ] Email retry mechanism
- [ ] Email provider fallback
- [ ] SMS integration
- [ ] Push notifications
- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Notification templates
- [ ] Notification history

### 28. File Management & Storage
- [ ] AWS S3 / compatible storage
- [ ] Local storage adapter
- [ ] File upload service
- [ ] Multiple file uploads
- [ ] Signed URLs
- [ ] Private/public file access
- [ ] File metadata management
- [ ] File deletion and retention
- [ ] Image processing
- [ ] File size and content validation
- [ ] Malware scanning where appropriate

### 29. Webhooks & External Integrations
- [ ] External API integration layer
- [ ] Provider adapter pattern
- [ ] API timeout management
- [ ] Retry mechanism
- [ ] Circuit breaker
- [ ] Webhook signature verification
- [ ] Webhook event tracking
- [ ] Replay protection
- [ ] Duplicate event prevention
- [ ] Webhook delivery tracking
- [ ] Failed event replay
- [ ] API rate-limit handling

### 30. Transaction Reliability & Event Architecture
- [ ] Transaction boundary design
- [ ] Transactional outbox pattern
- [ ] Event-driven architecture
- [ ] Domain events
- [ ] Event handlers
- [ ] Event versioning
- [ ] Idempotency keys
- [ ] Event replay strategy
- [ ] Saga pattern where necessary
- [ ] Eventual consistency handling
- [ ] Compensation workflows

### 31. Real-Time Communication
- [ ] WebSocket integration
- [ ] Socket authentication
- [ ] Room management
- [ ] Event broadcasting
- [ ] Server-Sent Events
- [ ] Redis pub/sub adapter
- [ ] Connection tracking
- [ ] Reconnection strategy
- [ ] Event authorization
- [ ] Real-time notification delivery

### 32. Search & Bulk Operations
- [ ] Advanced search
- [ ] Full-text search
- [ ] Elasticsearch/OpenSearch integration if needed
- [ ] Advanced filtering
- [ ] Advanced sorting
- [ ] CSV import
- [ ] Excel import/export
- [ ] Bulk create/update/delete
- [ ] Import validation reports
- [ ] Export background processing
- [ ] Import/export progress tracking

### 33. Advanced Security
- [ ] OWASP security review
- [ ] SSRF protection
- [ ] CSRF protection where applicable
- [ ] Advanced rate limiting
- [ ] Brute-force protection
- [ ] Secure cookie strategy
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Secret rotation
- [ ] Dependency vulnerability scanning
- [ ] Container image scanning
- [ ] Security audit logs
- [ ] Security incident response

### 34. Audit & Compliance
- [ ] Centralized audit logging
- [ ] User activity tracking
- [ ] Login activity history
- [ ] Sensitive operation tracking
- [ ] Record change history
- [ ] Data export and deletion
- [ ] Data anonymization
- [ ] Retention management
- [ ] Audit access restrictions
- [ ] Compliance requirements documentation

### 35. Observability & Monitoring
- [ ] Centralized log management
- [ ] Application metrics
- [ ] Prometheus integration where appropriate
- [ ] Grafana dashboards where appropriate
- [ ] Distributed tracing
- [ ] OpenTelemetry integration
- [ ] Request performance tracking
- [ ] Database performance monitoring
- [ ] Queue monitoring
- [ ] Error monitoring
- [ ] Alerting
- [ ] Operational runbooks
- [ ] Service-level indicators and objectives

### 36. Advanced API Management
- [ ] API versioning
- [ ] API deprecation strategy
- [ ] API key management
- [ ] Idempotency support
- [ ] Advanced pagination
- [ ] API usage tracking
- [ ] API quotas
- [ ] Request throttling
- [ ] API gateway integration where needed
- [ ] Backward compatibility strategy

### 37. Feature Flags & Dynamic Configuration
- [ ] Feature flag service
- [ ] Tenant-level feature flags
- [ ] User-level feature flags
- [ ] Runtime configuration
- [ ] Dynamic application settings
- [ ] Configuration audit history
- [ ] Gradual rollout
- [ ] Emergency feature disablement

### 38. Localization & Regional Support
- [ ] Multi-language support
- [ ] Translation management
- [ ] Locale-aware formatting
- [ ] Multi-currency support
- [ ] Timezone-aware business rules
- [ ] Regional date formats
- [ ] Business calendar and holidays

### 39. Reliability & Disaster Recovery
- [ ] Backup automation
- [ ] Point-in-time recovery where supported
- [ ] Recovery point objective (RPO)
- [ ] Recovery time objective (RTO)
- [ ] Restore testing
- [ ] Failure recovery strategy
- [ ] Dependency outage handling
- [ ] Retry and timeout standards
- [ ] Graceful degradation
- [ ] Disaster recovery documentation

### 40. Advanced DevOps & Scalability
- [ ] Production CI/CD pipeline
- [ ] Automated deployment
- [ ] Deployment approval gates
- [ ] Blue-green deployment where appropriate
- [ ] Canary releases where appropriate
- [ ] Horizontal scaling
- [ ] Container orchestration where needed
- [ ] Load balancing
- [ ] Auto-scaling
- [ ] Database scaling strategy
- [ ] Infrastructure as Code
- [ ] Rollback automation
- [ ] Software Bill of Materials (SBOM) where required

### 41. Architecture & Maintainability
- [ ] Modular monolith architecture
- [ ] Clean architecture where useful
- [ ] Domain-driven design where justified
- [ ] Dependency inversion
- [ ] Provider adapter architecture
- [ ] Event-driven module communication
- [ ] Microservices only when justified
- [ ] Service boundary definitions
- [ ] Architecture decision records
- [ ] Dependency and module boundary rules

### 42. Advanced Developer Experience
- [ ] Shared test factories
- [ ] Reusable test fixtures
- [ ] API contract testing
- [ ] Integration test environments
- [ ] Load testing
- [ ] Security testing
- [ ] Seed data management
- [ ] Database migration tooling
- [ ] API collection maintenance
- [ ] Release notes and changelog
- [ ] Pull request templates
- [ ] Code ownership conventions

---

## 🗂️ Recommended Reusable Shared Foundation Structure

This is a suggested structure for a NestJS project. Keep optional integrations outside `common/` so shared utilities do not become coupled to infrastructure providers.

```text
src/
│
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── interfaces/
│   ├── middleware/
│   ├── pipes/
│   ├── schemas/
│   │   ├── base.schema.ts
│   │   └── base.schema.factory.ts
│   ├── types/
│   └── utils/
│       ├── uuid.util.ts
│       ├── date.util.ts
│       ├── string.util.ts
│       ├── number.util.ts
│       ├── object.util.ts
│       ├── array.util.ts
│       ├── file.util.ts
│       └── pagination.util.ts
│
├── config/
│   ├── configuration.ts
│   ├── env.validation.ts
│   └── config.module.ts
│
├── infrastructure/
│   ├── database/
│   ├── logger/
│   ├── email/
│   ├── storage/
│   ├── cache/
│   ├── queue/
│   └── integrations/
│
├── modules/
│   ├── auth/
│   ├── users/
│   └── health/
│
├── app.module.ts
└── main.ts
```

---

## 🚦 Recommended Implementation Order

Start here:

| Order | Foundation | Level |
| :---: | :--- | :---: |
| **1** | Project structure and configuration | **1** |
| **2** | Base schema and database conventions | **1** |
| **3** | Common DTOs, types and interfaces | **1** |
| **4** | UUID, date and general utilities | **1** |
| **5** | Standard API responses and exceptions | **1** |
| **6** | Validation, guards and decorators | **1** |
| **7** | Logger and request tracking | **1** |
| **8** | Swagger configuration | **1** |
| **9** | Authentication and authorization | **1** |
| **10** | Email service | **1** |
| **11** | Pagination, filtering and sorting | **1** |
| **12** | Health checks and testing | **1** |
| **13** | Docker and CI/CD basics | **1** |
| **14** | First business module | **1** |
| **15** | Multi-tenancy and advanced permissions | **2** |
| **16** | Redis and caching | **2** |
| **17** | Queues and scheduler | **2** |
| **18** | File storage and integrations | **2** |
| **19** | Webhooks and event architecture | **2** |
| **20** | Advanced monitoring and security | **2** |
| **21** | Scalability and disaster recovery | **2** |

---

## 🎯 Final Architecture Principle

> **Build once, reuse across projects, customize where required.**

### Key Architectural Guidelines:
1. **Separation of Concerns**: Shared base schemas, response formats, DTOs, decorators, utilities, and logger conventions should be standardized and centralized in `common/`.
2. **Domain Isolation**: Business-specific schemas, services, permissions, and workflows must remain inside their respective feature modules (`modules/`).
3. **Progressive Delivery**: Don't build all 42 sections before your first feature. Finish **Level 1**, validate the foundation with a real business module, and progressively introduce **Level 2** capabilities as project scale and complexity demand.

