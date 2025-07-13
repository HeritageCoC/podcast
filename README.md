# Church Podcast RSS Feed Generator

Automatically converts your Vimeo church sermons into an Apple Podcast-compatible RSS feed using GitHub Pages.

## 🚀 Quick Setup

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages** in repository settings (Settings → Pages → Source: Deploy from branch → main)
3. **Add your podcast artwork** as `podcast-artwork.jpg` (1400x1400px recommended)
4. **Configure your settings** by editing `config.json`
5. **Access your feed** at `https://yourusername.github.io/your-repo-name/feed.xml`

## 📁 Repository Structure

```
your-repo/
├── index.html          # Main page that generates the RSS feed
├── config.json         # Your podcast configuration
├── podcast-artwork.jpg # Your podcast cover art (1400x1400px)
├── README.md          # This file
└── feed.xml           # Generated RSS feed (download from the page)
```

## ⚙️ Configuration

Edit `config.json` to customize your podcast:

```json
{
  "vimeoFeedUrl": "your-vimeo-showcase-feed-url",
  "podcastTitle": "Your Church Name Sermons",
  "podcastAuthor": "Your Church Name",
  "podcastEmail": "contact@yourchurch.org",
  "podcastDescription": "Your podcast description",
  "podcastCategory": "Religion & Spirituality",
  "podcastSubcategory": "Christianity",
  "podcastLanguage": "en",
  "churchWebsite": "https://yourchurch.org",
  "podcastArtwork": "./podcast-artwork.jpg"
}
```

## 🎙️ Submitting to Podcast Directories

1. **Get your RSS URL**: `https://yourusername.github.io/your-repo-name/feed.xml`
2. **Apple Podcasts**: Submit via [Apple Podcasts Connect](https://podcastsconnect.apple.com)
3. **Spotify**: Submit via [Spotify for Podcasters](https://podcasters.spotify.com)
4. **Google Podcasts**: Submit via [Google Podcasts Manager](https://podcastsmanager.google.com)

## 🔄 Auto-Updates

The RSS feed automatically updates when:
- New sermons are added to your Vimeo showcase
- Visitors access your GitHub Pages site
- You update the configuration

## 📋 Requirements

- GitHub account with Pages enabled
- Vimeo account with sermons in a showcase
- Podcast artwork (1400x1400px JPG/PNG)
- Valid email address for podcast contact

## 🎨 Customization

You can customize the appearance by editing the CSS in `index.html`. The page is fully responsive and works on all devices.

## 🆘 Troubleshooting

**RSS feed not updating?**
- Check that your Vimeo feed URL is correct
- Ensure your config.json is valid JSON
- Try refreshing the GitHub Pages site

**Podcast directories rejecting feed?**
- Verify your artwork is 1400x1400px
- Check that all required fields in config.json are filled
- Ensure your email address is valid

**Need help?**
- Check GitHub Pages documentation
- Verify your Vimeo showcase is public
- Ensure your repository is public

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for churches sharing God's Word through podcasting.
