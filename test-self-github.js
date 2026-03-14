#!/usr/bin/env node

const AIEnablementAssessment = require('./dist/index.js');

async function testSelfWithGitHub() {
  console.log('🔍 Running AI Enablement Assessment with GitHub integration...\n');
  
  try {
    // Test with GitHub URL (token optional for basic analysis)
    const assessment = new AIEnablementAssessment({
      repoPath: process.cwd(),
      githubUrl: 'https://github.com/Ankh-Studio/copilot-enablement-adr',
      githubToken: process.env.GITHUB_TOKEN // Optional
    });

    console.log('📊 Starting analysis with GitHub integration...');
    const result = await assessment.analyze();
    
    console.log('\n🎯 ANALYSIS RESULTS:');
    console.log('==================');
    
    console.log('\n📋 Repository:', result.repository);
    console.log('📅 Timestamp:', new Date(result.timestamp).toLocaleString());
    
    console.log('\n🔧 Tech Stack:');
    console.log('Summary:', result.techStack.summary);
    console.log('Confidence:', result.techStack.confidence);
    
    if (result.techStack.detected) {
      const techs = result.techStack.detected.techs?.slice(0, 10) || [];
      console.log('Top Technologies:', techs.join(', '));
      
      const languages = result.techStack.detected.languages || {};
      console.log('Languages:', Object.keys(languages).join(', '));
    }
    
    console.log('\n🛡️ GitHub Security:');
    console.log('Available:', result.githubSecurity.available);
    if (result.githubSecurity.available) {
      console.log('CodeQL:', result.githubSecurity.codeql?.enabled ? 'Enabled' : 'Disabled');
      console.log('Dependabot:', result.githubSecurity.dependabot?.enabled ? 'Enabled' : 'Disabled');
      console.log('Secret Scanning:', result.githubSecurity.secretScanning?.enabled ? 'Enabled' : 'Disabled');
    } else {
      console.log('Reason:', result.githubSecurity.reason);
    }
    
    console.log('\n📊 Readiness Scores:');
    console.log('Repo Readiness:', result.readinessScores.repo?.score || 'Not calculated');
    console.log('Team Readiness:', result.readinessScores.team?.score || 'Not calculated');
    console.log('Org Readiness:', result.readinessScores.org?.score || 'Not calculated');
    
    console.log('\n💡 Recommendations:');
    console.log(`Found ${result.recommendations.length} recommendations:`);
    result.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Timeframe: ${rec.timeframe}\n`);
    });
    
    console.log('\n📝 Generating ADR...');
    const adr = assessment.generateADR(result);
    
    // Save ADR to file
    const fs = require('fs');
    const adrPath = './self-assessment-github-adr.md';
    fs.writeFileSync(adrPath, adr);
    console.log(`✅ ADR saved to: ${adrPath}`);
    
    console.log('\n🎉 GitHub-enhanced self-analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during self-analysis:', error.message);
    if (error.message.includes('401')) {
      console.log('\n💡 Tip: Set GITHUB_TOKEN environment variable for full GitHub integration');
      console.log('   export GITHUB_TOKEN=your_token_here');
    }
  }
}

// Run the test
testSelfWithGitHub();
