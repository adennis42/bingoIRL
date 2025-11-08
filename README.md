# Bingo Host App

Flutter + Firebase application for hosting and tracking live bingo games. Hosts control the game flow (number calling, round management, winners), while players follow along on their devices.

## Current Status

- ✅ Firebase integration (Auth, Firestore) with working document models
- ✅ Host dashboard: create games, view hosted games, launch game view
- ✅ Host game view: bingo grid, animated “last called” ball, number history
- ✅ Player game view: real-time last number + called numbers list
- ✅ Traditional Bingo styling with column colors (B/I/N/G/O)
- ✅ Firestore composite index deployed (`hostId` + `createdAt`)
- ⚠️ Temporary workaround: hosted games list is sorted in-memory (see below)

## Project Structure

```
lib/
 ├─ core/                # Services, constants, theme
 ├─ features/
 │   ├─ auth/            # Login & registration
 │   ├─ host/            # Host dashboards & game controls
 │   └─ player/          # Player game view
 └─ shared/
     └─ widgets/         # Reusable UI (e.g., animated Bingo ball)
docs/
 ├─ FIRESTORE_INDEX_SETUP.md       # Index deployment notes
 └─ INDEX_BUILDING_WORKAROUND.md   # Details on temporary sorting workaround
```

## Requirements

- Flutter (latest stable) – verified with `flutter doctor`
- Firebase CLI (`firebase-tools`)
- Firebase project: `bingoirl-e6917`
  - Configure with `firebase use bingoirl-e6917`
  - Ensure `google-services.json` / `GoogleService-Info.plist` are present (already tracked)

## Running the App

```bash
# Install dependencies
flutter pub get

# (Optional) verify Firebase CLI project selection
firebase use bingoirl-e6917

# Run on desired platform
flutter run
```

## Firebase Setup Notes

- Firestore composite index required for hosted games list:
  - definition in `firestore.indexes.json`
  - already deployed (see `FIRESTORE_INDEX_SETUP.md`)
- Firestore rules: `firestore.rules` (deployed via `firebase deploy --only firestore:rules`)
- If converting the hosted games query back to Firestore sorting:
  - remove the in-memory `.sort` in `GameService.streamHostedGames`
  - re-enable `.orderBy('createdAt', descending: true)`

## Temporary Workaround

- The hosted games list currently removes `orderBy` and sorts in-memory
  - This was required while the index was building (see `INDEX_BUILDING_WORKAROUND.md`)
  - Once the index is confirmed “Enabled” you may revert to the Firestore `orderBy`

## Design Highlights

- Animated bingo ball (`BingoBall`) rotates the newest number into view
- Host “Call Numbers” grid darkens + shrinks numbers that have already been called
- Player view shows a simplified layout: animated last ball + color-coded chips
- Traditional Bingo column colors:
  - B = Blue, I = Light Gray, N = Green, G = Amber, O = Red

## Next Steps / TODO

- Add tests (unit + widget)
- Implement additional host controls (undo confirmation, round summary)
- Persist player anonymity display names with optional input
- Add analytics / logging instrumentation

## Useful References

- `lib/shared/widgets/bingo_ball.dart` – animated “last called” ball
- `lib/features/host/screens/host_game_screen.dart` – host controls
- `lib/features/player/screens/player_game_screen.dart` – player read-only view
- `docs/FIRESTORE_INDEX_SETUP.md` – index deployment steps
- `docs/INDEX_BUILDING_WORKAROUND.md` – current workaround documentation

Feel free to run `flutter analyze` before committing to ensure code health:

```bash
flutter analyze
```

Happy hosting! 🎉
