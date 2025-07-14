const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');
const { URL } = require('url');

console.log('🚀 Starting comprehensive feed generation...');

let config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  console.log('✅ Config loaded:', config.podcastTitle);
} catch (error) {
  console.error('❌ Error reading config:', error);
  process.exit(1);
}

// Enhanced XML escaping
function escapeXML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '--')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatRFC2822Date(dateString) {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hours > 0 ? 
    `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` :
    `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Enhanced Vimeo Roku feed fetcher
async function fetchVimeoData() {
  return new Promise((resolve, reject) => {
    const url = config.vimeoFeedUrl;
    if (!url) {
      reject(new Error('No Vimeo feed URL configured'));
      return;
    }
    
    console.log('📡 Fetching from Vimeo Roku feed:', url);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const vimeoData = JSON.parse(data);
          
          // The Vimeo Roku feed already has the right structure!
          // Just enhance it with our additional processing
          const episodes = vimeoData.movies?.map(movie => {
            const videoFormats = {};
            
            // Extract all video formats from Roku feed
            if (movie.content?.videos) {
              movie.content.videos.forEach(video => {
                if (video.videoType === 'HLS' || video.url.includes('.m3u8')) {
                  videoFormats.hls = video.url;
                } else if (video.videoType === 'MP4') {
                  const quality = video.quality?.toLowerCase() || 'hd';
                  videoFormats[`mp4_${quality}`] = video.url;
                }
              });
            }
            
            return {
              id: movie.id,
              title: movie.title,
              description: movie.shortDescription || movie.title,
              thumbnail: movie.thumbnail,
              releaseDate: movie.releaseDate,
              duration: movie.content?.duration || 0,
              videoFormats: videoFormats,
              primaryVideoUrl: movie.content?.videos?.[0]?.url,
              quality: movie.content?.videos?.[0]?.quality || 'HD',
              tags: movie.tags || [],
              genres: movie.genres || [],
              // Keep original Roku data for passthrough
              originalRokuData: movie
            };
          }) || [];
          
          console.log(`✅ Processed ${episodes.length} episodes from Vimeo Roku feed`);
          resolve({
            ...vimeoData,
            episodes: episodes
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// File size detection
async function getFileSize(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const requester = urlObj.protocol === 'https:' ? https : require('http');
      
      const request = requester.request(url, { method: 'HEAD' }, (res) => {
        resolve(res.headers['content-length'] || '0');
      });
      
      request.on('error', () => resolve('0'));
      request.setTimeout(8000, () => {
        request.destroy();
        resolve('0');
      });
      
      request.end();
    } catch (error) {
      resolve('0');
    }
  });
}

// Video Podcast RSS Generator
async function generateVideoRSS(vimeoData) {
  if (!config.outputs?.videoPodcast?.enabled) return null;
  
  console.log('📺 Generating video podcast RSS...');
  
  const baseUrl = config.baseUrl || 'https://heritagecoc.github.io/heritage-media-feeds';
  const artworkUrl = config.podcastArtwork?.startsWith('http') ? 
    config.podcastArtwork : `${baseUrl}/${config.podcastArtwork.replace('./', '')}`;
  
  const now = formatRFC2822Date(new Date().toISOString());
  
  let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
  rss += '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">\n';
  rss += '<channel>\n';
  rss += `    <title>${escapeXML(config.podcastTitle)} - Video</title>\n`;
  rss += `    <link>${escapeXML(config.churchWebsite || baseUrl)}</link>\n`;
  rss += `    <description>${escapeXML(config.podcastDescription)} - Full video sermons</description>\n`;
  rss += `    <language>${escapeXML(config.podcastLanguage || 'en')}</language>\n`;
  rss += `    <pubDate>${now}</pubDate>\n`;
  rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
  rss += `    <itunes:author>${escapeXML(config.podcastAuthor)}</itunes:author>\n`;
  rss += `    <itunes:image href="${escapeXML(artworkUrl)}" />\n`;
  rss += `    <itunes:explicit>false</itunes:explicit>\n`;
  
  // Use existing category structure
  if (config.podcastSubcategory) {
    rss += `    <itunes:category text="${escapeXML(config.podcastCategory)}">\n`;
    rss += `        <itunes:category text="${escapeXML(config.podcastSubcategory)}" />\n`;
    rss += `    </itunes:category>\n`;
  } else {
    rss += `    <itunes:category text="${escapeXML(config.podcastCategory || 'Religion & Spirituality')}" />\n`;
  }
  
  const sortedEpisodes = vimeoData.episodes.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  
  for (let i = 0; i < sortedEpisodes.length; i++) {
    const episode = sortedEpisodes[i];
    if (!episode.primaryVideoUrl) continue;
    
    const episodeNumber = sortedEpisodes.length - i;
    const pubDate = formatRFC2822Date(episode.releaseDate);
    const duration = formatDuration(episode.duration);
    const fileSize = await getFileSize(episode.primaryVideoUrl);
    
    rss += '\n    <item>\n';
    rss += `        <title>${escapeXML(episode.title)}</title>\n`;
    rss += `        <description>${escapeXML(episode.description)}</description>\n`;
    rss += `        <guid isPermaLink="false">vimeo-video-${escapeXML(episode.id)}</guid>\n`;
    rss += `        <pubDate>${pubDate}</pubDate>\n`;
    rss += `        <enclosure url="${escapeXML(episode.primaryVideoUrl)}" length="${fileSize}" type="application/x-mpegURL" />\n`;
    rss += `        <itunes:title>${escapeXML(episode.title)}</itunes:title>\n`;
    rss += `        <itunes:duration>${duration}</itunes:duration>\n`;
    rss += `        <itunes:episode>${episodeNumber}</itunes:episode>\n`;
    
    if (episode.thumbnail) {
      rss += `        <itunes:image href="${escapeXML(episode.thumbnail)}" />\n`;
    }
    
    rss += '    </item>';
  }
  
  rss += '\n\n</channel>\n</rss>';
  return rss;
}

// Enhanced Roku feed generator (optimized for existing Roku feed)
async function generateRokuFeed(vimeoData) {
  if (!config.outputs?.roku?.enabled) return null;
  
  console.log('📺 Generating enhanced Roku Direct Publisher feed...');
  
  // Since your Vimeo feed is already Roku-compatible, we can enhance it
  const enhancedRokuFeed = {
    providerName: config.podcastAuthor,
    language: config.podcastLanguage || 'en',
    lastUpdated: new Date().toISOString(),
    movies: []
  };
  
  const sortedEpisodes = vimeoData.episodes.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  
  for (const episode of sortedEpisodes) {
    if (!episode.primaryVideoUrl) continue;
    
    // Use original Roku data as base, then enhance
    const rokuEpisode = {
      ...episode.originalRokuData,
      // Ensure these fields are properly set
      id: episode.id,
      title: episode.title,
      shortDescription: episode.description,
      thumbnail: episode.thumbnail || '',
      releaseDate: episode.releaseDate,
      genres: episode.genres.length > 0 ? episode.genres : ['faith'],
      tags: episode.tags.length > 0 ? episode.tags : ['sermon']
    };
    
    // Ensure content structure is complete
    if (!rokuEpisode.content) {
      rokuEpisode.content = {
        dateAdded: episode.releaseDate,
        captions: [],
        duration: episode.duration,
        videos: []
      };
    }
    
    // Ensure videos array is populated
    if (!rokuEpisode.content.videos || rokuEpisode.content.videos.length === 0) {
      rokuEpisode.content.videos = [];
      
      if (episode.videoFormats.hls) {
        rokuEpisode.content.videos.push({
          url: episode.videoFormats.hls,
          quality: 'HD',
          videoType: 'HLS'
        });
      }
      
      // Add MP4 versions if available
      Object.entries(episode.videoFormats).forEach(([format, url]) => {
        if (format.startsWith('mp4_')) {
          const quality = format.replace('mp4_', '').toUpperCase();
          rokuEpisode.content.videos.push({
            url: url,
            quality: quality,
            videoType: 'MP4'
          });
        }
      });
    }
    
    enhancedRokuFeed.movies.push(rokuEpisode);
  }
  
  return JSON.stringify(enhancedRokuFeed, null, 2);
}

// Phone Quality MP3 Generator
async function generatePhoneQualityMp3(vimeoData) {
  if (!config.outputs?.phoneTree?.enabled) return null;
  
  console.log('📞 Generating phone quality MP3...');
  
  const latestEpisode = vimeoData.episodes
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))[0];
  
  if (!latestEpisode || !latestEpisode.primaryVideoUrl) {
    console.warn('⚠️ No latest episode found for phone MP3');
    return null;
  }
  
  return new Promise((resolve, reject) => {
    console.log(`🎵 Converting "${latestEpisode.title}" to phone quality MP3...`);
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', latestEpisode.primaryVideoUrl,
      '-vn', // No video
      '-acodec', 'mp3',
      '-ar', '22050', // 22kHz sample rate
      '-ab', '64k', // 64kbps bitrate
      '-ac', '1', // Mono
      '-f', 'mp3',
      '-y', // Overwrite
      'latest-sermon-phone.mp3'
    ]);
    
    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Phone quality MP3 generated successfully');
        
        // Create phone tree info file
        const phoneInfo = {
          title: latestEpisode.title,
          date: latestEpisode.releaseDate,
          url: `${config.baseUrl || 'https://heritagecoc.github.io/podcast'}/latest-sermon-phone.mp3`,
          generated: new Date().toISOString()
        };
        
        fs.writeFileSync('phone-tree-info.json', JSON.stringify(phoneInfo, null, 2));
        resolve(phoneInfo);
      } else {
        console.error('❌ FFmpeg failed:', stderr);
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });
    
    ffmpeg.on('error', reject);
  });
}

// Main execution
async function main() {
  try {
    console.log('📡 Fetching Vimeo data...');
    const vimeoData = await fetchVimeoData();
    
    if (!vimeoData.episodes || vimeoData.episodes.length === 0) {
      console.warn('⚠️ No episodes found');
      return;
    }
    
    console.log(`📝 Processing ${vimeoData.episodes.length} episodes...`);
    
    const results = {};
    
    // Generate video podcast RSS
    if (config.outputs?.videoPodcast?.enabled) {
      const videoRSS = await generateVideoRSS(vimeoData);
      if (videoRSS) {
        fs.writeFileSync('feed-video.xml', videoRSS, 'utf8');
        results.videoPodcast = `feed-video.xml (${fs.statSync('feed-video.xml').size} bytes)`;
        console.log('✅ Video podcast RSS generated');
      }
    }
    
    // Generate Roku feed
    if (config.outputs?.roku?.enabled) {
      const rokuFeed = await generateRokuFeed(vimeoData);
      if (rokuFeed) {
        fs.writeFileSync('roku-feed.json', rokuFeed, 'utf8');
        results.roku = `roku-feed.json (${fs.statSync('roku-feed.json').size} bytes)`;
        console.log('✅ Roku feed generated');
      }
    }
    
    // Generate phone quality MP3
    if (config.outputs?.phoneTree?.enabled) {
      try {
        const phoneInfo = await generatePhoneQualityMp3(vimeoData);
        if (phoneInfo) {
          results.phoneTree = `latest-sermon-phone.mp3 (${fs.statSync('latest-sermon-phone.mp3').size} bytes)`;
          console.log('✅ Phone quality MP3 generated');
        }
      } catch (error) {
        console.error('❌ Phone MP3 generation failed:', error);
        results.phoneTree = 'Failed: ' + error.message;
      }
    }
    
    // Create summary
    console.log('\n📊 Generation Summary:');
    Object.entries(results).forEach(([type, result]) => {
      console.log(`   ${type}: ${result}`);
    });
    
    console.log('\n✅ Comprehensive feed generation complete!');
    
  } catch (error) {
    console.error('❌ Error during generation:', error);
    process.exit(1);
  }
}

main();
