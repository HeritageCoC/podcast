#!/usr/bin/env node

/**
 * Roku Feed Enhancer for Heritage Church
 * 
 * This script ENHANCES your existing roku-feed.json by adding:
 * - Live streaming capabilities
 * - Dynamic content prioritization  
 * - Special events and series
 * - Better Roku Direct Publisher compatibility
 * 
 * It reads your existing roku-feed.json and creates an enhanced version
 * without modifying your current media generation workflow.
 */

const fs = require('fs');
const https = require('https');

/**
 * Load and extend configuration from existing config.json
 */
function loadEnhancedConfig() {
  let baseConfig;
  
  try {
    // Load your existing config.json
    const configData = fs.readFileSync('config.json', 'utf8');
    baseConfig = JSON.parse(configData);
    console.log('✅ Loaded existing config.json');
  } catch (error) {
    console.error('❌ Could not load config.json:', error.message);
    process.exit(1);
  }

  // Extend with Roku enhancement configuration
  const enhancementConfig = {
    // Use existing config values where possible
    church: {
      name: baseConfig.podcastTitle || "Heritage Church of Christ",
      website: baseConfig.churchWebsite || "https://heritagecoc.org",
      description: baseConfig.podcastDescription || "Weekly sermons and teachings",
      logo: baseConfig.podcastArtwork?.startsWith('http') ? 
            baseConfig.podcastArtwork : 
            `${baseConfig.baseUrl}/${baseConfig.podcastArtwork.replace('./', '')}`,
      email: baseConfig.podcastEmail || "office@heritagecoc.org"
    },

    // Live streaming configuration (extend existing schedule)
    livestream: {
      enabled: baseConfig.livestream?.enabled || true,
      vimeoLiveUrl: baseConfig.livestream?.vimeoLiveUrl || "YOUR_VIMEO_LIVESTREAM_URL_HERE",
      
      // Use existing schedule configuration
      services: baseConfig.livestream?.services || [
        {
          day: "sunday",
          startTime: baseConfig.schedule?.serviceTime || "09:00",
          endTime: "11:00", 
          timezone: baseConfig.schedule?.timezone || "America/Chicago",
          title: "Sunday Morning Worship",
          description: "Join us live for worship, prayer, and biblical teaching"
        }
      ]
    },

    // Additional content sources (check for existing roku config)
    additionalContent: baseConfig.rokuEnhancement?.additionalContent || {
      // "60 Seconds of Power" series
      sixtySeconds: {
        enabled: true,
        vimeoShowcaseId: baseConfig.rokuEnhancement?.sixtySecondsShowcaseId || "YOUR_60_SECONDS_SHOWCASE_ID",
        title: "60 Seconds of Power",
        description: "Quick daily inspirational messages",
        priority: 10
      },
      
      // Special teaching series
      specialSeries: {
        enabled: true, 
        vimeoShowcaseId: baseConfig.rokuEnhancement?.specialSeriesShowcaseId || "YOUR_SPECIAL_SERIES_SHOWCASE_ID",
        title: "Teaching Series", 
        description: "Special sermon series and extended teachings",
        priority: 5
      },
      
      // Bible study content
      bibleStudy: {
        enabled: true,
        vimeoShowcaseId: baseConfig.rokuEnhancement?.bibleStudyShowcaseId || "YOUR_BIBLE_STUDY_SHOWCASE_ID",
        title: "Bible Study",
        description: "Wednesday evening Bible studies",
        priority: 8
      }
    },

    // Roku channel settings (use existing values)
    roku: {
      providerName: baseConfig.podcastAuthor || "Heritage Church of Christ",
      enhancedTitle: `${baseConfig.podcastTitle} - Complete Media Library`,
      enhancedDescription: `${baseConfig.podcastDescription} - Now with live streaming and additional content.`
    },

    // Keep reference to original config
    baseConfig: baseConfig
  };

  return enhancementConfig;
}

class RokuFeedEnhancer {
  constructor() {
    this.config = loadEnhancedConfig(); // Load from config.json
    this.baseRokuFeed = null;
    this.generatedTime = new Date();
  }

  /**
   * Main method to enhance existing Roku feed
   */
  async enhanceRokuFeed() {
    console.log('🚀 Enhancing existing Roku feed...');
    
    try {
      // Load your existing roku-feed.json
      this.baseRokuFeed = this.loadExistingRokuFeed();
      console.log(`📚 Loaded ${this.baseRokuFeed.movies?.length || 0} existing sermons`);
      
      // Enhance with live streaming and additional content
      const enhancedFeed = await this.buildEnhancedFeed();
      
      // Save enhanced feed
      this.saveEnhancedFeed(enhancedFeed);
      
      // Generate deployment info
      this.generateDeploymentInfo(enhancedFeed);
      
      console.log('✅ Roku feed enhancement complete!');
      return enhancedFeed;
      
    } catch (error) {
      console.error('❌ Error enhancing Roku feed:', error);
      throw error;
    }
  }

