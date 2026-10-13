# QManager iOS — Security & App Store Submission

## What is already done

### Hard App Store requirements

| Requirement | Status |
| --- | --- |
| `PrivacyInfo.xcprivacy` privacy manifest | Present, validated, ships inside the bundle |
| Required-reason API declarations | `UserDefaults` (CA92.1), file timestamp (C617.1) |
| Export compliance | `ITSAppUsesNonExemptEncryption = NO` (HTTPS only, so exempt) |
| App icon (1024, light/dark/tinted) | In `Assets.car` |
| Deployment target | **iOS 18.0** — was 26.5, which almost no device could install |
| Display name | `QManager` |
| Archive | Builds and code-signs for `arm64`, dSYM emitted |

### Security posture

| Area | Measure |
| --- | --- |
| Transport | ATS fully strict in Release: `NSAllowsArbitraryLoads = false`, **no exception domains**. The localhost cleartext exception lives in `Config/Info-Debug.plist` and cannot reach production. |
| Server address | Release accepts `https://` only. Debug additionally allows `http://localhost`. A warning is shown whenever the configured host is not the official one, because credentials go wherever the app points. |
| Credentials | Access and refresh tokens in the Keychain as `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` — never in `UserDefaults`, never in a backup that can be restored to another device. |
| Session | 15-minute access tokens with transparent refresh; concurrent 401s share one refresh so the rotating refresh token cannot invalidate itself. A rejected refresh drops straight to the login screen. |
| Offline cache | Written with `FileProtectionType.completeUnlessOpen`, excluded from backups, and **wiped on sign-out**. |
| App switcher | `PrivacyShield` covers the window on `.inactive`, before iOS takes the snapshot — otherwise customer names and outstanding balances end up in a screenshot on disk. |
| Device gate | Optional Face ID / Touch ID re-entry lock, re-armed on backgrounding. |
| Error output | Raw decoding errors (which name fields and can echo values) are `#if DEBUG` only. |
| Third parties | **None.** No analytics, no SDKs, no tracking domains. Only the company's own API is contacted. |
| Permissions | UI is gated on the same permission strings the API enforces, so users are not shown actions that would 403. |

## Before you upload

These need a human with the developer account — I cannot do them:

1. **Distribution signing.** The local archive signed with an *Apple Development*
   profile, so its entitlements carry `get-task-allow: true`. Xcode Organizer →
   *Distribute App* → *App Store Connect* re-signs with the distribution
   certificate and clears that flag. If the account has no distribution
   certificate yet, create one first.

2. **App Store Connect record.** Bundle ID `com.octonics.QManager`, name,
   subtitle, category (Business), and the **App Privacy questionnaire**. The
   privacy manifest does not fill that in for you — answer it consistently with
   `PrivacyInfo.xcprivacy`: contact info and financial info collected, linked to
   the user, **not** used for tracking.

3. **Screenshots.** Required for 6.9" and 6.5" iPhone at minimum. The simulator
   can produce them: `xcrun simctl io booted screenshot`.

4. **Demo account for review.** App Review cannot get past the login screen
   without one. Put working credentials in *App Review Information* and note
   that the app talks to `https://qmanager2.octolabs.cloud/api`. **Reviews are
   routinely rejected for this**, under Guideline 2.1.

5. **Support URL and privacy policy URL.** Both are mandatory. The privacy
   policy must describe what the API stores.

6. **Bump the build number** for every upload (`CURRENT_PROJECT_VERSION`);
   App Store Connect rejects a duplicate.

## Worth considering

- **Certificate pinning** was deliberately *not* added. The host uses
  Let's Encrypt, which rotates roughly every 90 days, so pinning a leaf
  certificate would brick the app on renewal. If you want it, pin the
  intermediate CA's public key and keep a backup pin.
- **Locking the server field** to the production host would remove the
  credential-phishing vector entirely, at the cost of staging flexibility. It is
  a one-line change in `ServerSettingsView.save()`.
- **Rotate the VPS root password.** `run_ssh.exp` has it in plaintext, committed
  to git history. Unrelated to the app, but it is the most serious issue open
  in this repository.
