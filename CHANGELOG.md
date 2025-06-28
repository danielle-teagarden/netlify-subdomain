# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2024-12-28

### Fixed
- Fixed site ID detection logic to properly handle site names with hyphens
- Fixed remove command to correctly match DNS records by full hostname
- Better user guidance when domain alias API fails

### Improved
- Always fetch site info to get correct default domain
- Clearer instructions for manual domain alias setup when needed

## [1.0.1] - 2024-12-28

### Fixed
- Improved error handling for domain alias API calls
- Added HTTP status code checking for better debugging
- More informative error messages when domain alias addition fails
- Better detection of API failures that were previously silent

## [1.0.0] - 2024-12-28

### Added
- Initial release
- Add subdomains to any Netlify site
- Remove subdomains
- Site aliases for quick access
- List sites with alias indicators
- List recent domains
- Configuration management
- Support for custom domains managed by Netlify DNS

### Features
- `add` - Add a subdomain to a site
- `remove` - Remove a subdomain
- `list-sites` - List all Netlify sites
- `list-zones` - List DNS zones
- `list-recent` - Show recently added domains
- `alias` - Create site aliases
- `config` - View configuration

### Configuration
- Default domain setting
- Persistent aliases
- Recent domains tracking