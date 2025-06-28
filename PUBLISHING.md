# Publishing netlify-subdomain

## Step 1: Prepare for GitHub

1. Create repository at https://github.com/new
   - Name: `netlify-subdomain`
   - Description: "CLI tool to manage Netlify subdomains without the web UI"
   - Public repository
   - Add README
   - Add MIT license

2. Push your code:
```bash
cd netlify-domain-cli
git init
git add .
git commit -m "Initial release of netlify-subdomain CLI"
git remote add origin https://github.com/YOUR_USERNAME/netlify-subdomain.git
git push -u origin main
```

## Step 2: Publish to npm

1. Create npm account at https://www.npmjs.com/signup (if you don't have one)

2. Login to npm:
```bash
npm login
```

3. Publish:
```bash
npm publish
```

That's it! Your package is now live at https://www.npmjs.com/package/netlify-subdomain

## Step 3: Share with the community

### Places to share:

1. **Netlify Community Forum**
   - https://answers.netlify.com/
   - Post in "Show & Tell" category
   
2. **Twitter/X**
   - Tag @Netlify
   - Use hashtags: #webdev #netlify #opensource

3. **Reddit**
   - r/webdev
   - r/javascript
   - r/netlify

4. **Dev.to**
   - Write a short article about why you built it

### Sample announcement:

"🚀 Just published my first npm package! 

netlify-subdomain - a CLI tool that lets you add/remove Netlify subdomains without leaving the terminal.

Tired of clicking through the Netlify UI? Now you can just:
`netlify-subdomain add blog`

npm: [link]
GitHub: [link]

#webdev #netlify #opensource"

## Maintenance Tips

1. **Versioning**: When you make updates
   - Bug fixes: 1.0.1
   - New features: 1.1.0
   - Breaking changes: 2.0.0

2. **Update and republish**:
```bash
npm version patch  # or minor/major
npm publish
git push --tags
```

3. **Respond to issues**: Check GitHub once a week

4. **Add a CHANGELOG.md** to track versions

## Benefits for you:

- 🎯 "Published npm package" looks great on resume
- 🌟 GitHub contributions graph stays green
- 🤝 Network with other developers
- 📈 Learn from user feedback
- 🏆 Potential to become a popular tool

## Next steps after publishing:

1. Add badges to README (npm version, downloads, license)
2. Set up GitHub Actions for automated testing
3. Create a simple landing page
4. Submit to "Awesome Netlify" lists