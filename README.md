# Heritage Church Media Feeds Generator

Automatically converts your Vimeo church sermons into multiple formats: **Video Podcasts**, **Roku Channels**, and **Smart Phone Tree Audio** - all powered by GitHub Actions and hosted on GitHub Pages.

## 🚀 Features

- **📺 Video Podcast RSS** - Apple Podcasts, Spotify, and other video podcast platforms
- **📱 Roku Direct Publisher** - Ready-to-use JSON feed for Roku streaming channels
- **📞 Smart Phone Tree Audio** - AI-powered audio trimming with dual version generation
- **🔔 Intelligent Notifications** - Multi-level Pushover alerts with customizable priorities
- **⚡ Smart Content Detection** - Only regenerates when actual changes are detected
- **🕐 Flexible Scheduling** - Configurable service times and grace periods
- **📊 Decision Logging** - Automatic tracking of audio processing decisions

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
- **Phone Audio (Trimmed)**: `https://yourusername.github.io/your-repo-name/latest-sermon-phone.mp3`
- **Phone Audio (Full)**: `https://yourusername.github.io/your-repo-name/latest-sermon-phone-full.mp3`
- **Feed Directory**: `https://yourusername.github.io/your-repo-name/`

## 📁 Repository Structure

```
heritage-media-feeds/
├── .github/workflows/
│   └── media-feed-generator.yml    # GitHub Action for feed generation
├── config.json                     # Your comprehensive podcast configuration
├── podcast-artwork.jpg             # Your podcast cover art (1400x1400px)
├── feed-video.xml                  # Generated video podcast RSS feed
├── roku-feed.json                  # Generated Roku Direct Publisher feed
├── latest-sermon-phone.mp3         # Latest sermon (smart-trimmed)
├── latest-sermon-phone-full.mp3    # Latest sermon (full version)
├── phone-tree-info.json            # Phone audio metadata
├── phone-audio-decisions.log       # Audio processing decision log
├── index.html                      # Feed directory page
├── .content-hash                   # Content tracking (auto-generated)
├── .latest-episode                 # Latest episode tracking (auto-generated)
└── README.md                       # This file
```

## ⚙️ Configuration

Edit `config.json` to customize your setup. Here's the complete structure:

