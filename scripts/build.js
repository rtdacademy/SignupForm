const BuildManager = require('./BuildManager');

async function main() {
  const args = process.argv.slice(2);
  const options = {
    isSandbox: args.includes('--sandbox'),
    isSecondSite: args.includes('--second-site'),
    memorySize: 4096, // Starting with 4GB for large project
    maxRetries: 3,
    cleanOnly: args.includes('--clean-only'),
    isStart: args.includes('--start')
  };

  const builder = new BuildManager(options);
  
  if (!(await builder.prepare())) {
    process.exit(1);
  }

  if (options.cleanOnly) {
    console.log('Clean completed successfully');
    return;
  }

  if (!(await builder.execute())) {
    process.exit(1);
  }

  if (!options.isStart) {
    console.log('\nBuild completed successfully!');
  }
}

// Execute if running directly
if (require.main === module) {
  main().catch(error => {
    console.error('Operation failed:', error);
    process.exit(1);
  });
}