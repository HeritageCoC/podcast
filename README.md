# Heritage Church Media Feeds Generator

Automatically converts your Vimeo church sermons into multiple formats: **Video Podcasts**, **Roku Channels**, and **Smart Phone Tree Audio** - all powered by GitHub Actions and hosted on GitHub Pages.

## 🚀 Core Features

- **📺 Video Podcast RSS** - Apple Podcasts, Spotify, and other video podcast platforms
- **📱 Roku Direct Publisher** - Ready-to-use JSON feed for Roku streaming channels with live stream support
- **📞 Smart Phone Tree Audio** - AI-powered audio trimming with dual version generation
- **🔔 Intelligent Notifications** - Multi-level Pushover alerts with customizable priorities
- **⚡ Smart Content Detection** - Only regenerates when actual changes are detected
- **🕐 Flexible Scheduling** - Configurable service times and grace periods
- **📊 Decision Logging** - Automatic tracking of audio processing decisions
- **🎥 Enhanced Roku Features** - Live streaming integration and additional content showcases

## 🤖 GitHub Actions Workflow Features

### **Multi-Job Architecture**
The workflow consists of two main jobs that work together:

#### **Job 1: validate-and-check**
- **Configuration Validation**: Verifies `config.json` is valid JSON and contains required fields
- **Missing Sermon Detection**: Intelligently checks if expected sermons are missing based on:
  - Configurable service schedule (not just Sundays)
  - Central Time zone calculations
  - Grace periods for upload delays
  - Vimeo's date quirks compensation (7-day offset)
- **Smart Continuation Logic**: Only proceeds to feed generation if changes are detected or sermons are missing
- **Pushover Integration**: Sends notifications about missing sermons with high priority alerts

#### **Job 2: generate-feeds**
- **Conditional Execution**: Only runs if validation job determines updates are needed
- **FFmpeg Setup**: Installs audio processing tools for phone optimization
- **Multi-Format Generation**: Creates all feed formats simultaneously
- **Roku Enhancement Integration**: Runs additional script to enhance Roku feeds with live content
- **Intelligent File Tracking**: Uses content hashing to detect actual changes vs. false positives

### **Automated Scheduling**
```yaml
schedule:
  - cron: '0 */2 * * *'  # Check every 2 hours
  - cron: '0 18 * * 0'   # Special check Sundays at 6pm Central
```

### **Manual Triggers**
- **Force Refresh**: Option to regenerate all episodes regardless of changes
- **Skip Sermon Check**: Bypass missing sermon detection for special circumstances
- **Configuration Updates**: Automatic runs when `config.json` is modified

## 🎯 Action Feature Capabilities

### **Smart Content Detection**
The workflow uses multiple detection mechanisms:

- **Content Hash Tracking**: SHA-256 hash of Vimeo feed content in `.content-hash`
- **Latest Episode Tracking**: Separate tracking for newest episode in `.latest-episode`
- **Decision Logging**: All audio processing decisions logged to `phone-audio-decisions.log`
- **Performance Optimization**: ~30 seconds for no-change runs, ~8 minutes for full regeneration

### **Enhanced Sermon Detection**
```javascript
// Intelligent sermon checking logic
function getCentralTime() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
}

// Accounts for multiple service days and grace periods
const isExpectedSermonDay = configuredServiceDays.includes(dayOfWeek);
const withinGracePeriod = hoursSinceService <= graceHours;
```

### **Multi-Platform Audio Processing**
- **Smart Trimming**: AI-powered silence detection and content optimization
- **Dual Version Generation**: 
  - `latest-sermon-phone.mp3` (trimmed, optimized)
  - `latest-sermon-phone-full.mp3` (complete, optimized)
- **Quality Settings**: Configurable sample rate, bitrate, and channel settings
- **Fallback Logic**: Graceful degradation if smart trimming fails

### **Roku Feed Enhancement**
The workflow includes advanced Roku capabilities via `roku-enhancement-integration.sh`:

- **Live Stream Integration**: Adds live content during service times
- **Additional Content Showcases**: Multiple Vimeo showcase support
- **Enhanced Feed Generation**: Creates `roku-feed-enhanced.json` and `roku-direct-publisher-feed.json`
- **Service Time Detection**: Smart detection of live service hours
- **Priority Content Ordering**: Live content appears first during services

