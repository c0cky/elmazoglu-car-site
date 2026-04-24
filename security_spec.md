# Security Specification - AutoVibe

## 1. Data Invariants
- A car listing must have exactly one owner (UID).
- A user cannot change the `ownerUid` of a car.
- A swap offer must involve two unique cars.
- Only the receiver of a swap offer can accept/reject it.
- Messages must belong to a chat.
- Access to messages is granted only to participants of the parent chat.
- User profiles can only be created by the owner.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: List a car with someone else's `ownerUid`.
2. **Privilege Escalation**: Update own profile to set `role: 'admin'`.
3. **Ghost Field Injection**: Add `isVerified: true` to a car document.
4. **State Shortcutting**: Directly set `status: 'sold'` on someone else's car.
5. **Resource Poisoning**: Use a 2KB string as a `carId`.
6. **Relational Bypass**: Create a swap offer for a non-existent car.
7. **Unauthorized Read**: `get()` a private user document of another user.
8. **Shadow Message**: `create` a message in a chat where the sender is not a participant.
9. **Mutation Lock Break**: Change the `createdAt` timestamp of an existing listing.
10. **Admin Bypass**: Attempt to delete an admin record.
11. **Query Scraping**: `list` all users without identifying filters.
12. **PII Leak**: Access `email` from `public_users` collection (if it were present, we avoid it).

## 3. Test Runner (Mock Logic)
Verification will be done using the security rules linter and by following the Eight Pillars during construction.
