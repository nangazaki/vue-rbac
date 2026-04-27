# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.7] (2026-04-27)
- <!-- describe changes here -->

## [1.0.6] (2026-04-27)
### Added
- TTL-based caching for dynamic configuration
- Configurable retry mechanism for dynamic configuration loading
- `clearCache` and `clearAllCaches` methods for explicit cache management
- `RbacGuard` component for role and permission-based access control

### Changed
- Improved cache handling and configuration loading resilience


## [1.0.5] (2025-10-04)
- Added storage functionality with adapters for `localStorage`, `sessionStorage`, and `cookies`.
- Added agnostic mode for dynamic and hybrid configurations, allowing roles to be fetched from any source.
