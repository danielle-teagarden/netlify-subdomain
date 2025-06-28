# netlify-subdomain

[![npm version](https://badge.fury.io/js/netlify-subdomain.svg)](https://badge.fury.io/js/netlify-subdomain)
[![npm downloads](https://img.shields.io/npm/dt/netlify-subdomain.svg)](https://www.npmjs.com/package/netlify-subdomain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/danielle-teagarden/netlify-subdomain.svg)](https://github.com/danielle-teagarden/netlify-subdomain/stargazers)

A CLI tool to manage Netlify subdomains without using the web UI. Perfect for developers who prefer the command line.

**🎉 v1.1.0 Update: Full automation! No more manual steps in the Netlify UI!**

## Features

- ✅ Add subdomains to any Netlify site from the command line
- ✅ Remove subdomains just as easily
- ✅ Use aliases for frequently accessed sites
- ✅ Track recently added domains
- ✅ List all your sites and DNS zones
- ✅ Works with any domain managed by Netlify DNS

## Installation

```bash
npm install -g netlify-subdomain
```

Or install from this directory:
```bash
npm link
```

## Usage

### Add a subdomain
```bash
# Add to current directory's site
netlify-subdomain add blog

# Add to specific site using alias
netlify-subdomain add api danielle.world juice

# Add to site by name
netlify-subdomain add docs danielle.world my-docs-site
```

### Remove a subdomain
```bash
netlify-subdomain remove blog.danielle.world
```

### Create aliases for your sites
```bash
netlify-subdomain alias blog my-blog-site
netlify-subdomain alias juice juice-box-musical
```

### List your resources
```bash
# List all sites (shows aliases)
netlify-subdomain list-sites

# List DNS zones
netlify-subdomain list-zones

# List recently added domains
netlify-subdomain list-recent
```

### View configuration
```bash
netlify-subdomain config
```

## Configuration

The tool stores configuration in `~/.netlify-subdomain-config.json`:

```json
{
  "defaultDomain": "danielle.world",
  "aliases": {
    "juice": "juice-box-musical",
    "wedding": "melodic-longma-cade27",
    "recipes": "gleeful-profiterole-f78030"
  },
  "recentDomains": []
}
```

## Requirements

- Node.js 18 or higher
- Netlify CLI (for authentication)
- Domain must be managed by Netlify DNS

## How it works

This tool uses the Netlify API to:
1. Create DNS records in your Netlify DNS zones
2. Add domain aliases to your Netlify sites
3. Manage your subdomains programmatically

## Why this exists

The Netlify web UI is great, but adding subdomains requires multiple clicks and page loads. This tool makes it as simple as typing a single command.

## License

MIT