#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration file path
const CONFIG_PATH = path.join(os.homedir(), '.netlify-subdomain-config.json');

// Load or create config
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    return {
      defaultDomain: 'danielle.world',
      aliases: {
        'juice': 'juice-box-musical',
        'wedding': 'melodic-longma-cade27',
        'recipes': 'gleeful-profiterole-f78030',
        'piano': 'chipper-daifuku-fbdde1',
        'inventory': 'personal-inventory',
        'main': 'danielleworld'
      },
      recentDomains: []
    };
  }
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Get Netlify access token
function getNetlifyToken() {
  const configPaths = [
    path.join(process.env.HOME, 'Library/Preferences/netlify/config.json'),
    path.join(process.env.HOME, '.config/netlify/config.json')
  ];
  
  for (const configPath of configPaths) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.users) {
        const userId = Object.keys(config.users)[0];
        return config.users[userId].auth.token;
      }
    } catch (e) {}
  }
  
  console.error('❌ Not logged in to Netlify. Run: netlify login');
  process.exit(1);
}

// Add domain to site using curl
async function addDomainToSite(domain, siteId) {
  const token = getNetlifyToken();
  
  console.log(`🔗 Adding ${domain} to site ${siteId}...`);
  
  try {
    // First, we need to get the DNS zone ID for the base domain
    const baseDomain = domain.split('.').slice(-2).join('.');
    
    // Get all DNS zones
    const zonesResult = execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/dns_zones`, {
      encoding: 'utf8'
    });
    
    const zones = JSON.parse(zonesResult);
    const zone = zones.find(z => z.name === baseDomain);
    
    if (!zone) {
      console.error(`❌ DNS zone for ${baseDomain} not found in Netlify DNS`);
      console.log('\nTo use this tool, the base domain must be managed by Netlify DNS.');
      return;
    }
    
    console.log(`✅ Found DNS zone for ${baseDomain}`);
    
    // Add DNS record for the subdomain
    const subdomain = domain.split('.')[0];
    
    // Get the target domain for the site
    let targetDomain;
    if (siteId.includes('-')) {
      // It's a site ID, need to fetch info
      const siteInfo = JSON.parse(execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/sites/${siteId}`, {
        encoding: 'utf8'
      }));
      targetDomain = siteInfo.default_domain;
    } else {
      // It's already a site name, construct the domain
      targetDomain = `${siteId}.netlify.app`;
    }
    
    console.log(`📝 Adding CNAME: ${subdomain} → ${targetDomain}`);
    
    // Create DNS record
    const dnsResult = execSync(`curl -s -X POST -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"type":"CNAME","hostname":"${subdomain}","value":"${targetDomain}","ttl":3600}' https://api.netlify.com/api/v1/dns_zones/${zone.id}/dns_records`, {
      encoding: 'utf8'
    });
    
    // Now add the domain alias to the site
    try {
      const aliasResult = execSync(`curl -s -w "\\nHTTP_STATUS:%{http_code}" -X POST -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"domain":"${domain}"}' https://api.netlify.com/api/v1/sites/${siteId}/domain_aliases`, {
        encoding: 'utf8'
      });
      
      // Extract HTTP status code
      const statusMatch = aliasResult.match(/HTTP_STATUS:(\d+)/);
      const httpStatus = statusMatch ? parseInt(statusMatch[1]) : 0;
      const responseBody = aliasResult.replace(/\nHTTP_STATUS:\d+/, '');
      
      // Check if the result is an error
      let aliasData;
      try {
        aliasData = JSON.parse(responseBody);
      } catch (e) {
        // If we can't parse, check HTTP status
        if (httpStatus >= 200 && httpStatus < 300) {
          aliasData = {};
        } else {
          console.log(`⚠️  Domain alias API returned status ${httpStatus}`);
          aliasData = { error: 'Non-JSON response' };
        }
      }
      
      if (aliasData.error || aliasData.code === 422 || httpStatus >= 400) {
        console.log(`⚠️  Note: Domain alias may already exist or there was an issue adding it`);
        console.log(`   HTTP Status: ${httpStatus}`);
        if (aliasData.error) {
          console.log(`   Error: ${aliasData.error}`);
        }
        if (aliasData.message) {
          console.log(`   Message: ${aliasData.message}`);
        }
        console.log(`   You may need to add the domain alias manually in the Netlify UI`);
      }
    } catch (aliasError) {
      console.log(`⚠️  DNS record created but couldn't add domain alias to site`);
      console.log(`   You may need to add it manually in the Netlify UI`);
    }
    
    console.log(`✅ Successfully added ${domain}!`);
    console.log(`🌐 Your site will be available at: https://${domain}`);
    console.log('\nNote: DNS propagation may take a few minutes.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stdout) {
      console.error('Details:', error.stdout.toString());
    }
  }
}

