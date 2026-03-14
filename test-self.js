#!/usr/bin/env node

const AIEnablementAssessment = require('./dist/index.js');

async function testSelf() {
  console.log('🔍 Running AI Enablement Assessment on our own repository...\n');
  
  try {
    // Test against current directory
    const assessment = new AIEnablementAssessment({
      repoPath: process.cwd(), // Current repo
      // Note: We can test without GitHub URL for basic analysis
    });

    console.log('📊 Starting analysis...');
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
    }
    
    console.log('\n🛡️ GitHub Security:');
    console.log('Available:', result.githubSecurity.available);
    if (!result.githubSecurity.available) {
      console.log('Reason:', result.githubSecurity.reason);
    }
    
    console.log('\n📊 Readiness Scores:');
    console.log('Repo Readiness:', result.readinessScores.repo || 'Not calculated');
    console.log('Team Readiness:', result.readinessScores.team || 'Not calculated');
    console.log('Org Readiness:', result.readinessScores.org || 'Not calculated');
    
    console.log('\n🎯 Maturity Layers:');
    Object.entries(result.maturityLayers).forEach(([layer, assessment]) => {
      console.log(`${layer}: ${assessment.level}/5 - ${assessment.status}`);
    });
    
    console.log('\n💡 Recommendations:');
    console.log(`Found ${result.recommendations.length} recommendations:`);
    result.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Timeframe: ${rec.timeframe}\n`);
    });
    
    if (result.recommendations.length > 5) {
      console.log(`... and ${result.recommendations.length - 5} more recommendations`);
    }
    
    console.log('\n📝 Generating ADR...');
    const adr = assessment.generateADR(result);
    
    // Save ADR to file
    const fs = require('fs');
    const adrPath = './self-assessment-adr.md';
    fs.writeFileSync(adrPath, adr);
    console.log(`✅ ADR saved to: ${adrPath}`);
    
    console.log('\n🎉 Self-analysis complete!');
    console.log('📁 Check the generated ADR file for detailed recommendations.');
    
  } catch (error) {
    console.error('❌ Error during self-analysis:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testSelf();
