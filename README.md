# Heritage Church Media Feeds Generator

Automatically converts your Vimeo church sermons into multiple formats: **Video Podcasts**, **Roku Channels**, and **Phone Tree Audio** - all powered by GitHub Actions and hosted on GitHub Pages.

## 🚀 Features

- **📺 Video Podcast RSS** - Apple Podcasts, Spotify, and other video podcast platforms
- **📱 Roku Direct Publisher** - Ready-to-use JSON feed for Roku streaming channels
- **📞 Phone Tree Audio** - Compressed MP3 for phone systems (auto-generated from latest sermon)
- **🔔 Smart Notifications** - Pushover alerts when expected sermons are missing
- **⚡ Intelligent Updates** - Only regenerates content when changes are detected
- **🕐 Automatic Scheduling** - Runs every 2 hours with special Sunday evening checks

## 🚀 Quick Setup

### 1. **Fork & Configure Repository**
1. Fork this repository to your GitHub account
2. Enable GitHub Pages in repository settings (Settings → Pages → Source: Deploy from branch → main)
3. Add your podcast artwork as `podcast-artwork.jpg` (1400x1400px recommended)

### 2. **Configure Pushover Notifications** (Optional)
1. Sign up at [Pushover.net](https://pushover.net) and create an app
2. Add repository secrets in Settings → Secrets and variables → Actions:
   - `PUSHOVER_USER_KEY` - Your Pushover user key
   - `PUSHOVER_APP_TOKEN` - Your app token

### 3. **Update Configuration**
Edit `config.json` with your church details (see Configuration section below)

### 4. **Access Your Feeds**
- **Video Podcast**: `https://yourusername.github.io/your-repo-name/feed-video.xml`
- **Roku Feed**: `https://yourusername.github.io/your-repo-name/roku-feed.json`  
- **Phone Audio**: `https://yourusername.github.io/your-repo-name/latest-sermon-phone.mp3`
- **Feed Directory**: `https://yourusername.github.io/your-repo-name/`

## 📁 Repository Structure

```
heritage-media-feeds/
├── .github/workflows/
│   └── media-feed-generator.yml    # GitHub Action for feed generation
├── config.json                     # Your podcast configuration
├── podcast-artwork.jpg             # Your podcast cover art (1400x1400px)
├── feed-video.xml                  # Generated video podcast RSS feed
├── roku-feed.json                  # Generated Roku Direct Publisher feed
├── latest-sermon-phone.mp3         # Latest sermon in phone quality
├── phone-tree-info.json            # Phone audio metadata
├── index.html                      # Feed directory page
├── .content-hash                   # Content tracking (auto-generated)
├── .latest-episode                 # Latest episode tracking (auto-generated)
└── README.md                       # This file
```

## ⚙️ Configuration

Edit `config.json` to customize your setup:

```json
{
  "vimeoFeedUrl": "https://vimeo.com/showcase/XXXXXX/feed/roku/XXXXXXXX",
  "podcastTitle": "Your Church Name",
  "podcastAuthor": "Your Church Name",
  "podcastEmail": "office@yourchurch.org",
  "podcastDescription": "Weekly sermons and teachings from Your Church Name...",
  "podcastCategory": "Religion & Spirituality",
  "podcastSubcategory": "Christianity",
  "podcastLanguage": "en",
  "churchWebsite": "https://yourchurch.org",
  "baseUrl": "https://yourusername.github.io/your-repo-name",
  "podcastArtwork": "./podcast-artwork.jpg",
  
  "schedule": {
    "serviceTime": "11:00",
    "timezone": "America/Chicago",
    "graceHours": 6
  },
  
  "pushover": {
    "enabled": true
  },
  
  "outputs": {
    "videoPodcast": { "enabled": true },
    "roku": { "enabled": true },
    "phoneTree": { "enabled": true }
  }
}
```

### Key Configuration Options:

- **vimeoFeedUrl**: Your Vimeo showcase Roku feed URL
- **schedule**: Service time and timezone for missing sermon detection
- **outputs**: Enable/disable specific feed types
- **pushover**: Enable notifications for missing sermons

## 🎙️ Platform Integration

### **Video Podcasts**
Submit your video RSS feed to:
- **Apple Podcasts**: [Apple Podcasts Connect](https://podcastsconnect.apple.com)
- **Spotify**: [Spotify for Podcasters](https://podcasters.spotify.com)
- **Google Podcasts**: [Google Podcasts Manager](https://podcastsmanager.google.com)

### **Roku Channel**
1. Submit your Roku JSON feed to [Roku Direct Publisher](https://developer.roku.com/direct-publisher)
2. Use your `roku-feed.json` URL as the feed source
3. Categories will appear under "Religion & Spirituality"

### **Phone Tree Integration**
Use the phone MP3 URL in your phone tree system:
```
https://yourusername.github.io/your-repo-name/latest-sermon-phone.mp3
```

The phone audio is automatically optimized (22kHz, 64kbps, mono) for phone systems.

## 🔄 How It Works

### **Automatic Updates**
- **Every 2 hours**: Checks for new content and updates feeds if changes detected
- **Sunday evenings**: Special check for missing expected sermons
- **Smart detection**: Only regenerates files when content actually changes
- **Fast runs**: ~30 seconds when no changes, ~8 minutes when regenerating

### **Missing Sermon Detection**
- Monitors for expected sermons based on your service schedule
- Accounts for Vimeo's date quirks (7-day offset compensation)
- Sends Pushover notifications if sermons are missing after grace period
- Stops feed generation if expected content is missing

### **Multi-Format Generation**
1. **Fetches** latest content from your Vimeo Roku feed
2. **Processes** all episodes with enhanced metadata
3. **Generates** video RSS, Roku JSON, and phone MP3 (if needed)
4. **Commits** only changed files to your repository
5. **Deploys** automatically via GitHub Pages

## 🛠️ Advanced Features

### **Content Optimization**
- Preserves multiple video quality options for Roku
- Creates phone-optimized audio (small file size, good quality)
- Handles HLS and MP4 video formats
- Maintains episode ordering and metadata

### **Error Handling**
- Graceful fallback if video conversion fails
- Retry logic for network issues
- Detailed logging for troubleshooting
- Pushover notifications for system errors

### **Performance**
- Intelligent change detection prevents unnecessary processing
- Separate tracking for overall content vs. latest episode
- Efficient caching and file size optimization
- Minimal resource usage during no-change periods

## 📱 Notifications

With Pushover enabled, you'll receive notifications for:
- **Missing sermons** when expected after service time
- **System errors** if feed generation fails
- **High priority alerts** for urgent issues

## 🆘 Troubleshooting

### **Feeds Not Updating?**
- Check GitHub Actions tab for workflow status
- Verify your Vimeo feed URL is accessible
- Ensure config.json is valid JSON format

### **Missing Sermon Alerts?**
- Verify Pushover secrets are correctly set
- Check service time and timezone in config
- Confirm your Vimeo feed has recent content

### **Phone Audio Issues?**
- Large videos may timeout during conversion
- Check that FFmpeg installation succeeded in workflow
- Verify Vimeo URLs are accessible to GitHub Actions

### **Roku Feed Problems?**
- Validate JSON format at [JSONLint](https://jsonlint.com/)
- Ensure all videos have valid streaming URLs
- Check that thumbnails are accessible

### **Need Help?**
- Review GitHub Actions logs for detailed error messages
- Check your Vimeo showcase is public and accessible
- Ensure repository has write permissions for Actions

## 🎨 Customization

### **Disable Features**
Set `enabled: false` in config.json for unwanted outputs:
```json
"outputs": {
  "videoPodcast": { "enabled": false },
  "roku": { "enabled": true },
  "phoneTree": { "enabled": false }
}
```

### **Audio Quality**
Adjust phone MP3 settings in config:
```json
"phoneTree": {
  "audioSettings": {
    "bitrate": "32k",
    "sampleRate": 16000
  }
}
```

## 📋 Requirements

- GitHub account with Actions and Pages enabled
- Vimeo account with sermons in a showcase with Roku feed enabled
- Podcast artwork (1400x1400px JPG/PNG)
- Valid email address for podcast contact
- Pushover account (optional, for notifications)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for churches sharing God's Word through modern media distribution.**

*Supports video podcasts, streaming channels, and traditional phone systems - reaching your congregation wherever they are.*