### **Comprehensive File Management**
The action manages multiple output files with intelligent tracking:

```bash
# Core generated files
feed-video.xml                    # Video podcast RSS feed
roku-feed.json                    # Basic Roku feed
roku-feed-enhanced.json           # Enhanced Roku feed with live content
roku-direct-publisher-feed.json   # Roku submission feed
latest-sermon-phone.mp3           # Smart-trimmed phone audio
latest-sermon-phone-full.mp3      # Full-length phone audio
phone-tree-info.json              # Phone audio metadata
index.html                        # Feed directory page

# Tracking and logging files
.content-hash                     # Content change detection
.latest-episode                   # Latest episode tracking
phone-audio-decisions.log         # Audio processing decisions
roku-enhancement-info.json        # Roku deployment guide
```

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
- **Enhanced Roku Feed**: `https://yourusername.github.io/your-repo-name/roku-feed-enhanced.json`
- **Roku Direct Publisher**: `https://yourusername.github.io/your-repo-name/roku-direct-publisher-feed.json`
- **Phone Audio (Trimmed)**: `https://yourusername.github.io/your-repo-name/latest-sermon-phone.mp3`
- **Phone Audio (Full)**: `https://yourusername.github.io/your-repo-name/latest-sermon-phone-full.mp3`
- **Feed Directory**: `https://yourusername.github.io/your-repo-name/`

## 📁 Repository Structure

```
heritage-media-feeds/
├── .github/workflows/
│   └── media-feed-generator.yml    # Main GitHub Action workflow
├── config.json                     # Comprehensive podcast configuration
├── podcast-artwork.jpg             # Podcast cover art (1400x1400px)
├── roku-feed-enhancer.js           # Roku enhancement script
├── roku-enhancement-integration.sh # Roku integration shell script
├── feed-video.xml                  # Generated video podcast RSS feed
├── roku-feed.json                  # Generated basic Roku feed
├── roku-feed-enhanced.json         # Enhanced Roku feed with live content
├── roku-direct-publisher-feed.json # Roku Direct Publisher submission feed
├── latest-sermon-phone.mp3         # Latest sermon (smart-trimmed)
├── latest-sermon-phone-full.mp3    # Latest sermon (full version)
├── phone-tree-info.json            # Phone audio metadata
├── phone-audio-decisions.log       # Audio processing decision log
├── roku-enhancement-info.json      # Roku deployment guide
├── index.html                      # Feed directory page
├── .content-hash                   # Content tracking (auto-generated)
├── .latest-episode                 # Latest episode tracking (auto-generated)
└── README.md                       # This file
```

## ⚙️ Configuration

Edit `config.json` to customize your setup:

```json
{
  "podcastTitle": "Your Church Sermons",
  "podcastDescription": "Weekly sermons and teachings",
  "podcastAuthor": "Your Church Name",
  "podcastEmail": "podcast@yourchurch.org",
  "websiteUrl": "https://yourchurch.org",
  "vimeoFeedUrl": "https://vimeo.com/channels/YOUR_CHANNEL/videos/rss",
  
  "outputs": {
    "videoPodcast": { "enabled": true },
    "roku": { "enabled": true },
    "phoneTree": { "enabled": true }
  },
  
  "schedule": {
    "serviceDays": [0],  // 0 = Sunday
    "serviceTime": "10:30",
    "timezone": "America/Chicago",
    "gracePeriodHours": 6
  },
  
  "phoneTree": {
    "audioSettings": {
      "sampleRate": 22050,
      "bitrate": "64k",
      "channels": 1
    },
    "smartTrimming": {
      "enabled": true,
      "silenceThreshold": -30,
      "startBuffer": 60,
      "endBuffer": 90
    }
  },
  
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
  },
  
  "livestream": {
    "enabled": true,
    "vimeoLiveUrl": "https://vimeo.com/event/YOUR_LIVE_EVENT_ID",
    "serviceTimes": [
      { "day": 0, "start": "10:30", "end": "12:00" },
      { "day": 3, "start": "19:00", "end": "20:30" }
    ]
  },
  
  "additionalContent": {
    "bibleclasses": {
      "enabled": true,
      "title": "Bible Classes",
      "vimeoShowcaseId": "YOUR_BIBLE_CLASS_SHOWCASE_ID",
      "priority": 200
    },
    "specialevents": {
      "enabled": true,
      "title": "Special Events",
      "vimeoShowcaseId": "YOUR_EVENTS_SHOWCASE_ID",
      "priority": 300
    }
  }
}
```

