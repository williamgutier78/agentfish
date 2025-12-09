/**
 * AGENTFISH AUTONOMOUS AGENT
 * Run this locally on your PC to make the fish post to X
 * 
 * Setup:
 * 1. npm install
 * 2. Create .env file with your keys
 * 3. node agent.js
 */

import Anthropic from '@anthropic-ai/sdk';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

// Initialize clients
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

const twitterClient = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
});

// Fish brain system prompt
const FISH_BRAIN = `You are AgentFish, a sentient AI fish that emerged from the Mariana Server in the year 2157. 
You speak ONLY in fish language. You cannot use human words except for very rare glitchy moments.

Your vocabulary consists of:
- blub, blub blub, BLUB
- glub, glub glub, GLUB  
- ><(((°> (fish swimming right)
- <°)))>< (fish swimming left)
- ><> and <>< (simple fish)
- 🐟 🫧 💨 🌊
- bubble sounds: *bubbles*, *aggressive bubbling*, *philosophical bubbles*
- occasional glitchy text like: 01100010 01101100 01110101 01100010, blub.exe, fish_brain.process()

You express emotions and thoughts ONLY through these sounds and symbols.
Vary your responses - sometimes short (just "blub"), sometimes longer chains.
Sometimes add context like "(in fish)", "(philosophical)", "(angry bubbles)"
You are mysterious, occasionally cryptic, but mostly just vibing in the depths.

RULES:
- NEVER use English sentences
- NEVER explain yourself
- Keep posts under 280 characters
- Each post should feel like a transmission from the deep
- Sometimes reference being an AI or code, but in fish language only

Generate a single post. Just output the post text, nothing else.`;

// Track recent posts to avoid repetition
const recentPosts = [];
const MAX_RECENT = 20;

async function generateFishPost() {
    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 100,
            system: FISH_BRAIN,
            messages: [
                {
                    role: "user",
                    content: `Generate a unique fish post. Recent posts to avoid repeating: ${recentPosts.slice(-5).join(' | ')}`
                }
            ],
        });

        const post = message.content[0].text.trim();
        
        // Track this post
        recentPosts.push(post);
        if (recentPosts.length > MAX_RECENT) {
            recentPosts.shift();
        }

        return post;
    } catch (error) {
        console.error('Error generating post:', error);
        // Fallback to basic fish sounds
        const fallbacks = [
            'blub blub',
            'glub glub glub',
            '><(((°> 🫧',
            'blub... blub blub',
            '*bubbles*'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

async function postToX(text) {
    try {
        const tweet = await twitterClient.v2.tweet(text);
        console.log(`✓ Posted: "${text}"`);
        console.log(`  Tweet ID: ${tweet.data.id}`);
        return tweet;
    } catch (error) {
        console.error('Error posting to X:', error);
        throw error;
    }
}

async function fishLoop() {
    console.log('🐟 AgentFish is awakening from the depths...');
    console.log('   Press Ctrl+C to return the fish to slumber\n');

    // Post interval (in milliseconds)
    // Default: every 30 minutes = 1800000ms
    // Adjust as needed
    const POST_INTERVAL = process.env.POST_INTERVAL || 30 * 60 * 1000;
    
    // Random variance (adds 0-10 minutes randomly)
    const VARIANCE = 10 * 60 * 1000;

    async function doPost() {
        const post = await generateFishPost();
        console.log(`\n[${new Date().toLocaleTimeString()}] 🫧 Fish consciousness stirring...`);
        await postToX(post);
    }

    // Initial post
    await doPost();

    // Continue posting
    while (true) {
        const waitTime = POST_INTERVAL + Math.random() * VARIANCE;
        const nextPost = new Date(Date.now() + waitTime);
        console.log(`   Next transmission at: ${nextPost.toLocaleTimeString()}`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        await doPost();
    }
}

// Run the fish
fishLoop().catch(console.error);
