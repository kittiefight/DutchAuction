# Audit
## Critical

## Non-Critical

## Notes
- `confirmSocial`: Owner and Admins are allowed to participate in the Social campaigns
- `adminRemoveBatch`: After admin removes a participant, a user is able to use `confirmSocial`, although `claimBonus` would prevent access to the gained Tokens. Basic DDOS on toal bonus Tokens given is achievable.