### **Basic Configuration**
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
  "explicit": false
}
```

### **Service Schedule Configuration**
```json
{
  "schedule": {
    "serviceTime": "11:00",
    "timezone": "America/Chicago",
    "graceHours": 6,
    "serviceDays": ["sunday"]
  }
}
```

### **Enhanced Pushover Notifications**
```json
{
  "pushover": {
    "enabled": true,
    "notifications": {
      "missingSermon": {
        "enabled": true,
        "priority": 1,
        "sound": "falling"
      },
      "errors": {
        "enabled": true,
        "priority": 0,
        "sound": "pushover"
      },
      "success": {
        "enabled": false,
        "priority": -1
      }
    }
  }
}
```

### **Output Configuration**
```json
{
  "outputs": {
    "videoPodcast": {
      "enabled": true,
      "filename": "feed-video.xml",
      "title": "Heritage Church - Video Sermons",
      "description": "Full video sermons from Heritage Church of Christ",
      "maxEpisodes": 50
    },
    "roku": {
      "enabled": true,
      "filename": "roku-feed.json",
      "maxEpisodes": 100,
      "categories": ["faith", "sermon", "church"],
      "contentRating": "G",
      "videoQuality": {
        "preferred": "HD",
        "fallback": "SD"
      }
    },
    "phoneTree": {
      "enabled": true,
      "filename": "latest-sermon-phone.mp3",
      "smartTrimming": {
        "enabled": true,
        "generateBothVersions": true,
        "silenceThreshold": -30,
        "minServiceLength": 45,
        "maxServiceLength": 90,
        "startBuffer": 30,
        "endBuffer": 60
      },
      "audioSettings": {
        "sampleRate": 22050,
        "bitrate": "64k",
        "channels": 1,
        "format": "mp3"
      },
      "maxSizeMB": 15,
      "infoFile": "phone-tree-info.json",
      "logFile": "phone-audio-decisions.log"
    }
  }
}
```

### **Advanced Configuration**
```json
{
  "platformConfigs": {
    "vimeo": {
      "enabled": true,
      "apiKey": null,
      "quality": "HD",
      "preferHLS": true
    }
  },
  
  "accessibility": {
    "transcriptsAvailable": false,
    "closedCaptionsEnabled": false,
    "chaptersEnabled": false,
    "audioDescriptionAvailable": false
  },
  
  "seo": {
    "enableSitemap": true,
    "metaDescription": "Listen to inspiring sermons from Heritage Church of Christ",
    "keywords": ["sermon", "church", "christian", "faith", "bible", "heritage"],
    "structuredData": true,
    "socialMedia": {
      "twitter": "@heritagecoc",
      "facebook": "heritagecoc"
    }
  },
  
  "advanced": {
    "caching": {
      "enabled": true,
      "duration": 3600
    },
    "errorHandling": {
      "retryAttempts": 3,
      "fallbackToSample": true,
      "notifyOnError": true
    },
    "performance": {
      "maxConcurrentRequests": 5,
      "requestTimeout": 30000,
      "enableGzip": true
    }
  }
}
```

## 🎙️ Smart Audio Trimming

### **How It Works**
The system uses advanced audio analysis to automatically trim sermons for phone systems:

1. **Silence Detection** - Analyzes audio for silence patterns using configurable thresholds
2. **Service Boundary Detection** - Identifies likely start/end points of the actual service
3. **Conservative Trimming** - Applies buffers to ensure important content isn't lost
4. **Dual Generation** - Creates both trimmed and full versions for flexibility

### **Trimming Configuration**
- **silenceThreshold**: Audio level considered "silence" (default: -30dB)
- **minServiceLength**: Minimum expected service length in minutes (default: 45)
- **maxServiceLength**: Maximum expected service length in minutes (default: 90)
- **startBuffer**: Seconds to include before detected service start (default: 30)
- **endBuffer**: Seconds to include after detected service end (default: 60)
- **generateBothVersions**: Create both trimmed and full audio files (default: true)

### **Decision Logging**
All trimming decisions are logged to `phone-audio-decisions.log` with:
- Timestamp and action taken
- Sermon title and date
- Original and trimmed durations
- File sizes for both versions
- Whether smart trimming was successfully applied

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
The system generates two phone-optimized versions:

**Trimmed Version (Default)**:
```
https://yourusername.github.io/your-repo-name/latest-sermon-phone.mp3
```
- Automatically trimmed to service content
- Optimized for phone systems (22kHz, 64kbps, mono)
- Typically 15-30% smaller file size

**Full Version (Backup)**:
```
https://yourusername.github.io/your-repo-name/latest-sermon-phone-full.mp3
```
- Complete sermon audio
- Same phone optimization settings
- Available as fallback option

## 🔄 How It Works

### **Automatic Updates**
- **Every 2 hours**: Checks for new content and updates feeds if changes detected
- **Sunday evenings**: Special check for missing expected sermons
- **Smart detection**: Only regenerates files when content actually changes
- **Fast runs**: ~30 seconds when no changes, ~8 minutes when regenerating

### **Enhanced Sermon Detection**
- Monitors for expected sermons based on configurable service schedule
- Accounts for Vimeo's date quirks with 7-day offset compensation
- Supports multiple service days (not just Sunday)
- Configurable grace periods for upload delays

### **Multi-Format Generation**
1. **Fetches** latest content from your Vimeo Roku feed
2. **Processes** all episodes with enhanced metadata
3. **Analyzes** latest sermon audio for smart trimming (if enabled)
4. **Generates** video RSS, Roku JSON, and optimized phone audio
5. **Logs** all processing decisions for transparency
6. **Commits** only changed files to your repository
7. **Deploys** automatically via GitHub Pages

## 🛠️ Advanced Features

### **Content Optimization**
- Preserves multiple video quality options for Roku
- Creates phone-optimized audio with intelligent trimming
- Handles HLS and MP4 video formats automatically
- Maintains episode ordering and enhanced metadata

### **Error Handling & Recovery**
- Graceful fallback if smart trimming fails (generates full audio)
- Automatic retry logic for network issues
- Comprehensive logging for troubleshooting
- Multiple notification levels via Pushover

### **Performance & Efficiency**
- Intelligent change detection prevents unnecessary processing
- Separate tracking for overall content vs. latest episode changes
- Efficient caching and file size optimization
- Minimal resource usage during no-change periods

## 📱 Enhanced Notifications

With Pushover enabled, you'll receive smart notifications:

### **Missing Sermon Alerts**
- **High Priority** notifications when expected sermons are missing
- Accounts for configurable grace periods
- Includes helpful context about latest available content

### **Audio Processing Updates**
- **Normal Priority** notifications when phone audio is generated
- Details about trimmed vs. full versions
- File sizes and duration information
- Direct download links

### **System Health**
- **Low Priority** success notifications (optional)
- **Normal Priority** error alerts for system issues
- Detailed error context for troubleshooting

## 🆘 Troubleshooting

### **Feeds Not Updating?**
- Check GitHub Actions tab for workflow status
- Verify your Vimeo feed URL is accessible
- Ensure config.json is valid JSON format
- Review `.content-hash` file for change detection issues

### **Smart Trimming Issues?**
- Check `phone-audio-decisions.log` for trimming details
- Verify FFmpeg installation in GitHub Actions logs
- Consider adjusting `silenceThreshold` in config
- Disable smart trimming if consistently problematic

### **Missing Sermon Alerts?**
- Verify Pushover secrets are correctly set
- Check service time and timezone in config
- Confirm your Vimeo feed has recent content
- Review grace period settings

### **Audio Quality Problems?**
- Adjust `audioSettings` in phoneTree configuration
- Check that source videos have good audio quality
- Verify Vimeo URLs are accessible to GitHub Actions
- Review audio conversion logs in GitHub Actions

### **Roku Feed Problems?**
- Validate JSON format at [JSONLint](https://jsonlint.com/)
- Ensure all videos have valid streaming URLs
- Check that thumbnails are accessible
- Verify video quality settings match available formats

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

### **Audio Quality Adjustment**
Customize phone MP3 settings:
```json
"phoneTree": {
  "audioSettings": {
    "sampleRate": 16000,
    "bitrate": "32k",
    "channels": 1
  },
  "smartTrimming": {
    "silenceThreshold": -35,
    "startBuffer": 60,
    "endBuffer": 90
  }
}
```

### **Notification Preferences**
Configure Pushover notification behavior:
```json
"pushover": {
  "notifications": {
    "missingSermon": {
      "enabled": true,
      "priority": 2,
      "sound": "siren"
    },
    "success": {
      "enabled": true,
      "priority": -1
    }
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

*Supports video podcasts, streaming channels, smart phone systems, and intelligent audio processing - reaching your congregation wherever they are with the content they need.*