// Get site ID by name
async function getSiteId(siteName) {
  const token = getNetlifyToken();
  
  try {
    const result = execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/sites`, {
      encoding: 'utf8'
    });
    
    const sites = JSON.parse(result);
    const site = sites.find(s => s.name === siteName);
    
    if (site) {
      return site.id;
    }
    
    // Try to find by custom domain
    const siteByDomain = sites.find(s => 
      s.custom_domain === siteName || 
      s.default_domain === siteName
    );
    
    return siteByDomain ? siteByDomain.id : null;
  } catch (error) {
    console.error('Error fetching sites:', error.message);
    return null;
  }
}

// Remove domain from site
async function removeDomainFromSite(domain) {
  const token = getNetlifyToken();
  const config = loadConfig();
  
  console.log(`🗑️  Removing ${domain}...`);
  
  try {
    // Parse domain
    const baseDomain = domain.split('.').slice(-2).join('.');
    const subdomain = domain.split('.')[0];
    
    // Get DNS zone
    const zonesResult = execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/dns_zones`, {
      encoding: 'utf8'
    });
    
    const zones = JSON.parse(zonesResult);
    const zone = zones.find(z => z.name === baseDomain);
    
    if (!zone) {
      console.error(`❌ DNS zone for ${baseDomain} not found`);
      return;
    }
    
    // Get DNS records
    const recordsResult = execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/dns_zones/${zone.id}/dns_records`, {
      encoding: 'utf8'
    });
    
    const records = JSON.parse(recordsResult);
    const record = records.find(r => r.hostname === subdomain && r.type === 'CNAME');
    
    if (!record) {
      console.error(`❌ DNS record for ${subdomain} not found`);
      return;
    }
    
    // Delete the record
    execSync(`curl -s -X DELETE -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/dns_zones/${zone.id}/dns_records/${record.id}`, {
      encoding: 'utf8'
    });
    
    console.log(`✅ Successfully removed ${domain}!`);
    
    // Update recent domains
    config.recentDomains = config.recentDomains.filter(d => d !== domain);
    saveConfig(config);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main CLI logic
async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Netlify Subdomain CLI - Manage domains without the web UI

Usage:
  netlify-subdomain add <subdomain> [domain] [site-name|alias]
  netlify-subdomain remove <domain>
  netlify-subdomain list-sites
  netlify-subdomain list-zones
  netlify-subdomain list-recent
  netlify-subdomain alias <name> <site-name>
  netlify-subdomain config

Examples:
  netlify-subdomain add blog                     # Adds blog.danielle.world to current site
  netlify-subdomain add api danielle.world juice # Adds api.danielle.world using 'juice' alias  
  netlify-subdomain remove test.danielle.world   # Removes subdomain
  netlify-subdomain alias blog my-blog-site      # Create alias 'blog' for site
  netlify-subdomain list-recent                  # Show recently added domains

Current aliases:
${Object.entries(config.aliases).map(([alias, site]) => `  ${alias} → ${site}`).join('\n')}

Note: The base domain must be managed by Netlify DNS for this to work.
`);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'add': {
      const subdomain = args[1];
      if (!subdomain) {
        console.error('❌ Subdomain required');
        return;
      }
      
      const baseDomain = args[2] || config.defaultDomain;
      let siteName = args[3];
      
      // Check if site name is an alias
      if (siteName && config.aliases[siteName]) {
        console.log(`📝 Using alias: ${siteName} → ${config.aliases[siteName]}`);
        siteName = config.aliases[siteName];
      }
      
      const fullDomain = subdomain.includes('.') ? subdomain : `${subdomain}.${baseDomain}`;
      
      let siteId = siteName;
      if (siteName && !siteName.includes('-')) {
        // It's a site name, not ID
        siteId = await getSiteId(siteName);
        if (!siteId) {
          console.error(`❌ Site not found: ${siteName}`);
          return;
        }
      }
      
      if (!siteId) {
        // Try to get from current directory
        try {
          const siteInfo = execSync('netlify api getSite --data \'{}\' 2>/dev/null', {
            encoding: 'utf8'
          });
          const site = JSON.parse(siteInfo);
          siteId = site.id;
          console.log(`📁 Using current directory site: ${site.name}`);
        } catch (e) {
          console.error('❌ No site specified and not in a Netlify project directory');
          return;
        }
      }
      
      await addDomainToSite(fullDomain, siteId);
      
      // Add to recent domains
      if (!config.recentDomains.includes(fullDomain)) {
        config.recentDomains.unshift(fullDomain);
        config.recentDomains = config.recentDomains.slice(0, 10); // Keep last 10
        saveConfig(config);
      }
      break;
    }
    
    case 'remove': {
      const domain = args[1];
      if (!domain) {
        console.error('❌ Domain required');
        return;
      }
      await removeDomainFromSite(domain);
      break;
    }
    
    case 'list-sites': {
      const token = getNetlifyToken();
      const result = execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/sites`, {
        encoding: 'utf8'
      });
      
      const sites = JSON.parse(result);
      console.log('\nYour Netlify sites:\n');
      sites.forEach(site => {
        // Check if this site has an alias
        const alias = Object.entries(config.aliases).find(([a, s]) => s === site.name);
        
        console.log(`${site.name}${alias ? ` (alias: ${alias[0]})` : ''}`);
        console.log(`  ID: ${site.id}`);
        console.log(`  URL: ${site.url}`);
        if (site.custom_domain) {
          console.log(`  Custom: ${site.custom_domain}`);
        }
        console.log('');
      });
      break;
    }
    
    case 'list-zones': {
      const token = getNetlifyToken();
      const result = execSync(`curl -s -H "Authorization: Bearer ${token}" https://api.netlify.com/api/v1/dns_zones`, {
        encoding: 'utf8'
      });
      
      const zones = JSON.parse(result);
      console.log('\nYour Netlify DNS zones:\n');
      zones.forEach(zone => {
        console.log(`${zone.name}`);
        console.log(`  ID: ${zone.id}`);
        console.log(`  Records: ${zone.records_count}`);
        console.log('');
      });
      break;
    }
    
    case 'list-recent': {
      console.log('\nRecently added domains:\n');
      if (config.recentDomains.length === 0) {
        console.log('  No recent domains');
      } else {
        config.recentDomains.forEach(domain => {
          console.log(`  ${domain}`);
        });
      }
      break;
    }
    
    case 'alias': {
      const aliasName = args[1];
      const siteName = args[2];
      
      if (!aliasName || !siteName) {
        console.error('❌ Usage: netlify-subdomain alias <name> <site-name>');
        return;
      }
      
      config.aliases[aliasName] = siteName;
      saveConfig(config);
      console.log(`✅ Created alias: ${aliasName} → ${siteName}`);
      break;
    }
    
    case 'config': {
      console.log('\nCurrent configuration:\n');
      console.log(`Default domain: ${config.defaultDomain}`);
      console.log('\nAliases:');
      Object.entries(config.aliases).forEach(([alias, site]) => {
        console.log(`  ${alias} → ${site}`);
      });
      console.log(`\nConfig file: ${CONFIG_PATH}`);
      break;
    }
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run netlify-subdomain --help for usage');
  }
}

main().catch(console.error);