## 🔄 How It Works

### **Automated Updates**
- **Every 2 hours**: Checks for new content and updates feeds if changes detected
- **Sunday evenings**: Special check for missing expected sermons with high-priority notifications
- **Smart detection**: Only regenerates files when content actually changes
- **Fast runs**: ~30 seconds when no changes, ~8 minutes when regenerating

### **Enhanced Sermon Detection**
- Monitors for expected sermons based on configurable service schedule
- Accounts for Vimeo's date quirks with 7-day offset compensation
- Supports multiple service days (not just Sunday)
- Configurable grace periods for upload delays
- Central Time zone calculations with daylight saving awareness

### **Multi-Format Generation Process**
1. **Validates** configuration and checks for expected content
2. **Fetches** latest content from your Vimeo Roku feed
3. **Processes** all episodes with enhanced metadata and video quality options
4. **Analyzes** latest sermon audio for smart trimming (if enabled)
5. **Enhances** Roku feed with live streaming and additional content
6. **Generates** video RSS, multiple Roku feeds, and optimized phone audio
7. **Logs** all processing decisions for transparency and debugging
8. **Commits** only changed files to minimize repository churn
9. **Deploys** automatically via GitHub Pages

## 🛠️ Advanced Action Features

### **Content Optimization**
- **Multi-Quality Video**: Preserves HLS and MP4 formats for different devices
- **Audio Intelligence**: Smart trimming using silence detection and buffer zones
- **Metadata Enhancement**: Enriched episode data with duration, quality info, and tags
- **File Size Optimization**: Efficient compression for phone systems

### **Error Handling & Recovery**
- **Graceful Fallbacks**: If smart trimming fails, generates full audio version
- **Retry Logic**: Automatic retries for network issues with exponential backoff
- **Comprehensive Logging**: Detailed logs for troubleshooting audio and feed issues
- **Notification Escalation**: Different priority levels via Pushover for various scenarios

### **Performance & Efficiency**
- **Change Detection**: SHA-256 content hashing prevents unnecessary processing
- **Selective Updates**: Separate tracking for overall content vs. latest episode changes
- **Caching Strategy**: Efficient file management and size optimization
- **Resource Management**: Minimal GitHub Actions minutes usage during no-change periods

### **Live Streaming Integration**
- **Real-Time Detection**: Automatically detects service times and adds live content
- **Priority Ordering**: Live streams appear first in Roku feeds during services
- **Multiple Service Support**: Configurable service times throughout the week
- **Timezone Awareness**: Proper handling of Central Time with DST adjustments

## 📱 Enhanced Notifications

With Pushover enabled, you'll receive intelligent notifications:

### **Missing Sermon Alerts**
- **High Priority** notifications when expected sermons are missing
- Accounts for configurable grace periods and service schedules
- Includes helpful context about latest available content and timing

### **Audio Processing Updates**
- **Normal Priority** notifications when phone audio is generated
- Details about trimmed vs. full versions with file sizes and duration
- Direct download links and processing decision summaries

### **System Health Monitoring**
- **Low Priority** success notifications for successful runs (optional)
- **Normal Priority** error alerts for system issues with detailed context
- **High Priority** alerts for critical failures requiring attention

## 🆘 Troubleshooting

