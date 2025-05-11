# Firebase Emulator Setup

## Development Options

You now have two development modes:

### 1. Development with Production Services

Run your app against the real Firebase services:

```bash
# Main site with production services
npm run start:main

# Second site with production services
npm run start:second
```

### 2. Development with Local Emulators

Run your app against local Firebase emulators:

```bash
# Start the Firebase emulators in one terminal
npm run start:backend

# In another terminal, start your app with emulator connections
npm run start:main:emulators

# Or for second site
npm run start:second:emulators
```

## Switching Between Modes

You can switch between using emulators and production by:

1. Editing the `.env.development` file and changing:
   ```
   REACT_APP_USE_EMULATORS=true  # Use emulators
   REACT_APP_USE_EMULATORS=false # Use production
   ```

2. Using the appropriate npm script:
   - With `:emulators` suffix to use emulators
   - Without suffix to use production

## Importing Data to Emulators

To import real data to your emulator:

```bash
# Fetch from production and set to emulator
firebase database:get /path/to/data --project=rtd-academy | firebase database:set /path/to/data --database-url=http://localhost:9000?ns=rtd-academy
```

Or create a JSON file and import it:

```bash
# Import from a JSON file
curl -X PUT -d @your-data.json http://localhost:9000/path/to/data.json?ns=rtd-academy
```

## Emulator UI

- Main Emulator UI: http://127.0.0.1:4000/
- Database Emulator: http://127.0.0.1:9000/?ns=rtd-academy
- Functions Emulator: http://127.0.0.1:5001/