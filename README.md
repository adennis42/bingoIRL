# Bingo Host App

Flutter + Firebase application for hosting and tracking live bingo games. Hosts control the game flow (number calling, round management, winners), while players follow along on their devices.

## Current Status

- ✅ Firebase integration (Auth, Firestore) with working document models
- ✅ Host dashboard: create games, view hosted games, launch game view
- ✅ Host dashboard: delete previously hosted games (removes subcollections)
- ✅ Host game view: bingo grid, animated “last called” ball, number history
- ✅ Player game view: real-time last number + called numbers list
- ✅ Pattern preview (host & player) with custom descriptions
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
- Design + store custom winning patterns per host (UI + Firestore schema)
- Add analytics / logging instrumentation

## Useful References

- `lib/shared/widgets/bingo_ball.dart` – animated “last called” ball
- `lib/features/host/screens/host_dashboard_screen.dart` – host controls
- `lib/core/services/game_service.dart` – custom pattern + game deletion helpers
- `lib/features/player/screens/player_game_screen.dart` – player read-only view

## Next Focus: Mobile Notifications

Goal: Notify inactive mobile players whenever the host calls a new number.

### Proposed Plan
1. **Push Infrastructure**
   - Enable Firebase Cloud Messaging (FCM) in the Firebase project for Android/iOS.
   - Add `firebase_messaging` and `flutter_local_notifications` packages.

2. **App Registration**
   - Request notification permissions on mobile at startup.
   - Handle foreground/background message handlers.

3. **Triggering Notifications**
   - Create a Cloud Function listening to `games/{gameId}/calledNumbers` writes.
   - Cloud Function sends FCM notifications to players subscribed to that game topic.
   - Alternatively, the host app can send FCM via callable function.

4. **Client Handling**
   - Players subscribe to `game_{gameId}` topic when joining a game; unsubscribe on exit.
   - Display local notifications when a message arrives while app is backgrounded.
   - Update local state in-app when receiving the push (so the badge aligns with stream updates).

5. **Testing & Rollout**
   - Verify on Android/iOS with app in foreground, background, and terminated states.
   - Add environment toggles to disable notifications in development if needed.

Dependencies to add soon:
- `firebase_messaging`
- `flutter_local_notifications`
- `cloud_functions` (if using Cloud Functions trigger)

Feel free to run `flutter analyze` before committing to ensure code health:

```bash
flutter analyze
```

Happy hosting! 🎉