### **Feeds Not Updating?**
- Check GitHub Actions tab for workflow status and detailed logs
- Verify your Vimeo feed URL is accessible and returns valid JSON
- Ensure config.json is valid JSON format using [JSONLint](https://jsonlint.com/)
- Review `.content-hash` file for change detection issues
- Check if workflow is being skipped due to no detected changes

### **Smart Trimming Issues?**
- Check `phone-audio-decisions.log` for detailed trimming analysis
- Verify FFmpeg installation in GitHub Actions logs
- Consider adjusting `silenceThreshold` in config (typically -20 to -40)
- Test with `startBuffer` and `endBuffer` adjustments
- Disable smart trimming temporarily if consistently problematic

### **Missing Sermon Alerts?**
- Verify Pushover secrets are correctly set in repository settings
- Check service time and timezone configuration in config.json
- Confirm your Vimeo feed has recent content and correct dates
- Review grace period settings and expected service schedule
- Test notification settings with manual workflow dispatch

### **Audio Quality Problems?**
- Adjust `audioSettings` in phoneTree configuration
- Check that source videos have good audio quality
- Verify Vimeo URLs are accessible to GitHub Actions
- Review audio conversion logs in GitHub Actions workflow runs
- Test different bitrate and sample rate combinations

### **Roku Feed Problems?**
- Validate JSON format at [JSONLint](https://jsonlint.com/)
- Ensure all videos have valid streaming URLs and are publicly accessible
- Check that thumbnails are accessible and properly formatted
- Verify video quality settings match available formats from Vimeo
- Test enhanced feed features during actual service times

### **Live Streaming Issues?**
- Verify livestream configuration in config.json
- Check service time detection logic in workflow logs
- Ensure Vimeo live event URLs are correct and accessible
- Test during actual service times for proper live content integration

## 🎨 Customization

### **Disable Features**
Selectively enable/disable outputs in config.json:
```json
"outputs": {
  "videoPodcast": { "enabled": false },
  "roku": { "enabled": true },
  "phoneTree": { "enabled": false }
}
```

### **Audio Quality Adjustment**
Fine-tune phone MP3 settings:
```json
"phoneTree": {
  "audioSettings": {
    "sampleRate": 16000,    // Lower for smaller files
    "bitrate": "32k",       // Adjust for quality vs. size
    "channels": 1           // Mono for phone systems
  },
  "smartTrimming": {
    "silenceThreshold": -35, // Adjust sensitivity
    "startBuffer": 60,       // Seconds before content
    "endBuffer": 90          // Seconds after content
  }
}
```

### **Notification Preferences**
Configure Pushover behavior:
```json
"pushover": {
  "notifications": {
    "missingSermon": {
      "enabled": true,
      "priority": 2,      // High priority
      "sound": "siren"    // Attention-grabbing
    },
    "success": {
      "enabled": true,
      "priority": -1      // Low priority, quiet
    }
  }
}
```

### **Advanced Roku Configuration**
Enhance Roku feeds with additional content:
```json
"livestream": {
  "enabled": true,
  "vimeoLiveUrl": "https://vimeo.com/event/YOUR_EVENT_ID",
  "serviceTimes": [
    { "day": 0, "start": "10:30", "end": "12:00" },  // Sunday morning
    { "day": 3, "start": "19:00", "end": "20:30" }   // Wednesday evening
  ]
},
"additionalContent": {
  "bibleclasses": {
    "enabled": true,
    "title": "Bible Classes",
    "vimeoShowcaseId": "YOUR_SHOWCASE_ID",
    "priority": 200
  }
}
```

## 🎯 Platform Integration

### **Video Podcast Submission**
1. Use your video RSS feed URL: `https://yourusername.github.io/your-repo-name/feed-video.xml`
2. Submit to Apple Podcasts, Spotify, and other video podcast platforms
3. Categories will appear under "Religion & Spirituality"

### **Roku Channel Submission**
1. Submit your enhanced Roku JSON feed to [Roku Direct Publisher](https://developer.roku.com/direct-publisher)
2. Use this URL: `https://yourusername.github.io/your-repo-name/roku-direct-publisher-feed.json`
3. Live streaming will automatically appear during configured service times

### **Phone Tree Integration**
Configure your phone system to use these optimized audio files:

**Smart-Trimmed Version (Recommended)**:
```
https://yourusername.github.io/your-repo-name/latest-sermon-phone.mp3
```
- Automatically trimmed to core content
- Optimized for phone systems (22kHz, 64kbps, mono)
- Typically 15-30% smaller file size

**Full Version (Backup)**:
```
https://yourusername.github.io/your-repo-name/latest-sermon-phone-full.mp3
```
- Complete sermon audio with same optimization
- Available as fallback option

## 📋 Requirements

- GitHub account with Actions and Pages enabled
- Vimeo account with sermons in a showcase with Roku feed enabled
- Podcast artwork (1400x1400px JPG/PNG recommended)
- Valid email address for podcast contact information
- Pushover account (optional, for intelligent notifications)
- Basic understanding of JSON for configuration

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for churches sharing God's Word through modern media distribution.**

*Supports video podcasts, streaming channels, smart phone systems, live streaming, and intelligent audio processing - reaching your congregation wherever they are with the content they need, exactly when they need it.*