  /**
   * Load existing roku-feed.json created by your media generator
   */
  loadExistingRokuFeed() {
    console.log('📖 Loading existing roku-feed.json...');
    
    try {
      if (!fs.existsSync('roku-feed.json')) {
        throw new Error('roku-feed.json not found. Please run your media generator first.');
      }
      
      const feedData = fs.readFileSync('roku-feed.json', 'utf8');
      const feed = JSON.parse(feedData);
      
      if (!feed.movies || !Array.isArray(feed.movies)) {
        throw new Error('Invalid roku-feed.json format');
      }
      
      console.log(`✅ Successfully loaded existing feed with ${feed.movies.length} movies`);
      return feed;
      
    } catch (error) {
      throw new Error(`Failed to load existing roku-feed.json: ${error.message}`);
    }
  }

  /**
   * Check if we're currently in a live service window
   */
  isCurrentlyLiveTime() {
    const centralTime = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});
    const now = new Date(centralTime);
    
    return this.config.livestream.services.some(service => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = dayNames[now.getDay()];
      
      if (currentDay !== service.day) return false;
      
      const [startHour, startMin] = service.startTime.split(':').map(Number);
      const [endHour, endMin] = service.endTime.split(':').map(Number);
      
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
  }

  /**
   * Create live stream entry
   */
  createLiveStreamEntry() {
    const activeService = this.config.livestream.services.find(service => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = dayNames[new Date().getDay()];
      return currentDay === service.day;
    });

    if (!activeService) return null;

    return {
      id: `live-heritage-${Date.now()}`,
      title: `🔴 LIVE: ${activeService.title}`,
      shortDescription: activeService.description,
      longDescription: `${activeService.description}. Broadcasting live from Heritage Church of Christ.`,
      thumbnail: "https://heritagecoc.github.io/podcast/podcast-artwork.jpg",
      releaseDate: new Date().toISOString(),
      genres: ["live", "worship", "faith"],
      tags: ["live", "worship", "church", "heritage"],
      content: {
        dateAdded: new Date().toISOString(),
        captions: [],
        duration: 7200, // 2 hours
        videos: [
          {
            url: this.config.livestream.vimeoLiveUrl,
            quality: "HD",
            videoType: "HLS"
          }
        ]
      },
      isLive: true,
      priority: 1000
    };
  }

  /**
   * Fetch additional content from configured Vimeo showcases
   */
  async fetchAdditionalContent() {
    const additionalMovies = [];
    
    for (const [key, contentConfig] of Object.entries(this.config.additionalContent)) {
      if (!contentConfig.enabled || !contentConfig.vimeoShowcaseId || 
          contentConfig.vimeoShowcaseId.includes('YOUR_')) {
        console.log(`⏭️ Skipping ${contentConfig.title} (not configured)`);
        continue;
      }

      try {
        console.log(`🎬 Fetching ${contentConfig.title}...`);
        
        // Build Vimeo Roku feed URL (you'll need the proper token)
        const showcaseUrl = `https://vimeo.com/showcase/${contentConfig.vimeoShowcaseId}/feed/roku/YOUR_ROKU_TOKEN`;
        const showcaseData = await this.fetchVimeoData(showcaseUrl);
        
        if (showcaseData.movies && showcaseData.movies.length > 0) {
          // Process and tag the movies
          const processedMovies = showcaseData.movies.map(movie => ({
            ...movie,
            title: `[${contentConfig.title}] ${movie.title}`,
            genres: [...(movie.genres || []), key],
            tags: [...(movie.tags || []), key, contentConfig.title.toLowerCase()],
            priority: contentConfig.priority || 100,
            category: key
          }));
          
          additionalMovies.push(...processedMovies);
          console.log(`✅ Added ${processedMovies.length} videos from ${contentConfig.title}`);
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${contentConfig.title}: ${error.message}`);
      }
    }
    
    return additionalMovies;
  }

  /**
   * Fetch data from Vimeo Roku feed
   */
  async fetchVimeoData(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Build the enhanced Roku feed
   */
  async buildEnhancedFeed() {
    console.log('🏗️ Building enhanced Roku feed...');
    
    const allMovies = [];
    const isLiveTime = this.isCurrentlyLiveTime();
    
    // Add live content if currently broadcasting
    if (isLiveTime && this.config.livestream.enabled) {
      console.log('🔴 Adding live stream content');
      const liveEntry = this.createLiveStreamEntry();
      if (liveEntry) {
        allMovies.push(liveEntry);
      }
    }

    // Add enhanced latest sermon highlight (from your existing feed)
    if (!isLiveTime && this.baseRokuFeed.movies.length > 0) {
      const latestSermon = this.baseRokuFeed.movies
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))[0];
      
      const highlightedLatest = {
        ...latestSermon,
        title: `🆕 Latest: ${latestSermon.title}`,
        priority: 900
      };
      
      allMovies.push(highlightedLatest);
      console.log('🆕 Added latest sermon highlight');
    }

    // Add all existing sermons from your roku-feed.json
    const existingSermons = this.baseRokuFeed.movies.map(movie => ({
      ...movie,
      priority: 500,
      category: "main-sermons"
    }));
    
    allMovies.push(...existingSermons);
    console.log(`📚 Added ${existingSermons.length} existing sermons`);

    // Fetch and add additional content categories
    const additionalContent = await this.fetchAdditionalContent();
    allMovies.push(...additionalContent);

    // Sort by priority, then by date
    allMovies.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    });

    // Build enhanced feed using your existing feed as base
    const enhancedFeed = {
      ...this.baseRokuFeed, // Keep existing metadata
      
      // Enhanced metadata
      providerName: this.config.roku.providerName,
      lastUpdated: this.generatedTime.toISOString(),
      movies: allMovies,
      
      // Additional enhancement info
      version: "2.1-enhanced",
      enhancedBy: "Heritage Church Enhanced Roku System",
      baseGenerated: this.baseRokuFeed.lastUpdated || "unknown",
      enhancedGenerated: this.generatedTime.toISOString(),
      
      contentSummary: {
        totalMovies: allMovies.length,
        liveContent: allMovies.filter(m => m.isLive).length,
        mainSermons: existingSermons.length,
        additionalContent: additionalContent.length,
        isLiveServiceTime: isLiveTime
      }
    };

    console.log(`✅ Enhanced feed created with ${allMovies.length} total movies`);
    console.log(`   - Base sermons: ${existingSermons.length}`);
    console.log(`   - Additional content: ${additionalContent.length}`);
    console.log(`   - Live content: ${enhancedFeed.contentSummary.liveContent}`);

    return enhancedFeed;
  }

  /**
   * Save the enhanced feed
   */
  saveEnhancedFeed(enhancedFeed) {
    // Save as separate file to avoid conflicts
    const filename = 'roku-feed-enhanced.json';
    fs.writeFileSync(filename, JSON.stringify(enhancedFeed, null, 2));
    console.log(`💾 Enhanced Roku feed saved to ${filename}`);
    
    // Also update a "latest" version for easy Roku submission
    fs.writeFileSync('roku-direct-publisher-feed.json', JSON.stringify(enhancedFeed, null, 2));
    console.log(`💾 Roku Direct Publisher feed saved to roku-direct-publisher-feed.json`);
  }

  /**
   * Generate deployment information
   */
  generateDeploymentInfo(enhancedFeed) {
    const deploymentInfo = {
      generated: this.generatedTime.toISOString(),
      baseRokuFeed: "roku-feed.json (from your existing media generator)",
      enhancedRokuFeed: "roku-feed-enhanced.json (this enhancement)",
      rokuDirectPublisherFeed: "roku-direct-publisher-feed.json (submit this to Roku)",
      
      feedUrls: {
        original: "https://heritagecoc.github.io/podcast/roku-feed.json",
        enhanced: "https://heritagecoc.github.io/podcast/roku-feed-enhanced.json",
        directPublisher: "https://heritagecoc.github.io/podcast/roku-direct-publisher-feed.json"
      },
      
      contentSummary: enhancedFeed.contentSummary,
      
      nextSteps: [
        "1. Configure your Vimeo showcase IDs in this script",
        "2. Set up your livestream URL", 
        "3. Test the enhanced feed during service hours",
        "4. Submit roku-direct-publisher-feed.json URL to Roku Direct Publisher",
        "5. Keep running your existing media generator - this enhances it!"
      ],
      
      configuration: {
        livestreamConfigured: !this.config.livestream.vimeoLiveUrl.includes('YOUR_'),
        additionalContentConfigured: Object.values(this.config.additionalContent)
          .filter(c => c.enabled && !c.vimeoShowcaseId.includes('YOUR_')).length
      }
    };

    fs.writeFileSync('roku-enhancement-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('📋 Deployment information saved to roku-enhancement-info.json');
  }
}

// Main execution
async function main() {
  try {
    const enhancer = new RokuFeedEnhancer();
    const enhancedFeed = await enhancer.enhanceRokuFeed();
    
    console.log('\n🎉 Roku Feed Enhancement Complete!');
    console.log(`📺 Enhanced feed: ${enhancedFeed.movies.length} total movies`);
    console.log(`🔴 Live service time: ${enhancedFeed.contentSummary.isLiveServiceTime ? 'YES' : 'NO'}`);
    console.log('\n📋 Files created:');
    console.log('  ✓ roku-feed-enhanced.json - Enhanced version of your feed');
    console.log('  ✓ roku-direct-publisher-feed.json - Submit this URL to Roku');
    console.log('  ✓ roku-enhancement-info.json - Deployment guide and info');
    console.log('\n🎯 Roku Direct Publisher URL:');
    console.log('  https://heritagecoc.github.io/podcast/roku-direct-publisher-feed.json');
    console.log('\n📖 See roku-enhancement-info.json for detailed setup instructions');
    
  } catch (error) {
    console.error('\n❌ Enhancement failed:', error.message);
    
    if (error.message.includes('roku-feed.json not found')) {
      console.log('\n💡 Solution: Run your existing media generator first:');
      console.log('   This script enhances your existing roku-feed.json');
      console.log('   Make sure your GitHub action has generated that file first.');
    }
    
    process.exit(1);
  }
}

// Export for integration
module.exports = { RokuFeedEnhancer };

// Run if called directly
if (require.main === module) {
  main();
}
